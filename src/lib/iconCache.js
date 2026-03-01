const DB_NAME = 'newtab_icons'
const STORE_NAME = 'icons'
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 天过期

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

// 删除过期条目
async function cleanExpired() {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  const req = store.openCursor()
  const now = Date.now()
  req.onsuccess = () => {
    const cursor = req.result
    if (!cursor) return
    const val = cursor.value
    if (val && val.ts && now - val.ts > CACHE_TTL) {
      cursor.delete()
    }
    cursor.continue()
  }
}

/**
 * 获取缓存的图标 URL。
 * 有缓存则返回 objectURL，无缓存则返回 null。
 */
export function getCachedIconUrl(url) {
  return memCache.get(url) || null
}

/**
 * 尝试从缓存加载图标，如果缓存中有且未过期则返回 objectURL，
 * 否则返回 null（调用方应使用原始 URL 并在加载成功后调用 cacheIcon）。
 */
export async function loadCachedIcon(url) {
  if (memCache.has(url)) return memCache.get(url)
  const data = await getFromDB(url)
  if (data && data.blob && Date.now() - data.ts < CACHE_TTL) {
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
  await saveToDB(url, { blob, ts: Date.now() })
  return objectUrl
}

/**
 * 初始化：加载所有已缓存的图标到内存，清理过期条目。
 */
export async function initIconCache() {
  cleanExpired()
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  const req = store.openCursor()
  const now = Date.now()
  req.onsuccess = () => {
    const cursor = req.result
    if (!cursor) return
    const key = cursor.key
    const val = cursor.value
    if (val && val.blob && now - val.ts < CACHE_TTL) {
      memCache.set(key, URL.createObjectURL(val.blob))
    }
    cursor.continue()
  }
}
