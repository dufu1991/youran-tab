<script>
  import { t } from './i18n.js'
  import { sites, clickCounts } from './stores.js'
  import { detectImportData, isImportVersionSupported, getCurrentVersion, getImportSiteItems, importSitesData, importSettingsData } from './dataTransfer.js'

  let { dark = false, onclose } = $props()

  let step = $state('select')
  let detected = $state(null)
  let importSitesChecked = $state(false)
  let importSettingsChecked = $state(false)
  let resultMessage = $state('')
  let errorMessage = $state('')

  const handleFileSelect = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'
    fileInput.onchange = async () => {
      const file = fileInput.files?.[0]
      if (!file) return
      let parsed
      try {
        const text = await file.text()
        parsed = JSON.parse(text)
      } catch {
        errorMessage = $t('dataTransfer.importInvalid')
        step = 'error'
        return
      }
      detected = detectImportData(parsed)
      if (!detected) {
        errorMessage = $t('dataTransfer.importInvalid')
        step = 'error'
        return
      }
      if (detected.type !== 'legacy' && !isImportVersionSupported(detected.version)) {
        errorMessage = $t('dataTransfer.versionMismatch', detected.version, getCurrentVersion())
        step = 'error'
        return
      }
      importSitesChecked = detected.hasSites
      importSettingsChecked = detected.hasSettings
      step = 'confirm'
    }
    fileInput.click()
  }

  const handleImport = async () => {
    let sitesCount = 0
    let settingsImported = false
    let settingsSaved = Promise.resolve()

    if (importSitesChecked && detected.hasSites) {
      const siteItems = getImportSiteItems(detected)
      sitesCount = importSitesData(siteItems, sites, $sites, clickCounts)
    }

    if (importSettingsChecked && detected.hasSettings) {
      settingsSaved = importSettingsData(detected.data.settings)
      settingsImported = true
    }

    const parts = []
    if (importSitesChecked) parts.push($t('dataTransfer.importedSites', sitesCount))
    if (settingsImported) parts.push($t('dataTransfer.importedSettings'))
    resultMessage = parts.join('\n')
    step = 'done'

    if (settingsImported) {
      // 设置写入完成并让结果提示停留一会儿后再刷新
      await Promise.all([settingsSaved, new Promise((resolve) => setTimeout(resolve, 1500))])
      location.reload()
    }
  }

  const btnClass = $derived(dark
    ? 'text-neutral-400 hover:bg-neutral-700'
    : 'text-neutral-600 hover:bg-neutral-100')
  const primaryBtnClass = $derived(dark
    ? 'bg-white text-black hover:bg-neutral-200'
    : 'bg-neutral-800 text-white hover:bg-neutral-700')
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') onclose?.() }} />

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-100"
  onclick={(e) => { if (e.target === e.currentTarget) onclose?.() }}
  onkeydown={(e) => { if (e.key === 'Escape') onclose?.() }}
  role="dialog" aria-modal="true" tabindex="-1"
>
  <div class="rounded-xl p-6 w-88 shadow-2xl not-dark:bg-white dark:bg-neutral-800">
    <h2 class="text-base font-semibold mb-4 not-dark:text-neutral-800 dark:text-neutral-100">
      {$t('dataTransfer.importTitle')}
    </h2>

    {#if step === 'select'}
      <div class="flex justify-end gap-3">
        <button class="px-4 py-2 rounded-lg text-sm {btnClass}"
          onclick={() => onclose?.()}
        >{$t('site.cancel')}</button>
        <button class="px-4 py-2 rounded-lg text-sm {primaryBtnClass}"
          onclick={handleFileSelect}
        >{$t('dataTransfer.selectFile')}</button>
      </div>

    {:else if step === 'confirm'}
      <div class="space-y-3 mb-4">
        {#if detected.hasSites}
          <label class="flex items-start gap-3 cursor-pointer px-3 py-2 rounded-lg transition-all
            {importSitesChecked
              ? 'not-dark:bg-neutral-100 dark:bg-white/10'
              : 'not-dark:hover:bg-neutral-50 dark:hover:bg-white/5'}">
            <input type="checkbox" bind:checked={importSitesChecked}
              class="accent-neutral-600 mt-0.5" />
            <div>
              <div class="text-sm not-dark:text-neutral-700 dark:text-neutral-200">
                {$t('dataTransfer.containsSites')}
              </div>
              <div class="text-xs mt-1 not-dark:text-neutral-500 dark:text-neutral-400">
                {$t('dataTransfer.sitesHint')}
              </div>
            </div>
          </label>
        {/if}
        {#if detected.hasSettings}
          <label class="flex items-start gap-3 cursor-pointer px-3 py-2 rounded-lg transition-all
            {importSettingsChecked
              ? 'not-dark:bg-neutral-100 dark:bg-white/10'
              : 'not-dark:hover:bg-neutral-50 dark:hover:bg-white/5'}">
            <input type="checkbox" bind:checked={importSettingsChecked}
              class="accent-neutral-600 mt-0.5" />
            <div>
              <div class="text-sm not-dark:text-neutral-700 dark:text-neutral-200">
                {$t('dataTransfer.containsSettings')}
              </div>
              <div class="text-xs mt-1 not-dark:text-amber-600 dark:text-amber-400">
                {$t('dataTransfer.settingsWarn')}
              </div>
            </div>
          </label>
        {/if}
      </div>

      <div class="flex justify-end gap-3">
        <button class="px-4 py-2 rounded-lg text-sm {btnClass}"
          onclick={() => onclose?.()}
        >{$t('site.cancel')}</button>
        <button class="px-4 py-2 rounded-lg text-sm {primaryBtnClass}"
          disabled={!importSitesChecked && !importSettingsChecked}
          onclick={handleImport}
        >{$t('dataTransfer.importBtn')}</button>
      </div>

    {:else if step === 'error'}
      <p class="text-sm mb-4 not-dark:text-red-600 dark:text-red-400">{errorMessage}</p>
      <div class="flex justify-end">
        <button class="px-4 py-2 rounded-lg text-sm {btnClass}"
          onclick={() => onclose?.()}
        >{$t('site.cancel')}</button>
      </div>

    {:else if step === 'done'}
      <p class="text-sm mb-4 whitespace-pre-line not-dark:text-neutral-700 dark:text-neutral-200">{resultMessage}</p>
      <div class="flex justify-end">
        <button class="px-4 py-2 rounded-lg text-sm {primaryBtnClass}"
          onclick={() => onclose?.()}
        >{$t('dataTransfer.importDone')}</button>
      </div>
    {/if}
  </div>
</div>
