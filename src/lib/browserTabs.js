const TAB_GROUP_ID_NONE = -1

function getBrowserNamespace() {
  if (typeof browser !== 'undefined') return browser
  if (typeof chrome !== 'undefined') return chrome
  return null
}

function getTabsApi() {
  const extensionApi = getBrowserNamespace()
  return extensionApi?.tabs?.query ? extensionApi.tabs : null
}

function getTabGroupsApi() {
  const extensionApi = getBrowserNamespace()
  return extensionApi?.tabGroups?.query ? extensionApi.tabGroups : null
}

function queryTabs(tabsApi) {
  if (!tabsApi) return Promise.resolve([])

  if (typeof browser !== 'undefined' && browser.tabs?.query === tabsApi.query) {
    return browser.tabs.query({ currentWindow: true })
  }

  return new Promise((resolve) => {
    tabsApi.query({ currentWindow: true }, (tabs) => {
      resolve(tabs || [])
    })
  })
}

function queryTabGroups(tabGroupsApi, windowId) {
  if (!tabGroupsApi || typeof windowId !== 'number') return Promise.resolve([])

  if (typeof browser !== 'undefined' && browser.tabGroups?.query === tabGroupsApi.query) {
    return browser.tabGroups.query({ windowId })
  }

  return new Promise((resolve) => {
    tabGroupsApi.query({ windowId }, (groups) => {
      resolve(groups || [])
    })
  })
}

function normalizeTab(tab) {
  return {
    type: 'tab',
    id: String(tab.id ?? crypto.randomUUID()),
    title: tab.title || tab.url || '',
    url: tab.url || '',
    favIconUrl: tab.favIconUrl || '',
    windowId: tab.windowId,
    groupId: typeof tab.groupId === 'number' ? tab.groupId : TAB_GROUP_ID_NONE,
  }
}

function normalizeGroup(groupId, group) {
  return {
    type: 'group',
    id: `group:${groupId}`,
    groupId,
    title: group?.title || '',
    color: group?.color || 'grey',
    collapsed: !!group?.collapsed,
    tabs: [],
  }
}

function buildTabTree(tabs, groups) {
  const groupMap = new Map(groups.map((group) => [group.id, group]))
  const groupedEntries = new Map()
  const entries = []

  for (const tab of tabs) {
    if (tab.groupId !== TAB_GROUP_ID_NONE) {
      if (!groupedEntries.has(tab.groupId)) {
        const nextGroup = normalizeGroup(tab.groupId, groupMap.get(tab.groupId))
        groupedEntries.set(tab.groupId, nextGroup)
        entries.push(nextGroup)
      }

      groupedEntries.get(tab.groupId).tabs.push(tab)
      continue
    }

    entries.push(tab)
  }

  return entries
}

export async function queryCurrentWindowTabs() {
  const tabsApi = getTabsApi()
  const tabGroupsApi = getTabGroupsApi()
  if (!tabsApi) return []

  const tabs = (await queryTabs(tabsApi))
    .filter((tab) => /^https?:\/\//.test(tab.url || ''))
    .map(normalizeTab)

  const windowId = tabs.find((tab) => typeof tab.windowId === 'number')?.windowId
  const groupIds = new Set(
    tabs
      .map((tab) => tab.groupId)
      .filter((groupId) => groupId !== TAB_GROUP_ID_NONE)
  )

  const groups = groupIds.size > 0 ? await queryTabGroups(tabGroupsApi, windowId) : []
  return buildTabTree(tabs, groups)
}
