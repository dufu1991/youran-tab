<script>
  import { isDark, bgConfig, solidPresets, gradientPresets, dynamicPresets, getDynamicPreviewStyle, bgImages, bgImageUrls, saveBgImages, randomSourceKeys, BACKGROUND_PRESET_LIMIT } from '../stores.js'
  import { getCachedDynamicThumbnail, getDynamicThumbnailKey, requestDynamicThumbnail } from '../dynamicBackgroundRuntime.js'
  import { t } from '../i18n.js'
  import CheckMark from './CheckMark.svelte'
  import { dashedAddClass, hintClass, optionRowClass, removeBadgeClass, secondaryButtonClass, segmentedButtonClass, selectedRingClass, sectionTitleClass, subTitleClass } from './settingsStyles.js'

  const bgTypes = ['none', 'solid', 'gradient', 'image', 'dynamic', 'random']
  const randomScopes = ['solid', 'gradient', 'image', 'dynamic']
  const defaultRandomScopes = ['solid', 'gradient', 'dynamic']

  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)

  // 预设按明暗分组保存，增删和重置都只作用于当前明暗
  let tone = $derived($isDark ? 'Dark' : 'Light')
  const callForTone = (store, action, ...args) => store[`${action}${tone}`](...args)

  let dynamicThumbnailUrls = $state({})

  const getDynamicThumbnailStyle = (preset) => {
    const thumbnail = dynamicThumbnailUrls[getDynamicThumbnailKey(preset)] || getCachedDynamicThumbnail(preset)
    const fallback = getDynamicPreviewStyle(preset)
    if (!thumbnail) return `${fallback};background-size:cover;background-position:center`
    return `${fallback};background-image:url("${thumbnail}");background-size:cover;background-position:center`
  }

  // 纯色、渐变、动态三种预设共用同一套网格，差别只在数据来源和缩略图样式
  let presetKinds = $derived({
    solid: { store: solidPresets, items: $solidPresets[tone.toLowerCase()], idKey: `solid${tone}Id`, label: $t('settings.bgSolid'), styleOf: (color) => `background:${color}` },
    gradient: { store: gradientPresets, items: $gradientPresets[tone.toLowerCase()], idKey: `gradient${tone}Id`, label: $t('settings.bgGradient'), styleOf: (css) => `background:${css}` },
    dynamic: { store: dynamicPresets, items: $dynamicPresets[tone.toLowerCase()], idKey: `dynamic${tone}Id`, label: $t('settings.bgDynamic'), styleOf: getDynamicThumbnailStyle },
  })

  const regeneratePresets = (kind) => {
    callForTone(kind.store, 'reset')
    bgConfig.set(kind.idKey, 0)
  }

  // 动态背景缩略图需要实际渲染一帧，先用缓存，没有的再排队生成
  $effect(() => {
    if ($bgConfig.type !== 'dynamic') {
      dynamicThumbnailUrls = {}
      return
    }

    const presets = presetKinds.dynamic.items
    const cachedUrls = {}
    let active = true

    presets.forEach((preset) => {
      const cached = getCachedDynamicThumbnail(preset)
      if (cached) cachedUrls[getDynamicThumbnailKey(preset)] = cached
    })
    dynamicThumbnailUrls = cachedUrls

    presets.forEach((preset) => {
      const key = getDynamicThumbnailKey(preset)
      if (cachedUrls[key]) return
      requestDynamicThumbnail(preset).then((url) => {
        if (!active || !url) return
        dynamicThumbnailUrls = { ...dynamicThumbnailUrls, [key]: url }
      })
    })

    return () => {
      active = false
    }
  })

  // 上传的图片按屏幕实际像素缩放（1920 ~ 3840），高分屏上不会发虚，又不会存下过大的原图
  const resizeBgBlob = async (file) => {
    const bitmap = await createImageBitmap(file)
    const screenSide = Math.round(Math.max(screen.width, screen.height) * window.devicePixelRatio)
    const maxSide = Math.min(3840, Math.max(1920, screenSide))
    const scale = Math.min(maxSide / bitmap.width, maxSide / bitmap.height, 1)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
  }

  const handleBgUpload = async (event) => {
    const input = event.currentTarget
    const remaining = BACKGROUND_PRESET_LIMIT - $bgImages.length
    if (remaining <= 0) return
    const newBlobs = await Promise.all(Array.from(input.files || []).slice(0, remaining).map(resizeBgBlob))
    await saveBgImages([...$bgImages, ...newBlobs])
    if ($bgConfig.type !== 'image') bgConfig.set('type', 'image')
    input.value = ''
  }

  const removeBgImage = (index) => saveBgImages($bgImages.filter((_, i) => i !== index))

  const isRandomScopeSelected = (scope) => ($bgConfig.randomScopes || []).includes(scope)

  // 随机范围至少保留一种
  const toggleRandomScope = (scope) => {
    const current = Array.isArray($bgConfig.randomScopes) && $bgConfig.randomScopes.length > 0
      ? $bgConfig.randomScopes
      : defaultRandomScopes
    const next = current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope]
    bgConfig.set('randomScopes', next.length > 0 ? next : current)
  }

  let randomSource = $derived($bgConfig.randomSource || 'generate')
</script>

{#snippet presetGrid(kind)}
  <div class="space-y-2">
    <div class="grid grid-cols-6 gap-1.5">
      {#each kind.items as item, index (index)}
        <div class="relative group">
          <button
            type="button"
            class="w-full aspect-video rounded transition-all {selectedRingClass($bgConfig[kind.idKey] === index)}"
            style={kind.styleOf(item)}
            onclick={() => bgConfig.set(kind.idKey, index)}
            aria-label="{kind.label} {index + 1}"
            aria-pressed={$bgConfig[kind.idKey] === index}
          ></button>
          <button
            type="button"
            class={removeBadgeClass}
            aria-label={$t('site.delete')}
            onclick={() => callForTone(kind.store, 'remove', index)}
          >×</button>
        </div>
      {/each}
      {#if kind.items.length < BACKGROUND_PRESET_LIMIT}
        <button type="button" class={dashedAddClass} aria-label={$t('site.add')} onclick={() => callForTone(kind.store, 'add')}>+</button>
      {/if}
    </div>
    <p class={hintClass}>{$t('settings.bgGeneratedHint')}</p>
    <button type="button" class={secondaryButtonClass} onclick={() => regeneratePresets(kind)}>{$t('settings.bgRegenerate')}</button>
  </div>
{/snippet}

<div>
  <div class={sectionTitleClass}>{$t('settings.background')}</div>
  <div class="settings-separated">
    <div class="settings-segmented settings-segmented-grid">
      {#each bgTypes as bgType (bgType)}
        <button
          type="button"
          class={segmentedButtonClass($bgConfig.type === bgType)}
          aria-pressed={$bgConfig.type === bgType}
          onclick={() => bgConfig.set('type', bgType)}
        >{$t('settings.bg' + capitalize(bgType))}</button>
      {/each}
    </div>

    {#if presetKinds[$bgConfig.type]}
      {@render presetGrid(presetKinds[$bgConfig.type])}
    {/if}

    {#if $bgConfig.type === 'image'}
      <div class="space-y-2">
        <div class="grid grid-cols-6 gap-1.5">
          {#each $bgImageUrls as url, index (url)}
            <div class="relative group">
              <button
                type="button"
                class="w-full aspect-video rounded overflow-hidden transition-all {selectedRingClass($bgConfig.imageId === index)}"
                aria-label="{$t('settings.bgImage')} {index + 1}"
                aria-pressed={$bgConfig.imageId === index}
                onclick={() => bgConfig.set('imageId', index)}
              >
                <img src={url} alt="" class="w-full h-full object-cover" />
              </button>
              <button type="button" class={removeBadgeClass} aria-label={$t('site.delete')} onclick={() => removeBgImage(index)}>×</button>
            </div>
          {/each}
          {#if $bgImageUrls.length < BACKGROUND_PRESET_LIMIT}
            <label class="{dashedAddClass} cursor-pointer focus-within:ring-2 focus-within:ring-neutral-400">
              +
              <input type="file" accept="image/*" multiple class="sr-only" aria-label={$t('settings.bgUpload')} onchange={handleBgUpload} />
            </label>
          {/if}
        </div>
        <p class={hintClass}>{$t('settings.bgImageHint')}</p>
      </div>
    {/if}

    {#if $bgConfig.type === 'random'}
      <div class="space-y-1.5">
        <div class={subTitleClass}>{$t('settings.bgRandomSource')}</div>
        <div class="settings-segmented settings-segmented-row">
          {#each randomSourceKeys as source (source)}
            <button
              type="button"
              class={segmentedButtonClass(randomSource === source)}
              aria-pressed={randomSource === source}
              onclick={() => bgConfig.set('randomSource', source)}
            >{$t('settings.bgRandomSource' + capitalize(source))}</button>
          {/each}
        </div>
        <p class={hintClass}>
          {$t(randomSource === 'presets' ? 'settings.bgRandomSourcePresetsHint' : 'settings.bgRandomSourceGenerateHint')}
        </p>
        <div class="grid grid-cols-2 gap-1.5">
          {#each randomScopes as scope (scope)}
            {@const selected = isRandomScopeSelected(scope)}
            <button
              type="button"
              class="flex items-center gap-1.5 px-2 py-1.5 {optionRowClass(selected)}"
              onclick={() => toggleRandomScope(scope)}
              aria-pressed={selected}
            >
              <CheckMark checked={selected} />
              <span>{$t('settings.bgRandom' + capitalize(scope))}</span>
            </button>
          {/each}
        </div>
        <p class={hintClass}>{$t('settings.bgRandomHint')}</p>
      </div>
    {/if}
  </div>
</div>
