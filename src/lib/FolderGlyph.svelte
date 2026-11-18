<script>
  import { getFolderBackground, getFolderForeground, getFolderIconScale, getFolderIconType, getFolderRadius, getFolderShowBackground, getFolderStackSites, getFolderGridCells } from './folders.js'
  import { resolveSiteIcon, getFaviconFallback, handleIconLoad } from './favicon.js'
  import { isDark } from './stores.js'
  import { getIconTone } from './iconTone.js'

  let { folder, size = 32, className = '' } = $props()

  // 各网站图标的明暗，用来给在当前模式下几乎看不见的线条图标补一块对比底色
  let tones = $state({})
  const handleSiteIconLoad = (event, site) => {
    handleIconLoad(event, site)
    const src = event.currentTarget.currentSrc || event.currentTarget.src
    getIconTone(src).then((tone) => {
      if (tones[site.id] !== tone) tones = { ...tones, [site.id]: tone }
    })
  }
  // 暗色模式下的深色图标衬浅底，亮色模式下的浅色图标衬深底
  const backingFor = (site) => {
    const tone = tones[site.id]
    if ($isDark && tone === 'dark') return 'light'
    if (!$isDark && tone === 'light') return 'dark'
    return ''
  }

  // 堆叠卡片的摆放：x / y 为相对卡片边长的偏移，r 为旋转角度；数组顺序即绘制顺序，最后一张在最上层
  // 每种数量准备几套随手叠放的底稿，大致错开且保证每个图标都能露出足够的部分
  const STACK_LAYOUTS = {
    1: [
      [{ x: 0, y: 0, r: -4 }],
    ],
    2: [
      [{ x: 0.19, y: -0.15, r: 13 }, { x: -0.16, y: 0.15, r: -6 }],
      [{ x: -0.2, y: -0.12, r: -12 }, { x: 0.15, y: 0.16, r: 7 }],
      [{ x: 0.22, y: 0.04, r: 15 }, { x: -0.15, y: -0.03, r: -9 }],
    ],
    3: [
      [{ x: 0.3, y: -0.25, r: 16 }, { x: 0.03, y: -0.03, r: -11 }, { x: -0.27, y: 0.25, r: -2 }],
      [{ x: -0.04, y: -0.3, r: -14 }, { x: 0.27, y: 0.03, r: 11 }, { x: -0.22, y: 0.2, r: 4 }],
      [{ x: 0.25, y: -0.2, r: -9 }, { x: -0.25, y: -0.13, r: 14 }, { x: 0.02, y: 0.23, r: -5 }],
      [{ x: -0.28, y: 0.04, r: -17 }, { x: 0.26, y: -0.16, r: 9 }, { x: 0.02, y: 0.17, r: -3 }],
    ],
  }

  const hashString = (value) => {
    let hash = 2166136261
    for (const char of String(value || '')) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
    return hash >>> 0
  }

  // 以文件夹 id 为种子的伪随机数，不同文件夹叠法各不相同，刷新后保持不变
  const createRandom = (seed) => {
    let state = seed || 1
    return () => {
      state = (state + 0x6d2b79f5) | 0
      let value = Math.imul(state ^ (state >>> 15), 1 | state)
      value ^= value + Math.imul(value ^ (value >>> 7), 61 | value)
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296
    }
  }
  const spread = (random, range) => (random() - 0.5) * 2 * range

  let bgColor = $derived(getFolderBackground(folder))
  let fgColor = $derived(getFolderForeground(folder))
  let scale = $derived(getFolderIconScale(folder))
  let iconType = $derived(getFolderIconType(folder))
  // 堆叠模式：文件夹为空时回退为默认图标
  let stackSites = $derived(iconType === 'stack' ? getFolderStackSites(folder) : [])
  // 宫格模式：同样在文件夹为空时回退为默认图标
  let gridCells = $derived(iconType === 'grid' ? getFolderGridCells(folder) : { sites: [], more: 0 })
  let hasPreview = $derived(stackSites.length > 0 || gridCells.sites.length > 0)
  // 堆叠和宫格直接展示网站图标，不绘制文件夹背景色；保存的「显示背景」设置保持不变，切回其他图标时仍然生效
  let showBackground = $derived(!hasPreview && getFolderShowBackground(folder))
  // 默认图标占比（78%）下底板与普通网站图标一样大，调小图标占比时底板随之缩小
  let plateSize = $derived(Math.min(size, Math.round(size * scale / 100 * 1.28)))
  let platePadding = $derived(Math.max(2, Math.round(plateSize * 0.12)))
  let plateGap = $derived(Math.max(1, Math.round(plateSize * 0.07)))
  let cellSize = $derived(Math.floor((plateSize - platePadding * 2 - plateGap) / 2))
  let radius = $derived(Math.max(12, Math.min(30, Math.round(getFolderRadius(folder) * 0.7))))
  let iconSize = $derived(Math.round(size * scale / 100))
  let iconRadius = $derived(Math.max(10, Math.min(28, Math.round(radius * scale / 100))))

  // 单张卡片时放大一些；多张时缩小，保证错开后仍在图标范围内
  // 没有背景托底，按与普通网站图标接近的视觉大小计算
  let tileSize = $derived(Math.round(size * scale / 100 * (stackSites.length > 1 ? 0.76 : 0.92)))
  // 第一个网站放在最上层，排在后面的网站依次垫在下面
  let stackTiles = $derived.by(() => {
    const variants = STACK_LAYOUTS[stackSites.length] || []
    if (variants.length === 0) return []
    const random = createRandom(hashString(folder?.id))
    // 随机挑一套底稿，一半概率左右镜像，再给每张卡片加上位置和角度的扰动
    const layout = variants[Math.floor(random() * variants.length)]
    const mirror = random() < 0.5 ? -1 : 1
    const ordered = [...stackSites].reverse()
    return ordered.map((site, index) => ({
      site,
      x: mirror * layout[index].x + spread(random, 0.05),
      y: layout[index].y + spread(random, 0.05),
      r: mirror * layout[index].r + spread(random, 7),
      depth: ordered.length - 1 - index,
    }))
  })
</script>

<div
  class={className}
  style="width: {size}px; height: {size}px; display: flex; align-items: center; justify-content: center;"
>
  <div
    class="folder-glyph-frame"
    style="width: {showBackground ? size : iconSize}px; height: {showBackground ? size : iconSize}px; border-radius: {showBackground ? radius : iconRadius}%; background: {showBackground ? bgColor : 'transparent'};"
  >
    {#if gridCells.sites.length > 0}
      <span
        class="folder-grid-plate"
        class:folder-grid-plate-dark={$isDark}
        style="--plate-size: {plateSize}px; --plate-padding: {platePadding}px; --plate-gap: {plateGap}px; --cell-size: {cellSize}px;"
      >
        {#each gridCells.sites as site (site.id)}
          <img
            class="folder-grid-icon"
            class:folder-grid-icon-single={gridCells.sites.length === 1}
            class:folder-icon-backing-light={backingFor(site) === 'light'}
            class:folder-icon-backing-dark={backingFor(site) === 'dark'}
            src={resolveSiteIcon(site, $isDark)}
            alt=""
            draggable="false"
            onload={(event) => handleSiteIconLoad(event, site)}
            onerror={(event) => { if (site.iconSource !== 'custom') event.currentTarget.src = getFaviconFallback(site.url) }}
            style="border-radius: {site.iconRadius ?? 4}%;"
          />
        {/each}
        {#if gridCells.more > 0}
          <span class="folder-grid-more">{gridCells.more > 99 ? '99' : gridCells.more}</span>
        {/if}
      </span>
    {:else if stackTiles.length > 0}
      {#each stackTiles as tile (tile.site.id)}
        <span
          class="folder-stack-tile"
          style="--tile-size: {tileSize}px; --tile-x: {tile.x * tileSize}px; --tile-y: {tile.y * tileSize}px; --tile-r: {tile.r}deg; --tile-shadow-y: {Math.max(1, Math.round(tileSize * 0.04))}px; --tile-shadow-blur: {Math.max(1, Math.round(tileSize * 0.08))}px;"
        >
          <img
            class:folder-icon-backing-light={backingFor(tile.site) === 'light'}
            class:folder-icon-backing-dark={backingFor(tile.site) === 'dark'}
            src={resolveSiteIcon(tile.site, $isDark)}
            alt=""
            draggable="false"
            onload={(event) => handleSiteIconLoad(event, tile.site)}
            onerror={(event) => { if (tile.site.iconSource !== 'custom') event.currentTarget.src = getFaviconFallback(tile.site.url) }}
            style="border-radius: {tile.site.iconRadius ?? 4}%;"
          />
        </span>
      {/each}
    {:else if (iconType === 'custom' || iconType === 'svg') && folder?.folderCustomIcon}
      <img
        src={folder.folderCustomIcon}
        alt=""
        style="width: {iconSize}px; height: {iconSize}px; border-radius: {iconRadius}%; object-fit: cover;"
      />
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke={showBackground ? fgColor : bgColor}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 12h.01" />
        <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <path d="M22 13a18.15 18.15 0 0 1-20 0" />
        <rect width="20" height="14" x="2" y="6" rx="2" />
      </svg>
    {/if}
  </div>
</div>

<style>
  .folder-glyph-frame {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* 宫格：一块淡淡的半透明底板把几个小图标归成一组，图标本身按原样显示 */
  .folder-grid-plate {
    display: grid;
    width: var(--plate-size);
    height: var(--plate-size);
    box-sizing: border-box;
    padding: var(--plate-padding);
    grid-template-columns: repeat(2, var(--cell-size));
    grid-auto-rows: var(--cell-size);
    gap: var(--plate-gap);
    place-content: center;
    border-radius: 24%;
    background: rgba(255, 255, 255, 0.55);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .folder-grid-plate-dark {
    background: rgba(255, 255, 255, 0.14);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  .folder-grid-icon {
    display: block;
    width: var(--cell-size);
    height: var(--cell-size);
    object-fit: contain;
  }

  /* 只有一个网站时占满整个宫格 */
  .folder-grid-icon-single {
    grid-column: span 2;
    grid-row: span 2;
    width: calc(var(--cell-size) * 2 + var(--plate-gap));
    height: calc(var(--cell-size) * 2 + var(--plate-gap));
  }

  /* 数量格自带接近不透明的底色，不依赖身后的卡片颜色：不同主题在暗色模式下卡片可能是浅色，也可能是深色 */
  .folder-grid-more {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 26%;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
    color: #404040;
    font-size: calc(var(--cell-size) * 0.56);
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .folder-grid-plate-dark .folder-grid-more {
    background: rgba(38, 38, 38, 0.88);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
    color: #f5f5f5;
  }

  /* 线条类图标与底板明暗相近时补一块对比底色，满色图标不受影响 */
  .folder-icon-backing-light,
  .folder-icon-backing-dark {
    box-sizing: border-box;
    padding: 12%;
    border-radius: 26% !important;
  }

  .folder-icon-backing-light {
    background: rgba(255, 255, 255, 0.92);
  }

  .folder-icon-backing-dark {
    background: rgba(23, 23, 23, 0.78);
  }

  /* 图标按原样显示：不加底板和内边距，圆角沿用网站自己的设置；
     阴影跟随图标的实际形状，只用来区分叠在一起的图标 */
  .folder-stack-tile {
    position: absolute;
    left: 50%;
    top: 50%;
    width: var(--tile-size);
    height: var(--tile-size);
    filter: drop-shadow(0 var(--tile-shadow-y) var(--tile-shadow-blur) rgba(0, 0, 0, 0.22));
    transform:
      translate(-50%, -50%)
      translate(var(--tile-x), var(--tile-y))
      rotate(var(--tile-r));
    transition: transform 260ms cubic-bezier(0.2, 0.9, 0.3, 1.2);
  }

  .folder-stack-tile img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* 悬停时卡片轻轻展开 */
  :global(.group:hover) .folder-stack-tile {
    transform:
      translate(-50%, -50%)
      translate(calc(var(--tile-x) * 1.12), calc(var(--tile-y) * 1.12))
      rotate(calc(var(--tile-r) * 1.25));
  }

  @media (prefers-reduced-motion: reduce) {
    .folder-stack-tile {
      transition: none;
    }
  }
</style>
