<script>
  import { tick } from 'svelte'

  let { value = '', items = [], dark = false, onChange } = $props()

  let listEl = $state(null)

  const handleSelect = (nextValue) => {
    if (nextValue === value) return
    onChange?.(nextValue)
  }

  // 方向键在标签之间切换并移动焦点，Home / End 跳到首尾，符合 tablist 的键盘约定
  const handleKeydown = async (event) => {
    const index = items.findIndex((item) => item.value === value)
    const last = items.length - 1
    const nextIndex = {
      ArrowRight: index >= last ? 0 : index + 1,
      ArrowLeft: index <= 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key]
    if (nextIndex === undefined || items.length === 0) return
    event.preventDefault()
    handleSelect(items[nextIndex].value)
    await tick()
    listEl?.querySelectorAll('[role="tab"]')[nextIndex]?.focus()
  }
</script>

<div
  bind:this={listEl}
  class="inline-flex w-full rounded-xl p-1 not-dark:bg-neutral-100 dark:bg-neutral-900/60"
  role="tablist"
  aria-orientation="horizontal"
  tabindex="-1"
  onkeydown={handleKeydown}
>
  {#each items as item (item.value)}
    <button
      type="button"
      class="flex-1 min-w-0 truncate whitespace-nowrap rounded-lg px-2 py-2 text-sm transition-all {value === item.value
        ? 'bg-white shadow-sm not-dark:text-neutral-900 dark:text-black'
        : 'not-dark:text-neutral-600 not-dark:hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white'}"
      role="tab"
      aria-selected={value === item.value}
      title={item.label}
      tabindex={value === item.value ? 0 : -1}
      onclick={() => handleSelect(item.value)}
    >
      {item.label}
    </button>
  {/each}
</div>
