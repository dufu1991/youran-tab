<script>
  import { t } from '../i18n.js'
  import SiteIcon from '../SiteIcon.svelte'
  import { clickCounts, editMode, showSearchBar, resolvedBgStyle, bgIsLight, bubbleConfig, doSearch, searchPlaceholder } from '../stores.js'
  import FolderGlyph from '../FolderGlyph.svelte'
  import { getFolderBackground, isFolderItem } from '../folders.js'
  import SearchTargetPicker from '../SearchTargetPicker.svelte'
  import SiteSuggestions from '../SiteSuggestions.svelte'
  import { createSiteDrag } from './siteDrag.svelte.js'

  let { sites = [], dark = false, align = 'top', onadd, onedit, ondelete, onopenfolder } = $props()

  // 编辑模式下拖拽排序
  const drag = createSiteDrag()

  const handleSiteClick = (e, site) => {
    if (isFolderItem(site)) {
      handleFolderClick(e, site)
      return
    }
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

  // 搜索气泡
  let searchExpanded = $state(false)
  let searchQuery = $state('')
  let searchInputEl = $state(null)

  const handleSearchClick = () => {
    searchExpanded = true
    requestAnimationFrame(() => searchInputEl?.focus())
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    doSearch(searchQuery.trim())
  }

  const handleSearchBlur = () => {
    if (!searchQuery.trim()) {
      searchExpanded = false
    }
  }

  let textDark = $derived(!$bgIsLight)
  let isRandom = $derived($bubbleConfig.layout === 'random')
  let bubbleSize = $derived($bubbleConfig.size || 80)
  let alignClass = $derived(
    align === 'center' ? 'justify-center-safe py-12' : align === 'bottom' ? 'justify-end-safe pt-12 pb-24' : 'pt-24 pb-12'
  )

  // 随机布局：使用确定性伪随机 + 碰撞检测，保证不重叠
  const seededRandom = (seed) => {
    let x = Math.sin(seed * 9301 + 49297) * 233280
    return x - Math.floor(x)
  }

  // 随机布局的画布高度：按气泡数量扩展，保证站点多时也能放得下而不互相重叠
  let randomHeight = $derived.by(() => {
    const count = sites.length + ($editMode ? 1 : 0)
    const cell = bubbleSize + 48 // 气泡 + 间距 + 标题
    const perRow = Math.max(1, Math.floor((800 - 80) / cell))
    // 随机摆放的空间利用率远低于网格，按约 1.6 倍行数预留
    return Math.max(500, Math.ceil(count / perRow * 1.6) * cell + 80)
  })

  let randomPositions = $derived.by(() => {
    if (!isRandom) return []
    const count = sites.length + ($editMode ? 1 : 0)
    const placed = []
    const size = bubbleSize
    const W = 800, H = randomHeight
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

  <!-- 搜索气泡 -->
  {#if $showSearchBar}
    <div class="mb-10 flex justify-center">
      <div class="search-bubble" class:search-bubble--expanded={searchExpanded}>
        {#if searchExpanded}
          <div class="search-bubble-circle"
            style="width: {bubbleSize}px; height: {bubbleSize}px;
              background: {dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)'};
              box-shadow: {dark
                ? '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
                : '0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)'};">
            <form onsubmit={handleSearch} class="search-bubble-form">
              <SearchTargetPicker {dark} />
              <SiteSuggestions input={searchInputEl} query={searchQuery} dark={dark} />
              <input type="text" bind:value={searchQuery} bind:this={searchInputEl}
                onblur={handleSearchBlur}
                placeholder={$searchPlaceholder}
                class="flex-1 bg-transparent outline-none text-sm min-w-0
                  not-dark:text-black not-dark:placeholder:text-black/40 dark:text-white dark:placeholder:text-white/40" />
              <button type="submit" class="shrink-0 ml-2 p-0 border-0 bg-transparent cursor-pointer transition-opacity
                not-dark:text-black/40 dark:text-white/40 hover:opacity-80" aria-label={$t('search.submit')}>
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>
                </svg>
              </button>
            </form>
          </div>
        {:else}
          <button
            type="button"
            class="search-bubble-circle"
            aria-label={$searchPlaceholder}
            style="width: {bubbleSize}px; height: {bubbleSize}px;
              background: {dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)'};
              box-shadow: {dark
                ? '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
                : '0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)'};"
            onclick={handleSearchClick}
          >
            <svg class="w-6 h-6 not-dark:text-black/30 dark:text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        {/if}
      </div>
    </div>
  {/if}

  <div class="bubble-container {isRandom ? 'relative w-full' : 'flex flex-wrap justify-center items-center gap-6 px-8 mx-auto'}"
    style="{isRandom ? `max-width: 800px; height: ${randomHeight}px; flex-shrink: 0;` : 'max-width: 600px;'}">
    {#each sites as site, i (site.id)}
      <a href={isFolderItem(site) ? '#' : site.url}
        data-context-item={isFolderItem(site) ? 'folder' : 'site'}
        data-item-id={site.id}
        onclick={(e) => handleSiteClick(e, site)}
        draggable={$editMode}
        ondragstart={(e) => drag.start(e, i)}
        ondragover={(e) => drag.over(e, i)}
        ondrop={(e) => drag.drop(e, i)}
        ondragend={drag.end}
        data-drop-into={drag.isInto(i)}
        class="bubble group {isRandom ? 'absolute' : 'relative'} flex flex-col items-center no-underline
          {$editMode ? 'cursor-grab' : ''}
          {$editMode && drag.index === i ? 'opacity-40' : ''}
          {$editMode && drag.isTarget(i) ? 'bubble-dragover' : ''}"
        style="{isRandom && randomPositions[i] ? `left: ${randomPositions[i].x}%; top: ${randomPositions[i].y}%;` : ''}">

        <div class="bubble-circle relative rounded-full flex items-center justify-center
          transition-all duration-300 ease-out
          {$editMode ? 'ring-2 ' + 'not-dark:ring-black/10 dark:ring-white/20' : ''}"
          style="width: {bubbleSize}px; height: {bubbleSize}px;
            background: {isFolderItem(site) ? getFolderBackground(site) : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)')};
            box-shadow: {dark
              ? '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)'};">
          {#if isFolderItem(site)}
            <FolderGlyph folder={site} size={Math.round(bubbleSize * 0.5)} className="transition-transform duration-300" />
          {:else}
            <SiteIcon site={site} class="transition-transform duration-300" style="width: {Math.round(bubbleSize * 0.5)}px; height: {Math.round(bubbleSize * 0.5)}px; border-radius: {site.iconRadius ?? 4}%" />
          {/if}
        </div>

        {#if $editMode}
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100
            flex gap-1 transition-opacity z-10 whitespace-nowrap">
            <button class="text-2xs px-1.5 py-0.5 rounded-full
              not-dark:bg-white/90 not-dark:text-neutral-500 not-dark:hover:bg-white dark:bg-neutral-700/90 dark:text-neutral-300 dark:hover:bg-neutral-600
              shadow-sm backdrop-blur-sm"
              onclick={(e) => { e.preventDefault(); e.stopPropagation(); onedit?.(site) }}>{$t('site.editBtn')}</button>
            <button class="text-2xs px-1.5 py-0.5 rounded-full
              text-red-400 not-dark:bg-white/90 not-dark:hover:bg-red-50 dark:bg-neutral-700/90 dark:hover:bg-neutral-600
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

  .bubble:hover :global(img) {
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
