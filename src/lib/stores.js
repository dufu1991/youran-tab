import { writable, derived } from 'svelte/store'

const STORAGE_KEY_SITES = 'newtab_sites'
const STORAGE_KEY_THEME = 'newtab_theme'
const STORAGE_KEY_MODE = 'newtab_mode'

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
  const initial = loadFromStorage(STORAGE_KEY_SITES, defaultSites)
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
      update((sites) => sites.filter((s) => s.id !== id))
    },
    edit(id, data) {
      update((sites) =>
        sites.map((s) => (s.id === id ? { ...s, ...data } : s))
      )
    },
    reset() {
      set(defaultSites)
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

// 搜索框显示引擎 logo
const STORAGE_KEY_ENGINE_LOGO = 'newtab_engine_logo'

function createShowEngineLogoStore() {
  const initial = loadFromStorage(STORAGE_KEY_ENGINE_LOGO, true)
  const { subscribe, set } = writable(initial)
  subscribe((v) => localStorage.setItem(STORAGE_KEY_ENGINE_LOGO, JSON.stringify(v)))
  return { subscribe, set }
}

export const showEngineLogo = createShowEngineLogoStore()

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
  const defaults = { default: 'top', bento: 'center', terminal: 'top', minimal: 'center' }
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

// 搜索引擎
const STORAGE_KEY_ENGINE = 'newtab_engine'

export const searchEngines = {
  google:     { name: 'Google',      url: 'https://www.google.com/search?q=',                    icon: 'engines/google-color.svg' },
  bing:       { name: 'Bing',        url: 'https://www.bing.com/search?q=',                      icon: 'engines/bing-color-icon.svg' },
  baidu:      { name: 'Baidu',       url: 'https://www.baidu.com/s?wd=',                         icon: 'engines/baidu-color.svg' },
  duckduckgo: { name: 'DuckDuckGo',  url: 'https://duckduckgo.com/?q=',                          icon: 'engines/duckduckgo-icon.svg' },
  yahoo:      { name: 'Yahoo',       url: 'https://search.yahoo.com/search?p=',                  icon: 'engines/yahoo-icon.svg' },
  yandex:     { name: 'Yandex',      url: 'https://yandex.com/search/?text=',                    icon: 'engines/yandex.svg' },
  brave:      { name: 'Brave',       url: 'https://search.brave.com/search?q=',                  icon: 'engines/icons8-brave-web-browser.svg' },
  perplexity: { name: 'Perplexity',  url: 'https://www.perplexity.ai/search?q=',                 icon: 'engines/perplexity-ai-icon.svg' },
}

function createEngineStore() {
  const initial = loadFromStorage(STORAGE_KEY_ENGINE, 'google')
  const { subscribe, set } = writable(initial)
  subscribe((v) => localStorage.setItem(STORAGE_KEY_ENGINE, JSON.stringify(v)))
  return { subscribe, set }
}

export const searchEngine = createEngineStore()

export function doSearch(query, engine) {
  const e = searchEngines[engine] || searchEngines.google
  window.open(e.url + encodeURIComponent(query), '_self')
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

// 纯色预设（暗色和亮色分开存储，各 12 个）
const STORAGE_KEY_SOLIDS = 'newtab_solids'
const defaultSolids = {
  dark: [
    '#1e1e2e', '#2d1b69', '#0d3b66', '#1b4332', '#5c2018', '#1b1b1b',
    '#2e1a47', '#1a3a2a', '#3b1f1f', '#1a2a3e', '#2a2a2a', '#1e2d3d',
  ],
  light: [
    '#f0f0f0', '#e8e0f0', '#d4e6f1', '#d5f5e3', '#fdebd0', '#fadbd8',
    '#f5e6ff', '#e0f0e8', '#fff0e0', '#e8f4fa', '#f5f5dc', '#fce4ec',
  ],
}

function randomSolidColor(isDark) {
  const h = Math.floor(Math.random() * 360)
  if (isDark) {
    const l = randInt(12, 25), c = randInt(5, 15)
    return `oklch(0.${l} 0.${String(c).padStart(2, '0')} ${h})`
  }
  const l = randInt(90, 96), c = randInt(2, 6)
  return `oklch(0.${l} 0.0${c} ${h})`
}

function createSolidsStore() {
  let initial = loadFromStorage(STORAGE_KEY_SOLIDS, defaultSolids)
  // 旧格式迁移：数组格式或缺少 dark/light 属性时重置
  if (Array.isArray(initial) || !initial.dark || !initial.light) initial = defaultSolids
  const { subscribe, set, update } = writable(initial)
  subscribe((v) => localStorage.setItem(STORAGE_KEY_SOLIDS, JSON.stringify(v)))
  return {
    subscribe,
    addDark() { update((s) => ({ ...s, dark: [...s.dark, randomSolidColor(true)] })) },
    addLight() { update((s) => ({ ...s, light: [...s.light, randomSolidColor(false)] })) },
    removeDark(idx) { update((s) => ({ ...s, dark: s.dark.filter((_, i) => i !== idx) })) },
    removeLight(idx) { update((s) => ({ ...s, light: s.light.filter((_, i) => i !== idx) })) },
    reset() { set(defaultSolids) },
  }
}

export const solidPresets = createSolidsStore()

// 渐变预设（暗色和亮色分开存储，各 12 个）
const STORAGE_KEY_GRADIENTS = 'newtab_gradients'
const defaultGradients = {
  dark: [
    'linear-gradient(135deg, oklch(0.28 0.16 280) 0%, oklch(0.18 0.20 340) 100%)',
    'linear-gradient(150deg, oklch(0.22 0.18 10) 0%, oklch(0.32 0.14 60) 100%)',
    'linear-gradient(160deg, oklch(0.18 0.14 190) 0%, oklch(0.28 0.20 250) 100%)',
    'linear-gradient(140deg, oklch(0.26 0.16 120) 0%, oklch(0.18 0.12 180) 100%)',
    'linear-gradient(135deg, oklch(0.30 0.22 30) 0%, oklch(0.20 0.16 80) 100%)',
    'linear-gradient(145deg, oklch(0.16 0.10 230) 0%, oklch(0.26 0.18 290) 100%)',
    'linear-gradient(130deg, oklch(0.32 0.20 310) 0%, oklch(0.20 0.14 240) 100%)',
    'linear-gradient(155deg, oklch(0.24 0.18 350) 0%, oklch(0.18 0.22 40) 100%)',
    'linear-gradient(165deg, oklch(0.22 0.16 100) 0%, oklch(0.30 0.20 160) 100%)',
    'linear-gradient(140deg, oklch(0.20 0.12 210) 0%, oklch(0.30 0.08 270) 100%)',
    'linear-gradient(125deg, oklch(0.28 0.20 50) 0%, oklch(0.18 0.16 110) 100%)',
    'linear-gradient(150deg, oklch(0.22 0.16 260) 0%, oklch(0.32 0.22 330) 100%)',
  ],
  light: [
    'linear-gradient(135deg, oklch(0.95 0.10 350) 0%, oklch(0.85 0.16 40) 100%)',
    'linear-gradient(150deg, oklch(0.90 0.14 90) 0%, oklch(0.82 0.12 160) 100%)',
    'linear-gradient(160deg, oklch(0.94 0.08 200) 0%, oklch(0.84 0.16 270) 100%)',
    'linear-gradient(140deg, oklch(0.92 0.12 20) 0%, oklch(0.84 0.18 80) 100%)',
    'linear-gradient(135deg, oklch(0.90 0.14 280) 0%, oklch(0.84 0.12 340) 100%)',
    'linear-gradient(145deg, oklch(0.94 0.08 170) 0%, oklch(0.84 0.16 230) 100%)',
    'linear-gradient(130deg, oklch(0.86 0.14 190) 0%, oklch(0.94 0.08 260) 100%)',
    'linear-gradient(155deg, oklch(0.90 0.12 120) 0%, oklch(0.82 0.16 180) 100%)',
    'linear-gradient(165deg, oklch(0.86 0.14 250) 0%, oklch(0.94 0.10 320) 100%)',
    'linear-gradient(140deg, oklch(0.92 0.14 40) 0%, oklch(0.84 0.12 100) 100%)',
    'linear-gradient(125deg, oklch(0.90 0.12 320) 0%, oklch(0.84 0.18 20) 100%)',
    'linear-gradient(150deg, oklch(0.94 0.10 140) 0%, oklch(0.84 0.16 210) 100%)',
  ],
}

// 随机生成渐变（OKLCH）
function rand(min, max) { return Math.random() * (max - min) + min }
function randInt(min, max) { return Math.floor(rand(min, max + 1)) }

export function generateRandomGradient(isDark) {
  const h1 = rand(0, 360), h2 = (h1 + rand(30, 80)) % 360
  const angle = randInt(120, 160)
  if (isDark) {
    return `linear-gradient(${angle}deg, oklch(${rand(0.20, 0.32).toFixed(2)} ${rand(0.10, 0.20).toFixed(2)} ${h1.toFixed(0)}) 0%, oklch(${rand(0.20, 0.35).toFixed(2)} ${rand(0.10, 0.18).toFixed(2)} ${h2.toFixed(0)}) 100%)`
  }
  return `linear-gradient(${angle}deg, oklch(${rand(0.90, 0.96).toFixed(2)} ${rand(0.08, 0.15).toFixed(2)} ${h1.toFixed(0)}) 0%, oklch(${rand(0.82, 0.88).toFixed(2)} ${rand(0.10, 0.18).toFixed(2)} ${h2.toFixed(0)}) 100%)`
}

function createGradientsStore() {
  let initial = loadFromStorage(STORAGE_KEY_GRADIENTS, defaultGradients)
  // 旧格式迁移：数组格式或缺少 dark/light 属性时重置
  if (Array.isArray(initial) || !initial.dark || !initial.light) initial = defaultGradients
  const { subscribe, set, update } = writable(initial)
  subscribe((v) => localStorage.setItem(STORAGE_KEY_GRADIENTS, JSON.stringify(v)))
  return {
    subscribe,
    addDark() { update((s) => ({ ...s, dark: [...s.dark, generateRandomGradient(true)] })) },
    addLight() { update((s) => ({ ...s, light: [...s.light, generateRandomGradient(false)] })) },
    removeDark(idx) { update((s) => ({ ...s, dark: s.dark.filter((_, i) => i !== idx) })) },
    removeLight(idx) { update((s) => ({ ...s, light: s.light.filter((_, i) => i !== idx) })) },
    reset() { set(defaultGradients) },
  }
}

export const gradientPresets = createGradientsStore()

// 背景配置
const STORAGE_KEY_BG = 'newtab_bg'

function createBgConfigStore() {
  const defaults = { type: 'none', solidDarkId: 0, solidLightId: 0, gradientDarkId: 0, gradientLightId: 0, imageId: 0, randomScope: 'all' }
  const initial = loadFromStorage(STORAGE_KEY_BG, defaults)
  // 旧字段迁移
  const { images, solid, solidId, gradientId, ...rest } = { ...defaults, ...initial }
  const clean = { ...rest }
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

getImages().then((raw) => {
  // 过滤掉旧的非 Blob 数据（如之前存的 base64 字符串）
  const blobs = (raw || []).filter((b) => b instanceof Blob)
  if (blobs.length !== raw.length) saveImages(blobs)
  bgImages.set(blobs)
  bgImageUrls.set(blobs.map((b) => URL.createObjectURL(b)))
})

const sessionSeed = Math.random()

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

const resolvedBg = derived([bgConfig, isDark, bgImageUrls, solidPresets, gradientPresets], ([$bg, $dark, $urls, $solids, $grads]) => {
  if ($bg.type === 'none') {
    const color = $dark ? browserDefaultBg.dark : browserDefaultBg.light
    return { style: `background:${color}`, light: !$dark }
  }

  if ($bg.type === 'solid') {
    const list = $dark ? $solids.dark : $solids.light
    const id = $dark ? $bg.solidDarkId : $bg.solidLightId
    const color = list[id] || list[0]
    if (!color) return { style: '', light: !$dark }
    return { style: `background:${color}`, light: !$dark }
  }

  if ($bg.type === 'gradient') {
    const list = $dark ? $grads.dark : $grads.light
    const id = $dark ? $bg.gradientDarkId : $bg.gradientLightId
    const css = list[id] || list[0]
    if (!css) return { style: '', light: !$dark }
    return { style: `background:${css}`, light: !$dark }
  }

  if ($bg.type === 'image' && $urls.length > 0) {
    const idx = Math.min($bg.imageId || 0, $urls.length - 1)
    return { style: `background-image:url(${$urls[idx]});background-size:cover;background-position:center`, light: false }
  }

  if ($bg.type === 'random') {
    const candidates = []
    if ($bg.randomScope === 'solid' || $bg.randomScope === 'all') {
      const list = $dark ? $solids.dark : $solids.light
      list.forEach((c) => candidates.push({ style: `background:${c}`, light: !$dark }))
    }
    if ($bg.randomScope === 'gradient' || $bg.randomScope === 'all') {
      const list = $dark ? $grads.dark : $grads.light
      list.forEach((css) => candidates.push({ style: `background:${css}`, light: !$dark }))
    }
    if (($bg.randomScope === 'image' || $bg.randomScope === 'all') && $urls.length > 0) {
      $urls.forEach((url) => candidates.push({ style: `background-image:url(${url});background-size:cover;background-position:center`, light: false }))
    }
    if (candidates.length === 0) {
      const color = $dark ? browserDefaultBg.dark : browserDefaultBg.light
      return { style: `background:${color}`, light: !$dark }
    }
    return candidates[Math.floor(sessionSeed * candidates.length)]
  }

  const fallbackColor = $dark ? browserDefaultBg.dark : browserDefaultBg.light
  return { style: `background:${fallbackColor}`, light: !$dark }
})

export const resolvedBgStyle = derived(resolvedBg, ($bg) => $bg.style)
export const bgIsLight = derived(resolvedBg, ($bg) => $bg.light)

// 重置所有设置（保留站点数据、点击计数和背景图片）
export function resetAllSettings() {
  const keepKeys = [STORAGE_KEY_SITES, STORAGE_KEY_CLICKS]
  const allKeys = Object.keys(localStorage).filter(
    (k) => k.startsWith('newtab_') && !keepKeys.includes(k)
  )
  allKeys.forEach((k) => localStorage.removeItem(k))
  location.reload()
}
