import { describe, expect, test } from 'bun:test'
import { getInitialBackgroundType, hasExistingNewtabData, migrateAiProviderId, migrateAiProviderIds } from './configMigrations.js'

describe('background configuration migration', () => {
  test('uses random background for a new installation', () => {
    expect(hasExistingNewtabData([])).toBe(false)
    expect(getInitialBackgroundType({ hasStoredBackground: false, hasExistingData: false })).toBe('random')
  })

  test('keeps no background for an existing user without newtab_bg', () => {
    expect(hasExistingNewtabData(['newtab_sites', 'newtab_theme'])).toBe(true)
    expect(getInitialBackgroundType({ hasStoredBackground: false, hasExistingData: true })).toBe('none')
  })

  test('does not replace an existing background configuration', () => {
    expect(getInitialBackgroundType({ hasStoredBackground: true, hasExistingData: true })).toBeNull()
  })
})

describe('AI provider migration', () => {
  test('replaces Mistral with DeepSeek', () => {
    expect(migrateAiProviderId('mistral')).toBe('deepseek')
    expect(migrateAiProviderIds(['chatgpt', 'mistral'])).toEqual(['chatgpt', 'deepseek'])
  })

  test('deduplicates mixed Mistral and DeepSeek configuration', () => {
    expect(migrateAiProviderIds(['mistral', 'deepseek', 'chatgpt', 'mistral'])).toEqual(['deepseek', 'chatgpt'])
  })
})

describe('folder icon migration', () => {
  test('turns default briefcase folders into grid folders', async () => {
    const { migrateFolderIconsToDefault } = await import('./configMigrations.js')
    const items = [
      { id: 's', name: 'Site', url: 'https://s.com' },
      { id: 'a', type: 'folder', name: 'A', folderIconType: 'briefcase', items: [] },
      { id: 'b', type: 'folder', name: 'B', items: [] },
      { id: 'c', type: 'folder', name: 'C', folderIconType: 'custom', folderCustomIcon: 'data:x', items: [] },
      { id: 'd', type: 'folder', name: 'D', folderCustomIcon: 'data:y', items: [] },
      { id: 'e', type: 'folder', name: 'E', folderIconType: 'svg', folderCustomIcon: 'data:z', items: [] },
      { id: 'f', type: 'folder', name: 'F', folderIconType: 'custom', folderCustomIcon: '', items: [] },
      { id: 'g', type: 'folder', name: 'G', folderIconType: 'svg', items: [] },
      { id: 'h', type: 'folder', name: 'H', folderIconType: 'briefcase', folderCustomIcon: 'data:stale', items: [] },
    ]
    const migrated = migrateFolderIconsToDefault(items)
    expect(migrated.map((item) => item.folderIconType)).toEqual([undefined, 'grid', 'grid', 'custom', undefined, 'svg', 'grid', 'grid', 'grid'])
    expect(migrated[0]).toBe(items[0])
    expect(migrated[3]).toBe(items[3])
    expect(migrateFolderIconsToDefault(null)).toBeNull()
  })
})

describe('folder icon migration from the 0.5.0 development build', () => {
  test('keeps stacked folders unless asked to convert them', async () => {
    const { migrateFolderIconsToDefault } = await import('./configMigrations.js')
    const items = [{ id: 's', type: 'folder', name: 'S', folderIconType: 'stack', items: [] }, { id: 'g', type: 'folder', name: 'G', folderIconType: 'grid', items: [] }]
    expect(migrateFolderIconsToDefault(items).map((item) => item.folderIconType)).toEqual(['stack', 'grid'])
    expect(migrateFolderIconsToDefault(items, { includeStack: true }).map((item) => item.folderIconType)).toEqual(['grid', 'grid'])
  })
})
