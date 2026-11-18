import { describe, expect, test } from 'bun:test'
import { hueDistance, pickDistinctHue, pickFreshItem, pickRandomBackground, pushRecent } from './randomBackground.js'

const candidates = [{ key: 'solid:0' }, { key: 'solid:1' }, { key: 'gradient:0' }]

describe('pickRandomBackground', () => {
  test('没有候选时返回 null', () => {
    expect(pickRandomBackground([], '', true)).toBe(null)
  })

  test('首次抽取时随机选一个', () => {
    expect(pickRandomBackground(candidates, '', false, () => 0.99).key).toBe('gradient:0')
  })

  test('不刷新时沿用上次结果，即使候选列表重新生成', () => {
    const regenerated = candidates.map((item) => ({ ...item }))
    expect(pickRandomBackground(regenerated, 'solid:1', false, () => 0).key).toBe('solid:1')
  })

  test('上次结果不在候选中时重新抽取', () => {
    expect(pickRandomBackground(candidates, 'image:3', false, () => 0).key).toBe('solid:0')
  })

  test('手动刷新时排除上次结果', () => {
    for (const value of [0, 0.5, 0.99]) {
      expect(pickRandomBackground(candidates, 'solid:0', true, () => value).key).not.toBe('solid:0')
    }
  })

  test('只有一个候选时刷新仍返回它', () => {
    expect(pickRandomBackground([{ key: 'solid:0' }], 'solid:0', true).key).toBe('solid:0')
  })
})

describe('随机背景去重辅助函数', () => {
  test('hueDistance 按色环最短距离计算', () => {
    expect(hueDistance(10, 350)).toBe(20)
    expect(hueDistance(0, 180)).toBe(180)
  })

  test('pickDistinctHue 避开最近的色相', () => {
    const recent = [0, 60, 120, 180, 240, 300]
    for (let i = 0; i < 50; i += 1) {
      const hue = pickDistinctHue(recent)
      expect(Math.min(...recent.map((item) => hueDistance(item, hue)))).toBeGreaterThan(5)
    }
  })

  test('pickFreshItem 优先选最近没出现过的项', () => {
    for (const value of [0, 0.5, 0.99]) {
      expect(pickFreshItem(['a', 'b', 'c'], ['a', 'b'], () => value)).toBe('c')
    }
    expect(pickFreshItem(['a'], ['a'], () => 0)).toBe('a')
  })

  test('pushRecent 去重并截断', () => {
    expect(pushRecent(['a', 'b', 'c'], 'b', 2)).toEqual(['b', 'a'])
  })
})
