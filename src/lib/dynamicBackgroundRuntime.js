import {
  AbstractShapeBg,
  AestheticFluidBg,
  AmbientLightBg,
  BigBlobBg,
  BlurDotBg,
  BlurGradientBg,
  ChaosWavesBg,
  CurveGradientBg,
  GridArrayBg,
  RandomCubesBg,
  StepGradientBg,
  SwirlingCurvesBg,
  TrianglesMosaicBg,
  WavyWavesBg,
} from 'color4bg'

export const DYNAMIC_THUMBNAIL_SIZE = { width: 240, height: 135 }

const DYNAMIC_THUMBNAIL_CACHE_LIMIT = 96

const dynamicBgClasses = {
  'abstract-shape': AbstractShapeBg,
  'aesthetic-fluid': AestheticFluidBg,
  'ambient-light': AmbientLightBg,
  'big-blob': BigBlobBg,
  'blur-dot': BlurDotBg,
  'blur-gradient': BlurGradientBg,
  'chaos-waves': ChaosWavesBg,
  'curve-gradient': CurveGradientBg,
  'grid-array': GridArrayBg,
  'random-cubes': RandomCubesBg,
  'step-gradient': StepGradientBg,
  'swirling-curves': SwirlingCurvesBg,
  'triangles-mosaic': TrianglesMosaicBg,
  'wavy-waves': WavyWavesBg,
}

const thumbnailCache = new Map()
const thumbnailPending = new Map()
const thumbnailQueue = []
let thumbnailQueueRunning = false
const mutedConsoleMethods = ['log', 'info', 'debug']

const withMutedColor4bgConsole = (callback) => {
  const snapshots = mutedConsoleMethods.map((method) => [method, console[method]])
  mutedConsoleMethods.forEach((method) => {
    console[method] = () => {}
  })

  try {
    return callback()
  } finally {
    snapshots.forEach(([method, handler]) => {
      console[method] = handler
    })
  }
}

function createSeededRandom(seed) {
  const input = String(seed ?? '')
  let h1 = 1779033703
  let h2 = 3144134277
  let h3 = 1013904242
  let h4 = 2773480762

  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i)
    h1 = h2 ^ Math.imul(h1 ^ code, 597399067)
    h2 = h3 ^ Math.imul(h2 ^ code, 2869860233)
    h3 = h4 ^ Math.imul(h3 ^ code, 951274213)
    h4 = h1 ^ Math.imul(h4 ^ code, 2716044179)
  }

  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)

  let a = (h1 ^ h2 ^ h3 ^ h4) >>> 0
  let b = (h2 ^ h1) >>> 0
  let c = (h3 ^ h1) >>> 0
  let d = (h4 ^ h1) >>> 0

  const rng = () => {
    a >>>= 0
    b >>>= 0
    c >>>= 0
    d >>>= 0
    const t = (a + b) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    d = (d + 1) | 0
    const result = (t + d) | 0
    c = (c + result) | 0
    return (result >>> 0) / 4294967296
  }

  rng.int32 = () => (rng() * 4294967296) | 0
  rng.quick = rng
  rng.double = rng

  return rng
}

export const ensureSeedRandom = () => {
  Math.seedrandom = createSeededRandom
}

const createDomId = (prefix) => `${prefix}-${crypto.randomUUID()}`

const getDynamicBackgroundClass = (preset) => dynamicBgClasses[preset?.style] || AestheticFluidBg

const getDynamicVariantView = (preset) => preset?.variant?.view || {}

const getNumber = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback

const getRuntimeSeed = (seed) => {
  if (Number.isFinite(Number(seed))) return Number(seed)

  const input = String(seed ?? '')
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0) % 1000000 + 1
}

const getDynamicCoverScale = (view = {}, width = 16, height = 9) => {
  const rotate = Number.isFinite(Number(view.rotate)) ? Number(view.rotate) : 0
  const x = Math.abs(getNumber(view.x, 0)) / 100
  const y = Math.abs(getNumber(view.y, 0)) / 100
  const safeWidth = Math.max(width, 1)
  const safeHeight = Math.max(height, 1)
  const angle = Math.abs(rotate) * Math.PI / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const rotatedWidthScale = cos + (safeHeight / safeWidth) * sin
  const rotatedHeightScale = cos + (safeWidth / safeHeight) * sin
  return Math.max(rotatedWidthScale + x * 2, rotatedHeightScale + y * 2, 1) + 0.04
}

const getDynamicVariantTransform = (view = {}, width = 16, height = 9) => {
  const scale = getNumber(view.scale, 1)
  return `scale(${scale})`
}

const getDynamicVariantFilter = (view = {}) => {
  const hue = getNumber(view.hue, 0)
  const saturate = getNumber(view.saturate, 1)
  const brightness = getNumber(view.brightness, 1)
  const contrast = getNumber(view.contrast, 1)
  return `hue-rotate(${hue}deg) saturate(${saturate}) brightness(${brightness}) contrast(${contrast})`
}

const applyDynamicUpdate = (target, option, value) => {
  if (typeof target?.update !== 'function') return

  try {
    withMutedColor4bgConsole(() => target.update(option, value))
  } catch {
    // color4bg 部分 update 分支会访问未创建的 uniform，失败时跳过该参数。
  }
}

const applyDynamicVariant = (target, host, preset) => {
  const variant = preset?.variant || {}
  const view = getDynamicVariantView(preset)

  if (Number.isFinite(Number(view.frame))) {
    target.frame = Number(view.frame)
  }

  if (Array.isArray(variant.updates)) {
    variant.updates.forEach(([option, value]) => {
      applyDynamicUpdate(target, option, value)
    })
  }

  const canvas = target.gl?.canvas || host.querySelector('canvas')
  if (!canvas) return

  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.transformOrigin = 'center center'
  canvas.style.transform = getDynamicVariantTransform(view, host.clientWidth, host.clientHeight)
  canvas.style.filter = getDynamicVariantFilter(view)
}

const withCapturedAnimationFrames = (callback) => {
  const queuedFrames = []
  const nativeRequestAnimationFrame = window.requestAnimationFrame.bind(window)
  const nativeCancelAnimationFrame = window.cancelAnimationFrame.bind(window)
  const requestAnimationFrameSnapshot = window.requestAnimationFrame

  window.requestAnimationFrame = (frameCallback) => {
    const id = nativeRequestAnimationFrame(frameCallback)
    queuedFrames.push(id)
    return id
  }

  try {
    return callback({ nativeRequestAnimationFrame, nativeCancelAnimationFrame })
  } finally {
    window.requestAnimationFrame = requestAnimationFrameSnapshot
    queuedFrames.forEach((id) => nativeCancelAnimationFrame(id))
  }
}

const createDynamicBackgroundInstance = (host, preset, domId) => {
  ensureSeedRandom()

  const BgClass = getDynamicBackgroundClass(preset)
  const variantParams = preset.variant?.params || {}
  host.id = domId
  host.replaceChildren()

  const instance = withMutedColor4bgConsole(() => withCapturedAnimationFrames(() => new BgClass({
    ...variantParams,
    dom: domId,
    colors: preset.colors,
    seed: getRuntimeSeed(preset.seed),
    loop: preset.loop !== false,
  })))

  withMutedColor4bgConsole(() => applyDynamicVariant(instance, host, preset))

  return instance
}

export const destroyDynamicBackground = (target, host, domId, options = {}) => {
  if (!target) {
    if (host?.id === domId) host.removeAttribute('id')
    host?.replaceChildren()
    return
  }

  const canvas = target.gl?.canvas
  const gl = target.gl

  target.loop = false
  target.resize = () => {}
  target._animate = () => {}
  target._update = () => {}

  if (target.parentDom && canvas?.parentNode === target.parentDom) {
    target.destroy()
  } else {
    canvas?.remove()
  }

  if (options.loseContext) {
    gl?.getExtension?.('WEBGL_lose_context')?.loseContext()
  }

  if (host?.id === domId) host.removeAttribute('id')
  host?.replaceChildren()
}

const renderDynamicFrame = (target) => {
  if (!target?._update) return false

  try {
    withMutedColor4bgConsole(() => withCapturedAnimationFrames(() => target._update()))
    return true
  } catch {
    return false
  }
}

const waitAnimationFrame = () => new Promise((resolve) => {
  window.requestAnimationFrame(resolve)
})

const waitDynamicAssets = (target) => {
  if (!target?.img || target.img.complete) return Promise.resolve()

  return new Promise((resolve) => {
    let settled = false
    const rawLoad = target.img.onload
    const rawError = target.img.onerror
    const timer = window.setTimeout(() => {
      finish()
    }, 120)

    const finish = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      resolve()
    }

    target.img.onload = (event) => {
      rawLoad?.call(target.img, event)
      finish()
    }

    target.img.onerror = (event) => {
      rawError?.call(target.img, event)
      finish()
    }
  })
}

export const mountDynamicBackground = (host, preset) => {
  const domId = createDomId('dynamic-bg')
  let instance = null
  let active = true

  try {
    instance = createDynamicBackgroundInstance(host, preset, domId)
  } catch {
    destroyDynamicBackground(instance, host, domId, { loseContext: true })
    return () => {}
  }

  const rawUpdate = instance._update
  instance._update = () => {
    if (!active) return

    try {
      withMutedColor4bgConsole(() => rawUpdate())
    } catch {
      active = false
      destroyDynamicBackground(instance, host, domId, { loseContext: true })
    }
  }

  window.requestAnimationFrame(instance._update)

  return () => {
    active = false
    destroyDynamicBackground(instance, host, domId, { loseContext: true })
  }
}

export const getDynamicThumbnailKey = (preset, options = {}) => {
  const width = options.width || DYNAMIC_THUMBNAIL_SIZE.width
  const height = options.height || DYNAMIC_THUMBNAIL_SIZE.height
  const style = preset?.style || ''
  const colors = Array.isArray(preset?.colors) ? preset.colors.join(',') : ''
  const seed = preset?.seed ?? ''
  const loop = preset?.loop !== false ? 1 : 0
  const variant = JSON.stringify(preset?.variant || {})
  return [style, colors, seed, loop, variant, `${width}x${height}`].join('|')
}

export const getCachedDynamicThumbnail = (preset, options = {}) => thumbnailCache.get(getDynamicThumbnailKey(preset, options)) || ''

const exportDynamicCanvasImage = (canvas, preset, options = {}) => {
  const width = options.width || DYNAMIC_THUMBNAIL_SIZE.width
  const height = options.height || DYNAMIC_THUMBNAIL_SIZE.height
  const view = getDynamicVariantView(preset)
  const scale = getNumber(view.scale, 1)
  const output = document.createElement('canvas')
  const ctx = output.getContext('2d')

  output.width = width
  output.height = height
  ctx.filter = getDynamicVariantFilter(view)
  ctx.translate(width / 2, height / 2)
  ctx.scale(scale, scale)
  ctx.drawImage(canvas, -width / 2, -height / 2, width, height)

  return output.toDataURL(options.type || 'image/webp', options.quality || 0.8)
}

const rememberDynamicThumbnail = (key, url) => {
  if (!url) return
  if (thumbnailCache.has(key)) thumbnailCache.delete(key)
  thumbnailCache.set(key, url)

  while (thumbnailCache.size > DYNAMIC_THUMBNAIL_CACHE_LIMIT) {
    const oldestKey = thumbnailCache.keys().next().value
    thumbnailCache.delete(oldestKey)
  }
}

export const captureDynamicThumbnail = async (preset, options = {}) => {
  const width = options.width || DYNAMIC_THUMBNAIL_SIZE.width
  const height = options.height || DYNAMIC_THUMBNAIL_SIZE.height
  const host = document.createElement('div')
  const domId = createDomId('dynamic-thumbnail')
  let instance = null

  Object.assign(host.style, {
    position: 'fixed',
    left: '-10000px',
    top: '-10000px',
    width: `${width}px`,
    height: `${height}px`,
    overflow: 'hidden',
    pointerEvents: 'none',
    opacity: '0',
  })

  document.body.appendChild(host)

  try {
    instance = createDynamicBackgroundInstance(host, preset, domId)

    await waitDynamicAssets(instance)
    await waitAnimationFrame()
    await waitAnimationFrame()

    if (!renderDynamicFrame(instance)) return ''
    if (instance.isRenderTarget && !renderDynamicFrame(instance)) return ''

    const canvas = instance.gl?.canvas || host.querySelector('canvas')
    return canvas ? exportDynamicCanvasImage(canvas, preset, { ...options, width, height }) : ''
  } finally {
    destroyDynamicBackground(instance, host, domId, { loseContext: true })
    host.remove()
  }
}

const processDynamicThumbnailQueue = async () => {
  if (thumbnailQueueRunning) return
  thumbnailQueueRunning = true

  while (thumbnailQueue.length > 0) {
    const task = thumbnailQueue.shift()

    if (thumbnailCache.has(task.key)) {
      task.resolve(thumbnailCache.get(task.key))
      thumbnailPending.delete(task.key)
      continue
    }

    let url = ''
    try {
      url = await captureDynamicThumbnail(task.preset, task.options)
      rememberDynamicThumbnail(task.key, url)
    } catch {
      url = ''
    }

    thumbnailPending.delete(task.key)
    task.resolve(url)
  }

  thumbnailQueueRunning = false
}

export const requestDynamicThumbnail = (preset, options = {}) => {
  const key = getDynamicThumbnailKey(preset, options)
  const cached = thumbnailCache.get(key)
  if (cached) return Promise.resolve(cached)

  const pending = thumbnailPending.get(key)
  if (pending) return pending

  const promise = new Promise((resolve) => {
    thumbnailQueue.push({ key, preset, options, resolve })
  })

  thumbnailPending.set(key, promise)
  processDynamicThumbnailQueue()

  return promise
}
