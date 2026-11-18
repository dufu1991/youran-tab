export const DEFAULT_FOLDER_BG = '#d7b55a'
export const DEFAULT_FOLDER_RADIUS = 24
export const DEFAULT_FOLDER_ICON_SCALE = 78
export const DEFAULT_FOLDER_SHOW_BACKGROUND = true
// 文件夹图标的默认类型：新建文件夹、以及数据里没有记录类型的文件夹都使用宫格图标
export const DEFAULT_FOLDER_ICON_TYPE = 'grid'

export const isFolderItem = (item) => {
  return item?.type === 'folder'
}

export const getFolderSites = (folder) => {
  return Array.isArray(folder?.items) ? folder.items : []
}

export const cloneEntry = (item) => {
  if (!item || typeof item !== 'object') return item
  if (isFolderItem(item)) {
    return {
      ...item,
      type: 'folder',
      items: getFolderSites(item).map(cloneEntry),
    }
  }
  return { ...item }
}

export const normalizeSiteTree = (items) => {
  if (!Array.isArray(items)) return []
  return items.map((item) => {
    if (isFolderItem(item)) {
      const hasCustomIcon = !!item.folderCustomIcon
      return {
        ...item,
        type: 'folder',
        folderBgColor: item.folderBgColor || DEFAULT_FOLDER_BG,
        folderShowBackground: item.folderShowBackground ?? DEFAULT_FOLDER_SHOW_BACKGROUND,
        folderRadius: Number(item.folderRadius ?? DEFAULT_FOLDER_RADIUS),
        folderIconScale: Number(item.folderIconScale ?? DEFAULT_FOLDER_ICON_SCALE),
        folderIconType: item.folderIconType || (hasCustomIcon ? 'custom' : DEFAULT_FOLDER_ICON_TYPE),
        folderCustomIcon: item.folderCustomIcon || '',
        items: normalizeSiteTree(getFolderSites(item)).filter((entry) => !isFolderItem(entry)),
      }
    }
    return { ...item }
  })
}

export const getFolderBackground = (folder) => {
  return folder?.folderBgColor || DEFAULT_FOLDER_BG
}

export const getFolderShowBackground = (folder) => {
  return folder?.folderShowBackground ?? DEFAULT_FOLDER_SHOW_BACKGROUND
}

export const getFolderRadius = (folder) => {
  return Number(folder?.folderRadius ?? DEFAULT_FOLDER_RADIUS)
}

export const getFolderIconType = (folder) => {
  return folder?.folderIconType || (folder?.folderCustomIcon ? 'custom' : DEFAULT_FOLDER_ICON_TYPE)
}

export const getFolderIconScale = (folder) => {
  const scale = Number(folder?.folderIconScale ?? DEFAULT_FOLDER_ICON_SCALE)
  return Math.max(50, Math.min(100, scale))
}

const expandHex = (color) => {
  if (!color?.startsWith('#')) return null
  if (color.length === 4) {
    return `#${color.slice(1).split('').map((char) => char + char).join('')}`
  }
  return color.length === 7 ? color : null
}

export const isLightColor = (color) => {
  const hex = expandHex(color)
  if (!hex) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) >= 160
}

export const getFolderForeground = (folder) => {
  return isLightColor(getFolderBackground(folder)) ? '#111111' : '#ffffff'
}

export const createFolderEntry = (data, existingId = crypto.randomUUID()) => {
  const hasCustomIcon = data.folderIconType === 'custom' || data.folderIconType === 'svg'
  return {
    id: existingId,
    type: 'folder',
    name: data.name.trim(),
    folderBgColor: data.folderBgColor || DEFAULT_FOLDER_BG,
    folderShowBackground: data.folderShowBackground ?? DEFAULT_FOLDER_SHOW_BACKGROUND,
    folderRadius: Number(data.folderRadius ?? DEFAULT_FOLDER_RADIUS),
    folderIconScale: Number(data.folderIconScale ?? DEFAULT_FOLDER_ICON_SCALE),
    folderIconType: data.folderIconType || (data.folderCustomIcon ? 'custom' : DEFAULT_FOLDER_ICON_TYPE),
    folderCustomIcon: hasCustomIcon ? (data.folderCustomIcon || '') : '',
    items: normalizeSiteTree((data.items || []).map(cloneEntry)).filter((item) => !isFolderItem(item)),
  }
}

export const updateItemTree = (items, id, updater) => {
  return items.map((item) => {
    if (item.id === id) return updater(item)
    if (isFolderItem(item)) {
      return { ...item, items: updateItemTree(getFolderSites(item), id, updater) }
    }
    return item
  })
}

export const removeItemFromTree = (items, id) => {
  return items
    .filter((item) => item.id !== id)
    .map((item) => {
      if (!isFolderItem(item)) return item
      return { ...item, items: removeItemFromTree(getFolderSites(item), id) }
    })
}

export const findItemById = (items, id) => {
  for (const item of items) {
    if (item.id === id) return item
    if (isFolderItem(item)) {
      const nested = findItemById(getFolderSites(item), id)
      if (nested) return nested
    }
  }
  return null
}

export const findFolderByChildId = (items, id) => {
  return items.find((item) => isFolderItem(item) && getFolderSites(item).some((child) => child.id === id)) || null
}

export const collectFolderCandidates = (items, editingFolderId = null) => {
  const editableFolder = editingFolderId ? findItemById(items, editingFolderId) : null
  const candidates = items
    .filter((item) => !isFolderItem(item))
    .map((item) => ({ ...cloneEntry(item), disabled: false }))
  if (isFolderItem(editableFolder)) {
    candidates.push(...getFolderSites(editableFolder).map((item) => ({ ...cloneEntry(item), disabled: false })))
  }

  for (const item of items) {
    if (!isFolderItem(item) || item.id === editingFolderId) continue
    candidates.push(
      ...getFolderSites(item).map((site) => ({
        ...cloneEntry(site),
        disabled: true,
      }))
    )
  }
  return candidates
}

export const flattenSites = (items, prefix = '') => {
  const flat = []
  for (const item of items) {
    if (isFolderItem(item)) {
      const nextPrefix = prefix ? `${prefix} / ${item.name}` : item.name
      flat.push(...flattenSites(getFolderSites(item), nextPrefix))
      continue
    }
    flat.push({
      ...item,
      folderPath: prefix,
      displayName: prefix ? `${prefix} / ${item.name}` : item.name,
    })
  }
  return flat
}

export const countSites = (items) => {
  return items.reduce((total, item) => {
    if (isFolderItem(item)) return total + countSites(getFolderSites(item))
    return total + 1
  }, 0)
}

export const sumFolderClicks = (folder, clickCounts = {}) => {
  return getFolderSites(folder).reduce((total, item) => {
    if (isFolderItem(item)) return total + sumFolderClicks(item, clickCounts)
    return total + (clickCounts[item.id] || 0)
  }, 0)
}

// 把站点移入指定文件夹末尾；targetFolderId 为空时移出文件夹，放回主列表中原文件夹之后
export const moveSiteToFolder = (items, siteId, targetFolderId = '') => {
  const site = findItemById(items, siteId)
  if (!site || isFolderItem(site)) return items

  const sourceFolder = findFolderByChildId(items, siteId)
  if ((sourceFolder?.id || '') === targetFolderId) return items
  if (targetFolderId && !isFolderItem(findItemById(items, targetFolderId))) return items

  const withoutSite = removeItemFromTree(items, siteId)
  if (targetFolderId) {
    return withoutSite.map((item) => (
      item.id === targetFolderId ? { ...item, items: [...getFolderSites(item), site] } : item
    ))
  }

  const sourceIndex = withoutSite.findIndex((item) => item.id === sourceFolder.id)
  return [...withoutSite.slice(0, sourceIndex + 1), site, ...withoutSite.slice(sourceIndex + 1)]
}

// 调整文件夹内网站的顺序；位置无效或没有变化时返回原数组
export const reorderFolderSites = (items, folderId, fromIndex, toIndex) => {
  const folder = findItemById(items, folderId)
  if (!isFolderItem(folder) || fromIndex === toIndex) return items
  const sites = [...getFolderSites(folder)]
  if (!sites[fromIndex] || toIndex < 0 || toIndex >= sites.length) return items
  const [moved] = sites.splice(fromIndex, 1)
  sites.splice(toIndex, 0, moved)
  return items.map((item) => (item.id === folderId ? { ...item, items: sites } : item))
}

export const FOLDER_STACK_LIMIT = 3

// 堆叠图标使用文件夹内排在最前面的几个网站
export const getFolderStackSites = (folder) => (
  getFolderSites(folder).filter((item) => !isFolderItem(item) && item.url).slice(0, FOLDER_STACK_LIMIT)
)

// 保存文件夹：data.items 为文件夹内的网站（有序）。
// 选中的网站会从主列表和其他文件夹中移出；编辑时被取消勾选的网站放回主列表，紧跟在文件夹后面；新建的文件夹追加到末尾
export const upsertFolderInTree = (items, data, folderId) => {
  const folderEntry = createFolderEntry(data, folderId)
  const selectedIds = new Set(getFolderSites(folderEntry).map((site) => site.id))
  const existing = findItemById(items, folderId)
  const released = isFolderItem(existing) ? getFolderSites(existing).filter((site) => !selectedIds.has(site.id)) : []

  const next = []
  let placed = false
  for (const item of items) {
    if (item.id === folderId) {
      next.push(folderEntry, ...released)
      placed = true
      continue
    }
    if (isFolderItem(item)) {
      next.push({ ...item, items: getFolderSites(item).filter((site) => !selectedIds.has(site.id)) })
      continue
    }
    if (!selectedIds.has(item.id)) next.push(item)
  }
  if (!placed) next.push(folderEntry)
  return next
}

// 宫格图标：2 × 2 排列。网站不超过 4 个时全部显示；超过时显示前 3 个，第 4 格显示剩余数量
export const FOLDER_GRID_SLOTS = 4

export const getFolderGridCells = (folder) => {
  const sites = getFolderSites(folder).filter((item) => !isFolderItem(item) && item.url)
  if (sites.length <= FOLDER_GRID_SLOTS) return { sites, more: 0 }
  return { sites: sites.slice(0, FOLDER_GRID_SLOTS - 1), more: sites.length - (FOLDER_GRID_SLOTS - 1) }
}

// 文件夹内容列表中会标记为「封面」的数量，与图标上实际显示的网站一致
export const getFolderCoverCount = (iconType, total) => {
  if (iconType === 'stack') return FOLDER_STACK_LIMIT
  if (iconType === 'grid') return total <= FOLDER_GRID_SLOTS ? FOLDER_GRID_SLOTS : FOLDER_GRID_SLOTS - 1
  return 0
}
