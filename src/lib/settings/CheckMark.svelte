<script>
  // 列表行前面的勾选框，只负责显示，点击由外层按钮处理
  let { checked = false } = $props()
</script>

<span
  class="w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 {checked
    ? 'bg-neutral-800 border-neutral-800 text-white dark:bg-white dark:border-white dark:text-black'
    : 'border-neutral-400 dark:border-neutral-500'}"
  aria-hidden="true"
>
  {#if checked}
    <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
  {/if}
</span>
