const DB_NAME = 'newtab_icons'
const STORE_NAME = 'icons'

// 缓存永久有效：缓存 key 是由站点 URL 和图标源决定的远程地址，
// 修改站点或更换图标源后 key 变化，自然会重新获取并覆盖缓存。

// 内存缓存：url -> objectURL
const memCache = new Map()

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// 从 IndexedDB 读取缓存
async function getFromDB(key) {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(key)
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => resolve(null)
  })
}

// 写入 IndexedDB
async function saveToDB(key, data) {
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
export function getCachedIconUrl(url) {
  return memCache.get(url) || null
}

/**
 * 尝试从缓存加载图标，缓存中有则返回 objectURL，
 * 否则返回 null（调用方应使用原始 URL 并在加载成功后调用 fetchAndCacheIcon）。
 */
export async function loadCachedIcon(url) {
  if (memCache.has(url)) return memCache.get(url)
  const data = await getFromDB(url)
  if (data && data.blob) {
    const objectUrl = URL.createObjectURL(data.blob)
    memCache.set(url, objectUrl)
    return objectUrl
  }
  return null
}

/**
 * 获取远程图标并缓存到 IndexedDB 和内存。
 * 返回 objectURL，失败则返回 null。
 */
export async function fetchAndCacheIcon(url) {
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
export async function initIconCache() {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.openCursor()
    req.onsuccess = () => {
      const cursor = req.result
      if (!cursor) return
      const val = cursor.value
      if (val && val.blob) {
        memCache.set(cursor.key, URL.createObjectURL(val.blob))
      }
      cursor.continue()
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => resolve()
  })
}

/**
 * 清空图标缓存：内存和 IndexedDB 全部删除。
 * 调用方负责在清空后刷新页面，让图标重新下载。
 */
export async function clearIconCache() {
  memCache.clear()
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => resolve()
  })
}
