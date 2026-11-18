<script>
  import { t, currentLocale } from '../i18n.js'
  import { clickCounts, doSearch, editMode, showSearchBar, searchPlaceholder } from '../stores.js'
  import SearchTargetPicker from '../SearchTargetPicker.svelte'
  import SiteSuggestions from '../SiteSuggestions.svelte'
  import { isFolderItem } from '../folders.js'
  import { createSiteDrag } from './siteDrag.svelte.js'

  let { sites = [], dark = false, align = 'center', onadd, onedit, ondelete, onopenfolder } = $props()

  // 编辑模式下拖拽排序
  const drag = createSiteDrag()

  let query = $state('')

  let searchInputEl = $state(null)
  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    doSearch(query.trim())
  }

  const handleSiteClick = (e, site) => {
    if ($editMode) {
      e.preventDefault()
      return
    }
    // 正常打开时累加点击次数，便当主题据此排布
    clickCounts.increment(site.id)
  }

  const handleFolderClick = (e, folder) => {
    e.preventDefault()
    onopenfolder?.({ folder, rect: e.currentTarget?.getBoundingClientRect?.() })
  }

  // 页面可视尺寸，用于站点较多时拆成多列
  let pageW = $state(0)
  let pageH = $state(0)

  const ITEM_H = 40 // text-lg 行高 + space-y-3 间距
  const COL_W = 224 // 单列宽度，与 max-w-md 的单列阅读宽度接近
  const COL_GAP = 48

  // 一屏放不下时按需加列，列数受页面宽度限制，仍放不下则由页面纵向滚动
  let listCols = $derived.by(() => {
    const count = sites.length
    const verticalPad = align === 'center' ? 96 : 144
    const searchH = $showSearchBar ? 64 : 0
    const addH = $editMode ? 48 : 0
    const availH = (pageH || 800) - verticalPad - searchH - addH
    const perCol = Math.max(1, Math.floor(availH / ITEM_H))
    const maxCols = Math.max(1, Math.min(4, Math.floor(((pageW || 1280) - 64 + COL_GAP) / (COL_W + COL_GAP))))
    return Math.min(maxCols, Math.max(1, Math.ceil(count / perCol)))
  })

  let listMaxWidth = $derived(listCols <= 1 ? 448 : listCols * COL_W + (listCols - 1) * COL_GAP + 64)

  let dateFmt = $derived(new Date().toLocaleDateString($currentLocale || 'zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  }))
</script>

<div class="w-full h-full overflow-x-hidden overflow-y-auto flex {align === 'center' ? 'items-center-safe py-12' : align === 'bottom' ? 'items-end-safe pb-24 pt-12' : 'items-start pt-24 pb-12'} justify-center
  not-dark:bg-white dark:bg-neutral-900"
  bind:clientWidth={pageW} bind:clientHeight={pageH}>

  {#if $editMode}
    <div class="fixed top-0 left-0 right-0 z-40 flex items-center justify-center gap-3 py-2
      not-dark:bg-neutral-800/90 not-dark:text-white dark:bg-white/90 dark:text-black text-sm backdrop-blur-sm">
      <span>✏️ {$t('settings.editModeHint')}</span>
      <button
        class="px-3 py-0.5 rounded text-xs transition-colors not-dark:bg-white/20 not-dark:hover:bg-white/30 dark:bg-black/15 dark:hover:bg-black/25"
        onclick={() => editMode.set(false)}
      >{$t('settings.editModeDone')}</button>
    </div>
  {/if}

  <div class="w-full px-8" style="max-width: {listMaxWidth}px;">
    {#if $showSearchBar}
      <form onsubmit={handleSearch} class="mb-8 mx-auto max-w-md flex items-center gap-2">
        <SearchTargetPicker {dark} />
        <SiteSuggestions input={searchInputEl} query={query} dark={dark} />
        <input type="text" bind:value={query} bind:this={searchInputEl} placeholder={$searchPlaceholder}
          class="flex-1 min-w-0 bg-transparent outline-none border-b pb-1 text-sm
            not-dark:border-neutral-200 not-dark:text-neutral-600 not-dark:placeholder:text-neutral-300 dark:border-neutral-700 dark:text-neutral-300 dark:placeholder:text-neutral-600" />
      </form>
    {/if}

    <ul class="space-y-3" style="columns: {listCols}; column-gap: {COL_GAP}px;">
      {#each sites as site, i (site.id)}
        <li class="group flex items-center justify-between break-inside-avoid {$editMode && drag.isTarget(i) ? 'border-l-2 pl-2 not-dark:border-neutral-800 dark:border-white' : ''}"
          draggable={$editMode}
          ondragstart={(e) => drag.start(e, i)}
          ondragover={(e) => drag.over(e, i)}
          ondrop={(e) => drag.drop(e, i)}
          ondragend={drag.end}
          data-drop-into={drag.isInto(i)}
          style="{$editMode && drag.index === i ? 'opacity:0.4' : ''}"
          class:cursor-grab={$editMode}>
          {#if isFolderItem(site)}
            <button
              data-context-item="folder"
              data-item-id={site.id}
              onclick={(e) => handleFolderClick(e, site)}
              class="text-left text-lg hover:underline underline-offset-4
                not-dark:text-neutral-800 not-dark:hover:text-black dark:text-neutral-200 dark:hover:text-white"
            >{site.name}</button>
          {:else}
            <a href={site.url}
              data-context-item="site"
              data-item-id={site.id}
              onclick={(e) => handleSiteClick(e, site)}
              class="text-lg no-underline hover:underline underline-offset-4
                not-dark:text-neutral-800 not-dark:hover:text-black dark:text-neutral-200 dark:hover:text-white"
            >{site.name}</a>
          {/if}
          {#if $editMode}
            <div class="opacity-0 group-hover:opacity-100 flex gap-3 transition-opacity text-xs
              not-dark:text-neutral-300 dark:text-neutral-600">
              <button class="not-dark:hover:text-neutral-600 dark:hover:text-neutral-300"
                onclick={() => onedit?.(site)}>{$t('site.editBtn')}</button>
              <button class="hover:text-red-400"
                onclick={() => ondelete?.(site.id)}>{$t('site.delete')}</button>
            </div>
          {/if}
        </li>
      {/each}
    </ul>

    {#if $editMode}
      <button class="mt-6 text-sm not-dark:text-neutral-300 not-dark:hover:text-neutral-500 dark:text-neutral-600 dark:hover:text-neutral-400"
        onclick={() => onadd?.()}>{$t('site.addSite')}</button>
    {/if}
  </div>
</div>
