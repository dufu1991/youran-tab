import { mount } from 'svelte'
import { initIconCache } from './lib/iconCache.js'
import App from './App.svelte'
import './app.css'

initIconCache()

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
