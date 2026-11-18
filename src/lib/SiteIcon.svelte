<script>
  import { isDark } from './stores.js'
  import { resolveSiteIcon, getFaviconFallback, handleIconLoad } from './favicon.js'

  // 站点图标：按明暗选择自定义图标，加载成功后在后台缓存或探测更清晰的图标，加载失败时退回备用来源
  let { site, class: className = '', style = '' } = $props()

  const handleError = (event) => {
    if (site.iconSource !== 'custom') event.currentTarget.src = getFaviconFallback(site.url)
  }
</script>

<img
  src={resolveSiteIcon(site, $isDark)}
  alt=""
  class={className}
  {style}
  onload={(event) => handleIconLoad(event, site)}
  onerror={handleError}
/>
