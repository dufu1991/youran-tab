import { describe, expect, test } from 'bun:test'
import { classifyIconPixels } from './iconTone.js'

// 生成 10 × 10 的像素数据：前 transparentCount 个像素透明，其余为指定颜色
const pixels = (transparentCount, [r, g, b]) => {
  const data = new Uint8ClampedArray(100 * 4)
  for (let i = 0; i < 100; i += 1) {
    if (i < transparentCount) continue
    data.set([r, g, b, 255], i * 4)
  }
  return data
}

describe('classifyIconPixels', () => {
  test('dark line art is dark', () => {
    expect(classifyIconPixels(pixels(70, [20, 20, 20]))).toBe('dark')
  })

  test('white line art is light', () => {
    expect(classifyIconPixels(pixels(70, [250, 250, 250]))).toBe('light')
  })

  test('colorful line art is normal', () => {
    expect(classifyIconPixels(pixels(70, [217, 119, 87]))).toBe('normal')
  })

  test('full-bleed icons keep their own background, even when dark', () => {
    expect(classifyIconPixels(pixels(8, [10, 10, 10]))).toBe('normal')
  })

  test('fully transparent images are normal', () => {
    expect(classifyIconPixels(pixels(100, [0, 0, 0]))).toBe('normal')
  })
})
