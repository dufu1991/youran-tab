export const NEWTAB_STORAGE_PREFIX = 'newtab_'

export const hasExistingNewtabData = (keys) => keys.some((key) => key.startsWith(NEWTAB_STORAGE_PREFIX))

export const getInitialBackgroundType = ({ hasStoredBackground, hasExistingData }) => {
  if (hasStoredBackground) return null
  return hasExistingData ? 'none' : 'random'
}

export const migrateAiProviderIds = (ids) => {
  if (!Array.isArray(ids)) return ids
  return [...new Set(ids.map((id) => id === 'mistral' ? 'deepseek' : id))]
}

export const migrateAiProviderId = (id) => id === 'mistral' ? 'deepseek' : id

// 0.5.0 起文件夹默认使用宫格图标：凡是显示为公文包的文件夹都改为宫格，
// 包括选了「自定义图片 / 粘贴 SVG」却没有提供图标的文件夹；真正设置了自定义图标的保持不变。
// includeStack 用于 0.5.0 开发期间曾被自动改成堆叠的数据，一并改为宫格
export const FOLDER_ICON_MIGRATION_VERSION = '0.5.0'

export const migrateFolderIconsToDefault = (items, { includeStack = false } = {}) => {
  if (!Array.isArray(items)) return items
  return items.map((item) => {
    if (item?.type !== 'folder' || item.folderIconType === 'grid') return item
    if (item.folderIconType === 'stack') return includeStack ? { ...item, folderIconType: 'grid' } : item
    const hasCustomIcon = ['custom', 'svg', undefined].includes(item.folderIconType) && !!item.folderCustomIcon
    if (hasCustomIcon) return item
    return { ...item, folderIconType: 'grid', folderCustomIcon: '' }
  })
}
