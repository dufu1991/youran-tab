import { cloneEntry, createFolderEntry, getFolderSites, isFolderItem } from './folders.js'

function getAppVersion() {
  try { return chrome.runtime.getManifest().version } catch { return '0.0.0' }
}

const SETTINGS_KEYS = {
  newtab_theme: 'theme',
  newtab_mode: 'mode',
  newtab_show_search: 'showSearchBar',
  newtab_show_title: 'showSiteTitle',
  newtab_align: 'themeAlign',
  newtab_default: 'defaultConfig',
  newtab_terminal: 'terminalConfig',
  newtab_bento: 'bentoConfig',
  newtab_solids: 'solidPresets',
  newtab_gradients: 'gradientPresets',
  newtab_bg: 'bgConfig',
  newtab_locale: 'locale',
}

export function collectSettings() {
  const settings = {}
  for (const [storageKey, exportKey] of Object.entries(SETTINGS_KEYS)) {
    const raw = localStorage.getItem(storageKey)
    if (raw !== null) {
      try { settings[exportKey] = JSON.parse(raw) } catch { settings[exportKey] = raw }
    }
  }
  return settings
}

export function buildExportData(type, sitesArray, clickCountsObj) {
  const data = { version: getAppVersion(), type }
  if (type === 'sites' || type === 'all') {
    data.sites = collectSites(sitesArray, clickCountsObj)
  }
  if (type === 'settings' || type === 'all') {
    data.settings = collectSettings()
  }
  return data
}

export function downloadJson(data, filename) {
  const json = JSON.stringify(data)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function collectSites(sitesArray, clickCountsObj) {
  return sitesArray.map((site) => {
    if (isFolderItem(site)) {
      return {
        type: 'folder',
        name: site.name,
        folderBgColor: site.folderBgColor,
        folderRadius: site.folderRadius,
        folderIconType: site.folderIconType || 'briefcase',
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

export function detectImportData(parsed) {
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

export function checkVersionMatch(importVersion) {
  if (!importVersion) return false
  return importVersion === getAppVersion()
}

export function getCurrentVersion() {
  return getAppVersion()
}

function normalizeUrl(url) {
  return url.replace(/\/+$/, '').toLowerCase()
}

export function importSitesData(siteItems, sitesStore, existingSites, clickCountsStore) {
  const nextTree = existingSites.map(cloneEntry)
  let count = 0

  function importItem(item, targetTree) {
    if (isFolderItem(item) || item.type === 'folder') {
      if (!item.name) return 0
      const folder = createFolderEntry({
        name: item.name,
        folderBgColor: item.folderBgColor,
        folderRadius: item.folderRadius,
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

export function importSettingsData(settings) {
  const reverseMap = {}
  for (const [storageKey, exportKey] of Object.entries(SETTINGS_KEYS)) {
    reverseMap[exportKey] = storageKey
  }
  for (const [key, value] of Object.entries(settings)) {
    const storageKey = reverseMap[key]
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(value))
    }
  }
}

export function getExportFilename(type) {
  const suffix = type === 'all' ? '' : `-${type}`
  return `youran-tab${suffix}.json`
}
