export const DEFAULT_FOLDER_BG = '#d7b55a'
export const DEFAULT_FOLDER_RADIUS = 24
export const DEFAULT_FOLDER_ICON_SCALE = 78
export const DEFAULT_FOLDER_SHOW_BACKGROUND = true

export function isFolderItem(item) {
  return item?.type === 'folder'
}

export function getFolderSites(folder) {
  return Array.isArray(folder?.items) ? folder.items : []
}

export function cloneEntry(item) {
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

export function normalizeSiteTree(items) {
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
        folderIconType: item.folderIconType || (hasCustomIcon ? 'custom' : 'briefcase'),
        folderCustomIcon: item.folderCustomIcon || '',
        items: normalizeSiteTree(getFolderSites(item)).filter((entry) => !isFolderItem(entry)),
      }
    }
    return { ...item }
  })
}

export function getFolderBackground(folder) {
  return folder?.folderBgColor || DEFAULT_FOLDER_BG
}

export function getFolderShowBackground(folder) {
  return folder?.folderShowBackground ?? DEFAULT_FOLDER_SHOW_BACKGROUND
}

export function getFolderRadius(folder) {
  return Number(folder?.folderRadius ?? DEFAULT_FOLDER_RADIUS)
}

export function getFolderIconType(folder) {
  return folder?.folderIconType || (folder?.folderCustomIcon ? 'custom' : 'briefcase')
}

export function getFolderIconScale(folder) {
  const scale = Number(folder?.folderIconScale ?? DEFAULT_FOLDER_ICON_SCALE)
  return Math.max(50, Math.min(100, scale))
}

function expandHex(color) {
  if (!color?.startsWith('#')) return null
  if (color.length === 4) {
    return `#${color.slice(1).split('').map((char) => char + char).join('')}`
  }
  return color.length === 7 ? color : null
}

export function isLightColor(color) {
  const hex = expandHex(color)
  if (!hex) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) >= 160
}

export function getFolderForeground(folder) {
  return isLightColor(getFolderBackground(folder)) ? '#111111' : '#ffffff'
}

export function createFolderEntry(data, existingId = crypto.randomUUID()) {
  const hasCustomIcon = data.folderIconType === 'custom' || data.folderIconType === 'svg'
  return {
    id: existingId,
    type: 'folder',
    name: data.name.trim(),
    folderBgColor: data.folderBgColor || DEFAULT_FOLDER_BG,
    folderShowBackground: data.folderShowBackground ?? DEFAULT_FOLDER_SHOW_BACKGROUND,
    folderRadius: Number(data.folderRadius ?? DEFAULT_FOLDER_RADIUS),
    folderIconScale: Number(data.folderIconScale ?? DEFAULT_FOLDER_ICON_SCALE),
    folderIconType: data.folderIconType || (data.folderCustomIcon ? 'custom' : 'briefcase'),
    folderCustomIcon: hasCustomIcon ? (data.folderCustomIcon || '') : '',
    items: normalizeSiteTree((data.items || []).map(cloneEntry)).filter((item) => !isFolderItem(item)),
  }
}

export function updateItemTree(items, id, updater) {
  return items.map((item) => {
    if (item.id === id) return updater(item)
    if (isFolderItem(item)) {
      return { ...item, items: updateItemTree(getFolderSites(item), id, updater) }
    }
    return item
  })
}

export function removeItemFromTree(items, id) {
  return items
    .filter((item) => item.id !== id)
    .map((item) => {
      if (!isFolderItem(item)) return item
      return { ...item, items: removeItemFromTree(getFolderSites(item), id) }
    })
}

export function findItemById(items, id) {
  for (const item of items) {
    if (item.id === id) return item
    if (isFolderItem(item)) {
      const nested = findItemById(getFolderSites(item), id)
      if (nested) return nested
    }
  }
  return null
}

export function findFolderByChildId(items, id) {
  return items.find((item) => isFolderItem(item) && getFolderSites(item).some((child) => child.id === id)) || null
}

export function collectFolderCandidates(items, editingFolderId = null) {
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

export function flattenSites(items, prefix = '') {
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

export function countSites(items) {
  return items.reduce((total, item) => {
    if (isFolderItem(item)) return total + countSites(getFolderSites(item))
    return total + 1
  }, 0)
}

export function sumFolderClicks(folder, clickCounts = {}) {
  return getFolderSites(folder).reduce((total, item) => {
    if (isFolderItem(item)) return total + sumFolderClicks(item, clickCounts)
    return total + (clickCounts[item.id] || 0)
  }, 0)
}
