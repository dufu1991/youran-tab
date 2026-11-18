const TAB_GROUP_ID_NONE = -1

const getBrowserNamespace = () => {
  if (typeof browser !== 'undefined') return browser
  if (typeof chrome !== 'undefined') return chrome
  return null
}

const getTabsApi = () => {
  const extensionApi = getBrowserNamespace()
  return extensionApi?.tabs?.query ? extensionApi.tabs : null
}

const getTabGroupsApi = () => {
  const extensionApi = getBrowserNamespace()
  return extensionApi?.tabGroups?.query ? extensionApi.tabGroups : null
}

const queryTabs = (tabsApi) => {
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

const queryTabGroups = (tabGroupsApi, windowId) => {
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

const normalizeTab = (tab) => {
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

const normalizeGroup = (groupId, group) => {
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

const buildTabTree = (tabs, groups) => {
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

export const queryCurrentWindowTabs = async () => {
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

// 当前浏览器是否支持把标签页放进标签页分组（需要 tabs.group 与 tabGroups.update）
export const canOpenInTabGroup = () => {
  const extensionApi = getBrowserNamespace()
  return typeof extensionApi?.tabs?.create === 'function'
    && typeof extensionApi?.tabs?.group === 'function'
    && typeof extensionApi?.tabGroups?.update === 'function'
}

// 在当前窗口新建一个标签页分组并打开全部网址，返回是否已按分组打开
export const openUrlsInTabGroup = async (urls, title = '') => {
  const validUrls = urls.filter((url) => typeof url === 'string' && /^https?:\/\//.test(url))
  if (validUrls.length === 0 || !canOpenInTabGroup()) return false

  const extensionApi = getBrowserNamespace()
  const tabs = []
  // 逐个创建以保持文件夹内的顺序，先不激活，等分组完成后再切换
  for (const url of validUrls) {
    tabs.push(await extensionApi.tabs.create({ url, active: false }))
  }

  const groupId = await extensionApi.tabs.group({
    tabIds: tabs.map((tab) => tab.id),
    createProperties: { windowId: tabs[0].windowId },
  })
  await extensionApi.tabGroups.update(groupId, { title, collapsed: false })
  await extensionApi.tabs.update(tabs[0].id, { active: true })
  return true
}
