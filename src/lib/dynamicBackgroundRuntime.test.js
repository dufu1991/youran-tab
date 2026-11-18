import { afterAll, describe, expect, test } from 'bun:test'
import { ensureSeedRandom } from './dynamicBackgroundRuntime.js'

const originalSeedRandom = Math.seedrandom

afterAll(() => {
  Math.seedrandom = originalSeedRandom
})

describe('动态背景的随机数', () => {
  // color4bg 以 new Math.seedrandom(seed) 创建随机数；若改成箭头函数会抛出「不是构造函数」，动态背景整个不显示
  test('可以被 new 调用，并返回随机数函数', () => {
    ensureSeedRandom()
    const rng = new Math.seedrandom('youran')
    expect(typeof rng).toBe('function')
    const value = rng()
    expect(value).toBeGreaterThanOrEqual(0)
    expect(value).toBeLessThan(1)
  })

  test('相同种子得到相同序列，不同种子不同', () => {
    ensureSeedRandom()
    const a = new Math.seedrandom('seed-1')
    const b = new Math.seedrandom('seed-1')
    const c = new Math.seedrandom('seed-2')
    const sequence = (rng) => Array.from({ length: 5 }, () => rng())
    expect(sequence(a)).toEqual(sequence(b))
    expect(sequence(new Math.seedrandom('seed-1'))).not.toEqual(sequence(c))
  })
})
