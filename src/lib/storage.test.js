import { afterAll, afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { STORAGE_VERSION, STORAGE_VERSION_KEY, buildMigration, readLegacyData } from './storage.js'

// 模拟扩展存储：与 Chrome 一样，写入后异步触发 onChanged（写入方自己也会收到），
// 内容没有变化时不触发，返回的对象键名按字母排序
const sortKeys = (value) => JSON.parse(JSON.stringify(value, (_, item) => (
  item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map((key) => [key, item[key]]))
    : item
)))

const createFakeExtension = (initial = {}, { failSet = false } = {}) => {
  const data = new Map(Object.entries(initial).map(([key, value]) => [key, sortKeys(value)]))
  const listeners = []
  const calls = { set: 0 }

  const applyChanges = (entries) => {
    const changes = {}
    for (const [key, value] of entries) {
      const before = data.get(key)
      if (JSON.stringify(before) === JSON.stringify(value)) continue
      if (value === undefined) data.delete(key)
      else data.set(key, value)
      changes[key] = { oldValue: before, newValue: value }
    }
    if (Object.keys(changes).length === 0) return Promise.resolve()
    return new Promise((resolve) => setTimeout(() => {
      listeners.forEach((listener) => listener(changes, 'local'))
      resolve()
    }, 0))
  }

  const local = {
    get: async () => Object.fromEntries([...data].map(([key, value]) => [key, sortKeys(value)])),
    set: async (items) => {
      calls.set += 1
      if (failSet) throw new Error('QUOTA_BYTES quota exceeded')
      await applyChanges(Object.entries(items).map(([key, value]) => [key, sortKeys(value)]))
    },
    remove: async (key) => applyChanges([[key, undefined]]),
  }

  return {
    api: { storage: { local, onChanged: { addListener: (listener) => listeners.push(listener) } } },
    data,
    calls,
    // 模拟其他新标签页或后台写入
    externalSet: (key, value) => applyChanges([[key, sortKeys(value)]]),
    externalRemove: (key) => applyChanges([[key, undefined]]),
  }
}

const createLocalStorage = (initial = {}) => {
  const data = new Map(Object.entries(initial))
  const storage = {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  }
  // Object.keys(localStorage) 列出所有键
  return new Proxy(storage, {
    ownKeys: () => [...data.keys()],
    getOwnPropertyDescriptor: (_, key) => (data.has(key) ? { enumerable: true, configurable: true, value: data.get(key) } : undefined),
  })
}

const originalGlobals = { chrome: globalThis.chrome, localStorage: globalThis.localStorage, window: globalThis.window }
let moduleIndex = 0

// 每个用例加载一份全新的存储模块，模块内部的缓存互不影响
const loadStorage = async (fake, legacy = {}) => {
  globalThis.chrome = fake?.api
  globalThis.localStorage = createLocalStorage(legacy)
  moduleIndex += 1
  const storage = await import(`./storage.js?case=${moduleIndex}`)
  await storage.initStorage()
  return storage
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 5))

beforeEach(() => {
  globalThis.window = new EventTarget()
})

afterEach(() => {
  globalThis.chrome = originalGlobals.chrome
})

afterAll(() => {
  globalThis.localStorage = originalGlobals.localStorage
  globalThis.window = originalGlobals.window
})

describe('readLegacyData', () => {
  test('只读取 newtab_ 开头的键，解析 JSON 并跳过损坏的内容', () => {
    expect(readLegacyData([
      ['newtab_theme', '"glass"'],
      ['newtab_sites', '[{"id":"1"}]'],
      ['newtab_broken', '{'],
      ['other', '1'],
    ])).toEqual({ newtab_theme: 'glass', newtab_sites: [{ id: '1' }] })
  })

  test('0.5.0 开发期间直接写入的文件夹迁移标记原样保留', () => {
    expect(readLegacyData([['newtab_folder_icon_migration', '0.5.0-grid']])).toEqual({ newtab_folder_icon_migration: '0.5.0-grid' })
  })
})

describe('buildMigration', () => {
  test('首次搬迁时写入旧数据和版本标记', () => {
    expect(buildMigration({}, { newtab_theme: 'glass' })).toEqual({ newtab_theme: 'glass', [STORAGE_VERSION_KEY]: STORAGE_VERSION })
  })

  test('扩展存储中已有的键不覆盖', () => {
    expect(buildMigration({ newtab_theme: 'bento' }, { newtab_theme: 'glass', newtab_mode: 'dark' }))
      .toEqual({ newtab_mode: 'dark', [STORAGE_VERSION_KEY]: STORAGE_VERSION })
  })

  test('已经搬迁过时不再写入', () => {
    expect(buildMigration({ [STORAGE_VERSION_KEY]: 1 }, { newtab_theme: 'glass' })).toEqual({})
  })
})

describe('initStorage', () => {
  test('首次运行时把 localStorage 旧数据搬到扩展存储，旧数据保留作为备份', async () => {
    const fake = createFakeExtension({ youran_pending_sites: [] })
    const legacy = {
      newtab_sites: JSON.stringify([{ id: '1', name: 'GitHub', url: 'https://github.com' }]),
      newtab_theme: '"glass"',
      newtab_folder_icon_migration: '0.5.0-grid',
      newtab_broken: '{',
    }
    const storage = await loadStorage(fake, legacy)

    expect(storage.usesExtensionStorage()).toBe(true)
    expect(storage.getItem('newtab_sites')).toEqual([{ id: '1', name: 'GitHub', url: 'https://github.com' }])
    expect(storage.getItem('newtab_theme')).toBe('glass')
    expect(storage.getItem('newtab_folder_icon_migration')).toBe('0.5.0-grid')
    expect(storage.hasItem('newtab_broken')).toBe(false)
    expect(fake.data.get(STORAGE_VERSION_KEY)).toBe(STORAGE_VERSION)
    expect(fake.data.get('newtab_theme')).toBe('glass')
    expect(localStorage.getItem('newtab_theme')).toBe('"glass"')
  })

  test('全新安装没有旧数据时只写入版本标记', async () => {
    const fake = createFakeExtension()
    const storage = await loadStorage(fake)
    expect(storage.storageKeys()).toEqual([STORAGE_VERSION_KEY])
  })

  test('已经搬迁过时以扩展存储为准，不再读取 localStorage', async () => {
    const fake = createFakeExtension({ [STORAGE_VERSION_KEY]: 1, newtab_theme: 'bento' })
    const storage = await loadStorage(fake, { newtab_theme: '"glass"', newtab_mode: '"dark"' })
    expect(storage.getItem('newtab_theme')).toBe('bento')
    expect(storage.hasItem('newtab_mode')).toBe(false)
    expect(fake.calls.set).toBe(0)
  })

  test('写入扩展存储失败时本次继续使用 localStorage，下次重新搬迁', async () => {
    const fake = createFakeExtension({}, { failSet: true })
    const originalError = console.error
    console.error = () => {}
    const storage = await loadStorage(fake, { newtab_theme: '"glass"' })
    console.error = originalError

    expect(storage.usesExtensionStorage()).toBe(false)
    expect(storage.getItem('newtab_theme')).toBe('glass')
    expect(fake.data.has(STORAGE_VERSION_KEY)).toBe(false)
  })

  test('没有扩展存储时使用 localStorage', async () => {
    const storage = await loadStorage(null, { newtab_theme: '"glass"' })
    expect(storage.usesExtensionStorage()).toBe(false)
    await storage.setItem('newtab_mode', 'dark')
    expect(localStorage.getItem('newtab_mode')).toBe('"dark"')
  })
})

describe('扩展存储读写', () => {
  test('连续写入时，自己的回执不会把值拉回旧值', async () => {
    const fake = createFakeExtension({ [STORAGE_VERSION_KEY]: 1 })
    const storage = await loadStorage(fake)
    const received = []
    storage.onExternalChange('newtab_default', (value) => received.push(value))

    storage.setItem('newtab_default', { radius: 10, cols: 4 })
    storage.setItem('newtab_default', { radius: 12, cols: 4 })
    await flush()

    expect(received).toEqual([])
    expect(storage.getItem('newtab_default')).toEqual({ radius: 12, cols: 4 })
    expect(fake.data.get('newtab_default')).toEqual({ cols: 4, radius: 12 })
  })

  test('内容相同时不重复写入', async () => {
    const fake = createFakeExtension({ [STORAGE_VERSION_KEY]: 1, newtab_default: { cols: 4, radius: 10 } })
    const storage = await loadStorage(fake)
    await storage.setItem('newtab_default', { radius: 10, cols: 4 })
    expect(fake.calls.set).toBe(0)
  })

  test('其他页面的修改和删除会通知监听者', async () => {
    const fake = createFakeExtension({ [STORAGE_VERSION_KEY]: 1, newtab_theme: 'glass' })
    const storage = await loadStorage(fake)
    const received = []
    storage.onExternalChange('newtab_theme', (value) => received.push(value))

    await fake.externalSet('newtab_theme', 'pixel')
    expect(storage.getItem('newtab_theme')).toBe('pixel')
    await fake.externalRemove('newtab_theme')
    expect(storage.hasItem('newtab_theme')).toBe(false)
    expect(received).toEqual(['pixel', undefined])
  })

  test('删除后刷新前可以等待写入完成', async () => {
    const fake = createFakeExtension({ [STORAGE_VERSION_KEY]: 1, newtab_theme: 'glass' })
    const storage = await loadStorage(fake)
    await storage.removeItem('newtab_theme')
    expect(fake.data.has('newtab_theme')).toBe(false)
  })
})
