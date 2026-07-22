<script>
  import { scale, fade } from 'svelte/transition'
  import { t } from './i18n.js'
  import { searchConfig, activeSearchTarget, searchTargetOverride } from './stores.js'
  import { SEARCH_ENGINES, AI_PROVIDERS, findTarget } from './searchProviders.js'

  let { dark = false, class: className = '' } = $props()

  let open = $state(false)
  let triggerEl = $state(null)
  let dropdownEl = $state(null)
  let dropdownStyle = $state('')
  let direction = $state('down')

  let enabledEngines = $derived(SEARCH_ENGINES.filter((engine) => $searchConfig.enabledEngines.includes(engine.id)))
  let enabledAi = $derived(AI_PROVIDERS.filter((provider) => $searchConfig.enabledAi.includes(provider.id)))
  let currentProvider = $derived(findTarget($activeSearchTarget))

  // 挂到 body，避免被父级 backdrop-filter / transform 形成的层叠上下文遮挡
  const portal = (node) => {
    document.body.appendChild(node)
    return { destroy: () => node.remove() }
  }

  const updatePosition = () => {
    if (!triggerEl) return
    const rect = triggerEl.getBoundingClientRect()
    const gap = 8
    const margin = 12
    const limit = 320
    const spaceBelow = window.innerHeight - rect.bottom - gap - margin
    const spaceAbove = rect.top - gap - margin
    const left = Math.max(margin, Math.min(rect.left, window.innerWidth - 320 - margin))

    // 下方空间够（或比上方大）就向下展开，否则向上展开，高度始终限制在视口内
    if (spaceBelow >= 200 || spaceBelow >= spaceAbove) {
      direction = 'down'
      dropdownStyle = `left:${left}px;top:${rect.bottom + gap}px;max-height:${Math.max(200, Math.min(limit, spaceBelow))}px;`
    } else {
      direction = 'up'
      dropdownStyle = `left:${left}px;bottom:${window.innerHeight - rect.top + gap}px;max-height:${Math.max(200, Math.min(limit, spaceAbove))}px;`
    }
  }

  const toggleOpen = () => {
    open = !open
    if (open) updatePosition()
  }

  const selectTarget = (type, id) => {
    searchTargetOverride.set({ type, id })
    open = false
  }

  const isActive = (type, id) => $activeSearchTarget.type === type && $activeSearchTarget.id === id

  // 页面滚动或缩放时锚点会移位，直接关闭弹层；弹层内部滚动除外
  $effect(() => {
    if (!open) return
    const close = () => (open = false)
    const handleScroll = (e) => {
      if (dropdownEl && dropdownEl.contains(e.target)) return
      close()
    }
    window.addEventListener('resize', close)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', handleScroll, true)
    }
  })
</script>

<div class="shrink-0 {className}" data-no-context-menu>
  <button
    type="button"
    class="flex items-center gap-1 outline-none"
    bind:this={triggerEl}
    onclick={toggleOpen}
    aria-label={$t('search.groupSearch')}
  >
    {#if currentProvider && currentProvider.logo}
      <img src={currentProvider.logo} alt={currentProvider.name || ''} class="w-5 h-5 object-contain" />
    {:else}
      <svg class="w-4 h-4 {dark ? 'text-white/50' : 'text-black/40'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" stroke-width="2" /><path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round" />
      </svg>
    {/if}
    <svg
      class="w-3 h-3 transition-transform {open ? 'rotate-180' : ''} {dark ? 'text-white/50' : 'text-black/40'}"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </button>
</div>

{#if open}
  <div use:portal class="fixed inset-0 z-90" onclick={() => (open = false)} role="presentation" transition:fade={{ duration: 120 }}></div>
  <div
    use:portal
    bind:this={dropdownEl}
    class="fixed z-91 w-80 rounded-xl shadow-2xl p-2 overflow-y-auto
      {dark ? 'bg-neutral-800 text-neutral-200' : 'bg-white text-neutral-700'}"
    style="{dropdownStyle}transform-origin:{direction === 'down' ? 'top left' : 'bottom left'};"
    transition:scale={{ duration: 140, start: 0.96, opacity: 0 }}
  >
    <div class="grid gap-x-1 {enabledAi.length > 0 ? 'grid-cols-2' : ''}">
      <div>
        <div class="px-2 pb-1 text-xs uppercase tracking-wider text-neutral-400">{$t('search.groupSearch')}</div>
        {#each enabledEngines as engine (engine.id)}
          <button
            type="button"
            class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left transition-colors
              {isActive('engine', engine.id)
                ? (dark ? 'bg-neutral-700' : 'bg-neutral-100')
                : (dark ? 'hover:bg-neutral-700/60' : 'hover:bg-neutral-50')}"
            onclick={() => selectTarget('engine', engine.id)}
          >
            {#if engine.logo}
              <img src={engine.logo} alt="" class="w-4 h-4 object-contain shrink-0" />
            {:else}
              <svg class="w-4 h-4 shrink-0 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" stroke-width="2" /><path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round" />
              </svg>
            {/if}
            <span class="truncate">{engine.name || $t(engine.nameKey)}</span>
          </button>
        {/each}
      </div>

      {#if enabledAi.length > 0}
        <div>
          <div class="px-2 pb-1 text-xs uppercase tracking-wider text-neutral-400">{$t('search.groupAi')}</div>
          {#each enabledAi as provider (provider.id)}
            <button
              type="button"
              class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left transition-colors
                {isActive('ai', provider.id)
                  ? (dark ? 'bg-neutral-700' : 'bg-neutral-100')
                  : (dark ? 'hover:bg-neutral-700/60' : 'hover:bg-neutral-50')}"
              title={$t('settings.searchAiHint')}
              onclick={() => selectTarget('ai', provider.id)}
            >
              <img src={provider.logo} alt="" class="w-4 h-4 object-contain shrink-0" />
              <span class="truncate">{provider.name}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}
