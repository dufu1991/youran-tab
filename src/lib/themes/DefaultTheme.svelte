<script>
  import { t } from '../i18n.js'
  import { resolveSiteIcon, getFaviconFallback, handleIconLoad } from '../favicon.js'
  import { editMode, showSearchBar, defaultConfig, showSiteTitle, isDark, resolvedBgStyle, bgIsLight, sites as sitesStore } from '../stores.js'
  import SearchBar from '../SearchBar.svelte'

  let { sites = [], dark = false, align = 'top', onadd, onedit, ondelete } = $props()

  let dragIndex = $state(-1)
  let dragOverIndex = $state(-1)

  function handleDragStart(e, i) {
    dragIndex = i
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, i) {
    e.preventDefault()
    dragOverIndex = i
  }

  function handleDrop(e, i) {
    e.preventDefault()
    if (dragIndex >= 0 && dragIndex !== i) {
      sitesStore.reorder(dragIndex, i)
    }
    dragIndex = -1
    dragOverIndex = -1
  }

  function handleDragEnd() {
    dragIndex = -1
    dragOverIndex = -1
  }

  function handleSiteClick(e, site) {
    if ($editMode) {
      e.preventDefault()
    }
  }

  let cfg = $derived($defaultConfig)
  let textDark = $derived(!$bgIsLight)
  let cardBg = $derived(`rgba(255,255,255,${cfg.cardOpacity / 100})`)
  let cardBorder = $derived(textDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')
  let textStroke = $derived(textDark
    ? '-1px 0 0 rgba(0,0,0,0.4), 1px 0 0 rgba(0,0,0,0.4), 0 -1px 0 rgba(0,0,0,0.4), 0 1px 0 rgba(0,0,0,0.4)'
    : '-1px 0 0 rgba(255,255,255,0.4), 1px 0 0 rgba(255,255,255,0.4), 0 -1px 0 rgba(255,255,255,0.4), 0 1px 0 rgba(255,255,255,0.4)')
  let alignClass = $derived(align === 'center' ? 'justify-center' : align === 'bottom' ? 'justify-end pb-24' : 'pt-24')
  let actualCols = $derived(Math.min(cfg.cols, sites.length + ($editMode ? 1 : 0)))
  let gridMaxWidth = $derived(actualCols < cfg.cols ? `${actualCols * (cfg.width / cfg.cols)}px` : `${cfg.width}px`)
</script>

<div class="w-full h-full flex flex-col items-center {alignClass}
  {$resolvedBgStyle ? '' : (dark ? 'bg-neutral-900' : 'bg-neutral-100')}"
  style={$resolvedBgStyle}>

  {#if $editMode}
    <div class="fixed top-0 left-0 right-0 z-40 flex items-center justify-center gap-3 py-2
      {dark ? 'bg-white/90 text-black' : 'bg-neutral-800/90 text-white'} text-sm backdrop-blur-sm">
      <span>✏️ {$t('settings.editModeHint')}</span>
      <button
        class="px-3 py-0.5 rounded text-xs bg-white/20 hover:bg-white/30 transition-colors"
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
    {#each sites as site, i}
      <a href={site.url}
        onclick={(e) => handleSiteClick(e, site)}
        draggable={$editMode}
        ondragstart={(e) => handleDragStart(e, i)}
        ondragover={(e) => handleDragOver(e, i)}
        ondrop={(e) => handleDrop(e, i)}
        ondragend={handleDragEnd}
        class="default-card group flex flex-col items-center gap-2 p-4 transition-all
          {$editMode ? 'ring-1 cursor-grab ' + (dark ? 'ring-neutral-700' : 'ring-neutral-200') : ''}
          {$editMode && dragOverIndex === i && dragIndex !== i ? (dark ? 'ring-2 ring-white' : 'ring-2 ring-neutral-800') : ''}"
        style="--card-bg: {cardBg}; --card-blur: {cfg.cardBlur}px; --card-border-color: {cardBorder}; border-radius: {cfg.radius}px; {$editMode && dragIndex === i ? 'opacity:0.4' : ''}">
        <img src={resolveSiteIcon(site, $isDark)} alt=""
          onload={(e) => handleIconLoad(e, site)}
          onerror={(e) => { if (site.iconSource !== 'custom') e.target.src = getFaviconFallback(site.url) }}
          class="group-hover:scale-110 transition-transform"
          style="width: {cfg.iconSize}px; height: {cfg.iconSize}px; border-radius: {site.iconRadius ?? 4}%" />
        {#if $showSiteTitle}
          <span class="text-xs truncate max-w-25
            {textDark ? 'text-white' : 'text-black'}"
            style="text-shadow: {textStroke}">{site.name}</span>
        {/if}
        {#if $editMode}
          <div class="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
            <button class="text-xs {dark ? 'text-neutral-500 hover:text-white' : 'text-neutral-400 hover:text-blue-500'}"
              onclick={(e) => { e.preventDefault(); e.stopPropagation(); onedit?.(site) }}>{$t('site.editBtn')}</button>
            <button class="text-xs {dark ? 'text-neutral-500 hover:text-red-400' : 'text-neutral-400 hover:text-red-500'}"
              onclick={(e) => { e.preventDefault(); e.stopPropagation(); ondelete?.(site.id) }}>{$t('site.delete')}</button>
          </div>
        {/if}
      </a>
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
