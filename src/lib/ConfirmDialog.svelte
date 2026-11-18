<script>
  import { onMount } from 'svelte'

  // 替代浏览器原生 confirm：风格与其他弹窗一致，Esc 或点击遮罩取消，关闭后焦点回到打开前的位置
  let { title = '', message = '', confirmLabel = '', cancelLabel = '', danger = false, dark = false, onconfirm, oncancel } = $props()

  let confirmEl = $state(null)
  let cancelEl = $state(null)

  const handleKeydown = (event) => {
    if (event.key !== 'Escape') return
    event.preventDefault()
    event.stopPropagation()
    oncancel?.()
  }

  onMount(() => {
    const previousFocus = document.activeElement
    // 危险操作默认聚焦「取消」，避免误按回车直接执行
    ;(danger ? cancelEl : confirmEl)?.focus()
    return () => previousFocus?.focus?.()
  })
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="fixed inset-0 z-130 bg-black/55 flex items-center justify-center p-4"
  onclick={(event) => { if (event.target === event.currentTarget) oncancel?.() }}
  role="presentation"
  data-no-context-menu
  data-keep-folder-open
>
  <div
    class="w-full max-w-sm rounded-2xl border shadow-2xl p-6 space-y-4 not-dark:bg-white not-dark:border-black/8 not-dark:text-neutral-900 dark:bg-neutral-900 dark:border-white/10 dark:text-neutral-100"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby={title ? 'confirm-dialog-title' : undefined}
    aria-describedby="confirm-dialog-message"
  >
    {#if title}
      <h3 id="confirm-dialog-title" class="text-lg font-semibold">{title}</h3>
    {/if}
    <p id="confirm-dialog-message" class="text-sm leading-6 not-dark:text-neutral-600 dark:text-neutral-300">{message}</p>
    <div class="flex justify-end gap-2">
      <button
        bind:this={cancelEl}
        type="button"
        class="px-4 py-2 rounded-lg text-sm not-dark:text-neutral-600 not-dark:hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
        onclick={() => oncancel?.()}
      >{cancelLabel}</button>
      <button
        bind:this={confirmEl}
        type="button"
        class="px-4 py-2 rounded-lg text-sm font-medium {danger
          ? 'not-dark:bg-red-50 not-dark:text-red-700 not-dark:hover:bg-red-100 dark:bg-red-500/20 dark:text-red-200 dark:hover:bg-red-500/30'
          : 'not-dark:bg-neutral-900 not-dark:text-white not-dark:hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200'}"
        onclick={() => onconfirm?.()}
      >{confirmLabel}</button>
    </div>
  </div>
</div>
