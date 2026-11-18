import { describe, expect, test } from 'bun:test'
import { moveSiteToFolder, normalizeSiteTree, reorderFolderSites } from './folders.js'

const tree = () => [
  { id: 'a', name: 'A', url: 'https://a.com' },
  { id: 'f1', type: 'folder', name: 'F1', items: [{ id: 'b', name: 'B', url: 'https://b.com' }] },
  { id: 'c', name: 'C', url: 'https://c.com' },
  { id: 'f2', type: 'folder', name: 'F2', items: [] },
]

const ids = (items) => items.map((item) => item.items ? `${item.id}[${item.items.map((child) => child.id).join(',')}]` : item.id)

describe('moveSiteToFolder', () => {
  test('moves a top-level site into a folder', () => {
    expect(ids(moveSiteToFolder(tree(), 'a', 'f2'))).toEqual(['f1[b]', 'c', 'f2[a]'])
  })

  test('moves a site between folders', () => {
    expect(ids(moveSiteToFolder(tree(), 'b', 'f2'))).toEqual(['a', 'f1[]', 'c', 'f2[b]'])
  })

  test('moves a site out of its folder to right after the folder', () => {
    expect(ids(moveSiteToFolder(tree(), 'b', ''))).toEqual(['a', 'f1[]', 'b', 'c', 'f2[]'])
  })

  test('keeps the tree unchanged for no-op or invalid moves', () => {
    const items = tree()
    expect(moveSiteToFolder(items, 'b', 'f1')).toBe(items)
    expect(moveSiteToFolder(items, 'a', '')).toBe(items)
    expect(moveSiteToFolder(items, 'f1', 'f2')).toBe(items)
    expect(moveSiteToFolder(items, 'a', 'c')).toBe(items)
    expect(moveSiteToFolder(items, 'missing', 'f2')).toBe(items)
  })

  test('keeps every field of legacy site data when moving', () => {
    // 早期版本的数据：id 由 Date.now() 生成，没有 iconSource 等后加字段
    const legacySite = { id: '1709251200000', name: 'Old', url: 'https://old.example' }
    const customSite = { id: '1', name: 'Custom', url: 'https://c.example', iconSource: 'custom', customIcon: 'data:image/png;base64,AA', customIconDark: 'data:image/png;base64,BB', iconRadius: 12 }
    const items = normalizeSiteTree([legacySite, customSite, { id: 'f', type: 'folder', name: 'F', items: [] }])

    const moved = moveSiteToFolder(moveSiteToFolder(items, legacySite.id, 'f'), customSite.id, 'f')
    expect(moved[0].items).toEqual([legacySite, customSite])

    const back = moveSiteToFolder(moved, legacySite.id, '')
    expect(back[1]).toEqual(legacySite)
    expect(normalizeSiteTree(back)).toEqual(back)
  })
})

describe('getFolderStackSites', () => {
  test('returns the first three sites in order', async () => {
    const { getFolderStackSites } = await import('./folders.js')
    const folder = { type: 'folder', items: ['a', 'b', 'c', 'd'].map((id) => ({ id, name: id, url: `https://${id}.com` })) }
    expect(getFolderStackSites(folder).map((site) => site.id)).toEqual(['a', 'b', 'c'])
    expect(getFolderStackSites({ type: 'folder', items: [] })).toEqual([])
    expect(getFolderStackSites(null)).toEqual([])
  })
})

describe('folder icon defaults', () => {
  test('new folders default to the grid icon', async () => {
    const { createFolderEntry } = await import('./folders.js')
    expect(createFolderEntry({ name: 'New', items: [] }).folderIconType).toBe('grid')
    expect(createFolderEntry({ name: 'Custom', folderCustomIcon: 'data:x', items: [] }).folderIconType).toBe('custom')
    expect(createFolderEntry({ name: 'Kept', folderIconType: 'briefcase', items: [] }).folderIconType).toBe('briefcase')
  })

  test('folders without a saved type fall back to the grid icon', async () => {
    const { normalizeSiteTree, getFolderIconType } = await import('./folders.js')
    const [legacy] = normalizeSiteTree([{ id: 'f', type: 'folder', name: 'Old', items: [] }])
    expect(legacy.folderIconType).toBe('grid')
    expect(getFolderIconType({ type: 'folder' })).toBe('grid')
    expect(getFolderIconType({ type: 'folder', folderCustomIcon: 'data:x' })).toBe('custom')
  })

  test('folders with a saved type keep it', async () => {
    const { normalizeSiteTree } = await import('./folders.js')
    const [saved] = normalizeSiteTree([{ id: 'f', type: 'folder', name: 'Saved', folderIconType: 'briefcase', items: [] }])
    expect(saved.folderIconType).toBe('briefcase')
  })
})

describe('upsertFolderInTree', () => {
  const site = (id) => ({ id, name: id.toUpperCase(), url: `https://${id}.com` })
  const tree = () => [
    site('a'),
    { id: 'f1', type: 'folder', name: 'F1', items: [site('b'), site('c')] },
    site('d'),
    { id: 'f2', type: 'folder', name: 'F2', items: [site('e')] },
  ]
  const shape = (items) => items.map((item) => item.items ? `${item.id}[${item.items.map((child) => child.id).join(',')}]` : item.id)

  test('creates a folder from top-level and other-folder sites, keeping the chosen order', async () => {
    const { upsertFolderInTree } = await import('./folders.js')
    const next = upsertFolderInTree(tree(), { name: 'New', items: [site('e'), site('a')] }, 'n')
    expect(shape(next)).toEqual(['f1[b,c]', 'd', 'f2[]', 'n[e,a]'])
  })

  test('edits a folder: reorders, moves sites in and releases unchecked sites after it', async () => {
    const { upsertFolderInTree } = await import('./folders.js')
    const next = upsertFolderInTree(tree(), { name: 'F1', items: [site('d'), site('b')] }, 'f1')
    expect(shape(next)).toEqual(['a', 'f1[d,b]', 'c', 'f2[e]'])
    expect(next[1].name).toBe('F1')
  })

  test('keeps the folder id and appearance fields', async () => {
    const { upsertFolderInTree } = await import('./folders.js')
    const [folder] = upsertFolderInTree([], { name: ' Work ', folderIconType: 'briefcase', folderBgColor: '#123456', items: [] }, 'w')
    expect(folder).toMatchObject({ id: 'w', type: 'folder', name: 'Work', folderIconType: 'briefcase', folderBgColor: '#123456', items: [] })
  })
})

describe('folder grid icon', () => {
  const folderOf = (count) => ({ type: 'folder', items: Array.from({ length: count }, (_, i) => ({ id: `s${i}`, name: `S${i}`, url: `https://s${i}.com` })) })

  test('shows every site up to 4 and the remaining count beyond that', async () => {
    const { getFolderGridCells } = await import('./folders.js')
    expect(getFolderGridCells(folderOf(0))).toEqual({ sites: [], more: 0 })
    expect(getFolderGridCells(folderOf(3)).sites.map((site) => site.id)).toEqual(['s0', 's1', 's2'])
    expect(getFolderGridCells(folderOf(4))).toMatchObject({ more: 0 })
    expect(getFolderGridCells(folderOf(4)).sites).toHaveLength(4)
    expect(getFolderGridCells(folderOf(9))).toMatchObject({ more: 6 })
    expect(getFolderGridCells(folderOf(9)).sites.map((site) => site.id)).toEqual(['s0', 's1', 's2'])
  })

  test('marks the same sites as covers in the editor', async () => {
    const { getFolderCoverCount } = await import('./folders.js')
    expect(getFolderCoverCount('grid', 4)).toBe(4)
    expect(getFolderCoverCount('grid', 9)).toBe(3)
    expect(getFolderCoverCount('stack', 9)).toBe(3)
    expect(getFolderCoverCount('briefcase', 9)).toBe(0)
  })
})

describe('reorderFolderSites', () => {
  const folderTree = () => [
    { id: 'a', name: 'A', url: 'https://a.com' },
    { id: 'f', type: 'folder', name: 'F', items: [
      { id: 'x', name: 'X', url: 'https://x.com' },
      { id: 'y', name: 'Y', url: 'https://y.com' },
      { id: 'z', name: 'Z', url: 'https://z.com' },
    ] },
  ]

  test('在文件夹内移动网站的位置', () => {
    expect(ids(reorderFolderSites(folderTree(), 'f', 0, 2))).toEqual(['a', 'f[y,z,x]'])
    expect(ids(reorderFolderSites(folderTree(), 'f', 2, 0))).toEqual(['a', 'f[z,x,y]'])
  })

  test('不改动主列表和其他项', () => {
    const items = folderTree()
    const next = reorderFolderSites(items, 'f', 0, 1)
    expect(next[0]).toBe(items[0])
  })

  test('位置无效、没有变化或目标不是文件夹时返回原数组', () => {
    const items = folderTree()
    expect(reorderFolderSites(items, 'f', 1, 1)).toBe(items)
    expect(reorderFolderSites(items, 'f', 5, 0)).toBe(items)
    expect(reorderFolderSites(items, 'f', 0, 3)).toBe(items)
    expect(reorderFolderSites(items, 'a', 0, 1)).toBe(items)
    expect(reorderFolderSites(items, 'missing', 0, 1)).toBe(items)
  })
})
