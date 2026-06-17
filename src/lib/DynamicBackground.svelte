<script>
  import { getDynamicPreviewStyle } from './stores.js'
  import { mountDynamicBackground } from './dynamicBackgroundRuntime.js'

  let { preset = null } = $props()
  let host = $state(null)
  let fallbackStyle = $derived(preset ? getDynamicPreviewStyle(preset) : '')

  $effect(() => {
    if (!host || !preset) return
    return mountDynamicBackground(host, preset)
  })
</script>

<div bind:this={host} class="dynamic-background-host pointer-events-none absolute inset-0 overflow-hidden" style={fallbackStyle}></div>

<style>
  :global(.dynamic-background-host canvas) {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
