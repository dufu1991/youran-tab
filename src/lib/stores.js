import { writable, readable, derived, get } from 'svelte/store'
import { pickDistinctHue, pickFreshItem, pickRandomBackground, pushRecent } from './randomBackground.js'
import { normalizeSiteTree, removeItemFromTree, updateItemTree } from './folders.js'
import { SEARCH_ENGINES, AI_PROVIDERS, findTarget } from './searchProviders.js'
import { t } from './i18n.js'
import { loadFromStorage, persistedWritable } from './persisted.js'
import { getItem, hasItem, removeItem, setItem, storageKeys, usesExtensionStorage } from './storage.js'
import { getInitialBackgroundType, hasExistingNewtabData, migrateAiProviderId, migrateAiProviderIds, migrateFolderIconsToDefault } from './configMigrations.js'
import { KNOWN_SITE_URLS_KEY, PENDING_SITES_KEY, SITE_FOLDERS_KEY, collectSiteFolders, collectSiteUrls, mergePendingSites } from './pendingSites.js'

const STORAGE_KEY_SITES = 'newtab_sites'
const STORAGE_KEY_THEME = 'newtab_theme'
const STORAGE_KEY_MODE = 'newtab_mode'
export const BACKGROUND_PRESET_LIMIT = 18
const BACKGROUND_PRESET_STORAGE_VERSION = 5
const hadExistingNewtabData = hasExistingNewtabData(storageKeys())

const defaultSites = [
  { id: '1', name: 'Google', url: 'https://google.com', iconSource: 'custom', customIcon: 'logos/google.svg' },
  { id: '2', name: 'YouTube', url: 'https://youtube.com', iconSource: 'custom', customIcon: 'logos/youtube.svg' },
  { id: '3', name: 'ChatGPT', url: 'https://chatgpt.com', iconSource: 'custom', customIcon: 'logos/openai.svg' },
  { id: '4', name: '百度', url: 'https://baidu.com', iconSource: 'custom', customIcon: 'logos/baidu.svg' },
]

// 文件夹图标迁移只执行一次，记录迁移版本：
// - 没有记录：从 0.4.x 及更早升级，把公文包图标改为宫格
// - '0.5.0'：0.5.0 开发期间的数据，当时自动改成了堆叠，这次一并改为宫格
const STORAGE_KEY_FOLDER_ICON_MIGRATION = 'newtab_folder_icon_migration'
const FOLDER_ICON_MIGRATION_DONE = '0.5.0-grid'

const loadInitialSites = () => {
  const stored = loadFromStorage(STORAGE_KEY_SITES, defaultSites)
  const migrated = getItem(STORAGE_KEY_FOLDER_ICON_MIGRATION)
  if (migrated === FOLDER_ICON_MIGRATION_DONE) return stored
  setItem(STORAGE_KEY_FOLDER_ICON_MIGRATION, FOLDER_ICON_MIGRATION_DONE)
  removeItem('newtab_folder_stack_migrated')
  return migrateFolderIconsToDefault(stored, { includeStack: migrated === '0.5.0' })
}

const createSitesStore = () => {
  const initial = normalizeSiteTree(loadInitialSites())
  // 其他新标签页修改了站点数据时同步过来，避免旧页面在之后保存时覆盖新数据
  const { subscribe, set, update } = persistedWritable(STORAGE_KEY_SITES, initial, normalizeSiteTree)

  return {
    subscribe,
    add(site) {
      const id = crypto.randomUUID()
      update((sites) => [...sites, { ...site, id }])
      return id
    },
    remove(id) {
      update((siteTree) => removeItemFromTree(siteTree, id))
    },
    edit(id, data) {
      update((siteTree) =>
        updateItemTree(siteTree, id, (item) => ({ ...item, ...data }))
      )
    },
    reset() {
      set(normalizeSiteTree(defaultSites))
    },
    setAll(items) {
      set(normalizeSiteTree(items))
    },
    reorder(fromIndex, toIndex) {
      update((sites) => {
        const arr = [...sites]
        const [item] = arr.splice(fromIndex, 1)
        arr.splice(toIndex, 0, item)
        return arr
      })
    },
  }
}

const createThemeStore = () => {
  const initial = loadFromStorage(STORAGE_KEY_THEME, 'default')
  const { subscribe, set } = persistedWritable(STORAGE_KEY_THEME, initial)

  return { subscribe, set }
}

export const sites = createSitesStore()

// 网页右键「加入悠然标签页」：后台把网页放进扩展存储的待加入队列，这里负责取出合并。
// 后台直接读取扩展存储中的站点数据来判断网页是否已经加入、生成文件夹子菜单。开发环境没有扩展存储时跳过
const extensionStorage = (globalThis.browser ?? globalThis.chrome)?.storage

const drainPendingSites = async () => {
  // 只由当前可见的新标签页处理，避免多个页面同时合并出重复网站
  if (document.visibilityState !== 'visible') return
  const { [PENDING_SITES_KEY]: pending } = await extensionStorage.local.get(PENDING_SITES_KEY)
  if (!pending?.length) return
  await extensionStorage.local.set({ [PENDING_SITES_KEY]: [] })
  const current = get(sites)
  const next = mergePendingSites(current, pending)
  if (next !== current) sites.setAll(next)
}

// 扩展存储搬迁失败、本次退回 localStorage 时，后台读不到站点数据，需要单独同步网址和文件夹列表
const syncSiteSummaryForBackground = () => {
  // 只在内容变化时写入：文件夹列表变化会让后台重建右键菜单
  let lastSyncedUrls = ''
  let lastSyncedFolders = ''
  sites.subscribe((value) => {
    const urls = JSON.stringify(collectSiteUrls(value))
    const folders = JSON.stringify(collectSiteFolders(value))
    if (urls !== lastSyncedUrls) {
      lastSyncedUrls = urls
      extensionStorage.local.set({ [KNOWN_SITE_URLS_KEY]: JSON.parse(urls) })
    }
    if (folders !== lastSyncedFolders) {
      lastSyncedFolders = folders
      extensionStorage.local.set({ [SITE_FOLDERS_KEY]: JSON.parse(folders) })
    }
  })
}

if (extensionStorage?.local) {
  if (!usesExtensionStorage()) syncSiteSummaryForBackground()
  extensionStorage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes[PENDING_SITES_KEY]?.newValue?.length) drainPendingSites()
  })
  document.addEventListener('visibilitychange', drainPendingSites)
  drainPendingSites()
}
export const theme = createThemeStore()

const createModeStore = () => {
  const initial = loadFromStorage(STORAGE_KEY_MODE, 'auto')
  const { subscribe, set } = persistedWritable(STORAGE_KEY_MODE, initial)
  return { subscribe, set }
}

export const mode = createModeStore()

// 系统明暗偏好，系统切换（例如日落自动切换）时实时更新
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
const systemDark = readable(darkQuery.matches, (set) => {
  const handleChange = (event) => set(event.matches)
  darkQuery.addEventListener('change', handleChange)
  return () => darkQuery.removeEventListener('change', handleChange)
})

export const isDark = derived([mode, systemDark], ([$mode, $systemDark]) => {
  if ($mode === 'dark') return true
  if ($mode === 'light') return false
  return $systemDark
})

export const showSettings = writable(false)
export const editMode = writable(false)

// 经典主题搜索框显示
const STORAGE_KEY_SEARCH_BAR = 'newtab_show_search'

const createShowSearchBarStore = () => {
  const initial = loadFromStorage(STORAGE_KEY_SEARCH_BAR, true)
  const { subscribe, set } = persistedWritable(STORAGE_KEY_SEARCH_BAR, initial)
  return { subscribe, set }
}

export const showSearchBar = createShowSearchBarStore()

// 显示站点标题
const STORAGE_KEY_SITE_TITLE = 'newtab_show_title'

const createShowSiteTitleStore = () => {
  const initial = loadFromStorage(STORAGE_KEY_SITE_TITLE, true)
  const { subscribe, set } = persistedWritable(STORAGE_KEY_SITE_TITLE, initial)
  return { subscribe, set }
}

export const showSiteTitle = createShowSiteTitleStore()

// 各主题垂直对齐
const STORAGE_KEY_ALIGN = 'newtab_align'

const createThemeAlignStore = () => {
  const defaults = { default: 'top', bento: 'center', terminal: 'top', minimal: 'center', glass: 'center', bubble: 'center', pixel: 'top', sketch: 'top' }
  const initial = loadFromStorage(STORAGE_KEY_ALIGN, defaults)
  const { subscribe, update } = persistedWritable(STORAGE_KEY_ALIGN, { ...defaults, ...initial }, (value) => ({ ...defaults, ...value }))
  return {
    subscribe,
    set(theme, val) { update((c) => ({ ...c, [theme]: val })) },
  }
}

export const themeAlign = createThemeAlignStore()

// 经典主题配置
const STORAGE_KEY_DEFAULT = 'newtab_default'

const createDefaultConfigStore = () => {
  const defaults = { width: 800, cols: 6, radius: 12, cardOpacity: 50, cardBlur: 12, iconSize: 40 }
  const initial = loadFromStorage(STORAGE_KEY_DEFAULT, defaults)
  const { subscribe, update } = persistedWritable(STORAGE_KEY_DEFAULT, { ...defaults, ...initial }, (value) => ({ ...defaults, ...value }))
  return {
    subscribe,
    set(key, val) { update((c) => ({ ...c, [key]: val })) },
  }
}

export const defaultConfig = createDefaultConfigStore()

// 玻璃主题配置
const STORAGE_KEY_GLASS = 'newtab_glass'

const createGlassConfigStore = () => {
  const defaults = { cols: 2 }
  const initial = loadFromStorage(STORAGE_KEY_GLASS, defaults)
  const { subscribe, update } = persistedWritable(STORAGE_KEY_GLASS, { ...defaults, ...initial }, (value) => ({ ...defaults, ...value }))
  return {
    subscribe,
    set(key, val) { update((c) => ({ ...c, [key]: val })) },
  }
}

export const glassConfig = createGlassConfigStore()

// 气泡主题配置
const STORAGE_KEY_BUBBLE = 'newtab_bubble'

const createBubbleConfigStore = () => {
  const defaults = { layout: 'fixed', size: 80 }
  const initial = loadFromStorage(STORAGE_KEY_BUBBLE, defaults)
  const { subscribe, update } = persistedWritable(STORAGE_KEY_BUBBLE, { ...defaults, ...initial }, (value) => ({ ...defaults, ...value }))
  return {
    subscribe,
    set(key, val) { update((c) => ({ ...c, [key]: val })) },
  }
}

export const bubbleConfig = createBubbleConfigStore()

// 终端自定义设置
const STORAGE_KEY_TERM = 'newtab_terminal'

const createTerminalConfigStore = () => {
  const defaults = { prompt: '$', color: 'green', width: 1000, cursor: 'bar' }
  const initial = loadFromStorage(STORAGE_KEY_TERM, defaults)
  const { subscribe, set, update } = persistedWritable(STORAGE_KEY_TERM, { ...defaults, ...initial }, (value) => ({ ...defaults, ...value }))
  return {
    subscribe,
    setPrompt(p) { update((c) => ({ ...c, prompt: p })) },
    setColor(c) { update((cfg) => ({ ...cfg, color: c })) },
    setWidth(w) { update((cfg) => ({ ...cfg, width: w })) },
    setCursor(c) { update((cfg) => ({ ...cfg, cursor: c })) },
  }
}

export const terminalConfig = createTerminalConfigStore()

// 搜索引擎 / AI 提问配置
const STORAGE_KEY_SEARCH = 'newtab_search'

const defaultSearchConfig = () => {
  return {
    enabledEngines: SEARCH_ENGINES.map((engine) => engine.id),
    enabledAi: AI_PROVIDERS.map((provider) => provider.id),
    defaultMode: 'search',
    defaultEngine: 'google',
    defaultAi: 'chatgpt',
  }
}

const normalizeSearchConfig = (value) => {
  const defaults = defaultSearchConfig()
  const config = { ...defaults, ...(value && typeof value === 'object' ? value : {}) }
  const engineIds = new Set(SEARCH_ENGINES.map((engine) => engine.id))
  const aiIds = new Set(AI_PROVIDERS.map((provider) => provider.id))

  const engines = Array.isArray(config.enabledEngines) ? config.enabledEngines : defaults.enabledEngines
  config.enabledEngines = engines.filter((id) => engineIds.has(id))
  if (config.enabledEngines.length === 0) config.enabledEngines = defaults.enabledEngines

  const aiList = Array.isArray(config.enabledAi)
    ? migrateAiProviderIds(config.enabledAi)
    : defaults.enabledAi
  config.enabledAi = aiList.filter((id) => aiIds.has(id))

  config.defaultAi = migrateAiProviderId(config.defaultAi)

  if (config.defaultMode !== 'search' && config.defaultMode !== 'ai') config.defaultMode = defaults.defaultMode
  if (config.defaultMode === 'ai' && config.enabledAi.length === 0) config.defaultMode = 'search'
  if (!config.enabledEngines.includes(config.defaultEngine)) config.defaultEngine = config.enabledEngines[0]
  if (!config.enabledAi.includes(config.defaultAi)) config.defaultAi = config.enabledAi[0] || defaults.defaultAi

  return config
}

const createSearchConfigStore = () => {
  const initial = normalizeSearchConfig(loadFromStorage(STORAGE_KEY_SEARCH, null))
  const { subscribe, set, update } = persistedWritable(STORAGE_KEY_SEARCH, initial, normalizeSearchConfig)
  return {
    subscribe,
    set: (key, val) => update((c) => normalizeSearchConfig({ ...c, [key]: val })),
    reset: () => set(defaultSearchConfig()),
  }
}

export const searchConfig = createSearchConfigStore()

// 会话内临时选择的搜索目标（不持久化，新开标签页恢复默认）
export const searchTargetOverride = writable(null)

export const activeSearchTarget = derived(
  [searchConfig, searchTargetOverride],
  ([$searchConfig, $searchTargetOverride]) => {
    if ($searchTargetOverride) {
      const enabled = $searchTargetOverride.type === 'ai' ? $searchConfig.enabledAi : $searchConfig.enabledEngines
      if (enabled.includes($searchTargetOverride.id)) return $searchTargetOverride
    }

    if ($searchConfig.defaultMode === 'ai' && $searchConfig.enabledAi.length > 0) {
      const aiId = $searchConfig.enabledAi.includes($searchConfig.defaultAi)
        ? $searchConfig.defaultAi
        : $searchConfig.enabledAi[0]
      return { type: 'ai', id: aiId }
    }

    const engineId = $searchConfig.enabledEngines.includes($searchConfig.defaultEngine)
      ? $searchConfig.defaultEngine
      : ($searchConfig.enabledEngines[0] || 'browser')
    return { type: 'engine', id: engineId }
  }
)

// 搜索框占位符跟随当前目标（名称 + 搜索 / 提问）
export const searchPlaceholder = derived(
  [activeSearchTarget, t],
  ([$activeSearchTarget, $t]) => {
    const provider = findTarget($activeSearchTarget)
    if (!provider || !provider.name) {
      return $activeSearchTarget.type === 'ai' ? $t('search.placeholderAi') : $t('search.placeholder')
    }
    return $activeSearchTarget.type === 'ai'
      ? $t('search.placeholderAiName', provider.name)
      : $t('search.placeholderName', provider.name)
  }
)

// 搜索
export const doSearch = (query) => {
  // 自定义搜索引擎 / AI 提问
  const provider = findTarget(get(activeSearchTarget))
  if (provider && provider.makeUrl) {
    window.open(provider.makeUrl(query), '_self')
    return
  }
  // 浏览器默认：Chrome / Edge
  if (typeof chrome !== 'undefined' && chrome.search && chrome.search.query) {
    chrome.search.query({ text: query, disposition: 'CURRENT_TAB' })
    return
  }
  // 浏览器默认：Firefox
  if (typeof browser !== 'undefined' && browser.search && browser.search.search) {
    browser.search.search({ query, disposition: 'CURRENT_TAB' })
    return
  }
  // 兜底
  window.open('https://www.google.com/search?q=' + encodeURIComponent(query), '_self')
}

// 点击计数
const STORAGE_KEY_CLICKS = 'newtab_clicks'

const createClickCountStore = () => {
  const initial = loadFromStorage(STORAGE_KEY_CLICKS, {})
  const { subscribe, update } = persistedWritable(STORAGE_KEY_CLICKS, initial)
  return {
    subscribe,
    increment(siteId) {
      update((counts) => ({ ...counts, [siteId]: (counts[siteId] || 0) + 1 }))
    },
    set(siteId, count) {
      update((counts) => ({ ...counts, [siteId]: count }))
    },
  }
}

export const clickCounts = createClickCountStore()

// Bento 主题配置
const STORAGE_KEY_BENTO = 'newtab_bento'

const createBentoConfigStore = () => {
  const defaults = { width: 800, gap: 12, radius: 12, cols: 4, fixed: false, cardOpacity: 50, cardBlur: 12, iconSize: 40 }
  const initial = loadFromStorage(STORAGE_KEY_BENTO, defaults)
  const { subscribe, update } = persistedWritable(STORAGE_KEY_BENTO, { ...defaults, ...initial }, (value) => ({ ...defaults, ...value }))
  return {
    subscribe,
    set(key, val) { update((c) => ({ ...c, [key]: val })) },
  }
}

export const bentoConfig = createBentoConfigStore()

const getPresetKey = (item) => {
  return typeof item === 'string' ? item : JSON.stringify(item)
}

// hueBase 是每组随机的色相起点，避免每次重置后同一位置总落在同一段色相
const appendGeneratedItem = (list, keys, generator, index, getKey = getPresetKey, hueBase = rand(0, 360)) => {
  let lastItem

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const item = generator(index, attempt, hueBase)
    lastItem = item
    const key = getKey(item)
    if (!keys.has(key)) {
      keys.add(key)
      list.push(item)
      return
    }
  }

  list.push(lastItem)
}

const completeGeneratedGroup = (list, generator, getKey = getPresetKey) => {
  const keys = new Set(list.map(getKey))
  const hueBase = rand(0, 360)

  while (list.length < BACKGROUND_PRESET_LIMIT) {
    appendGeneratedItem(list, keys, generator, list.length, getKey, hueBase)
  }

  return list
}

const addGeneratedItem = (list, generator, getKey = getPresetKey) => {
  const next = [...list]
  const keys = new Set(next.map(getKey))
  appendGeneratedItem(next, keys, generator, next.length, getKey)
  return next
}

const createGeneratedGroup = (generator, getKey = getPresetKey) => {
  return completeGeneratedGroup([], generator, getKey)
}

// 读取已保存的预设：截断到上限并逐项规范化（版本不一致时调用方会直接重新生成）
const normalizeStoredGroup = (source, normalizeItem = (item) => item) => {
  return Array.isArray(source)
    ? source.slice(0, BACKGROUND_PRESET_LIMIT).map(normalizeItem)
    : []
}

// 纯色预设（暗色和亮色分开存储，各 18 个）
const STORAGE_KEY_SOLIDS = 'newtab_solids'
const createDefaultSolids = () => {
  return {
    version: BACKGROUND_PRESET_STORAGE_VERSION,
    dark: createGeneratedGroup((index, attempt, hueBase) => randomSolidColor(true, index, attempt, hueBase)),
    light: createGeneratedGroup((index, attempt, hueBase) => randomSolidColor(false, index, attempt, hueBase)),
  }
}

const randomUnit = () => {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1)
    globalThis.crypto.getRandomValues(values)
    return values[0] / 4294967296
  }

  return Math.random()
}

const rand = (min, max) => randomUnit() * (max - min) + min
const randInt = (min, max) => Math.floor(rand(min, max + 1))

const spreadHue = (index = 0, attempt = 0, hueBase = rand(0, 360)) => {
  return normalizeHue(hueBase + index * 137.508 + attempt * 23 + rand(0, 48))
}

const randomSign = () => {
  return randomUnit() < 0.5 ? -1 : 1
}

const normalizeHue = (hue) => {
  return (hue % 360 + 360) % 360
}

const randomSeed = (index = 0, attempt = 0) => {
  const prefix = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${randInt(1000000, 999999999)}`
  return `${prefix}-${index}-${attempt}-${randInt(1000000, 999999999)}`
}

const oklch = (l, c, h) => {
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${normalizeHue(h).toFixed(1)})`
}

export const solidColorFromHue = (isDark, hue) => {
  return isDark
    ? oklch(rand(0.12, 0.26), rand(0.03, 0.15), hue)
    : oklch(rand(0.89, 0.965), rand(0.015, 0.07), hue)
}

const randomSolidColor = (isDark, index = 0, attempt = 0, hueBase) => {
  return solidColorFromHue(isDark, spreadHue(index, attempt, hueBase))
}

const normalizeSolids = (value) => {
  if (Array.isArray(value) || !Array.isArray(value?.dark) || !Array.isArray(value?.light)) return createDefaultSolids()
  if (value.version !== BACKGROUND_PRESET_STORAGE_VERSION) return createDefaultSolids()
  return {
    version: BACKGROUND_PRESET_STORAGE_VERSION,
    dark: normalizeStoredGroup(value.dark),
    light: normalizeStoredGroup(value.light),
  }
}

const createSolidsStore = () => {
  const initial = normalizeSolids(loadFromStorage(STORAGE_KEY_SOLIDS, null))
  const { subscribe, set, update } = persistedWritable(STORAGE_KEY_SOLIDS, initial, normalizeSolids)
  return {
    subscribe,
    addDark() { update((s) => s.dark.length >= BACKGROUND_PRESET_LIMIT ? s : { ...s, dark: addGeneratedItem(s.dark, (index, attempt, hueBase) => randomSolidColor(true, index, attempt, hueBase)) }) },
    addLight() { update((s) => s.light.length >= BACKGROUND_PRESET_LIMIT ? s : { ...s, light: addGeneratedItem(s.light, (index, attempt, hueBase) => randomSolidColor(false, index, attempt, hueBase)) }) },
    removeDark(idx) { update((s) => ({ ...s, dark: s.dark.filter((_, i) => i !== idx) })) },
    removeLight(idx) { update((s) => ({ ...s, light: s.light.filter((_, i) => i !== idx) })) },
    resetDark() { update((s) => ({ ...s, dark: createGeneratedGroup((index, attempt, hueBase) => randomSolidColor(true, index, attempt, hueBase)) })) },
    resetLight() { update((s) => ({ ...s, light: createGeneratedGroup((index, attempt, hueBase) => randomSolidColor(false, index, attempt, hueBase)) })) },
    reset() { set(createDefaultSolids()) },
  }
}

export const solidPresets = createSolidsStore()

// 渐变预设（暗色和亮色分开存储，各 18 个）
const STORAGE_KEY_GRADIENTS = 'newtab_gradients'
const createDefaultGradients = () => {
  return {
    version: BACKGROUND_PRESET_STORAGE_VERSION,
    dark: createGeneratedGroup((index, attempt, hueBase) => generateRandomGradient(true, index, attempt, hueBase)),
    light: createGeneratedGroup((index, attempt, hueBase) => generateRandomGradient(false, index, attempt, hueBase)),
  }
}

// 随机生成渐变（OKLCH），在线性、三色、径向、角向、叠加光斑几种形态中随机
export const gradientFromHue = (isDark, hue) => {
  const stop = (h) => isDark
    ? oklch(rand(0.18, 0.36), rand(0.08, 0.2), h)
    : oklch(rand(0.82, 0.96), rand(0.06, 0.17), h)
  const h2 = hue + randomSign() * rand(40, 160)
  const h3 = h2 + randomSign() * rand(30, 120)
  const angle = randInt(0, 359)
  const x = randInt(0, 100)
  const y = randInt(0, 100)
  const kind = randInt(0, 4)

  if (kind === 1) return `linear-gradient(${angle}deg, ${stop(hue)} 0%, ${stop(h2)} ${randInt(35, 65)}%, ${stop(h3)} 100%)`
  if (kind === 2) return `radial-gradient(circle at ${x}% ${y}%, ${stop(hue)} 0%, ${stop(h2)} 100%)`
  if (kind === 3) return `conic-gradient(from ${angle}deg at ${x}% ${y}%, ${stop(hue)}, ${stop(h2)}, ${stop(h3)}, ${stop(hue)})`
  if (kind === 4) return `radial-gradient(circle at ${x}% ${y}%, ${stop(h3)} 0%, transparent ${randInt(45, 75)}%), linear-gradient(${angle}deg, ${stop(hue)} 0%, ${stop(h2)} 100%)`
  return `linear-gradient(${angle}deg, ${stop(hue)} 0%, ${stop(h2)} 100%)`
}

export const generateRandomGradient = (isDark, index = 0, attempt = 0, hueBase) => {
  return gradientFromHue(isDark, spreadHue(index, attempt, hueBase))
}

const normalizeGradients = (value) => {
  if (Array.isArray(value) || !Array.isArray(value?.dark) || !Array.isArray(value?.light)) return createDefaultGradients()
  if (value.version !== BACKGROUND_PRESET_STORAGE_VERSION) return createDefaultGradients()
  return {
    version: BACKGROUND_PRESET_STORAGE_VERSION,
    dark: normalizeStoredGroup(value.dark),
    light: normalizeStoredGroup(value.light),
  }
}

const createGradientsStore = () => {
  const initial = normalizeGradients(loadFromStorage(STORAGE_KEY_GRADIENTS, null))
  const { subscribe, set, update } = persistedWritable(STORAGE_KEY_GRADIENTS, initial, normalizeGradients)
  return {
    subscribe,
    addDark() { update((s) => s.dark.length >= BACKGROUND_PRESET_LIMIT ? s : { ...s, dark: addGeneratedItem(s.dark, (index, attempt, hueBase) => generateRandomGradient(true, index, attempt, hueBase)) }) },
    addLight() { update((s) => s.light.length >= BACKGROUND_PRESET_LIMIT ? s : { ...s, light: addGeneratedItem(s.light, (index, attempt, hueBase) => generateRandomGradient(false, index, attempt, hueBase)) }) },
    removeDark(idx) { update((s) => ({ ...s, dark: s.dark.filter((_, i) => i !== idx) })) },
    removeLight(idx) { update((s) => ({ ...s, light: s.light.filter((_, i) => i !== idx) })) },
    resetDark() { update((s) => ({ ...s, dark: createGeneratedGroup((index, attempt, hueBase) => generateRandomGradient(true, index, attempt, hueBase)) })) },
    resetLight() { update((s) => ({ ...s, light: createGeneratedGroup((index, attempt, hueBase) => generateRandomGradient(false, index, attempt, hueBase)) })) },
    reset() { set(createDefaultGradients()) },
  }
}

export const gradientPresets = createGradientsStore()

// 动态背景预设（暗色和亮色分开存储，各 18 个）
const STORAGE_KEY_DYNAMICS = 'newtab_dynamics'
export const dynamicStyleKeys = [
  'aesthetic-fluid',
  'ambient-light',
  'big-blob',
  'blur-dot',
  'blur-gradient',
  'chaos-waves',
  'curve-gradient',
  'grid-array',
  'random-cubes',
  'step-gradient',
  'swirling-curves',
  'triangles-mosaic',
  'wavy-waves',
  'abstract-shape',
]

const fallbackDynamicColors = ['#f8fafc', '#dbeafe', '#c7d2fe', '#fbcfe8', '#fed7aa', '#dcfce7']

const getDynamicPresetKey = (preset) => {
  return [preset.style, preset.colors.join(','), preset.seed, preset.loop ? 1 : 0, JSON.stringify(preset.variant || {})].join('|')
}

const normalizeDynamicPreset = (preset, isDark) => {
  const fallback = generateRandomDynamic(isDark)
  if (!preset || typeof preset !== 'object') return fallback
  const style = dynamicStyleKeys.includes(preset.style) ? preset.style : fallback.style
  const colors = normalizeDynamicColors(preset.colors, isDark, fallback.colors)
  const seed = typeof preset.seed === 'string' && preset.seed
    ? preset.seed
    : Number.isFinite(Number(preset.seed))
      ? Number(preset.seed)
      : fallback.seed
  const loop = typeof preset.loop === 'boolean' ? preset.loop : true
  const variant = normalizeDynamicVariant(preset.variant || fallback.variant, style)
  return { style, colors, seed, loop, variant }
}

const normalizeDynamics = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return createDefaultDynamics()
  if (value.version !== BACKGROUND_PRESET_STORAGE_VERSION) return createDefaultDynamics()
  const darkSource = Array.isArray(value.dark) ? value.dark : []
  const lightSource = Array.isArray(value.light) ? value.light : []
  return {
    version: BACKGROUND_PRESET_STORAGE_VERSION,
    dark: normalizeStoredGroup(darkSource, (preset) => normalizeDynamicPreset(preset, true)),
    light: normalizeStoredGroup(lightSource, (preset) => normalizeDynamicPreset(preset, false)),
  }
}

const hslToHex = (h, s, l) => {
  const hue = normalizeHue(h)
  const a = s * Math.min(l, 1 - l)
  const toHex = (n) => {
    const k = (n + hue / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${toHex(0)}${toHex(8)}${toHex(4)}`
}

const getHexBrightness = (hex) => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!match) return null

  const r = parseInt(match[1], 16)
  const g = parseInt(match[2], 16)
  const b = parseInt(match[3], 16)
  return 0.299 * r + 0.587 * g + 0.114 * b
}

const normalizeDynamicColors = (colors, isDark, fallback) => {
  const list = Array.isArray(colors) && colors.length > 0 ? colors.slice(0, 6) : fallback
  const brightness = list.map(getHexBrightness).filter((value) => value !== null)
  if (brightness.length === 0) return list

  const min = Math.min(...brightness)
  const max = Math.max(...brightness)
  const avg = brightness.reduce((sum, value) => sum + value, 0) / brightness.length
  if (!isDark && min > 236 && avg > 242) return fallback
  if (isDark && max < 18 && avg < 14) return fallback

  return list
}

const generateDynamicColors = (isDark, hue) => {
  const hueStep = rand(24, 172)
  const lightnessShift = isDark ? rand(-0.12, 0.12) : rand(-0.08, 0.06)

  return Array.from({ length: 6 }, (_, colorIndex) => {
    const nextHue = hue + colorIndex * hueStep + rand(-45, 45)
    const saturation = isDark ? rand(0.34, 1) : rand(0.46, 0.98)
    const lightRange = isDark
      ? [0.10, 0.68]
      : colorIndex % 3 === 0
        ? [0.48, 0.72]
        : [0.58, 0.86]
    const lightness = isDark
      ? Math.min(0.76, Math.max(0.08, rand(lightRange[0], lightRange[1]) + lightnessShift))
      : Math.min(0.88, Math.max(0.44, rand(lightRange[0], lightRange[1]) + lightnessShift))
    return hslToHex(nextHue, saturation, lightness)
  })
}

const roundNumber = (value, precision = 3) => {
  return Number(value.toFixed(precision))
}

const dynamicUpdate = (option, min, max, precision = 3) => {
  return [option, roundNumber(rand(min, max), precision)]
}

const dynamicUpdateOptionsByStyle = {
  'aesthetic-fluid': new Set(['scale']),
  'ambient-light': new Set(['speed', 'pattern scale', 'edge blur']),
  'chaos-waves': new Set(['speed']),
  'curve-gradient': new Set(['speed', 'density', 'scale']),
  'grid-array': new Set(['scale', 'radius', 'borderwidth', 'rotateCanvas', 'rotateUnit', 'speed']),
  'step-gradient': new Set(['spacing']),
  'swirling-curves': new Set(['speed', 'density', 'scale']),
  'triangles-mosaic': new Set(['speed']),
  'abstract-shape': new Set(['wavy']),
}

const normalizeDynamicUpdates = (updates, style) => {
  const allowedOptions = dynamicUpdateOptionsByStyle[style]
  if (!allowedOptions || !Array.isArray(updates)) return []

  return updates
    .filter((item) => Array.isArray(item) && item.length >= 2)
    .map(([option, value]) => [String(option), value])
    .filter(([option]) => allowedOptions.has(option))
}

const createDynamicViewVariant = () => {
  return {
    frame: randInt(0, 420),
    rotate: 0,
    scale: roundNumber(rand(1, 1.04), 3),
    x: 0,
    y: 0,
    hue: roundNumber(rand(-36, 36), 2),
    saturate: roundNumber(rand(0.72, 1.48), 3),
    brightness: roundNumber(rand(0.78, 1.22), 3),
    contrast: roundNumber(rand(0.82, 1.28), 3),
  }
}

const createDynamicVariant = (style) => {
  const variant = {
    view: createDynamicViewVariant(),
    params: {},
    updates: [],
  }

  if (style === 'aesthetic-fluid') {
    variant.params = {
      radius_inner: roundNumber(rand(0.04, 0.28), 3),
      radius_outer: roundNumber(rand(0.14, 0.68), 3),
    }
    variant.updates.push(dynamicUpdate('scale', 0.04, 0.36))
    return variant
  }

  if (style === 'abstract-shape') {
    variant.params = { options: { noise: roundNumber(rand(0, 0.18), 3) } }
    variant.updates.push(dynamicUpdate('wavy', 1, 28))
    return variant
  }

  if (style === 'ambient-light') {
    variant.updates.push(
      ['speed', randInt(1, 10)],
      dynamicUpdate('pattern scale', 0.15, 1),
      dynamicUpdate('edge blur', 0.12, 1),
    )
    return variant
  }

  if (style === 'chaos-waves') {
    variant.updates.push(['speed', randInt(1, 20)])
    return variant
  }

  if (style === 'curve-gradient' || style === 'swirling-curves') {
    variant.updates.push(
      dynamicUpdate('speed', 0.35, 2.6),
      dynamicUpdate('scale', 0.55, 4.4),
      dynamicUpdate('density', 320, 2600, 0),
    )
    return variant
  }

  if (style === 'grid-array') {
    variant.updates.push(
      dynamicUpdate('scale', 38, 210, 0),
      dynamicUpdate('radius', 0, 0.32),
      dynamicUpdate('borderwidth', 0.002, 0.035),
      dynamicUpdate('rotateCanvas', -1.2, 1.2),
      dynamicUpdate('rotateUnit', -2.4, 2.4),
      ['speed', randInt(1, 10)],
    )
    return variant
  }

  if (style === 'step-gradient') {
    variant.updates.push(dynamicUpdate('spacing', 12, 120, 0))
    return variant
  }

  if (style === 'triangles-mosaic') {
    variant.updates.push(['speed', randInt(1, 10)])
    return variant
  }

  return variant
}

const normalizeDynamicViewVariant = (view) => {
  if (!view || typeof view !== 'object') return createDynamicViewVariant()
  return {
    frame: Number.isFinite(Number(view.frame)) ? Number(view.frame) : randInt(0, 420),
    rotate: Number.isFinite(Number(view.rotate)) ? Number(view.rotate) : 0,
    scale: Number.isFinite(Number(view.scale)) ? Number(view.scale) : 1.08,
    x: Number.isFinite(Number(view.x)) ? Number(view.x) : 0,
    y: Number.isFinite(Number(view.y)) ? Number(view.y) : 0,
    hue: Number.isFinite(Number(view.hue)) ? Number(view.hue) : 0,
    saturate: Number.isFinite(Number(view.saturate)) ? Number(view.saturate) : 1,
    brightness: Number.isFinite(Number(view.brightness)) ? Number(view.brightness) : 1,
    contrast: Number.isFinite(Number(view.contrast)) ? Number(view.contrast) : 1,
  }
}

const normalizeDynamicVariant = (variant, style) => {
  const fallback = createDynamicVariant(style)
  if (!variant || typeof variant !== 'object') return fallback

  const params = variant.params && typeof variant.params === 'object' ? variant.params : fallback.params
  const updates = Array.isArray(variant.updates)
    ? normalizeDynamicUpdates(variant.updates, style)
    : fallback.updates

  return {
    view: normalizeDynamicViewVariant(variant.view),
    params,
    updates,
  }
}

const shuffleItems = (items) => {
  const list = [...items]
  for (let i = list.length - 1; i > 0; i -= 1) {
    const nextIndex = randInt(0, i)
    const current = list[i]
    list[i] = list[nextIndex]
    list[nextIndex] = current
  }
  return list
}

const createDynamicStyleSequence = () => {
  const styles = []
  while (styles.length < BACKGROUND_PRESET_LIMIT) {
    styles.push(...shuffleItems(dynamicStyleKeys))
  }
  return styles.slice(0, BACKGROUND_PRESET_LIMIT)
}

const createDynamicGroup = (isDark) => {
  const styles = createDynamicStyleSequence()
  return createGeneratedGroup(
    (index, attempt, hueBase) => generateRandomDynamic(isDark, index, attempt, styles[index], hueBase),
    getDynamicPresetKey,
  )
}

const pickLeastUsedDynamicStyle = (list) => {
  const counts = new Map(dynamicStyleKeys.map((style) => [style, 0]))
  list.forEach((item) => {
    if (counts.has(item.style)) counts.set(item.style, counts.get(item.style) + 1)
  })
  const minCount = Math.min(...counts.values())
  const options = dynamicStyleKeys.filter((style) => counts.get(style) === minCount)
  return options[randInt(0, options.length - 1)]
}

export const dynamicFromHue = (isDark, hue, style = '', index = 0, attempt = 0) => {
  const nextStyle = style || dynamicStyleKeys[randInt(0, dynamicStyleKeys.length - 1)]
  return {
    style: nextStyle,
    colors: generateDynamicColors(isDark, hue),
    seed: randomSeed(index, attempt),
    loop: true,
    variant: createDynamicVariant(nextStyle),
  }
}

export const generateRandomDynamic = (isDark, index = 0, attempt = 0, style = '', hueBase) => {
  return dynamicFromHue(isDark, spreadHue(index, attempt, hueBase), style, index, attempt)
}

const createDefaultDynamics = () => {
  return {
    version: BACKGROUND_PRESET_STORAGE_VERSION,
    dark: createDynamicGroup(true),
    light: createDynamicGroup(false),
  }
}

export const getDynamicPreviewStyle = (preset) => {
  const colors = preset?.colors?.length ? preset.colors : fallbackDynamicColors
  const angle = preset?.style?.length ? 120 + (preset.style.length % 7) * 10 : 135
  return `background:linear-gradient(${angle}deg, ${colors.join(', ')})`
}

const createDynamicsStore = () => {
  const initial = normalizeDynamics(loadFromStorage(STORAGE_KEY_DYNAMICS, null))
  const { subscribe, set, update } = persistedWritable(STORAGE_KEY_DYNAMICS, initial, normalizeDynamics)
  return {
    subscribe,
    addDark() { update((s) => s.dark.length >= BACKGROUND_PRESET_LIMIT ? s : { ...s, dark: addGeneratedItem(s.dark, (index, attempt, hueBase) => generateRandomDynamic(true, index, attempt, pickLeastUsedDynamicStyle(s.dark), hueBase), getDynamicPresetKey) }) },
    addLight() { update((s) => s.light.length >= BACKGROUND_PRESET_LIMIT ? s : { ...s, light: addGeneratedItem(s.light, (index, attempt, hueBase) => generateRandomDynamic(false, index, attempt, pickLeastUsedDynamicStyle(s.light), hueBase), getDynamicPresetKey) }) },
    removeDark(idx) { update((s) => ({ ...s, dark: s.dark.filter((_, i) => i !== idx) })) },
    removeLight(idx) { update((s) => ({ ...s, light: s.light.filter((_, i) => i !== idx) })) },
    resetDark() { update((s) => ({ ...s, dark: createDynamicGroup(true) })) },
    resetLight() { update((s) => ({ ...s, light: createDynamicGroup(false) })) },
    reset() { set(createDefaultDynamics()) },
  }
}

export const dynamicPresets = createDynamicsStore()

// 背景配置
const STORAGE_KEY_BG = 'newtab_bg'
const BG_CONFIG_STORAGE_VERSION = 2
const randomScopeKeys = ['solid', 'gradient', 'image', 'dynamic']
const defaultRandomScopeKeys = ['solid', 'gradient', 'dynamic']

const normalizeRandomScopes = (value) => {
  if (Array.isArray(value)) {
    const scopes = value.filter((scope) => randomScopeKeys.includes(scope))
    return scopes.length > 0 ? scopes : defaultRandomScopeKeys
  }
  if (value === 'all') return defaultRandomScopeKeys
  if (randomScopeKeys.includes(value)) return [value]
  return defaultRandomScopeKeys
}

// 随机来源：generate 每次现场生成，presets 只在已有预设里抽
export const randomSourceKeys = ['generate', 'presets']

const normalizeRandomSource = (value) => {
  return randomSourceKeys.includes(value) ? value : 'generate'
}

const isAllRandomScopes = (value) => {
  return Array.isArray(value)
    && value.length === randomScopeKeys.length
    && randomScopeKeys.every((scope) => value.includes(scope))
}

const createBgConfigStore = () => {
  const hasStoredBackground = hasItem(STORAGE_KEY_BG)
  const initialBackgroundType = getInitialBackgroundType({ hasStoredBackground, hasExistingData: hadExistingNewtabData })
  const defaults = { version: BG_CONFIG_STORAGE_VERSION, type: initialBackgroundType || 'random', solidDarkId: 0, solidLightId: 0, gradientDarkId: 0, gradientLightId: 0, imageId: 0, dynamicDarkId: 0, dynamicLightId: 0, randomScopes: defaultRandomScopeKeys, randomSource: 'generate' }
  const initial = loadFromStorage(STORAGE_KEY_BG, defaults)
  // 旧字段迁移
  const { images, solid, solidId, gradientId, randomScope, ...rest } = { ...defaults, ...initial }
  const clean = { ...rest }
  const isLegacyConfig = initial?.version !== BG_CONFIG_STORAGE_VERSION
  const randomScopeValue = initial?.randomScopes !== undefined ? clean.randomScopes : randomScope
  clean.randomScopes = normalizeRandomScopes(randomScopeValue)
  clean.randomSource = normalizeRandomSource(clean.randomSource)
  if (isLegacyConfig && (randomScopeValue === 'all' || isAllRandomScopes(randomScopeValue))) {
    clean.randomScopes = defaultRandomScopeKeys
  }
  clean.version = BG_CONFIG_STORAGE_VERSION
  if (solidId !== undefined && clean.solidDarkId === 0 && clean.solidLightId === 0) {
    clean.solidDarkId = solidId
    clean.solidLightId = solidId
  }
  if (gradientId !== undefined && clean.gradientDarkId === 0 && clean.gradientLightId === 0) {
    clean.gradientDarkId = gradientId
    clean.gradientLightId = gradientId
  }
  const { subscribe, update } = persistedWritable(STORAGE_KEY_BG, clean)
  return {
    subscribe,
    set(key, val) { update((c) => ({ ...c, [key]: val })) },
  }
}

export const bgConfig = createBgConfigStore()

// 背景图片（IndexedDB Blob → objectURL）
import { getImages, saveImages } from './bgImages.js'

export const bgImages = writable([])
export const bgImageUrls = writable([])
// 背景图是否已从 IndexedDB 读出（读取失败也视为完成）
const bgImagesReady = writable(false)

// 每个 Blob 只创建一次对象 URL：保留的图片沿用原地址，背景不会闪；被删除的图片释放地址，避免内存泄漏
const bgImageUrlByBlob = new Map()

const setBgImageBlobs = (blobs) => {
  const nextUrls = blobs.map((blob) => {
    if (!bgImageUrlByBlob.has(blob)) bgImageUrlByBlob.set(blob, URL.createObjectURL(blob))
    return bgImageUrlByBlob.get(blob)
  })
  bgImages.set(blobs)
  bgImageUrls.set(nextUrls)
  for (const [blob, url] of bgImageUrlByBlob) {
    if (blobs.includes(blob)) continue
    URL.revokeObjectURL(url)
    bgImageUrlByBlob.delete(blob)
  }
}

export const saveBgImages = async (blobs) => {
  const nextBlobs = blobs.slice(0, BACKGROUND_PRESET_LIMIT)
  setBgImageBlobs(nextBlobs)
  await saveImages(nextBlobs)
}

getImages().then(async (raw) => {
  // 过滤掉旧的非 Blob 数据（如之前存的 base64 字符串）
  let blobs = (raw || []).filter((b) => b instanceof Blob)
  if (blobs.length > BACKGROUND_PRESET_LIMIT) {
    blobs = blobs.slice(0, BACKGROUND_PRESET_LIMIT)
    await saveImages(blobs)
  } else if (blobs.length !== raw.length) {
    await saveImages(blobs)
  }
  setBgImageBlobs(blobs)
}).finally(() => bgImagesReady.set(true))

const randomBgTrigger = writable(0)
let randomBgCache = null

// 随机背景历史跨标签页保存，避免新开标签页时又抽到相近的颜色或同一种动态样式
const STORAGE_KEY_RANDOM_BG_HISTORY = 'newtab_random_bg_history'
const RANDOM_HUE_HISTORY_LIMIT = 6
const RANDOM_STYLE_HISTORY_LIMIT = Math.ceil(dynamicStyleKeys.length / 2)

const loadRandomBgHistory = () => {
  const value = loadFromStorage(STORAGE_KEY_RANDOM_BG_HISTORY, null)
  return {
    hues: Array.isArray(value?.hues) ? value.hues.filter(Number.isFinite) : [],
    styles: Array.isArray(value?.styles) ? value.styles.filter((style) => dynamicStyleKeys.includes(style)) : [],
    imageKey: typeof value?.imageKey === 'string' ? value.imageKey : '',
    presetKeys: Array.isArray(value?.presetKeys) ? value.presetKeys.filter((key) => typeof key === 'string') : [],
  }
}

const getImageBackground = (url, index) => ({ key: `image:${index}`, style: `background-image:url(${url});background-size:cover;background-position:center`, light: false, dynamic: null })

// 从已有预设（以及上传的图片）里抽，并避开最近出现过的几个
const pickPresetBackground = (scopes, isDark, urls, presets) => {
  const history = loadRandomBgHistory()
  const tone = isDark ? 'dark' : 'light'
  const light = !isDark
  const candidates = []
  if (scopes.includes('solid')) {
    presets.solids[tone].forEach((color, index) => candidates.push({ key: `solid:${tone}:${index}`, style: `background:${color}`, light, dynamic: null }))
  }
  if (scopes.includes('gradient')) {
    presets.gradients[tone].forEach((css, index) => candidates.push({ key: `gradient:${tone}:${index}`, style: `background:${css}`, light, dynamic: null }))
  }
  if (scopes.includes('image')) {
    urls.forEach((url, index) => candidates.push(getImageBackground(url, index)))
  }
  if (scopes.includes('dynamic')) {
    presets.dynamics[tone].forEach((dynamic, index) => candidates.push({ key: `dynamic:${tone}:${index}`, style: 'background:transparent', light, dynamic }))
  }
  if (candidates.length === 0) return null

  const recentLimit = Math.min(8, Math.floor(candidates.length / 2))
  const key = pickFreshItem(candidates.map((candidate) => candidate.key), history.presetKeys.slice(0, recentLimit), randomUnit)
  history.presetKeys = pushRecent(history.presetKeys, key, 8)
  setItem(STORAGE_KEY_RANDOM_BG_HISTORY, history)
  return candidates.find((candidate) => candidate.key === key)
}

// 打开页面时现生成一个全新的背景，和预设无关
const createRandomBackground = (scopes, isDark, urls) => {
  const history = loadRandomBgHistory()
  const types = scopes.filter((scope) => scope !== 'image' || urls.length > 0)
  if (types.length === 0) return null

  const type = types[randInt(0, types.length - 1)]
  const light = !isDark
  let result

  if (type === 'image') {
    const candidates = urls.map(getImageBackground)
    result = pickRandomBackground(candidates, history.imageKey, true, randomUnit)
    history.imageKey = result.key
  } else {
    const hue = pickDistinctHue(history.hues, randomUnit)
    history.hues = pushRecent(history.hues, Math.round(hue), RANDOM_HUE_HISTORY_LIMIT)
    if (type === 'solid') {
      result = { key: `random:solid:${randomSeed()}`, style: `background:${solidColorFromHue(isDark, hue)}`, light, dynamic: null }
    } else if (type === 'gradient') {
      result = { key: `random:gradient:${randomSeed()}`, style: `background:${gradientFromHue(isDark, hue)}`, light, dynamic: null }
    } else {
      const style = pickFreshItem(dynamicStyleKeys, history.styles, randomUnit)
      history.styles = pushRecent(history.styles, style, RANDOM_STYLE_HISTORY_LIMIT)
      result = { key: `random:dynamic:${randomSeed()}`, style: 'background:transparent', light, dynamic: dynamicFromHue(isDark, hue, style) }
    }
  }

  setItem(STORAGE_KEY_RANDOM_BG_HISTORY, history)
  return result
}

export const refreshRandomBackground = () => {
  randomBgTrigger.update((value) => value + 1)
}

// 检测浏览器，获取默认新标签页背景色
const detectBrowserBg = () => {
  const ua = navigator.userAgent
  // 按优先级检测，特定浏览器在前，Chrome 兜底
  if (/Edg\//.test(ua))       return { light: '#ffffff', dark: '#2b2b2b' }   // Edge
  if (/OPR\//.test(ua))       return { light: '#ffffff', dark: '#1b1b1b' }   // Opera
  if (/Vivaldi\//.test(ua))   return { light: '#ffffff', dark: '#1e1e1e' }   // Vivaldi
  if (/YaBrowser\//.test(ua)) return { light: '#ffffff', dark: '#1e1e1e' }   // Yandex
  if (/QQBrowser\//.test(ua)) return { light: '#ffffff', dark: '#1b1b1b' }   // QQ 浏览器
  if (/360[SE]E/.test(ua))    return { light: '#ffffff', dark: '#1b1b1b' }   // 360 浏览器
  if (/Brave\//.test(ua) || navigator.brave) return { light: '#ffffff', dark: '#1e2029' } // Brave
  return { light: '#ffffff', dark: '#202124' } // Chrome（默认）
}
const browserDefaultBg = detectBrowserBg()

const isLightHex = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) > 128
}

const resolvedBg = derived([bgConfig, isDark, bgImageUrls, solidPresets, gradientPresets, dynamicPresets, randomBgTrigger, bgImagesReady], ([$bg, $dark, $urls, $solids, $grads, $dynamics, $trigger, $imagesReady]) => {
  if ($bg.type === 'none') {
    const color = $dark ? browserDefaultBg.dark : browserDefaultBg.light
    return { key: 'none', style: `background:${color}`, light: !$dark, dynamic: null }
  }

  if ($bg.type === 'solid') {
    const list = $dark ? $solids.dark : $solids.light
    const id = $dark ? $bg.solidDarkId : $bg.solidLightId
    const color = list[id] || list[0]
    if (!color) return { key: 'solid:none', style: '', light: !$dark, dynamic: null }
    return { key: `solid:${id}`, style: `background:${color}`, light: !$dark, dynamic: null }
  }

  if ($bg.type === 'gradient') {
    const list = $dark ? $grads.dark : $grads.light
    const id = $dark ? $bg.gradientDarkId : $bg.gradientLightId
    const css = list[id] || list[0]
    if (!css) return { key: 'gradient:none', style: '', light: !$dark, dynamic: null }
    return { key: `gradient:${id}`, style: `background:${css}`, light: !$dark, dynamic: null }
  }

  if ($bg.type === 'image' && $urls.length > 0) {
    const idx = Math.min($bg.imageId || 0, $urls.length - 1)
    return { key: `image:${idx}`, style: `background-image:url(${$urls[idx]});background-size:cover;background-position:center`, light: false, dynamic: null }
  }

  if ($bg.type === 'dynamic') {
    const list = $dark ? $dynamics.dark : $dynamics.light
    const id = $dark ? $bg.dynamicDarkId : $bg.dynamicLightId
    const dynamic = list[id] || list[0]
    if (!dynamic) return { key: 'dynamic:none', style: '', light: !$dark, dynamic: null }
    return { key: `dynamic:${id}`, style: 'background:transparent', light: !$dark, dynamic }
  }

  if ($bg.type === 'random') {
    const randomScopes = normalizeRandomScopes($bg.randomScopes || $bg.randomScope)
    // 背景图还没从 IndexedDB 读出时先不抽，否则图片永远抽不到，或读出后背景又跳一次
    if (randomScopes.includes('image') && !$imagesReady) {
      const color = $dark ? browserDefaultBg.dark : browserDefaultBg.light
      return { key: 'random:pending', style: `background:${color}`, light: !$dark, dynamic: null }
    }
    // 同一页面内沿用上次结果，只有手动刷新、切换亮暗或随机范围变化时才重新生成
    const randomSource = normalizeRandomSource($bg.randomSource)
    const usePresets = randomSource === 'presets'
    // 抽预设时预设被删除或重置也要重新抽，所以把预设本身也算进依赖
    const deps = [$trigger, $dark, randomSource, randomScopes.join(','), randomScopes.includes('image') ? $urls.join(',') : '', ...(usePresets ? [$solids, $grads, $dynamics] : [])]
    if (!randomBgCache || randomBgCache.deps.length !== deps.length || deps.some((dep, index) => dep !== randomBgCache.deps[index])) {
      const result = usePresets
        ? pickPresetBackground(randomScopes, $dark, $urls, { solids: $solids, gradients: $grads, dynamics: $dynamics })
        : createRandomBackground(randomScopes, $dark, $urls)
      randomBgCache = { deps, result }
    }
    if (!randomBgCache.result) {
      const color = $dark ? browserDefaultBg.dark : browserDefaultBg.light
      return { key: 'random:none', style: `background:${color}`, light: !$dark, dynamic: null }
    }
    return randomBgCache.result
  }

  const fallbackColor = $dark ? browserDefaultBg.dark : browserDefaultBg.light
  return { key: 'fallback', style: `background:${fallbackColor}`, light: !$dark, dynamic: null }
})

export const resolvedBgStyle = derived(resolvedBg, ($bg) => $bg.style)
export const bgIsLight = derived(resolvedBg, ($bg) => $bg.light)
export const activeDynamicBg = derived(resolvedBg, ($bg) => $bg.dynamic)

// 重置所有设置（保留站点数据、点击计数和背景图片）
export const resetAllSettings = async () => {
  const keepKeys = [STORAGE_KEY_SITES, STORAGE_KEY_CLICKS]
  const allKeys = storageKeys().filter(
    (k) => k.startsWith('newtab_') && !keepKeys.includes(k)
  )
  // 扩展存储是异步写入，删除完成后再刷新，避免刷新后读到旧设置
  await Promise.all(allKeys.map((k) => removeItem(k)))
  location.reload()
}
