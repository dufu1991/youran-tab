<script>
  import { onMount } from 'svelte'
  import { untrack } from 'svelte'
  import { t } from './i18n.js'
  import { queryCurrentWindowTabs } from './browserTabs.js'
  import { iconSources, pickableSourceKeys, getFaviconBySource } from './favicon.js'
  import { resolveAutoIcon } from './autoIcon.js'
  import FolderForm from './FolderForm.svelte'
  import Tabs from './Tabs.svelte'
  import { isFolderItem } from './folders.js'

  const tabGroupColors = {
    grey: '#9ca3af',
    blue: '#3b82f6',
    red: '#ef4444',
    yellow: '#f59e0b',
    green: '#22c55e',
    pink: '#ec4899',
    purple: '#a855f7',
    cyan: '#06b6d4',
    orange: '#f97316',
  }

  let { site = null, siteTree = [], allowFolder = true, dark = false, onsave, onclose } = $props()

  const init = untrack(() => site ?? {})
  const isEdit = untrack(() => site !== null)
  const editingFolder = untrack(() => isFolderItem(site))
  // 堆叠图标的叠法由文件夹 id 决定，新建时提前生成 id，保证预览和保存后的样子一致
  const folderId = untrack(() => (isFolderItem(site) ? site.id : crypto.randomUUID()))

  let entryType = $state(editingFolder ? 'folder' : 'site')
  let name = $state(init.name || '')
  let url = $state(init.url || '')
  let hasManualNameInput = $state(!!init.name)
  let iconSource = $state(init.iconSource || 'auto')
  let customIcon = $state(init.customIcon || '')
  let customIconDark = $state(init.customIconDark || '')
  let separateDark = $state(!!init.customIconDark)
  let iconRadius = $state(init.iconRadius ?? 4)
  let browserTabEntries = $state([])
  let tabSearch = $state('')
  let selectedBrowserTabIds = $state([])
  let folderForm = $state(null)

  let backdropPointerStarted = false

  let browserTabs = $derived.by(() =>
    browserTabEntries.flatMap((entry) => entry.type === 'group' ? entry.tabs : [entry])
  )
  let browserTabMap = $derived(new Map(browserTabs.map((tab) => [tab.id, tab])))
  let selectedBrowserTabs = $derived(
    selectedBrowserTabIds.map((id) => browserTabMap.get(id)).filter(Boolean)
  )
  let activeSource = $derived(iconSource || 'auto')
  let fullUrl = $derived(url.includes('://') ? url : 'https://' + url)
  let hasUrl = $derived(url.trim().length > 0)
  // 「自动」预览显示真正会用到的图标：输入停顿后按顺序探测，避免显示浏览器的默认地球图标
  let autoPreview = $state('')

  $effect(() => {
    const target = fullUrl
    const siteName = untrack(() => name)
    autoPreview = ''
    if (!hasUrl || !/^https?:\/\/[^/]+\.[^/]+/.test(target)) return
    let active = true
    const timer = setTimeout(() => {
      resolveAutoIcon(target, siteName).then((resolved) => {
        if (active) autoPreview = resolved
      })
    }, 400)
    return () => {
      active = false
      clearTimeout(timer)
    }
  })
  // 文件夹由 FolderForm 处理，这里的标签页面板只用于新建网站时单选填充
  const allowMultiTabSelection = false
  const showBrowserTabsPanel = !isEdit
  let showTabSearch = $derived(browserTabs.length > 12)
  let useBatchTabs = $derived(!isEdit && entryType === 'site' && selectedBrowserTabs.length > 1)
  let filteredTabEntries = $derived.by(() => {
    const keyword = tabSearch.trim().toLowerCase()
    if (!keyword) return browserTabEntries

    return browserTabEntries.reduce((result, entry) => {
      if (entry.type === 'group') {
        const matchedTabs = entry.tabs.filter((tab) => matchesTab(tab, keyword))
        const matchedGroup = (entry.title || '').toLowerCase().includes(keyword)

        if (matchedGroup || matchedTabs.length > 0) {
          result.push({
            ...entry,
            allTabs: entry.tabs,
            tabs: matchedGroup ? entry.tabs : matchedTabs,
          })
        }

        return result
      }

      if (matchesTab(entry, keyword)) result.push(entry)
      return result
    }, [])
  })
  const handleBackdropPointerDown = (event) => {
    backdropPointerStarted = event.target === event.currentTarget
  }

  const handleBackdropPointerUp = (event) => {
    if (backdropPointerStarted && event.target === event.currentTarget) {
      onclose?.()
    }

    backdropPointerStarted = false
  }

  const handleBackdropPointerCancel = () => {
    backdropPointerStarted = false
  }

  const selectSource = (key) => {
    iconSource = key
  }

  onMount(async () => {
    if (isEdit) return
    browserTabEntries = await queryCurrentWindowTabs()
  })

  $effect(() => {
    if (allowMultiTabSelection || selectedBrowserTabIds.length <= 1) return
    selectedBrowserTabIds = selectedBrowserTabIds.slice(0, 1)
  })

  const matchesTab = (tab, keyword) => {
    return tab.title.toLowerCase().includes(keyword) || tab.url.toLowerCase().includes(keyword)
  }

  const resizeImage = (file, maxSize = 128) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
          canvas.width = img.width * scale
          canvas.height = img.height * scale
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/png'))
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileUpload = async (event, target) => {
    const file = event.target.files?.[0]
    if (!file) return
    const dataUrl = await resizeImage(file)
    if (target === 'light') {
      customIcon = dataUrl
      iconSource = 'custom'
    } else {
      customIconDark = dataUrl
      iconSource = 'custom'
    }
  }

  const applyBrowserTab = (tab) => {
    name = tab.title.trim() || tab.url
    url = tab.url
    if (iconSource === 'custom') iconSource = 'auto'
  }

  const getGroupSelectionState = (group) => {
    const groupTabs = group.allTabs || group.tabs
    const selectedCount = groupTabs.filter((tab) => selectedBrowserTabIds.includes(tab.id)).length
    if (selectedCount === 0) return 'none'
    if (selectedCount === groupTabs.length) return 'all'
    return 'partial'
  }

  const toggleBrowserTabSelection = (tab) => {
    const nextIds = selectedBrowserTabIds.includes(tab.id)
      ? selectedBrowserTabIds.filter((id) => id !== tab.id)
      : (allowMultiTabSelection ? [...selectedBrowserTabIds, tab.id] : [tab.id])

    selectedBrowserTabIds = nextIds

    if (nextIds.length === 1) {
      const onlyTab = browserTabMap.get(nextIds[0])
      if (onlyTab) applyBrowserTab(onlyTab)
    }
  }

  const toggleBrowserGroupSelection = (group) => {
    if (!allowMultiTabSelection) return

    const groupTabs = group.allTabs || group.tabs
    const groupTabIds = groupTabs.map((tab) => tab.id)
    const isFullySelected = groupTabIds.every((id) => selectedBrowserTabIds.includes(id))

    const nextIds = isFullySelected
      ? selectedBrowserTabIds.filter((id) => !groupTabIds.includes(id))
      : [...new Set([...selectedBrowserTabIds, ...groupTabIds])]

    selectedBrowserTabIds = nextIds

    if (nextIds.length === 1) {
      const onlyTab = browserTabMap.get(nextIds[0])
      if (onlyTab) applyBrowserTab(onlyTab)
    }
  }

  const getGroupTitle = (group) => {
    return group.title || $t('site.currentTabsGroupUnnamed')
  }

  const getGroupColor = (group) => {
    return tabGroupColors[group.color] || tabGroupColors.grey
  }

  const getGroupTabCount = (group) => {
    return (group.allTabs || group.tabs).length
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (entryType === 'folder') {
      const data = await folderForm.getData()
      if (data) onsave?.(data)
      return
    }

    if (!name.trim()) return
    if (!url.trim()) return
    let finalUrl = url.trim()
    if (!/^https?:\/\//.test(finalUrl)) finalUrl = 'https://' + finalUrl
    const data = { name: name.trim(), url: finalUrl, iconSource, iconRadius }
    if (iconSource === 'custom') {
      data.customIcon = customIcon
      data.customIconDark = separateDark ? customIconDark : ''
    } else {
      data.customIcon = ''
      data.customIconDark = ''
    }
    onsave?.(data)
  }
</script>

<svelte:window onkeydown={(event) => { if (event.key === 'Escape') onclose?.() }} />

<div
  class="fixed inset-0 bg-black/50 flex items-center justify-center z-100"
  onpointerdown={handleBackdropPointerDown}
  onpointerup={handleBackdropPointerUp}
  onpointercancel={handleBackdropPointerCancel}
  onkeydown={(event) => { if (event.key === 'Escape') onclose?.() }}
  role="dialog"
  aria-modal="true"
  tabindex="-1"
>
  <div class="rounded-2xl p-6 w-[min(72rem,calc(100vw-1.5rem))] h-[min(90vh,48rem)] shadow-2xl overflow-hidden flex flex-col not-dark:bg-white dark:bg-neutral-800">
    <h2 class="text-lg font-semibold mb-4 not-dark:text-neutral-800 dark:text-neutral-100">
      {isEdit ? $t(editingFolder ? 'folder.editFolder' : 'site.edit') : $t(entryType === 'folder' ? 'site.newFolder' : 'site.add')}
    </h2>

    <form onsubmit={handleSubmit} class="min-h-0 flex flex-1 flex-col gap-4">
      {#if allowFolder && !isEdit}
        <Tabs
          value={entryType}
          dark={dark}
          items={[
            { value: 'site', label: $t('site.typeSite') },
            { value: 'folder', label: $t('site.typeFolder') },
          ]}
          onChange={(value) => entryType = value}
        />
      {/if}

      <div class="min-h-0 flex-1 overflow-hidden">
        {#if entryType === 'folder'}
          <FolderForm bind:this={folderForm} folder={editingFolder ? site : null} {folderId} {siteTree} {dark} />
        {:else}
        <div class="grid h-full min-h-0 gap-6 lg:grid-cols-2">
          <div class="h-full min-h-0 overflow-y-auto pl-1 pr-1 space-y-3">

            <div>
              <label class="block text-sm mb-1 not-dark:text-neutral-600 dark:text-neutral-400" for="site-name">{$t('site.name')}</label>
              <input
                id="site-name"
                type="text"
                value={name}
                oninput={(event) => {
                  name = event.currentTarget.value
                  hasManualNameInput = true
                }}
                disabled={useBatchTabs}
                placeholder={$t('site.namePh')}
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:cursor-not-allowed not-dark:bg-white not-dark:border-neutral-300 not-dark:focus:ring-neutral-800 not-dark:disabled:bg-neutral-100 not-dark:disabled:text-neutral-400 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white dark:focus:ring-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500"
              />
            </div>

              <div>
                <label class="block text-sm mb-1 not-dark:text-neutral-600 dark:text-neutral-400" for="site-url">{$t('site.url')}</label>
                <input
                  id="site-url"
                  type="text"
                  bind:value={url}
                  disabled={useBatchTabs}
                  placeholder={$t('site.urlPh')}
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:cursor-not-allowed not-dark:bg-white not-dark:border-neutral-300 not-dark:focus:ring-neutral-800 not-dark:disabled:bg-neutral-100 not-dark:disabled:text-neutral-400 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white dark:focus:ring-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500"
                />
              </div>

              {#if !useBatchTabs}
                <div>
                <span class="block text-sm mb-2 not-dark:text-neutral-600 dark:text-neutral-400">{$t('site.icon')}</span>

                {#if hasUrl}
                  <div class="flex flex-wrap gap-3 mb-2">
                    {#each pickableSourceKeys as key}
                      <button
                        type="button"
                        class="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border-2 transition-all w-22 {activeSource === key
                          ? 'not-dark:border-neutral-800 not-dark:bg-neutral-100 dark:border-white dark:bg-white/10'
                          : 'not-dark:border-neutral-200 not-dark:hover:border-neutral-300 not-dark:bg-neutral-50 dark:border-neutral-600 dark:hover:border-neutral-500 dark:bg-neutral-700/50'}"
                        onclick={() => selectSource(key)}
                      >
                        <img
                          src={key === 'auto' ? (autoPreview || getFaviconBySource(fullUrl, key)) : getFaviconBySource(fullUrl, key)}
                          alt=""
                          class="w-12 h-12"
                          style="border-radius: {iconRadius}%"
                          onerror={(event) => { event.target.style.opacity = '0.2' }}
                        />
                        <span class="text-2xs truncate w-full text-center not-dark:text-neutral-500 dark:text-neutral-400">{iconSources[key].name}</span>
                      </button>
                    {/each}

                    <button
                      type="button"
                      class="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border-2 transition-all w-22 {iconSource === 'custom'
                        ? 'not-dark:border-neutral-800 not-dark:bg-neutral-100 dark:border-white dark:bg-white/10'
                        : 'not-dark:border-neutral-200 not-dark:hover:border-neutral-300 not-dark:bg-neutral-50 dark:border-neutral-600 dark:hover:border-neutral-500 dark:bg-neutral-700/50'}"
                      onclick={() => { iconSource = 'custom' }}
                    >
                      {#if customIcon}
                        <img src={customIcon} alt="" class="w-12 h-12" style="border-radius: {iconRadius}%" />
                      {:else}
                        <span class="w-12 h-12 flex items-center justify-center text-xl not-dark:text-neutral-400 dark:text-neutral-500">📁</span>
                      {/if}
                      <span class="text-2xs truncate w-full text-center not-dark:text-neutral-500 dark:text-neutral-400">{$t('site.iconCustom')}</span>
                    </button>
                  </div>
                {/if}

                {#if iconSource === 'custom'}
                  <div class="space-y-2 p-3 rounded-lg not-dark:bg-neutral-50 dark:bg-neutral-700/50">
                    <div class="flex items-center gap-3">
                      {#if customIcon}
                        <img src={customIcon} alt="" class="w-8 h-8 rounded shrink-0" />
                      {/if}
                      <div class="flex-1">
                        <span class="text-xs not-dark:text-neutral-500 dark:text-neutral-400">{$t('site.iconLight')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onchange={(event) => handleFileUpload(event, 'light')}
                          class="block w-full text-xs mt-1 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs not-dark:text-neutral-500 not-dark:file:bg-neutral-200 not-dark:file:text-neutral-700 dark:text-neutral-300 dark:file:bg-neutral-600 dark:file:text-neutral-200"
                        />
                      </div>
                    </div>

                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" bind:checked={separateDark} class="rounded accent-white" />
                      <span class="text-xs not-dark:text-neutral-500 dark:text-neutral-400">{$t('site.iconSeparateDark')}</span>
                    </label>

                    {#if separateDark}
                      <div class="flex items-center gap-3">
                        {#if customIconDark}
                          <img src={customIconDark} alt="" class="w-8 h-8 rounded shrink-0" />
                        {/if}
                        <div class="flex-1">
                          <span class="text-xs not-dark:text-neutral-500 dark:text-neutral-400">{$t('site.iconDark')}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onchange={(event) => handleFileUpload(event, 'dark')}
                            class="block w-full text-xs mt-1 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs not-dark:text-neutral-500 not-dark:file:bg-neutral-200 not-dark:file:text-neutral-700 dark:text-neutral-300 dark:file:bg-neutral-600 dark:file:text-neutral-200"
                          />
                        </div>
                      </div>
                    {/if}
                  </div>
                {/if}

                <div class="flex items-center gap-3 mt-2">
                  <span class="text-xs shrink-0 not-dark:text-neutral-500 dark:text-neutral-400">{$t('site.iconRadius')}</span>
                  <input type="range" min="0" max="50" step="1" bind:value={iconRadius} class="flex-1" />
                  <span class="text-xs w-8 text-right not-dark:text-neutral-500 dark:text-neutral-400">{iconRadius}%</span>
                </div>
                </div>
              {/if}

              {#if useBatchTabs}
                <div class="rounded-lg px-3 py-2 text-xs not-dark:bg-neutral-100 not-dark:text-neutral-600 dark:bg-neutral-700/60 dark:text-neutral-300">
                  {$t('site.currentTabsBatchHint')}
                </div>
              {/if}
          </div>

          {#if showBrowserTabsPanel}
            <div class="h-full min-h-0 overflow-hidden rounded-2xl border p-4 flex flex-col gap-3 not-dark:border-neutral-200 not-dark:bg-neutral-50/70 dark:border-neutral-700 dark:bg-neutral-900/30">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-sm not-dark:text-neutral-700 dark:text-neutral-300">{$t('site.currentTabs')}</div>
                  <div class="text-xs text-neutral-500">
                    {$t('site.currentTabsHint')}
                  </div>
                </div>
                <span class="text-xs shrink-0 not-dark:text-neutral-400 dark:text-neutral-500">
                  {#if selectedBrowserTabs.length > 0}
                    {$t('site.currentTabsSelected')} {selectedBrowserTabs.length}
                  {:else}
                    {browserTabs.length}
                  {/if}
                </span>
              </div>

              {#if showTabSearch}
                <input
                  type="text"
                  bind:value={tabSearch}
                  placeholder={$t('site.currentTabsSearch')}
                  class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 not-dark:bg-white not-dark:border-neutral-300 not-dark:focus:ring-neutral-800 not-dark:placeholder:text-neutral-400 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white dark:focus:ring-neutral-400 dark:placeholder:text-neutral-500"
                />
              {/if}

              {#if filteredTabEntries.length === 0}
                <div class="rounded-lg border border-dashed px-3 py-4 text-sm not-dark:border-neutral-200 not-dark:text-neutral-500 dark:border-neutral-600 dark:text-neutral-400">
                  {$t('site.currentTabsEmpty')}
                </div>
              {:else}
                <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-lg border not-dark:border-neutral-200 not-dark:bg-white/80 dark:border-neutral-700 dark:bg-neutral-900/20 divide-y not-dark:divide-neutral-100 dark:divide-neutral-700">
                  {#each filteredTabEntries as entry}
                    {#if entry.type === 'group'}
                      <div class="px-2 py-2">
                        <label
                          class="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors {allowMultiTabSelection ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'} {getGroupSelectionState(entry) === 'all'
                            ? 'not-dark:bg-white dark:bg-neutral-700/70'
                            : ''} not-dark:hover:bg-white dark:hover:bg-neutral-700/70"
                        >
                          <input
                            type="checkbox"
                            checked={getGroupSelectionState(entry) === 'all'}
                            disabled={!allowMultiTabSelection}
                            indeterminate={getGroupSelectionState(entry) === 'partial'}
                            onchange={() => toggleBrowserGroupSelection(entry)}
                            class="rounded accent-white shrink-0"
                          />
                          <span
                            class="w-2.5 h-2.5 rounded-full shrink-0"
                            style="background-color: {getGroupColor(entry)};"
                          ></span>
                          <span class="min-w-0 flex-1 flex items-center gap-2">
                            <span class="block text-compact leading-5 truncate font-medium not-dark:text-neutral-900 dark:text-neutral-100">
                              {getGroupTitle(entry)}
                            </span>
                            <span class="text-caption shrink-0 not-dark:text-neutral-400 dark:text-neutral-500">
                              {getGroupTabCount(entry)}
                            </span>
                          </span>
                        </label>

                        <div class="ml-6 mt-1 overflow-hidden rounded-lg border not-dark:border-neutral-200 not-dark:bg-white/70 dark:border-neutral-700 dark:bg-neutral-900/20">
                          {#each entry.tabs as tab}
                            <label
                              class="w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors cursor-pointer {selectedBrowserTabIds.includes(tab.id)
                                ? 'not-dark:bg-neutral-50 dark:bg-neutral-700/70'
                                : ''} not-dark:hover:bg-neutral-50 dark:hover:bg-neutral-700/70"
                            >
                              <input
                                type="checkbox"
                                checked={selectedBrowserTabIds.includes(tab.id)}
                                onchange={() => toggleBrowserTabSelection(tab)}
                                class="rounded accent-white shrink-0"
                              />
                              {#if tab.favIconUrl}
                                <img src={tab.favIconUrl} alt="" class="w-4 h-4 rounded-sm shrink-0" />
                              {:else}
                                <span class="w-4 h-4 rounded-sm shrink-0 not-dark:bg-neutral-200 dark:bg-neutral-700"></span>
                              {/if}
                              <span class="min-w-0 flex-1">
                                <span class="block text-compact leading-5 truncate not-dark:text-neutral-800 dark:text-neutral-200">{tab.title}</span>
                              </span>
                            </label>
                          {/each}
                        </div>
                      </div>
                    {:else}
                      <label
                        class="w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors cursor-pointer {selectedBrowserTabIds.includes(entry.id)
                          ? 'not-dark:bg-white dark:bg-neutral-700/70'
                          : ''} not-dark:hover:bg-white dark:hover:bg-neutral-700/70"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrowserTabIds.includes(entry.id)}
                          onchange={() => toggleBrowserTabSelection(entry)}
                          class="rounded accent-white shrink-0"
                        />
                        {#if entry.favIconUrl}
                          <img src={entry.favIconUrl} alt="" class="w-4 h-4 rounded-sm shrink-0" />
                        {:else}
                          <span class="w-4 h-4 rounded-sm shrink-0 not-dark:bg-neutral-200 dark:bg-neutral-700"></span>
                        {/if}
                        <span class="min-w-0 flex-1">
                          <span class="block text-compact leading-5 truncate not-dark:text-neutral-800 dark:text-neutral-200">{entry.title}</span>
                        </span>
                      </label>
                    {/if}
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
        </div>
        {/if}
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button
          type="button"
          class="px-4 py-2 rounded-lg not-dark:text-neutral-600 not-dark:hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
          onclick={() => onclose?.()}
        >{$t('site.cancel')}</button>
        <button
          type="submit"
          class="px-4 py-2 rounded-lg not-dark:bg-neutral-800 not-dark:text-white not-dark:hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >{$t('site.save')}</button>
      </div>
    </form>
  </div>
</div>
