<script lang="ts">
  import { onMount } from 'svelte';
  import { uiState } from '@/lib/stores/dashboard-store';
  import Header from './Header.svelte';
  import Tabs from './Tabs.svelte';
  import Toast from '@/lib/ui/Toast.svelte';

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialRight = 0; 
  let initialBottom = 0;
  let containerRef: HTMLDivElement;
  
  onMount(() => {
    if (containerRef) {
      const rect = containerRef.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const right = viewportWidth - rect.right;
      const bottom = viewportHeight - rect.bottom;
      
      containerRef.style.top = 'auto';
      containerRef.style.left = 'auto';
      containerRef.style.right = `${right}px`;
      containerRef.style.bottom = `${bottom}px`;
    }
  });

  function handleMouseDown(e: MouseEvent) {
    // Only allow dragging from header, ignore buttons
    if ((e.target as HTMLElement).closest('button')) return;
    if ((e.target as HTMLElement).closest('input')) return;

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    
    const rect = containerRef.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate initial anchors
    initialRight = viewportWidth - rect.right;
    initialBottom = viewportHeight - rect.bottom;
    
    // Ensure we are using bottom/right positioning
    containerRef.style.top = 'auto';
    containerRef.style.left = 'auto';
    containerRef.style.right = `${initialRight}px`;
    containerRef.style.bottom = `${initialBottom}px`;
    
    // Disable transition during drag for instant follow
    containerRef.style.transition = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    let newRight = initialRight - dx;
    let newBottom = initialBottom - dy;

    // Boundary clamping
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = containerRef.offsetWidth;
    const height = containerRef.offsetHeight;

    if (newRight < 0) newRight = 0;
    if (newRight > viewportWidth - width) newRight = viewportWidth - width;
    if (newBottom < 0) newBottom = 0;
    if (newBottom > viewportHeight - height) newBottom = viewportHeight - height;

    containerRef.style.right = `${newRight}px`;
    containerRef.style.bottom = `${newBottom}px`;
  }

  function handleMouseUp() {
    isDragging = false;
    if (containerRef) {
       containerRef.style.transition = '';
    }
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }

  $: if (!$uiState.minimized && containerRef) {
    const viewportHeight = window.innerHeight;
    const maxHeight = Math.min(600, viewportHeight * 0.85);
    
    const currentBottom = parseFloat(containerRef.style.bottom) || 0;
    
    const projectedTop = viewportHeight - currentBottom - maxHeight;
    
    if (projectedTop < 24) {
      const newBottom = Math.max(0, viewportHeight - maxHeight - 24);
      containerRef.style.bottom = `${newBottom}px`;
    }
  }
</script>

<div 
  class="container" 
  class:minimized={$uiState.minimized} 
  class:editing-mode={!!$uiState.editingRuleId && !$uiState.minimized}
  bind:this={containerRef}
>
  <Header on:mousedown={handleMouseDown} />

  {#if !$uiState.minimized}
    <Toast />
    
    {#if !$uiState.editingRuleId}
      <Tabs />
    {/if}

    <div class="content" class:no-padding={!!$uiState.editingRuleId}>
      <slot />
    </div>
  {/if}
</div>

<style>
  :host::-webkit-scrollbar,
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  :host::-webkit-scrollbar-track,
  ::-webkit-scrollbar-track {
    background: var(--pm-bg-secondary);
    border-radius: 4px;
  }
  :host::-webkit-scrollbar-thumb,
  ::-webkit-scrollbar-thumb {
    background: var(--pm-text-secondary); 
    border-radius: 4px;
    border: 2px solid var(--pm-bg-secondary); 
  }
  :host::-webkit-scrollbar-thumb:hover,
  ::-webkit-scrollbar-thumb:hover {
    background: var(--pm-text-primary);
  }
  :host::-webkit-scrollbar-corner,
  ::-webkit-scrollbar-corner {
    background: transparent;
  }

  * { box-sizing: border-box; }

  .container {
    --pm-bg: #1a1a1a;
    --pm-bg-secondary: #252525; 
    --pm-bg-tertiary: #2a2a2a;
    
    --pm-border: rgba(255,255,255,0.08);
    --pm-border-focus: rgba(255,255,255,0.2);
    
    --pm-text-primary: #e0e0e0;
    --pm-text-secondary: #888;
    --pm-text-placeholder: #666;
    
    --pm-primary: #646cff;
    --pm-primary-hover: #747bff;
    
    --pm-danger: #ff4646;
    --pm-danger-bg: rgba(255, 70, 70, 0.1);
    
    --pm-shadow: 0 10px 40px rgba(0,0,0,0.4);
    --pm-hover-bg: rgba(255,255,255,0.05);

    /* Component specific mappings */
    --pm-input-bg: #111;
    --pm-input-bg-focus: #000;
    
    --pm-btn-secondary-bg: #333;
    --pm-btn-secondary-hover: #444;
    
    --pm-switch-off: #444;

    /* Layout */
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 400px;
    background: var(--pm-bg);
    color: var(--pm-text-primary);
    border-radius: 12px;
    box-shadow: var(--pm-shadow), 0 0 0 1px var(--pm-border);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 13px;
    line-height: 1.5;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
    height: 600px;
    max-height: 85vh;
    z-index: 99999;
    overflow: hidden;
  }

  /* Light Mode Override */
  @media (prefers-color-scheme: light) {
    .container {
      --pm-bg: #ffffff;
      --pm-bg-secondary: #ffffff;
      --pm-bg-tertiary: #f8fafc;
      
      --pm-border: #e2e8f0;
      --pm-border-focus: #cbd5e1;
      
      --pm-text-primary: #1e293b;
      --pm-text-secondary: #64748b;
      --pm-text-placeholder: #94a3b8;
      
      --pm-primary: #2563eb;
      --pm-primary-hover: #1d4ed8;
      
      --pm-danger: #dc2626;
      --pm-danger-bg: #fee2e2;
      
      --pm-shadow: 0 10px 30px -5px rgba(0,0,0,0.15);
      --pm-hover-bg: rgba(0,0,0,0.04);

      --pm-input-bg: #fff;
      --pm-input-bg-focus: #fff;
      
      --pm-btn-secondary-bg: #fff;
      --pm-btn-secondary-hover: #f1f5f9;
      
      --pm-switch-off: #e2e8f0;
    }
  }

  .container.minimized {
    width: auto;
    min-width: 140px;
    height: auto;
    background: var(--pm-bg-tertiary);
  }

  .container.editing-mode {
    width: 800px;
    height: 80vh;
    max-height: 90vh;
  }

  @media (max-width: 820px) {
    .container.editing-mode {
      width: 95vw;
      height: 90vh;
      right: 2.5vw !important;
      bottom: 5vh !important;
    }
  }

  .content {
    padding: 16px;
    overflow-y: auto;
    flex: 1;
    background: var(--pm-bg-secondary); 
  }
  
  .content.no-padding {
      padding: 0;
      overflow-y: hidden;
  }
</style>
