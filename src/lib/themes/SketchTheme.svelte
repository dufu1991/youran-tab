<script>
  import { t } from '../i18n.js'
  import { resolveSiteIcon, getFaviconFallback, handleIconLoad } from '../favicon.js'
  import { editMode, showSearchBar, showSiteTitle, showEngineLogo, isDark, resolvedBgStyle, bgIsLight, sites as sitesStore, searchEngine, searchEngines, doSearch } from '../stores.js'

  let { sites = [], dark = false, align = 'top', onadd, onedit, ondelete } = $props()

  let dragIndex = $state(-1)
  let dragOverIndex = $state(-1)

  // 搜索相关状态
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

  // 便利贴的柔和背景色
  const pastelColors = [
    { light: '#fff9c4', dark: '#7a6f35' },  // 黄色
    { light: '#f8bbd0', dark: '#7a3a50' },  // 粉色
    { light: '#c8e6c9', dark: '#3d6240' },  // 绿色
    { light: '#bbdefb', dark: '#355278' },  // 蓝色
    { light: '#d1c4e9', dark: '#50407a' },  // 紫色
    { light: '#ffe0b2', dark: '#785530' },  // 橙色
  ]

  // 图钉 / 胶带的颜色
  const pinColors = ['#e53935', '#1e88e5', '#43a047', '#fb8c00', '#8e24aa', '#00acc1']

  // 手绘风格的不规则圆角
  const borderRadiusVariants = [
    '255px 15px 225px 15px / 15px 225px 15px 255px',
    '15px 255px 15px 225px / 225px 15px 255px 15px',
    '225px 15px 255px 15px / 15px 255px 15px 225px',
    '15px 225px 15px 255px / 255px 15px 225px 15px',
    '245px 25px 215px 25px / 25px 215px 25px 245px',
    '25px 245px 25px 215px / 215px 25px 245px 25px',
  ]

  // 每张便利贴的旋转角度
  function getRotation(i) {
    const rotations = [-1.8, 1.2, -0.5, 2.0, -1.3, 0.7, -2.0, 1.5, -0.8, 1.8, -1.0, 0.3]
    return rotations[i % rotations.length]
  }

  function getBorderRadius(i) {
    return borderRadiusVariants[i % borderRadiusVariants.length]
  }

  function getPastelColor(i) {
    const c = pastelColors[i % pastelColors.length]
    return dark ? c.dark : c.light
  }

  function getPinColor(i) {
    return pinColors[i % pinColors.length]
  }

  // 便利贴的不同内边距，产生高矮不一的效果
  function getExtraPadding(i) {
    const paddings = [24, 36, 18, 42, 28, 50, 20, 32, 44, 26]
    return paddings[i % paddings.length]
  }
</script>

<div class="sketch-theme w-full h-full flex flex-col items-center {alignClass}
  {$resolvedBgStyle ? '' : (dark ? 'sketch-dark' : 'sketch-light')}"
  style={$resolvedBgStyle}>

  {#if $editMode}
    <div class="sketch-edit-bar">
      <span>✏️ {$t('settings.editModeHint')}</span>
      <button
        class="sketch-edit-done"
        onclick={() => editMode.set(false)}
      >{$t('settings.editModeDone')}</button>
    </div>
  {/if}

  <div class="mb-10 w-full flex justify-center px-8">
    {#if $showSearchBar}
      <form class="sketch-note sketch-search-note" onsubmit={handleSearch}
        style="border-radius: {getBorderRadius(0)};
          transform: rotate(-0.5deg);
          background: {getPastelColor(0)};
          --pin-color: {getPinColor(0)};">
        <div class="sketch-search-row">
          {#if $showEngineLogo && engineIcon}
            <img src={engineIcon} alt="" class="sketch-search-engine-icon" />
          {:else}
            <span class="sketch-search-icon">🔍</span>
          {/if}
          <input type="text" bind:value={query}
            placeholder={$t('search.placeholder')}
            class="sketch-search-input" />
        </div>
      </form>
    {/if}
  </div>

  <div class="sketch-board">
    {#each sites as site, i}
      <a href={site.url}
        onclick={(e) => handleSiteClick(e, site)}
        draggable={$editMode}
        ondragstart={(e) => handleDragStart(e, i)}
        ondragover={(e) => handleDragOver(e, i)}
        ondrop={(e) => handleDrop(e, i)}
        ondragend={handleDragEnd}
        class="sketch-note group
          {$editMode ? 'sketch-note-edit' : ''}
          {$editMode && dragOverIndex === i && dragIndex !== i ? 'sketch-note-dragover' : ''}"
        style="border-radius: {getBorderRadius(i)};
          transform: rotate({getRotation(i)}deg);
          background: {getPastelColor(i)};
          padding-bottom: {getExtraPadding(i)}px;
          --pin-color: {getPinColor(i)};
          {$editMode && dragIndex === i ? 'opacity: 0.4;' : ''}">
        <div class="sketch-icon-wrap">
          <img src={resolveSiteIcon(site, $isDark)} alt=""
            onload={(e) => handleIconLoad(e, site)}
            onerror={(e) => { if (site.iconSource !== 'custom') e.target.src = getFaviconFallback(site.url) }}
            class="sketch-icon"
            style="border-radius: {site.iconRadius ?? 4}%" />
        </div>
        {#if $showSiteTitle}
          <span class="sketch-title">{site.name}</span>
        {/if}
        {#if $editMode}
          <div class="sketch-actions">
            <button class="sketch-action-btn"
              onclick={(e) => { e.preventDefault(); e.stopPropagation(); onedit?.(site) }}>{$t('site.editBtn')}</button>
            <button class="sketch-action-btn sketch-action-delete"
              onclick={(e) => { e.preventDefault(); e.stopPropagation(); ondelete?.(site.id) }}>{$t('site.delete')}</button>
          </div>
        {/if}
      </a>
    {/each}

    {#if $editMode}
      <button class="sketch-add-btn"
        onclick={() => onadd?.()}>
        <span class="sketch-add-icon">+</span>
        <span class="sketch-add-text">{$t('site.add')}</span>
      </button>
    {/if}
  </div>
</div>

<style>
  /* ===== 便利贴 / 公告板风格主题 ===== */

  .sketch-theme {
    font-family: 'Comic Sans MS', 'Marker Felt', 'Segoe Print', 'Bradley Hand', cursive, sans-serif;
    min-height: 100%;
  }

  /* -- 明亮模式：软木板背景 -- */
  .sketch-light {
    background-color: #d2a679;
    background-image:
      url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='40' height='40' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E"),
      linear-gradient(135deg, #c49a6c 0%, #d4a97a 50%, #c09060 100%);
  }

  /* -- 深色模式：深色木板风格 -- */
  .sketch-dark {
    background-color: #2a2420;
    background-image:
      url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='40' height='40' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E"),
      linear-gradient(135deg, #2a2420 0%, #342c26 50%, #252018 100%);
  }

  /* -- 搜索便签样式 -- */
  .sketch-search-note {
    width: 100%;
    max-width: 500px;
    padding: 28px 20px 20px !important;
    margin-bottom: 0 !important;
    cursor: default;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .sketch-search-note:hover {
    transform: rotate(0deg) translateY(-4px) !important;
  }

  .sketch-search-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }

  .sketch-search-engine-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    transform: rotate(2deg);
  }

  .sketch-search-icon {
    font-size: 16px;
    flex-shrink: 0;
    transform: rotate(-3deg);
    opacity: 0.7;
  }

  .sketch-search-input {
    flex: 1;
    background: transparent;
    outline: none;
    border: none;
    border-bottom: 2px dashed;
    font-size: 14px;
    font-family: inherit;
    min-width: 0;
    padding: 4px 0;
  }

  .sketch-light .sketch-search-input {
    color: #3e2f1c;
    border-color: rgba(0, 0, 0, 0.2);
  }

  .sketch-light .sketch-search-input::placeholder {
    color: #9e8e7e;
  }

  .sketch-dark .sketch-search-input {
    color: #f5efe6;
    border-color: rgba(255, 255, 255, 0.25);
  }

  .sketch-dark .sketch-search-input::placeholder {
    color: #a89a8a;
  }

  .sketch-search-input:focus {
    border-bottom-style: solid;
  }

  /* -- 编辑模式顶栏 -- */
  .sketch-edit-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 8px 16px;
    font-size: 14px;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    border-bottom: 2px dashed;
  }

  .sketch-light .sketch-edit-bar {
    background: rgba(255, 255, 255, 0.92);
    color: #333;
    border-color: #999;
  }

  .sketch-dark .sketch-edit-bar {
    background: rgba(60, 60, 60, 0.92);
    color: #eee;
    border-color: #777;
  }

  .sketch-edit-done {
    padding: 2px 14px;
    font-size: 12px;
    border: 2px solid;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    font-family: inherit;
  }

  .sketch-light .sketch-edit-done {
    border-color: #555;
    color: #333;
    background: rgba(255, 255, 255, 0.6);
  }

  .sketch-light .sketch-edit-done:hover {
    background: #333;
    color: #fff;
  }

  .sketch-dark .sketch-edit-done {
    border-color: #aaa;
    color: #eee;
    background: rgba(255, 255, 255, 0.08);
  }

  .sketch-dark .sketch-edit-done:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* -- 公告板：CSS columns 瀑布流 -- */
  .sketch-board {
    columns: 3;
    column-gap: 16px;
    max-width: 700px;
    width: 100%;
    padding: 0 24px;
    margin: 0 auto;
  }

  @media (max-width: 560px) {
    .sketch-board {
      columns: 2;
      column-gap: 12px;
      padding: 0 12px;
    }
  }

  /* -- 便利贴卡片 -- */
  .sketch-note {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 28px 14px 24px;
    margin-bottom: 16px;
    text-decoration: none;
    position: relative;
    cursor: pointer;
    break-inside: avoid;
    border: none;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 2px 3px 7px rgba(0, 0, 0, 0.18), 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /* 图钉装饰（放在卡片内部 padding 区域，避免被 columns 裁切） */
  .sketch-note::before {
    content: '';
    position: absolute;
    top: 5px;
    left: 50%;
    transform: translateX(-50%);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--pin-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 -2px 3px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.4);
    z-index: 2;
  }

  /* 图钉高光 */
  .sketch-note::after {
    content: '';
    position: absolute;
    top: 8px;
    left: calc(50% - 2px);
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    z-index: 3;
  }

  .sketch-light .sketch-note {
    color: #3e2f1c;
  }

  .sketch-dark .sketch-note {
    color: #f5efe6;
    box-shadow: 2px 3px 7px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.25);
  }

  .sketch-note:hover {
    transform: rotate(0deg) translateY(-8px) !important;
    z-index: 10;
  }

  .sketch-light .sketch-note:hover {
    box-shadow: 4px 8px 20px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.12);
  }

  .sketch-dark .sketch-note:hover {
    box-shadow: 4px 8px 20px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  /* -- 编辑模式卡片样式 -- */
  .sketch-note-edit {
    cursor: grab;
    outline: 2px dashed rgba(0, 0, 0, 0.25);
    outline-offset: -2px;
  }

  .sketch-dark .sketch-note-edit {
    outline-color: rgba(255, 255, 255, 0.25);
  }

  .sketch-note-dragover {
    outline: 3px solid rgba(0, 0, 0, 0.5) !important;
    outline-offset: -3px;
  }

  .sketch-dark .sketch-note-dragover {
    outline-color: rgba(255, 255, 255, 0.5) !important;
  }

  /* -- 图标 -- */
  .sketch-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    transition: transform 0.3s ease;
  }

  .sketch-note:hover .sketch-icon-wrap {
    transform: scale(1.1);
  }

  .sketch-icon {
    width: 44px;
    height: 44px;
    object-fit: contain;
    filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.15));
  }

  /* -- 标题 -- */
  .sketch-title {
    font-size: 13px;
    font-weight: 600;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    letter-spacing: 0.3px;
  }

  .sketch-light .sketch-title {
    color: #3e2f1c;
  }

  .sketch-dark .sketch-title {
    color: #f5efe6;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  /* -- 编辑 / 删除按钮 -- */
  .sketch-actions {
    display: flex;
    gap: 6px;
    opacity: 0;
    transition: opacity 0.2s;
    position: absolute;
    bottom: 6px;
  }

  .sketch-note:hover .sketch-actions {
    opacity: 1;
  }

  .sketch-action-btn {
    font-size: 11px;
    padding: 2px 8px;
    cursor: pointer;
    border: 1.5px solid;
    background: rgba(255, 255, 255, 0.5);
    transition: all 0.2s;
    border-radius: 15px 225px 15px 255px / 225px 15px 255px 15px;
    font-family: inherit;
  }

  .sketch-light .sketch-action-btn {
    color: #555;
    border-color: #888;
  }

  .sketch-light .sketch-action-btn:hover {
    background: #333;
    color: #fff;
    border-color: #333;
  }

  .sketch-dark .sketch-action-btn {
    color: #ddd;
    border-color: #888;
    background: rgba(0, 0, 0, 0.3);
  }

  .sketch-dark .sketch-action-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
  }

  .sketch-light .sketch-action-delete:hover {
    background: #c0392b;
    border-color: #c0392b;
    color: #fff;
  }

  .sketch-dark .sketch-action-delete:hover {
    background: rgba(231, 76, 60, 0.6);
    border-color: rgba(231, 76, 60, 0.6);
    color: #fff;
  }

  /* -- 添加按钮 -- */
  .sketch-add-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 28px 14px;
    cursor: pointer;
    background: transparent;
    transition: all 0.3s ease;
    border: 3px dashed;
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    font-family: inherit;
    break-inside: avoid;
    margin-bottom: 16px;
    width: 100%;
  }

  .sketch-light .sketch-add-btn {
    border-color: rgba(0, 0, 0, 0.25);
    color: rgba(0, 0, 0, 0.4);
  }

  .sketch-light .sketch-add-btn:hover {
    border-color: rgba(0, 0, 0, 0.5);
    color: rgba(0, 0, 0, 0.6);
    background: rgba(255, 255, 255, 0.4);
    transform: scale(1.02);
  }

  .sketch-dark .sketch-add-btn {
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.35);
  }

  .sketch-dark .sketch-add-btn:hover {
    border-color: rgba(255, 255, 255, 0.4);
    color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.06);
    transform: scale(1.02);
  }

  .sketch-add-icon {
    font-size: 28px;
    line-height: 1;
    font-weight: 300;
  }

  .sketch-add-text {
    font-size: 12px;
  }
</style>
