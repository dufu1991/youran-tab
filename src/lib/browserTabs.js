function getTabsApi() {
  if (typeof chrome !== 'undefined' && chrome.tabs?.query) return chrome.tabs
  if (typeof browser !== 'undefined' && browser.tabs?.query) return browser.tabs
  return null
}

function normalizeTab(tab) {
  return {
    id: String(tab.id ?? crypto.randomUUID()),
    title: tab.title || tab.url || '',
    url: tab.url || '',
    favIconUrl: tab.favIconUrl || '',
  }
}

export async function queryCurrentWindowTabs() {
  const tabsApi = getTabsApi()
  if (!tabsApi) return []

  if (typeof browser !== 'undefined' && browser.tabs?.query) {
    const tabs = await browser.tabs.query({ currentWindow: true })
    return tabs
      .filter((tab) => /^https?:\/\//.test(tab.url || ''))
      .map(normalizeTab)
  }

  return new Promise((resolve) => {
    tabsApi.query({ currentWindow: true }, (tabs) => {
      const nextTabs = (tabs || [])
        .filter((tab) => /^https?:\/\//.test(tab.url || ''))
        .map(normalizeTab)
      resolve(nextTabs)
    })
  })
}
