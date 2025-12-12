<script lang="ts">
  import { onMount } from 'svelte';
  import { uiState } from '@/lib/stores/dashboard-store';
  import Header from './Header.svelte';
  import Tabs from './Tabs.svelte';
  import Toast from '@/lib/ui/Toast.svelte';

  let isDragging = false;
  let isResizing = false;
  let resizeDirection = '';
  let startX = 0;
  let startY = 0;
  let initialRight = 0; 
  let initialBottom = 0;
  let initialWidth = 0;
  let initialHeight = 0;
  let containerRef: HTMLDivElement;
  
  let width = 400;
  let height = 600;
  
  let lastWidth = 0;
  let lastHeight = 0;
  let isEditing = false;

  $: if (!!$uiState.editingRuleId !== isEditing) {
    isEditing = !!$uiState.editingRuleId;
    
    if (isEditing) {
      lastWidth = width;
      lastHeight = height;

      if (width < 800) width = 680;
      if (height < 800) height = 800;
      
      if (width > window.innerWidth - 40) width = window.innerWidth - 40;
      if (height > window.innerHeight - 40) height = window.innerHeight - 40;
    } else {
      if (lastWidth > 0) width = lastWidth;
      if (lastHeight > 0) height = lastHeight;
    }
  }

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

  function handleResizeStart(e: MouseEvent, direction: string) {
    e.stopPropagation();
    e.preventDefault();
    isResizing = true;
    resizeDirection = direction;
    startX = e.clientX;
    startY = e.clientY;
    initialWidth = containerRef.offsetWidth;
    initialHeight = containerRef.offsetHeight;
    
    const rect = containerRef.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    initialRight = viewportWidth - rect.right;
    initialBottom = viewportHeight - rect.bottom;

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
  }

  function handleResizeMove(e: MouseEvent) {
    if (!isResizing) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (resizeDirection === 'left' || resizeDirection === 'corner') {
      const newWidth = initialWidth - dx;
      if (newWidth >= 400 && newWidth <= window.innerWidth - 20) {
        width = newWidth;
      }
    }

    if (resizeDirection === 'right') {
      const newWidth = initialWidth + dx;
      if (newWidth >= 400 && newWidth <= window.innerWidth - 20) {
        width = newWidth;
        containerRef.style.right = `${initialRight - dx}px`;
      }
    }

    if (resizeDirection === 'top' || resizeDirection === 'corner') {
      const newHeight = initialHeight - dy;
      if (newHeight >= 600 && newHeight <= window.innerHeight - 20) {
        height = newHeight;
      }
    }

    if (resizeDirection === 'bottom') {
      const newHeight = initialHeight + dy;
      if (newHeight >= 600 && newHeight <= window.innerHeight - 20) {
        height = newHeight;
        containerRef.style.bottom = `${initialBottom - dy}px`;
      }
    }
  }

  function handleResizeEnd() {
    isResizing = false;
    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', handleResizeEnd);
  }

  function handleMouseDown(e: MouseEvent) {
    if ((e.target as HTMLElement).closest('button')) return;
    if ((e.target as HTMLElement).closest('input')) return;
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    
    const rect = containerRef.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    initialRight = viewportWidth - rect.right;
    initialBottom = viewportHeight - rect.bottom;
    
    containerRef.style.top = 'auto';
    containerRef.style.left = 'auto';
    containerRef.style.right = `${initialRight}px`;
    containerRef.style.bottom = `${initialBottom}px`;
    
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

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const w = containerRef.offsetWidth;
    const h = containerRef.offsetHeight;

    if (newRight < 0) newRight = 0;
    if (newRight > viewportWidth - w) newRight = viewportWidth - w;
    if (newBottom < 0) newBottom = 0;
    if (newBottom > viewportHeight - h) newBottom = viewportHeight - h;

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
</script>

<div 
  class="container" 
  class:minimized={$uiState.minimized} 
  class:editing-mode={!!$uiState.editingRuleId && !$uiState.minimized}
  bind:this={containerRef}
  style:width={!$uiState.minimized ? `${width}px` : null}
  style:height={!$uiState.minimized ? `${height}px` : null}
>
  {#if !$uiState.minimized}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="resize-handle left" on:mousedown={(e) => handleResizeStart(e, 'left')}></div>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="resize-handle top" on:mousedown={(e) => handleResizeStart(e, 'top')}></div>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="resize-handle right" on:mousedown={(e) => handleResizeStart(e, 'right')}></div>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="resize-handle bottom" on:mousedown={(e) => handleResizeStart(e, 'bottom')}></div>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="resize-handle corner" on:mousedown={(e) => handleResizeStart(e, 'corner')}></div>
  {/if}

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

    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--pm-bg);
    color: var(--pm-text-primary);
    border-radius: 12px;
    box-shadow: var(--pm-shadow), 0 0 0 1px var(--pm-border);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 13px;
    line-height: 1.5;
    display: flex;
    flex-direction: column;
    z-index: 99999;
    overflow: hidden;
  }

  .resize-handle {
    position: absolute;
    z-index: 100;
    background: transparent;
  }

  .resize-handle.left {
    top: 0;
    bottom: 0;
    left: 0px;
    width: 6px;
    cursor: ew-resize;
  }

  .resize-handle.right {
    top: 0;
    bottom: 0;
    right: 0px;
    width: 6px;
    cursor: ew-resize;
  }

  .resize-handle.top {
    left: 0;
    right: 0;
    top: 0px;
    height: 6px;
    cursor: ns-resize;
  }

  .resize-handle.bottom {
    left: 0;
    right: 0;
    bottom: 0px;
    height: 6px;
    cursor: ns-resize;
  }

  .resize-handle.corner {
    top: 0px;
    left: 0px;
    width: 12px;
    height: 12px;
    cursor: nwse-resize;
    z-index: 101;
  }

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
