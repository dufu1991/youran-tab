import { initStorage } from './lib/storage.js'
import './app.css'

// 各个 store 在模块加载时同步读取存储，所以要先把扩展存储读进内存（首次运行时顺带搬迁旧版 localStorage 数据），
// 再加载依赖 store 的模块并渲染
await initStorage()
await import('./start.js')
