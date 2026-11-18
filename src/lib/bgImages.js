const DB_NAME = 'newtab_bg'
const STORE_NAME = 'images'
const KEY = 'list'

// 数据库连接只打开一次，之后的读写复用同一个连接；打开失败时下次再重试
let dbPromise = null
const openDB = () => {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  dbPromise.catch(() => {
    dbPromise = null
  })
  return dbPromise
}

export const getImages = async () => {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(KEY)
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => resolve([])
  })
}

export const saveImages = async (blobs) => {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(blobs, KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => resolve()
  })
}
