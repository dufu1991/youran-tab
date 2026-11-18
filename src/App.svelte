<script>
  import { sites, theme, isDark, showSettings, editMode, bentoConfig, defaultConfig, bgConfig, solidPresets, gradientPresets, dynamicPresets, activeDynamicBg, bgImageUrls, themeAlign, refreshRandomBackground } from './lib/stores.js'
  import { t } from './lib/i18n.js'
  import ContextMenu from './lib/ContextMenu.svelte'
  import ConfirmDialog from './lib/ConfirmDialog.svelte'
  import FolderModal from './lib/FolderModal.svelte'
  import DynamicBackground from './lib/DynamicBackground.svelte'
  import { getLoadedTheme, loadTheme, resolveThemeKey } from './lib/themes/index.js'
  import { canOpenInTabGroup, openUrlsInTabGroup } from './lib/browserTabs.js'
  import UndoToast from './lib/UndoToast.svelte'
  import { findFolderByChildId, findItemById, getFolderSites, isFolderItem, moveSiteToFolder, upsertFolderInTree } from './lib/folders.js'

  const supportsTabGroup = canOpenInTabGroup()

  let showModal = $state(false)
  let editingSite = $state(null)
  let activeFolderId = $state('')
  let activeFolderAnchor = $state(null)
  let suppressFolderOpen = $state(false)
  let lastClosedFolderId = $state('')
  let showExportModal = $state(false)
  let showImportModal = $state(false)
  let pendingFolderDelete = $state(null)
  // 待确认的操作：{ message, danger, onconfirm }，替代浏览器原生 confirm
  let pendingConfirm = $state(null)
  let settingsButtonEl = $state(null)
  // 最近一次删除的撤销信息：snapshot 为删除前的站点树，after 为删除后的站点树
  // 用 raw 保持原始引用，才能与 $sites 做引用比较
  let undoState = $state.raw(null)
  let contextMenu = $state({
    open: false,
    x: 0,
    y: 0,
    scope: 'page',
    itemId: '',
    itemType: '',
  })

  // 当前渲染的主题；切换到未加载过的主题时，加载完成前继续显示原主题
  // 首屏的主题已在 main.js 中预先加载，这里能同步拿到
  let activeTheme = $state.raw({ key: resolveThemeKey($theme), component: getLoadedTheme($theme) })

  $effect(() => {
    const key = resolveThemeKey($theme)
    const loaded = getLoadedTheme(key)
    if (loaded) {
      activeTheme = { key, component: loaded }
      return
    }
    let active = true
    loadTheme(key).then((component) => {
      if (active) activeTheme = { key, component }
    })
    return () => {
      active = false
    }
  })
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
  let allowFolder = $derived(!editingSite || isFolderItem(editingSite) || !findFolderByChildId($sites, editingSite.id))
  let showDynamicBackground = $derived($theme !== 'terminal' && $theme !== 'minimal' && !!$activeDynamicBg)

  $effect(() => {
    document.documentElement.classList.toggle('dark', $isDark)
  })

  // 删除后站点又发生了其他变化，旧快照已不可靠，放弃撤销
  $effect(() => {
    if (undoState && $sites !== undoState.after) undoState = null
  })

  const withUndo = (message, mutate) => {
    const snapshot = $sites
    mutate()
    undoState = { id: crypto.randomUUID(), message, snapshot, after: $sites }
  }

  const undoDelete = () => {
    if (!undoState) return
    const { snapshot } = undoState
    undoState = null
    sites.setAll(snapshot)
  }

  const closeEditor = () => {
    closeContextMenu()
    showModal = false
    editingSite = null
  }

  const closeFolderDeleteDialog = () => {
    pendingFolderDelete = null
  }

  // 这两个操作都会刷新页面且无法撤销，按危险操作处理
  const askConfirm = (message, onconfirm) => {
    pendingConfirm = { message, onconfirm }
  }

  const runPendingConfirm = () => {
    const { onconfirm } = pendingConfirm
    pendingConfirm = null
    onconfirm()
  }

  // 弹窗打开时把焦点放进去，键盘用户可以直接操作
  const focusOnMount = (element) => {
    element.focus()
  }

  // Esc 依次关闭最上层的浮层；右键菜单、确认弹窗等自己处理过的按键会标记 defaultPrevented
  const handleWindowKeydown = (event) => {
    if (event.key !== 'Escape' || event.defaultPrevented) return
    if (pendingFolderDelete) {
      closeFolderDeleteDialog()
      return
    }
    if (!$showSettings || showModal || showExportModal || showImportModal || pendingConfirm || contextMenu.open || activeFolderId) return
    $showSettings = false
    settingsButtonEl?.focus()
  }

  const handleAdd = () => {
    closeContextMenu()
    editingSite = null
    showModal = true
  }

  const handleEdit = (site) => {
    closeContextMenu()
    editingSite = site
    showModal = true
  }

  const upsertFolder = (data) => {
    const folderId = isFolderItem(editingSite) ? editingSite.id : data.id
    sites.setAll(upsertFolderInTree($sites, data, folderId))
  }

  const handleSave = (data) => {
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

  const handleOpenFolder = (payload) => {
    closeContextMenu()
    const folder = payload?.folder || payload
    const rect = payload?.rect || null
    if (lastClosedFolderId && lastClosedFolderId === folder?.id) return
    if (suppressFolderOpen) return
    activeFolderId = folder?.id || ''
    activeFolderAnchor = rect
  }

  // 不在这里关闭右键菜单：浮层打开时右键页面上的站点，会先触发浮层收起，再弹出新菜单
  const closeActiveFolder = () => {
    lastClosedFolderId = activeFolderId
    suppressFolderOpen = true
    activeFolderId = ''
    activeFolderAnchor = null
    setTimeout(() => {
      lastClosedFolderId = ''
      suppressFolderOpen = false
    }, 400)
  }

  const releaseFolderSites = (folderId) => {
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

  const deleteFolderWithSites = (folderId) => {
    sites.remove(folderId)
    if (activeFolderId === folderId) {
      activeFolderId = ''
      activeFolderAnchor = null
    }
  }

  const confirmFolderDelete = (mode) => {
    if (!pendingFolderDelete) return

    const { id, name } = pendingFolderDelete
    if (mode === 'release') {
      withUndo($t('folder.deletedToast', name), () => releaseFolderSites(id))
    } else if (mode === 'all') {
      withUndo($t('folder.deletedToast', name), () => deleteFolderWithSites(id))
    }

    closeFolderDeleteDialog()
  }

  const handleDelete = (id) => {
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

    withUndo($t('site.deletedToast', target.name), () => sites.remove(id))
  }

  const handleMoveSite = (siteId, folderId) => {
    sites.setAll(moveSiteToFolder($sites, siteId, folderId))
  }

  // 站点「移动到」子菜单：所在文件夹时可移出，另列出其他文件夹
  const buildMoveChildren = (siteId) => {
    const currentFolder = findFolderByChildId($sites, siteId)
    const children = []
    if (currentFolder) children.push({ id: 'move:', label: $t('site.moveOut'), icon: 'out' })
    const folders = $sites.filter((item) => isFolderItem(item) && item.id !== currentFolder?.id)
    if (children.length > 0 && folders.length > 0) children.push({ separator: true })
    children.push(...folders.map((folder) => ({ id: `move:${folder.id}`, label: folder.name, icon: 'folder' })))
    return children
  }

  const buildContextMenuItems = () => {
    if (contextMenu.scope !== 'item') {
      return [
        { id: 'page-add', label: $t('site.add'), icon: 'add' },
        { id: 'page-refresh-bg', label: $t('settings.bgRefresh'), icon: 'refresh' },
      ]
    }

    const target = findItemById($sites, contextMenu.itemId)
    if (!target) return []

    if (isFolderItem(target)) {
      const isEmpty = getFolderSites(target).length === 0
      return [
        { id: 'item-open-all', label: $t('folder.openAll'), icon: 'tabs', disabled: isEmpty },
        ...(supportsTabGroup ? [{ id: 'item-open-group', label: $t('folder.openAllInGroup'), icon: 'group', disabled: isEmpty }] : []),
        { separator: true },
        { id: 'item-edit', label: $t('folder.editFolder'), icon: 'edit' },
        { separator: true },
        { id: 'item-delete', label: $t('site.delete'), icon: 'delete', danger: true },
      ]
    }

    const moveChildren = buildMoveChildren(target.id)
    return [
      { id: 'item-open-new-tab', label: $t('site.openInNewTab'), icon: 'external' },
      { separator: true },
      { id: 'item-edit', label: $t('site.editBtn'), icon: 'edit' },
      ...(moveChildren.length > 0 ? [{ id: 'item-move', label: $t('site.moveTo'), icon: 'move', children: moveChildren }] : []),
      { separator: true },
      { id: 'item-delete', label: $t('site.delete'), icon: 'delete', danger: true },
    ]
  }

  const shuffleBackground = () => {
    if ($bgConfig.type === 'random') {
      refreshRandomBackground()
      return
    }

    const candidates = []
    const solidList = $isDark ? $solidPresets.dark : $solidPresets.light
    const gradientList = $isDark ? $gradientPresets.dark : $gradientPresets.light
    const dynamicList = $isDark ? $dynamicPresets.dark : $dynamicPresets.light

    solidList.forEach((_, index) => {
      candidates.push({ type: 'solid', id: index })
    })
    gradientList.forEach((_, index) => {
      candidates.push({ type: 'gradient', id: index })
    })
    $bgImageUrls.forEach((_, index) => {
      candidates.push({ type: 'image', id: index })
    })
    dynamicList.forEach((_, index) => {
      candidates.push({ type: 'dynamic', id: index })
    })

    if (candidates.length === 0) return

    let currentKey = ''
    if ($bgConfig.type === 'solid') {
      currentKey = `solid:${$isDark ? $bgConfig.solidDarkId : $bgConfig.solidLightId}`
    } else if ($bgConfig.type === 'gradient') {
      currentKey = `gradient:${$isDark ? $bgConfig.gradientDarkId : $bgConfig.gradientLightId}`
    } else if ($bgConfig.type === 'image') {
      currentKey = `image:${$bgConfig.imageId}`
    } else if ($bgConfig.type === 'dynamic') {
      currentKey = `dynamic:${$isDark ? $bgConfig.dynamicDarkId : $bgConfig.dynamicLightId}`
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
    if (next.type === 'dynamic') {
      bgConfig.set($isDark ? 'dynamicDarkId' : 'dynamicLightId', next.id)
      return
    }
    bgConfig.set('imageId', next.id)
  }

  const closeContextMenu = () => {
    contextMenu = {
      open: false,
      x: 0,
      y: 0,
      scope: 'page',
      itemId: '',
      itemType: '',
    }
  }

  const getTabsApi = () => {
    if (typeof browser !== 'undefined' && browser.tabs?.create) return browser.tabs
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) return chrome.tabs
    return null
  }

  const openUrlsInNewTabs = async (urls) => {
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

  const isContextMenuSuppressed = () => {
    return $theme === 'terminal'
      || showModal
      || showExportModal
      || showImportModal
      || !!pendingFolderDelete
      || !!pendingConfirm
      || $showSettings
  }

  const handlePageContextMenu = (event) => {
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

  const handleContextMenuSelect = (actionId) => {
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
      if (!target) return
      // 编辑弹窗层级低于文件夹浮层，先收起浮层
      if (activeFolderId) closeActiveFolder()
      handleEdit(target)
      return
    }

    if (actionId === 'item-delete') {
      handleDelete(itemId)
      return
    }

    if (actionId === 'item-open-new-tab') {
      const target = findItemById($sites, itemId)
      if (target && !isFolderItem(target)) openUrlsInNewTabs([target.url])
      return
    }

    if (actionId.startsWith('move:')) {
      handleMoveSite(itemId, actionId.slice('move:'.length))
      return
    }

    if (actionId === 'item-open-all' && itemType === 'folder') {
      const target = findItemById($sites, itemId)
      if (!isFolderItem(target)) return
      openUrlsInNewTabs(getFolderSites(target).map((site) => site.url))
      return
    }

    if (actionId === 'item-open-group' && itemType === 'folder') {
      const target = findItemById($sites, itemId)
      if (!isFolderItem(target)) return
      openUrlsInTabGroup(getFolderSites(target).map((site) => site.url), target.name)
    }
  }

</script>

<svelte:window onkeydown={handleWindowKeydown} />

<div class="w-full h-full relative overflow-hidden" oncontextmenu={handlePageContextMenu} role="presentation">
  {#if showDynamicBackground}
    <DynamicBackground preset={$activeDynamicBg} />
  {/if}

  <div class="relative z-10 w-full h-full">
    {#if activeTheme.key === 'terminal'}
      <activeTheme.component dark={$isDark} align={$themeAlign.terminal} />
    {:else if activeTheme.component}
      <activeTheme.component
        sites={$sites}
        dark={$isDark}
        align={$themeAlign[activeTheme.key]}
        onadd={handleAdd}
        onedit={handleEdit}
        ondelete={handleDelete}
        onopenfolder={handleOpenFolder}
      />
    {/if}
  </div>

  {#if contextMenu.open}
    <ContextMenu
      x={contextMenu.x}
      y={contextMenu.y}
      dark={$isDark}
      items={buildContextMenuItems()}
      onselect={handleContextMenuSelect}
      onclose={closeContextMenu}
    />
  {/if}

  {#if undoState}
    {#key undoState.id}
      <UndoToast
        message={undoState.message}
        actionLabel={$t('site.undo')}
        closeLabel={$t('folder.close')}
        dark={$isDark}
        onaction={undoDelete}
        onclose={() => undoState = null}
      />
    {/key}
  {/if}

  <!-- 设置按钮（终端模式隐藏） -->
  {#if $theme !== 'terminal'}
    <button
      class="fixed bottom-4 right-4 z-50 w-9 h-9 rounded-full flex items-center justify-center text-lg
        shadow-lg transition-all not-dark:bg-white not-dark:text-neutral-500 not-dark:hover:bg-neutral-100 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
      bind:this={settingsButtonEl}
      onclick={() => {
        closeContextMenu()
        $showSettings = !$showSettings
      }}
      aria-label={$t('settings.open')}
      aria-expanded={$showSettings}
    >
      <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  {/if}

  <!-- 设置面板只在打开时加载 -->
  {#if $showSettings}
    {#await import('./lib/settings/SettingsPanel.svelte') then { default: SettingsPanel }}
      <SettingsPanel
        onexport={() => showExportModal = true}
        onimport={() => showImportModal = true}
        onconfirm={askConfirm}
      />
    {/await}
  {/if}

  <!-- 弹窗只在用户操作时出现，按需加载 -->
  {#if showModal}
    {#await import('./lib/AddSiteModal.svelte') then { default: AddSiteModal }}
      <AddSiteModal
        site={editingSite}
        siteTree={$sites}
        allowFolder={allowFolder}
        dark={$isDark}
        onsave={handleSave}
        onclose={closeEditor}
      />
    {/await}
  {/if}

  {#if pendingConfirm}
    <ConfirmDialog
      message={pendingConfirm.message}
      confirmLabel={$t('site.confirm')}
      cancelLabel={$t('site.cancel')}
      danger
      dark={$isDark}
      onconfirm={runPendingConfirm}
      oncancel={() => pendingConfirm = null}
    />
  {/if}

  {#if pendingFolderDelete}
    <div
      class="fixed inset-0 z-120 bg-black/55 flex items-center justify-center p-4"
      onclick={(event) => { if (event.target === event.currentTarget) closeFolderDeleteDialog() }}
      role="presentation"
    >
      <!-- 遮罩只负责点击空白处关闭；Esc 由全局按键处理 -->
      <div
        class="w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-4 not-dark:bg-white not-dark:border-black/8 not-dark:text-neutral-900 dark:bg-neutral-900 dark:border-white/10 dark:text-neutral-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="folder-delete-title"
      >
        <div class="space-y-2">
          <h3 id="folder-delete-title" class="text-lg font-semibold">{$t('folder.deleteConfirmTitle', pendingFolderDelete.name)}</h3>
          <p class="text-sm leading-6 not-dark:text-neutral-600 dark:text-neutral-300">
            {$t('folder.deleteConfirmBody', getFolderSites(pendingFolderDelete).length)}
          </p>
        </div>

        <div class="space-y-2">
          <button
            type="button"
            class="w-full rounded-xl px-4 py-3 text-left transition-colors not-dark:bg-neutral-100 not-dark:hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            {@attach focusOnMount}
            onclick={() => confirmFolderDelete('release')}
          >
            <span class="block font-medium">{$t('folder.deleteReleaseAction')}</span>
            <span class="block mt-1 text-xs not-dark:text-neutral-500 dark:text-neutral-400">{$t('folder.deleteReleaseHint')}</span>
          </button>

          <button
            type="button"
            class="w-full rounded-xl px-4 py-3 text-left transition-colors not-dark:bg-red-50 not-dark:text-red-700 not-dark:hover:bg-red-100 dark:bg-red-500/16 dark:text-red-100 dark:hover:bg-red-500/24"
            onclick={() => confirmFolderDelete('all')}
          >
            <span class="block font-medium">{$t('folder.deleteAllAction')}</span>
            <span class="block mt-1 text-xs not-dark:text-red-500 dark:text-red-200/75">{$t('folder.deleteAllHint')}</span>
          </button>
        </div>

        <div class="flex justify-end">
          <button
            type="button"
            class="px-4 py-2 rounded-lg not-dark:text-neutral-600 not-dark:hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
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
    {#await import('./lib/ExportModal.svelte') then { default: ExportModal }}
      <ExportModal dark={$isDark} onclose={() => showExportModal = false} />
    {/await}
  {/if}

  {#if showImportModal}
    {#await import('./lib/ImportModal.svelte') then { default: ImportModal }}
      <ImportModal dark={$isDark} onclose={() => showImportModal = false} />
    {/await}
  {/if}
</div>
