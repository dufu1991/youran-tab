<script>
  import { t } from './i18n.js'
  import { sites, clickCounts, isDark } from './stores.js'
  import { buildExportData, downloadJson, getExportFilename } from './dataTransfer.js'

  let { dark = false, onclose } = $props()

  let exportType = $state('all')

  const options = [
    { value: 'all', key: 'dataTransfer.typeSitesAndSettings' },
    { value: 'sites', key: 'dataTransfer.typeSites' },
    { value: 'settings', key: 'dataTransfer.typeSettings' },
  ]

  function handleExport() {
    const data = buildExportData(exportType, $sites, $clickCounts)
    downloadJson(data, getExportFilename(exportType))
    onclose?.()
  }
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') onclose?.() }} />

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-100"
  onclick={(e) => { if (e.target === e.currentTarget) onclose?.() }}
  onkeydown={(e) => { if (e.key === 'Escape') onclose?.() }}
  role="dialog" aria-modal="true" tabindex="-1"
>
  <div class="rounded-xl p-6 w-80 shadow-2xl {dark ? 'bg-neutral-800' : 'bg-white'}">
    <h2 class="text-base font-semibold mb-4 {dark ? 'text-neutral-100' : 'text-neutral-800'}">
      {$t('dataTransfer.exportTitle')}
    </h2>

    <div class="space-y-1 mb-6">
      {#each options as opt}
        <label class="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg transition-all
          {exportType === opt.value
            ? (dark ? 'bg-white/10' : 'bg-neutral-100')
            : (dark ? 'hover:bg-white/5' : 'hover:bg-neutral-50')}">
          <input type="radio" name="exportType" value={opt.value}
            bind:group={exportType}
            class="accent-neutral-600" />
          <span class="text-sm {dark ? 'text-neutral-200' : 'text-neutral-700'}">
            {$t(opt.key)}
          </span>
        </label>
      {/each}
    </div>

    <div class="flex justify-end gap-3">
      <button class="px-4 py-2 rounded-lg text-sm
        {dark ? 'text-neutral-400 hover:bg-neutral-700' : 'text-neutral-600 hover:bg-neutral-100'}"
        onclick={() => onclose?.()}
      >{$t('site.cancel')}</button>
      <button class="px-4 py-2 rounded-lg text-sm
        {dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-800 text-white hover:bg-neutral-700'}"
        onclick={handleExport}
      >{$t('dataTransfer.exportBtn')}</button>
    </div>
  </div>
</div>
