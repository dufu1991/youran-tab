import { describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { KNOWN_SITE_URLS_KEY, PENDING_SITES_KEY, SITE_FOLDERS_KEY, normalizeSiteUrl } from './pendingSites.js'

// public/background.js 不经过打包，只能复制页面里的常量；这里保证两边不会改漏
const root = join(import.meta.dir, '../..')
const backgroundSource = readFileSync(join(root, 'public/background.js'), 'utf8')

const readConst = (name) => backgroundSource.match(new RegExp(`const ${name} = (.+)`))?.[1].trim()

describe('后台脚本与新标签页保持一致', () => {
  test('扩展存储键名相同', () => {
    expect(readConst('PENDING_SITES_KEY')).toBe(`'${PENDING_SITES_KEY}'`)
    expect(readConst('KNOWN_SITE_URLS_KEY')).toBe(`'${KNOWN_SITE_URLS_KEY}'`)
    expect(readConst('SITE_FOLDERS_KEY')).toBe(`'${SITE_FOLDERS_KEY}'`)
  })

  test('网址规范化逻辑相同', () => {
    const backgroundNormalize = new Function(`return ${readConst('normalizeSiteUrl')}`)()
    const samples = ['https://Example.com/', 'https://example.com/a//', 'HTTP://A.B/C?x=1', 'https://example.com']
    for (const url of samples) {
      expect(backgroundNormalize(url)).toBe(normalizeSiteUrl(url))
    }
  })

  test('每种语言都有后台用到的菜单与提示文案', () => {
    const usedKeys = [...new Set([...backgroundSource.matchAll(/getMessage\('(\w+)'/g)].map((match) => match[1]))]
    expect(usedKeys.length).toBeGreaterThan(0)
    const localesDir = join(root, 'public/_locales')
    for (const locale of readdirSync(localesDir)) {
      const messages = JSON.parse(readFileSync(join(localesDir, locale, 'messages.json'), 'utf8'))
      for (const key of usedKeys) {
        expect(messages[key]?.message, `${locale} 缺少 ${key}`).toBeTruthy()
      }
    }
  })
})
