<script>
  import { t } from '../i18n.js'
  import { resolveSiteIcon, getFaviconFallback, handleIconLoad } from '../favicon.js'
  import { editMode, showSearchBar, showSiteTitle, showEngineLogo, isDark, resolvedBgStyle, bgIsLight, glassConfig, searchEngine, searchEngines, doSearch, sites as sitesStore } from '../stores.js'

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

  let searchQuery = $state('')
  let engineIcon = $derived(searchEngines[$searchEngine]?.icon || '')
  function handleSearch(e) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    doSearch(searchQuery.trim(), $searchEngine)
  }

  let textDark = $derived(!$bgIsLight)
  let cfg = $derived($glassConfig)
  let actualCols = $derived(Math.min(cfg.cols, sites.length + ($editMode ? 1 : 0)))
  let gridMaxWidth = $derived(`${actualCols * 300}px`)
  let textStroke = $derived(textDark
    ? '-1px 0 0 rgba(0,0,0,0.4), 1px 0 0 rgba(0,0,0,0.4), 0 -1px 0 rgba(0,0,0,0.4), 0 1px 0 rgba(0,0,0,0.4)'
    : '-1px 0 0 rgba(255,255,255,0.4), 1px 0 0 rgba(255,255,255,0.4), 0 -1px 0 rgba(255,255,255,0.4), 0 1px 0 rgba(255,255,255,0.4)')
  let alignClass = $derived(align === 'center' ? 'justify-center' : align === 'bottom' ? 'justify-end pb-24' : 'pt-24')
</script>

<div class="w-full h-full flex flex-col items-center {alignClass}
  {$resolvedBgStyle ? '' : (dark ? 'bg-neutral-900' : 'bg-neutral-100')}"
  style={$resolvedBgStyle}>

  {#if $editMode}
    <div class="fixed top-0 left-0 right-0 z-40 flex items-center justify-center gap-3 py-2
      {dark ? 'bg-white/90 text-black' : 'bg-neutral-800/90 text-white'} text-sm backdrop-blur-sm">
      <span>✏️ {$t('settings.editModeHint')}</span>
      <button
        class="px-3 py-0.5 rounded text-xs transition-colors {dark ? 'bg-black/15 hover:bg-black/25' : 'bg-white/20 hover:bg-white/30'}"
        onclick={() => editMode.set(false)}
      >{$t('settings.editModeDone')}</button>
    </div>
  {/if}

  <div class="mb-8 w-full flex justify-center px-8">
    {#if $showSearchBar}
      <form onsubmit={handleSearch}
        class="glass-pill flex items-center gap-3 w-full max-w-lg
          {dark ? 'glass-pill--dark' : 'glass-pill--light'}">
        {#if $showEngineLogo && engineIcon}
          <img src={engineIcon} alt="" class="w-5 h-5 shrink-0" />
        {:else}
          <svg class="w-4 h-4 shrink-0 {textDark ? 'text-white/50' : 'text-black/40'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
          </svg>
        {/if}
        <input type="text" bind:value={searchQuery}
          placeholder={$t('search.placeholder')}
          class="flex-1 bg-transparent outline-none text-sm {textDark ? 'text-white placeholder:text-white/40' : 'text-black placeholder:text-black/40'}" />
      </form>
    {/if}
  </div>

  <div class="glass-grid px-4 mx-auto"
    style="max-width: {gridMaxWidth}; grid-template-columns: repeat({actualCols}, 1fr);">
    {#each sites as site, i}
      <a href={site.url}
        onclick={(e) => handleSiteClick(e, site)}
        draggable={$editMode}
        ondragstart={(e) => handleDragStart(e, i)}
        ondragover={(e) => handleDragOver(e, i)}
        ondrop={(e) => handleDrop(e, i)}
        ondragend={handleDragEnd}
        class="glass-pill group flex flex-row items-center gap-4 transition-all
          {dark ? 'glass-pill--dark' : 'glass-pill--light'}
          {$editMode ? 'ring-1 cursor-grab ' + (dark ? 'ring-white/20' : 'ring-black/10') : ''}
          {$editMode && dragOverIndex === i && dragIndex !== i ? (dark ? 'ring-2 ring-white/60' : 'ring-2 ring-neutral-800/60') : ''}"
        style="{$editMode && dragIndex === i ? 'opacity:0.4' : ''}">
        <img src={resolveSiteIcon(site, $isDark)} alt=""
          onload={(e) => handleIconLoad(e, site)}
          onerror={(e) => { if (site.iconSource !== 'custom') e.target.src = getFaviconFallback(site.url) }}
          class="glass-pill-icon shrink-0 transition-transform"
          style="width: 32px; height: 32px; border-radius: {site.iconRadius ?? 4}%" />
        <span class="text-sm font-medium truncate flex-1
          {textDark ? 'text-white' : 'text-black'}"
          style="text-shadow: {textStroke}">{site.name}</span>
        {#if $editMode}
          <div class="opacity-0 group-hover:opacity-100 flex gap-1.5 shrink-0 ml-auto transition-opacity">
            <button class="text-xs {dark ? 'text-neutral-400 hover:text-white' : 'text-neutral-400 hover:text-blue-500'}"
              onclick={(e) => { e.preventDefault(); e.stopPropagation(); onedit?.(site) }}>{$t('site.editBtn')}</button>
            <button class="text-xs {dark ? 'text-neutral-400 hover:text-red-400' : 'text-neutral-400 hover:text-red-500'}"
              onclick={(e) => { e.preventDefault(); e.stopPropagation(); ondelete?.(site.id) }}>{$t('site.delete')}</button>
          </div>
        {/if}
      </a>
    {/each}

    {#if $editMode}
      <button class="glass-pill flex flex-row items-center gap-4 transition-all
        {dark ? 'glass-pill--dark' : 'glass-pill--light'}"
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
  .glass-pill-icon {
    transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .glass-pill:hover .glass-pill-icon {
    transform: scale(1.1);
  }
</style>
