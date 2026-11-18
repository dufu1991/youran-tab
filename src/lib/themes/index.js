// 主题组件按需加载：首屏只加载当前主题，切换主题时再加载对应组件
const themeLoaders = {
  default: () => import('./DefaultTheme.svelte'),
  bento: () => import('./BentoTheme.svelte'),
  terminal: () => import('./TerminalTheme.svelte'),
  minimal: () => import('./MinimalTheme.svelte'),
  glass: () => import('./GlassTheme.svelte'),
  bubble: () => import('./BubbleTheme.svelte'),
  pixel: () => import('./PixelTheme.svelte'),
  sketch: () => import('./SketchTheme.svelte'),
}

export const themeKeys = Object.keys(themeLoaders)

const loadedThemes = {}

// 未知主题名退回经典主题
export const resolveThemeKey = (key) => (themeLoaders[key] ? key : 'default')

// 已加载过的主题组件，未加载时返回 null
export const getLoadedTheme = (key) => loadedThemes[resolveThemeKey(key)] || null

export const loadTheme = async (key) => {
  const name = resolveThemeKey(key)
  loadedThemes[name] ??= (await themeLoaders[name]()).default
  return loadedThemes[name]
}
