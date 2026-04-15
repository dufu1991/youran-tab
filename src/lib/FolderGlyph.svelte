<script>
  import { getFolderBackground, getFolderForeground, getFolderIconScale, getFolderIconType, getFolderRadius, getFolderShowBackground } from './folders.js'

  let { folder, size = 32, className = '' } = $props()

  let bgColor = $derived(getFolderBackground(folder))
  let fgColor = $derived(getFolderForeground(folder))
  let scale = $derived(getFolderIconScale(folder))
  let iconType = $derived(getFolderIconType(folder))
  let showBackground = $derived(getFolderShowBackground(folder))
  let radius = $derived(Math.max(12, Math.min(30, Math.round(getFolderRadius(folder) * 0.7))))
  let iconSize = $derived(Math.round(size * scale / 100))
  let iconRadius = $derived(Math.max(10, Math.min(28, Math.round(radius * scale / 100))))
</script>

<div
  class={className}
  style="width: {size}px; height: {size}px; display: flex; align-items: center; justify-content: center;"
>
  <div
    style="width: {showBackground ? size : iconSize}px; height: {showBackground ? size : iconSize}px; border-radius: {showBackground ? radius : iconRadius}%; background: {showBackground ? bgColor : 'transparent'}; display: flex; align-items: center; justify-content: center;"
  >
    {#if (iconType === 'custom' || iconType === 'svg') && folder?.folderCustomIcon}
      <img
        src={folder.folderCustomIcon}
        alt=""
        style="width: {iconSize}px; height: {iconSize}px; border-radius: {iconRadius}%; object-fit: cover;"
      />
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke={showBackground ? fgColor : bgColor}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 12h.01" />
        <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <path d="M22 13a18.15 18.15 0 0 1-20 0" />
        <rect width="20" height="14" x="2" y="6" rx="2" />
      </svg>
    {/if}
  </div>
</div>
