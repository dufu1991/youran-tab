<script>
  import { untrack } from 'svelte'
  import { t } from './i18n.js'
  import { iconSources, pickableSourceKeys, getFaviconBySource, getFaviconFallback } from './favicon.js'

  /** @type {{ site?: any, dark?: boolean, onsave?: Function, onclose?: Function }} */
  let { site = null, dark = false, onsave, onclose } = $props()

  const init = untrack(() => site ?? {})
  const isEdit = untrack(() => site !== null)
  let name = $state(init.name || '')
  let url = $state(init.url || '')
  let iconSource = $state(init.iconSource || 'auto')
  let customIcon = $state(init.customIcon || '')
  let customIconDark = $state(init.customIconDark || '')
  let separateDark = $state(!!init.customIconDark)
  let iconRadius = $state(init.iconRadius ?? 4)

  let activeSource = $derived(iconSource || 'auto')
  let fullUrl = $derived(url.includes('://') ? url : 'https://' + url)
  let hasUrl = $derived(url.trim().length > 0)

  function selectSource(key) {
    iconSource = key
  }

  function resizeImage(file, maxSize = 128) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
          canvas.width = img.width * scale
          canvas.height = img.height * scale
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/png'))
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  async function handleFileUpload(e, target) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await resizeImage(file)
    if (target === 'light') customIcon = dataUrl
    else customIconDark = dataUrl
    iconSource = 'custom'
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !url.trim()) return
    let finalUrl = url.trim()
    if (!/^https?:\/\//.test(finalUrl)) finalUrl = 'https://' + finalUrl
    const data = { name: name.trim(), url: finalUrl, iconSource, iconRadius }
    if (iconSource === 'custom') {
      data.customIcon = customIcon
      data.customIconDark = separateDark ? customIconDark : ''
    } else {
      data.customIcon = ''
      data.customIconDark = ''
    }
    onsave?.(data)
  }
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') onclose?.() }} />

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-100"
  onclick={(e) => { if (e.target === e.currentTarget) onclose?.() }}
  onkeydown={(e) => { if (e.key === 'Escape') onclose?.() }}
  role="dialog" aria-modal="true" tabindex="-1"
>
  <div class="rounded-xl p-6 w-115 shadow-2xl max-h-[90vh] overflow-y-auto {dark ? 'bg-neutral-800' : 'bg-white'}">
    <h2 class="text-lg font-semibold mb-4 {dark ? 'text-neutral-100' : 'text-neutral-800'}">
      {isEdit ? $t('site.edit') : $t('site.add')}
    </h2>

    <form onsubmit={handleSubmit} class="space-y-4">
      <div>
        <label class="block text-sm mb-1 {dark ? 'text-neutral-400' : 'text-neutral-600'}" for="site-name">{$t('site.name')}</label>
        <input id="site-name" type="text" bind:value={name} placeholder={$t('site.namePh')}
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2
            {dark ? 'bg-neutral-700 border-neutral-600 text-white focus:ring-neutral-400' : 'bg-white border-neutral-300 focus:ring-neutral-800'}" />
      </div>

      <div>
        <label class="block text-sm mb-1 {dark ? 'text-neutral-400' : 'text-neutral-600'}" for="site-url">{$t('site.url')}</label>
        <input id="site-url" type="text" bind:value={url} placeholder={$t('site.urlPh')}
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2
            {dark ? 'bg-neutral-700 border-neutral-600 text-white focus:ring-neutral-400' : 'bg-white border-neutral-300 focus:ring-neutral-800'}" />
      </div>

      <!-- 图标源选择 -->
      <div>
        <span class="block text-sm mb-2 {dark ? 'text-neutral-400' : 'text-neutral-600'}">{$t('site.icon')}</span>

        {#if hasUrl}
          <div class="flex flex-wrap gap-3 mb-2">
            {#each pickableSourceKeys as key}
              <button type="button"
                class="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border-2 transition-all w-22
                  {activeSource === key
                    ? (dark ? 'border-white bg-white/10' : 'border-neutral-800 bg-neutral-100')
                    : (dark ? 'border-neutral-600 hover:border-neutral-500 bg-neutral-700/50' : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50')}"
                onclick={() => selectSource(key)}>
                <img src={getFaviconBySource(fullUrl, key)} alt=""
                  class="w-12 h-12"
                  style="border-radius: {iconRadius}%"
                  onerror={(e) => { e.target.style.opacity = '0.2' }} />
                <span class="text-[10px] truncate w-full text-center
                  {dark ? 'text-neutral-400' : 'text-neutral-500'}">{iconSources[key].name}</span>
              </button>
            {/each}

            <!-- 自定义选项 -->
            <button type="button"
              class="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border-2 transition-all w-22
                {iconSource === 'custom'
                  ? (dark ? 'border-white bg-white/10' : 'border-neutral-800 bg-neutral-100')
                  : (dark ? 'border-neutral-600 hover:border-neutral-500 bg-neutral-700/50' : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50')}"
              onclick={() => { iconSource = 'custom' }}>
              {#if customIcon}
                <img src={customIcon} alt="" class="w-12 h-12" style="border-radius: {iconRadius}%" />
              {:else}
                <span class="w-12 h-12 flex items-center justify-center text-xl {dark ? 'text-neutral-500' : 'text-neutral-400'}">📁</span>
              {/if}
              <span class="text-[10px] truncate w-full text-center
                {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$t('site.iconCustom')}</span>
            </button>
          </div>
        {/if}

        <!-- 自定义图标上传 -->
        {#if iconSource === 'custom'}
          <div class="space-y-2 p-3 rounded-lg {dark ? 'bg-neutral-700/50' : 'bg-neutral-50'}">
            <div class="flex items-center gap-3">
              {#if customIcon}
                <img src={customIcon} alt="" class="w-8 h-8 rounded shrink-0" />
              {/if}
              <div class="flex-1">
                <span class="text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$t('site.iconLight')}</span>
                <input type="file" accept="image/*"
                  onchange={(e) => handleFileUpload(e, 'light')}
                  class="block w-full text-xs mt-1 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs
                    {dark ? 'text-neutral-300 file:bg-neutral-600 file:text-neutral-200' : 'text-neutral-500 file:bg-neutral-200 file:text-neutral-700'}" />
              </div>
            </div>

            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" bind:checked={separateDark}
                class="rounded accent-white" />
              <span class="text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$t('site.iconSeparateDark')}</span>
            </label>

            {#if separateDark}
              <div class="flex items-center gap-3">
                {#if customIconDark}
                  <img src={customIconDark} alt="" class="w-8 h-8 rounded shrink-0" />
                {/if}
                <div class="flex-1">
                  <span class="text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$t('site.iconDark')}</span>
                  <input type="file" accept="image/*"
                    onchange={(e) => handleFileUpload(e, 'dark')}
                    class="block w-full text-xs mt-1 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs
                      {dark ? 'text-neutral-300 file:bg-neutral-600 file:text-neutral-200' : 'text-neutral-500 file:bg-neutral-200 file:text-neutral-700'}" />
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <!-- 图标圆角 -->
        <div class="flex items-center gap-3 mt-2">
          <span class="text-xs shrink-0 {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$t('site.iconRadius')}</span>
          <input type="range" min="0" max="50" step="1" bind:value={iconRadius}
            class="flex-1" />
          <span class="text-xs w-8 text-right {dark ? 'text-neutral-400' : 'text-neutral-500'}">{iconRadius}%</span>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button type="button"
          class="px-4 py-2 rounded-lg {dark ? 'text-neutral-200 hover:bg-neutral-700' : 'text-neutral-600 hover:bg-neutral-100'}"
          onclick={() => onclose?.()}
        >{$t('site.cancel')}</button>
        <button type="submit"
          class="px-4 py-2 rounded-lg {dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-800 text-white hover:bg-neutral-700'}"
        >{$t('site.save')}</button>
      </div>
    </form>
  </div>
</div>
