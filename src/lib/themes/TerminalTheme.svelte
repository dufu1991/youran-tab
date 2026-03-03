<script>
  import { onMount } from 'svelte'
  import { sites, theme, mode, showSettings, terminalConfig, doSearch, clickCounts } from '../stores.js'
  import { t, localeSetting, supportedLocales, localeNames } from '../i18n.js'
  import { buildExportData, downloadJson, getExportFilename, detectImportData, checkVersionMatch, getCurrentVersion, importSitesData, importSettingsData } from '../dataTransfer.js'

  let { dark = false, align = 'top' } = $props()

  let input = $state('')
  let history = $state([])
  let historyEl = $state(null)
  let inputEl = $state(null)
  let containerEl = $state(null)
  let initialized = $state(false)

  const colorPresets = {
    green:  { dark: ['text-green-400','text-green-600','border-green-900','caret-green-400','hover:text-green-200'],
              light: ['text-emerald-700','text-emerald-500','border-emerald-200','caret-emerald-700','hover:text-emerald-900'] },
    amber:  { dark: ['text-amber-400','text-amber-600','border-amber-900','caret-amber-400','hover:text-amber-200'],
              light: ['text-amber-700','text-amber-500','border-amber-200','caret-amber-700','hover:text-amber-900'] },
    blue:   { dark: ['text-sky-400','text-sky-600','border-sky-900','caret-sky-400','hover:text-sky-200'],
              light: ['text-sky-700','text-sky-500','border-sky-200','caret-sky-700','hover:text-sky-900'] },
    cyan:   { dark: ['text-cyan-400','text-cyan-600','border-cyan-900','caret-cyan-400','hover:text-cyan-200'],
              light: ['text-teal-700','text-teal-500','border-teal-200','caret-teal-700','hover:text-teal-900'] },
    purple: { dark: ['text-violet-400','text-violet-600','border-violet-900','caret-violet-400','hover:text-violet-200'],
              light: ['text-violet-700','text-violet-500','border-violet-200','caret-violet-700','hover:text-violet-900'] },
    pink:   { dark: ['text-pink-400','text-pink-600','border-pink-900','caret-pink-400','hover:text-pink-200'],
              light: ['text-pink-700','text-pink-500','border-pink-200','caret-pink-700','hover:text-pink-900'] },
    red:    { dark: ['text-rose-400','text-rose-600','border-rose-900','caret-rose-400','hover:text-rose-200'],
              light: ['text-rose-700','text-rose-500','border-rose-200','caret-rose-700','hover:text-rose-900'] },
    orange: { dark: ['text-orange-400','text-orange-600','border-orange-900','caret-orange-400','hover:text-orange-200'],
              light: ['text-orange-700','text-orange-500','border-orange-200','caret-orange-700','hover:text-orange-900'] },
    mono:   { dark: ['text-neutral-300','text-neutral-500','border-neutral-700','caret-neutral-300','hover:text-white'],
              light: ['text-neutral-700','text-neutral-400','border-neutral-300','caret-neutral-700','hover:text-black'] },
  }
  const colorNames = Object.keys(colorPresets)

  const isMac = navigator.platform?.toUpperCase().includes('MAC') || navigator.userAgent?.includes('Mac')
  const promptPresets = ['$', '>', '#', '%', '❯', '→', 'λ', '~', '➜', ...(isMac ? ['\uF8FF'] : [])]

  $effect(() => {
    if ($t && !initialized) { history = []; initialized = true }
  })

  $effect(() => {
    // 滚动到底部
    if (historyEl) historyEl.scrollTop = historyEl.scrollHeight
  })

  onMount(() => {
    inputEl?.focus()

    function onKey(e) {
      if (e.target === inputEl || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key.length === 1 || e.key === 'Backspace') inputEl?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function push(...lines) { history = [...history, ...lines] }
  function getTime() { return new Date().toLocaleTimeString('zh-CN', { hour12: false }) }

  let activeColor = $derived(selectMode?.cmd === 'color' ? selectMode.options[selectMode.index] : $terminalConfig.color)
  let preset = $derived(colorPresets[activeColor] || colorPresets.green)
  let colors = $derived(dark ? preset.dark : preset.light)
  let fg = $derived(colors[0])
  let fgDim = $derived(colors[1])
  let border = $derived(colors[2])
  let caret = $derived(colors[3])
  let linkHover = $derived(colors[4])
  let bg = $derived(dark ? 'bg-neutral-900' : 'bg-stone-50')
  let promptChar = $derived($terminalConfig.prompt)
  let termWidth = $derived($terminalConfig.width)
  let cursorStyle = $derived(selectMode?.cmd === 'cursor' ? selectMode.options[selectMode.index] : ($terminalConfig.cursor || 'bar'))

  const cursorTypes = ['bar', 'wide', 'block', 'underline']

  function isFullWidth(ch) {
    if (!ch) return false
    const c = ch.codePointAt(0)
    return (c >= 0x1100 && c <= 0x115F) || (c >= 0x2E80 && c <= 0x303E) ||
      (c >= 0x3040 && c <= 0x33BF) || (c >= 0x4E00 && c <= 0x9FFF) ||
      (c >= 0x3400 && c <= 0x4DBF) || (c >= 0xAC00 && c <= 0xD7AF) ||
      (c >= 0xF900 && c <= 0xFAFF) || (c >= 0xFE30 && c <= 0xFE4F) ||
      (c >= 0xFF01 && c <= 0xFF60) || (c >= 0xFFE0 && c <= 0xFFE6) ||
      (c >= 0x20000 && c <= 0x2FA1F)
  }

  function getVisualOffset(text, pos) {
    let offset = 0
    for (let i = 0; i < pos; i++) offset += isFullWidth(text[i]) ? 2 : 1
    return offset
  }

  let cursorVisualLeft = $derived(getVisualOffset(input, input.length))

  // 选择模式：输入命令回车后，显示可选列表
  let selectMode = $state(null) // { cmd, options, index, current }

  $effect(() => {
    if (selectMode && containerEl) {
      requestAnimationFrame(() => containerEl.focus())
    }
  })

  const optionsMap = {
    theme: ['default', 'bento', 'terminal', 'minimal', 'glass', 'bubble', 'pixel', 'sketch'],
    mode: ['auto', 'light', 'dark'],
    color: colorNames,
    lang: ['auto', ...supportedLocales],
    prompt: promptPresets,
    cursor: cursorTypes,
  }

  // 获取命令当前值
  function getCurrentValue(cmd) {
    if (cmd === 'theme') return $theme
    if (cmd === 'mode') return $mode
    if (cmd === 'color') return $terminalConfig.color
    if (cmd === 'lang') return $localeSetting === 'auto' ? 'auto' : $localeSetting
    if (cmd === 'prompt') return promptChar
    if (cmd === 'cursor') return cursorStyle
    return ''
  }

  // 获取选项的显示文本
  function getOptionLabel(cmd, val) {
    if (cmd === 'theme') return $t('theme.' + val) || val
    if (cmd === 'mode') return $t('mode.' + val) || val
    if (cmd === 'cursor') return $t('cursor.' + val) || val
    if (cmd === 'color') return $t('color.' + val) || val
    if (cmd === 'lang') return val === 'auto' ? $t('settings.langAuto') : (localeNames[val] || val)
    return val
  }

  // 执行选择
  function applySelect(cmd, val) {
    if (cmd === 'theme') { theme.set(val); push($t('terminal.themeSet', val)) }
    else if (cmd === 'mode') { mode.set(val); push($t('terminal.modeSet', val)) }
    else if (cmd === 'color') { terminalConfig.setColor(val); push($t('terminal.colorSet', val)) }
    else if (cmd === 'lang') { localeSetting.set(val); initialized = false; push($t('terminal.langSet', val === 'auto' ? 'auto' : localeNames[val] || val)) }
    else if (cmd === 'prompt') { terminalConfig.setPrompt(val); push($t('terminal.promptSet', val)) }
    else if (cmd === 'cursor') { terminalConfig.setCursor(val); push($t('terminal.cursorSet', val)) }
  }

  const reserved = ['h','ls','add','edit','rm','theme','mode','lang','set','clear','prompt','color','s','width','cursor','export','import']

  function handleCommand() {
    const raw = input.trim()
    const cmd = raw.toLowerCase()
    const args = raw.split(/\s+/)
    push(`${promptChar} ${raw}`)
    input = ''

    if (!cmd) return

    if (/^\d+$/.test(cmd)) {
      const idx = parseInt(cmd)
      const s = $sites
      if (s[idx]) window.open(s[idx].url, '_self')
      else push($t('terminal.notFound', idx))
      return
    }

    const matchedSite = $sites.find(s =>
      s.name.toLowerCase() === cmd || s.url.toLowerCase().includes(cmd)
    )
    if (matchedSite && !reserved.includes(args[0].toLowerCase())) {
      window.open(matchedSite.url, '_self')
      return
    }

    if (cmd === 'h') {
      const curLang = $localeSetting === 'auto' ? 'auto' : $localeSetting

      const nLabel = $t('terminal.nLabel')
      const rows = [
        ['<n>/name/url', $t('terminal.openDesc'), ''],
        ['ls', $t('terminal.lsDesc'), ''],
        ['add <url> <name>', $t('terminal.addDesc'), ''],
        ['edit <n> <url> <name>', $t('terminal.editDesc'), ''],
        ['rm <n>', $t('terminal.rmDesc'), ''],
        ['s <keyword>', $t('terminal.searchDesc'), ''],
        ['theme', $t('terminal.themeDesc'), $theme],
        ['mode', $t('terminal.modeDesc'), $mode],
        ['lang', $t('terminal.langDesc'), curLang],
        ['color', $t('terminal.colorDesc'), $terminalConfig.color],
        ['cursor', $t('terminal.cursorDesc'), cursorStyle],
        ['prompt', $t('terminal.promptDesc'), promptChar],
        ['width <px|full>', $t('terminal.widthDesc'), String($terminalConfig.width || 'full')],
        ['set', $t('terminal.setDesc'), ''],
        ['export [all|sites|settings]', $t('terminal.exportDesc'), ''],
        ['import', $t('terminal.importDesc'), ''],
        ['clear', $t('terminal.clearDesc'), ''],
      ]

      const c1 = Math.max(...rows.map(r => r[0].length)) + 2
      const c2 = Math.max(...rows.map(r => r[1].length)) + 2

      push($t('terminal.help'))
      for (const [cmd, desc, val] of rows) {
        let row = '  ' + cmd.padEnd(c1) + desc.padEnd(c2)
        if (val) row += '[' + val + ']'
        push(row)
      }
      push('')
      push('  ' + nLabel)
    } else if (cmd === 'ls') {
      const s = $sites
      if (s.length === 0) { push($t('terminal.empty')); return }
      s.forEach((s, i) => push(`  [${i}] ${s.name} — ${s.url}`))

    } else if (cmd.startsWith('open ')) {
      const idx = parseInt(args[1])
      const s = $sites
      if (s[idx]) window.open(s[idx].url, '_self')
      else push($t('terminal.notFound', idx))

    } else if (args[0].toLowerCase() === 'add') {
      if (args.length < 3) { push($t('terminal.addUsage')); return }
      let url = args[1]
      const name = args.slice(2).join(' ')
      if (!/^https?:\/\//.test(url)) url = 'https://' + url
      sites.add({ name, url })
      push($t('terminal.added', name))

    } else if (args[0].toLowerCase() === 'edit') {
      const idx = parseInt(args[1])
      const s = $sites
      if (!s[idx]) { push($t('terminal.notFound', idx)); return }
      if (args.length < 4) { push($t('terminal.editUsage')); return }
      let url = args[2]
      const name = args.slice(3).join(' ')
      if (!/^https?:\/\//.test(url)) url = 'https://' + url
      sites.edit(s[idx].id, { name, url })
      push($t('terminal.edited', name))

    } else if (cmd.startsWith('rm ')) {
      const idx = parseInt(args[1])
      const s = $sites
      if (s[idx]) {
        const name = s[idx].name
        sites.remove(s[idx].id)
        push($t('terminal.deleted', name))
      } else push($t('terminal.notFound', idx))

    } else if (args[0].toLowerCase() === 'theme') {
      const val = args[1]?.toLowerCase()
      const valid = ['default', 'bento', 'terminal', 'minimal', 'glass', 'bubble', 'pixel', 'sketch']
      if (val && valid.includes(val)) {
        theme.set(val); push($t('terminal.themeSet', val))
      } else {
        const cur = getCurrentValue('theme')
        selectMode = { cmd: 'theme', options: valid, index: valid.indexOf(cur) >= 0 ? valid.indexOf(cur) : 0 }
      }

    } else if (args[0].toLowerCase() === 'mode') {
      const val = args[1]?.toLowerCase()
      const valid = ['auto', 'light', 'dark']
      if (val && valid.includes(val)) {
        mode.set(val); push($t('terminal.modeSet', val))
      } else {
        const cur = getCurrentValue('mode')
        selectMode = { cmd: 'mode', options: valid, index: valid.indexOf(cur) >= 0 ? valid.indexOf(cur) : 0 }
      }

    } else if (args[0].toLowerCase() === 'lang') {
      const val = args[1]
      if (val && (supportedLocales.includes(val) || val === 'auto')) {
        localeSetting.set(val); initialized = false
        push($t('terminal.langSet', val === 'auto' ? 'auto' : localeNames[val]))
      } else {
        const valid = ['auto', ...supportedLocales]
        const cur = getCurrentValue('lang')
        selectMode = { cmd: 'lang', options: valid, index: valid.indexOf(cur) >= 0 ? valid.indexOf(cur) : 0 }
      }

    } else if (args[0].toLowerCase() === 'prompt') {
      const val = args.slice(1).join(' ')
      if (val) {
        terminalConfig.setPrompt(val); push($t('terminal.promptSet', val))
      } else {
        const cur = getCurrentValue('prompt')
        selectMode = { cmd: 'prompt', options: promptPresets, index: promptPresets.indexOf(cur) >= 0 ? promptPresets.indexOf(cur) : 0 }
      }

    } else if (args[0].toLowerCase() === 'color') {
      const val = args[1]?.toLowerCase()
      if (val && colorNames.includes(val)) {
        terminalConfig.setColor(val); push($t('terminal.colorSet', val))
      } else {
        const cur = getCurrentValue('color')
        selectMode = { cmd: 'color', options: colorNames, index: colorNames.indexOf(cur) >= 0 ? colorNames.indexOf(cur) : 0 }
      }

    } else if (args[0].toLowerCase() === 's') {
      const query = raw.slice(args[0].length).trim()
      if (!query) { push($t('terminal.searchUsage')); return }
      doSearch(query)

    } else if (args[0].toLowerCase() === 'width') {
      const val = args[1]
      if (!val) {
        push($t('terminal.widthUsage'))
        push($t('terminal.widthCurrent') + ' ' + $terminalConfig.width + 'px')
      } else if (val === 'full' || val === '0') {
        terminalConfig.setWidth(0)
        push($t('terminal.widthSet', 'full'))
      } else {
        const n = parseInt(val)
        if (n > 0) {
          terminalConfig.setWidth(n)
          push($t('terminal.widthSet', n + 'px'))
        } else {
          push($t('terminal.widthUsage'))
        }
      }

    } else if (args[0].toLowerCase() === 'cursor') {
      const val = args[1]?.toLowerCase()
      if (val && cursorTypes.includes(val)) {
        terminalConfig.setCursor(val); push($t('terminal.cursorSet', val))
      } else {
        const cur = getCurrentValue('cursor')
        selectMode = { cmd: 'cursor', options: cursorTypes, index: cursorTypes.indexOf(cur) >= 0 ? cursorTypes.indexOf(cur) : 0 }
      }

    } else if (cmd === 'set') {
      $showSettings = true
    } else if (cmd === 'clear') {
      history = []

    } else if (cmd === 'export') {
      const subCmd = args[1]?.toLowerCase() || 'all'
      const validTypes = ['all', 'sites', 'settings']
      if (!validTypes.includes(subCmd)) {
        push($t('terminal.exportUsage'))
        return
      }
      const data = buildExportData(subCmd, $sites, $clickCounts)
      downloadJson(data, getExportFilename(subCmd))
      const count = data.sites?.length || 0
      if (subCmd === 'sites') push($t('terminal.exportedSites', count))
      else if (subCmd === 'settings') push($t('terminal.exportedSettings'))
      else push($t('terminal.exportedAll', count))

    } else if (cmd === 'import') {
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
          push($t('terminal.importError'))
          return
        }
        const detected = detectImportData(parsed)
        if (!detected) { push($t('terminal.importError')); return }
        if (detected.type !== 'legacy' && !checkVersionMatch(detected.version)) {
          push($t('terminal.versionMismatch', detected.version, getCurrentVersion()))
          return
        }
        if (detected.hasSites) {
          const siteItems = detected.type === 'legacy' ? detected.data : detected.data.sites
          const count = importSitesData(siteItems, sites, $sites, clickCounts)
          push($t('terminal.importedSites', count))
        }
        if (detected.hasSettings) {
          importSettingsData(detected.data.settings)
          push($t('terminal.importedSettings'))
          push($t('terminal.reloading'))
          setTimeout(() => location.reload(), 1500)
        }
      }
      fileInput.click()

    } else {
      push($t('terminal.unknown', args[0]))
    }
  }

  function handleKeydown(e) {
    if (e.isComposing) return
    if (selectMode) {
      e.preventDefault()
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        selectMode = { ...selectMode, index: (selectMode.index + 1) % selectMode.options.length }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        selectMode = { ...selectMode, index: (selectMode.index - 1 + selectMode.options.length) % selectMode.options.length }
      } else if (e.key === 'Enter') {
        const val = selectMode.options[selectMode.index]
        applySelect(selectMode.cmd, val)
        selectMode = null
        requestAnimationFrame(() => inputEl?.focus())
      } else if (e.key === 'Escape') {
        selectMode = null
        requestAnimationFrame(() => inputEl?.focus())
      }
      return
    }
    if (e.key === 'Enter') {
      handleCommand()
    }
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="w-full h-full {bg} flex justify-center overflow-hidden"
  bind:this={containerEl}
  onclick={() => inputEl?.focus()}
  onkeydown={(e) => {
    if (e.target === inputEl) return
    if (selectMode) { handleKeydown(e); return }
    if (e.key.length === 1) inputEl?.focus()
  }}
  role="application" tabindex="-1">
<div class="{fg} font-mono p-8 flex flex-col {align === 'center' ? 'justify-center' : align === 'bottom' ? 'justify-end' : ''} w-full h-full overflow-y-auto"
  style="{termWidth > 0 ? `max-width: ${termWidth}px;` : ''}" bind:this={historyEl}>

  <div class="flex flex-wrap gap-x-8 gap-y-2 mb-6 text-sm">
    {#each $sites as site, i}
      <a href={site.url} class="{fg} {linkHover} hover:underline">[{i}] {site.name}</a>
    {/each}
  </div>

  <div class="{border} border-t my-3"></div>

  <div class="text-sm space-y-1 mb-4">
    {#each history as line}
      <div class="whitespace-pre-wrap">{line}</div>
    {/each}
  </div>

  <div class="flex items-center text-sm relative {border} border-y py-3 my-4">
    <span class="{fgDim} mr-2">{promptChar}</span>
    <div class="flex-1 relative">
      {#if selectMode}
        <span class="{fgDim} opacity-50">← → {$t('terminal.selectHint')}</span>
        <span class="{fg} ml-2">{$t('terminal.currentValue')}{getOptionLabel(selectMode.cmd, getCurrentValue(selectMode.cmd))}</span>
      {:else}
        <input type="text" bind:value={input} bind:this={inputEl}
          onkeydown={handleKeydown}
          class="w-full bg-transparent outline-none {fg} relative z-10"
          style="caret-color: transparent;" placeholder="h" />
        {#if cursorStyle === 'block'}
          <span class="absolute top-0 pointer-events-none animate-blink inline-flex items-center justify-center bg-current h-[1.2em] {fg}"
            style="left: {cursorVisualLeft}ch; width: 1ch;"></span>
        {:else if cursorStyle === 'underline'}
          <span class="absolute pointer-events-none animate-blink bg-current h-0.5 bottom-0.5 {fg}"
            style="left: {cursorVisualLeft}ch; width: 1ch;"></span>
        {:else if cursorStyle === 'wide'}
          <span class="absolute top-0 pointer-events-none animate-blink bg-current w-0.75 h-[1.2em] {fg}"
            style="left: {cursorVisualLeft}ch;"></span>
        {:else}
          <span class="absolute top-0 pointer-events-none animate-blink bg-current w-px h-[1.2em] {fg}"
            style="left: {cursorVisualLeft}ch;"></span>
        {/if}
      {/if}
    </div>
  </div>

  {#if selectMode}
    <div class="text-sm -mt-3 mb-4 flex flex-wrap gap-x-1">
      {#each selectMode.options as opt, i}
        <span class="px-2 py-0.5 rounded {i === selectMode.index ? fg + ' ' + (dark ? 'bg-white/15' : 'bg-black/10') : fgDim + ' opacity-40'}"
          >{getOptionLabel(selectMode.cmd, opt)}</span>
      {/each}
    </div>
  {/if}

  <div class="text-xs {fgDim} opacity-30 -mt-3">{$t('terminal.welcome')}</div>
</div>
</div>
