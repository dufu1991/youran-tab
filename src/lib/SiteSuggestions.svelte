<script>
  import { fade } from 'svelte/transition'
  import { t } from './i18n.js'
  import { sites, clickCounts, editMode } from './stores.js'
  import { searchSites, shouldAutoSelect, getSiteHost } from './siteSearch.js'
  import SiteIcon from './SiteIcon.svelte'

  // 站内搜索：在搜索框下方列出匹配的已收藏网站，方向键选择，回车打开
  let { input = null, query = '', dark = false } = $props()

  const listId = `site-suggestions-${crypto.randomUUID()}`

  let focused = $state(false)
  let dismissed = $state(false)
  let activeIndex = $state(-1)
  let listStyle = $state('')

  let results = $derived(searchSites($sites, query, $clickCounts))
  let open = $derived(focused && !dismissed && !$editMode && results.length > 0)

  // 关键词变化时重新决定是否默认选中第一个结果
  $effect(() => {
    activeIndex = shouldAutoSelect(results) ? 0 : -1
    dismissed = false
  })

  // 挂到 body，避免被主题里的 backdrop-filter / overflow 裁切
  const portal = (node) => {
    document.body.appendChild(node)
    return { destroy: () => node.remove() }
  }

  const updatePosition = () => {
    const anchor = input.closest('form') ?? input
    const rect = anchor.getBoundingClientRect()
    const margin = 12
    const width = Math.min(Math.max(rect.width, 280), window.innerWidth - margin * 2)
    const left = Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin))
    listStyle = `left:${left}px;top:${rect.bottom + 8}px;width:${width}px;`
  }

  const openSite = (site, newTab) => {
    clickCounts.increment(site.id)
    window.open(site.url, newTab ? '_blank' : '_self')
  }

  const moveActive = (step) => {
    // -1 表示不选中任何网站，此时回车走网页搜索
    const total = results.length + 1
    activeIndex = ((activeIndex + 1 + step + total) % total) - 1
  }

  const handleKeydown = (event) => {
    if (!open || event.isComposing || event.keyCode === 229) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      moveActive(event.key === 'ArrowDown' ? 1 : -1)
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      openSite(results[activeIndex].site, event.metaKey || event.ctrlKey)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      dismissed = true
    }
  }

  $effect(() => {
    if (!input) return
    const handleFocus = () => {
      focused = true
      dismissed = false
    }
    const handleBlur = () => (focused = false)
    focused = document.activeElement === input
    input.setAttribute('role', 'combobox')
    input.setAttribute('aria-autocomplete', 'list')
    input.setAttribute('aria-controls', listId)
    input.addEventListener('focus', handleFocus)
    input.addEventListener('blur', handleBlur)
    input.addEventListener('keydown', handleKeydown)
    return () => {
      input.removeEventListener('focus', handleFocus)
      input.removeEventListener('blur', handleBlur)
      input.removeEventListener('keydown', handleKeydown)
    }
  })

  $effect(() => {
    if (!input) return
    input.setAttribute('aria-expanded', String(open))
    if (open && activeIndex >= 0) input.setAttribute('aria-activedescendant', `${listId}-${activeIndex}`)
    else input.removeAttribute('aria-activedescendant')
  })

  $effect(() => {
    if (!open) return
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  })
</script>

{#if open}
  <div
    use:portal
    class="fixed z-80 rounded-xl shadow-2xl p-1.5 text-left
      {dark ? 'bg-neutral-800 text-neutral-200' : 'bg-white text-neutral-700'}"
    style={listStyle}
    onmousedown={(event) => event.preventDefault()}
    transition:fade={{ duration: 100 }}
    data-no-context-menu
    role="presentation"
  >
    <div class="px-2.5 pt-1 pb-1.5 text-xs text-neutral-400">{$t('search.groupSites')}</div>
    <ul id={listId} role="listbox" aria-label={$t('search.groupSites')}>
      {#each results as { site }, index (site.id)}
        <li role="presentation">
          <a
            id="{listId}-{index}"
            href={site.url}
            role="option"
            aria-selected={index === activeIndex}
            tabindex="-1"
            class="flex items-center gap-3 px-2.5 py-2 rounded-lg no-underline text-inherit transition-colors
              {index === activeIndex ? (dark ? 'bg-neutral-700' : 'bg-neutral-100') : ''}"
            onmouseenter={() => (activeIndex = index)}
            onclick={() => clickCounts.increment(site.id)}
          >
            <SiteIcon {site} class="w-5 h-5 shrink-0 rounded object-contain" />
            <span class="flex-1 min-w-0">
              <span class="block truncate text-sm">{site.name}</span>
              <span class="block truncate text-xs text-neutral-400">
                {site.folderPath ? `${site.folderPath} · ${getSiteHost(site.url)}` : getSiteHost(site.url)}
              </span>
            </span>
            {#if index === activeIndex}
              <span class="shrink-0 text-xs text-neutral-400">↵</span>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
    <div class="px-2.5 pt-1.5 pb-1 text-xs text-neutral-400">{$t('search.siteHint')}</div>
  </div>
{/if}
