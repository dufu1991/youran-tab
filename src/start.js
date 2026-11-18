import { mount } from 'svelte'
import { get } from 'svelte/store'
import { initIconCache } from './lib/iconCache.js'
import { isDark, theme } from './lib/stores.js'
import { currentLocale, loadLocale } from './lib/i18n.js'
import { loadTheme } from './lib/themes/index.js'
import App from './App.svelte'

// 组件的明暗样式使用 dark: 变体，依赖 <html> 上的 dark 类；渲染前先设好，避免暗色模式下首帧闪成亮色
document.documentElement.classList.toggle('dark', get(isDark))

// 渲染前并行准备好首屏需要的内容：
// - 图标缓存从 IndexedDB 加载进内存，否则首屏图标会重新走网络请求；缓存不可用时静默跳过
// - 当前主题组件与当前语言文案，它们按需加载，提前加载可避免首屏闪烁
await Promise.all([
  initIconCache().catch(() => {}),
  loadTheme(get(theme)),
  loadLocale(get(currentLocale)),
])

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
