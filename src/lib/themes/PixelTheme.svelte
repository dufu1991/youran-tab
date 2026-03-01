<script>
  import { t } from '../i18n.js'
  import { resolveSiteIcon, getFaviconFallback, handleIconLoad } from '../favicon.js'
  import { editMode, showSearchBar, isDark, resolvedBgStyle, bgIsLight, sites as sitesStore, searchEngine, searchEngines, doSearch, showEngineLogo } from '../stores.js'

  let { sites = [], dark = false, align = 'top', onadd, onedit, ondelete } = $props()

  let dragIndex = $state(-1)
  let dragOverIndex = $state(-1)

  let query = $state('')

  function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    doSearch(query.trim(), $searchEngine)
  }

  let engineIcon = $derived(searchEngines[$searchEngine]?.icon || '')

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

  let textDark = $derived(!$bgIsLight)
  let alignClass = $derived(align === 'center' ? 'justify-center' : align === 'bottom' ? 'justify-end pb-24' : 'pt-24')

  // 根据站点数量动态计算列数，使内容不超出页面高度
  let menuHeight = $derived.by(() => {
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800
    const topOffset = $showSearchBar ? 200 : 140
    return Math.max(200, vh - topOffset)
  })

  let pixelCols = $derived.by(() => {
    const count = sites.length + ($editMode ? 1 : 0)
    const itemH = 41
    const chromeH = 60 // 标题栏 + 状态栏
    const maxPerCol = Math.max(1, Math.floor((menuHeight - chromeH) / itemH))
    const needed = Math.max(1, Math.ceil(count / maxPerCol))
    return Math.min(4, needed)
  })

  let menuMaxWidth = $derived(pixelCols <= 1 ? 400 : pixelCols * 360)

  let pageBg = $derived(dark ? '#1a1a2e' : '#faf3e0')
  let containerBg = $derived(dark ? '#22223a' : '#fdf6e3')
  let titleBarBg = $derived(dark ? '#2e2e4a' : '#e8dcc8')
  let borderColor = $derived(dark ? '#555' : '#222')
  let itemBorderColor = $derived(dark ? '#3a3a55' : '#d5c9a8')
  let textColor = $derived(dark ? '#e0e0e0' : '#222222')
  let textMuted = $derived(dark ? '#888' : '#777')
  let hoverBg = $derived(dark ? '#3a3a5e' : '#efe3c8')
  let selectedBg = $derived(dark ? '#4a4a6e' : '#e5d8b0')
  let shadowColor = $derived(dark ? '#111' : '#000')
  let arrowColor = $derived(dark ? '#7a7a9a' : '#999')
  let dotColor = $derived(dark ? '#4a4a65' : '#c0b89a')
</script>

<div class="pixel-page w-full h-full flex flex-col items-center {alignClass}"
  style="{$resolvedBgStyle ? $resolvedBgStyle : `background: ${pageBg}`}">

  {#if $editMode}
    <div class="pixel-edit-bar fixed top-0 left-0 right-0 z-40 flex items-center justify-center gap-3 py-2"
      style="background: {titleBarBg}; border-bottom: 2px solid {borderColor}; box-shadow: 0 4px 0 {shadowColor}; font-family: 'Courier New', Courier, monospace;">
      <span style="color: {textColor}">[ {$t('settings.editModeHint')} ]</span>
      <button
        class="pixel-btn-sm"
        style="background: {dark ? '#444' : '#eee'}; color: {textColor}; border: 2px solid {borderColor}; box-shadow: 2px 2px 0 {shadowColor}; border-radius: 0; padding: 2px 12px; font-family: 'Courier New', Courier, monospace; font-size: 12px; cursor: pointer;"
        onclick={() => editMode.set(false)}
      >{$t('settings.editModeDone')}</button>
    </div>
  {/if}

  <div class="mb-6 w-full flex justify-center px-8">
    {#if $showSearchBar}
      <form onsubmit={handleSearch}
        class="pixel-search-form flex items-center w-full"
        style="
          max-width: {menuMaxWidth}px;
          width: 90%;
          background: {containerBg};
          border: 2px solid {borderColor};
          box-shadow: 4px 4px 0 {shadowColor};
          font-family: 'Courier New', Courier, monospace;
          padding: 8px 12px;
        ">
        {#if $showEngineLogo && engineIcon}
          <img src={engineIcon} alt=""
            style="
              width: 24px;
              height: 24px;
              image-rendering: pixelated;
              flex-shrink: 0;
              margin-right: 8px;
            " />
        {:else}
          <span style="
            color: {textMuted};
            font-size: 14px;
            flex-shrink: 0;
            margin-right: 6px;
            user-select: none;
          ">&gt;</span>
        {/if}
        <input type="text" bind:value={query}
          placeholder={$t('search.placeholder')}
          style="
            flex: 1;
            background: transparent;
            outline: none;
            border: none;
            font-family: 'Courier New', Courier, monospace;
            font-size: 13px;
            color: {textColor};
            caret-color: {textColor};
            min-width: 0;
          " />
      </form>
    {/if}
  </div>

  <div class="pixel-menu-container"
    style="
      max-width: {menuMaxWidth}px;
      width: 90%;
      background: {containerBg};
      border: 2px solid {borderColor};
      box-shadow: 4px 4px 0 {shadowColor};
      font-family: 'Courier New', Courier, monospace;
    ">

    <!-- 标题栏 -->
    <div class="pixel-title-bar"
      style="
        background: {titleBarBg};
        border-bottom: 2px solid {borderColor};
        padding: 6px 0;
        text-align: center;
        font-size: 13px;
        letter-spacing: 2px;
        color: {textColor};
        user-select: none;
      ">
      &#x2550;&#x2550;&#x2550; BOOKMARKS &#x2550;&#x2550;&#x2550;
    </div>

    <!-- 站点列表 -->
    <div class="pixel-menu-list" style="padding: 0; columns: {pixelCols}; column-gap: 0; max-height: {menuHeight - 60}px; column-fill: auto;">
      {#each sites as site, i}
        <a href={site.url}
          onclick={(e) => handleSiteClick(e, site)}
          draggable={$editMode}
          ondragstart={(e) => handleDragStart(e, i)}
          ondragover={(e) => handleDragOver(e, i)}
          ondrop={(e) => handleDrop(e, i)}
          ondragend={handleDragEnd}
          class="pixel-menu-item group"
          class:pixel-menu-item-dragging={$editMode && dragIndex === i}
          class:pixel-menu-item-dragover={$editMode && dragOverIndex === i && dragIndex !== i}
          style="
            display: flex;
            align-items: center;
            padding: 8px 12px;
            text-decoration: none;
            color: {textColor};
            border-bottom: 1px solid {itemBorderColor};
            font-family: 'Courier New', Courier, monospace;
            font-size: 13px;
            transition: background 0.08s ease;
            {$editMode && dragIndex === i ? 'opacity: 0.4;' : ''}
            {$editMode && dragOverIndex === i && dragIndex !== i ? `background: ${selectedBg};` : ''}
            {$editMode ? 'cursor: grab;' : 'cursor: pointer;'}
          ">

          <img src={resolveSiteIcon(site, $isDark)} alt=""
            onload={(e) => handleIconLoad(e, site)}
            onerror={(e) => { if (site.iconSource !== 'custom') e.target.src = getFaviconFallback(site.url) }}
            class="pixel-icon"
            style="
              width: 24px;
              height: 24px;
              image-rendering: pixelated;
              border-radius: {site.iconRadius ?? 0}%;
              flex-shrink: 0;
            " />

          <span class="pixel-item-name" style="
              margin-left: 10px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              flex: 1;
              min-width: 0;
            ">{site.name}</span>
            <span class="pixel-dots" style="
              flex: 0 0 auto;
              margin: 0 6px;
              color: {dotColor};
              letter-spacing: 2px;
              font-size: 11px;
              overflow: hidden;
              white-space: nowrap;
            ">........</span>

          {#if $editMode}
            <div class="flex gap-1 items-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="pixel-action-btn"
                style="font-family: 'Courier New', Courier, monospace; font-size: 10px; color: {dark ? '#aaa' : '#555'}; border: 1px solid {dark ? '#555' : '#aaa'}; border-radius: 0; padding: 1px 6px; background: {dark ? '#333' : '#f5f5dc'}; box-shadow: 1px 1px 0 {shadowColor};"
                onclick={(e) => { e.preventDefault(); e.stopPropagation(); onedit?.(site) }}>{$t('site.editBtn')}</button>
              <button class="pixel-action-btn"
                style="font-family: 'Courier New', Courier, monospace; font-size: 10px; color: {dark ? '#e55' : '#c00'}; border: 1px solid {dark ? '#a33' : '#c00'}; border-radius: 0; padding: 1px 6px; background: {dark ? '#3a2020' : '#ffe0e0'}; box-shadow: 1px 1px 0 {shadowColor};"
                onclick={(e) => { e.preventDefault(); e.stopPropagation(); ondelete?.(site.id) }}>{$t('site.delete')}</button>
            </div>
          {:else}
            <span class="pixel-arrow" style="
              color: {arrowColor};
              font-size: 14px;
              flex-shrink: 0;
            ">&#x25B6;</span>
          {/if}
        </a>
      {/each}

      {#if $editMode}
        <button class="pixel-menu-item pixel-add-item group"
          style="
            display: flex;
            align-items: center;
            padding: 8px 12px;
            width: 100%;
            text-align: left;
            font-family: 'Courier New', Courier, monospace;
            font-size: 13px;
            color: {textMuted};
            background: transparent;
            border: none;
            border-bottom: 1px dashed {itemBorderColor};
            cursor: pointer;
            transition: background 0.08s ease;
          "
          onclick={() => onadd?.()}>
          <span style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            flex-shrink: 0;
            font-size: 18px;
            color: {textMuted};
          ">+</span>
          <span style="margin-left: 10px;">{$t('site.add')}</span>
          <span style="flex: 1;"></span>
          <span style="color: {arrowColor}; font-size: 14px;">&#x25B6;</span>
        </button>
      {/if}
    </div>

    <!-- 底部状态栏 -->
    <div style="
      background: {titleBarBg};
      border-top: 2px solid {borderColor};
      padding: 4px 12px;
      text-align: center;
      font-size: 10px;
      color: {textMuted};
      font-family: 'Courier New', Courier, monospace;
      letter-spacing: 1px;
      user-select: none;
    ">
      {sites.length} ITEM{sites.length !== 1 ? 'S' : ''}
    </div>
  </div>
</div>

<style>
  .pixel-menu-item {
    transition: background 0.08s ease, transform 0.08s ease;
    break-inside: avoid;
  }

  .pixel-menu-item:hover {
    background: var(--pixel-hover-bg, #efe3c8);
    transform: translateX(4px);
  }

  .pixel-page :global(.pixel-menu-item:hover) {
    background: #efe3c8;
  }

  :global(.dark) .pixel-page :global(.pixel-menu-item:hover),
  .pixel-page[style*="1a1a2e"] :global(.pixel-menu-item:hover) {
    background: #3a3a5e;
  }

  .pixel-menu-item:hover .pixel-arrow {
    color: #555;
    transform: translateX(2px);
  }

  :global(.dark) .pixel-menu-item:hover .pixel-arrow,
  .pixel-page[style*="1a1a2e"] .pixel-menu-item:hover .pixel-arrow {
    color: #bbb;
  }

  .pixel-arrow {
    transition: transform 0.1s ease, color 0.1s ease;
  }

  .pixel-menu-item:hover .pixel-dots {
    opacity: 0.6;
  }

  .pixel-menu-item:active {
    transform: translateX(2px);
    background: var(--pixel-selected-bg, #e5d8b0);
  }

  :global(.dark) .pixel-menu-item:active,
  .pixel-page[style*="1a1a2e"] .pixel-menu-item:active {
    background: #4a4a6e;
  }

  .pixel-add-item:hover {
    background: var(--pixel-hover-bg, #efe3c8);
    transform: translateX(4px);
  }

  :global(.dark) .pixel-add-item:hover,
  .pixel-page[style*="1a1a2e"] .pixel-add-item:hover {
    background: #3a3a5e;
  }

  .pixel-icon {
    transition: transform 0.1s ease;
  }

  .pixel-menu-item:hover .pixel-icon {
    transform: scale(1.15);
  }

  .pixel-action-btn {
    cursor: pointer;
    transition: transform 0.1s ease, box-shadow 0.1s ease;
  }

  .pixel-action-btn:hover {
    transform: translate(-1px, -1px);
  }

  .pixel-action-btn:active {
    transform: translate(1px, 1px);
    box-shadow: none !important;
  }

  .pixel-btn-sm:hover {
    transform: translate(-1px, -1px);
  }

  .pixel-btn-sm:active {
    transform: translate(1px, 1px);
    box-shadow: none !important;
  }

  .pixel-menu-item-dragging {
    opacity: 0.4;
  }

  .pixel-menu-item-dragover {
    outline: 2px dashed #888;
    outline-offset: -2px;
  }

  .pixel-menu-item:last-child {
    border-bottom: none;
  }

  .pixel-menu-container {
    overflow: hidden;
  }

  .pixel-search-form input::placeholder {
    color: inherit;
    opacity: 0.4;
    font-family: 'Courier New', Courier, monospace;
  }
</style>
