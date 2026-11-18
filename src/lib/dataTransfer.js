import { DEFAULT_FOLDER_ICON_TYPE, cloneEntry, createFolderEntry, getFolderSites, isFolderItem } from './folders.js'
import { getAppVersion } from './appInfo.js'
import { getItem, hasItem, setItem } from './storage.js'
import { FOLDER_ICON_MIGRATION_VERSION, migrateFolderIconsToDefault } from './configMigrations.js'

const SETTINGS_KEYS = {
  newtab_theme: 'theme',
  newtab_mode: 'mode',
  newtab_show_search: 'showSearchBar',
  newtab_show_title: 'showSiteTitle',
  newtab_align: 'themeAlign',
  newtab_default: 'defaultConfig',
  newtab_terminal: 'terminalConfig',
  newtab_bento: 'bentoConfig',
  newtab_glass: 'glassConfig',
  newtab_bubble: 'bubbleConfig',
  newtab_solids: 'solidPresets',
  newtab_gradients: 'gradientPresets',
  newtab_dynamics: 'dynamicPresets',
  newtab_bg: 'bgConfig',
  newtab_search: 'searchConfig',
  newtab_locale: 'locale',
}

export const collectSettings = () => {
  const settings = {}
  for (const [storageKey, exportKey] of Object.entries(SETTINGS_KEYS)) {
    if (hasItem(storageKey)) settings[exportKey] = getItem(storageKey)
  }
  return settings
}

export const buildExportData = (type, sitesArray, clickCountsObj) => {
  const data = { version: getAppVersion(), type }
  if (type === 'sites' || type === 'all') {
    data.sites = collectSites(sitesArray, clickCountsObj)
  }
  if (type === 'settings' || type === 'all') {
    data.settings = collectSettings()
  }
  return data
}

export const downloadJson = (data, filename) => {
  const json = JSON.stringify(data)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const collectSites = (sitesArray, clickCountsObj) => {
  return sitesArray.map((site) => {
    if (isFolderItem(site)) {
      return {
        type: 'folder',
        name: site.name,
        folderBgColor: site.folderBgColor,
        folderShowBackground: site.folderShowBackground,
        folderRadius: site.folderRadius,
        folderIconScale: site.folderIconScale,
        folderIconType: site.folderIconType || DEFAULT_FOLDER_ICON_TYPE,
        folderCustomIcon: site.folderCustomIcon || '',
        items: collectSites(getFolderSites(site), clickCountsObj),
      }
    }
    const item = {
      name: site.name,
      url: site.url,
      iconSource: site.iconSource || 'auto',
    }
    if (site.iconRadius != null) item.iconRadius = site.iconRadius
    if (site.customIcon) item.customIcon = site.customIcon
    if (site.customIconDark) item.customIconDark = site.customIconDark
    if (clickCountsObj[site.id]) item.clickCount = clickCountsObj[site.id]
    return item
  })
}

export const detectImportData = (parsed) => {
  if (Array.isArray(parsed)) {
    return { type: 'legacy', hasSites: true, hasSettings: false, version: null, data: parsed }
  }
  if (parsed && typeof parsed === 'object' && parsed.version) {
    return {
      type: parsed.type || 'all',
      hasSites: !!parsed.sites,
      hasSettings: !!parsed.settings,
      version: parsed.version,
      data: parsed,
    }
  }
  return null
}

const parseVersion = (version) => String(version).split('.').map((part) => Number.parseInt(part, 10) || 0)

// 比较两个 x.y.z 版本号，a 较新返回正数，较旧返回负数，相同返回 0
export const compareVersions = (a, b) => {
  const left = parseVersion(a)
  const right = parseVersion(b)
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    const diff = (left[i] || 0) - (right[i] || 0)
    if (diff !== 0) return diff
  }
  return 0
}

// 允许导入同版本或旧版本导出的文件；更新版本的文件可能包含当前版本不认识的数据，拒绝导入
export const isImportVersionSupported = (importVersion, currentVersion = getAppVersion()) => {
  if (!importVersion) return false
  return compareVersions(importVersion, currentVersion) <= 0
}

export const getCurrentVersion = () => {
  return getAppVersion()
}

const normalizeUrl = (url) => {
  return url.replace(/\/+$/, '').toLowerCase()
}

// 取出导入文件里的站点；0.5.0 之前导出的文件同样把公文包文件夹图标改为宫格，与本地数据的迁移保持一致
export const getImportSiteItems = (detected) => {
  const siteItems = detected.type === 'legacy' ? detected.data : detected.data.sites
  const isBeforeNewDefault = !detected.version || compareVersions(detected.version, FOLDER_ICON_MIGRATION_VERSION) < 0
  return isBeforeNewDefault ? migrateFolderIconsToDefault(siteItems) : siteItems
}

export const importSitesData = (siteItems, sitesStore, existingSites, clickCountsStore) => {
  const nextTree = existingSites.map(cloneEntry)
  let count = 0

  const importItem = (item, targetTree) => {
    if (isFolderItem(item) || item.type === 'folder') {
      if (!item.name) return 0
      const folder = createFolderEntry({
        name: item.name,
        folderBgColor: item.folderBgColor,
        folderShowBackground: item.folderShowBackground,
        folderRadius: item.folderRadius,
        folderIconScale: item.folderIconScale,
        folderIconType: item.folderIconType,
        folderCustomIcon: item.folderCustomIcon,
        items: [],
      })
      let importedChildren = 0
      for (const child of item.items || []) {
        importedChildren += importItem(child, folder.items)
      }
      targetTree.push(folder)
      return importedChildren
    }

    if (!item.name || !item.url) return 0
    let url = item.url
    if (!/^https?:\/\//.test(url)) url = 'https://' + url
    const site = { name: item.name, url }
    if (item.iconSource) site.iconSource = item.iconSource
    if (item.iconRadius != null) site.iconRadius = item.iconRadius
    if (item.customIcon) site.customIcon = item.customIcon
    if (item.customIconDark) site.customIconDark = item.customIconDark

    const normalizedUrl = normalizeUrl(site.url)
    const existing = targetTree.find((entry) => !isFolderItem(entry) && entry.name === site.name && normalizeUrl(entry.url) === normalizedUrl)
    if (existing) {
      Object.assign(existing, site)
      if (item.clickCount > 0) clickCountsStore.set(existing.id, item.clickCount)
      return 1
    }

    const newId = crypto.randomUUID()
    targetTree.push({ ...site, id: newId })
    if (item.clickCount > 0) clickCountsStore.set(newId, item.clickCount)
    return 1
  }

  for (const item of siteItems) {
    count += importItem(item, nextTree)
  }

  sitesStore.setAll(nextTree)
  return count
}

// 返回写入完成的 Promise，刷新页面前需要等待，扩展存储是异步写入的
export const importSettingsData = (settings) => {
  const reverseMap = {}
  for (const [storageKey, exportKey] of Object.entries(SETTINGS_KEYS)) {
    reverseMap[exportKey] = storageKey
  }
  const writes = Object.entries(settings)
    .filter(([key]) => reverseMap[key])
    .map(([key, value]) => setItem(reverseMap[key], value))
  return Promise.all(writes)
}

export const getExportFilename = (type) => {
  const suffix = type === 'all' ? '' : `-${type}`
  return `youran-tab${suffix}-v${getAppVersion()}.json`
}
