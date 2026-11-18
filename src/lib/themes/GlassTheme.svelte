<script>
  import { t } from '../i18n.js'
  import SiteIcon from '../SiteIcon.svelte'
  import { clickCounts, editMode, showSearchBar, showSiteTitle, resolvedBgStyle, bgIsLight, glassConfig, doSearch, searchPlaceholder } from '../stores.js'
  import FolderGlyph from '../FolderGlyph.svelte'
  import { isFolderItem } from '../folders.js'
  import SearchTargetPicker from '../SearchTargetPicker.svelte'
  import SiteSuggestions from '../SiteSuggestions.svelte'
  import { createSiteDrag } from './siteDrag.svelte.js'

  let { sites = [], dark = false, align = 'top', onadd, onedit, ondelete, onopenfolder } = $props()

  // 编辑模式下拖拽排序
  const drag = createSiteDrag()

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

  let searchQuery = $state('')

  let searchInputEl = $state(null)
  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    doSearch(searchQuery.trim())
  }

  let textDark = $derived(!$bgIsLight)
  let cfg = $derived($glassConfig)
  let actualCols = $derived(Math.min(cfg.cols, sites.length + ($editMode ? 1 : 0)))
  let gridMaxWidth = $derived(`${actualCols * 300}px`)
  let textStroke = $derived(textDark
    ? '-1px 0 0 rgba(0,0,0,0.4), 1px 0 0 rgba(0,0,0,0.4), 0 -1px 0 rgba(0,0,0,0.4), 0 1px 0 rgba(0,0,0,0.4)'
    : '-1px 0 0 rgba(255,255,255,0.4), 1px 0 0 rgba(255,255,255,0.4), 0 -1px 0 rgba(255,255,255,0.4), 0 1px 0 rgba(255,255,255,0.4)')
  let alignClass = $derived(align === 'center' ? 'justify-center-safe py-12' : align === 'bottom' ? 'justify-end-safe pt-12 pb-24' : 'pt-24 pb-12')
</script>

<div class="w-full h-full overflow-x-hidden overflow-y-auto flex flex-col items-center {alignClass}
  {$resolvedBgStyle ? '' : 'not-dark:bg-neutral-100 dark:bg-neutral-900'}"
  style={$resolvedBgStyle}>

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

  <div class="mb-8 w-full flex justify-center px-8">
    {#if $showSearchBar}
      <form onsubmit={handleSearch}
        class="glass-pill flex items-center gap-3 w-full max-w-lg
          not-dark:glass-pill--light dark:glass-pill--dark">
        <SearchTargetPicker dark={textDark} />
        <SiteSuggestions input={searchInputEl} query={searchQuery} dark={textDark} />
        <input type="text" bind:value={searchQuery} bind:this={searchInputEl}
          placeholder={$searchPlaceholder}
          class="flex-1 bg-transparent outline-none text-sm {textDark ? 'text-white placeholder:text-white/40' : 'text-black placeholder:text-black/40'}" />
        <button type="submit" class="shrink-0 ml-2 p-0 border-0 bg-transparent cursor-pointer transition-opacity
          {textDark ? 'text-white/40' : 'text-black/40'} hover:opacity-80" aria-label={$t('search.submit')}>
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>
          </svg>
        </button>
      </form>
    {/if}
  </div>

  <div class="glass-grid px-4 mx-auto"
    style="max-width: {gridMaxWidth}; grid-template-columns: repeat({actualCols}, 1fr);">
    {#each sites as site, i (site.id)}
      {#if isFolderItem(site)}
        <div
          data-context-item="folder"
          data-item-id={site.id}
          onclick={(e) => handleFolderClick(e, site)}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFolderClick(e, site) }}
          draggable={$editMode}
          ondragstart={(e) => drag.start(e, i)}
          ondragover={(e) => drag.over(e, i)}
          ondrop={(e) => drag.drop(e, i)}
          ondragend={drag.end}
          data-drop-into={drag.isInto(i)}
          role="button"
          tabindex="0"
          class="glass-pill group flex flex-row items-center gap-4 transition-all
            not-dark:glass-pill--light dark:glass-pill--dark
            {$editMode ? 'ring-1 cursor-grab ' + 'not-dark:ring-black/10 dark:ring-white/20' : ''}
            {$editMode && drag.isTarget(i) ? 'ring-2 not-dark:ring-neutral-800/60 dark:ring-white/60' : ''}"
          style="{$editMode && drag.index === i ? 'opacity:0.4' : ''}"
        >
          <FolderGlyph folder={site} size={32} className="glass-pill-icon shrink-0 transition-transform" />
          <span class="text-sm font-medium truncate flex-1 {textDark ? 'text-white' : 'text-black'}" style="text-shadow: {textStroke}">{site.name}</span>
          {#if $editMode}
            <div class="opacity-0 group-hover:opacity-100 flex gap-1.5 shrink-0 ml-auto transition-opacity">
              <button class="text-xs text-neutral-400 not-dark:hover:text-blue-500 dark:hover:text-white"
                onclick={(e) => { e.preventDefault(); e.stopPropagation(); onedit?.(site) }}>{$t('site.editBtn')}</button>
              <button class="text-xs text-neutral-400 not-dark:hover:text-red-500 dark:hover:text-red-400"
                onclick={(e) => { e.preventDefault(); e.stopPropagation(); ondelete?.(site.id) }}>{$t('site.delete')}</button>
            </div>
          {/if}
        </div>
      {:else}
        <a href={site.url}
          data-context-item="site"
          data-item-id={site.id}
          onclick={(e) => handleSiteClick(e, site)}
          draggable={$editMode}
          ondragstart={(e) => drag.start(e, i)}
          ondragover={(e) => drag.over(e, i)}
          ondrop={(e) => drag.drop(e, i)}
          ondragend={drag.end}
          data-drop-into={drag.isInto(i)}
          class="glass-pill group flex flex-row items-center gap-4 transition-all
            not-dark:glass-pill--light dark:glass-pill--dark
            {$editMode ? 'ring-1 cursor-grab ' + 'not-dark:ring-black/10 dark:ring-white/20' : ''}
            {$editMode && drag.isTarget(i) ? 'ring-2 not-dark:ring-neutral-800/60 dark:ring-white/60' : ''}"
          style="{$editMode && drag.index === i ? 'opacity:0.4' : ''}">
          <SiteIcon site={site} class="glass-pill-icon shrink-0 transition-transform" style="width: 32px; height: 32px; border-radius: {site.iconRadius ?? 4}%" />
          <span class="text-sm font-medium truncate flex-1
            {textDark ? 'text-white' : 'text-black'}"
            style="text-shadow: {textStroke}">{site.name}</span>
          {#if $editMode}
            <div class="opacity-0 group-hover:opacity-100 flex gap-1.5 shrink-0 ml-auto transition-opacity">
              <button class="text-xs text-neutral-400 not-dark:hover:text-blue-500 dark:hover:text-white"
                onclick={(e) => { e.preventDefault(); e.stopPropagation(); onedit?.(site) }}>{$t('site.editBtn')}</button>
              <button class="text-xs text-neutral-400 not-dark:hover:text-red-500 dark:hover:text-red-400"
                onclick={(e) => { e.preventDefault(); e.stopPropagation(); ondelete?.(site.id) }}>{$t('site.delete')}</button>
            </div>
          {/if}
        </a>
      {/if}
    {/each}

    {#if $editMode}
      <button class="glass-pill flex flex-row items-center gap-4 transition-all
        not-dark:glass-pill--light dark:glass-pill--dark"
        onclick={() => onadd?.()}>
        <div class="flex items-center justify-center text-xl shrink-0
          {textDark ? 'text-neutral-400' : 'text-neutral-400'}"
          style="width: 32px; height: 32px">+</div>
        <span class="text-sm font-medium {textDark ? 'text-neutral-400' : 'text-neutral-400'}">{$t('site.add')}</span>
      </button>
    {/if}
  </div>
</div>

<style>
  .glass-grid {
    display: grid;
    gap: 12px;
    width: 100%;
  }

  /* 水平药丸卡片基础样式 */
  .glass-pill {
    border-radius: 16px;
    padding: 12px 20px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    text-decoration: none;
    transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                box-shadow 0.25s ease,
                background 0.25s ease,
                border-color 0.25s ease,
                filter 0.25s ease;
  }

  /* 亮色模式药丸 */
  .glass-pill--light {
    background: rgba(255, 255, 255, 0.30);
    border: 1px solid rgba(255, 255, 255, 0.50);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05),
                inset 0 1px 0 rgba(255, 255, 255, 0.50);
  }

  .glass-pill--light:hover {
    transform: scale(1.02);
    background: rgba(255, 255, 255, 0.45);
    border-color: rgba(255, 255, 255, 0.70);
    filter: brightness(1.05);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08),
                inset 0 1px 0 rgba(255, 255, 255, 0.60);
  }

  /* 暗色模式药丸 */
  .glass-pill--dark {
    background: rgba(255, 255, 255, 0.10);
    border: 1px solid rgba(255, 255, 255, 0.20);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }

  .glass-pill--dark:hover {
    transform: scale(1.02);
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.35);
    filter: brightness(1.1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25),
                0 0 12px rgba(255, 255, 255, 0.04),
                inset 0 1px 0 rgba(255, 255, 255, 0.10);
  }

  /* 图标悬停微缩放 */
  .glass-pill :global(.glass-pill-icon) {
    transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .glass-pill:hover :global(.glass-pill-icon) {
    transform: scale(1.1);
  }
</style>
