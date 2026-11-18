import { writable, derived, get } from 'svelte/store'
import enUS from './locales/en-US.js'
import zhCN from './locales/zh-CN.js'
import { loadFromStorage, persistedWritable } from './persisted.js'

const STORAGE_KEY_LOCALE = 'newtab_locale'

const supportedLocales = ['en-US', 'zh-CN', 'zh-TW', 'ja', 'ko', 'es', 'ru', 'fr', 'de', 'it']

const localeNames = {
  'en-US': 'English', 'zh-CN': '简体中文', 'zh-TW': '繁體中文',
  'ja': '日本語', 'ko': '한국어', 'es': 'Español',
  'ru': 'Русский', 'fr': 'Français', 'de': 'Deutsch', 'it': 'Italiano',
}

const themeParameterTemplates = {
  'en-US': '{0} theme parameters',
  'zh-CN': '{0}主题参数',
  'zh-TW': '{0}主題參數',
  ja: '{0}テーマ設定',
  ko: '{0} 테마 설정',
  es: 'Parámetros del tema {0}',
  ru: 'Параметры темы «{0}»',
  fr: 'Paramètres du thème {0}',
  de: 'Parameter für das Thema {0}',
  it: 'Parametri del tema {0}',
}

// 简体中文和英文是兜底语言，随首屏一起加载；其他语言在选用时按需加载
const localeLoaders = {
  'zh-TW': () => import('./locales/zh-TW.js'),
  'ja': () => import('./locales/ja.js'),
  'ko': () => import('./locales/ko.js'),
  'es': () => import('./locales/es.js'),
  'ru': () => import('./locales/ru.js'),
  'fr': () => import('./locales/fr.js'),
  'de': () => import('./locales/de.js'),
  'it': () => import('./locales/it.js'),
}

const loadedMessages = writable({ 'en-US': enUS, 'zh-CN': zhCN })

export const loadLocale = async (locale) => {
  if (get(loadedMessages)[locale] || !localeLoaders[locale]) return
  const { default: localeMessages } = await localeLoaders[locale]()
  loadedMessages.update((current) => ({ ...current, [locale]: localeMessages }))
}

const detectLocale = () => {
  const lang = navigator.language || 'zh-CN'
  if (supportedLocales.includes(lang)) return lang
  const base = lang.split('-')[0]
  const match = supportedLocales.find((l) => l.startsWith(base))
  return match || 'zh-CN'
}

// 语言设置在多个新标签页之间同步
export const localeSetting = persistedWritable(STORAGE_KEY_LOCALE, loadFromStorage(STORAGE_KEY_LOCALE, 'auto'))

export const currentLocale = derived(localeSetting, ($s) =>
  $s === 'auto' ? detectLocale() : $s
)

// 切换语言时加载对应文案，加载完成前先用兜底语言显示
currentLocale.subscribe(loadLocale)

export const t = derived([currentLocale, loadedMessages], ([$locale, messages]) => {
  const m = messages[$locale] || messages['zh-CN']
  const zh = messages['zh-CN']
  const en = messages['en-US']
  document.title = m.appName || 'Youran Tab'
  return (key, ...args) => {
    if (key === 'settings.themeParameters') {
      const template = themeParameterTemplates[$locale] || themeParameterTemplates['zh-CN']
      return template.replace('{0}', args[0] ?? '')
    }
    const parts = key.split('.')
    const resolve = (source) => {
      let val = source
      for (const p of parts) val = val?.[p]
      return val
    }
    const val = resolve(m) ?? resolve(zh) ?? resolve(en)
    if (typeof val !== 'string') return key
    return args.length ? val.replace(/\{(\d+)\}/g, (_, i) => args[i] ?? '') : val
  }
})

export { supportedLocales, localeNames }
