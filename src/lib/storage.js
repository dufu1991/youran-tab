// 统一的键值存储：扩展环境使用扩展存储（storage.local），开发环境和测试中没有扩展存储时使用 localStorage。
//
// 扩展存储是异步的，而各个 store 需要在创建时同步读到初始值，所以启动时先用 initStorage
// 把全部数据读进内存缓存，之后读取都走缓存，写入同时更新缓存并异步写入扩展存储。
// 0.5.0 之前的数据都在 localStorage 里，initStorage 第一次运行时会把它们搬到扩展存储，
// 搬迁完成后写入版本标记，之后不再重复搬迁；localStorage 中的旧数据原样保留，作为备份。

export const LEGACY_KEY_PREFIX = 'newtab_'
export const STORAGE_VERSION_KEY = 'youran_storage_version'
export const STORAGE_VERSION = 1

// 0.5.0 开发期间的文件夹图标迁移标记直接写入了字符串，不是 JSON，需要原样保留
const RAW_STRING_KEYS = ['newtab_folder_icon_migration']

const extensionApi = globalThis.browser?.storage?.local ? globalThis.browser : globalThis.chrome?.storage?.local ? globalThis.chrome : null

// 扩展存储的内存缓存，未启用扩展存储时为 null
let cache = null
// 本页面发出、尚未收到 onChanged 回执的写入次数，回执到达前忽略该键的变化，避免拖动滑块时值被旧回执拉回
const pendingWrites = new Map()
const listeners = new Map()

// 解析 localStorage 中的文本：内容损坏时视为不存在，与旧版读取失败时使用默认值的表现一致
const parseStoredText = (key, raw) => {
  if (raw === null) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    return RAW_STRING_KEYS.includes(key) ? raw : undefined
  }
}

// 按键名排序后序列化，用于比较内容是否相同（扩展存储返回的对象不保证键的顺序）
const stableStringify = (value) => JSON.stringify(value, (_, item) => (
  item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map((key) => [key, item[key]]))
    : item
))

const notify = (key, value) => {
  listeners.get(key)?.forEach((listener) => listener(value))
}

// 读取 localStorage 中需要搬迁的旧数据，内容损坏的键跳过
export const readLegacyData = (entries) => {
  const data = {}
  for (const [key, raw] of entries) {
    if (!key.startsWith(LEGACY_KEY_PREFIX)) continue
    const value = parseStoredText(key, raw)
    if (value !== undefined) data[key] = value
  }
  return data
}

// 计算需要写入扩展存储的搬迁数据：已经搬迁过时返回空对象；扩展存储里已有的键不覆盖
export const buildMigration = (stored, legacy) => {
  if (stored[STORAGE_VERSION_KEY]) return {}
  const updates = {}
  for (const [key, value] of Object.entries(legacy)) {
    if (!(key in stored)) updates[key] = value
  }
  updates[STORAGE_VERSION_KEY] = STORAGE_VERSION
  return updates
}

const readLocalStorageEntries = () => Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)])

const loadExtensionData = async (area) => {
  const stored = await area.get(null)
  const updates = buildMigration(stored, readLegacyData(readLocalStorageEntries()))
  if (Object.keys(updates).length > 0) await area.set(updates)
  return { ...stored, ...updates }
}

const handleExtensionChange = (changes, areaName) => {
  if (areaName !== 'local') return
  for (const [key, { newValue }] of Object.entries(changes)) {
    const pending = pendingWrites.get(key) || 0
    if (pending > 0) {
      pendingWrites.set(key, pending - 1)
      continue
    }
    if (newValue === undefined) {
      if (!cache.has(key)) continue
      cache.delete(key)
    } else {
      if (cache.has(key) && stableStringify(cache.get(key)) === stableStringify(newValue)) continue
      cache.set(key, newValue)
    }
    notify(key, newValue)
  }
}

// 启动时调用一次，完成前不要读写存储。扩展存储不可用或搬迁失败（例如超出配额）时，
// 本次继续使用 localStorage，旧数据不受影响，下次打开时会重新尝试搬迁
export const initStorage = async () => {
  if (!extensionApi || cache) return
  const area = extensionApi.storage.local
  const load = () => loadExtensionData(area)
  const data = await (navigator.locks ? navigator.locks.request('youran-storage-init', load) : load()).catch((error) => {
    console.error('[youran-tab] 迁移到扩展存储失败，本次继续使用 localStorage', error)
    return null
  })
  if (!data) return
  cache = new Map(Object.entries(data))
  extensionApi.storage.onChanged.addListener(handleExtensionChange)
}

export const usesExtensionStorage = () => cache !== null

// 读取值；不存在时返回 undefined
export const getItem = (key) => (cache ? cache.get(key) : parseStoredText(key, localStorage.getItem(key)))

export const hasItem = (key) => (cache ? cache.has(key) : getItem(key) !== undefined)

export const storageKeys = () => (cache ? [...cache.keys()] : Object.keys(localStorage))

// 写入值；内容没有变化时跳过，避免多个新标签页之间互相触发
export const setItem = async (key, value) => {
  const text = JSON.stringify(value)
  if (!cache) {
    if (localStorage.getItem(key) !== text) localStorage.setItem(key, text)
    return
  }
  const next = JSON.parse(text)
  if (cache.has(key) && stableStringify(cache.get(key)) === stableStringify(next)) return
  cache.set(key, next)
  pendingWrites.set(key, (pendingWrites.get(key) || 0) + 1)
  await extensionApi.storage.local.set({ [key]: next })
}

export const removeItem = async (key) => {
  if (!cache) {
    localStorage.removeItem(key)
    return
  }
  if (!cache.has(key)) return
  cache.delete(key)
  pendingWrites.set(key, (pendingWrites.get(key) || 0) + 1)
  await extensionApi.storage.local.remove(key)
}

const handleLocalStorageEvent = (event) => {
  if (cache || event.key === null || !listeners.has(event.key)) return
  notify(event.key, parseStoredText(event.key, event.newValue))
}

// 监听其他新标签页（或后台）对某个键的修改；键被删除时回调收到 undefined
export const onExternalChange = (key, listener) => {
  if (listeners.size === 0) window.addEventListener('storage', handleLocalStorageEvent)
  if (!listeners.has(key)) listeners.set(key, new Set())
  listeners.get(key).add(listener)
}
