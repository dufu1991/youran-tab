<script>
  import { onDestroy } from 'svelte'
  import { tick } from 'svelte'
  import { t } from './i18n.js'
  import { clickCounts, sites } from './stores.js'
  import SiteIcon from './SiteIcon.svelte'
  import { getFolderSites, moveSiteToFolder, reorderFolderSites } from './folders.js'

  let { folder = null, anchorRect = null, panelRadius = 18, dark = false, editMode = false, onclose, oneditfolder, oneditsite, ondeletesite } = $props()

  let panelEl = $state(null)
  let viewportWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1440)
  let viewportHeight = $state(typeof window !== 'undefined' ? window.innerHeight : 900)
  let isExpanded = $state(false)
  let closeTimer = null
  let detachOutsideListener = null

  let folderSites = $derived(getFolderSites(folder))
  let itemRadius = $derived(Math.max(12, panelRadius - 6))
  let collapsedScale = $derived.by(() => {
    const source = anchorRect || { width: 8, height: 8 }
    return {
      x: Math.max(0.001, Math.min(0.08, source.width / 320)),
      y: Math.max(0.001, Math.min(0.12, source.height / 360)),
    }
  })
  let panelMeta = $derived.by(() => {
    const width = 320
    const gap = 10
    const padding = 12
    const estimatedHeight = 360
    const rect = anchorRect || { left: viewportWidth / 2 - 80, top: viewportHeight / 2 - 80, right: viewportWidth / 2 + 80, bottom: viewportHeight / 2 + 80 }
    const fitsRight = rect.right + gap + width <= viewportWidth - padding
    const left = fitsRight
      ? rect.right + gap
      : Math.max(padding, rect.left - width - gap)
    const top = Math.max(padding, Math.min(rect.top, viewportHeight - estimatedHeight - padding))
    const anchorCenterX = rect.left + rect.width / 2
    const anchorCenterY = rect.top + rect.height / 2
    const originX = anchorCenterX - left
    const originY = anchorCenterY - top
    return {
      style: `left:${left}px;top:${top}px;width:min(${width}px,calc(100vw - 24px));max-height:min(420px,calc(100vh - 24px));`,
      origin: `${originX}px ${originY}px`,
    }
  })
  let panelAnimationStyle = $derived(
    `transform-origin:${panelMeta.origin};transform:scale(${isExpanded ? 1 : collapsedScale.x}, ${isExpanded ? 1 : collapsedScale.y});opacity:${isExpanded ? 1 : 0};transition:transform 340ms cubic-bezier(0.2, 0.9, 0.2, 1),opacity 220ms ease;`
  )

  $effect(() => {
    if (!folder) return
    clearTimeout(closeTimer)
    isExpanded = false
    tick().then(() => {
      requestAnimationFrame(() => {
        isExpanded = true
      })
    })
  })

  $effect(() => {
    if (!folder || typeof window === 'undefined') return

    const attachTimer = setTimeout(() => {
      const handleGlobalPointerDown = (event) => {
        if (!panelEl) return
        if (panelEl.contains(event.target)) return
        // 右键菜单、撤销提示等浮层上的操作不收起文件夹
        if (event.target.closest?.('[data-keep-folder-open]')) return
        requestClose()
      }

      window.addEventListener('pointerdown', handleGlobalPointerDown, true)
      detachOutsideListener = () => {
        window.removeEventListener('pointerdown', handleGlobalPointerDown, true)
      }
    }, 0)

    return () => {
      clearTimeout(attachTimer)
      detachOutsideListener?.()
      detachOutsideListener = null
    }
  })

  onDestroy(() => {
    detachOutsideListener?.()
    clearTimeout(closeTimer)
  })

  const handleWindowResize = () => {
    viewportWidth = window.innerWidth
    viewportHeight = window.innerHeight
  }

  const handleSiteClick = (event, site) => {
    if (editMode) {
      event.preventDefault()
      return
    }
    clickCounts.increment(site.id)
    requestClose()
  }

  // 编辑模式下拖拽：在面板内调整顺序，拖到面板外（遮罩上）移出文件夹，回到主列表
  let dragIndex = $state(-1)
  let dragOverIndex = $state(-1)
  let draggingOut = $state(false)

  const resetDrag = () => {
    dragIndex = -1
    dragOverIndex = -1
    draggingOut = false
  }

  const handleItemDragStart = (event, index) => {
    dragIndex = index
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleItemDragOver = (event, index) => {
    if (dragIndex < 0) return
    event.preventDefault()
    dragOverIndex = index
    draggingOut = false
  }

  const handleItemDrop = (event, index) => {
    event.preventDefault()
    if (dragIndex >= 0) sites.setAll(reorderFolderSites($sites, folder.id, dragIndex, index))
    resetDrag()
  }

  const handleBackdropDragOver = (event) => {
    if (dragIndex < 0 || event.target !== event.currentTarget) return
    event.preventDefault()
    draggingOut = true
    dragOverIndex = -1
  }

  const handleBackdropDrop = (event) => {
    if (dragIndex < 0 || event.target !== event.currentTarget) return
    event.preventDefault()
    const site = folderSites[dragIndex]
    if (site) sites.setAll(moveSiteToFolder($sites, site.id, ''))
    resetDrag()
  }

  const requestClose = () => {
    clearTimeout(closeTimer)
    isExpanded = false
    closeTimer = setTimeout(() => {
      onclose?.()
    }, 220)
  }
</script>

<svelte:window
  onkeydown={(event) => { if (event.key === 'Escape') requestClose() }}
  onresize={handleWindowResize}
/>

{#if folder}
  <div
    class="fixed inset-0"
    style="z-index: 999;"
    role="presentation"
    ondragover={handleBackdropDragOver}
    ondragleave={(event) => { if (event.target === event.currentTarget) draggingOut = false }}
    ondrop={handleBackdropDrop}
  >
    <div
      bind:this={panelEl}
      class="fixed overflow-hidden border shadow-2xl not-dark:bg-white/96 not-dark:text-neutral-900 not-dark:border-black/8 dark:bg-neutral-900/96 dark:text-neutral-100 dark:border-white/10"
      style="{panelMeta.style}z-index: 1000;border-radius:{panelRadius}px;{panelAnimationStyle}{draggingOut ? 'opacity:0.55;' : ''}"
      onpointerdown={(event) => event.stopPropagation()}
      role="dialog"
      aria-modal="false"
      aria-label={folder.name}
      tabindex="-1"
    >
      <div class="p-2 overflow-y-auto max-h-90">
        {#if folderSites.length === 0}
          <div
            class="border border-dashed px-4 py-8 text-center text-sm not-dark:border-black/10 not-dark:text-neutral-500 dark:border-white/10 dark:text-neutral-400"
            style="border-radius:{itemRadius}px;"
          >
            {$t('folder.empty')}
          </div>
        {:else}
          <div class="space-y-1">
            {#each folderSites as site, index (site.id)}
              <a
                href={site.url}
                data-context-item="site"
                data-item-id={site.id}
                onclick={(event) => handleSiteClick(event, site)}
                draggable={editMode}
                ondragstart={(event) => handleItemDragStart(event, index)}
                ondragover={(event) => handleItemDragOver(event, index)}
                ondrop={(event) => handleItemDrop(event, index)}
                ondragend={resetDrag}
                class="group px-3 py-2.5 flex items-center gap-3 transition-all not-dark:hover:bg-black/4 dark:hover:bg-white/8
                  {editMode ? 'cursor-grab' : ''}
                  {dragOverIndex === index && dragIndex !== index ? 'ring-2 not-dark:ring-neutral-800/60 dark:ring-white/60' : ''}"
                style="border-radius:{itemRadius}px;{dragIndex === index ? 'opacity:0.4;' : ''}"
              >
                <SiteIcon site={site} class="shrink-0" style="width: 28px; height: 28px; border-radius: {site.iconRadius ?? 4}%" />
                <div class="min-w-0 flex-1">
                  <div class="text-sm font-medium truncate">{site.name}</div>
                </div>
                {#if editMode}
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      type="button"
                      class="text-xs not-dark:text-neutral-500 not-dark:hover:text-black dark:text-neutral-300 dark:hover:text-white"
                      onclick={(event) => { event.preventDefault(); event.stopPropagation(); oneditsite?.(site) }}
                    >{$t('site.editBtn')}</button>
                    <button
                      type="button"
                      class="text-xs text-red-400 hover:text-red-500"
                      onclick={(event) => { event.preventDefault(); event.stopPropagation(); ondeletesite?.(site.id) }}
                    >{$t('site.delete')}</button>
                  </div>
                {/if}
              </a>
            {/each}
          </div>
        {/if}
        {#if editMode && folderSites.length > 0}
          <p class="px-3 pt-2 pb-1 text-xs not-dark:text-neutral-500 dark:text-neutral-400">{$t('folder.dragOutHint')}</p>
        {/if}
      </div>
    </div>
  </div>
{/if}
