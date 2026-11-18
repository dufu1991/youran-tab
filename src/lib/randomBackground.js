// 随机背景的抽取规则：打开页面时抽一次，之后沿用上次结果；
// 只有手动刷新（reroll）或上次结果已不在候选中（例如预设被删除、随机范围变化）时才重新抽取，
// 手动刷新时排除上次结果，保证一定会换
export const pickRandomBackground = (candidates, previousKey, reroll, random = Math.random) => {
  if (candidates.length === 0) return null
  if (!reroll) {
    const kept = candidates.find((candidate) => candidate.key === previousKey)
    if (kept) return kept
  }
  const pool = reroll && candidates.length > 1
    ? candidates.filter((candidate) => candidate.key !== previousKey)
    : candidates
  return pool[Math.floor(random() * pool.length)]
}

// 两个色相在色环上的最短距离（0 ~ 180）
export const hueDistance = (a, b) => {
  const diff = Math.abs(a - b) % 360
  return diff > 180 ? 360 - diff : diff
}

// 多次采样，取离最近几次色相最远的一个，避免连续几次颜色相近
export const pickDistinctHue = (recentHues, random = Math.random, samples = 12) => {
  let best = random() * 360
  let bestScore = -1
  for (let i = 0; i < samples; i += 1) {
    const hue = random() * 360
    const score = recentHues.length > 0 ? Math.min(...recentHues.map((item) => hueDistance(item, hue))) : 180
    if (score > bestScore) {
      best = hue
      bestScore = score
    }
  }
  return best
}

// 优先从最近没出现过的项里随机，全部出现过时退回整个列表
export const pickFreshItem = (items, recent, random = Math.random) => {
  const fresh = items.filter((item) => !recent.includes(item))
  const pool = fresh.length > 0 ? fresh : items
  return pool[Math.floor(random() * pool.length)]
}

// 把新记录放到最前面，去重并截断
export const pushRecent = (list, item, limit) => [item, ...list.filter((value) => value !== item)].slice(0, limit)
