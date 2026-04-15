<script>
  let { value = '', items = [], dark = false, onChange } = $props()

  function handleSelect(nextValue) {
    if (nextValue === value) return
    onChange?.(nextValue)
  }
</script>

<div
  class="inline-flex w-full rounded-xl p-1 {dark ? 'bg-neutral-900/60' : 'bg-neutral-100'}"
  role="tablist"
  aria-orientation="horizontal"
>
  {#each items as item}
    <button
      type="button"
      class="flex-1 rounded-lg px-3 py-2 text-sm transition-all {value === item.value
        ? (dark ? 'bg-white text-black shadow-sm' : 'bg-white text-neutral-900 shadow-sm')
        : (dark ? 'text-neutral-300 hover:text-white' : 'text-neutral-600 hover:text-neutral-900')}"
      role="tab"
      aria-selected={value === item.value}
      tabindex={value === item.value ? 0 : -1}
      onclick={() => handleSelect(item.value)}
    >
      {item.label}
    </button>
  {/each}
</div>
