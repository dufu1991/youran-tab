import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

// color4bg 内置的 seedrandom 带有 Node 与 AMD 分支（module.exports、require('crypto')），
// 浏览器里不会执行到这些分支，项目也会用自己的 Math.seedrandom 覆盖它，因此只屏蔽这个文件的已知警告，
// 其他警告照常输出
const isKnownColor4bgSeedRandomLog = (log) => {
  const source = `${log.id || ''} ${log.message || ''}`
  return source.includes('color4bg') && source.includes('SeedRandom')
}

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  base: './',
  build: {
    outDir: 'dist',
    rolldownOptions: {
      input: 'index.html',
      onLog: (level, log, handler) => {
        if (isKnownColor4bgSeedRandomLog(log)) return
        handler(level, log)
      },
    },
  },
})
