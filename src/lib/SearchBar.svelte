<script>
  import { searchEngine, searchEngines, doSearch, showEngineLogo, defaultConfig, bgIsLight } from './stores.js'
  import { t } from './i18n.js'

  let query = $state('')

  function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    doSearch(query.trim(), $searchEngine)
  }

  let engineIcon = $derived(searchEngines[$searchEngine]?.icon || '')
  let cfg = $derived($defaultConfig)
  let cardBg = $derived(`rgba(255,255,255,${cfg.cardOpacity / 100})`)
  let cardBorder = $derived($bgIsLight ? 'border:1px solid rgba(0,0,0,0.06)' : 'border:1px solid rgba(255,255,255,0.08)')
</script>

<form onsubmit={handleSearch}
  class="flex items-center w-full max-w-lg px-5 py-3 transition-all"
  style="background:{cardBg};backdrop-filter:blur({cfg.cardBlur}px);-webkit-backdrop-filter:blur({cfg.cardBlur}px);border-radius:{cfg.radius}px;{cardBorder}">
  {#if $showEngineLogo && engineIcon}
    <img src={engineIcon} alt="" class="w-5 h-5 mr-3 shrink-0" />
  {/if}
  <input type="text" bind:value={query}
    placeholder={$t('search.placeholder')}
    class="flex-1 bg-transparent outline-none text-sm text-black" />
</form>
