<script>
  import { t } from '../i18n.js'
  import { resolveSiteIcon, getFaviconFallback, handleIconLoad } from '../favicon.js'
  import { editMode, showSearchBar, showEngineLogo, isDark, resolvedBgStyle, bgIsLight, bubbleConfig, searchEngine, searchEngines, doSearch, sites as sitesStore } from '../stores.js'

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

  function handleSiteClick(e) {
    if ($editMode) {
      e.preventDefault()
    }
  }

  // 搜索气泡
  let searchExpanded = $state(false)
  let searchQuery = $state('')
  let searchInputEl = $state(null)

  function handleSearchClick() {
    searchExpanded = true
    requestAnimationFrame(() => searchInputEl?.focus())
  }

  function handleSearch(e) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    doSearch(searchQuery.trim(), $searchEngine)
  }

  function handleSearchBlur() {
    if (!searchQuery.trim()) {
      searchExpanded = false
    }
  }

  let engineIcon = $derived(searchEngines[$searchEngine]?.icon || '')

  let textDark = $derived(!$bgIsLight)
  let isRandom = $derived($bubbleConfig.layout === 'random')
  let bubbleSize = $derived($bubbleConfig.size || 80)
  let alignClass = $derived(
    align === 'center' ? 'justify-center' : align === 'bottom' ? 'justify-end pb-24' : 'pt-24'
  )

  // 随机布局：使用确定性伪随机 + 碰撞检测，保证不重叠
  function seededRandom(seed) {
    let x = Math.sin(seed * 9301 + 49297) * 233280
    return x - Math.floor(x)
  }

  let randomPositions = $derived.by(() => {
    if (!isRandom) return []
    const count = sites.length + ($editMode ? 1 : 0)
    const placed = []
    const size = bubbleSize
    const W = 800, H = 500
    const pad = 40

    for (let i = 0; i < count; i++) {
      let bestX = 50, bestY = 50
      let found = false

      for (let attempt = 0; attempt < 200; attempt++) {
        const seed1 = i * 137 + attempt * 31 + count
        const seed2 = i * 251 + attempt * 47 + count
        const px = pad + seededRandom(seed1) * (W - pad * 2 - size)
        const py = pad + seededRandom(seed2) * (H - pad * 2 - size)

        let overlaps = false
        for (const p of placed) {
          const dx = px - p.px
          const dy = py - p.py
          const minDist = size + 12
          if (dx * dx + dy * dy < minDist * minDist) {
            overlaps = true
            break
          }
        }

        if (!overlaps) {
          bestX = (px / W) * 100
          bestY = (py / H) * 100
          placed.push({ px, py })
          found = true
          break
        }
      }

      if (!found) {
        const seed1 = i * 137 + 199 * 31 + count
        const seed2 = i * 251 + 199 * 47 + count
        const px = pad + seededRandom(seed1) * (W - pad * 2 - size)
        const py = pad + seededRandom(seed2) * (H - pad * 2 - size)
        bestX = (px / W) * 100
        bestY = (py / H) * 100
        placed.push({ px, py })
      }

      placed[placed.length - 1].x = bestX
      placed[placed.length - 1].y = bestY
    }

    return placed.map(p => ({ x: p.x, y: p.y }))
  })
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

  <!-- 搜索气泡 -->
  {#if $showSearchBar}
    <div class="mb-10 flex justify-center">
      <div class="search-bubble" class:search-bubble--expanded={searchExpanded}>
        <div class="search-bubble-circle"
          style="width: {bubbleSize}px; height: {bubbleSize}px;
            background: {dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)'};
            box-shadow: {dark
              ? '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)'};"
          onclick={() => !searchExpanded && handleSearchClick()}
          role={searchExpanded ? undefined : 'button'}
          tabindex={searchExpanded ? undefined : 0}
          onkeydown={(e) => { if (!searchExpanded && e.key === 'Enter') handleSearchClick() }}>
          {#if searchExpanded}
            <form onsubmit={handleSearch} class="search-bubble-form">
              {#if $showEngineLogo && engineIcon}
                <img src={engineIcon} alt="" class="w-5 h-5 shrink-0" />
              {:else}
                <svg class="w-4 h-4 shrink-0 {textDark ? 'text-white/50' : 'text-black/40'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
                </svg>
              {/if}
              <input type="text" bind:value={searchQuery} bind:this={searchInputEl}
                onblur={handleSearchBlur}
                placeholder={$t('search.placeholder')}
                class="flex-1 bg-transparent outline-none text-sm min-w-0
                  {textDark ? 'text-white placeholder:text-white/40' : 'text-black placeholder:text-black/40'}" />
            </form>
          {:else}
            <svg class="w-6 h-6 {textDark ? 'text-white/40' : 'text-black/30'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
            </svg>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <div class="bubble-container {isRandom ? 'relative w-full' : 'flex flex-wrap justify-center items-center gap-6 px-8 mx-auto'}"
    style="{isRandom ? 'max-width: 800px; height: 500px;' : 'max-width: 600px;'}">
    {#each sites as site, i}
      <a href={site.url}
        onclick={handleSiteClick}
        draggable={$editMode}
        ondragstart={(e) => handleDragStart(e, i)}
        ondragover={(e) => handleDragOver(e, i)}
        ondrop={(e) => handleDrop(e, i)}
        ondragend={handleDragEnd}
        class="bubble group {isRandom ? 'absolute' : 'relative'} flex flex-col items-center no-underline
          {$editMode ? 'cursor-grab' : ''}
          {$editMode && dragIndex === i ? 'opacity-40' : ''}
          {$editMode && dragOverIndex === i && dragIndex !== i ? 'bubble-dragover' : ''}"
        style="{isRandom && randomPositions[i] ? `left: ${randomPositions[i].x}%; top: ${randomPositions[i].y}%;` : ''}">

        <div class="bubble-circle relative rounded-full flex items-center justify-center
          transition-all duration-300 ease-out
          {$editMode ? 'ring-2 ' + (dark ? 'ring-white/20' : 'ring-black/10') : ''}"
          style="width: {bubbleSize}px; height: {bubbleSize}px;
            background: {dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)'};
            box-shadow: {dark
              ? '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)'};">
          <img src={resolveSiteIcon(site, $isDark)} alt=""
            onload={(e) => handleIconLoad(e, site)}
            onerror={(e) => { if (site.iconSource !== 'custom') e.target.src = getFaviconFallback(site.url) }}
            class="transition-transform duration-300"
            style="width: {Math.round(bubbleSize * 0.5)}px; height: {Math.round(bubbleSize * 0.5)}px; border-radius: {site.iconRadius ?? 4}%" />
        </div>

        {#if $editMode}
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100
            flex gap-1 transition-opacity z-10 whitespace-nowrap">
            <button class="text-[10px] px-1.5 py-0.5 rounded-full
              {dark ? 'bg-neutral-700/90 text-neutral-300 hover:bg-neutral-600' : 'bg-white/90 text-neutral-500 hover:bg-white'}
              shadow-sm backdrop-blur-sm"
              onclick={(e) => { e.preventDefault(); e.stopPropagation(); onedit?.(site) }}>{$t('site.editBtn')}</button>
            <button class="text-[10px] px-1.5 py-0.5 rounded-full
              {dark ? 'bg-neutral-700/90 text-red-400 hover:bg-neutral-600' : 'bg-white/90 text-red-400 hover:bg-red-50'}
              shadow-sm backdrop-blur-sm"
              onclick={(e) => { e.preventDefault(); e.stopPropagation(); ondelete?.(site.id) }}>{$t('site.delete')}</button>
          </div>
        {/if}
      </a>
    {/each}

    {#if $editMode}
      <button class="bubble group {isRandom ? 'absolute' : ''} flex flex-col items-center"
        style="{isRandom && randomPositions[sites.length] ? `left: ${randomPositions[sites.length].x}%; top: ${randomPositions[sites.length].y}%;` : ''}"
        onclick={() => onadd?.()}>
        <div class="rounded-full flex items-center justify-center
          border-2 border-dashed transition-all duration-300
          {dark ? 'border-neutral-600 text-neutral-500 hover:border-neutral-400 hover:text-neutral-300'
               : 'border-neutral-300 text-neutral-400 hover:border-neutral-500 hover:text-neutral-600'}"
          style="width: {bubbleSize}px; height: {bubbleSize}px;">
          <span class="text-2xl leading-none">+</span>
        </div>
      </button>
    {/if}
  </div>
</div>

<style>
  .bubble {
    transition: transform 0.3s ease, filter 0.3s ease;
  }

  .bubble:hover {
    transform: translateY(-6px) scale(1.05);
  }

  .bubble:hover .bubble-circle {
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.12),
      0 4px 10px rgba(0, 0, 0, 0.06) !important;
  }

  :global(.dark) .bubble:hover .bubble-circle {
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
  }

  .bubble:hover img {
    transform: scale(1.12);
  }

  .bubble-dragover .bubble-circle {
    outline: 2px solid currentColor;
    outline-offset: 3px;
  }

  .bubble:active {
    transform: translateY(-2px) scale(1.02);
  }

  /* 搜索气泡 */
  .search-bubble {
    transition: transform 0.3s ease;
  }

  .search-bubble:hover {
    transform: translateY(-4px) scale(1.05);
  }

  .search-bubble--expanded:hover {
    transform: none;
  }

  .search-bubble-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    cursor: pointer;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                border-radius 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                background 0.3s ease,
                box-shadow 0.3s ease;
  }

  .search-bubble--expanded .search-bubble-circle {
    width: 320px !important;
    border-radius: 36px;
    padding: 0 20px;
    cursor: default;
  }

  .search-bubble-form {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }
</style>
