<script>
  import { t } from '../i18n.js'
  import { get } from 'svelte/store'
  import { getCachedIconUrl, fetchAndCacheIcon } from '../iconCache.js'
  import { getFavicon, getFaviconFallback, resolveSiteIcon, handleIconLoad } from '../favicon.js'
  import { editMode, showSearchBar, showEngineLogo, showSiteTitle, clickCounts, bentoConfig, searchEngine, searchEngines, doSearch, isDark, resolvedBgStyle, bgIsLight, sites as sitesStore } from '../stores.js'

  let { sites = [], dark = false, align = 'center', onadd, onedit, ondelete } = $props()

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

  // 页面加载时快照点击次数，避免点击后立即重排
  const initialCounts = { ...get(clickCounts) }

  let query = $state('')
  function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    doSearch(query.trim(), $searchEngine)
  }

  function handleSiteClick(e, site) {
    if ($editMode) {
      e.preventDefault()
    } else {
      clickCounts.increment(site.id)
    }
  }

  let engineUrl = $derived(searchEngines[$searchEngine]?.url || '')
  let engineRemoteUrl = $derived(engineUrl ? getFavicon(engineUrl) : '')
  let engineLogo = $derived(engineRemoteUrl ? (getCachedIconUrl(engineRemoteUrl) || engineRemoteUrl) : '')
  let engineLogoFallback = $derived(engineUrl ? getFaviconFallback(engineUrl) : '')

  function handleEngineLogoLoad() {
    if (engineRemoteUrl && !getCachedIconUrl(engineRemoteUrl)) {
      fetchAndCacheIcon(engineRemoteUrl)
    }
  }

  // Squarified treemap
  function treemap(items, w, h) {
    if (!items.length) return []
    const total = items.reduce((s, d) => s + d.value, 0)
    const rects = []
    squarify(
      items.map(d => ({ ...d, area: (d.value / total) * w * h })),
      0, 0, w, h, rects
    )
    return rects
  }

  function squarify(data, x, y, w, h, rects) {
    if (!data.length) return
    if (data.length === 1) {
      rects.push({ ...data[0], x, y, w, h })
      return
    }
    const horizontal = w >= h
    const side = horizontal ? h : w
    let strip = [data[0]]
    let stripArea = data[0].area

    function worst(st, sArea) {
      const len = sArea / side
      let mx = 0
      for (const d of st) {
        const r = d.area / len
        const a = Math.max(len / r, r / len)
        if (a > mx) mx = a
      }
      return mx
    }

    for (let i = 1; i < data.length; i++) {
      const next = [...strip, data[i]]
      const nextArea = stripArea + data[i].area
      if (worst(next, nextArea) <= worst(strip, stripArea)) {
        strip.push(data[i])
        stripArea = nextArea
      } else {
        break
      }
    }

    const len = stripArea / side
    let offset = 0
    for (const d of strip) {
      const itemLen = d.area / len
      if (horizontal) {
        rects.push({ ...d, x, y: y + offset, w: len, h: itemLen })
      } else {
        rects.push({ ...d, x: x + offset, y, w: itemLen, h: len })
      }
      offset += itemLen
    }

    const rest = data.slice(strip.length)
    if (horizontal) {
      squarify(rest, x + len, y, w - len, h, rects)
    } else {
      squarify(rest, x, y + len, w, h - len, rects)
    }
  }

  function computeLayout(siteList, counts, cw, ch) {
    const items = siteList
      .map(s => ({ id: s.id, name: s.name, url: s.url, value: (counts[s.id] || 0) + 1 }))
      .sort((a, b) => b.value - a.value)
    return treemap(items, cw, ch)
  }

  let cfg = $derived($bentoConfig)
  let cardBg = $derived(dark ? `rgba(255,255,255,${cfg.cardOpacity / 100})` : `rgba(255,255,255,${cfg.cardOpacity / 100})`)
  let cardBorder = $derived(dark ? 'border:1px solid rgba(255,255,255,0.08)' : 'border:1px solid rgba(0,0,0,0.06)')
  let cardStyle = $derived(`background:${cardBg};backdrop-filter:blur(${cfg.cardBlur}px);-webkit-backdrop-filter:blur(${cfg.cardBlur}px);${cardBorder}`)
  let containerH = $derived(cfg.width * 0.6)
  let layout = $derived(cfg.fixed ? [] : computeLayout(sites, initialCounts, cfg.width, containerH))
  let alignClass = $derived(align === 'center' ? 'justify-center' : align === 'bottom' ? 'justify-end pb-8' : 'justify-start pt-8')
</script>

<div class="w-full h-full flex flex-col items-center
  {$resolvedBgStyle ? '' : (dark ? 'bg-neutral-900' : 'bg-neutral-100')}"
  style="{$resolvedBgStyle}{$resolvedBgStyle ? ';' : ''}padding-top: {$editMode ? '40px' : '0'}">

  {#if $editMode}
    <div class="fixed top-0 left-0 right-0 z-40 flex items-center justify-center gap-3 py-2
      {dark ? 'bg-white/90 text-black' : 'bg-neutral-800/90 text-white'} text-sm backdrop-blur-sm">
      <span>✏️ {$t('settings.editModeHint')}</span>
      <button class="px-3 py-0.5 rounded text-xs bg-white/20 hover:bg-white/30 transition-colors"
        onclick={() => editMode.set(false)}>{$t('settings.editModeDone')}</button>
    </div>
  {/if}

  <div class="flex flex-col items-center {alignClass} flex-1 w-full px-8"
    style="max-width: {cfg.width + 64}px">

    {#if $showSearchBar}
      <form onsubmit={handleSearch} class="w-full flex justify-center"
        style="max-width: {cfg.width}px; margin-bottom: {cfg.gap}px">
        <div class="flex items-center w-full transition-colors"
          style="border-radius: {cfg.radius}px; padding: 12px 20px; {cardStyle}">
          {#if $showEngineLogo && engineLogo}
            <img src={engineLogo} alt="" class="w-5 h-5 mr-3 shrink-0"
              onload={handleEngineLogoLoad}
              onerror={(e) => { e.target.src = engineLogoFallback }} />
          {/if}
          <input type="text" bind:value={query} placeholder={$t('search.placeholder')}
            class="flex-1 bg-transparent outline-none text-sm text-black" />
        </div>
      </form>
    {/if}

    {#if cfg.fixed}
      <!-- 固定等分网格 -->
      <div class="grid w-full" style="max-width: {cfg.width}px;
        grid-template-columns: repeat({cfg.cols}, 1fr); gap: {cfg.gap}px;">
        {#each sites as site, i}
          <a href={site.url}
            onclick={(e) => handleSiteClick(e, site)}
            draggable={$editMode}
            ondragstart={(e) => handleDragStart(e, i)}
            ondragover={(e) => handleDragOver(e, i)}
            ondrop={(e) => handleDrop(e, i)}
            ondragend={handleDragEnd}
            class="group relative flex flex-col items-center justify-center overflow-hidden transition-all aspect-square
              {$editMode ? 'ring-1 cursor-grab ' + (dark ? 'ring-neutral-600' : 'ring-neutral-300') : ''}
              {$editMode && dragOverIndex === i && dragIndex !== i ? 'ring-2 ' + (dark ? 'ring-white' : 'ring-neutral-800') : ''}"
            style="border-radius: {cfg.radius}px; {cardStyle}; {$editMode && dragIndex === i ? 'opacity:0.4' : ''}">
            <img src={resolveSiteIcon(site, $isDark)} alt=""
              onload={(e) => handleIconLoad(e, site)}
              onerror={(e) => { if (site.iconSource !== 'custom') e.target.src = getFaviconFallback(site.url) }}
              class="mb-1 group-hover:scale-110 transition-transform"
              style="width: {cfg.iconSize}px; height: {cfg.iconSize}px; border-radius: {site.iconRadius ?? 4}%" />
            {#if $showSiteTitle}
              <span class="text-xs truncate max-w-[90%] text-black">{site.name}</span>
            {/if}
            {#if $editMode}
              <div class="absolute bottom-1.5 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                <button class="text-xs px-1.5 py-0.5 rounded
                  {dark ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}"
                  onclick={(e) => { e.preventDefault(); e.stopPropagation(); onedit?.(site) }}>{$t('site.editBtn')}</button>
                <button class="text-xs px-1.5 py-0.5 rounded
                  {dark ? 'bg-neutral-700 text-red-400 hover:bg-neutral-600' : 'bg-neutral-100 text-red-400 hover:bg-red-50'}"
                  onclick={(e) => { e.preventDefault(); e.stopPropagation(); ondelete?.(site.id) }}>{$t('site.delete')}</button>
              </div>
            {/if}
          </a>
        {/each}
        {#if $editMode}
          <button class="flex flex-col items-center justify-center transition-all aspect-square
            {dark ? 'bg-neutral-800/50 hover:bg-neutral-800 text-neutral-500' : 'bg-white/50 hover:bg-white text-neutral-400'}"
            style="border-radius: {cfg.radius}px; border: 2px dashed {dark ? '#525252' : '#d4d4d4'};"
            onclick={() => onadd?.()}>
            <span class="text-2xl mb-1">+</span>
            <span class="text-xs">{$t('site.add')}</span>
          </button>
        {/if}
      </div>
    {:else}
      <!-- Treemap 布局 -->
      <div class="relative w-full" style="max-width: {cfg.width}px; height: {containerH}px;">
        {#each layout as tile}
          {@const gap = cfg.gap / 2}
          {@const iconSize = Math.max(20, Math.min(cfg.iconSize, Math.min(tile.w - cfg.gap, tile.h - cfg.gap) * 0.4))}
          {@const tileSite = sites.find(s => s.id === tile.id) || tile}
          <a href={tile.url}
            onclick={(e) => handleSiteClick(e, tileSite)}
            class="group absolute flex flex-col items-center justify-center overflow-hidden transition-all
              {$editMode ? 'ring-1 ' + (dark ? 'ring-neutral-600' : 'ring-neutral-300') : ''}"
            style="left: {tile.x + gap}px; top: {tile.y + gap}px;
              width: {tile.w - cfg.gap}px; height: {tile.h - cfg.gap}px;
              border-radius: {cfg.radius}px; {cardStyle}">
            <img src={resolveSiteIcon(tileSite, $isDark)} alt=""
              onload={(e) => handleIconLoad(e, tileSite)}
              onerror={(e) => { if (tileSite.iconSource !== 'custom') e.target.src = getFaviconFallback(tile.url) }}
              class="mb-1 group-hover:scale-110 transition-transform"
              style="width: {iconSize}px; height: {iconSize}px; border-radius: {tileSite.iconRadius ?? 4}%" />
            {#if $showSiteTitle && tile.h - cfg.gap > 60}
              <span class="text-xs truncate max-w-[90%] text-black">{tile.name}</span>
            {/if}
            {#if $editMode}
              <div class="absolute bottom-1.5 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                <button class="text-xs px-1.5 py-0.5 rounded
                  {dark ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}"
                  onclick={(e) => { e.preventDefault(); e.stopPropagation(); onedit?.(tileSite) }}>{$t('site.editBtn')}</button>
                <button class="text-xs px-1.5 py-0.5 rounded
                  {dark ? 'bg-neutral-700 text-red-400 hover:bg-neutral-600' : 'bg-neutral-100 text-red-400 hover:bg-red-50'}"
                  onclick={(e) => { e.preventDefault(); e.stopPropagation(); ondelete?.(tile.id) }}>{$t('site.delete')}</button>
              </div>
            {/if}
          </a>
        {/each}
      </div>
    {/if}

    {#if $editMode}
      <button class="flex items-center justify-center transition-all mt-3
        {dark ? 'bg-neutral-800/50 hover:bg-neutral-800 text-neutral-500' : 'bg-white/50 hover:bg-white text-neutral-400'}"
        style="width: 56px; height: 56px;
          border-radius: {cfg.radius}px; border: 2px dashed {dark ? '#525252' : '#d4d4d4'};"
        onclick={() => onadd?.()}>
        <span class="text-lg">+</span>
      </button>
    {/if}
  </div>
</div>
