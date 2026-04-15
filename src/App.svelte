<script>
  import { sites, theme, mode, isDark, showSettings, editMode, showSearchBar, showSiteTitle, bentoConfig, defaultConfig, glassConfig, bubbleConfig, resetAllSettings, bgConfig, solidPresets, gradientPresets, bgImages, bgImageUrls, themeAlign, refreshRandomBackground } from './lib/stores.js'
  import { t, localeSetting, currentLocale, supportedLocales, localeNames } from './lib/i18n.js'
  import { saveImages } from './lib/bgImages.js'
  import AddSiteModal from './lib/AddSiteModal.svelte'
  import ContextMenu from './lib/ContextMenu.svelte'
  import FolderModal from './lib/FolderModal.svelte'
  import ExportModal from './lib/ExportModal.svelte'
  import ImportModal from './lib/ImportModal.svelte'
  import TerminalTheme from './lib/themes/TerminalTheme.svelte'
  import DefaultTheme from './lib/themes/DefaultTheme.svelte'
  import MinimalTheme from './lib/themes/MinimalTheme.svelte'
  import BentoTheme from './lib/themes/BentoTheme.svelte'
  import GlassTheme from './lib/themes/GlassTheme.svelte'
  import BubbleTheme from './lib/themes/BubbleTheme.svelte'
  import PixelTheme from './lib/themes/PixelTheme.svelte'
  import SketchTheme from './lib/themes/SketchTheme.svelte'
  import { collectFolderCandidates, createFolderEntry, findFolderByChildId, findItemById, getFolderSites, isFolderItem } from './lib/folders.js'

  const themeKeys = ['default', 'bento', 'terminal', 'minimal', 'glass', 'bubble', 'pixel', 'sketch']
  const themeComponents = { terminal: TerminalTheme, default: DefaultTheme, minimal: MinimalTheme, bento: BentoTheme, glass: GlassTheme, bubble: BubbleTheme, pixel: PixelTheme, sketch: SketchTheme }
  const modes = ['auto', 'light', 'dark']
  const bgTypes = ['none', 'solid', 'gradient', 'image', 'random']
  const randomScopes = ['solid', 'gradient', 'image', 'all']

  let showModal = $state(false)
  let editingSite = $state(null)
  let activeFolderId = $state('')
  let activeFolderAnchor = $state(null)
  let suppressFolderOpen = $state(false)
  let lastClosedFolderId = $state('')
  let showExportModal = $state(false)
  let showImportModal = $state(false)
  let pendingFolderDelete = $state(null)
  let contextMenu = $state({
    open: false,
    x: 0,
    y: 0,
    scope: 'page',
    itemId: '',
    itemType: '',
  })

  let ThemeComponent = $derived(themeComponents[$theme] || DefaultTheme)
  let activeFolder = $derived(activeFolderId ? findItemById($sites, activeFolderId) : null)
  let folderMenuRadius = $derived.by(() => {
    if ($theme === 'bento') return $bentoConfig.radius
    if ($theme === 'default') return $defaultConfig.radius
    if ($theme === 'glass') return 16
    if ($theme === 'pixel') return 0
    if ($theme === 'bubble') return 24
    if ($theme === 'sketch') return 18
    if ($theme === 'minimal') return 14
    return 18
  })
  let folderCandidates = $derived(
    showModal ? collectFolderCandidates($sites, isFolderItem(editingSite) ? editingSite.id : null) : []
  )
  let allowFolder = $derived(!editingSite || isFolderItem(editingSite) || !findFolderByChildId($sites, editingSite.id))

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

  function closeEditor() {
    closeContextMenu()
    showModal = false
    editingSite = null
  }

  function closeFolderDeleteDialog() {
    pendingFolderDelete = null
  }

  function handleAdd() {
    closeContextMenu()
    editingSite = null
    showModal = true
  }

  function handleEdit(site) {
    closeContextMenu()
    editingSite = site
    showModal = true
  }

  function upsertFolder(data) {
    const selectedItems = (data.items || []).map((item) => ({ ...item }))
    if (editingSite && isFolderItem(editingSite)) {
      const selectedIds = new Set(selectedItems.map((item) => item.id))
      const updatedFolder = createFolderEntry(data, editingSite.id)
      const nextItems = []

      for (const item of $sites) {
        if (item.id === editingSite.id) {
          nextItems.push(updatedFolder)
          const releasedSites = getFolderSites(editingSite).filter((site) => !selectedIds.has(site.id))
          nextItems.push(...releasedSites)
          continue
        }
        if (!isFolderItem(item) && selectedIds.has(item.id)) continue
        nextItems.push(item)
      }

      sites.setAll(nextItems)
      activeFolderId = editingSite.id
      return
    }

    const selectedIds = new Set(selectedItems.map((item) => item.id))
    const nextItems = $sites.filter((item) => isFolderItem(item) || !selectedIds.has(item.id))
    nextItems.push(createFolderEntry(data))
    sites.setAll(nextItems)
  }

  function handleSave(data) {
    if (data.type === 'folder') {
      upsertFolder(data)
      closeEditor()
      return
    }

    if (Array.isArray(data)) {
      data.forEach((item) => sites.add(item))
      closeEditor()
      return
    }

    if (editingSite) {
      sites.edit(editingSite.id, data)
    } else {
      sites.add(data)
    }
    closeEditor()
  }

  function handleOpenFolder(payload) {
    closeContextMenu()
    const folder = payload?.folder || payload
    const rect = payload?.rect || null
    if (lastClosedFolderId && lastClosedFolderId === folder?.id) return
    if (suppressFolderOpen) return
    activeFolderId = folder?.id || ''
    activeFolderAnchor = rect
  }

  function closeActiveFolder() {
    closeContextMenu()
    lastClosedFolderId = activeFolderId
    suppressFolderOpen = true
    activeFolderId = ''
    activeFolderAnchor = null
    setTimeout(() => {
      lastClosedFolderId = ''
      suppressFolderOpen = false
    }, 400)
  }

  function releaseFolderSites(folderId) {
    const nextItems = []
    for (const item of $sites) {
      if (item.id === folderId) {
        nextItems.push(...getFolderSites(item))
        continue
      }
      nextItems.push(item)
    }
    sites.setAll(nextItems)
    if (activeFolderId === folderId) {
      activeFolderId = ''
      activeFolderAnchor = null
    }
  }

  function deleteFolderWithSites(folderId) {
    sites.remove(folderId)
    if (activeFolderId === folderId) {
      activeFolderId = ''
      activeFolderAnchor = null
    }
  }

  function confirmFolderDelete(mode) {
    if (!pendingFolderDelete) return

    if (mode === 'release') {
      releaseFolderSites(pendingFolderDelete.id)
    } else if (mode === 'all') {
      deleteFolderWithSites(pendingFolderDelete.id)
    }

    closeFolderDeleteDialog()
  }

  function handleDelete(id) {
    closeContextMenu()
    const target = findItemById($sites, id)
    if (!target) return

    if (isFolderItem(target)) {
      pendingFolderDelete = target
      if (activeFolderId === id) {
        activeFolderId = ''
        activeFolderAnchor = null
      }
      return
    }

    sites.remove(id)
  }

  function shuffleBackground() {
    if ($bgConfig.type === 'random') {
      refreshRandomBackground()
      return
    }

    const candidates = []
    const solidList = $isDark ? $solidPresets.dark : $solidPresets.light
    const gradientList = $isDark ? $gradientPresets.dark : $gradientPresets.light

    solidList.forEach((_, index) => {
      candidates.push({ type: 'solid', id: index })
    })
    gradientList.forEach((_, index) => {
      candidates.push({ type: 'gradient', id: index })
    })
    $bgImageUrls.forEach((_, index) => {
      candidates.push({ type: 'image', id: index })
    })

    if (candidates.length === 0) return

    let currentKey = ''
    if ($bgConfig.type === 'solid') {
      currentKey = `solid:${$isDark ? $bgConfig.solidDarkId : $bgConfig.solidLightId}`
    } else if ($bgConfig.type === 'gradient') {
      currentKey = `gradient:${$isDark ? $bgConfig.gradientDarkId : $bgConfig.gradientLightId}`
    } else if ($bgConfig.type === 'image') {
      currentKey = `image:${$bgConfig.imageId}`
    }

    const pool = candidates.length > 1
      ? candidates.filter((candidate) => `${candidate.type}:${candidate.id}` !== currentKey)
      : candidates
    const next = pool[Math.floor(Math.random() * pool.length)] || candidates[0]

    bgConfig.set('type', next.type)
    if (next.type === 'solid') {
      bgConfig.set($isDark ? 'solidDarkId' : 'solidLightId', next.id)
      return
    }
    if (next.type === 'gradient') {
      bgConfig.set($isDark ? 'gradientDarkId' : 'gradientLightId', next.id)
      return
    }
    bgConfig.set('imageId', next.id)
  }

  function closeContextMenu() {
    contextMenu = {
      open: false,
      x: 0,
      y: 0,
      scope: 'page',
      itemId: '',
      itemType: '',
    }
  }

  function getTabsApi() {
    if (typeof browser !== 'undefined' && browser.tabs?.create) return browser.tabs
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) return chrome.tabs
    return null
  }

  async function openUrlsInNewTabs(urls) {
    const validUrls = urls.filter((url) => typeof url === 'string' && /^https?:\/\//.test(url))
    if (validUrls.length === 0) return

    const tabsApi = getTabsApi()
    if (tabsApi) {
      if (typeof browser !== 'undefined' && browser.tabs?.create === tabsApi.create) {
        for (const url of validUrls) {
          await browser.tabs.create({ url })
        }
        return
      }

      await new Promise((resolve) => {
        let remaining = validUrls.length
        for (const url of validUrls) {
          tabsApi.create({ url }, () => {
            remaining -= 1
            if (remaining === 0) resolve()
          })
        }
      })
      return
    }

    validUrls.forEach((url) => {
      window.open(url, '_blank', 'noopener,noreferrer')
    })
  }

  function isContextMenuSuppressed() {
    return $theme === 'terminal'
      || $editMode
      || showModal
      || showExportModal
      || showImportModal
      || !!pendingFolderDelete
      || $showSettings
      || !!activeFolderId
  }

  function handlePageContextMenu(event) {
    if (isContextMenuSuppressed()) return
    if (event.target.closest('[data-no-context-menu]')) return
    if (event.target.closest('input, textarea, select, button, form, [contenteditable="true"]')) return

    const itemEl = event.target.closest('[data-context-item]')
    event.preventDefault()

    if (itemEl) {
      contextMenu = {
        open: true,
        x: event.clientX,
        y: event.clientY,
        scope: 'item',
        itemId: itemEl.dataset.itemId || '',
        itemType: itemEl.dataset.contextItem || '',
      }
      return
    }

    contextMenu = {
      open: true,
      x: event.clientX,
      y: event.clientY,
      scope: 'page',
      itemId: '',
    }
  }

  function handleContextMenuSelect(actionId) {
    const itemId = contextMenu.itemId
    const itemType = contextMenu.itemType
    closeContextMenu()

    if (actionId === 'page-add') {
      handleAdd()
      return
    }

    if (actionId === 'page-refresh-bg') {
      shuffleBackground()
      return
    }

    if (actionId === 'item-edit') {
      const target = findItemById($sites, itemId)
      if (target) handleEdit(target)
      return
    }

    if (actionId === 'item-open-all' && itemType === 'folder') {
      const target = findItemById($sites, itemId)
      if (!isFolderItem(target)) return
      openUrlsInNewTabs(getFolderSites(target).map((site) => site.url))
    }
  }

</script>

<div class="w-full h-full relative" oncontextmenu={handlePageContextMenu} role="presentation">
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
      onopenfolder={handleOpenFolder}
    />
  {/if}

  {#if contextMenu.open}
    <ContextMenu
      x={contextMenu.x}
      y={contextMenu.y}
      dark={$isDark}
      items={contextMenu.scope === 'item'
        ? [
            ...(contextMenu.itemType === 'folder'
              ? [{
                  id: 'item-open-all',
                  label: $t('folder.openAll'),
                  disabled: !isFolderItem(findItemById($sites, contextMenu.itemId)) || getFolderSites(findItemById($sites, contextMenu.itemId)).length === 0,
                }]
              : []),
            { id: 'item-edit', label: $t('site.editBtn') },
          ]
        : [
            { id: 'page-add', label: $t('site.add') },
            { id: 'page-refresh-bg', label: $t('settings.bgRefresh') },
          ]}
      onselect={handleContextMenuSelect}
      onclose={closeContextMenu}
    />
  {/if}

  <!-- 设置按钮（终端模式隐藏） -->
  {#if $theme !== 'terminal'}
    <button
      class="fixed bottom-4 right-4 z-50 w-9 h-9 rounded-full flex items-center justify-center text-lg
        shadow-lg transition-all {$isDark ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600' : 'bg-white text-neutral-500 hover:bg-neutral-100'}"
      onclick={() => {
        closeContextMenu()
        $showSettings = !$showSettings
      }}
      aria-label="Settings"
    >⚙</button>
  {/if}

  <!-- 设置面板 -->
  {#if $showSettings}
    <div class="fixed inset-0 z-90" onclick={(e) => { if (e.target === e.currentTarget) $showSettings = false }} role="presentation">
      <div class="fixed bottom-14 right-4 z-91 max-w-xs rounded-xl shadow-2xl p-4 space-y-3 max-h-[80vh] overflow-y-auto whitespace-nowrap
        {$isDark ? 'bg-neutral-800 text-neutral-200' : 'bg-white text-neutral-700'}" data-no-context-menu>

        <!-- 主题 + 模式 + 对齐 + 语言 -->
        <div class="space-y-2">
          <div>
            <div class="text-xs uppercase tracking-wider mb-1 {$isDark ? 'text-neutral-400' : 'text-neutral-400'}">
              {$t('settings.theme')}
            </div>
            <div class="grid grid-cols-4 rounded overflow-hidden">
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

        <!-- 搜索 -->
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
          </div>
        {/if}

        <!-- 背景 -->
        {#if $theme !== 'terminal' && $theme !== 'minimal'}
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
            {#if $theme === 'default' || $theme === 'bento' || $theme === 'sketch'}
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

        <!-- Glass 主题配置 -->
        {#if $theme === 'glass'}
          <hr class="{$isDark ? 'border-neutral-600' : 'border-neutral-200'}" />
          <div class="space-y-1">
            <div class="text-xs uppercase tracking-wider mb-1 {$isDark ? 'text-neutral-400' : 'text-neutral-400'}">
              {$t('theme.glass')}
            </div>
            <label class="flex items-center gap-2 text-sm">
              <span class="flex-1">{$t('settings.glassCols')}</span>
              <input type="range" min="1" max="4" step="1" value={$glassConfig.cols}
                oninput={(e) => glassConfig.set('cols', +e.target.value)}
                class="w-36 accent-white" />
              <span class="w-10 text-right text-xs {$isDark ? 'text-neutral-400' : 'text-neutral-500'}">{$glassConfig.cols}</span>
            </label>
          </div>
        {/if}

        <!-- Bubble 主题配置 -->
        {#if $theme === 'bubble'}
          <hr class="{$isDark ? 'border-neutral-600' : 'border-neutral-200'}" />
          <div class="space-y-1">
            <div class="text-xs uppercase tracking-wider mb-1 {$isDark ? 'text-neutral-400' : 'text-neutral-400'}">
              {$t('theme.bubble')}
            </div>
            <div>
              <div class="text-xs mb-1 {$isDark ? 'text-neutral-400' : 'text-neutral-400'}">
                {$t('settings.bubbleLayout')}
              </div>
              <div class="inline-flex rounded overflow-hidden">
                {#each ['fixed', 'random'] as layoutMode}
                  <button
                    class="px-2.5 py-1 text-xs transition-all
                      {$bubbleConfig.layout === layoutMode
                        ? ($isDark ? 'bg-white text-black' : 'bg-neutral-800 text-white')
                        : ($isDark ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-neutral-100 hover:bg-neutral-200')}"
                    onclick={() => bubbleConfig.set('layout', layoutMode)}
                  >{$t('settings.bubble' + layoutMode.charAt(0).toUpperCase() + layoutMode.slice(1))}</button>
                {/each}
              </div>
            </div>
            <label class="flex items-center gap-2 text-sm">
              <span class="flex-1">{$t('settings.bubbleSize')}</span>
              <input type="range" min="48" max="120" step="4" value={$bubbleConfig.size}
                oninput={(e) => bubbleConfig.set('size', +e.target.value)}
                class="w-36 accent-white" />
              <span class="w-10 text-right text-xs {$isDark ? 'text-neutral-400' : 'text-neutral-500'}">{$bubbleConfig.size}</span>
            </label>
          </div>
        {/if}

        <hr class="{$isDark ? 'border-neutral-600' : 'border-neutral-200'}" />
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
      availableSites={folderCandidates}
      allowFolder={allowFolder}
      dark={$isDark}
      onsave={handleSave}
      onclose={closeEditor}
    />
  {/if}

  {#if pendingFolderDelete}
    <div
      class="fixed inset-0 z-120 bg-black/55 flex items-center justify-center p-4"
      onclick={(event) => { if (event.target === event.currentTarget) closeFolderDeleteDialog() }}
      onkeydown={(event) => { if (event.key === 'Escape') closeFolderDeleteDialog() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="folder-delete-title"
      tabindex="-1"
    >
      <div class="w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-4 {$isDark ? 'bg-neutral-900 border-white/10 text-neutral-100' : 'bg-white border-black/8 text-neutral-900'}">
        <div class="space-y-2">
          <h3 id="folder-delete-title" class="text-lg font-semibold">{$t('folder.deleteConfirmTitle', pendingFolderDelete.name)}</h3>
          <p class="text-sm leading-6 {$isDark ? 'text-neutral-300' : 'text-neutral-600'}">
            {$t('folder.deleteConfirmBody', getFolderSites(pendingFolderDelete).length)}
          </p>
        </div>

        <div class="space-y-2">
          <button
            type="button"
            class="w-full rounded-xl px-4 py-3 text-left transition-colors {$isDark ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200'}"
            onclick={() => confirmFolderDelete('release')}
          >
            <span class="block font-medium">{$t('folder.deleteReleaseAction')}</span>
            <span class="block mt-1 text-xs {$isDark ? 'text-neutral-400' : 'text-neutral-500'}">{$t('folder.deleteReleaseHint')}</span>
          </button>

          <button
            type="button"
            class="w-full rounded-xl px-4 py-3 text-left transition-colors {$isDark ? 'bg-red-500/16 text-red-100 hover:bg-red-500/24' : 'bg-red-50 text-red-700 hover:bg-red-100'}"
            onclick={() => confirmFolderDelete('all')}
          >
            <span class="block font-medium">{$t('folder.deleteAllAction')}</span>
            <span class="block mt-1 text-xs {$isDark ? 'text-red-200/75' : 'text-red-500'}">{$t('folder.deleteAllHint')}</span>
          </button>
        </div>

        <div class="flex justify-end">
          <button
            type="button"
            class="px-4 py-2 rounded-lg {$isDark ? 'text-neutral-200 hover:bg-neutral-800' : 'text-neutral-600 hover:bg-neutral-100'}"
            onclick={closeFolderDeleteDialog}
          >{$t('site.cancel')}</button>
        </div>
      </div>
    </div>
  {/if}

  {#if activeFolder}
    <FolderModal
      folder={activeFolder}
      anchorRect={activeFolderAnchor}
      panelRadius={folderMenuRadius}
      dark={$isDark}
      editMode={$editMode}
      onclose={closeActiveFolder}
      oneditfolder={(folder) => { closeActiveFolder(); handleEdit(folder) }}
      oneditsite={handleEdit}
      ondeletesite={handleDelete}
    />
  {/if}

  {#if showExportModal}
    <ExportModal dark={$isDark} onclose={() => showExportModal = false} />
  {/if}

  {#if showImportModal}
    <ImportModal dark={$isDark} onclose={() => showImportModal = false} />
  {/if}
</div>
