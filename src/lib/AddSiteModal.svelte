<script>
  import { onMount } from 'svelte'
  import { untrack } from 'svelte'
  import { t } from './i18n.js'
  import { queryCurrentWindowTabs } from './browserTabs.js'
  import { iconSources, pickableSourceKeys, getFaviconBySource } from './favicon.js'
  import FolderGlyph from './FolderGlyph.svelte'
  import { DEFAULT_FOLDER_BG, DEFAULT_FOLDER_RADIUS, getFolderForeground, isFolderItem } from './folders.js'

  let { site = null, availableSites = [], allowFolder = true, dark = false, onsave, onclose } = $props()

  const init = untrack(() => site ?? {})
  const isEdit = untrack(() => site !== null)
  const editingFolder = untrack(() => isFolderItem(site))

  let entryType = $state(editingFolder ? 'folder' : 'site')
  let name = $state(init.name || '')
  let url = $state(init.url || '')
  let iconSource = $state(init.iconSource || 'auto')
  let customIcon = $state(init.customIcon || '')
  let customIconDark = $state(init.customIconDark || '')
  let separateDark = $state(!!init.customIconDark)
  let iconRadius = $state(init.iconRadius ?? 4)
  let browserTabs = $state([])
  let tabSearch = $state('')
  let selectedBrowserTabIds = $state([])

  let folderBgColor = $state(init.folderBgColor || DEFAULT_FOLDER_BG)
  let folderRadius = $state(init.folderRadius ?? DEFAULT_FOLDER_RADIUS)
  let folderIconType = $state(init.folderIconType || (init.folderCustomIcon ? 'custom' : 'briefcase'))
  let folderCustomIcon = $state(init.folderCustomIcon || '')
  let selectedSiteIds = $state(
    editingFolder && Array.isArray(init.items) ? init.items.map((item) => item.id) : []
  )

  let selectableSites = $derived(
    availableSites.filter((item) => !isFolderItem(item))
  )
  let selectableMap = $derived(new Map(selectableSites.map((item) => [item.id, item])))
  let browserTabMap = $derived(new Map(browserTabs.map((tab) => [tab.id, tab])))
  let selectedBrowserTabs = $derived(
    selectedBrowserTabIds.map((id) => browserTabMap.get(id)).filter(Boolean)
  )
  let activeSource = $derived(iconSource || 'auto')
  let fullUrl = $derived(url.includes('://') ? url : 'https://' + url)
  let hasUrl = $derived(url.trim().length > 0)
  let showTabSearch = $derived(browserTabs.length > 12)
  let useBatchTabs = $derived(!isEdit && entryType === 'site' && selectedBrowserTabs.length > 1)
  let filteredTabs = $derived.by(() => {
    const keyword = tabSearch.trim().toLowerCase()
    if (!keyword) return browserTabs
    return browserTabs.filter((tab) =>
      tab.title.toLowerCase().includes(keyword) || tab.url.toLowerCase().includes(keyword)
    )
  })
  let folderPreview = $derived({
    folderBgColor,
    folderRadius,
    folderIconType,
    folderCustomIcon,
  })
  let folderStroke = $derived(getFolderForeground(folderPreview))

  function selectSource(key) {
    iconSource = key
  }

  onMount(async () => {
    if (editingFolder) return
    browserTabs = await queryCurrentWindowTabs()
  })

  function resizeImage(file, maxSize = 128) {
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

  async function handleFileUpload(event, target) {
    const file = event.target.files?.[0]
    if (!file) return
    const dataUrl = await resizeImage(file)
    if (target === 'light') {
      customIcon = dataUrl
      iconSource = 'custom'
    } else if (target === 'dark') {
      customIconDark = dataUrl
      iconSource = 'custom'
    } else {
      folderCustomIcon = dataUrl
      folderIconType = 'custom'
    }
  }

  function toggleSiteSelection(siteId) {
    const target = selectableMap.get(siteId)
    if (target?.disabled) return
    selectedSiteIds = selectedSiteIds.includes(siteId)
      ? selectedSiteIds.filter((id) => id !== siteId)
      : [...selectedSiteIds, siteId]
  }

  function applyBrowserTab(tab) {
    name = tab.title.trim() || tab.url
    url = tab.url
    if (iconSource === 'custom') iconSource = 'auto'
  }

  function toggleBrowserTabSelection(tab) {
    const nextIds = selectedBrowserTabIds.includes(tab.id)
      ? selectedBrowserTabIds.filter((id) => id !== tab.id)
      : [...selectedBrowserTabIds, tab.id]

    selectedBrowserTabIds = nextIds

    if (nextIds.length === 1) {
      const onlyTab = browserTabMap.get(nextIds[0])
      if (onlyTab) applyBrowserTab(onlyTab)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (entryType === 'folder') {
      if (!name.trim()) return
      const items = selectedSiteIds
        .map((id) => selectableMap.get(id))
        .filter(Boolean)
      onsave?.({
        type: 'folder',
        name: name.trim(),
        folderBgColor,
        folderRadius: Number(folderRadius),
        folderIconType,
        folderCustomIcon: folderIconType === 'custom' ? folderCustomIcon : '',
        items,
      })
      return
    }

    if (!isEdit && selectedBrowserTabs.length > 1) {
      onsave?.(
        selectedBrowserTabs.map((tab) => ({
          name: tab.title.trim() || tab.url,
          url: tab.url,
        }))
      )
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
  onclick={(event) => { if (event.target === event.currentTarget) onclose?.() }}
  onkeydown={(event) => { if (event.key === 'Escape') onclose?.() }}
  role="dialog"
  aria-modal="true"
  tabindex="-1"
>
  <div class="rounded-xl p-6 w-[32rem] shadow-2xl max-h-[90vh] overflow-y-auto {dark ? 'bg-neutral-800' : 'bg-white'}">
    <h2 class="text-lg font-semibold mb-4 {dark ? 'text-neutral-100' : 'text-neutral-800'}">
      {isEdit ? $t(editingFolder ? 'folder.editFolder' : 'site.edit') : $t(entryType === 'folder' ? 'site.typeFolder' : 'site.add')}
    </h2>

    <form onsubmit={handleSubmit} class="space-y-4">
      {#if allowFolder && !isEdit}
        <div>
          <span class="block text-sm mb-2 {dark ? 'text-neutral-400' : 'text-neutral-600'}">{$t('site.typeFolder')}</span>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="px-3 py-2 rounded-lg border text-sm transition-all {entryType === 'site'
                ? (dark ? 'border-white bg-white/10 text-white' : 'border-neutral-900 bg-neutral-100 text-neutral-900')
                : (dark ? 'border-neutral-600 text-neutral-300 hover:border-neutral-500' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300')}"
              onclick={() => entryType = 'site'}
            >{$t('site.typeSite')}</button>
            <button
              type="button"
              class="px-3 py-2 rounded-lg border text-sm transition-all {entryType === 'folder'
                ? (dark ? 'border-white bg-white/10 text-white' : 'border-neutral-900 bg-neutral-100 text-neutral-900')
                : (dark ? 'border-neutral-600 text-neutral-300 hover:border-neutral-500' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300')}"
              onclick={() => entryType = 'folder'}
            >{$t('site.typeFolder')}</button>
          </div>
        </div>
      {/if}

      <div>
        <label class="block text-sm mb-1 {dark ? 'text-neutral-400' : 'text-neutral-600'}" for="site-name">{$t('site.name')}</label>
        <input
          id="site-name"
          type="text"
          bind:value={name}
          disabled={useBatchTabs}
          placeholder={$t('site.namePh')}
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:cursor-not-allowed {dark ? 'bg-neutral-700 border-neutral-600 text-white focus:ring-neutral-400 disabled:bg-neutral-800 disabled:text-neutral-500' : 'bg-white border-neutral-300 focus:ring-neutral-800 disabled:bg-neutral-100 disabled:text-neutral-400'}"
        />
      </div>

      {#if entryType === 'site'}
        <div>
          <label class="block text-sm mb-1 {dark ? 'text-neutral-400' : 'text-neutral-600'}" for="site-url">{$t('site.url')}</label>
          <input
            id="site-url"
            type="text"
            bind:value={url}
            disabled={useBatchTabs}
            placeholder={$t('site.urlPh')}
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:cursor-not-allowed {dark ? 'bg-neutral-700 border-neutral-600 text-white focus:ring-neutral-400 disabled:bg-neutral-800 disabled:text-neutral-500' : 'bg-white border-neutral-300 focus:ring-neutral-800 disabled:bg-neutral-100 disabled:text-neutral-400'}"
          />
        </div>

        {#if !isEdit}
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-sm {dark ? 'text-neutral-300' : 'text-neutral-700'}">{$t('site.currentTabs')}</div>
                <div class="text-xs {dark ? 'text-neutral-500' : 'text-neutral-500'}">{$t('site.currentTabsHint')}</div>
              </div>
              <span class="text-xs shrink-0 {dark ? 'text-neutral-500' : 'text-neutral-400'}">
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
                class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 {dark ? 'bg-neutral-700 border-neutral-600 text-white focus:ring-neutral-400 placeholder:text-neutral-500' : 'bg-white border-neutral-300 focus:ring-neutral-800 placeholder:text-neutral-400'}"
              />
            {/if}

            {#if filteredTabs.length === 0}
              <div class="rounded-lg border border-dashed px-3 py-4 text-sm {dark ? 'border-neutral-600 text-neutral-400' : 'border-neutral-200 text-neutral-500'}">
                {$t('site.currentTabsEmpty')}
              </div>
            {:else}
              <div class="max-h-52 overflow-y-auto rounded-lg border {dark ? 'border-neutral-700 bg-neutral-900/30' : 'border-neutral-200 bg-neutral-50/50'} divide-y {dark ? 'divide-neutral-700' : 'divide-neutral-100'}">
                {#each filteredTabs as tab}
                  <label
                    class="w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors cursor-pointer {selectedBrowserTabIds.includes(tab.id)
                      ? (dark ? 'bg-neutral-700/70' : 'bg-white')
                      : ''} {dark ? 'hover:bg-neutral-700/70' : 'hover:bg-white'}"
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
                      <span class="w-4 h-4 rounded-sm shrink-0 {dark ? 'bg-neutral-700' : 'bg-neutral-200'}"></span>
                    {/if}
                    <span class="min-w-0 flex-1">
                      <span class="block text-[13px] leading-5 truncate {dark ? 'text-neutral-200' : 'text-neutral-800'}">{tab.title}</span>
                    </span>
                  </label>
                {/each}
              </div>
            {/if}

            {#if useBatchTabs}
              <div class="rounded-lg px-3 py-2 text-xs {dark ? 'bg-neutral-700/60 text-neutral-300' : 'bg-neutral-100 text-neutral-600'}">
                {$t('site.currentTabsBatchHint')}
              </div>
            {/if}
          </div>
        {/if}

        {#if !useBatchTabs}
          <div>
          <span class="block text-sm mb-2 {dark ? 'text-neutral-400' : 'text-neutral-600'}">{$t('site.icon')}</span>

          {#if hasUrl}
            <div class="flex flex-wrap gap-3 mb-2">
              {#each pickableSourceKeys as key}
                <button
                  type="button"
                  class="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border-2 transition-all w-22 {activeSource === key
                    ? (dark ? 'border-white bg-white/10' : 'border-neutral-800 bg-neutral-100')
                    : (dark ? 'border-neutral-600 hover:border-neutral-500 bg-neutral-700/50' : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50')}"
                  onclick={() => selectSource(key)}
                >
                  <img
                    src={getFaviconBySource(fullUrl, key)}
                    alt=""
                    class="w-12 h-12"
                    style="border-radius: {iconRadius}%"
                    onerror={(event) => { event.target.style.opacity = '0.2' }}
                  />
                  <span class="text-[10px] truncate w-full text-center {dark ? 'text-neutral-400' : 'text-neutral-500'}">{iconSources[key].name}</span>
                </button>
              {/each}

              <button
                type="button"
                class="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border-2 transition-all w-22 {iconSource === 'custom'
                  ? (dark ? 'border-white bg-white/10' : 'border-neutral-800 bg-neutral-100')
                  : (dark ? 'border-neutral-600 hover:border-neutral-500 bg-neutral-700/50' : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50')}"
                onclick={() => { iconSource = 'custom' }}
              >
                {#if customIcon}
                  <img src={customIcon} alt="" class="w-12 h-12" style="border-radius: {iconRadius}%" />
                {:else}
                  <span class="w-12 h-12 flex items-center justify-center text-xl {dark ? 'text-neutral-500' : 'text-neutral-400'}">📁</span>
                {/if}
                <span class="text-[10px] truncate w-full text-center {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$t('site.iconCustom')}</span>
              </button>
            </div>
          {/if}

          {#if iconSource === 'custom'}
            <div class="space-y-2 p-3 rounded-lg {dark ? 'bg-neutral-700/50' : 'bg-neutral-50'}">
              <div class="flex items-center gap-3">
                {#if customIcon}
                  <img src={customIcon} alt="" class="w-8 h-8 rounded shrink-0" />
                {/if}
                <div class="flex-1">
                  <span class="text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$t('site.iconLight')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onchange={(event) => handleFileUpload(event, 'light')}
                    class="block w-full text-xs mt-1 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs {dark ? 'text-neutral-300 file:bg-neutral-600 file:text-neutral-200' : 'text-neutral-500 file:bg-neutral-200 file:text-neutral-700'}"
                  />
                </div>
              </div>

              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" bind:checked={separateDark} class="rounded accent-white" />
                <span class="text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$t('site.iconSeparateDark')}</span>
              </label>

              {#if separateDark}
                <div class="flex items-center gap-3">
                  {#if customIconDark}
                    <img src={customIconDark} alt="" class="w-8 h-8 rounded shrink-0" />
                  {/if}
                  <div class="flex-1">
                    <span class="text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$t('site.iconDark')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onchange={(event) => handleFileUpload(event, 'dark')}
                      class="block w-full text-xs mt-1 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs {dark ? 'text-neutral-300 file:bg-neutral-600 file:text-neutral-200' : 'text-neutral-500 file:bg-neutral-200 file:text-neutral-700'}"
                    />
                  </div>
                </div>
              {/if}
            </div>
          {/if}

          <div class="flex items-center gap-3 mt-2">
            <span class="text-xs shrink-0 {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$t('site.iconRadius')}</span>
            <input type="range" min="0" max="50" step="1" bind:value={iconRadius} class="flex-1" />
            <span class="text-xs w-8 text-right {dark ? 'text-neutral-400' : 'text-neutral-500'}">{iconRadius}%</span>
          </div>
          </div>
        {/if}
      {:else}
        <div class="grid grid-cols-[1fr_auto] gap-4 items-start">
          <div class="space-y-4">
            <div>
              <label class="block text-sm mb-1 {dark ? 'text-neutral-400' : 'text-neutral-600'}" for="folder-color">{$t('site.folderBgColor')}</label>
              <div class="flex items-center gap-3">
                <input id="folder-color" type="color" bind:value={folderBgColor} class="w-14 h-10 rounded border-0 bg-transparent p-0" />
                <span class="text-sm {dark ? 'text-neutral-300' : 'text-neutral-700'}">{folderBgColor}</span>
              </div>
            </div>

            <div>
              <div class="flex items-center gap-3">
                <span class="text-sm shrink-0 {dark ? 'text-neutral-400' : 'text-neutral-600'}">{$t('site.folderRadius')}</span>
                <input type="range" min="8" max="40" step="1" bind:value={folderRadius} class="flex-1" />
                <span class="text-xs w-10 text-right {dark ? 'text-neutral-400' : 'text-neutral-500'}">{folderRadius}px</span>
              </div>
            </div>

            <div>
              <span class="block text-sm mb-2 {dark ? 'text-neutral-400' : 'text-neutral-600'}">{$t('site.folderIconMode')}</span>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  class="px-3 py-2 rounded-lg border text-sm transition-all {folderIconType === 'briefcase'
                    ? (dark ? 'border-white bg-white/10 text-white' : 'border-neutral-900 bg-neutral-100 text-neutral-900')
                    : (dark ? 'border-neutral-600 text-neutral-300 hover:border-neutral-500' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300')}"
                  onclick={() => folderIconType = 'briefcase'}
                >{$t('site.folderIconDefault')}</button>
                <button
                  type="button"
                  class="px-3 py-2 rounded-lg border text-sm transition-all {folderIconType === 'custom'
                    ? (dark ? 'border-white bg-white/10 text-white' : 'border-neutral-900 bg-neutral-100 text-neutral-900')
                    : (dark ? 'border-neutral-600 text-neutral-300 hover:border-neutral-500' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300')}"
                  onclick={() => folderIconType = 'custom'}
                >{$t('site.folderIconCustom')}</button>
              </div>

              {#if folderIconType === 'custom'}
                <div class="mt-3 p-3 rounded-lg {dark ? 'bg-neutral-700/50' : 'bg-neutral-50'}">
                  <input
                    type="file"
                    accept="image/*"
                    onchange={(event) => handleFileUpload(event, 'folder')}
                    class="block w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs {dark ? 'text-neutral-300 file:bg-neutral-600 file:text-neutral-200' : 'text-neutral-500 file:bg-neutral-200 file:text-neutral-700'}"
                  />
                </div>
              {/if}
            </div>
          </div>

          <div class="w-28 flex flex-col items-center gap-2">
            <div
              class="w-24 h-24 flex items-center justify-center"
              style="background: {folderBgColor}; border-radius: {folderRadius}px;"
            >
              <FolderGlyph folder={folderPreview} size={52} />
            </div>
            {#if folderIconType !== 'custom'}
              <span class="text-[11px] {dark ? 'text-neutral-400' : 'text-neutral-500'}">{folderStroke}</span>
            {/if}
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm {dark ? 'text-neutral-400' : 'text-neutral-600'}">{$t('site.folderSites')}</span>
            <span class="text-xs {dark ? 'text-neutral-500' : 'text-neutral-400'}">{selectedSiteIds.length}</span>
          </div>

          {#if selectableSites.length === 0}
            <div class="rounded-lg border border-dashed px-3 py-4 text-sm {dark ? 'border-neutral-600 text-neutral-400' : 'border-neutral-200 text-neutral-500'}">
              {$t('site.folderEmptyHint')}
            </div>
          {:else}
            <div class="max-h-52 overflow-y-auto rounded-lg border p-2 {dark ? 'border-neutral-700' : 'border-neutral-200'}">
              <div class="grid grid-cols-3 gap-2">
              {#each selectableSites as selectable}
                <label
                  class="flex items-center gap-2 rounded-lg px-2.5 py-2 min-w-0 {selectable.disabled
                    ? 'opacity-45 cursor-not-allowed'
                    : 'cursor-pointer ' + (dark ? 'hover:bg-neutral-700/60' : 'hover:bg-neutral-50')}"
                >
                  <input
                    type="checkbox"
                    checked={selectedSiteIds.includes(selectable.id)}
                    disabled={selectable.disabled}
                    onchange={() => toggleSiteSelection(selectable.id)}
                    class="rounded accent-white shrink-0"
                  />
                  <span class="min-w-0 flex-1 text-sm truncate {dark ? 'text-neutral-200' : 'text-neutral-800'}">
                    {selectable.name}
                  </span>
                </label>
              {/each}
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <div class="flex justify-end gap-3 pt-2">
        <button
          type="button"
          class="px-4 py-2 rounded-lg {dark ? 'text-neutral-200 hover:bg-neutral-700' : 'text-neutral-600 hover:bg-neutral-100'}"
          onclick={() => onclose?.()}
        >{$t('site.cancel')}</button>
        <button
          type="submit"
          class="px-4 py-2 rounded-lg {dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-800 text-white hover:bg-neutral-700'}"
        >{$t('site.save')}</button>
      </div>
    </form>
  </div>
</div>
