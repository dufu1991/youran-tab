<script>
  import { tick } from 'svelte'
  import { t } from './i18n.js'
  import { sites, clickCounts, isDark } from './stores.js'
  import { buildExportData, downloadJson, getExportFilename } from './dataTransfer.js'

  let { dark = false, onclose } = $props()

  let exportType = $state('all')
  let isPreparingExport = $state(false)

  const options = [
    { value: 'all', key: 'dataTransfer.typeSitesAndSettings' },
    { value: 'sites', key: 'dataTransfer.typeSites' },
    { value: 'settings', key: 'dataTransfer.typeSettings' },
  ]

  async function waitForPreparingFrame() {
    await tick()
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  }

  async function handleExport() {
    if (isPreparingExport) return

    isPreparingExport = true
    await waitForPreparingFrame()

    const data = buildExportData(exportType, $sites, $clickCounts)
    downloadJson(data, getExportFilename(exportType))
    setTimeout(() => {
      onclose?.()
    }, 320)
  }
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape' && !isPreparingExport) onclose?.() }} />

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-100"
  onclick={(e) => { if (e.target === e.currentTarget && !isPreparingExport) onclose?.() }}
  onkeydown={(e) => { if (e.key === 'Escape' && !isPreparingExport) onclose?.() }}
  role="dialog" aria-modal="true" tabindex="-1"
>
  <div class="relative mx-4 w-full max-w-sm rounded-xl p-6 shadow-2xl {dark ? 'bg-neutral-800' : 'bg-white'}">
    <h2 class="text-base font-semibold mb-4 {dark ? 'text-neutral-100' : 'text-neutral-800'}">
      {$t('dataTransfer.exportTitle')}
    </h2>

    <div class="space-y-1 mb-6">
      {#each options as opt}
        <label class="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg transition-all
          {isPreparingExport ? 'opacity-60 pointer-events-none' : ''}
          {exportType === opt.value
            ? (dark ? 'bg-white/10' : 'bg-neutral-100')
            : (dark ? 'hover:bg-white/5' : 'hover:bg-neutral-50')}">
          <input type="radio" name="exportType" value={opt.value}
            bind:group={exportType}
            disabled={isPreparingExport}
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
        disabled={isPreparingExport}
        onclick={() => onclose?.()}
      >{$t('site.cancel')}</button>
      <button class="px-4 py-2 rounded-lg text-sm
        {isPreparingExport
          ? (dark ? 'bg-neutral-600 text-neutral-300 cursor-wait' : 'bg-neutral-300 text-neutral-600 cursor-wait')
          : (dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-800 text-white hover:bg-neutral-700')}"
        disabled={isPreparingExport}
        onclick={handleExport}
      >{isPreparingExport ? $t('dataTransfer.exportPreparing') : $t('dataTransfer.exportBtn')}</button>
    </div>

    <p class="export-hint mt-2 text-right {dark ? 'text-neutral-500' : 'text-neutral-500'}">
      {$t('dataTransfer.exportSlowHint')}
    </p>

    {#if isPreparingExport}
      <div class="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-3 backdrop-blur-sm {dark ? 'bg-neutral-900/70' : 'bg-white/78'}">
        <span class="w-7 h-7 rounded-full border-2 border-transparent animate-spin {dark ? 'border-t-white border-r-white/40' : 'border-t-neutral-800 border-r-neutral-400'}"></span>
        <p class="text-sm font-medium {dark ? 'text-neutral-100' : 'text-neutral-800'}">
          {$t('dataTransfer.exportPreparing')}
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  .export-hint {
    font-size: 0.6875rem;
    line-height: 0.875rem;
  }
</style>
