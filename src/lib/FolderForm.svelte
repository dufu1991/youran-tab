<script>
  import { onMount, tick, untrack } from 'svelte'
  import { t } from './i18n.js'
  import { queryCurrentWindowTabs } from './browserTabs.js'
  import { resolveSiteIcon, getFaviconFallback, handleIconLoad } from './favicon.js'
  import FolderGlyph from './FolderGlyph.svelte'
  import Tabs from './Tabs.svelte'
  import {
    DEFAULT_FOLDER_BG,
    DEFAULT_FOLDER_ICON_SCALE,
    DEFAULT_FOLDER_ICON_TYPE,
    DEFAULT_FOLDER_RADIUS,
    DEFAULT_FOLDER_SHOW_BACKGROUND,
    getFolderCoverCount,
    getFolderSites,
    isFolderItem,
  } from './folders.js'

  // folder：正在编辑的文件夹，新建时为空；siteTree：完整站点树，用于列出可加入的网站
  let { folder = null, folderId, siteTree = [], dark = false } = $props()

  const TAB_GROUP_COLORS = {
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

  const SVG_SOURCE_SITES = [
    { name: 'Tabler Icons', url: 'https://tabler.io/icons' },
    { name: 'Lucide', url: 'https://lucide.dev/' },
    { name: 'Iconify', url: 'https://icon-sets.iconify.design/' },
    { name: 'Iconoir', url: 'https://iconoir.com/' },
    { name: 'Remix Icon', url: 'https://remixicon.com/' },
    { name: 'SVG Repo', url: 'https://www.svgrepo.com/' },
  ]

  const SVG_PREFIX = 'data:image/svg+xml;charset=utf-8,'

  const decodeSvgDataUrl = (dataUrl) => {
    if (typeof dataUrl !== 'string') return ''
    if (dataUrl.startsWith('<svg')) return dataUrl
    if (!dataUrl.startsWith(SVG_PREFIX)) return ''
    try {
      return decodeURIComponent(dataUrl.slice(SVG_PREFIX.length))
    } catch {
      return ''
    }
  }

  const encodeSvgDataUrl = (markup) => {
    const normalized = markup.trim()
    return normalized.startsWith('<svg') ? `${SVG_PREFIX}${encodeURIComponent(normalized)}` : ''
  }

  const createSiteFromTab = (tab) => ({
    id: crypto.randomUUID(),
    name: tab.title.trim() || tab.url,
    url: tab.url,
    iconSource: 'auto',
    iconRadius: 4,
  })

  const init = untrack(() => folder ?? {})
  const isEdit = untrack(() => !!folder)

  let name = $state(init.name || '')
  let nameTouched = $state(!!init.name)
  let nameError = $state(false)
  let nameInputEl = $state(null)

  let folderIconType = $state(init.folderIconType || (init.folderCustomIcon ? 'custom' : DEFAULT_FOLDER_ICON_TYPE))
  let folderBgColor = $state(init.folderBgColor || DEFAULT_FOLDER_BG)
  let folderShowBackground = $state(init.folderShowBackground ?? DEFAULT_FOLDER_SHOW_BACKGROUND)
  let folderRadius = $state(init.folderRadius ?? DEFAULT_FOLDER_RADIUS)
  let folderIconScale = $state(init.folderIconScale ?? DEFAULT_FOLDER_ICON_SCALE)
  let folderCustomIcon = $state(init.folderCustomIcon || '')
  let folderSvgMarkup = $state(init.folderIconType === 'svg' ? decodeSvgDataUrl(init.folderCustomIcon) : '')

  // 文件夹内容：有序列表，顺序即保存后的顺序；key 用来去重和勾选状态判断
  let entries = $state(untrack(() => getFolderSites(folder).map((site) => ({ key: site.id, site, favIconUrl: '' }))))
  let entryKeys = $derived(new Set(entries.map((entry) => entry.key)))
  // 宫格和堆叠用文件夹里的网站图标拼出文件夹图标，排在前面的几个标记为「封面」
  let showsSiteIcons = $derived(folderIconType === 'grid' || folderIconType === 'stack')
  let coverCount = $derived(getFolderCoverCount(folderIconType, entries.length))

  let pickerSource = $state('sites')
  let search = $state('')
  let browserTabEntries = $state([])
  let dragIndex = $state(-1)
  let dragOverIndex = $state(-1)
  // 标签页组默认折叠；搜索时有匹配的组自动展开
  let expandedGroups = $state(new Set())

  // 可加入的网站：主列表里的网站，以及各个文件夹里的网站（会注明所在文件夹，选中后移入当前文件夹）
  let sourceSites = $derived.by(() => {
    const list = []
    for (const item of siteTree) {
      if (isFolderItem(item)) {
        for (const child of getFolderSites(item)) {
          list.push({ site: child, folderName: item.id === folderId ? '' : item.name })
        }
        continue
      }
      list.push({ site: item, folderName: '' })
    }
    return list
  })

  let keyword = $derived(search.trim().toLowerCase())
  const matches = (...values) => !keyword || values.some((value) => (value || '').toLowerCase().includes(keyword))

  let filteredSites = $derived(sourceSites.filter(({ site }) => matches(site.name, site.url)))
  let browserTabCount = $derived(browserTabEntries.reduce((total, entry) => total + (entry.type === 'group' ? entry.tabs.length : 1), 0))
  let filteredTabEntries = $derived.by(() => {
    if (!keyword) return browserTabEntries
    return browserTabEntries.reduce((result, entry) => {
      if (entry.type !== 'group') {
        if (matches(entry.title, entry.url)) result.push(entry)
        return result
      }
      const groupMatched = matches(entry.title)
      const tabs = groupMatched ? entry.tabs : entry.tabs.filter((tab) => matches(tab.title, tab.url))
      if (tabs.length > 0) result.push({ ...entry, allTabs: entry.tabs, tabs })
      return result
    }, [])
  })

  let preview = $derived({
    id: folderId,
    items: entries.map((entry) => entry.site),
    folderBgColor,
    folderShowBackground,
    folderRadius,
    folderIconScale,
    folderIconType,
    folderCustomIcon,
  })

  onMount(async () => {
    browserTabEntries = await queryCurrentWindowTabs()
    if (!isEdit) nameInputEl?.focus()
  })

  const tabKey = (tab) => `tab:${tab.id}`

  const addEntry = (entry) => {
    if (entryKeys.has(entry.key)) return
    entries = [...entries, entry]
  }

  const removeEntry = (key) => {
    entries = entries.filter((entry) => entry.key !== key)
  }

  const toggleSite = (site) => {
    if (entryKeys.has(site.id)) {
      removeEntry(site.id)
      return
    }
    addEntry({ key: site.id, site, favIconUrl: '' })
  }

  const toggleTab = (tab) => {
    const key = tabKey(tab)
    if (entryKeys.has(key)) {
      removeEntry(key)
      return
    }
    addEntry({ key, site: createSiteFromTab(tab), favIconUrl: tab.favIconUrl })
  }

  const getGroupTabs = (group) => group.allTabs || group.tabs
  const getGroupTitle = (group) => group.title || $t('site.currentTabsGroupUnnamed')

  const getGroupState = (group) => {
    const tabs = getGroupTabs(group)
    const count = tabs.filter((tab) => entryKeys.has(tabKey(tab))).length
    if (count === 0) return 'none'
    return count === tabs.length ? 'all' : 'partial'
  }

  const isGroupExpanded = (group) => !!keyword || expandedGroups.has(group.id)

  const toggleGroupExpanded = (group) => {
    const next = new Set(expandedGroups)
    if (next.has(group.id)) next.delete(group.id)
    else next.add(group.id)
    expandedGroups = next
  }

  const getGroupSelectedCount = (group) => getGroupTabs(group).filter((tab) => entryKeys.has(tabKey(tab))).length

  const toggleGroup = (group) => {
    const tabs = getGroupTabs(group)
    if (getGroupState(group) === 'all') {
      const keys = new Set(tabs.map(tabKey))
      entries = entries.filter((entry) => !keys.has(entry.key))
      return
    }
    // 新建文件夹且还没起名时，用标签页组的名字作为文件夹名
    if (!isEdit && !nameTouched && !name.trim()) name = getGroupTitle(group)
    tabs.forEach((tab) => addEntry({ key: tabKey(tab), site: createSiteFromTab(tab), favIconUrl: tab.favIconUrl }))
  }

  const handleDrop = (index) => {
    if (dragIndex < 0 || dragIndex === index) return
    const next = [...entries]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(index, 0, moved)
    entries = next
  }

  const resetDrag = () => {
    dragIndex = -1
    dragOverIndex = -1
  }

  const resizeImage = (file, maxSize = 128) => new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/png'))
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  })

  const handleIconUpload = async (event) => {
    const file = event.currentTarget.files?.[0]
    if (!file) return
    folderCustomIcon = await resizeImage(file)
  }

  const handleSvgInput = (event) => {
    folderSvgMarkup = event.currentTarget.value
    folderCustomIcon = encodeSvgDataUrl(folderSvgMarkup)
  }

  const handleIconTypeChange = (value) => {
    folderIconType = value
    // 自定义图片和 SVG 共用 folderCustomIcon，切换时恢复各自的内容
    if (value === 'svg') folderCustomIcon = encodeSvgDataUrl(folderSvgMarkup)
    if (value === 'custom' && folderCustomIcon.startsWith(SVG_PREFIX)) folderCustomIcon = ''
  }

  // 供外层弹窗在保存时调用；名称为空时提示并返回 null
  export const getData = async () => {
    if (!name.trim()) {
      nameError = true
      await tick()
      nameInputEl?.focus()
      return null
    }
    const hasCustomIcon = folderIconType === 'custom' || folderIconType === 'svg'
    return {
      type: 'folder',
      id: folderId,
      name: name.trim(),
      folderBgColor,
      folderShowBackground,
      folderRadius: Number(folderRadius),
      folderIconScale: Number(folderIconScale),
      folderIconType,
      folderCustomIcon: hasCustomIcon ? folderCustomIcon : '',
      items: entries.map((entry) => entry.site),
    }
  }

  const labelClass = $derived(`text-sm not-dark:text-neutral-600 dark:text-neutral-400`)
  const mutedClass = 'not-dark:text-neutral-400 dark:text-neutral-500'
  const hintClass = $derived(`text-xs leading-5 not-dark:text-neutral-500 dark:text-neutral-400`)
  const inputClass = $derived(`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 not-dark:bg-white not-dark:border-neutral-300 not-dark:focus:ring-neutral-800 not-dark:placeholder:text-neutral-400 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white dark:focus:ring-neutral-400 dark:placeholder:text-neutral-500`)
  const rowHoverClass = 'not-dark:hover:bg-black/4 dark:hover:bg-white/6'
</script>

{#snippet checkMark(state)}
  <span
    class="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors
      {state === 'none'
        ? 'not-dark:border-neutral-300 not-dark:bg-white dark:border-neutral-500'
        : 'not-dark:bg-neutral-800 not-dark:border-neutral-800 not-dark:text-white dark:bg-white dark:border-white dark:text-black'}"
    aria-hidden="true"
  >
    {#if state === 'all'}
      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    {:else if state === 'partial'}
      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M6 12h12" /></svg>
    {/if}
  </span>
{/snippet}

{#snippet tabIcon(favIconUrl)}
  {#if favIconUrl}
    <img src={favIconUrl} alt="" class="w-5 h-5 rounded shrink-0 object-contain" />
  {:else}
    <span class="w-5 h-5 rounded shrink-0 not-dark:bg-neutral-200 dark:bg-neutral-700"></span>
  {/if}
{/snippet}

{#snippet siteIcon(site, favIconUrl)}
  {#if favIconUrl}
    <img src={favIconUrl} alt="" class="w-5 h-5 rounded shrink-0 object-contain" />
  {:else}
    <img
      src={resolveSiteIcon(site, dark)}
      alt=""
      class="w-5 h-5 shrink-0 object-contain"
      style="border-radius: {site.iconRadius ?? 4}%"
      onload={(event) => handleIconLoad(event, site)}
      onerror={(event) => { if (site.iconSource !== 'custom') event.currentTarget.src = getFaviconFallback(site.url) }}
    />
  {/if}
{/snippet}

<div class="grid h-full min-h-0 gap-6 lg:grid-cols-2">
  <!-- 左侧：外观与文件夹内容 -->
  <div class="h-full min-h-0 flex flex-col gap-4 overflow-y-auto px-1">
    <div class="flex items-center gap-4">
      <div class="w-20 h-20 shrink-0 rounded-2xl flex items-center justify-center not-dark:bg-neutral-100 dark:bg-neutral-900/50">
        <FolderGlyph folder={preview} size={48} />
      </div>
      <div class="flex-1 min-w-0">
        <label class="block mb-1 {labelClass}" for="folder-name">{$t('site.name')}</label>
        <input
          id="folder-name"
          bind:this={nameInputEl}
          type="text"
          value={name}
          oninput={(event) => {
            name = event.currentTarget.value
            nameTouched = true
            if (name.trim()) nameError = false
          }}
          placeholder={$t('site.folderNamePh')}
          aria-invalid={nameError}
          class="{inputClass} {nameError ? 'border-red-400 focus:ring-red-400' : ''}"
        />
        {#if nameError}
          <p class="mt-1 text-xs text-red-500">{$t('site.folderNameRequired')}</p>
        {/if}
      </div>
    </div>

    <div class="space-y-2.5">
      <span class="block {labelClass}">{$t('site.folderIconMode')}</span>
      <Tabs
        value={folderIconType}
        {dark}
        items={[
          { value: 'grid', label: $t('site.folderIconGrid') },
          { value: 'stack', label: $t('site.folderIconStack') },
          { value: 'briefcase', label: $t('site.folderIconDefault') },
          { value: 'custom', label: $t('site.folderIconCustom') },
          { value: 'svg', label: $t('site.folderIconSvg') },
        ]}
        onChange={handleIconTypeChange}
      />

      {#if folderIconType === 'custom'}
        <div class="p-3 rounded-lg not-dark:bg-neutral-50 dark:bg-neutral-700/50">
          <input
            type="file"
            accept="image/*"
            onchange={handleIconUpload}
            class="block w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs not-dark:text-neutral-500 not-dark:file:bg-neutral-200 not-dark:file:text-neutral-700 dark:text-neutral-300 dark:file:bg-neutral-600 dark:file:text-neutral-200"
          />
          <p class="mt-2 {hintClass}">{$t('site.folderIconCustomHint')}</p>
        </div>
      {/if}

      {#if folderIconType === 'svg'}
        <div class="p-3 rounded-lg not-dark:bg-neutral-50 dark:bg-neutral-700/50">
          <textarea
            value={folderSvgMarkup}
            oninput={handleSvgInput}
            placeholder={$t('site.folderIconSvgPlaceholder')}
            rows="4"
            class="{inputClass} block resize-y text-xs leading-5"
          ></textarea>
          <p class="mt-2 {hintClass}">
            {$t('site.folderIconSvgSources')}
            {#each SVG_SOURCE_SITES as source, index}
              <a href={source.url} target="_blank" rel="noreferrer" class="underline underline-offset-2 not-dark:text-neutral-700 not-dark:hover:text-black dark:text-neutral-300 dark:hover:text-white">{source.name}</a>{index < SVG_SOURCE_SITES.length - 1 ? '、' : ''}
            {/each}
          </p>
        </div>
      {/if}

      <!-- 只显示对当前图标类型生效的外观设置；宫格和堆叠直接展示网站图标，不使用背景 -->
      <div class="space-y-2.5">
        {#if !showsSiteIcons}
          <div class="flex items-center justify-between gap-3">
            <span class={labelClass}>{$t('site.folderShowBackground')}</span>
            <div class="flex items-center gap-3">
              {#if folderShowBackground}
                <input type="color" bind:value={folderBgColor} aria-label={$t('site.folderBgColor')} class="w-8 h-6 rounded border-0 bg-transparent p-0 cursor-pointer" />
              {/if}
              <button
                type="button"
                class="relative w-9 h-5 rounded-full transition-colors {folderShowBackground ? 'not-dark:bg-neutral-800 dark:bg-neutral-300' : 'not-dark:bg-neutral-300 dark:bg-neutral-600'}"
                onclick={() => folderShowBackground = !folderShowBackground}
                role="switch"
                aria-checked={folderShowBackground}
                aria-label={$t('site.folderShowBackground')}
              >
                <span class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform {folderShowBackground ? 'translate-x-4 ' + 'not-dark:bg-white dark:bg-neutral-900' : 'bg-white'}"></span>
              </button>
            </div>
          </div>
          {#if folderShowBackground}
            <div class="flex items-center gap-3">
              <span class="shrink-0 w-20 {labelClass}">{$t('site.folderRadius')}</span>
              <input type="range" min="8" max="40" step="1" bind:value={folderRadius} class="flex-1" />
              <span class="w-10 text-right text-xs {mutedClass}">{folderRadius}px</span>
            </div>
          {/if}
        {/if}
        <div class="flex items-center gap-3">
          <span class="shrink-0 w-20 {labelClass}">{$t('site.folderIconScale')}</span>
          <input type="range" min="50" max="100" step="1" bind:value={folderIconScale} class="flex-1" />
          <span class="w-10 text-right text-xs {mutedClass}">{folderIconScale}%</span>
        </div>
      </div>
    </div>

    <div class="flex-1 min-h-48 flex flex-col">
      <div class="flex items-baseline justify-between mb-1">
        <span class={labelClass}>{$t('site.folderContents')}</span>
        <span class="text-xs {mutedClass}">{$t('site.folderSiteCount', entries.length)}</span>
      </div>
      {#if entries.length > 1}
        <p class="mb-2 {hintClass}">{$t(folderIconType === 'grid' ? 'site.folderContentsGridHint' : folderIconType === 'stack' ? 'site.folderContentsStackHint' : 'site.folderContentsHint')}</p>
      {/if}

      {#if entries.length === 0}
        <div class="flex-1 rounded-lg border border-dashed px-4 py-6 flex items-center justify-center text-center text-sm not-dark:border-neutral-200 not-dark:text-neutral-500 dark:border-neutral-600 dark:text-neutral-400">
          {$t('site.folderContentsEmpty')}
        </div>
      {:else}
        <ul class="rounded-lg border p-1 space-y-0.5 not-dark:border-neutral-200 dark:border-neutral-700">
          {#each entries as entry, index (entry.key)}
            <li
              class="group flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors cursor-grab active:cursor-grabbing {rowHoverClass}
                {dragIndex === index ? 'opacity-40' : ''}
                {dragOverIndex === index && dragIndex !== index ? 'ring-1 not-dark:ring-neutral-800/50 dark:ring-white/60' : ''}"
              draggable="true"
              ondragstart={(event) => { dragIndex = index; event.dataTransfer.effectAllowed = 'move' }}
              ondragover={(event) => { event.preventDefault(); dragOverIndex = index }}
              ondrop={(event) => { event.preventDefault(); handleDrop(index); resetDrag() }}
              ondragend={resetDrag}
            >
              <svg class="w-3.5 h-3.5 shrink-0 {mutedClass}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" /><circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
              </svg>
              {@render siteIcon(entry.site, entry.favIconUrl)}
              <span class="flex-1 min-w-0 truncate text-sm not-dark:text-neutral-800 dark:text-neutral-200">{entry.site.name}</span>
              {#if index < coverCount}
                <span class="shrink-0 rounded px-1.5 py-0.5 text-xs not-dark:bg-neutral-100 not-dark:text-neutral-500 dark:bg-white/10 dark:text-neutral-300">{$t('site.folderCover')}</span>
              {/if}
              <button
                type="button"
                class="shrink-0 w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-neutral-400 not-dark:hover:bg-black/6 not-dark:hover:text-neutral-800 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={$t('site.folderRemoveItem', entry.site.name)}
                title={$t('site.folderRemoveItem', entry.site.name)}
                onclick={() => removeEntry(entry.key)}
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>

  <!-- 右侧：从已有网站或当前标签页挑选 -->
  <div class="h-full min-h-0 rounded-2xl border p-4 flex flex-col gap-3 not-dark:border-neutral-200 not-dark:bg-neutral-50/70 dark:border-neutral-700 dark:bg-neutral-900/30">
    <Tabs
      value={pickerSource}
      {dark}
      items={[
        { value: 'sites', label: `${$t('site.folderPickSites')} ${sourceSites.length}` },
        { value: 'tabs', label: `${$t('site.currentTabs')} ${browserTabCount}` },
      ]}
      onChange={(value) => pickerSource = value}
    />
    <input type="search" bind:value={search} placeholder={$t('site.folderPickSearch')} class={inputClass} />

    <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-lg border p-1 not-dark:border-neutral-200 not-dark:bg-white dark:border-neutral-700 dark:bg-neutral-900/20">
      {#if pickerSource === 'sites'}
        {#if filteredSites.length === 0}
          <p class="px-3 py-6 text-center text-sm {mutedClass}">{$t('site.folderPickEmpty')}</p>
        {:else}
          {#each filteredSites as source, index (`${index}:${source.site.id}`)}
            <button
              type="button"
              class="w-full flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors {rowHoverClass}"
              aria-pressed={entryKeys.has(source.site.id)}
              onclick={() => toggleSite(source.site)}
            >
              {@render checkMark(entryKeys.has(source.site.id) ? 'all' : 'none')}
              {@render siteIcon(source.site, '')}
              <span class="flex-1 min-w-0 truncate text-sm not-dark:text-neutral-800 dark:text-neutral-200">{source.site.name}</span>
              {#if source.folderName}
                <span class="shrink-0 max-w-40 truncate text-xs {mutedClass}">{$t('site.folderInOther', source.folderName)}</span>
              {/if}
            </button>
          {/each}
        {/if}
      {:else if filteredTabEntries.length === 0}
        <p class="px-3 py-6 text-center text-sm {mutedClass}">{$t('site.currentTabsEmpty')}</p>
      {:else}
        {#each filteredTabEntries as entry (entry.id)}
          {#if entry.type === 'group'}
            <div class="py-0.5">
              <!-- 勾选框选择整组，点击其余部分展开或折叠 -->
              <div class="flex items-center rounded-md transition-colors {rowHoverClass}">
                <button
                  type="button"
                  class="shrink-0 pl-2 pr-1 py-1.5"
                  aria-label={getGroupTitle(entry)}
                  aria-pressed={getGroupState(entry) === 'all'}
                  onclick={() => toggleGroup(entry)}
                >
                  {@render checkMark(getGroupState(entry))}
                </button>
                <button
                  type="button"
                  class="flex-1 min-w-0 flex items-center gap-2.5 pl-1.5 pr-2 py-1.5 text-left"
                  aria-expanded={isGroupExpanded(entry)}
                  onclick={() => toggleGroupExpanded(entry)}
                >
                  <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: {TAB_GROUP_COLORS[entry.color] || TAB_GROUP_COLORS.grey};"></span>
                  <span class="flex-1 min-w-0 truncate text-sm font-medium not-dark:text-neutral-900 dark:text-neutral-100">{getGroupTitle(entry)}</span>
                  <span class="shrink-0 text-xs {mutedClass}">
                    {getGroupSelectedCount(entry) > 0 ? `${getGroupSelectedCount(entry)} / ${getGroupTabs(entry).length}` : getGroupTabs(entry).length}
                  </span>
                  <svg class="w-3.5 h-3.5 shrink-0 transition-transform {mutedClass} {isGroupExpanded(entry) ? 'rotate-90' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </button>
              </div>
              {#if isGroupExpanded(entry)}
              <div class="ml-4 pl-2 border-l not-dark:border-neutral-200 dark:border-neutral-700">
                {#each entry.tabs as tab (tab.id)}
                  <button
                    type="button"
                    class="w-full flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors {rowHoverClass}"
                    aria-pressed={entryKeys.has(tabKey(tab))}
                    onclick={() => toggleTab(tab)}
                  >
                    {@render checkMark(entryKeys.has(tabKey(tab)) ? 'all' : 'none')}
                    {@render tabIcon(tab.favIconUrl)}
                    <span class="flex-1 min-w-0 truncate text-sm not-dark:text-neutral-800 dark:text-neutral-200">{tab.title}</span>
                  </button>
                {/each}
              </div>
              {/if}
            </div>
          {:else}
            <button
              type="button"
              class="w-full flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors {rowHoverClass}"
              aria-pressed={entryKeys.has(tabKey(entry))}
              onclick={() => toggleTab(entry)}
            >
              {@render checkMark(entryKeys.has(tabKey(entry)) ? 'all' : 'none')}
              {@render tabIcon(entry.favIconUrl)}
              <span class="flex-1 min-w-0 truncate text-sm not-dark:text-neutral-800 dark:text-neutral-200">{entry.title}</span>
            </button>
          {/if}
        {/each}
      {/if}
    </div>
  </div>
</div>
