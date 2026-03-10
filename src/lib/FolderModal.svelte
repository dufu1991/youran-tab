<script>
  import { onDestroy } from 'svelte'
  import { tick } from 'svelte'
  import { t } from './i18n.js'
  import { clickCounts } from './stores.js'
  import { resolveSiteIcon, getFaviconFallback, handleIconLoad } from './favicon.js'
  import { getFolderSites } from './folders.js'

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
    `transform-origin:${panelMeta.origin};transform:scale(${isExpanded ? 1 : collapsedScale.x}, ${isExpanded ? 1 : collapsedScale.y});opacity:${isExpanded ? 1 : 0};filter:blur(${isExpanded ? 0 : 8}px);transition:transform 340ms cubic-bezier(0.2, 0.9, 0.2, 1),opacity 220ms ease,filter 240ms ease;`
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

  function handleWindowResize() {
    viewportWidth = window.innerWidth
    viewportHeight = window.innerHeight
  }

  function handleSiteClick(event, site) {
    if (editMode) {
      event.preventDefault()
      return
    }
    clickCounts.increment(site.id)
    requestClose()
  }

  function requestClose() {
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
  <div class="fixed inset-0" style="z-index: 999;" role="presentation">
    <div
      bind:this={panelEl}
      class="fixed overflow-hidden border shadow-2xl backdrop-blur-xl {dark ? 'bg-neutral-900/96 text-neutral-100 border-white/10' : 'bg-white/96 text-neutral-900 border-black/8'}"
      style="{panelMeta.style}z-index: 1000;border-radius:{panelRadius}px;{panelAnimationStyle}"
      onpointerdown={(event) => event.stopPropagation()}
      role="dialog"
      aria-modal="false"
      aria-label={folder.name}
      tabindex="-1"
    >
      <div class="p-2 overflow-y-auto max-h-[360px]">
        {#if folderSites.length === 0}
          <div
            class="border border-dashed px-4 py-8 text-center text-sm {dark ? 'border-white/10 text-neutral-400' : 'border-black/10 text-neutral-500'}"
            style="border-radius:{itemRadius}px;"
          >
            {$t('folder.empty')}
          </div>
        {:else}
          <div class="space-y-1">
            {#each folderSites as site, index}
              <a
                href={site.url}
                onclick={(event) => handleSiteClick(event, site)}
                class="group px-3 py-2.5 flex items-center gap-3 transition-all {dark ? 'hover:bg-white/8' : 'hover:bg-black/[0.04]'}"
                style="border-radius:{itemRadius}px;"
              >
                <img
                  src={resolveSiteIcon(site, dark)}
                  alt=""
                  onload={(event) => handleIconLoad(event, site)}
                  onerror={(event) => { if (site.iconSource !== 'custom') event.target.src = getFaviconFallback(site.url) }}
                  class="shrink-0"
                  style="width: 28px; height: 28px; border-radius: {site.iconRadius ?? 4}%"
                />
                <div class="min-w-0 flex-1">
                  <div class="text-sm font-medium truncate">{site.name}</div>
                </div>
                {#if editMode}
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      type="button"
                      class="text-xs {dark ? 'text-neutral-300 hover:text-white' : 'text-neutral-500 hover:text-black'}"
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
      </div>
    </div>
  </div>
{/if}
