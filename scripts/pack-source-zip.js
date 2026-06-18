import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(scriptDir, '..')
const releaseDir = resolve(rootDir, 'release')
const outputPath = resolve(
  rootDir,
  process.env.SOURCE_ZIP_OUTPUT || 'release/youran-tab-source.zip'
)

const includeEntries = [
  'config',
  'index.html',
  'package.json',
  'README.md',
  'LICENSE',
  'public',
  'scripts',
  'src',
  'vite.config.js'
]

const existingEntries = includeEntries.filter((entry) => existsSync(resolve(rootDir, entry)))
const missingEntries = includeEntries.filter((entry) => !existingEntries.includes(entry))

if (existingEntries.length === 0) {
  throw new Error('未找到可用于源码压缩的文件或目录。')
}

mkdirSync(releaseDir, { recursive: true })
rmSync(outputPath, { force: true })

const zipArgs = [
  '-r',
  outputPath,
  ...existingEntries,
  '-x',
  '.DS_Store',
  '*/.DS_Store'
]

const result = spawnSync('zip', zipArgs, {
  cwd: rootDir,
  stdio: 'inherit'
})

if (result.status !== 0) {
  throw new Error(`源码压缩失败，退出码：${result.status ?? 'unknown'}`)
}

console.log(`已生成源码压缩包：${outputPath}`)

if (missingEntries.length > 0) {
  console.log(`以下路径不存在，已自动跳过：${missingEntries.join('、')}`)
}
