import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const browser = process.argv[2]
const outDir = process.argv[3]

if (!browser || !outDir) {
  console.error('Usage: node scripts/apply-browser-manifest.js <browser> <outDir>')
  process.exit(1)
}

const manifestPath = join(outDir, 'manifest.json')
const browserConfigPath = join('config', 'manifests', `${browser}.json`)
const packageJsonPath = join('package.json')

const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
const browserConfig = JSON.parse(readFileSync(browserConfigPath, 'utf-8'))
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

const nextManifest = {
  ...manifest,
  version: packageJson.version,
  ...browserConfig,
}

writeFileSync(manifestPath, JSON.stringify(nextManifest, null, 2))
console.log(`Applied ${browser} manifest config to ${manifestPath}`)
