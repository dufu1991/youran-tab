<script>
  import { sites, theme, mode, isDark, showSettings, searchEngine, searchEngines, editMode, showSearchBar, showEngineLogo, showSiteTitle, bentoConfig, defaultConfig, resetAllSettings, bgConfig, solidPresets, gradientPresets, bgImages, bgImageUrls, themeAlign } from './lib/stores.js'
  import { t, localeSetting, currentLocale, supportedLocales, localeNames } from './lib/i18n.js'
  import { saveImages } from './lib/bgImages.js'
  import AddSiteModal from './lib/AddSiteModal.svelte'
  import ExportModal from './lib/ExportModal.svelte'
  import ImportModal from './lib/ImportModal.svelte'
  import TerminalTheme from './lib/themes/TerminalTheme.svelte'
  import DefaultTheme from './lib/themes/DefaultTheme.svelte'
  import MinimalTheme from './lib/themes/MinimalTheme.svelte'
  import BentoTheme from './lib/themes/BentoTheme.svelte'

  const themeKeys = ['default', 'bento', 'terminal', 'minimal']
  const themeComponents = { terminal: TerminalTheme, default: DefaultTheme, minimal: MinimalTheme, bento: BentoTheme }
  const modes = ['auto', 'light', 'dark']
  const bgTypes = ['none', 'solid', 'gradient', 'image', 'random']
  const randomScopes = ['solid', 'gradient', 'image', 'all']

  let showModal = $state(false)
  let editingSite = $state(null)
  let showExportModal = $state(false)
  let showImportModal = $state(false)

  let ThemeComponent = $derived(themeComponents[$theme] || DefaultTheme)

  function resizeBgBlob(file) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const scale = Math.min(1920 / img.width, 1920 / img.height, 1)
          canvas.width = img.width * scale
          canvas.height = img.height * scale
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  async function handleBgUpload(e) {
    const files = Array.from(e.target.files || [])
    const current = $bgImages
    const remaining = 12 - current.length
    if (remaining <= 0) return
    const newBlobs = await Promise.all(files.slice(0, remaining).map(resizeBgBlob))
    const allBlobs = [...current, ...newBlobs]
    bgImages.set(allBlobs)
    bgImageUrls.set(allBlobs.map((b) => URL.createObjectURL(b)))
    await saveImages(allBlobs)
    if ($bgConfig.type !== 'image') bgConfig.set('type', 'image')
    e.target.value = ''
  }

  async function removeBgImage(idx) {
    const allBlobs = $bgImages.filter((_, i) => i !== idx)
    bgImages.set(allBlobs)
    bgImageUrls.set(allBlobs.map((b) => URL.createObjectURL(b)))
    await saveImages(allBlobs)
  }

  $effect(() => {
    document.documentElement.classList.toggle('dark', $isDark)
  })

  function handleAdd() { editingSite = null; showModal = true }
  function handleEdit(site) { editingSite = site; showModal = true }
  function handleSave(data) {
    if (editingSite) sites.edit(editingSite.id, data)
    else sites.add(data)
    showModal = false; editingSite = null
  }
  function handleDelete(id) { sites.remove(id) }

</script>

<div class="w-full h-full relative">
  {#if $theme === 'terminal'}
    <TerminalTheme dark={$isDark} align={$themeAlign.terminal} />
  {:else}
    <ThemeComponent
      sites={$sites}
      dark={$isDark}
      align={$themeAlign[$theme]}
      onadd={handleAdd}
      onedit={handleEdit}
      ondelete={handleDelete}
    />
  {/if}

  <!-- 设置按钮（终端模式隐藏） -->
  {#if $theme !== 'terminal'}
    <button
      class="fixed bottom-4 right-4 z-50 w-9 h-9 rounded-full flex items-center justify-center text-lg
        shadow-lg transition-all {$isDark ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600' : 'bg-white text-neutral-500 hover:bg-neutral-100'}"
      onclick={() => $showSettings = !$showSettings}
      aria-label="Settings"
    >⚙</button>
  {/if}

  <!-- 设置面板 -->
  {#if $showSettings}
    <div class="fixed inset-0 z-90" onclick={(e) => { if (e.target === e.currentTarget) $showSettings = false }} role="presentation">
      <div class="fixed bottom-14 right-4 z-91 max-w-xs rounded-xl shadow-2xl p-4 space-y-3 max-h-[80vh] overflow-y-auto whitespace-nowrap
        {$isDark ? 'bg-neutral-800 text-neutral-200' : 'bg-white text-neutral-700'}">

        <!-- 主题 + 模式 + 对齐 + 语言 -->
        <div class="space-y-2">
          <div>
            <div class="text-xs uppercase tracking-wider mb-1 {$isDark ? 'text-neutral-400' : 'text-neutral-400'}">
              {$t('settings.theme')}
            </div>
            <div class="inline-flex rounded overflow-hidden">
              {#each themeKeys as key}
                <button
                  class="px-2.5 py-1 text-xs transition-all
                    {$theme === key
                      ? ($isDark ? 'bg-white text-black' : 'bg-neutral-800 text-white')
                      : ($isDark ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-neutral-100 hover:bg-neutral-200')}"
                  onclick={() => theme.set(key)}
                >{$t('theme.' + key)}</button>
              {/each}
            </div>
          </div>
          <div>
            <div class="text-xs uppercase tracking-wider mb-1 {$isDark ? 'text-neutral-400' : 'text-neutral-400'}">
              {$t('settings.mode')}
            </div>
            <div class="inline-flex rounded overflow-hidden">
              {#each modes as m}
                <button
                  class="px-2.5 py-1 text-xs transition-all
                    {$mode === m
                      ? ($isDark ? 'bg-white text-black' : 'bg-neutral-800 text-white')
                      : ($isDark ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-neutral-100 hover:bg-neutral-200')}"
                  onclick={() => mode.set(m)}
                >{$t('mode.' + m)}</button>
              {/each}
            </div>
          </div>
          <div>
            <div class="text-xs uppercase tracking-wider mb-1 {$isDark ? 'text-neutral-400' : 'text-neutral-400'}">
              {$t('settings.align')}
            </div>
            <div class="inline-flex rounded overflow-hidden">
              {#each ['top', 'center', 'bottom'] as a}
                <button
                  class="px-2.5 py-1 text-xs transition-all
                    {$themeAlign[$theme] === a
                      ? ($isDark ? 'bg-white text-black' : 'bg-neutral-800 text-white')
                      : ($isDark ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-neutral-100 hover:bg-neutral-200')}"
                  onclick={() => themeAlign.set($theme, a)}
                >{$t('align.' + a)}</button>
              {/each}
            </div>
          </div>
          <div>
            <div class="text-xs uppercase tracking-wider mb-1 {$isDark ? 'text-neutral-400' : 'text-neutral-400'}">
              {$t('settings.language')}
            </div>
            <select
              class="w-full px-2 py-1.5 rounded text-sm border
                {$isDark ? 'bg-neutral-700 border-neutral-600 text-neutral-200' : 'bg-white border-neutral-200'}"
              value={$localeSetting}
              onchange={(e) => localeSetting.set(e.target.value)}
            >
              <option value="auto">{$t('settings.langAuto')}</option>
              {#each supportedLocales as loc}
                <option value={loc}>{localeNames[loc]}</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- 搜索引擎 -->
        {#if $theme !== 'terminal'}
          <hr class="{$isDark ? 'border-neutral-600' : 'border-neutral-200'}" />
          <div>
            <div class="text-xs uppercase tracking-wider mb-1 {$isDark ? 'text-neutral-400' : 'text-neutral-400'}">
              {$t('settings.search')}
            </div>
            <label class="flex items-center justify-between cursor-pointer mb-1">
              <span class="text-sm">{$t('settings.showSearch')}</span>
              <button
                class="relative w-9 h-5 rounded-full transition-colors {$showSearchBar ? ($isDark ? 'bg-neutral-300' : 'bg-neutral-800') : ($isDark ? 'bg-neutral-600' : 'bg-neutral-300')}"
                onclick={() => showSearchBar.set(!$showSearchBar)}
                role="switch"
                aria-checked={$showSearchBar}
                aria-label={$t('settings.showSearch')}
              >
                <span
                  class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform {$showSearchBar ? 'translate-x-4 ' + ($isDark ? 'bg-neutral-900' : 'bg-white') : 'bg-white'}"
                ></span>
              </button>
            </label>
            {#if $showSearchBar}
              {#if $theme === 'default' || $theme === 'bento'}
                <label class="flex items-center justify-between cursor-pointer mb-1">
                  <span class="text-sm">{$t('settings.showLogo')}</span>
                  <button
                    class="relative w-9 h-5 rounded-full transition-colors {$showEngineLogo ? ($isDark ? 'bg-neutral-300' : 'bg-neutral-800') : ($isDark ? 'bg-neutral-600' : 'bg-neutral-300')}"
                    onclick={() => showEngineLogo.set(!$showEngineLogo)}
                    role="switch"
                    aria-checked={$showEngineLogo}
                    aria-label={$t('settings.showLogo')}
                  >
                    <span
                      class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform {$showEngineLogo ? 'translate-x-4 ' + ($isDark ? 'bg-neutral-900' : 'bg-white') : 'bg-white'}"
                    ></span>
                  </button>
                </label>
              {/if}
              <select
                class="w-full px-2 py-1.5 rounded text-sm border
                  {$isDark ? 'bg-neutral-700 border-neutral-600 text-neutral-200' : 'bg-white border-neutral-200'}"
                value={$searchEngine}
                onchange={(e) => searchEngine.set(e.target.value)}
              >
                {#each Object.entries(searchEngines) as [key, eng]}
                  <option value={key}>{eng.name}</option>
                {/each}
              </select>
            {/if}
          </div>
        {/if}

        <!-- 背景 -->
        {#if $theme === 'default' || $theme === 'bento'}
          <hr class="{$isDark ? 'border-neutral-600' : 'border-neutral-200'}" />
          <div>
            <div class="text-xs uppercase tracking-wider mb-1 {$isDark ? 'text-neutral-400' : 'text-neutral-400'}">
              {$t('settings.background')}
            </div>
            <div class="inline-flex rounded overflow-hidden mb-2">
              {#each bgTypes as bt}
                <button
                  class="px-2.5 py-1 text-xs transition-all
                    {$bgConfig.type === bt
                      ? ($isDark ? 'bg-white text-black' : 'bg-neutral-800 text-white')
                      : ($isDark ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-neutral-100 hover:bg-neutral-200')}"
                  onclick={() => bgConfig.set('type', bt)}
                >{$t('settings.bg' + bt.charAt(0).toUpperCase() + bt.slice(1))}</button>
              {/each}
            </div>

            {#if $bgConfig.type === 'solid'}
              <div class="grid grid-cols-6 gap-1.5">
                {#each ($isDark ? $solidPresets.dark : $solidPresets.light) as color, i}
                  <div class="relative group">
                    <button
                      class="w-full aspect-video rounded transition-all {($isDark ? $bgConfig.solidDarkId : $bgConfig.solidLightId) === i ? 'ring-2 ring-offset-1 ' + ($isDark ? 'ring-white ring-offset-neutral-800' : 'ring-neutral-800 ring-offset-white') : ''}"
                      style="background:{color}"
                      onclick={() => bgConfig.set($isDark ? 'solidDarkId' : 'solidLightId', i)}
                      aria-label="{$t('settings.bgSolid')} {i + 1}"
                    ></button>
                    <button class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onclick={() => $isDark ? solidPresets.removeDark(i) : solidPresets.removeLight(i)}>×</button>
                  </div>
                {/each}
                {#if ($isDark ? $solidPresets.dark : $solidPresets.light).length < 12}
                  <button class="aspect-video rounded border-2 border-dashed flex items-center justify-center text-sm
                    {$isDark ? 'border-neutral-600 text-neutral-500 hover:border-neutral-400' : 'border-neutral-300 text-neutral-400 hover:border-neutral-500'}"
                    onclick={() => $isDark ? solidPresets.addDark() : solidPresets.addLight()}>+</button>
                {/if}
              </div>
            {/if}

            {#if $bgConfig.type === 'gradient'}
              <div class="grid grid-cols-6 gap-1.5">
                {#each ($isDark ? $gradientPresets.dark : $gradientPresets.light) as g, i}
                  <div class="relative group">
                    <button
                      class="w-full aspect-video rounded transition-all {($isDark ? $bgConfig.gradientDarkId : $bgConfig.gradientLightId) === i ? 'ring-2 ring-offset-1 ' + ($isDark ? 'ring-white ring-offset-neutral-800' : 'ring-neutral-800 ring-offset-white') : ''}"
                      style="background:{g}"
                      onclick={() => bgConfig.set($isDark ? 'gradientDarkId' : 'gradientLightId', i)}
                      aria-label="{$t('settings.bgGradient')} {i + 1}"
                    ></button>
                    <button class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onclick={() => $isDark ? gradientPresets.removeDark(i) : gradientPresets.removeLight(i)}>×</button>
                  </div>
                {/each}
                {#if ($isDark ? $gradientPresets.dark : $gradientPresets.light).length < 12}
                  <button class="aspect-video rounded border-2 border-dashed flex items-center justify-center text-sm
                    {$isDark ? 'border-neutral-600 text-neutral-500 hover:border-neutral-400' : 'border-neutral-300 text-neutral-400 hover:border-neutral-500'}"
                    onclick={() => $isDark ? gradientPresets.addDark() : gradientPresets.addLight()}>+</button>
                {/if}
              </div>
            {/if}

            {#if $bgConfig.type === 'image'}
              <div class="grid grid-cols-6 gap-1.5">
                {#each $bgImageUrls as url, i}
                  <div class="relative group">
                    <button class="w-full aspect-video rounded overflow-hidden transition-all
                      {$bgConfig.imageId === i ? 'ring-2 ring-offset-1 ' + ($isDark ? 'ring-white ring-offset-neutral-800' : 'ring-neutral-800 ring-offset-white') : ''}"
                      onclick={() => bgConfig.set('imageId', i)}>
                      <img src={url} alt="" class="w-full h-full object-cover" />
                    </button>
                    <button
                      class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onclick={() => removeBgImage(i)}>×</button>
                  </div>
                {/each}
                {#if $bgImageUrls.length < 12}
                  <label class="aspect-video rounded border-2 border-dashed flex items-center justify-center text-sm cursor-pointer
                    {$isDark ? 'border-neutral-600 text-neutral-500 hover:border-neutral-400' : 'border-neutral-300 text-neutral-400 hover:border-neutral-500'}">
                    +
                    <input type="file" accept="image/*" multiple class="hidden" onchange={handleBgUpload} />
                  </label>
                {/if}
              </div>
            {/if}

            {#if $bgConfig.type === 'random'}
              <div>
                <div class="inline-flex rounded overflow-hidden">
                {#each randomScopes as rs}
                  <button
                    class="px-2.5 py-1 text-xs transition-all
                      {$bgConfig.randomScope === rs
                        ? ($isDark ? 'bg-white text-black' : 'bg-neutral-800 text-white')
                        : ($isDark ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-neutral-100 hover:bg-neutral-200')}"
                    onclick={() => bgConfig.set('randomScope', rs)}
                  >{$t('settings.bgRandom' + rs.charAt(0).toUpperCase() + rs.slice(1))}</button>
                {/each}
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <!-- 选项（极简/经典/便当通用） -->
        {#if $theme !== 'terminal'}
          <hr class="{$isDark ? 'border-neutral-600' : 'border-neutral-200'}" />
          <div class="space-y-1">
            <div class="text-xs uppercase tracking-wider mb-1 {$isDark ? 'text-neutral-400' : 'text-neutral-400'}">
              {$t('settings.options')}
            </div>
            {#if $theme === 'default' || $theme === 'bento'}
              <!-- 显示站点标题 -->
              <label class="flex items-center justify-between cursor-pointer">
                <span class="text-sm">{$t('settings.showTitle')}</span>
                <button
                  class="relative w-9 h-5 rounded-full transition-colors {$showSiteTitle ? ($isDark ? 'bg-neutral-300' : 'bg-neutral-800') : ($isDark ? 'bg-neutral-600' : 'bg-neutral-300')}"
                  onclick={() => showSiteTitle.set(!$showSiteTitle)}
                  role="switch"
                  aria-checked={$showSiteTitle}
                  aria-label={$t('settings.showTitle')}
                >
                  <span
                    class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform {$showSiteTitle ? 'translate-x-4 ' + ($isDark ? 'bg-neutral-900' : 'bg-white') : 'bg-white'}"
                  ></span>
                </button>
              </label>
            {/if}
            <!-- 编辑模式 -->
            <label class="flex items-center justify-between cursor-pointer">
              <span class="text-sm">{$t('settings.editMode')}</span>
              <button
                class="relative w-9 h-5 rounded-full transition-colors {$editMode ? ($isDark ? 'bg-neutral-300' : 'bg-neutral-800') : ($isDark ? 'bg-neutral-600' : 'bg-neutral-300')}"
                onclick={() => editMode.set(!$editMode)}
                role="switch"
                aria-checked={$editMode}
                aria-label={$t('settings.editMode')}
              >
                <span
                  class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform {$editMode ? 'translate-x-4 ' + ($isDark ? 'bg-neutral-900' : 'bg-white') : 'bg-white'}"
                ></span>
              </button>
            </label>
          </div>
        {/if}

        <!-- 经典主题配置 -->
        {#if $theme === 'default'}
          <hr class="{$isDark ? 'border-neutral-600' : 'border-neutral-200'}" />
          <div class="space-y-1">
            <div class="text-xs uppercase tracking-wider mb-1 {$isDark ? 'text-neutral-400' : 'text-neutral-400'}">
              {$t('theme.default')}
            </div>
            <label class="flex items-center gap-2 text-sm">
              <span class="flex-1">{$t('settings.bentoWidth')}</span>
              <input type="range" min="400" max="1400" step="50" value={$defaultConfig.width}
                oninput={(e) => defaultConfig.set('width', +e.target.value)}
                class="w-36 accent-white" />
              <span class="w-10 text-right text-xs {$isDark ? 'text-neutral-400' : 'text-neutral-500'}">{$defaultConfig.width}</span>
            </label>
            <label class="flex items-center gap-2 text-sm">
              <span class="flex-1">{$t('settings.bentoCols')}</span>
              <input type="range" min="3" max="8" step="1" value={$defaultConfig.cols}
                oninput={(e) => defaultConfig.set('cols', +e.target.value)}
                class="w-36 accent-white" />
              <span class="w-10 text-right text-xs {$isDark ? 'text-neutral-400' : 'text-neutral-500'}">{$defaultConfig.cols}</span>
            </label>
            <label class="flex items-center gap-2 text-sm">
              <span class="flex-1">{$t('settings.bentoRadius')}</span>
              <input type="range" min="0" max="32" step="2" value={$defaultConfig.radius}
                oninput={(e) => defaultConfig.set('radius', +e.target.value)}
                class="w-36 accent-white" />
              <span class="w-10 text-right text-xs {$isDark ? 'text-neutral-400' : 'text-neutral-500'}">{$defaultConfig.radius}</span>
            </label>
            <label class="flex items-center gap-2 text-sm">
              <span class="flex-1">{$t('settings.bentoOpacity')}</span>
              <input type="range" min="0" max="100" step="5" value={$defaultConfig.cardOpacity}
                oninput={(e) => defaultConfig.set('cardOpacity', +e.target.value)}
                class="w-36 accent-white" />
              <span class="w-10 text-right text-xs {$isDark ? 'text-neutral-400' : 'text-neutral-500'}">{$defaultConfig.cardOpacity}%</span>
            </label>
            <label class="flex items-center gap-2 text-sm">
              <span class="flex-1">{$t('settings.bentoBlur')}</span>
              <input type="range" min="0" max="20" step="1" value={$defaultConfig.cardBlur}
                oninput={(e) => defaultConfig.set('cardBlur', +e.target.value)}
                class="w-36 accent-white" />
              <span class="w-10 text-right text-xs {$isDark ? 'text-neutral-400' : 'text-neutral-500'}">{$defaultConfig.cardBlur}</span>
            </label>
            <label class="flex items-center gap-2 text-sm">
              <span class="flex-1">{$t('settings.bentoIconSize')}</span>
              <input type="range" min="24" max="64" step="2" value={$defaultConfig.iconSize}
                oninput={(e) => defaultConfig.set('iconSize', +e.target.value)}
                class="w-36 accent-white" />
              <span class="w-10 text-right text-xs {$isDark ? 'text-neutral-400' : 'text-neutral-500'}">{$defaultConfig.iconSize}</span>
            </label>
          </div>
        {/if}

        <!-- Bento 主题配置 -->
        {#if $theme === 'bento'}
          <hr class="{$isDark ? 'border-neutral-600' : 'border-neutral-200'}" />
          <div class="space-y-1">
            <div class="text-xs uppercase tracking-wider mb-1 {$isDark ? 'text-neutral-400' : 'text-neutral-400'}">
              {$t('theme.bento')}
            </div>
            <label class="flex items-center gap-2 text-sm">
              <span class="flex-1">{$t('settings.bentoWidth')}</span>
              <input type="range" min="400" max="1400" step="50" value={$bentoConfig.width}
                oninput={(e) => bentoConfig.set('width', +e.target.value)}
                class="w-36 accent-white" />
              <span class="w-10 text-right text-xs {$isDark ? 'text-neutral-400' : 'text-neutral-500'}">{$bentoConfig.width}</span>
            </label>
            <label class="flex items-center gap-2 text-sm">
              <span class="flex-1">{$t('settings.bentoGap')}</span>
              <input type="range" min="4" max="32" step="2" value={$bentoConfig.gap}
                oninput={(e) => bentoConfig.set('gap', +e.target.value)}
                class="w-36 accent-white" />
              <span class="w-10 text-right text-xs {$isDark ? 'text-neutral-400' : 'text-neutral-500'}">{$bentoConfig.gap}</span>
            </label>
            <label class="flex items-center gap-2 text-sm">
              <span class="flex-1">{$t('settings.bentoRadius')}</span>
              <input type="range" min="0" max="32" step="2" value={$bentoConfig.radius}
                oninput={(e) => bentoConfig.set('radius', +e.target.value)}
                class="w-36 accent-white" />
              <span class="w-10 text-right text-xs {$isDark ? 'text-neutral-400' : 'text-neutral-500'}">{$bentoConfig.radius}</span>
            </label>
            <label class="flex items-center gap-2 text-sm">
              <span class="flex-1">{$t('settings.bentoOpacity')}</span>
              <input type="range" min="0" max="100" step="5" value={$bentoConfig.cardOpacity}
                oninput={(e) => bentoConfig.set('cardOpacity', +e.target.value)}
                class="w-36 accent-white" />
              <span class="w-10 text-right text-xs {$isDark ? 'text-neutral-400' : 'text-neutral-500'}">{$bentoConfig.cardOpacity}%</span>
            </label>
            <label class="flex items-center gap-2 text-sm">
              <span class="flex-1">{$t('settings.bentoBlur')}</span>
              <input type="range" min="0" max="20" step="1" value={$bentoConfig.cardBlur}
                oninput={(e) => bentoConfig.set('cardBlur', +e.target.value)}
                class="w-36 accent-white" />
              <span class="w-10 text-right text-xs {$isDark ? 'text-neutral-400' : 'text-neutral-500'}">{$bentoConfig.cardBlur}</span>
            </label>
            <label class="flex items-center gap-2 text-sm">
              <span class="flex-1">{$t('settings.bentoIconSize')}</span>
              <input type="range" min="24" max="64" step="2" value={$bentoConfig.iconSize}
                oninput={(e) => bentoConfig.set('iconSize', +e.target.value)}
                class="w-36 accent-white" />
              <span class="w-10 text-right text-xs {$isDark ? 'text-neutral-400' : 'text-neutral-500'}">{$bentoConfig.iconSize}</span>
            </label>
            <!-- 固定布局 -->
            <label class="flex items-center justify-between cursor-pointer">
              <span class="text-sm">{$t('settings.bentoFixed')}</span>
              <button
                class="relative w-9 h-5 rounded-full transition-colors {$bentoConfig.fixed ? ($isDark ? 'bg-neutral-300' : 'bg-neutral-800') : ($isDark ? 'bg-neutral-600' : 'bg-neutral-300')}"
                onclick={() => bentoConfig.set('fixed', !$bentoConfig.fixed)}
                role="switch"
                aria-checked={$bentoConfig.fixed}
                aria-label={$t('settings.bentoFixed')}
              >
                <span
                  class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform {$bentoConfig.fixed ? 'translate-x-4 ' + ($isDark ? 'bg-neutral-900' : 'bg-white') : 'bg-white'}"
                ></span>
              </button>
            </label>
            {#if $bentoConfig.fixed}
              <label class="flex items-center gap-2 text-sm">
                <span class="flex-1">{$t('settings.bentoCols')}</span>
                <input type="range" min="3" max="8" step="1" value={$bentoConfig.cols}
                  oninput={(e) => bentoConfig.set('cols', +e.target.value)}
                  class="w-36 accent-white" />
                <span class="w-10 text-right text-xs {$isDark ? 'text-neutral-400' : 'text-neutral-500'}">{$bentoConfig.cols}</span>
              </label>
            {/if}
          </div>
        {/if}

        <hr class="{$isDark ? 'border-neutral-600' : 'border-neutral-200'}" />

        <!-- 导出 / 导入数据 -->
        <div class="flex gap-2">
          <button
            class="flex-1 py-1.5 rounded text-xs transition-all
              {$isDark ? 'text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200' : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600'}"
            onclick={() => showExportModal = true}
          >{$t('settings.exportSites')}</button>
          <button
            class="flex-1 py-1.5 rounded text-xs transition-all
              {$isDark ? 'text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200' : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600'}"
            onclick={() => showImportModal = true}
          >{$t('settings.importSites')}</button>
        </div>

        <!-- 重置设置 -->
        <button
          class="w-full py-1.5 rounded text-xs transition-all
            {$isDark ? 'text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200' : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600'}"
          onclick={() => { if (confirm($t('settings.resetConfirm'))) resetAllSettings() }}
        >{$t('settings.resetSettings')}</button>
      </div>
    </div>
  {/if}

  {#if showModal}
    <AddSiteModal
      site={editingSite}
      dark={$isDark}
      onsave={handleSave}
      onclose={() => { showModal = false; editingSite = null }}
    />
  {/if}

  {#if showExportModal}
    <ExportModal dark={$isDark} onclose={() => showExportModal = false} />
  {/if}

  {#if showImportModal}
    <ImportModal dark={$isDark} onclose={() => showImportModal = false} />
  {/if}
</div>
