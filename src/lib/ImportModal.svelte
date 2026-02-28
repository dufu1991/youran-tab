<script>
  import { t } from './i18n.js'
  import { sites, clickCounts } from './stores.js'
  import { detectImportData, checkVersionMatch, getCurrentVersion, importSitesData, importSettingsData } from './dataTransfer.js'

  let { dark = false, onclose } = $props()

  let step = $state('select')
  let detected = $state(null)
  let importSitesChecked = $state(false)
  let importSettingsChecked = $state(false)
  let resultMessage = $state('')
  let errorMessage = $state('')

  function handleFileSelect() {
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
      if (detected.type !== 'legacy' && !checkVersionMatch(detected.version)) {
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

  function handleImport() {
    let sitesCount = 0
    let settingsImported = false

    if (importSitesChecked && detected.hasSites) {
      const siteItems = detected.type === 'legacy' ? detected.data : detected.data.sites
      sitesCount = importSitesData(siteItems, sites, $sites, clickCounts)
    }

    if (importSettingsChecked && detected.hasSettings) {
      importSettingsData(detected.data.settings)
      settingsImported = true
    }

    const parts = []
    if (importSitesChecked) parts.push($t('dataTransfer.importedSites', sitesCount))
    if (settingsImported) parts.push($t('dataTransfer.importedSettings'))
    resultMessage = parts.join('\n')
    step = 'done'

    if (settingsImported) {
      setTimeout(() => location.reload(), 1500)
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
  <div class="rounded-xl p-6 w-88 shadow-2xl {dark ? 'bg-neutral-800' : 'bg-white'}">
    <h2 class="text-base font-semibold mb-4 {dark ? 'text-neutral-100' : 'text-neutral-800'}">
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
              ? (dark ? 'bg-white/10' : 'bg-neutral-100')
              : (dark ? 'hover:bg-white/5' : 'hover:bg-neutral-50')}">
            <input type="checkbox" bind:checked={importSitesChecked}
              class="accent-neutral-600 mt-0.5" />
            <div>
              <div class="text-sm {dark ? 'text-neutral-200' : 'text-neutral-700'}">
                {$t('dataTransfer.containsSites')}
              </div>
              <div class="text-xs mt-1 {dark ? 'text-neutral-400' : 'text-neutral-500'}">
                {$t('dataTransfer.sitesHint')}
              </div>
            </div>
          </label>
        {/if}
        {#if detected.hasSettings}
          <label class="flex items-start gap-3 cursor-pointer px-3 py-2 rounded-lg transition-all
            {importSettingsChecked
              ? (dark ? 'bg-white/10' : 'bg-neutral-100')
              : (dark ? 'hover:bg-white/5' : 'hover:bg-neutral-50')}">
            <input type="checkbox" bind:checked={importSettingsChecked}
              class="accent-neutral-600 mt-0.5" />
            <div>
              <div class="text-sm {dark ? 'text-neutral-200' : 'text-neutral-700'}">
                {$t('dataTransfer.containsSettings')}
              </div>
              <div class="text-xs mt-1 {dark ? 'text-amber-400' : 'text-amber-600'}">
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
      <p class="text-sm mb-4 {dark ? 'text-red-400' : 'text-red-600'}">{errorMessage}</p>
      <div class="flex justify-end">
        <button class="px-4 py-2 rounded-lg text-sm {btnClass}"
          onclick={() => onclose?.()}
        >{$t('site.cancel')}</button>
      </div>

    {:else if step === 'done'}
      <p class="text-sm mb-4 whitespace-pre-line {dark ? 'text-neutral-200' : 'text-neutral-700'}">{resultMessage}</p>
      <div class="flex justify-end">
        <button class="px-4 py-2 rounded-lg text-sm {primaryBtnClass}"
          onclick={() => onclose?.()}
        >{$t('dataTransfer.importDone')}</button>
      </div>
    {/if}
  </div>
</div>
