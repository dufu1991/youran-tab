import { writable, derived, get } from 'svelte/store'
import { normalizeSiteTree, removeItemFromTree, updateItemTree } from './folders.js'
import { SEARCH_ENGINES, AI_PROVIDERS, findTarget } from './searchProviders.js'
import { t } from './i18n.js'

const STORAGE_KEY_SITES = 'newtab_sites'
const STORAGE_KEY_THEME = 'newtab_theme'
const STORAGE_KEY_MODE = 'newtab_mode'
export const BACKGROUND_PRESET_LIMIT = 18
const BACKGROUND_PRESET_STORAGE_VERSION = 5

const defaultSites = [
  { id: '1', name: 'Google', url: 'https://google.com' },
]

function loadFromStorage(key, fallback) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

function createSitesStore() {
  const initial = normalizeSiteTree(loadFromStorage(STORAGE_KEY_SITES, defaultSites))
  const { subscribe, set, update } = writable(initial)

  subscribe((value) => {
    localStorage.setItem(STORAGE_KEY_SITES, JSON.stringify(value))
  })

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

function createThemeStore() {
  const initial = loadFromStorage(STORAGE_KEY_THEME, 'default')
  const { subscribe, set } = writable(initial)

  subscribe((value) => {
    localStorage.setItem(STORAGE_KEY_THEME, JSON.stringify(value))
  })

  return { subscribe, set }
}

export const sites = createSitesStore()
export const theme = createThemeStore()

function createModeStore() {
  const initial = loadFromStorage(STORAGE_KEY_MODE, 'auto')
  const { subscribe, set } = writable(initial)
  subscribe((value) => {
    localStorage.setItem(STORAGE_KEY_MODE, JSON.stringify(value))
  })
  return { subscribe, set }
}

export const mode = createModeStore()

export const isDark = derived(mode, ($mode) => {
  if ($mode === 'dark') return true
  if ($mode === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
})

export const showSettings = writable(false)
export const editMode = writable(false)

// 经典主题搜索框显示
const STORAGE_KEY_SEARCH_BAR = 'newtab_show_search'

function createShowSearchBarStore() {
  const initial = loadFromStorage(STORAGE_KEY_SEARCH_BAR, true)
  const { subscribe, set } = writable(initial)
  subscribe((v) => localStorage.setItem(STORAGE_KEY_SEARCH_BAR, JSON.stringify(v)))
  return { subscribe, set }
}

export const showSearchBar = createShowSearchBarStore()

// 显示站点标题
const STORAGE_KEY_SITE_TITLE = 'newtab_show_title'

function createShowSiteTitleStore() {
  const initial = loadFromStorage(STORAGE_KEY_SITE_TITLE, true)
  const { subscribe, set } = writable(initial)
  subscribe((v) => localStorage.setItem(STORAGE_KEY_SITE_TITLE, JSON.stringify(v)))
  return { subscribe, set }
}

export const showSiteTitle = createShowSiteTitleStore()

// 各主题垂直对齐
const STORAGE_KEY_ALIGN = 'newtab_align'

function createThemeAlignStore() {
  const defaults = { default: 'top', bento: 'center', terminal: 'top', minimal: 'center', glass: 'center', bubble: 'center', pixel: 'top', sketch: 'top' }
  const initial = loadFromStorage(STORAGE_KEY_ALIGN, defaults)
  const { subscribe, update } = writable({ ...defaults, ...initial })
  subscribe((v) => localStorage.setItem(STORAGE_KEY_ALIGN, JSON.stringify(v)))
  return {
    subscribe,
    set(theme, val) { update((c) => ({ ...c, [theme]: val })) },
  }
}

export const themeAlign = createThemeAlignStore()

// 经典主题配置
const STORAGE_KEY_DEFAULT = 'newtab_default'

function createDefaultConfigStore() {
  const defaults = { width: 800, cols: 6, radius: 12, cardOpacity: 50, cardBlur: 12, iconSize: 40 }
  const initial = loadFromStorage(STORAGE_KEY_DEFAULT, defaults)
  const { subscribe, update } = writable({ ...defaults, ...initial })
  subscribe((v) => localStorage.setItem(STORAGE_KEY_DEFAULT, JSON.stringify(v)))
  return {
    subscribe,
    set(key, val) { update((c) => ({ ...c, [key]: val })) },
  }
}

export const defaultConfig = createDefaultConfigStore()

// 玻璃主题配置
const STORAGE_KEY_GLASS = 'newtab_glass'

function createGlassConfigStore() {
  const defaults = { cols: 2 }
  const initial = loadFromStorage(STORAGE_KEY_GLASS, defaults)
  const { subscribe, update } = writable({ ...defaults, ...initial })
  subscribe((v) => localStorage.setItem(STORAGE_KEY_GLASS, JSON.stringify(v)))
  return {
    subscribe,
    set(key, val) { update((c) => ({ ...c, [key]: val })) },
  }
}

export const glassConfig = createGlassConfigStore()

// 气泡主题配置
const STORAGE_KEY_BUBBLE = 'newtab_bubble'

function createBubbleConfigStore() {
  const defaults = { layout: 'fixed', size: 80 }
  const initial = loadFromStorage(STORAGE_KEY_BUBBLE, defaults)
  const { subscribe, update } = writable({ ...defaults, ...initial })
  subscribe((v) => localStorage.setItem(STORAGE_KEY_BUBBLE, JSON.stringify(v)))
  return {
    subscribe,
    set(key, val) { update((c) => ({ ...c, [key]: val })) },
  }
}

export const bubbleConfig = createBubbleConfigStore()

// 终端自定义设置
const STORAGE_KEY_TERM = 'newtab_terminal'

function createTerminalConfigStore() {
  const defaults = { prompt: '$', color: 'green', width: 1000, cursor: 'bar' }
  const initial = loadFromStorage(STORAGE_KEY_TERM, defaults)
  const { subscribe, set, update } = writable({ ...defaults, ...initial })
  subscribe((v) => localStorage.setItem(STORAGE_KEY_TERM, JSON.stringify(v)))
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

  const aiList = Array.isArray(config.enabledAi) ? config.enabledAi : defaults.enabledAi
  config.enabledAi = aiList.filter((id) => aiIds.has(id))

  if (config.defaultMode !== 'search' && config.defaultMode !== 'ai') config.defaultMode = defaults.defaultMode
  if (config.defaultMode === 'ai' && config.enabledAi.length === 0) config.defaultMode = 'search'
  if (!config.enabledEngines.includes(config.defaultEngine)) config.defaultEngine = config.enabledEngines[0]
  if (!config.enabledAi.includes(config.defaultAi)) config.defaultAi = config.enabledAi[0] || defaults.defaultAi

  return config
}

const createSearchConfigStore = () => {
  const initial = normalizeSearchConfig(loadFromStorage(STORAGE_KEY_SEARCH, null))
  const { subscribe, set, update } = writable(initial)
  subscribe((v) => localStorage.setItem(STORAGE_KEY_SEARCH, JSON.stringify(v)))
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
export function doSearch(query) {
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

function createClickCountStore() {
  const initial = loadFromStorage(STORAGE_KEY_CLICKS, {})
  const { subscribe, update } = writable(initial)
  subscribe((v) => localStorage.setItem(STORAGE_KEY_CLICKS, JSON.stringify(v)))
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

function createBentoConfigStore() {
  const defaults = { width: 800, gap: 12, radius: 12, cols: 4, fixed: false, cardOpacity: 50, cardBlur: 12, iconSize: 40 }
  const initial = loadFromStorage(STORAGE_KEY_BENTO, defaults)
  const { subscribe, update } = writable({ ...defaults, ...initial })
  subscribe((v) => localStorage.setItem(STORAGE_KEY_BENTO, JSON.stringify(v)))
  return {
    subscribe,
    set(key, val) { update((c) => ({ ...c, [key]: val })) },
  }
}

export const bentoConfig = createBentoConfigStore()

function getPresetKey(item) {
  return typeof item === 'string' ? item : JSON.stringify(item)
}

function appendGeneratedItem(list, keys, generator, index, getKey = getPresetKey) {
  let lastItem

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const item = generator(index, attempt)
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

function completeGeneratedGroup(list, generator, getKey = getPresetKey) {
  const keys = new Set(list.map(getKey))

  while (list.length < BACKGROUND_PRESET_LIMIT) {
    appendGeneratedItem(list, keys, generator, list.length, getKey)
  }

  return list
}

function addGeneratedItem(list, generator, getKey = getPresetKey) {
  const next = [...list]
  const keys = new Set(next.map(getKey))
  appendGeneratedItem(next, keys, generator, next.length, getKey)
  return next
}

function createGeneratedGroup(generator, getKey = getPresetKey) {
  return completeGeneratedGroup([], generator, getKey)
}

function normalizeGeneratedGroup(source, generator, fillToLimit, normalizeItem = (item) => item) {
  const list = Array.isArray(source)
    ? source.slice(0, BACKGROUND_PRESET_LIMIT).map(normalizeItem)
    : []

  if (fillToLimit && list.length > 0 && list.length < BACKGROUND_PRESET_LIMIT) {
    return completeGeneratedGroup([...list], generator)
  }

  return list
}

// 纯色预设（暗色和亮色分开存储，各 18 个）
const STORAGE_KEY_SOLIDS = 'newtab_solids'
function createDefaultSolids() {
  return {
    version: BACKGROUND_PRESET_STORAGE_VERSION,
    dark: createGeneratedGroup((index, attempt) => randomSolidColor(true, index, attempt)),
    light: createGeneratedGroup((index, attempt) => randomSolidColor(false, index, attempt)),
  }
}

function randomUnit() {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1)
    globalThis.crypto.getRandomValues(values)
    return values[0] / 4294967296
  }

  return Math.random()
}

function rand(min, max) { return randomUnit() * (max - min) + min }
function randInt(min, max) { return Math.floor(rand(min, max + 1)) }

function spreadHue(index = randInt(0, BACKGROUND_PRESET_LIMIT - 1), attempt = 0) {
  return (index * 137.508 + attempt * 23 + rand(0, 48)) % 360
}

function normalizeHue(hue) {
  return (hue % 360 + 360) % 360
}

function randomSeed(index = 0, attempt = 0) {
  const prefix = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${randInt(1000000, 999999999)}`
  return `${prefix}-${index}-${attempt}-${randInt(1000000, 999999999)}`
}

function randomSolidColor(isDark, index = 0, attempt = 0) {
  const h = Math.round(spreadHue(index, attempt))
  if (isDark) {
    const l = randInt(12, 25), c = randInt(5, 15)
    return `oklch(0.${l} 0.${String(c).padStart(2, '0')} ${h})`
  }
  const l = randInt(90, 96), c = randInt(2, 6)
  return `oklch(0.${l} 0.0${c} ${h})`
}

function normalizeSolids(value) {
  if (Array.isArray(value) || !Array.isArray(value?.dark) || !Array.isArray(value?.light)) return createDefaultSolids()
  if (value.version !== BACKGROUND_PRESET_STORAGE_VERSION) return createDefaultSolids()
  const fillToLimit = value.version !== BACKGROUND_PRESET_STORAGE_VERSION
  return {
    version: BACKGROUND_PRESET_STORAGE_VERSION,
    dark: normalizeGeneratedGroup(value.dark, (index, attempt) => randomSolidColor(true, index, attempt), fillToLimit),
    light: normalizeGeneratedGroup(value.light, (index, attempt) => randomSolidColor(false, index, attempt), fillToLimit),
  }
}

function createSolidsStore() {
  const initial = normalizeSolids(loadFromStorage(STORAGE_KEY_SOLIDS, null))
  const { subscribe, set, update } = writable(initial)
  subscribe((v) => localStorage.setItem(STORAGE_KEY_SOLIDS, JSON.stringify(v)))
  return {
    subscribe,
    addDark() { update((s) => s.dark.length >= BACKGROUND_PRESET_LIMIT ? s : { ...s, dark: addGeneratedItem(s.dark, (index, attempt) => randomSolidColor(true, index, attempt)) }) },
    addLight() { update((s) => s.light.length >= BACKGROUND_PRESET_LIMIT ? s : { ...s, light: addGeneratedItem(s.light, (index, attempt) => randomSolidColor(false, index, attempt)) }) },
    removeDark(idx) { update((s) => ({ ...s, dark: s.dark.filter((_, i) => i !== idx) })) },
    removeLight(idx) { update((s) => ({ ...s, light: s.light.filter((_, i) => i !== idx) })) },
    resetDark() { update((s) => ({ ...s, dark: createGeneratedGroup((index, attempt) => randomSolidColor(true, index, attempt)) })) },
    resetLight() { update((s) => ({ ...s, light: createGeneratedGroup((index, attempt) => randomSolidColor(false, index, attempt)) })) },
    reset() { set(createDefaultSolids()) },
  }
}

export const solidPresets = createSolidsStore()

// 渐变预设（暗色和亮色分开存储，各 18 个）
const STORAGE_KEY_GRADIENTS = 'newtab_gradients'
function createDefaultGradients() {
  return {
    version: BACKGROUND_PRESET_STORAGE_VERSION,
    dark: createGeneratedGroup((index, attempt) => generateRandomGradient(true, index, attempt)),
    light: createGeneratedGroup((index, attempt) => generateRandomGradient(false, index, attempt)),
  }
}

// 随机生成渐变（OKLCH）
export function generateRandomGradient(isDark, index = 0, attempt = 0) {
  const h1 = spreadHue(index, attempt)
  const h2 = (h1 + rand(56, 148) + attempt * 11) % 360
  const angle = Math.round((115 + index * 17 + attempt * 7 + rand(0, 34)) % 180)
  if (isDark) {
    return `linear-gradient(${angle}deg, oklch(${rand(0.20, 0.32).toFixed(2)} ${rand(0.10, 0.20).toFixed(2)} ${h1.toFixed(0)}) 0%, oklch(${rand(0.20, 0.35).toFixed(2)} ${rand(0.10, 0.18).toFixed(2)} ${h2.toFixed(0)}) 100%)`
  }
  return `linear-gradient(${angle}deg, oklch(${rand(0.90, 0.96).toFixed(2)} ${rand(0.08, 0.15).toFixed(2)} ${h1.toFixed(0)}) 0%, oklch(${rand(0.82, 0.88).toFixed(2)} ${rand(0.10, 0.18).toFixed(2)} ${h2.toFixed(0)}) 100%)`
}

function normalizeGradients(value) {
  if (Array.isArray(value) || !Array.isArray(value?.dark) || !Array.isArray(value?.light)) return createDefaultGradients()
  if (value.version !== BACKGROUND_PRESET_STORAGE_VERSION) return createDefaultGradients()
  const fillToLimit = value.version !== BACKGROUND_PRESET_STORAGE_VERSION
  return {
    version: BACKGROUND_PRESET_STORAGE_VERSION,
    dark: normalizeGeneratedGroup(value.dark, (index, attempt) => generateRandomGradient(true, index, attempt), fillToLimit),
    light: normalizeGeneratedGroup(value.light, (index, attempt) => generateRandomGradient(false, index, attempt), fillToLimit),
  }
}

function createGradientsStore() {
  const initial = normalizeGradients(loadFromStorage(STORAGE_KEY_GRADIENTS, null))
  const { subscribe, set, update } = writable(initial)
  subscribe((v) => localStorage.setItem(STORAGE_KEY_GRADIENTS, JSON.stringify(v)))
  return {
    subscribe,
    addDark() { update((s) => s.dark.length >= BACKGROUND_PRESET_LIMIT ? s : { ...s, dark: addGeneratedItem(s.dark, (index, attempt) => generateRandomGradient(true, index, attempt)) }) },
    addLight() { update((s) => s.light.length >= BACKGROUND_PRESET_LIMIT ? s : { ...s, light: addGeneratedItem(s.light, (index, attempt) => generateRandomGradient(false, index, attempt)) }) },
    removeDark(idx) { update((s) => ({ ...s, dark: s.dark.filter((_, i) => i !== idx) })) },
    removeLight(idx) { update((s) => ({ ...s, light: s.light.filter((_, i) => i !== idx) })) },
    resetDark() { update((s) => ({ ...s, dark: createGeneratedGroup((index, attempt) => generateRandomGradient(true, index, attempt)) })) },
    resetLight() { update((s) => ({ ...s, light: createGeneratedGroup((index, attempt) => generateRandomGradient(false, index, attempt)) })) },
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

function getDynamicPresetKey(preset) {
  return [preset.style, preset.colors.join(','), preset.seed, preset.loop ? 1 : 0, JSON.stringify(preset.variant || {})].join('|')
}

function normalizeDynamicPreset(preset, isDark) {
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

function normalizeDynamics(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return createDefaultDynamics()
  if (value.version !== BACKGROUND_PRESET_STORAGE_VERSION) return createDefaultDynamics()
  const darkSource = Array.isArray(value.dark) ? value.dark : []
  const lightSource = Array.isArray(value.light) ? value.light : []
  const fillToLimit = value.version !== BACKGROUND_PRESET_STORAGE_VERSION
  return {
    version: BACKGROUND_PRESET_STORAGE_VERSION,
    dark: normalizeGeneratedGroup(darkSource, (index, attempt) => generateRandomDynamic(true, index, attempt), fillToLimit, (preset) => normalizeDynamicPreset(preset, true)),
    light: normalizeGeneratedGroup(lightSource, (index, attempt) => generateRandomDynamic(false, index, attempt), fillToLimit, (preset) => normalizeDynamicPreset(preset, false)),
  }
}

function hslToHex(h, s, l) {
  const hue = normalizeHue(h)
  const a = s * Math.min(l, 1 - l)
  const toHex = (n) => {
    const k = (n + hue / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${toHex(0)}${toHex(8)}${toHex(4)}`
}

function getHexBrightness(hex) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!match) return null

  const r = parseInt(match[1], 16)
  const g = parseInt(match[2], 16)
  const b = parseInt(match[3], 16)
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function normalizeDynamicColors(colors, isDark, fallback) {
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

function generateDynamicColors(isDark, index = 0, attempt = 0) {
  const hue = spreadHue(index, attempt)
  const hueStep = rand(24, 172)
  const lightnessShift = isDark ? rand(-0.12, 0.12) : rand(-0.08, 0.06)

  return Array.from({ length: 6 }, (_, colorIndex) => {
    const nextHue = hue + colorIndex * hueStep + rand(-45, 45) + attempt * 17
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

function roundNumber(value, precision = 3) {
  return Number(value.toFixed(precision))
}

function dynamicUpdate(option, min, max, precision = 3) {
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

function normalizeDynamicUpdates(updates, style) {
  const allowedOptions = dynamicUpdateOptionsByStyle[style]
  if (!allowedOptions || !Array.isArray(updates)) return []

  return updates
    .filter((item) => Array.isArray(item) && item.length >= 2)
    .map(([option, value]) => [String(option), value])
    .filter(([option]) => allowedOptions.has(option))
}

function createDynamicViewVariant() {
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

function createDynamicVariant(style) {
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

function normalizeDynamicViewVariant(view) {
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

function normalizeDynamicVariant(variant, style) {
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

function shuffleItems(items) {
  const list = [...items]
  for (let i = list.length - 1; i > 0; i -= 1) {
    const nextIndex = randInt(0, i)
    const current = list[i]
    list[i] = list[nextIndex]
    list[nextIndex] = current
  }
  return list
}

function createDynamicStyleSequence() {
  const styles = []
  while (styles.length < BACKGROUND_PRESET_LIMIT) {
    styles.push(...shuffleItems(dynamicStyleKeys))
  }
  return styles.slice(0, BACKGROUND_PRESET_LIMIT)
}

function createDynamicGroup(isDark) {
  const styles = createDynamicStyleSequence()
  return createGeneratedGroup(
    (index, attempt) => generateRandomDynamic(isDark, index, attempt, styles[index]),
    getDynamicPresetKey,
  )
}

function pickLeastUsedDynamicStyle(list) {
  const counts = new Map(dynamicStyleKeys.map((style) => [style, 0]))
  list.forEach((item) => {
    if (counts.has(item.style)) counts.set(item.style, counts.get(item.style) + 1)
  })
  const minCount = Math.min(...counts.values())
  const options = dynamicStyleKeys.filter((style) => counts.get(style) === minCount)
  return options[randInt(0, options.length - 1)]
}

export function generateRandomDynamic(isDark, index = 0, attempt = 0, style = '') {
  const nextStyle = style || dynamicStyleKeys[randInt(0, dynamicStyleKeys.length - 1)]
  return {
    style: nextStyle,
    colors: generateDynamicColors(isDark, index, attempt),
    seed: randomSeed(index, attempt),
    loop: true,
    variant: createDynamicVariant(nextStyle),
  }
}

function createDefaultDynamics() {
  return {
    version: BACKGROUND_PRESET_STORAGE_VERSION,
    dark: createDynamicGroup(true),
    light: createDynamicGroup(false),
  }
}

export function getDynamicPreviewStyle(preset) {
  const colors = preset?.colors?.length ? preset.colors : fallbackDynamicColors
  const angle = preset?.style?.length ? 120 + (preset.style.length % 7) * 10 : 135
  return `background:linear-gradient(${angle}deg, ${colors.join(', ')})`
}

function createDynamicsStore() {
  const initial = normalizeDynamics(loadFromStorage(STORAGE_KEY_DYNAMICS, null))
  const { subscribe, set, update } = writable(initial)
  subscribe((v) => localStorage.setItem(STORAGE_KEY_DYNAMICS, JSON.stringify(v)))
  return {
    subscribe,
    addDark() { update((s) => s.dark.length >= BACKGROUND_PRESET_LIMIT ? s : { ...s, dark: addGeneratedItem(s.dark, (index, attempt) => generateRandomDynamic(true, index, attempt, pickLeastUsedDynamicStyle(s.dark)), getDynamicPresetKey) }) },
    addLight() { update((s) => s.light.length >= BACKGROUND_PRESET_LIMIT ? s : { ...s, light: addGeneratedItem(s.light, (index, attempt) => generateRandomDynamic(false, index, attempt, pickLeastUsedDynamicStyle(s.light)), getDynamicPresetKey) }) },
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

function normalizeRandomScopes(value) {
  if (Array.isArray(value)) {
    const scopes = value.filter((scope) => randomScopeKeys.includes(scope))
    return scopes.length > 0 ? scopes : defaultRandomScopeKeys
  }
  if (value === 'all') return defaultRandomScopeKeys
  if (randomScopeKeys.includes(value)) return [value]
  return defaultRandomScopeKeys
}

function isAllRandomScopes(value) {
  return Array.isArray(value)
    && value.length === randomScopeKeys.length
    && randomScopeKeys.every((scope) => value.includes(scope))
}

function createBgConfigStore() {
  const defaults = { version: BG_CONFIG_STORAGE_VERSION, type: 'none', solidDarkId: 0, solidLightId: 0, gradientDarkId: 0, gradientLightId: 0, imageId: 0, dynamicDarkId: 0, dynamicLightId: 0, randomScopes: defaultRandomScopeKeys }
  const initial = loadFromStorage(STORAGE_KEY_BG, defaults)
  // 旧字段迁移
  const { images, solid, solidId, gradientId, randomScope, ...rest } = { ...defaults, ...initial }
  const clean = { ...rest }
  const isLegacyConfig = initial?.version !== BG_CONFIG_STORAGE_VERSION
  const randomScopeValue = initial?.randomScopes !== undefined ? clean.randomScopes : randomScope
  clean.randomScopes = normalizeRandomScopes(randomScopeValue)
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
  const { subscribe, update } = writable(clean)
  subscribe((v) => localStorage.setItem(STORAGE_KEY_BG, JSON.stringify(v)))
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

export async function saveBgImages(blobs) {
  const nextBlobs = blobs.slice(0, BACKGROUND_PRESET_LIMIT)
  bgImages.set(nextBlobs)
  bgImageUrls.set(nextBlobs.map((b) => URL.createObjectURL(b)))
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
  bgImages.set(blobs)
  bgImageUrls.set(blobs.map((b) => URL.createObjectURL(b)))
})

const randomBgTrigger = writable(0)
let lastRandomBgKey = ''

export function refreshRandomBackground() {
  randomBgTrigger.update((value) => value + 1)
}

// 检测浏览器，获取默认新标签页背景色
function detectBrowserBg() {
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

function isLightHex(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) > 128
}

const resolvedBg = derived([bgConfig, isDark, bgImageUrls, solidPresets, gradientPresets, dynamicPresets, randomBgTrigger], ([$bg, $dark, $urls, $solids, $grads, $dynamics]) => {
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
    const candidates = []
    const randomScopes = normalizeRandomScopes($bg.randomScopes || $bg.randomScope)
    if (randomScopes.includes('solid')) {
      const list = $dark ? $solids.dark : $solids.light
      list.forEach((c, index) => candidates.push({ key: `solid:${index}`, style: `background:${c}`, light: !$dark, dynamic: null }))
    }
    if (randomScopes.includes('gradient')) {
      const list = $dark ? $grads.dark : $grads.light
      list.forEach((css, index) => candidates.push({ key: `gradient:${index}`, style: `background:${css}`, light: !$dark, dynamic: null }))
    }
    if (randomScopes.includes('image') && $urls.length > 0) {
      $urls.forEach((url, index) => candidates.push({ key: `image:${index}`, style: `background-image:url(${url});background-size:cover;background-position:center`, light: false, dynamic: null }))
    }
    if (randomScopes.includes('dynamic')) {
      const list = $dark ? $dynamics.dark : $dynamics.light
      list.forEach((dynamic, index) => candidates.push({ key: `dynamic:${index}`, style: 'background:transparent', light: !$dark, dynamic }))
    }
    if (candidates.length === 0) {
      const color = $dark ? browserDefaultBg.dark : browserDefaultBg.light
      return { key: 'random:none', style: `background:${color}`, light: !$dark, dynamic: null }
    }
    const pool = candidates.length > 1
      ? candidates.filter((candidate) => candidate.key !== lastRandomBgKey)
      : candidates
    const next = pool[randInt(0, pool.length - 1)] || candidates[0]
    lastRandomBgKey = next.key
    return next
  }

  const fallbackColor = $dark ? browserDefaultBg.dark : browserDefaultBg.light
  return { key: 'fallback', style: `background:${fallbackColor}`, light: !$dark, dynamic: null }
})

export const resolvedBgStyle = derived(resolvedBg, ($bg) => $bg.style)
export const bgIsLight = derived(resolvedBg, ($bg) => $bg.light)
export const activeDynamicBg = derived(resolvedBg, ($bg) => $bg.dynamic)

// 重置所有设置（保留站点数据、点击计数和背景图片）
export function resetAllSettings() {
  const keepKeys = [STORAGE_KEY_SITES, STORAGE_KEY_CLICKS]
  const allKeys = Object.keys(localStorage).filter(
    (k) => k.startsWith('newtab_') && !keepKeys.includes(k)
  )
  allKeys.forEach((k) => localStorage.removeItem(k))
  location.reload()
}
