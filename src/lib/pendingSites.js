import { flattenSites, isFolderItem } from './folders.js'

// 与 public/background.js 中的键名和网址规范化逻辑保持一致
export const PENDING_SITES_KEY = 'youran_pending_sites'
export const KNOWN_SITE_URLS_KEY = 'youran_known_site_urls'
export const SITE_FOLDERS_KEY = 'youran_site_folders'

export const normalizeSiteUrl = (url) => url.replace(/\/+$/, '').toLowerCase()

// 站点树中所有网站（含文件夹内）的规范化网址，供后台判断网页是否已加入
export const collectSiteUrls = (items) => [...new Set(flattenSites(items).map((site) => normalizeSiteUrl(site.url)))]

// 文件夹列表，供后台生成「加入到某个文件夹」的右键子菜单
export const collectSiteFolders = (items) => items.filter(isFolderItem).map((folder) => ({ id: folder.id, name: folder.name }))

// 把网页右键加入的网站合并进站点树：指定了文件夹且文件夹仍存在时放到该文件夹末尾，否则放到主列表末尾；
// 已存在的网址跳过，没有新增时返回原数组
export const mergePendingSites = (items, pending) => {
  const knownUrls = new Set(collectSiteUrls(items))
  const folderIds = new Set(items.filter(isFolderItem).map((folder) => folder.id))
  const toRoot = []
  const toFolders = new Map()
  for (const item of pending) {
    if (!/^https?:\/\//.test(item.url)) continue
    const normalizedUrl = normalizeSiteUrl(item.url)
    if (knownUrls.has(normalizedUrl)) continue
    knownUrls.add(normalizedUrl)
    const site = { id: crypto.randomUUID(), name: item.name, url: item.url, iconSource: 'auto', iconRadius: 4 }
    if (item.folderId && folderIds.has(item.folderId)) {
      toFolders.set(item.folderId, [...(toFolders.get(item.folderId) || []), site])
    } else {
      toRoot.push(site)
    }
  }
  if (toRoot.length === 0 && toFolders.size === 0) return items
  const next = items.map((item) => (toFolders.has(item.id) ? { ...item, items: [...item.items, ...toFolders.get(item.id)] } : item))
  return [...next, ...toRoot]
}
