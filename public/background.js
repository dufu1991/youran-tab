// 悠然标签页后台脚本：在网页右键菜单中提供「加入悠然标签页」。
// 站点数据保存在扩展存储中，后台只读取它来判断网页是否已经加入、生成文件夹子菜单；
// 新加入的网页先放进待加入队列，由新标签页打开或可见时取出合并，避免和新标签页同时改写站点数据。
// 该文件不经过 Vite 打包，原样复制到各浏览器的构建目录。

const api = globalThis.browser ?? globalThis.chrome

const MENU_ID = 'youran-add-page'
const MENU_ROOT_ID = `${MENU_ID}:root`
const MENU_FOLDER_PREFIX = `${MENU_ID}:folder:`
// 与 src/lib/storage.js、src/lib/stores.js、src/lib/pendingSites.js 中的键名保持一致
const STORAGE_VERSION_KEY = 'youran_storage_version'
const SITES_KEY = 'newtab_sites'
const PENDING_SITES_KEY = 'youran_pending_sites'
// 新标签页搬迁到扩展存储失败、退回 localStorage 时，会单独同步这两项给后台
const KNOWN_SITE_URLS_KEY = 'youran_known_site_urls'
const SITE_FOLDERS_KEY = 'youran_site_folders'
const SUMMARY_KEYS = [STORAGE_VERSION_KEY, SITES_KEY, KNOWN_SITE_URLS_KEY, SITE_FOLDERS_KEY]

// Firefox 菜单标题中的 & 表示快捷键，需要写成 && 才能原样显示
const isFirefox = typeof api.runtime.getBrowserInfo === 'function'
const escapeMenuTitle = (title) => (isFirefox ? title.replaceAll('&', '&&') : title)

// 与 src/lib/pendingSites.js 的 normalizeSiteUrl 保持一致
const normalizeSiteUrl = (url) => url.replace(/\/+$/, '').toLowerCase()

const isWebUrl = (url) => /^https?:\/\//.test(url || '')

const isFolder = (item) => item?.type === 'folder'

const collectUrls = (items) => items.flatMap((item) => (
  isFolder(item) ? collectUrls(Array.isArray(item.items) ? item.items : []) : [normalizeSiteUrl(item.url)]
))

// 已加入的网址与文件夹列表：数据已搬迁到扩展存储时直接读取站点数据，否则使用新标签页同步过来的摘要
const readSiteSummary = (stored) => {
  if (!stored[STORAGE_VERSION_KEY]) {
    return { urls: stored[KNOWN_SITE_URLS_KEY] || [], folders: stored[SITE_FOLDERS_KEY] || [] }
  }
  const sites = stored[SITES_KEY] || []
  return {
    urls: collectUrls(sites),
    folders: sites.filter(isFolder).map((folder) => ({ id: folder.id, name: folder.name })),
  }
}

const MENU_BASE = { contexts: ['page'], documentUrlPatterns: ['http://*/*', 'https://*/*'] }

// 没有文件夹时只有一个菜单项，直接加入主列表；有文件夹时展开为子菜单，可选主列表或某个文件夹
let lastMenuFolders = null

const buildMenus = async () => {
  const { folders } = readSiteSummary(await api.storage.local.get(SUMMARY_KEYS))
  lastMenuFolders = JSON.stringify(folders)
  await api.contextMenus.removeAll()
  api.contextMenus.create({ ...MENU_BASE, id: MENU_ID, title: api.i18n.getMessage('contextAddPage') })
  if (folders.length === 0) return
  api.contextMenus.create({ ...MENU_BASE, id: MENU_ROOT_ID, parentId: MENU_ID, title: api.i18n.getMessage('contextAddToMainList') })
  api.contextMenus.create({ ...MENU_BASE, id: `${MENU_ID}:separator`, parentId: MENU_ID, type: 'separator' })
  folders.forEach((folder) => {
    api.contextMenus.create({ ...MENU_BASE, id: `${MENU_FOLDER_PREFIX}${folder.id}`, parentId: MENU_ID, title: escapeMenuTitle(folder.name) })
  })
}

// 串行执行重建，避免并发的 removeAll 与 create 产生重复 id
let menuQueue = Promise.resolve()
const createMenus = () => {
  menuQueue = menuQueue.then(buildMenus, buildMenus)
  return menuQueue
}

// 在当前网页右上角显示一条短暂提示；会被序列化后注入网页执行，只能使用参数
const showPageToast = (message) => {
  const HOST_ID = 'youran-tab-toast'
  document.getElementById(HOST_ID)?.remove()

  const host = document.createElement('div')
  host.id = HOST_ID
  host.style.cssText = 'position:fixed;top:16px;right:16px;z-index:2147483647;'
  const root = host.attachShadow({ mode: 'closed' })
  const dark = matchMedia('(prefers-color-scheme: dark)').matches

  const toast = document.createElement('div')
  toast.textContent = message
  toast.style.cssText = [
    'font: 500 14px/20px -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
    'padding: 10px 16px',
    'border-radius: 12px',
    `background: ${dark ? 'rgba(245,245,245,0.96)' : 'rgba(23,23,23,0.94)'}`,
    `color: ${dark ? '#171717' : '#fafafa'}`,
    'box-shadow: 0 10px 30px rgba(0,0,0,0.2)',
    'opacity: 0',
    'transform: translateY(-6px)',
    'transition: opacity 160ms ease, transform 160ms ease',
  ].join(';')
  root.appendChild(toast)
  document.documentElement.appendChild(host)

  requestAnimationFrame(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'none'
  })
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateY(-6px)'
    setTimeout(() => host.remove(), 200)
  }, 2200)
}

const addPage = async (tab, pageUrl, folderId) => {
  const url = pageUrl || tab?.url
  if (!isWebUrl(url)) return

  const stored = await api.storage.local.get([PENDING_SITES_KEY, ...SUMMARY_KEYS])
  const pending = stored[PENDING_SITES_KEY] || []
  const { urls, folders } = readSiteSummary(stored)
  const knownUrls = new Set(urls)
  const normalizedUrl = normalizeSiteUrl(url)
  const exists = knownUrls.has(normalizedUrl) || pending.some((item) => normalizeSiteUrl(item.url) === normalizedUrl)

  if (!exists) {
    const name = (tab?.title || '').trim() || new URL(url).hostname
    await api.storage.local.set({ [PENDING_SITES_KEY]: [...pending, { name, url, folderId, addedAt: Date.now() }] })
  }

  const folder = folders.find((item) => item.id === folderId)
  const message = exists
    ? api.i18n.getMessage('contextPageExists')
    : folder
      ? api.i18n.getMessage('contextPageAddedToFolder', [folder.name])
      : api.i18n.getMessage('contextPageAdded')

  if (typeof tab?.id !== 'number') return
  // 部分页面（如浏览器商店）不允许注入脚本，此时静默跳过提示，网站仍已加入
  await api.scripting.executeScript({
    target: { tabId: tab.id },
    func: showPageToast,
    args: [message],
  }).catch(() => {})
}

api.runtime.onInstalled.addListener(createMenus)
api.runtime.onStartup.addListener(createMenus)

// 文件夹列表变化时重建子菜单；站点数据的其他修改（例如改名网站、调整顺序）不重建
api.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return
  if (changes[SITE_FOLDERS_KEY] || changes[STORAGE_VERSION_KEY]) {
    createMenus()
    return
  }
  if (!changes[SITES_KEY]) return
  const sites = changes[SITES_KEY].newValue || []
  const folders = JSON.stringify(sites.filter(isFolder).map((folder) => ({ id: folder.id, name: folder.name })))
  if (folders !== lastMenuFolders) createMenus()
})

api.contextMenus.onClicked.addListener((info, tab) => {
  const menuId = String(info.menuItemId)
  if (menuId === MENU_ID || menuId === MENU_ROOT_ID) {
    addPage(tab, info.pageUrl, '')
    return
  }
  if (menuId.startsWith(MENU_FOLDER_PREFIX)) addPage(tab, info.pageUrl, menuId.slice(MENU_FOLDER_PREFIX.length))
})
