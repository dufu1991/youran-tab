import { flattenSites } from './folders.js'

export const SITE_SEARCH_LIMIT = 6

// 分数越小越靠前；不超过 AUTO_SELECT_SCORE 的结果足够明确，回车可以直接打开
const SCORE = {
  nameExact: 0,
  namePrefix: 1,
  hostPrefix: 2,
  nameWordPrefix: 3,
  nameContains: 4,
  hostContains: 5,
  otherContains: 6,
  allTokens: 7,
}
const AUTO_SELECT_SCORE = SCORE.hostPrefix

// 取网址的主机名并去掉 www.，网址不合法时退回原始字符串
export const getSiteHost = (url) => {
  if (!URL.canParse(url)) return url.toLowerCase()
  return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
}

const isWordPrefix = (text, query) => {
  let index = text.indexOf(query)
  while (index > 0) {
    if (/[\s\-_./·|:：（(]/.test(text[index - 1])) return true
    index = text.indexOf(query, index + 1)
  }
  return index === 0
}

// 主机名的每一段都可以作为前缀匹配，例如 mail.google.com 可以用 google 匹配
const isHostPrefix = (host, query) => host.split('.').some((_, i, parts) => parts.slice(i).join('.').startsWith(query))

const scoreSite = (site, query, tokens) => {
  const name = site.name.toLowerCase()
  const host = getSiteHost(site.url)
  if (name === query) return SCORE.nameExact
  if (name.startsWith(query)) return SCORE.namePrefix
  if (isHostPrefix(host, query)) return SCORE.hostPrefix
  if (isWordPrefix(name, query)) return SCORE.nameWordPrefix
  if (name.includes(query)) return SCORE.nameContains
  if (host.includes(query)) return SCORE.hostContains
  const folderPath = site.folderPath.toLowerCase()
  const url = site.url.toLowerCase()
  if (folderPath.includes(query) || url.includes(query)) return SCORE.otherContains
  if (tokens.length < 2) return null
  const haystack = `${name} ${host} ${folderPath} ${url}`
  return tokens.every((token) => haystack.includes(token)) ? SCORE.allTokens : null
}

// 在所有网站（包括文件夹内的）中按名称、域名、文件夹名匹配，同分时常用的排在前面
export const searchSites = (items, rawQuery, clickCounts = {}, limit = SITE_SEARCH_LIMIT) => {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return []
  const tokens = query.split(/\s+/)
  return flattenSites(items)
    .map((site, order) => ({ site, order, score: scoreSite(site, query, tokens) }))
    .filter((entry) => entry.score !== null)
    .sort((a, b) => a.score - b.score || (clickCounts[b.site.id] || 0) - (clickCounts[a.site.id] || 0) || a.order - b.order)
    .slice(0, limit)
}

// 第一个结果足够明确时默认选中，回车直接打开；否则回车仍然走网页搜索
export const shouldAutoSelect = (results) => results.length > 0 && results[0].score <= AUTO_SELECT_SCORE
