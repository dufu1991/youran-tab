<script>
  import { showSearchBar, searchConfig } from '../stores.js'
  import { SEARCH_ENGINES, AI_PROVIDERS } from '../searchProviders.js'
  import { t } from '../i18n.js'
  import SettingSwitch from './SettingSwitch.svelte'
  import CheckMark from './CheckMark.svelte'
  import { hintClass, optionRowClass, sectionTitleClass, segmentedButtonClass, subTitleClass } from './settingsStyles.js'

  const toggleIn = (list, id) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id])

  // 搜索引擎至少保留一个；AI 提问可以全部关闭
  const toggleSearchEngine = (id) => {
    const next = toggleIn($searchConfig.enabledEngines, id)
    if (next.length === 0) return
    searchConfig.set('enabledEngines', next)
  }

  const toggleAiProvider = (id) => {
    searchConfig.set('enabledAi', toggleIn($searchConfig.enabledAi, id))
  }
</script>

{#snippet providerList(title, providers, enabledIds, defaultId, ontoggle, onsetdefault, hint)}
  <div>
    <details class="settings-disclosure">
      <summary class="settings-disclosure-summary">
        <span>{title}</span>
        <svg class="settings-disclosure-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <div class="pt-1">
        <div class="space-y-1.5">
          {#each providers as provider (provider.id)}
            {@const enabled = enabledIds.includes(provider.id)}
            {@const isDefault = defaultId === provider.id}
            <div class="flex items-center {optionRowClass(enabled)}">
              <button
                type="button"
                class="flex items-center gap-1.5 px-2 py-1.5 flex-1 min-w-0 text-left"
                aria-pressed={enabled}
                onclick={() => ontoggle(provider.id)}
              >
                <CheckMark checked={enabled} />
                {#if provider.logo}
                  <img src={provider.logo} alt="" class="w-3.5 h-3.5 object-contain rounded-sm bg-white shrink-0" />
                {/if}
                <span class="truncate">{provider.name || $t(provider.nameKey)}</span>
              </button>
              {#if enabled}
                <button
                  type="button"
                  class="px-2 py-1.5 shrink-0 transition-colors {isDefault ? 'text-amber-500' : 'text-neutral-400 hover:text-amber-500 dark:text-neutral-500 dark:hover:text-amber-400'}"
                  title={$t('settings.searchSetDefault')}
                  aria-label={$t('settings.searchSetDefault')}
                  aria-pressed={isDefault}
                  onclick={() => onsetdefault(provider.id)}
                >
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill={isDefault ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              {/if}
            </div>
          {/each}
        </div>
        {#if hint}
          <p class="{hintClass} mt-2">{hint}</p>
        {/if}
      </div>
    </details>
  </div>
{/snippet}

<div>
  <div class={sectionTitleClass}>{$t('settings.search')}</div>
  <SettingSwitch class="mb-1" label={$t('settings.showSearch')} checked={$showSearchBar} onchange={(value) => showSearchBar.set(value)} />

  {#if $showSearchBar}
    <div class="settings-separated mt-2">
      <div>
        <div class={subTitleClass}>{$t('settings.searchDefault')}</div>
        <div class="settings-segmented settings-segmented-row">
          {#each ['search', 'ai'] as searchMode (searchMode)}
            <button
              type="button"
              class={segmentedButtonClass($searchConfig.defaultMode === searchMode)}
              aria-pressed={$searchConfig.defaultMode === searchMode}
              onclick={() => searchConfig.set('defaultMode', searchMode)}
            >{$t(searchMode === 'search' ? 'search.groupSearch' : 'search.groupAi')}</button>
          {/each}
        </div>
      </div>

      {@render providerList(
        $t('settings.searchEngines'),
        SEARCH_ENGINES,
        $searchConfig.enabledEngines,
        $searchConfig.defaultEngine,
        toggleSearchEngine,
        (id) => searchConfig.set('defaultEngine', id),
        '',
      )}

      {@render providerList(
        $t('settings.searchAi'),
        AI_PROVIDERS,
        $searchConfig.enabledAi,
        $searchConfig.defaultAi,
        toggleAiProvider,
        (id) => searchConfig.set('defaultAi', id),
        $t('settings.searchAiHint'),
      )}
    </div>
  {/if}
</div>
