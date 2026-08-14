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
