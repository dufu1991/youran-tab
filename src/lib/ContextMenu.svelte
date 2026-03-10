<script>
  import { onDestroy, tick } from 'svelte'

  let { x = 0, y = 0, dark = false, items = [], onselect, onclose } = $props()

  let panelEl = $state(null)
  let panelStyle = $state('left:0px;top:0px;')

  async function syncPosition() {
    await tick()
    if (!panelEl || typeof window === 'undefined') return

    const rect = panelEl.getBoundingClientRect()
    const gap = 8
    const nextLeft = Math.min(x, window.innerWidth - rect.width - gap)
    const nextTop = Math.min(y, window.innerHeight - rect.height - gap)

    panelStyle = `left:${Math.max(gap, nextLeft)}px;top:${Math.max(gap, nextTop)}px;`
  }

  function handlePointerDown(event) {
    if (panelEl?.contains(event.target)) return
    onclose?.()
  }

  $effect(() => {
    syncPosition()
  })

  $effect(() => {
    if (typeof window === 'undefined') return
    window.addEventListener('pointerdown', handlePointerDown, true)
    return () => window.removeEventListener('pointerdown', handlePointerDown, true)
  })

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointerdown', handlePointerDown, true)
    }
  })
</script>

<svelte:window
  onkeydown={(event) => { if (event.key === 'Escape') onclose?.() }}
  onresize={syncPosition}
/>

<div
  bind:this={panelEl}
  class="fixed min-w-38 overflow-hidden border py-1 shadow-2xl {dark ? 'bg-neutral-900/96 border-white/10 text-neutral-100' : 'bg-white/96 border-black/8 text-neutral-900'}"
  style="{panelStyle}z-index:1100;border-radius:14px;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);"
  oncontextmenu={(event) => event.preventDefault()}
  role="menu"
  tabindex="-1"
  data-no-context-menu
>
  {#each items as item}
    <button
      type="button"
      class="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed {item.disabled
        ? (dark ? 'text-neutral-500' : 'text-neutral-400')
        : (dark ? 'hover:bg-white/8' : 'hover:bg-black/[0.04]')}"
      disabled={item.disabled}
      onclick={() => {
        if (item.disabled) return
        onselect?.(item.id)
      }}
      role="menuitem"
    >
      <span>{item.label}</span>
    </button>
  {/each}
</div>
