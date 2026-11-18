// 识别图标的明暗：用于在宫格、堆叠里给「几乎看不见」的图标补一块对比底色。
// 只针对大面积透明的线条类图标（例如黑色的 OpenAI、GitHub 标志在暗色底板上），
// 满色方块图标（例如微信、Kimi）自带底色，始终按原样显示

const SAMPLE_SIZE = 32
// 透明像素超过这个比例才算线条类图标
const TRANSPARENT_RATIO = 0.25
// 不透明部分的平均亮度（0 到 255）低于 DARK_LUMINANCE 为深色图标，高于 LIGHT_LUMINANCE 为浅色图标
const DARK_LUMINANCE = 80
const LIGHT_LUMINANCE = 205

const cache = new Map()

// 根据像素数据判断明暗：返回 'dark'、'light' 或 'normal'
export const classifyIconPixels = (data) => {
  const total = data.length / 4
  let transparent = 0
  let opaque = 0
  let luminance = 0
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]
    if (alpha < 32) {
      transparent += 1
      continue
    }
    if (alpha < 128) continue
    opaque += 1
    luminance += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }
  if (opaque === 0 || transparent / total < TRANSPARENT_RATIO) return 'normal'
  const average = luminance / opaque
  if (average < DARK_LUMINANCE) return 'dark'
  if (average > LIGHT_LUMINANCE) return 'light'
  return 'normal'
}

const loadImage = (src) => new Promise((resolve) => {
  const img = new Image()
  img.onload = () => resolve(img)
  img.onerror = () => resolve(null)
  img.src = src
})

const isReadable = (src) => /^(blob:|data:)/.test(src) || new URL(src, location.href).origin === location.origin

// 跨域图片直接绘制会污染画布、无法读取像素，改为请求图片数据后再解码（需要主机权限或对方允许跨域）
const loadPixelsSource = async (src) => {
  if (isReadable(src)) return loadImage(src)
  const response = await fetch(src).catch(() => null)
  if (!response?.ok) return null
  const blob = await response.blob()
  if (blob.type.includes('svg')) return loadImage(URL.createObjectURL(blob))
  return createImageBitmap(blob).catch(() => null)
}

const analyze = async (src) => {
  const source = await loadPixelsSource(src)
  if (!source) return 'normal'
  const canvas = document.createElement('canvas')
  canvas.width = SAMPLE_SIZE
  canvas.height = SAMPLE_SIZE
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.drawImage(source, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
  return classifyIconPixels(context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data)
}

// 同一地址只分析一次；无法读取像素时视为 'normal'，按原样显示
export const getIconTone = (src) => {
  if (!src) return Promise.resolve('normal')
  if (!cache.has(src)) cache.set(src, analyze(src))
  return cache.get(src)
}
