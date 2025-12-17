<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { uiState } from '@/lib/stores/dashboard-store';
  import Header from './Header.svelte';
  import Tabs from './Tabs.svelte';

  let isDragging = false;
  let isResizing = false;
  let resizeDirection = '';
  let startX = 0;
  let startY = 0;
  let initialRight = 0; 
  let initialBottom = 0;
  let initialWidth = 0;
  let initialHeight = 0;
  let hasMoved = false;
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
    adjustPosition();
  }

  $: if (!$uiState.minimized) {
    adjustPosition();
  }

  async function adjustPosition() {
    await tick();
    if (!containerRef) return;

    const rect = containerRef.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 20;

    let currentRight = parseFloat(containerRef.style.right) || 0;
    let currentBottom = parseFloat(containerRef.style.bottom) || 0;
    let needsUpdate = false;

    const maxBottom = viewportHeight - rect.height - padding;
    if (currentBottom > maxBottom) {
      currentBottom = Math.max(padding, maxBottom);
      needsUpdate = true;
    }

    if (currentBottom < padding) {
      currentBottom = padding;
      needsUpdate = true;
    }

    const maxRight = viewportWidth - rect.width - padding;
    if (currentRight > maxRight) {
      currentRight = Math.max(padding, maxRight);
      needsUpdate = true;
    }

    if (currentRight < padding) {
      currentRight = padding;
      needsUpdate = true;
    }

    if (needsUpdate) {
      containerRef.style.right = `${currentRight}px`;
      containerRef.style.bottom = `${currentBottom}px`;
      
      initialRight = currentRight;
      initialBottom = currentBottom;
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

    containerRef.style.transition = 'none';

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
    if (containerRef) {
       containerRef.style.transition = '';
    }
    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', handleResizeEnd);
  }

  function handleMouseDown(e: MouseEvent) {
    if ((e.target as HTMLElement).closest('button')) return;
    if ((e.target as HTMLElement).closest('input')) return;
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;

    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    
    const rect = containerRef.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    initialRight = viewportWidth - rect.right;
    initialBottom = viewportHeight - rect.bottom;
    
    containerRef.style.transition = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    if (!hasMoved) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasMoved = true;
        containerRef.style.top = 'auto';
        containerRef.style.left = 'auto';
      } else {
        return;
      }
    }
    
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
    if (isDragging && !hasMoved && $uiState.minimized) {
      uiState.toggleMinimized();
    }
    isDragging = false;
    if (containerRef) {
       containerRef.style.transition = '';
    }
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
    --pm-bg: rgba(26, 26, 26, 0.75);
    --pm-bg-secondary: rgba(37, 37, 37, 0.6); 
    --pm-bg-tertiary: rgba(42, 42, 42, 0.6);
    
    --pm-border: rgba(255,255,255,0.1);
    --pm-border-focus: rgba(255,255,255,0.25);
    
    --pm-text-primary: #f0f0f0;
    --pm-text-secondary: #9ca3af;
    --pm-text-placeholder: #6b7280;
    
    --pm-primary: #818cf8;
    --pm-primary-rgb: 129, 140, 248;
    --pm-primary-hover: #a5b4fc;
    
    --pm-danger: #f87171;
    --pm-danger-bg: rgba(248, 113, 113, 0.15);
    
    --pm-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1);
    --pm-hover-bg: rgba(255,255,255,0.08);

    --pm-input-bg: rgba(0,0,0,0.3);
    --pm-input-bg-focus: rgba(0,0,0,0.5);
    
    --pm-btn-secondary-bg: rgba(255,255,255,0.05);
    --pm-btn-secondary-hover: rgba(255,255,255,0.1);
    
    --pm-switch-off: rgba(255,255,255,0.15);

    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--pm-bg);
    color: var(--pm-text-primary);
    border-radius: 16px;
    box-shadow: var(--pm-shadow);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 13px;
    line-height: 1.5;
    display: flex;
    flex-direction: column;
    z-index: 99999;
    overflow: hidden;
    transition: width 0.1s ease, height 0.1s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
      --pm-bg: rgba(255, 255, 255, 0.75);
      --pm-bg-secondary: rgba(255, 255, 255, 0.6);
      --pm-bg-tertiary: rgba(248, 250, 252, 0.7);
      
      --pm-border: rgba(226, 232, 240, 0.6);
      --pm-border-focus: rgba(203, 213, 225, 0.8);
      
      --pm-text-primary: #1e293b;
      --pm-text-secondary: #64748b;
      --pm-text-placeholder: #94a3b8;
      
      --pm-primary: #3b82f6;
      --pm-primary-rgb: 59, 130, 246;
      --pm-primary-hover: #2563eb;
      
      --pm-danger: #ef4444;
      --pm-danger-bg: rgba(254, 226, 226, 0.7);
      
      --pm-shadow: 0 20px 40px -5px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
      --pm-hover-bg: rgba(0,0,0,0.05);

      --pm-input-bg: rgba(255,255,255,0.6);
      --pm-input-bg-focus: rgba(255,255,255,0.9);
      
      --pm-btn-secondary-bg: rgba(255,255,255,0.5);
      --pm-btn-secondary-hover: rgba(255,255,255,0.8);
      
      --pm-switch-off: rgba(226, 232, 240, 0.8);
    }
  }

  .container.minimized {
    width: auto;
    min-width: 140px;
    height: auto;
    background: var(--pm-bg-tertiary);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-origin: bottom right;
    border-radius: 24px;
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    border: 2px solid transparent;
  }

  @keyframes rotate-border {
    to {
      --pm-border-angle: 360deg;
    }
  }

  .container.minimized:hover {
    box-shadow: 0 12px 32px rgba(0,0,0,0.2), 
                0 0 20px rgba(var(--pm-primary-rgb), 0.2);
    transform: scale(1.05) translateY(-2px);
    z-index: 100000;
    
    background: 
      linear-gradient(var(--pm-bg-tertiary), var(--pm-bg-tertiary)) padding-box,
      conic-gradient(from var(--pm-border-angle), 
        rgba(var(--pm-primary-rgb), 0.1) 0%, 
        var(--pm-primary) 50%, 
        rgba(var(--pm-primary-rgb), 0.1) 100%
      ) border-box;
    border: 2px solid transparent;
    animation: rotate-border 4s linear infinite;
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

<svelte:head>
  <style>
    @property --pm-border-angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }
  </style>
</svelte:head>
