<script>
  import { doSearch, showSearchBar, defaultConfig, bgIsLight } from './stores.js'
  import { t } from './i18n.js'

  let query = $state('')

  function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    doSearch(query.trim())
  }

  let cfg = $derived($defaultConfig)
  let cardBg = $derived(`rgba(255,255,255,${cfg.cardOpacity / 100})`)
  let cardBorder = $derived($bgIsLight ? 'border:1px solid rgba(0,0,0,0.06)' : 'border:1px solid rgba(255,255,255,0.08)')
</script>

<form onsubmit={handleSearch}
  class="flex items-center w-full max-w-lg px-5 py-3 transition-all"
  style="background:{cardBg};backdrop-filter:blur({cfg.cardBlur}px);-webkit-backdrop-filter:blur({cfg.cardBlur}px);border-radius:{cfg.radius}px;{cardBorder}">
  <svg class="w-4 h-4 mr-3 shrink-0 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
  </svg>
  <input type="text" bind:value={query}
    placeholder={$t('search.placeholder')}
    class="flex-1 bg-transparent outline-none text-sm text-black placeholder:text-black/40" />
  <button type="submit" class="shrink-0 ml-2 p-0 border-0 bg-transparent cursor-pointer transition-opacity
    text-black/40 hover:opacity-80" aria-label="搜索">
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>
    </svg>
  </button>
</form>
