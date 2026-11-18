import { describe, expect, test } from 'bun:test'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

// 收集对象里所有文案的完整键名，例如 settings.open
const collectKeys = (value, prefix = '') => Object.entries(value).flatMap(([key, child]) => {
  const path = prefix ? `${prefix}.${key}` : key
  return child && typeof child === 'object' ? collectKeys(child, path) : [path]
})

const localesDir = join(import.meta.dir, 'locales')
const localeFiles = readdirSync(localesDir).filter((file) => file.endsWith('.js'))

describe('界面文案', () => {
  // settings.themeParameters 由 i18n.js 里单独的模板表处理，不要求写在语言文件中
  const templateKeys = new Set(['settings.themeParameters'])

  test('每种语言都包含简体中文里的全部文案，避免界面混入其他语言', async () => {
    const zhKeys = collectKeys((await import(join(localesDir, 'zh-CN.js'))).default).filter((key) => !templateKeys.has(key))
    for (const file of localeFiles) {
      const keys = new Set(collectKeys((await import(join(localesDir, file))).default))
      expect(zhKeys.filter((key) => !keys.has(key)), file).toEqual([])
    }
  })

  test('其他语言没有简体中文里不存在的多余键', async () => {
    const zhKeys = new Set(collectKeys((await import(join(localesDir, 'zh-CN.js'))).default))
    for (const file of localeFiles) {
      const extra = collectKeys((await import(join(localesDir, file))).default).filter((key) => !zhKeys.has(key))
      expect(extra, file).toEqual([])
    }
  })
})
