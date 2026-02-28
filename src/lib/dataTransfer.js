function getAppVersion() {
  try { return chrome.runtime.getManifest().version } catch { return '0.0.0' }
}

const SETTINGS_KEYS = {
  newtab_theme: 'theme',
  newtab_mode: 'mode',
  newtab_show_search: 'showSearchBar',
  newtab_engine_logo: 'showEngineLogo',
  newtab_show_title: 'showSiteTitle',
  newtab_align: 'themeAlign',
  newtab_default: 'defaultConfig',
  newtab_terminal: 'terminalConfig',
  newtab_engine: 'searchEngine',
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

export function collectSites(sitesArray, clickCountsObj) {
  return sitesArray.map(s => {
    const o = { name: s.name, url: s.url, iconSource: s.iconSource || 'auto' }
    if (s.iconRadius != null) o.iconRadius = s.iconRadius
    if (clickCountsObj[s.id]) o.clickCount = clickCountsObj[s.id]
    return o
  })
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
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
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
  let count = 0
  for (const item of siteItems) {
    if (!item.name || !item.url) continue
    let url = item.url
    if (!/^https?:\/\//.test(url)) url = 'https://' + url
    const site = { name: item.name, url }
    if (item.iconSource) site.iconSource = item.iconSource
    if (item.iconRadius != null) site.iconRadius = item.iconRadius
    const normalizedUrl = normalizeUrl(site.url)
    const existing = existingSites.find(s => s.name === site.name && normalizeUrl(s.url) === normalizedUrl)
    if (existing) {
      // 重复站点：更新属性
      sitesStore.edit(existing.id, site)
      if (item.clickCount > 0) clickCountsStore.set(existing.id, item.clickCount)
    } else {
      const newId = sitesStore.add(site)
      if (item.clickCount > 0) clickCountsStore.set(newId, item.clickCount)
    }
    count++
  }
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
