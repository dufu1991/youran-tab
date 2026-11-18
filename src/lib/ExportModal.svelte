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

  const waitForPreparingFrame = async () => {
    await tick()
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  }

  const handleExport = async () => {
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
  <div class="relative mx-4 w-full max-w-sm rounded-xl p-6 shadow-2xl not-dark:bg-white dark:bg-neutral-800">
    <h2 class="text-base font-semibold mb-4 not-dark:text-neutral-800 dark:text-neutral-100">
      {$t('dataTransfer.exportTitle')}
    </h2>

    <div class="space-y-1 mb-6">
      {#each options as opt}
        <label class="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg transition-all
          {isPreparingExport ? 'opacity-60 pointer-events-none' : ''}
          {exportType === opt.value
            ? 'not-dark:bg-neutral-100 dark:bg-white/10'
            : 'not-dark:hover:bg-neutral-50 dark:hover:bg-white/5'}">
          <input type="radio" name="exportType" value={opt.value}
            bind:group={exportType}
            disabled={isPreparingExport}
            class="accent-neutral-600" />
          <span class="text-sm not-dark:text-neutral-700 dark:text-neutral-200">
            {$t(opt.key)}
          </span>
        </label>
      {/each}
    </div>

    <div class="flex justify-end gap-3">
      <button class="px-4 py-2 rounded-lg text-sm
        not-dark:text-neutral-600 not-dark:hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
        disabled={isPreparingExport}
        onclick={() => onclose?.()}
      >{$t('site.cancel')}</button>
      <button class="px-4 py-2 rounded-lg text-sm
        {isPreparingExport
          ? 'cursor-wait not-dark:bg-neutral-300 not-dark:text-neutral-600 dark:bg-neutral-600 dark:text-neutral-300'
          : 'not-dark:bg-neutral-800 not-dark:text-white not-dark:hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200'}"
        disabled={isPreparingExport}
        onclick={handleExport}
      >{isPreparingExport ? $t('dataTransfer.exportPreparing') : $t('dataTransfer.exportBtn')}</button>
    </div>

    <p class="export-hint mt-2 text-right text-neutral-500">
      {$t('dataTransfer.exportSlowHint')}
    </p>

    {#if isPreparingExport}
      <div class="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-3 backdrop-blur-sm not-dark:bg-white/78 dark:bg-neutral-900/70">
        <span class="w-7 h-7 rounded-full border-2 border-transparent animate-spin not-dark:border-t-neutral-800 not-dark:border-r-neutral-400 dark:border-t-white dark:border-r-white/40"></span>
        <p class="text-sm font-medium not-dark:text-neutral-800 dark:text-neutral-100">
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
