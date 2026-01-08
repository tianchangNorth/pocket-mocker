<script context="module" lang="ts">
  export interface MenuItem {
    label?: string;
    action?: string;
    type?: 'item' | 'separator';
    disabled?: boolean;
    data?: any;
  }
</script>

<script lang="ts">
  import { createEventDispatcher, tick, onDestroy } from 'svelte';

  export let x: number;
  export let y: number;
  export let items: MenuItem[] = [];
  export let visible: boolean = false;

  const dispatch = createEventDispatcher();

  let menuElement: HTMLElement;
  
  // 响应式位置调整
  let adjustedX = 0;
  let adjustedY = 0;

  $: if (visible && menuElement) {
    // 移动到 correct root (ShadowRoot or body) 确保不被遮挡且保留样式
    const root = menuElement.getRootNode();
    const target = root instanceof ShadowRoot ? root : document.body;
    
    if (menuElement.parentElement !== target) {
        target.appendChild(menuElement);
    }
    tick().then(() => {
      adjustPosition();
      addListeners();
    });
  } else if (!visible) {
    removeListeners();
  }

  // 组件销毁时移除
  onDestroy(() => {
    if (menuElement && menuElement.parentElement) {
        menuElement.parentElement.removeChild(menuElement);
    }
    removeListeners();
  });

  function adjustPosition() {
    if (!menuElement) return;
    
    const rect = menuElement.getBoundingClientRect();
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    if (x + rect.width > winWidth) adjustedX = winWidth - rect.width - 10;
    else adjustedX = x;

    if (y + rect.height > winHeight) adjustedY = winHeight - rect.height - 10;
    else adjustedY = y;
  }

  function handleClickOutside(event: MouseEvent) {
    if (visible && menuElement && !menuElement.contains(event.target as Node)) {
      dispatch('close');
    }
  }

  function handleItemClick(item: MenuItem) {
    if (item.disabled || item.type === 'separator') return;
    dispatch('select', item);
    dispatch('close');
  }

  function addListeners() {
    // 延迟添加，避免当前点击立即触发关闭
    setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('contextmenu', handleClickOutside);
    }, 50);
  }

  function removeListeners() {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('contextmenu', handleClickOutside);
  }
</script>

<div
  class="context-menu"
  style="top: {adjustedY}px; left: {adjustedX}px; display: {visible ? 'block' : 'none'};"
  bind:this={menuElement}
>
  {#each items as item}
    {#if item.type === 'separator'}
      <div class="separator"></div>
    {:else}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="menu-item"
        class:disabled={item.disabled}
        on:click={() => handleItemClick(item)}
      >
        {item.label}
      </div>
    {/if}
  {/each}
</div>

<style>
  .context-menu {
    position: fixed;
    z-index: 2147483647;
    background: var(--pm-bg-secondary, #252525);
    border: 1px solid var(--pm-border, rgba(255, 255, 255, 0.1));
    border-radius: 6px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 0 1px rgba(255, 255, 255, 0.1);
    padding: 4px;
    min-width: 180px;
    font-size: 12px;
    color: var(--pm-text-primary, #f0f0f0);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .menu-item {
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    border-radius: 4px;
    transition: all 0.15s ease;
    margin: 1px 0;
  }

  .menu-item:hover:not(.disabled) {
    background: var(--pm-primary, #818cf8);
    color: #ffffff;
  }

  .menu-item.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .separator {
    height: 1px;
    background: var(--pm-border, rgba(255, 255, 255, 0.1));
    margin: 4px;
  }
</style>