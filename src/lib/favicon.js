import { getCachedIconUrl, fetchAndCacheIcon } from './iconCache.js'

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

function getBrowserFavicon(url, hostname) {
  if (isFirefox) {
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`
  }
  if (isEdge) {
    return `chrome-search://ntpicon/?size=48@2.000000x&url=${encodeURIComponent(url)}`
  }
  // MV3 使用 _favicon/ 路径，需要 manifest 中声明 favicon 权限
  return chrome.runtime.getURL(`_favicon/?pageUrl=${encodeURIComponent(url)}&size=128`)
}

export function getFaviconBySource(url, source = 'auto') {
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

export function getFaviconFallback(url) {
  try {
    const hostname = new URL(url).hostname
    return `https://www.faviconextractor.com/favicon/${hostname}`
  } catch {
    return ''
  }
}

// 根据站点配置解析最终图标 URL，优先使用缓存
export function resolveSiteIcon(site, dark = false) {
  if (site.iconSource === 'custom') {
    if (dark && site.customIconDark) return site.customIconDark
    return site.customIcon || ''
  }
  const remoteUrl = getFaviconBySource(site.url, site.iconSource || 'auto')
  if (!remoteUrl.startsWith('http')) return remoteUrl
  return getCachedIconUrl(remoteUrl) || remoteUrl
}

// img onload 回调：如果当前 src 是远程 URL 则后台缓存
const _caching = new Set()
export function handleIconLoad(e, site) {
  if (site.iconSource === 'custom') return
  const remoteUrl = getFaviconBySource(site.url, site.iconSource || 'auto')
  if (!remoteUrl || !remoteUrl.startsWith('http') || getCachedIconUrl(remoteUrl) || _caching.has(remoteUrl)) return
  _caching.add(remoteUrl)
  fetchAndCacheIcon(remoteUrl).catch(() => {}).finally(() => _caching.delete(remoteUrl))
}

// 兼容旧接口
export function getFavicon(url) {
  return getFaviconBySource(url, 'auto')
}
