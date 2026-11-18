import { beforeEach, describe, expect, test } from 'bun:test'

const storage = new Map()
globalThis.localStorage = {
  getItem: (key) => (storage.has(key) ? storage.get(key) : null),
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
}

const { clearAutoIcons, createLetterIcon, getResolvedAutoIcon, pickBestIcon, resolveAutoIcon } = await import('./autoIcon.js')

// 构造一个假的图标来源：按域名返回预设的结果，并记录被调用的次数
const fakeSource = (results) => {
  const source = async (url, host) => {
    source.calls += 1
    return results[host] ?? null
  }
  source.calls = 0
  return source
}

describe('pickBestIcon', () => {
  test('picks the sharpest candidate', () => {
    expect(pickBestIcon([null, { src: 'a', score: 16 }, { src: 'b', score: 192 }, { src: 'c', score: 32 }])).toEqual({ src: 'b', score: 192 })
  })

  test('keeps the earlier source when sharpness is equal', () => {
    expect(pickBestIcon([{ src: 'own', score: 64 }, { src: 'service', score: 64 }]).src).toBe('own')
  })

  test('returns null when no source has an icon', () => {
    expect(pickBestIcon([null, null])).toBeNull()
  })
})

describe('resolveAutoIcon', () => {
  beforeEach(() => {
    storage.clear()
    clearAutoIcons()
  })

  test('uses the sharpest icon across all sources, not the first one found', async () => {
    // Dribbble 实测：faviconextractor 只有 16px，Google 标称 128px 实为 32px，icon.horse 为 192px
    const sources = [
      fakeSource({}),
      fakeSource({ 'dribbble.com': { src: 'extractor', score: 16 } }),
      fakeSource({ 'dribbble.com': { src: 'google', score: 32 } }),
      fakeSource({ 'dribbble.com': { src: 'horse', score: 192 } }),
    ]
    expect(await resolveAutoIcon('https://dribbble.com/shots/1', 'Dribbble', sources)).toBe('horse')
    expect(getResolvedAutoIcon('https://dribbble.com/other')).toBe('horse')
  })

  test('falls back to a letter icon and remembers it', async () => {
    const result = await resolveAutoIcon('https://www.nothing.com', '悠然', [fakeSource({})])
    expect(result).toBe(createLetterIcon('悠然', 'www.nothing.com'))
    expect(decodeURIComponent(result)).toContain('>悠<')
    expect(JSON.parse(storage.get('newtab_auto_icons'))['www.nothing.com'].fallback).toBe(true)
  })

  test('a failing source does not break the others', async () => {
    const broken = async () => { throw new Error('boom') }
    expect(await resolveAutoIcon('https://ok.com', 'OK', [broken, fakeSource({ 'ok.com': { src: 'ok', score: 64 } })])).toBe('ok')
  })

  test('probes each host only once, even for concurrent requests', async () => {
    const source = fakeSource({ 'c.com': { src: 'c', score: 64 } })
    const results = await Promise.all([resolveAutoIcon('https://c.com/1', 'C', [source]), resolveAutoIcon('https://c.com/2', 'C', [source])])
    expect(results).toEqual(['c', 'c'])
    await resolveAutoIcon('https://c.com/3', 'C', [source])
    expect(source.calls).toBe(1)
  })

  test('ignores non-web urls', async () => {
    expect(await resolveAutoIcon('chrome://settings', 'Settings', [fakeSource({})])).toBe('')
    expect(getResolvedAutoIcon('not a url')).toBe('')
  })
})
