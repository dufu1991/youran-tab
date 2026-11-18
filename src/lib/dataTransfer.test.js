import { beforeEach, describe, expect, test } from 'bun:test'

const storage = new Map()
globalThis.localStorage = {
  getItem: (key) => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
}

const { collectSettings, importSettingsData } = await import('./dataTransfer.js')

describe('settings export', () => {
  beforeEach(() => storage.clear())

  test('includes glass and bubble theme configuration', () => {
    const glassConfig = { cols: 3 }
    const bubbleConfig = { layout: 'random', size: 96 }
    localStorage.setItem('newtab_glass', JSON.stringify(glassConfig))
    localStorage.setItem('newtab_bubble', JSON.stringify(bubbleConfig))

    expect(collectSettings()).toMatchObject({ glassConfig, bubbleConfig })
  })

  test('imports glass and bubble theme configuration', () => {
    const glassConfig = { cols: 4 }
    const bubbleConfig = { layout: 'fixed', size: 108 }

    importSettingsData({ glassConfig, bubbleConfig })

    expect(JSON.parse(localStorage.getItem('newtab_glass'))).toEqual(glassConfig)
    expect(JSON.parse(localStorage.getItem('newtab_bubble'))).toEqual(bubbleConfig)
  })
})

const { compareVersions, isImportVersionSupported } = await import('./dataTransfer.js')

describe('import version check', () => {
  test('compares versions numerically', () => {
    expect(compareVersions('0.10.0', '0.9.9')).toBeGreaterThan(0)
    expect(compareVersions('0.4.2', '0.5.0')).toBeLessThan(0)
    expect(compareVersions('1.0', '1.0.0')).toBe(0)
  })

  test('accepts files from the same or an older version', () => {
    expect(isImportVersionSupported('0.5.0', '0.5.0')).toBe(true)
    expect(isImportVersionSupported('0.4.2', '0.5.0')).toBe(true)
    expect(isImportVersionSupported('0.1.0', '0.5.0')).toBe(true)
  })

  test('rejects files from a newer version or without a version', () => {
    expect(isImportVersionSupported('0.5.1', '0.5.0')).toBe(false)
    expect(isImportVersionSupported('1.0.0', '0.5.0')).toBe(false)
    expect(isImportVersionSupported('', '0.5.0')).toBe(false)
    expect(isImportVersionSupported(undefined, '0.5.0')).toBe(false)
  })
})

const { collectSites, importSitesData } = await import('./dataTransfer.js')

describe('folder export and import', () => {
  const createSitesStore = () => {
    let value = []
    return { setAll: (items) => { value = items }, get: () => value }
  }
  const clickCountsStore = { set: () => {} }

  test('round-trips folder appearance including the stack icon', () => {
    const folder = {
      id: 'f', type: 'folder', name: 'Work', folderBgColor: '#123456', folderShowBackground: false,
      folderRadius: 30, folderIconScale: 64, folderIconType: 'stack', folderCustomIcon: '',
      items: [{ id: 'a', name: 'A', url: 'https://a.com', iconSource: 'auto' }],
    }
    const exported = JSON.parse(JSON.stringify(collectSites([folder], {})))
    const store = createSitesStore()
    importSitesData(exported, store, [], clickCountsStore)

    expect(store.get()[0]).toMatchObject({
      type: 'folder', name: 'Work', folderBgColor: '#123456', folderShowBackground: false,
      folderRadius: 30, folderIconScale: 64, folderIconType: 'stack', folderCustomIcon: '',
    })
    expect(store.get()[0].items).toMatchObject([{ name: 'A', url: 'https://a.com' }])
  })

  test('imports folders exported by older versions with defaults', () => {
    const store = createSitesStore()
    importSitesData([{ type: 'folder', name: 'Old', folderBgColor: '#d7b55a', folderRadius: 24, folderIconType: 'briefcase', folderCustomIcon: '', items: [] }], store, [], clickCountsStore)

    expect(store.get()[0]).toMatchObject({ folderShowBackground: true, folderIconScale: 78, folderIconType: 'briefcase' })
  })
})

describe('import site items', () => {
  test('migrates briefcase folders only for files older than 0.5.0', async () => {
    const { getImportSiteItems } = await import('./dataTransfer.js')
    const sites = [{ type: 'folder', name: 'F', folderIconType: 'briefcase', items: [] }]
    expect(getImportSiteItems({ type: 'all', version: '0.4.2', data: { sites } })[0].folderIconType).toBe('grid')
    expect(getImportSiteItems({ type: 'legacy', version: null, data: sites })[0].folderIconType).toBe('grid')
    expect(getImportSiteItems({ type: 'all', version: '0.5.0', data: { sites } })[0].folderIconType).toBe('briefcase')
  })
})
