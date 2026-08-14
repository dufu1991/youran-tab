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
