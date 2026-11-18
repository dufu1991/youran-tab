<script>
  // 设置面板里的开关：整行可点，切换时把新值交给 onchange
  let { label = '', checked = false, class: className = '', onchange } = $props()
</script>

<label class="flex items-center justify-between cursor-pointer {className}">
  <span class="text-sm">{label}</span>
  <button
    type="button"
    class="relative w-9 h-5 rounded-full transition-colors {checked ? 'bg-neutral-800 dark:bg-neutral-300' : 'bg-neutral-300 dark:bg-neutral-600'}"
    onclick={() => onchange?.(!checked)}
    role="switch"
    aria-checked={checked}
    aria-label={label}
  >
    <span class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform {checked ? 'translate-x-4 bg-white dark:bg-neutral-900' : 'bg-white'}"></span>
  </button>
</label>
