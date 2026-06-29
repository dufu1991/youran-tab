export const CHANGELOG_URL = 'https://youran-tab.du-fu.com/#changelog'

export const getAppVersion = () => {
  const runtime = getRuntime()
  try {
    return runtime?.getManifest?.().version || '0.0.0'
  } catch {
    return '0.0.0'
  }
}

const getRuntime = () => {
  if (typeof browser !== 'undefined' && browser.runtime) return browser.runtime
  if (typeof chrome !== 'undefined' && chrome.runtime) return chrome.runtime
  return null
}
