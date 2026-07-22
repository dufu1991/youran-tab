// 内置搜索引擎与 AI 提问服务
// name 使用品牌原文，不参与 i18n；logo 为 public/logos 下的相对路径

export const SEARCH_ENGINES = [
  { id: 'google', name: 'Google', logo: 'logos/google.svg', makeUrl: (q) => 'https://www.google.com/search?q=' + encodeURIComponent(q) },
  { id: 'bing', name: 'Bing', logo: 'logos/microsoftbing.svg', makeUrl: (q) => 'https://www.bing.com/search?q=' + encodeURIComponent(q) },
  { id: 'baidu', name: '百度', logo: 'logos/baidu.svg', makeUrl: (q) => 'https://www.baidu.com/s?wd=' + encodeURIComponent(q) },
  { id: 'duckduckgo', name: 'DuckDuckGo', logo: 'logos/duckduckgo.svg', makeUrl: (q) => 'https://duckduckgo.com/?q=' + encodeURIComponent(q) },
  { id: 'sogou', name: '搜狗', logo: 'logos/sogou.svg', makeUrl: (q) => 'https://www.sogou.com/web?query=' + encodeURIComponent(q) },
  { id: 'so', name: '360 搜索', logo: 'logos/so.png', makeUrl: (q) => 'https://www.so.com/s?q=' + encodeURIComponent(q) },
  { id: 'yandex', name: 'Yandex', logo: 'logos/yandex.png', makeUrl: (q) => 'https://yandex.com/search/?text=' + encodeURIComponent(q) },
  { id: 'yahoo', name: 'Yahoo', logo: 'logos/yahoo.svg', makeUrl: (q) => 'https://search.yahoo.com/search?p=' + encodeURIComponent(q) },
  { id: 'brave', name: 'Brave', logo: 'logos/brave.svg', makeUrl: (q) => 'https://search.brave.com/search?q=' + encodeURIComponent(q) },
  { id: 'ecosia', name: 'Ecosia', logo: 'logos/ecosia.svg', makeUrl: (q) => 'https://www.ecosia.org/search?q=' + encodeURIComponent(q) },
]

export const AI_PROVIDERS = [
  { id: 'chatgpt', name: 'ChatGPT', logo: 'logos/openai.svg', makeUrl: (q) => 'https://chatgpt.com/?q=' + encodeURIComponent(q) },
  { id: 'googleai', name: 'Google AI', logo: 'logos/google.svg', makeUrl: (q) => 'https://www.google.com/search?udm=50&q=' + encodeURIComponent(q) },
  { id: 'claude', name: 'Claude', logo: 'logos/claude.svg', makeUrl: (q) => 'https://claude.ai/new?q=' + encodeURIComponent(q) },
  { id: 'perplexity', name: 'Perplexity', logo: 'logos/perplexity.svg', makeUrl: (q) => 'https://www.perplexity.ai/search?q=' + encodeURIComponent(q) },
  { id: 'copilot', name: 'Copilot', logo: 'logos/copilot.jpg', makeUrl: (q) => 'https://copilot.microsoft.com/?q=' + encodeURIComponent(q) },
  { id: 'mistral', name: 'Mistral', logo: 'logos/mistralai.svg', makeUrl: (q) => 'https://chat.mistral.ai/chat?q=' + encodeURIComponent(q) },
  { id: 'kimi', name: 'Kimi', logo: 'logos/kimi.png', makeUrl: (q) => 'https://www.kimi.com/_prefill_chat?send_immediately=true&force_search=false&prefill_prompt=' + encodeURIComponent(q) },
  { id: 'doubao', name: '豆包', logo: 'logos/doubao.png', makeUrl: (q) => 'https://www.doubao.com/chat/url-action?action=' + encodeURIComponent(JSON.stringify({ pluginId: 'Send_Message', payload: { text: q } })) },
  { id: 'baiduai', name: '百度 AI', logo: 'logos/baidu.svg', makeUrl: (q) => 'https://wenxin.baidu.com/search?word=' + encodeURIComponent(q) },
  { id: 'metaso', name: '秘塔', logo: 'logos/metaso.png', makeUrl: (q) => 'https://metaso.cn/?q=' + encodeURIComponent(q) },
]

export const findProvider = (list, id) => list.find((item) => item.id === id) || null

// target 形如 { type: 'engine' | 'ai', id: 'google' }
export const findTarget = (target) => {
  if (!target || !target.id) return null
  const list = target.type === 'ai' ? AI_PROVIDERS : SEARCH_ENGINES
  return findProvider(list, target.id)
}

export const buildTargetUrl = (target, query) => {
  const provider = findTarget(target)
  if (!provider || !provider.makeUrl) return ''
  return provider.makeUrl(query)
}
