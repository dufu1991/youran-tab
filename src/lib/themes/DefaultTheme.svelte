<script>
  import { t } from '../i18n.js'
  import SiteIcon from '../SiteIcon.svelte'
  import { clickCounts, editMode, showSearchBar, defaultConfig, showSiteTitle, resolvedBgStyle, bgIsLight } from '../stores.js'
  import SearchBar from '../SearchBar.svelte'
  import FolderGlyph from '../FolderGlyph.svelte'
  import { isFolderItem } from '../folders.js'
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

  let cfg = $derived($defaultConfig)
  let textDark = $derived(!$bgIsLight)
  let cardBg = $derived(`rgba(255,255,255,${cfg.cardOpacity / 100})`)
  let cardBorder = $derived(textDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')
  let textStroke = $derived(textDark
    ? '-1px 0 0 rgba(0,0,0,0.4), 1px 0 0 rgba(0,0,0,0.4), 0 -1px 0 rgba(0,0,0,0.4), 0 1px 0 rgba(0,0,0,0.4)'
    : '-1px 0 0 rgba(255,255,255,0.4), 1px 0 0 rgba(255,255,255,0.4), 0 -1px 0 rgba(255,255,255,0.4), 0 1px 0 rgba(255,255,255,0.4)')
  let alignClass = $derived(align === 'center' ? 'justify-center-safe py-12' : align === 'bottom' ? 'justify-end-safe pt-12 pb-24' : 'pt-24 pb-12')
  let actualCols = $derived(Math.min(cfg.cols, sites.length + ($editMode ? 1 : 0)))
  let gridMaxWidth = $derived(actualCols < cfg.cols ? `${actualCols * (cfg.width / cfg.cols)}px` : `${cfg.width}px`)
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

  <div class="mb-10 w-full flex justify-center px-8">
    {#if $showSearchBar}
      <SearchBar />
    {/if}
  </div>

  <div class="grid gap-4 px-8 mx-auto"
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
          class="default-card group flex flex-col items-center gap-2 p-4 transition-all
            {$editMode ? 'ring-1 cursor-grab ' + 'not-dark:ring-neutral-200 dark:ring-neutral-700' : ''}
            {$editMode && drag.isTarget(i) ? 'ring-2 not-dark:ring-neutral-800 dark:ring-white' : ''}"
          style="--card-bg: {cardBg}; --card-blur: {cfg.cardBlur}px; --card-border-color: {cardBorder}; border-radius: {cfg.radius}px; {$editMode && drag.index === i ? 'opacity:0.4' : ''}"
        >
          <FolderGlyph folder={site} size={cfg.iconSize} className="group-hover:scale-110 transition-transform" />
          {#if $showSiteTitle}
            <span class="text-xs truncate max-w-25 {textDark ? 'text-white' : 'text-black'}" style="text-shadow: {textStroke}">{site.name}</span>
          {/if}
          {#if $editMode}
            <div class="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
              <button class="text-xs not-dark:text-neutral-400 not-dark:hover:text-blue-500 dark:text-neutral-500 dark:hover:text-white"
                onclick={(e) => { e.preventDefault(); e.stopPropagation(); onedit?.(site) }}>{$t('site.editBtn')}</button>
              <button class="text-xs not-dark:text-neutral-400 not-dark:hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400"
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
          class="default-card group flex flex-col items-center gap-2 p-4 transition-all
            {$editMode ? 'ring-1 cursor-grab ' + 'not-dark:ring-neutral-200 dark:ring-neutral-700' : ''}
            {$editMode && drag.isTarget(i) ? 'ring-2 not-dark:ring-neutral-800 dark:ring-white' : ''}"
          style="--card-bg: {cardBg}; --card-blur: {cfg.cardBlur}px; --card-border-color: {cardBorder}; border-radius: {cfg.radius}px; {$editMode && drag.index === i ? 'opacity:0.4' : ''}">
          <SiteIcon site={site} class="group-hover:scale-110 transition-transform" style="width: {cfg.iconSize}px; height: {cfg.iconSize}px; border-radius: {site.iconRadius ?? 4}%" />
          {#if $showSiteTitle}
            <span class="text-xs truncate max-w-25
              {textDark ? 'text-white' : 'text-black'}"
              style="text-shadow: {textStroke}">{site.name}</span>
          {/if}
          {#if $editMode}
            <div class="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
              <button class="text-xs not-dark:text-neutral-400 not-dark:hover:text-blue-500 dark:text-neutral-500 dark:hover:text-white"
                onclick={(e) => { e.preventDefault(); e.stopPropagation(); onedit?.(site) }}>{$t('site.editBtn')}</button>
              <button class="text-xs not-dark:text-neutral-400 not-dark:hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400"
                onclick={(e) => { e.preventDefault(); e.stopPropagation(); ondelete?.(site.id) }}>{$t('site.delete')}</button>
            </div>
          {/if}
        </a>
      {/if}
    {/each}

    {#if $editMode}
      <button class="default-card flex flex-col items-center gap-2 p-4 transition-all"
        style="--card-bg: {cardBg}; --card-blur: {cfg.cardBlur}px; --card-border-color: {cardBorder}; border-radius: {cfg.radius}px"
        onclick={() => onadd?.()}>
        <div class="flex items-center justify-center text-2xl
          {textDark ? 'text-neutral-500' : 'text-neutral-400'}"
          style="width: {cfg.iconSize}px; height: {cfg.iconSize}px">+</div>
        <span class="text-sm {textDark ? 'text-neutral-500' : 'text-neutral-400'}">{$t('site.add')}</span>
      </button>
    {/if}
  </div>
</div>

<style>
  .default-card {
    border: 1px solid transparent;
  }
  .default-card:hover {
    background: var(--card-bg);
    backdrop-filter: blur(var(--card-blur));
    -webkit-backdrop-filter: blur(var(--card-blur));
    border-color: var(--card-border-color);
  }
  .default-card:hover span,
  .default-card:hover div {
    color: #000000 !important;
    text-shadow: none !important;
  }
</style>
