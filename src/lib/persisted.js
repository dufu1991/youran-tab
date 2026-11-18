import { writable } from 'svelte/store'
import { getItem, hasItem, onExternalChange, setItem } from './storage.js'

// 读取存储中的值，不存在时返回 fallback
export const loadFromStorage = (key, fallback) => (hasItem(key) ? getItem(key) : fallback)

// 持久化 store：值变化时写入存储（内容不变时跳过，避免多个新标签页之间互相触发），
// 并接收其他新标签页对同一个键的修改，避免旧页面之后保存时把新设置覆盖回去。
// revive 用来规范化其他页面写入的值，例如补齐默认字段
export const persistedWritable = (key, initial, revive = (value) => value) => {
  const store = writable(initial)
  store.subscribe((value) => {
    setItem(key, value)
  })
  onExternalChange(key, (value) => {
    if (value !== undefined) store.set(revive(value))
  })
  return store
}
