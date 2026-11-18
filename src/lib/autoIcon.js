// 「自动」图标：同时向多个来源请求图标，跳过各服务在缺图标时返回的占位图，
// 再按图片真实承载的清晰度挑出最清楚的一个；都没有时生成首字母图标。
// 结果按域名保存在本地，之后直接使用，不再重复探测。
//
// 各来源的表现（2026-11 实测）：
// - 网站自身的 apple-touch-icon：有则通常最大；没有时返回 404 网页，图片加载失败
// - faviconextractor：有时 512px，有时只有 16px；缺图标时 404 + 占位 SVG
// - Google s2：常把 32px 小图放大成 128px 返回；缺图标时 404 + 16px 地球图标
// - icon.horse：清晰度普遍最好；缺图标时用响应头 X-Icon-Fallback: true 标明占位图
// - 浏览器内置图标（Chrome _favicon）：来自浏览历史，没有时返回默认地球图标
// <img> 遇到 404 也会显示返回的图片，所以不能只依赖 onerror 判断；
// 图片的标称尺寸也不可靠，要量出缩小后仍不丢细节的最小尺寸，才是真实清晰度

import { getItem, removeItem, setItem } from './storage.js'

const STORAGE_KEY = 'newtab_auto_icons'
// 结果的判定规则版本；规则调整后旧结果会重新探测
const RESULT_VERSION = 2
// 只找到首字母兜底图标时，隔一段时间再重新探测，网站可能后来加了图标
const FALLBACK_RETRY_MS = 7 * 24 * 60 * 60 * 1000
const REQUEST_TIMEOUT_MS = 6000
const MAX_CONCURRENT = 4

const isEdge = typeof navigator !== 'undefined' && /\bEdg\//.test(navigator.userAgent)
const isFirefox = typeof navigator !== 'undefined' && /\bFirefox\//.test(navigator.userAgent)

let entries = getItem(STORAGE_KEY) ?? {}

const saveEntry = (host, entry) => {
  entries = { ...entries, [host]: entry }
  setItem(STORAGE_KEY, entries)
}

export const clearAutoIcons = () => {
  entries = {}
  return removeItem(STORAGE_KEY)
}

export const getHostname = (url) => {
  if (!/^https?:\/\//.test(url || '')) return ''
  return new URL(url).hostname
}

// 已探测出的图标地址；没有记录或兜底图标已过期时返回空字符串
export const getResolvedAutoIcon = (url) => {
  const entry = entries[getHostname(url)]
  if (!entry || entry.v !== RESULT_VERSION) return ''
  return entry.url
}

const needsResolve = (host) => {
  const entry = entries[host]
  if (!entry || entry.v !== RESULT_VERSION) return true
  return entry.fallback && Date.now() - entry.at > FALLBACK_RETRY_MS
}

// ---------- 首字母兜底图标 ----------

const FALLBACK_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#64748b']

const hashText = (text) => [...text].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) | 0, 0)

const escapeXml = (text) => text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

export const createLetterIcon = (name, host) => {
  const source = (name || '').trim() || host.replace(/^www\./, '')
  const letter = [...source][0]?.toUpperCase() || '?'
  const color = FALLBACK_COLORS[Math.abs(hashText(host || source)) % FALLBACK_COLORS.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${color}"/><text x="32" y="33" text-anchor="middle" dominant-baseline="central" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif" font-size="32" font-weight="600" fill="#fff">${escapeXml(letter)}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

// ---------- 探测工具 ----------

const loadImage = (src) => new Promise((resolve) => {
  const img = new Image()
  const timer = setTimeout(() => resolve(null), REQUEST_TIMEOUT_MS)
  img.onload = () => {
    clearTimeout(timer)
    resolve(img)
  }
  img.onerror = () => {
    clearTimeout(timer)
    resolve(null)
  }
  img.src = src
})

// 请求图标：返回响应（状态码非 200 或不是图片时为 null）；请求本身失败（网络错误或没有主机权限导致跨域受限）时返回 'blocked'
const fetchIcon = (src) => fetch(src, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
  .then((response) => (response.ok && (response.headers.get('content-type') || '').startsWith('image/') ? response : null))
  .catch(() => 'blocked')

const SHARPNESS_SIZES = [16, 32, 64, 128, 256]
// 尺寸翻倍时梯度能量的增长倍数：清晰图片约为 2，放大来的图片在超过原始尺寸后接近 1
const SHARPNESS_MIN_RATIO = 1.45

// 梯度能量：相邻像素亮度差的平方和，透明像素按白底合成
const gradientEnergy = (source, side) => {
  const canvas = document.createElement('canvas')
  canvas.width = side
  canvas.height = side
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.imageSmoothingQuality = 'high'
  context.drawImage(source, 0, 0, side, side)
  const data = context.getImageData(0, 0, side, side).data
  const luminance = new Float32Array(side * side)
  for (let i = 0; i < side * side; i += 1) {
    const alpha = data[i * 4 + 3] / 255
    const value = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]
    luminance[i] = value * alpha + 255 * (1 - alpha)
  }
  let energy = 0
  for (let y = 0; y < side; y += 1) {
    for (let x = 0; x < side; x += 1) {
      const index = y * side + x
      if (x + 1 < side) energy += (luminance[index + 1] - luminance[index]) ** 2
      if (y + 1 < side) energy += (luminance[index + side] - luminance[index]) ** 2
    }
  }
  return energy
}

// 量出图片真实承载的清晰度：清晰图片每放大一倍，边缘的梯度能量约翻倍；
// 由小图放大而来的图片超过原始尺寸后能量几乎不再增长。返回能量仍在正常增长的最大尺寸，
// 例如把 32px 小图放大成 128px 的图片会量出 32，而不是标称的 128
export const measureSharpness = (source, width) => {
  const sizes = SHARPNESS_SIZES.filter((size) => size <= width)
  if (sizes.length < 2) return width
  let previous = gradientEnergy(source, sizes[0])
  if (previous === 0) return width
  for (let i = 1; i < sizes.length; i += 1) {
    const energy = gradientEnergy(source, sizes[i])
    if (energy / previous < SHARPNESS_MIN_RATIO) return sizes[i - 1]
    previous = energy
  }
  return width
}

// 量取响应中的图片；SVG 是矢量图，视为足够清晰
const measureResponse = async (response) => {
  const blob = await response.blob()
  if (blob.type.includes('svg')) return 512
  const bitmap = await createImageBitmap(blob).catch(() => null)
  if (!bitmap) return 0
  const score = measureSharpness(bitmap, Math.min(bitmap.width, bitmap.height))
  bitmap.close()
  return score
}

// 把图片缩到 16 × 16 后的像素作为指纹，用来识别浏览器的默认地球图标
const imageFingerprint = (img) => draw16(img).join(',')
const draw16 = (img) => {
  const canvas = document.createElement('canvas')
  canvas.width = 16
  canvas.height = 16
  const context = canvas.getContext('2d')
  context.drawImage(img, 0, 0, 16, 16)
  return context.getImageData(0, 0, 16, 16).data
}

let browserPlaceholderFingerprint = null
const getBrowserPlaceholderFingerprint = () => {
  browserPlaceholderFingerprint ??= loadImage(getChromeFaviconUrl('https://youran-tab-placeholder.invalid/'))
    .then((img) => (img ? imageFingerprint(img) : ''))
  return browserPlaceholderFingerprint
}

const getChromeFaviconUrl = (pageUrl) => chrome.runtime.getURL(`_favicon/?pageUrl=${encodeURIComponent(pageUrl)}&size=128`)

// ---------- 各个来源 ----------
// 每个来源返回 { src, score }，score 为真实清晰度（像素）；没有可用图标时返回 null

// 网站自己的图标跨域无法读取像素，只能按标称尺寸计分；这类图标很少是放大来的
const fromAppleTouchIcon = async (url, host) => {
  const src = `${new URL(url).protocol}//${host}/apple-touch-icon.png`
  const img = await loadImage(src)
  return img && img.naturalWidth >= 48 ? { src, score: img.naturalWidth } : null
}

// 占位图是 100px 的灰底字母 SVG，只能靠 404 识别，请求受限时跳过
const fromFaviconExtractor = async (url, host) => {
  const src = `https://www.faviconextractor.com/favicon/${host}`
  const response = await fetchIcon(src)
  if (!response || response === 'blocked') return null
  return { src, score: await measureResponse(response) }
}

// 占位图是 16px 地球图标；请求受限时退回按图片尺寸判断，并按低分计，避免压过量得到的结果
const fromGoogle = async (url, host) => {
  const src = `https://www.google.com/s2/favicons?domain=${host}&sz=128`
  const response = await fetchIcon(src)
  if (response === 'blocked') {
    const img = await loadImage(src)
    return img && img.naturalWidth > 16 ? { src, score: Math.min(img.naturalWidth, 32) } : null
  }
  if (!response) return null
  return { src, score: await measureResponse(response) }
}

// 允许跨域读取，响应头 X-Icon-Fallback 为 true 时是生成的占位图
const fromIconHorse = async (url, host) => {
  const src = `https://icon.horse/icon/${host}`
  const response = await fetchIcon(src)
  if (!response || response === 'blocked' || response.headers.get('x-icon-fallback') === 'true') return null
  return { src, score: await measureResponse(response) }
}

const fromBrowser = async (url) => {
  if (isFirefox) return null
  if (isEdge) {
    const src = `chrome-search://ntpicon/?size=48@2.000000x&url=${encodeURIComponent(url)}`
    const img = await loadImage(src)
    return img && img.naturalWidth >= 16 ? { src, score: 16 } : null
  }
  if (typeof chrome === 'undefined' || !chrome.runtime?.getURL) return null
  const src = getChromeFaviconUrl(url)
  const [img, placeholder] = await Promise.all([loadImage(src), getBrowserPlaceholderFingerprint()])
  if (!img || imageFingerprint(img) === placeholder) return null
  return { src, score: measureSharpness(img, img.naturalWidth) }
}

// 数组顺序也是清晰度相同时的优先顺序：网站自己的图标最可信
const SOURCES = [fromAppleTouchIcon, fromIconHorse, fromFaviconExtractor, fromGoogle, fromBrowser]

// 选出清晰度最高的候选；清晰度相同时取排在前面的来源
export const pickBestIcon = (candidates) => candidates.reduce(
  (best, candidate) => (candidate && (!best || candidate.score > best.score) ? candidate : best),
  null,
)

// ---------- 调度 ----------

const pending = new Map()
const queue = []
let running = 0

const runNext = () => {
  if (running >= MAX_CONCURRENT || queue.length === 0) return
  const task = queue.shift()
  running += 1
  task().finally(() => {
    running -= 1
    runNext()
  })
}

const probe = async (url, name, host, sources) => {
  const candidates = await Promise.all(sources.map((source) => source(url, host).catch(() => null)))
  const best = pickBestIcon(candidates)
  if (best) {
    saveEntry(host, { url: best.src, at: Date.now(), fallback: false, v: RESULT_VERSION })
    return best.src
  }
  const letter = createLetterIcon(name, host)
  saveEntry(host, { url: letter, at: Date.now(), fallback: true, v: RESULT_VERSION })
  return letter
}

// 探测某个网站的自动图标；同一域名同时只探测一次，已有结果时直接返回
// sources 仅供测试替换
export const resolveAutoIcon = (url, name = '', sources = SOURCES) => {
  const host = getHostname(url)
  if (!host) return Promise.resolve('')
  if (!needsResolve(host)) return Promise.resolve(entries[host].url)
  if (pending.has(host)) return pending.get(host)

  const task = new Promise((resolve) => {
    queue.push(() => probe(url, name, host, sources).then(resolve))
    runNext()
  }).finally(() => pending.delete(host))
  pending.set(host, task)
  return task
}
