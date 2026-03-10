<script>
  import { t, currentLocale } from '../i18n.js'
  import { doSearch, editMode, showSearchBar, sites as sitesStore } from '../stores.js'
  import { isFolderItem } from '../folders.js'

  let { sites = [], dark = false, align = 'center', onadd, onedit, ondelete, onopenfolder } = $props()

  let dragIndex = $state(-1)
  let dragOverIndex = $state(-1)

  function handleDragStart(e, i) {
    dragIndex = i
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, i) {
    e.preventDefault()
    dragOverIndex = i
  }

  function handleDrop(e, i) {
    e.preventDefault()
    if (dragIndex >= 0 && dragIndex !== i) {
      sitesStore.reorder(dragIndex, i)
    }
    dragIndex = -1
    dragOverIndex = -1
  }

  function handleDragEnd() {
    dragIndex = -1
    dragOverIndex = -1
  }

  let query = $state('')
  function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    doSearch(query.trim())
  }

  function handleSiteClick(e) {
    if ($editMode) e.preventDefault()
  }

  function handleFolderClick(e, folder) {
    e.preventDefault()
    onopenfolder?.({ folder, rect: e.currentTarget?.getBoundingClientRect?.() })
  }

  let dateFmt = $derived(new Date().toLocaleDateString($currentLocale || 'zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  }))
</script>

<div class="w-full h-full flex {align === 'center' ? 'items-center' : align === 'bottom' ? 'items-end pb-24' : 'items-start pt-24'} justify-center
  {dark ? 'bg-neutral-900' : 'bg-white'}">

  {#if $editMode}
    <div class="fixed top-0 left-0 right-0 z-40 flex items-center justify-center gap-3 py-2
      {dark ? 'bg-white/90 text-black' : 'bg-neutral-800/90 text-white'} text-sm backdrop-blur-sm">
      <span>✏️ {$t('settings.editModeHint')}</span>
      <button
        class="px-3 py-0.5 rounded text-xs transition-colors {dark ? 'bg-black/15 hover:bg-black/25' : 'bg-white/20 hover:bg-white/30'}"
        onclick={() => editMode.set(false)}
      >{$t('settings.editModeDone')}</button>
    </div>
  {/if}

  <div class="max-w-md w-full px-8">
    {#if $showSearchBar}
      <form onsubmit={handleSearch} class="mb-8">
        <input type="text" bind:value={query} placeholder={$t('search.placeholder')}
          class="w-full bg-transparent outline-none border-b pb-1 text-sm
            {dark ? 'border-neutral-700 text-neutral-300 placeholder:text-neutral-600' : 'border-neutral-200 text-neutral-600 placeholder:text-neutral-300'}" />
      </form>
    {/if}

    <ul class="space-y-3">
      {#each sites as site, i}
        <li class="group flex items-center justify-between {$editMode && dragOverIndex === i && dragIndex !== i ? (dark ? 'border-l-2 border-white pl-2' : 'border-l-2 border-neutral-800 pl-2') : ''}"
          draggable={$editMode}
          ondragstart={(e) => handleDragStart(e, i)}
          ondragover={(e) => handleDragOver(e, i)}
          ondrop={(e) => handleDrop(e, i)}
          ondragend={handleDragEnd}
          style="{$editMode && dragIndex === i ? 'opacity:0.4' : ''}"
          class:cursor-grab={$editMode}>
          {#if isFolderItem(site)}
            <button
              data-context-item="folder"
              data-item-id={site.id}
              onclick={(e) => handleFolderClick(e, site)}
              class="text-left text-lg hover:underline underline-offset-4
                {dark ? 'text-neutral-200 hover:text-white' : 'text-neutral-800 hover:text-black'}"
            >{site.name}</button>
          {:else}
            <a href={site.url}
              data-context-item="site"
              data-item-id={site.id}
              onclick={handleSiteClick}
              class="text-lg no-underline hover:underline underline-offset-4
                {dark ? 'text-neutral-200 hover:text-white' : 'text-neutral-800 hover:text-black'}"
            >{site.name}</a>
          {/if}
          {#if $editMode}
            <div class="opacity-0 group-hover:opacity-100 flex gap-3 transition-opacity text-xs
              {dark ? 'text-neutral-600' : 'text-neutral-300'}">
              <button class="{dark ? 'hover:text-neutral-300' : 'hover:text-neutral-600'}"
                onclick={() => onedit?.(site)}>{$t('site.editBtn')}</button>
              <button class="hover:text-red-400"
                onclick={() => ondelete?.(site.id)}>{$t('site.delete')}</button>
            </div>
          {/if}
        </li>
      {/each}
    </ul>

    {#if $editMode}
      <button class="mt-6 text-sm {dark ? 'text-neutral-600 hover:text-neutral-400' : 'text-neutral-300 hover:text-neutral-500'}"
        onclick={() => onadd?.()}>{$t('site.addSite')}</button>
    {/if}
  </div>
</div>
