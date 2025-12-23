<script lang="ts">
  import type { MockGroup, MockRule } from '@/core/types';
  import { toggleGroupCollapse, updateGroup, deleteGroup } from '@/store/store';
  import RuleItem from './RuleItem.svelte';

  export let group: MockGroup;
  export let rules: MockRule[];

  let isEditing = false;
  let tempName = group.name;

  function handleToggle() {
    toggleGroupCollapse(group.id);
  }

  function handleSaveName() {
    if (tempName.trim()) {
      updateGroup(group.id, tempName);
    } else {
      tempName = group.name;
    }
    isEditing = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') {
      tempName = group.name;
      isEditing = false;
    }
  }
  
  function focusNode(node: HTMLElement) {
      node.focus();
  }
</script>

<div class="group-container">
  <div class="group-header" class:collapsed={group.collapsed}>
    <button class="toggle-btn" on:click={handleToggle}>
      <svg 
        class="arrow-icon" 
        class:rotated={!group.collapsed}
        viewBox="0 0 24 24" 
        width="16" 
        height="16" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
    
    <div class="group-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
    </div>

    <div class="group-title">
      {#if isEditing}
        <input 
            use:focusNode
            class="name-input"
            bind:value={tempName} 
            on:blur={handleSaveName} 
            on:keydown={handleKeydown} 
        />
      {:else}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="name-text" on:dblclick={() => isEditing = true} title="Double click to rename">{group.name}</span>
        <span class="count">({rules.length})</span>
      {/if}
    </div>

    <div class="actions">
      <button class="action-btn" on:click|stopPropagation={() => isEditing = !isEditing} title="Rename Group">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
      <button class="action-btn danger" on:click|stopPropagation={() => deleteGroup(group.id)} title="Delete Group (Rules will be ungrouped)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  </div>

  {#if !group.collapsed}
    <div class="group-content">
      {#each rules as rule (rule.id)}
        <div class="rule-wrapper">
             <RuleItem {rule} />
        </div>
      {/each}
      {#if rules.length === 0}
        <div class="empty-group">Empty Group</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .group-container {
    margin-bottom: 8px;
    border-radius: 6px;
    background: var(--pm-bg-secondary);
  }

  .group-header {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    user-select: none;
    border-radius: 6px;
    transition: background-color 0.2s;
  }

  .group-header:hover {
    background: var(--pm-bg-tertiary);
  }
  
  .group-header.collapsed {
      opacity: 0.8;
  }

  .toggle-btn {
    background: none;
    border: none;
    padding: 0;
    margin-right: 8px;
    color: var(--pm-text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .arrow-icon {
    transition: transform 0.2s;
  }
  
  .arrow-icon.rotated {
    transform: rotate(90deg);
  }
  
  .group-icon {
      margin-right: 8px;
      color: var(--pm-primary);
      display: flex;
  }

  .group-title {
    flex: 1;
    display: flex;
    align-items: center;
    font-weight: 500;
    color: var(--pm-text-primary);
    font-size: 13px;
    overflow: hidden;
  }
  
  .name-input {
      background: var(--pm-bg-primary);
      border: 1px solid var(--pm-primary);
      color: var(--pm-text-primary);
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 13px;
      outline: none;
      width: 150px;
  }
  
  .name-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
  }

  .count {
    margin-left: 8px;
    font-size: 12px;
    color: var(--pm-text-secondary);
    font-weight: normal;
  }

  .actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .group-header:hover .actions {
    opacity: 1;
  }

  .action-btn {
    background: transparent;
    border: none;
    color: var(--pm-text-secondary);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
  }

  .action-btn:hover {
    background: var(--pm-hover-bg);
    color: var(--pm-text-primary);
  }

  .action-btn.danger:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .group-content {
    padding-left: 12px;
    position: relative;
    padding-bottom: 2px;
  }
  
  .group-content::before {
      content: '';
      position: absolute;
      left: 19px; /* align with arrow */
      top: 0;
      bottom: 10px;
      width: 1px;
      background: var(--pm-border);
      opacity: 0.5;
  }
  
  .rule-wrapper {
      position: relative;
      padding-left: 16px; /* space for the line connection */
  }
  
  .rule-wrapper::before {
      content: '';
      position: absolute;
      left: 7px;
      top: 24px; /* Approximate middle of rule item */
      width: 10px;
      height: 1px;
      background: var(--pm-border);
      opacity: 0.5;
  }

  .empty-group {
    padding: 12px;
    text-align: center;
    font-size: 12px;
    color: var(--pm-text-secondary);
    font-style: italic;
    padding-left: 28px;
  }
</style>
