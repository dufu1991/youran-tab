import { afterAll, beforeEach, describe, expect, test } from 'bun:test'
import { get } from 'svelte/store'
import { loadFromStorage, persistedWritable } from './persisted.js'

// 用最小实现模拟浏览器的 localStorage 与 storage 事件；测试环境没有扩展存储，走 localStorage
const createStorage = () => {
  const data = new Map()
  let writes = 0
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => {
      writes += 1
      data.set(key, String(value))
    },
    removeItem: (key) => data.delete(key),
    get writes() {
      return writes
    },
  }
}

const dispatchStorage = (key, newValue) => {
  const event = new Event('storage')
  Object.assign(event, { key, newValue })
  window.dispatchEvent(event)
}

// 测试结束后还原全局对象，避免影响同一进程里的其他测试文件
const originalGlobals = { localStorage: globalThis.localStorage, window: globalThis.window }

// storage 事件监听在第一次订阅时注册到当时的 window 上，所以 window 只创建一次
globalThis.window = new EventTarget()

beforeEach(() => {
  globalThis.localStorage = createStorage()
})

afterAll(() => {
  globalThis.localStorage = originalGlobals.localStorage
  globalThis.window = originalGlobals.window
})

describe('loadFromStorage', () => {
  test('缺失或损坏时返回兜底值', () => {
    expect(loadFromStorage('missing', 1)).toBe(1)
    localStorage.setItem('broken', '{')
    expect(loadFromStorage('broken', 2)).toBe(2)
    localStorage.setItem('ok', '{"a":1}')
    expect(loadFromStorage('ok', null)).toEqual({ a: 1 })
  })
})

describe('persistedWritable', () => {
  test('值变化时写入，内容相同时不重复写入', () => {
    const store = persistedWritable('k', { a: 1 })
    expect(localStorage.getItem('k')).toBe('{"a":1}')
    const writes = localStorage.writes
    store.set({ a: 1 })
    expect(localStorage.writes).toBe(writes)
    store.set({ a: 2 })
    expect(localStorage.getItem('k')).toBe('{"a":2}')
  })

  test('接收其他页面对同一个键的修改并规范化', () => {
    const store = persistedWritable('k', { a: 1, b: 1 }, (value) => ({ a: 0, b: 0, ...value }))
    dispatchStorage('k', '{"a":5}')
    expect(get(store)).toEqual({ a: 5, b: 0 })
  })

  test('忽略其他键和清除事件', () => {
    const store = persistedWritable('k', 1)
    dispatchStorage('other', '9')
    dispatchStorage('k', null)
    expect(get(store)).toBe(1)
  })
})
