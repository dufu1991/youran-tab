import { readFileSync, writeFileSync, cpSync, rmSync } from 'fs'

// 清理旧目录后复制 dist 到 dist-firefox
rmSync('dist-firefox', { recursive: true, force: true })
cpSync('dist', 'dist-firefox', { recursive: true })

// 读取 manifest 并添加 Firefox 专用字段
const manifest = JSON.parse(readFileSync('dist-firefox/manifest.json', 'utf-8'))
// Firefox 不支持 favicon 权限
manifest.permissions = (manifest.permissions || []).filter(p => p !== 'favicon')

manifest.browser_specific_settings = {
  gecko: {
    id: 'youran-tab@youran.dev',
    strict_min_version: '109.0',
    data_collection_permissions: {
      required: ['none'],
      optional: []
    }
  }
}
writeFileSync('dist-firefox/manifest.json', JSON.stringify(manifest, null, 2))
console.log('Firefox manifest generated.')
