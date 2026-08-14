<script>
  import { theme, themeAlign, defaultConfig, bentoConfig, glassConfig, bubbleConfig } from './stores.js'
  import { t } from './i18n.js'

  let { dark = false } = $props()
</script>

{#key $theme}
  <div>
  <details class="settings-disclosure">
    <summary class="settings-disclosure-summary">
      <span>{$t('settings.themeParameters', $t('theme.' + $theme))}</span>
      <svg class="settings-disclosure-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </summary>

    <div class="settings-separated pt-2">
      <div>
        <div class="text-xs mb-1 {dark ? 'text-neutral-400' : 'text-neutral-500'}">
          {$t('settings.align')}
        </div>
        <div class="settings-segmented settings-segmented-row">
          {#each ['top', 'center', 'bottom'] as align}
            <button
              class="settings-segmented-button transition-all
                {$themeAlign[$theme] === align
                  ? (dark ? 'bg-white text-black' : 'bg-neutral-800 text-white')
                  : 'settings-segmented-button-inactive'}"
              aria-pressed={$themeAlign[$theme] === align}
              onclick={() => themeAlign.set($theme, align)}
            >{$t('align.' + align)}</button>
          {/each}
        </div>
      </div>

      {#if $theme === 'default'}
        <label class="flex items-center gap-2 text-sm">
          <span class="flex-1">{$t('settings.bentoWidth')}</span>
          <input type="range" min="400" max="1400" step="50" value={$defaultConfig.width} oninput={(e) => defaultConfig.set('width', +e.target.value)} class="w-36 accent-white" />
          <span class="w-10 text-right text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$defaultConfig.width}</span>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <span class="flex-1">{$t('settings.bentoCols')}</span>
          <input type="range" min="3" max="8" step="1" value={$defaultConfig.cols} oninput={(e) => defaultConfig.set('cols', +e.target.value)} class="w-36 accent-white" />
          <span class="w-10 text-right text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$defaultConfig.cols}</span>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <span class="flex-1">{$t('settings.bentoRadius')}</span>
          <input type="range" min="0" max="32" step="2" value={$defaultConfig.radius} oninput={(e) => defaultConfig.set('radius', +e.target.value)} class="w-36 accent-white" />
          <span class="w-10 text-right text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$defaultConfig.radius}</span>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <span class="flex-1">{$t('settings.bentoOpacity')}</span>
          <input type="range" min="0" max="100" step="5" value={$defaultConfig.cardOpacity} oninput={(e) => defaultConfig.set('cardOpacity', +e.target.value)} class="w-36 accent-white" />
          <span class="w-10 text-right text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$defaultConfig.cardOpacity}%</span>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <span class="flex-1">{$t('settings.bentoBlur')}</span>
          <input type="range" min="0" max="20" step="1" value={$defaultConfig.cardBlur} oninput={(e) => defaultConfig.set('cardBlur', +e.target.value)} class="w-36 accent-white" />
          <span class="w-10 text-right text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$defaultConfig.cardBlur}</span>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <span class="flex-1">{$t('settings.bentoIconSize')}</span>
          <input type="range" min="24" max="64" step="2" value={$defaultConfig.iconSize} oninput={(e) => defaultConfig.set('iconSize', +e.target.value)} class="w-36 accent-white" />
          <span class="w-10 text-right text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$defaultConfig.iconSize}</span>
        </label>
      {:else if $theme === 'bento'}
        <label class="flex items-center gap-2 text-sm">
          <span class="flex-1">{$t('settings.bentoWidth')}</span>
          <input type="range" min="400" max="1400" step="50" value={$bentoConfig.width} oninput={(e) => bentoConfig.set('width', +e.target.value)} class="w-36 accent-white" />
          <span class="w-10 text-right text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$bentoConfig.width}</span>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <span class="flex-1">{$t('settings.bentoGap')}</span>
          <input type="range" min="4" max="32" step="2" value={$bentoConfig.gap} oninput={(e) => bentoConfig.set('gap', +e.target.value)} class="w-36 accent-white" />
          <span class="w-10 text-right text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$bentoConfig.gap}</span>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <span class="flex-1">{$t('settings.bentoRadius')}</span>
          <input type="range" min="0" max="32" step="2" value={$bentoConfig.radius} oninput={(e) => bentoConfig.set('radius', +e.target.value)} class="w-36 accent-white" />
          <span class="w-10 text-right text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$bentoConfig.radius}</span>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <span class="flex-1">{$t('settings.bentoOpacity')}</span>
          <input type="range" min="0" max="100" step="5" value={$bentoConfig.cardOpacity} oninput={(e) => bentoConfig.set('cardOpacity', +e.target.value)} class="w-36 accent-white" />
          <span class="w-10 text-right text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$bentoConfig.cardOpacity}%</span>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <span class="flex-1">{$t('settings.bentoBlur')}</span>
          <input type="range" min="0" max="20" step="1" value={$bentoConfig.cardBlur} oninput={(e) => bentoConfig.set('cardBlur', +e.target.value)} class="w-36 accent-white" />
          <span class="w-10 text-right text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$bentoConfig.cardBlur}</span>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <span class="flex-1">{$t('settings.bentoIconSize')}</span>
          <input type="range" min="24" max="64" step="2" value={$bentoConfig.iconSize} oninput={(e) => bentoConfig.set('iconSize', +e.target.value)} class="w-36 accent-white" />
          <span class="w-10 text-right text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$bentoConfig.iconSize}</span>
        </label>
        <label class="flex items-center justify-between cursor-pointer">
          <span class="text-sm">{$t('settings.bentoFixed')}</span>
          <button
            class="relative w-9 h-5 rounded-full transition-colors {$bentoConfig.fixed ? (dark ? 'bg-neutral-300' : 'bg-neutral-800') : (dark ? 'bg-neutral-600' : 'bg-neutral-300')}"
            onclick={() => bentoConfig.set('fixed', !$bentoConfig.fixed)}
            role="switch"
            aria-checked={$bentoConfig.fixed}
            aria-label={$t('settings.bentoFixed')}
          >
            <span class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform {$bentoConfig.fixed ? 'translate-x-4 ' + (dark ? 'bg-neutral-900' : 'bg-white') : 'bg-white'}"></span>
          </button>
        </label>
        {#if $bentoConfig.fixed}
          <label class="flex items-center gap-2 text-sm">
            <span class="flex-1">{$t('settings.bentoCols')}</span>
            <input type="range" min="3" max="8" step="1" value={$bentoConfig.cols} oninput={(e) => bentoConfig.set('cols', +e.target.value)} class="w-36 accent-white" />
            <span class="w-10 text-right text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$bentoConfig.cols}</span>
          </label>
        {/if}
      {:else if $theme === 'glass'}
        <label class="flex items-center gap-2 text-sm">
          <span class="flex-1">{$t('settings.glassCols')}</span>
          <input type="range" min="1" max="4" step="1" value={$glassConfig.cols} oninput={(e) => glassConfig.set('cols', +e.target.value)} class="w-36 accent-white" />
          <span class="w-10 text-right text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$glassConfig.cols}</span>
        </label>
      {:else if $theme === 'bubble'}
        <div>
          <div class="text-xs mb-1 {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$t('settings.bubbleLayout')}</div>
          <div class="settings-segmented settings-segmented-row">
            {#each ['fixed', 'random'] as layoutMode}
              <button
                class="settings-segmented-button transition-all
                  {$bubbleConfig.layout === layoutMode
                    ? (dark ? 'bg-white text-black' : 'bg-neutral-800 text-white')
                    : 'settings-segmented-button-inactive'}"
                aria-pressed={$bubbleConfig.layout === layoutMode}
                onclick={() => bubbleConfig.set('layout', layoutMode)}
              >{$t('settings.bubble' + layoutMode.charAt(0).toUpperCase() + layoutMode.slice(1))}</button>
            {/each}
          </div>
        </div>
        <label class="flex items-center gap-2 text-sm">
          <span class="flex-1">{$t('settings.bubbleSize')}</span>
          <input type="range" min="48" max="120" step="4" value={$bubbleConfig.size} oninput={(e) => bubbleConfig.set('size', +e.target.value)} class="w-36 accent-white" />
          <span class="w-10 text-right text-xs {dark ? 'text-neutral-400' : 'text-neutral-500'}">{$bubbleConfig.size}</span>
        </label>
      {/if}
    </div>
  </details>
  </div>
{/key}
