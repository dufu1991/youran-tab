<script>
  import { onMount, untrack } from 'svelte'
  import { fly } from 'svelte/transition'

  let { message = '', actionLabel = '', closeLabel = '', dark = false, duration = 6000, onaction, onclose } = $props()

  // 计时只取初始时长，之后通过暂停与恢复自行累计
  let remaining = untrack(() => duration)
  let startedAt = 0
  let timer = null

  const start = () => {
    startedAt = Date.now()
    timer = setTimeout(() => onclose?.(), remaining)
  }

  const pause = () => {
    clearTimeout(timer)
    remaining -= Date.now() - startedAt
  }

  const isEditable = (target) => target?.closest?.('input, textarea, select, [contenteditable="true"]')

  // Cmd / Ctrl + Z 撤销，输入框内保留浏览器原生撤销
  const handleKeydown = (event) => {
    if (event.key.toLowerCase() !== 'z' || event.shiftKey || !(event.metaKey || event.ctrlKey)) return
    if (isEditable(event.target)) return
    event.preventDefault()
    onaction?.()
  }

  onMount(() => {
    start()
    return () => clearTimeout(timer)
  })
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="fixed left-1/2 bottom-6 -translate-x-1/2 flex items-center gap-4 rounded-xl pl-4 pr-2 py-2 shadow-2xl text-sm
    not-dark:bg-neutral-900 not-dark:text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
  style="z-index:1200;max-width:calc(100vw - 2rem);"
  role="status"
  aria-live="polite"
  data-no-context-menu
  data-keep-folder-open
  onpointerenter={pause}
  onpointerleave={start}
  transition:fly={{ y: 16, duration: 180 }}
>
  <span class="truncate">{message}</span>
  <button
    type="button"
    class="shrink-0 rounded-lg px-3 py-1 font-medium transition-colors not-dark:text-blue-300 not-dark:hover:bg-white/10 dark:text-blue-600 dark:hover:bg-black/8"
    onclick={() => onaction?.()}
  >{actionLabel}</button>
  <button
    type="button"
    class="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors not-dark:text-neutral-400 not-dark:hover:bg-white/10 dark:text-neutral-500 dark:hover:bg-black/8"
    aria-label={closeLabel}
    onclick={() => onclose?.()}
  >
    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  </button>
</div>
