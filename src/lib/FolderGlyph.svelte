<script>
  import { getFolderBackground, getFolderForeground, getFolderIconType, getFolderRadius } from './folders.js'

  let { folder, size = 32, className = '' } = $props()

  let bgColor = $derived(getFolderBackground(folder))
  let fgColor = $derived(getFolderForeground(folder))
  let iconType = $derived(getFolderIconType(folder))
  let radius = $derived(Math.max(12, Math.min(30, Math.round(getFolderRadius(folder) * 0.7))))
</script>

{#if iconType === 'custom' && folder?.folderCustomIcon}
  <img
    src={folder.folderCustomIcon}
    alt=""
    class={className}
    style="width: {size}px; height: {size}px; border-radius: {radius}%; object-fit: cover;"
  />
{:else}
  <div
    class={className}
    style="width: {size}px; height: {size}px; border-radius: {radius}%; background: {bgColor}; display: flex; align-items: center; justify-content: center;"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={Math.round(size * 0.62)}
      height={Math.round(size * 0.62)}
      viewBox="0 0 24 24"
      fill="none"
      stroke={fgColor}
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
  </div>
{/if}
