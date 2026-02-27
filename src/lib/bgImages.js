const DB_NAME = 'newtab_bg'
const STORE_NAME = 'images'
const KEY = 'list'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function getImages() {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(KEY)
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => resolve([])
  })
}

export async function saveImages(blobs) {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(blobs, KEY)
    tx.oncomplete = () => resolve()
  })
}

export async function clearImages() {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).clear()
    tx.oncomplete = () => resolve()
  })
}
