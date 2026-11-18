import { describe, expect, test } from 'bun:test'
import { collectSiteUrls, mergePendingSites, normalizeSiteUrl } from './pendingSites.js'

const tree = [
  { id: 'a', name: 'A', url: 'https://a.com/' },
  { id: 'f', type: 'folder', name: 'F', items: [{ id: 'b', name: 'B', url: 'https://B.com/path' }] },
]

describe('pending sites', () => {
  test('normalizes urls the same way as the background script', () => {
    expect(normalizeSiteUrl('https://Example.com/Path//')).toBe('https://example.com/path')
  })

  test('collects urls from the main list and folders', () => {
    expect(collectSiteUrls(tree)).toEqual(['https://a.com', 'https://b.com/path'])
  })

  test('appends new pages and skips existing or duplicate urls', () => {
    const next = mergePendingSites(tree, [
      { name: 'A again', url: 'https://a.com' },
      { name: 'B again', url: 'https://b.com/path/' },
      { name: 'New', url: 'https://new.com' },
      { name: 'New twice', url: 'https://NEW.com/' },
      { name: 'Local', url: 'chrome://settings' },
    ])
    expect(next.slice(0, 2)).toEqual(tree)
    expect(next.slice(2)).toMatchObject([{ name: 'New', url: 'https://new.com', iconSource: 'auto', iconRadius: 4 }])
    expect(typeof next[2].id).toBe('string')
  })

  test('returns the same array when nothing is added', () => {
    expect(mergePendingSites(tree, [])).toBe(tree)
    expect(mergePendingSites(tree, [{ name: 'A', url: 'https://a.com' }])).toBe(tree)
  })
})

describe('pending sites with folders', () => {
  test('adds into the chosen folder, falls back to the main list when the folder is gone', async () => {
    const { mergePendingSites, collectSiteFolders } = await import('./pendingSites.js')
    expect(collectSiteFolders(tree)).toEqual([{ id: 'f', name: 'F' }])
    const next = mergePendingSites(tree, [
      { name: 'In F', url: 'https://in-f.com', folderId: 'f' },
      { name: 'Gone', url: 'https://gone.com', folderId: 'deleted' },
      { name: 'Root', url: 'https://root.com' },
      { name: 'B dup', url: 'https://b.com/path', folderId: 'f' },
    ])
    expect(next[1].items.map((site) => site.name)).toEqual(['B', 'In F'])
    expect(next.slice(2).map((site) => site.name)).toEqual(['Gone', 'Root'])
    expect(tree[1].items).toHaveLength(1)
  })
})
