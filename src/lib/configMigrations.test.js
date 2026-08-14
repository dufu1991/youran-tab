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
