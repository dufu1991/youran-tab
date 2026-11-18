import { clearAutoIcons } from './autoIcon.js'

const DB_NAME = 'newtab_icons'
const STORE_NAME = 'icons'

// 缓存永久有效：缓存 key 是由站点 URL 和图标源决定的远程地址，
// 修改站点或更换图标源后 key 变化，自然会重新获取并覆盖缓存。

// 内存缓存：url -> objectURL
const memCache = new Map()

// 数据库连接只打开一次，之后的读写复用同一个连接；打开失败时下次再重试
let dbPromise = null
const openDB = () => {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  dbPromise.catch(() => {
    dbPromise = null
  })
  return dbPromise
}

// 写入 IndexedDB
const saveToDB = async (key, data) => {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(data, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => resolve()
  })
}

/**
 * 获取缓存的图标 URL。
 * 有缓存则返回 objectURL，无缓存则返回 null。
 */
export const getCachedIconUrl = (url) => {
  return memCache.get(url) || null
}

/**
 * 获取远程图标并缓存到 IndexedDB 和内存。
 * 返回 objectURL，失败则返回 null。
 */
export const fetchAndCacheIcon = async (url) => {
  if (memCache.has(url)) return memCache.get(url)
  let res
  try {
    res = await fetch(url)
  } catch {
    // CORS 或网络错误，静默跳过缓存，图片仍可通过 <img> 正常显示
    return null
  }
  if (!res.ok) return null
  const blob = await res.blob()
  if (!blob.size || blob.size < 50) return null // 跳过空白占位图
  const objectUrl = URL.createObjectURL(blob)
  memCache.set(url, objectUrl)
  await saveToDB(url, { blob })
  return objectUrl
}

/**
 * 初始化：加载所有已缓存的图标到内存。
 * 返回的 Promise 在全部缓存加载进内存后才 resolve。
 */
export const initIconCache = async () => {
  const db = await openDB()
  // 一次性批量读出全部键和值，比逐条游标遍历快得多，缩短首屏等待
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const keysReq = store.getAllKeys()
    const valuesReq = store.getAll()
    tx.oncomplete = () => {
      keysReq.result.forEach((key, index) => {
        const val = valuesReq.result[index]
        if (val && val.blob) memCache.set(key, URL.createObjectURL(val.blob))
      })
      resolve()
    }
    tx.onerror = () => resolve()
  })
}

/**
 * 清空图标缓存：内存和 IndexedDB 全部删除。
 * 调用方负责在清空后刷新页面，让图标重新下载。
 */
export const clearIconCache = async () => {
  memCache.clear()
  await clearAutoIcons()
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => resolve()
  })
}
