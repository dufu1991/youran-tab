<script>
  import { theme, mode, isDark, showSettings, editMode, showSiteTitle, resetAllSettings } from '../stores.js'
  import { t, localeSetting, supportedLocales, localeNames } from '../i18n.js'
  import { themeKeys } from '../themes/index.js'
  import { CHANGELOG_URL, getAppVersion } from '../appInfo.js'
  import { clearIconCache } from '../iconCache.js'
  import ThemeSettings from '../ThemeSettings.svelte'
  import SearchSettings from './SearchSettings.svelte'
  import BackgroundSettings from './BackgroundSettings.svelte'
  import SettingSwitch from './SettingSwitch.svelte'
  import { dividerClass, ghostButtonClass, sectionTitleClass, segmentedButtonClass } from './settingsStyles.js'

  // onconfirm(message, action)：危险操作交给外层弹出确认框
  let { onexport, onimport, onconfirm } = $props()

  const modes = ['auto', 'light', 'dark']
  const appVersion = getAppVersion()

  let isTerminal = $derived($theme === 'terminal')
  // 极简主题没有背景，终端主题有自己的配色
  let showBackground = $derived($theme !== 'terminal' && $theme !== 'minimal')
  let showTitleOption = $derived($theme === 'default' || $theme === 'bento' || $theme === 'sketch')

  const openChangelog = () => {
    window.open(CHANGELOG_URL, '_blank', 'noopener,noreferrer')
  }

  const clearIcons = () => {
    onconfirm?.($t('settings.clearIconCacheConfirm'), () => clearIconCache().finally(() => location.reload()))
  }

  const resetSettings = () => {
    onconfirm?.($t('settings.resetConfirm'), resetAllSettings)
  }
</script>

<div class="fixed inset-0 z-90" onclick={(event) => { if (event.target === event.currentTarget) $showSettings = false }} role="presentation">
  <div
    class="settings-panel fixed bottom-14 right-4 z-91 rounded-xl shadow-2xl p-4 space-y-3 overflow-y-auto bg-white text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
    role="dialog"
    aria-label={$t('settings.open')}
    data-no-context-menu
  >
    <!-- 主题 + 当前主题参数 + 模式 + 语言 -->
    <div class="settings-separated">
      <div>
        <div class={sectionTitleClass}>{$t('settings.theme')}</div>
        <div class="settings-segmented settings-segmented-grid settings-segmented-cols-4">
          {#each themeKeys as key (key)}
            <button type="button" class={segmentedButtonClass($theme === key)} aria-pressed={$theme === key} onclick={() => theme.set(key)}>
              {$t('theme.' + key)}
            </button>
          {/each}
        </div>
      </div>
      <ThemeSettings dark={$isDark} />
      <div>
        <div class={sectionTitleClass}>{$t('settings.mode')}</div>
        <div class="settings-segmented settings-segmented-row">
          {#each modes as value (value)}
            <button type="button" class={segmentedButtonClass($mode === value)} aria-pressed={$mode === value} onclick={() => mode.set(value)}>
              {$t('mode.' + value)}
            </button>
          {/each}
        </div>
      </div>
      <div>
        <label class="block {sectionTitleClass}" for="settings-language">{$t('settings.language')}</label>
        <select
          id="settings-language"
          class="w-full px-2 py-1.5 rounded text-sm border bg-white border-neutral-200 dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
          value={$localeSetting}
          onchange={(event) => localeSetting.set(event.currentTarget.value)}
        >
          <option value="auto">{$t('settings.langAuto')}</option>
          {#each supportedLocales as locale (locale)}
            <option value={locale}>{localeNames[locale]}</option>
          {/each}
        </select>
      </div>
    </div>

    {#if !isTerminal}
      <hr class={dividerClass} />
      <SearchSettings />
    {/if}

    {#if showBackground}
      <hr class={dividerClass} />
      <BackgroundSettings />
    {/if}

    {#if !isTerminal}
      <hr class={dividerClass} />
      <div>
        <div class={sectionTitleClass}>{$t('settings.options')}</div>
        <div class="settings-separated">
          {#if showTitleOption}
            <SettingSwitch label={$t('settings.showTitle')} checked={$showSiteTitle} onchange={(value) => showSiteTitle.set(value)} />
          {/if}
          <SettingSwitch label={$t('settings.editMode')} checked={$editMode} onchange={(value) => editMode.set(value)} />
        </div>
      </div>
    {/if}

    <hr class={dividerClass} />
    <div class="space-y-2">
      <div class="text-xs uppercase tracking-wider text-neutral-400">{$t('settings.update')}</div>
      <div class="rounded-lg px-3 py-2 flex items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-700/50">
        <p class="min-w-0 flex-1 text-xs leading-5 whitespace-normal text-neutral-600 dark:text-neutral-300">
          {$t('settings.updateCurrent', appVersion)}
        </p>
        <button
          type="button"
          class="shrink-0 text-xs underline underline-offset-3 decoration-dotted transition-colors text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
          onclick={openChangelog}
        >{$t('settings.updateChangelog')} ↗</button>
      </div>
    </div>

    <hr class={dividerClass} />
    <div class="settings-separated">
      <div class="flex gap-2">
        <button type="button" class={ghostButtonClass} onclick={() => onexport?.()}>{$t('settings.exportSites')}</button>
        <button type="button" class={ghostButtonClass} onclick={() => onimport?.()}>{$t('settings.importSites')}</button>
      </div>
      <div class="flex gap-2">
        <button type="button" class={ghostButtonClass} onclick={clearIcons}>{$t('settings.clearIconCache')}</button>
        <button type="button" class={ghostButtonClass} onclick={resetSettings}>{$t('settings.resetSettings')}</button>
      </div>
    </div>
  </div>
</div>
