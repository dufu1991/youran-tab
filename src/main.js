import { mount } from 'svelte'
import { initIconCache } from './lib/iconCache.js'
import App from './App.svelte'
import './app.css'

// 等图标缓存从 IndexedDB 加载进内存后再渲染，
// 否则首屏渲染时缓存尚未就绪，图标每次都会重新走网络请求。
// 缓存不可用时静默跳过，直接渲染。
await initIconCache().catch(() => {})

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
