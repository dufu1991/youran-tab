<script>
  import { onMount, tick } from 'svelte'

  // items：{ id, label, disabled?, danger?, children? } 或 { separator: true }
  let { x = 0, y = 0, dark = false, items = [], onselect, onclose } = $props()

  const gap = 8

  let panelEl = $state(null)
  let subPanelEl = $state(null)
  let panelStyle = $state('left:0px;top:0px;visibility:hidden;')
  let subPanelStyle = $state('visibility:hidden;')
  let openSubId = $state('')
  let openSubAnchor = null

  let openSubItem = $derived(items.find((item) => item.id === openSubId && item.children?.length))

  const getButtons = (container) => [...(container?.querySelectorAll('button[role="menuitem"]:not(:disabled)') || [])]

  const syncPosition = async () => {
    await tick()
    if (!panelEl) return
    const rect = panelEl.getBoundingClientRect()
    const left = Math.max(gap, Math.min(x, window.innerWidth - rect.width - gap))
    const top = Math.max(gap, Math.min(y, window.innerHeight - rect.height - gap))
    panelStyle = `left:${left}px;top:${top}px;`
  }

  const syncSubPosition = async () => {
    await tick()
    if (!subPanelEl || !openSubAnchor) return
    const anchor = openSubAnchor.getBoundingClientRect()
    const rect = subPanelEl.getBoundingClientRect()
    // 右侧放不下时向左展开
    const fitsRight = anchor.right + 4 + rect.width <= window.innerWidth - gap
    const left = fitsRight ? anchor.right + 4 : Math.max(gap, anchor.left - rect.width - 4)
    const top = Math.max(gap, Math.min(anchor.top - 4, window.innerHeight - rect.height - gap))
    subPanelStyle = `left:${left}px;top:${top}px;`
  }

  const openSub = async (item, anchorEl, focusFirst = false) => {
    if (item.disabled || !item.children?.length) return
    openSubAnchor = anchorEl
    subPanelStyle = 'visibility:hidden;'
    openSubId = item.id
    await syncSubPosition()
    if (focusFirst) getButtons(subPanelEl)[0]?.focus()
  }

  const closeSub = (focusParent = false) => {
    const anchor = openSubAnchor
    openSubId = ''
    openSubAnchor = null
    if (focusParent) anchor?.focus()
  }

  const handleItemEnter = (item, event) => {
    if (item.children?.length) {
      openSub(item, event.currentTarget)
      return
    }
    if (openSubId) closeSub()
  }

  const handleItemClick = (item, event) => {
    if (item.disabled) return
    if (item.children?.length) {
      openSub(item, event.currentTarget, event.detail === 0)
      return
    }
    onselect?.(item.id)
  }

  const moveFocus = (container, step) => {
    const buttons = getButtons(container)
    if (buttons.length === 0) return
    const index = buttons.indexOf(document.activeElement)
    const next = index === -1 ? (step > 0 ? 0 : buttons.length - 1) : (index + step + buttons.length) % buttons.length
    buttons[next].focus()
  }

  const handleKeydown = (event) => {
    const inSub = !!subPanelEl?.contains(document.activeElement)
    const container = inSub ? subPanelEl : panelEl

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      if (inSub || openSubId) {
        closeSub(true)
        return
      }
      onclose?.()
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      moveFocus(container, event.key === 'ArrowDown' ? 1 : -1)
      return
    }
    if (event.key === 'ArrowRight' && !inSub) {
      const item = items.find((entry) => entry.id === document.activeElement?.dataset.menuId)
      if (item?.children?.length) {
        event.preventDefault()
        openSub(item, document.activeElement, true)
      }
      return
    }
    if (event.key === 'ArrowLeft' && inSub) {
      event.preventDefault()
      closeSub(true)
    }
  }

  const handlePointerDown = (event) => {
    if (panelEl?.contains(event.target) || subPanelEl?.contains(event.target)) return
    onclose?.()
  }

  $effect(() => {
    x
    y
    items
    syncPosition()
  })

  onMount(() => {
    window.addEventListener('pointerdown', handlePointerDown, true)
    window.addEventListener('keydown', handleKeydown, true)
    tick().then(() => getButtons(panelEl)[0]?.focus({ preventScroll: true }))
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true)
      window.removeEventListener('keydown', handleKeydown, true)
    }
  })

  // 菜单项图标（线性图标，24 × 24 视图），菜单项通过 icon 字段引用
  const ICONS = {
    external: ['M15 3h6v6', 'M10 14 21 3', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'],
    tabs: ['M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z', 'M3 9h18', 'M9 5v4'],
    group: ['m12 3 9 5-9 5-9-5Z', 'm3 13 9 5 9-5'],
    edit: ['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'],
    move: ['M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1', 'M2 13h10', 'm9 16 3-3-3-3'],
    out: ['M9 14 4 9l5-5', 'M4 9h10.5a5.5 5.5 0 0 1 0 11H11'],
    folder: ['M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'],
    delete: ['M3 6h18', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'm19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6', 'M10 11v6', 'M14 11v6'],
    add: ['M12 5v14', 'M5 12h14'],
    refresh: ['M21 12a9 9 0 1 1-3-6.7L21 8', 'M21 3v5h-5'],
  }

  const panelClass = $derived(`context-menu-panel fixed min-w-48 max-w-72 overflow-hidden rounded-xl border p-1 shadow-xl outline-none not-dark:bg-white/90 not-dark:border-black/8 not-dark:text-neutral-800 dark:bg-neutral-800/90 dark:border-white/10 dark:text-neutral-100`)
  const panelBaseStyle = 'z-index:1100;backdrop-filter:blur(20px) saturate(1.6);-webkit-backdrop-filter:blur(20px) saturate(1.6);'

  const itemClass = (item, active = false) => {
    if (item.disabled) return `flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm outline-none cursor-not-allowed not-dark:text-neutral-400 dark:text-neutral-500`
    const tone = item.danger
      ? 'not-dark:text-red-600 not-dark:hover:bg-red-50 not-dark:focus:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/15 dark:focus:bg-red-500/15'
      : 'not-dark:hover:bg-black/5 not-dark:focus:bg-black/5 dark:hover:bg-white/10 dark:focus:bg-white/10'
    const activeBg = active ? 'not-dark:bg-black/5 dark:bg-white/10' : ''
    return `flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm outline-none transition-colors ${tone} ${activeBg}`
  }
</script>

<svelte:window onresize={() => { syncPosition(); if (openSubId) syncSubPosition() }} />

{#snippet menuItems(list, isSub)}
  {#each list as item, index (item.separator ? `separator-${index}` : item.id)}
    {#if item.separator}
      <div class="mx-2.5 my-1 h-px not-dark:bg-black/8 dark:bg-white/10" role="separator"></div>
    {:else}
      <button
        type="button"
        class={itemClass(item, !isSub && openSubId === item.id)}
        disabled={item.disabled}
        data-menu-id={item.id}
        aria-haspopup={item.children?.length ? 'menu' : undefined}
        aria-expanded={item.children?.length ? openSubId === item.id : undefined}
        onpointerenter={(event) => { if (!isSub) handleItemEnter(item, event) }}
        onclick={(event) => handleItemClick(item, event)}
        role="menuitem"
      >
        {#if item.icon && ICONS[item.icon]}
          <svg class="w-4 h-4 shrink-0 {item.danger ? '' : 'opacity-60'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            {#each ICONS[item.icon] as path}<path d={path} />{/each}
          </svg>
        {/if}
        <span class="flex-1 min-w-0 truncate">{item.label}</span>
        {#if item.children?.length}
          <svg class="w-3.5 h-3.5 shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        {/if}
      </button>
    {/if}
  {/each}
{/snippet}

<div
  bind:this={panelEl}
  class={panelClass}
  style="{panelStyle}{panelBaseStyle}"
  oncontextmenu={(event) => event.preventDefault()}
  role="menu"
  tabindex="-1"
  data-no-context-menu
  data-keep-folder-open
>
  {@render menuItems(items, false)}
</div>

{#if openSubItem}
  <div
    bind:this={subPanelEl}
    class={panelClass}
    style="{subPanelStyle}{panelBaseStyle}"
    oncontextmenu={(event) => event.preventDefault()}
    role="menu"
    tabindex="-1"
    data-no-context-menu
    data-keep-folder-open
  >
    {@render menuItems(openSubItem.children, true)}
  </div>
{/if}


<style>
  /* 打开时从鼠标位置轻微放大淡入 */
  .context-menu-panel {
    transform-origin: top left;
    animation: context-menu-in 120ms cubic-bezier(0.2, 0.9, 0.3, 1);
  }

  @keyframes context-menu-in {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .context-menu-panel {
      animation: none;
    }
  }
</style>
