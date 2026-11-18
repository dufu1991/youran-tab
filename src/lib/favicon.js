import { getCachedIconUrl, fetchAndCacheIcon } from './iconCache.js'
import { getResolvedAutoIcon, resolveAutoIcon } from './autoIcon.js'

// 检测浏览器类型
const isEdge = /\bEdg\//.test(navigator.userAgent)
const isFirefox = /\bFirefox\//.test(navigator.userAgent)

// 图标源定义
export const iconSources = {
  auto: { name: 'Auto' },
  google: { name: 'Google' },
  extractor: { name: 'Extractor' },
  horse: { name: 'icon.horse' },
}

// 可选的在线源 key 列表
export const pickableSourceKeys = Object.keys(iconSources)

const getBrowserFavicon = (url, hostname) => {
  if (isFirefox) {
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`
  }
  if (isEdge) {
    return `chrome-search://ntpicon/?size=48@2.000000x&url=${encodeURIComponent(url)}`
  }
  // MV3 使用 _favicon/ 路径，需要 manifest 中声明 favicon 权限
  return chrome.runtime.getURL(`_favicon/?pageUrl=${encodeURIComponent(url)}&size=128`)
}

export const getFaviconBySource = (url, source = 'auto') => {
  try {
    const u = new URL(url)
    const hostname = u.hostname
    switch (source) {
      case 'extractor':
        return `https://www.faviconextractor.com/favicon/${hostname}`
      case 'horse':
        return `https://icon.horse/icon/${hostname}`
      case 'google':
        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`
      case 'auto':
      default:
        return getBrowserFavicon(u.href, hostname)
    }
  } catch {
    return ''
  }
}

export const getFaviconFallback = (url) => {
  try {
    const hostname = new URL(url).hostname
    return `https://www.faviconextractor.com/favicon/${hostname}`
  } catch {
    return ''
  }
}

const isAutoSource = (site) => !site.iconSource || site.iconSource === 'auto'

// 站点当前应使用的远程图标地址：「自动」优先用已探测出的结果，还没探测时先用浏览器内置图标
const getSiteRemoteIcon = (site) => {
  if (isAutoSource(site)) return getResolvedAutoIcon(site.url) || getFaviconBySource(site.url, 'auto')
  return getFaviconBySource(site.url, site.iconSource)
}

// 根据站点配置解析最终图标 URL，优先使用缓存
export const resolveSiteIcon = (site, dark = false) => {
  if (site.iconSource === 'custom') {
    if (dark && site.customIconDark) return site.customIconDark
    return site.customIcon || ''
  }
  const remoteUrl = getSiteRemoteIcon(site)
  if (!remoteUrl.startsWith('http')) return remoteUrl
  return getCachedIconUrl(remoteUrl) || remoteUrl
}

// img onload 回调：「自动」图标还没探测过时开始探测，探测完替换成更合适的图标；远程图标在后台缓存
const _caching = new Set()
export const handleIconLoad = (e, site) => {
  if (site.iconSource === 'custom') return
  const img = e.currentTarget
  if (isAutoSource(site) && !getResolvedAutoIcon(site.url)) {
    resolveAutoIcon(site.url, site.name).then((resolved) => {
      if (resolved && img.isConnected) img.src = getCachedIconUrl(resolved) || resolved
    })
    return
  }
  const remoteUrl = getSiteRemoteIcon(site)
  if (!remoteUrl || !remoteUrl.startsWith('http') || getCachedIconUrl(remoteUrl) || _caching.has(remoteUrl)) return
  _caching.add(remoteUrl)
  fetchAndCacheIcon(remoteUrl).catch(() => {}).finally(() => _caching.delete(remoteUrl))
}
