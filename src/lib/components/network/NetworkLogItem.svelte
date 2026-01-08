<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { requestLogs } from '@/store/log-store';
  import { addRule } from '@/store/store';
  import { uiState } from '@/lib/stores/dashboard-store';
  import { showToast } from '@/lib/ui/toast-store';
  import NetworkDetail from './NetworkDetail.svelte';

  export let log: any;
  export let expanded: boolean = false;

  const dispatch = createEventDispatcher();

  function createRuleFromLog(log: any) {
    let responseBody = log.responseBody;
    
    if (typeof responseBody === 'string') {
      try {
        responseBody = JSON.parse(responseBody);
      } catch (e) {
      }
    }

    if (!responseBody && responseBody !== 0) {
       responseBody = { message: "Mocked from " + log.url };
    }

    addRule(log.url, log.method, responseBody);
    uiState.setMainTab('rules');
    showToast("Rule created from network log", "success");
  }

  function handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    dispatch('menuRequest', { mouseEvent: e, log });
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div 
  class="log-item" 
  class:is-mock={log.isMock}
  class:expanded={expanded}
  on:click={() => uiState.toggleLogDetails(log.id)}
  on:contextmenu={handleContextMenu}
>
  <div class="log-header">
    <span class="status-badge" class:success={log.status >= 200 && log.status < 300} class:error={log.status >= 400}>{log.status}</span>
    <span class="method-badge">{log.method}</span>
    <span class="log-url" title={log.url}>{log.url}</span>
    <div class="log-actions" on:click|stopPropagation>
      {#if !log.isMock}
        <button class="action-btn mock-btn" title="Mock this request" on:click={() => createRuleFromLog(log)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      {/if}
      <button class="action-btn del-btn" title="Delete Log" on:click={() => requestLogs.remove(log.id)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>
  <div class="log-meta">
    <span class="duration">{log.duration}ms</span>
    <span class="source-badge">{log.isMock ? 'MOCK' : 'REAL'}</span>
    <span class="time">{new Date(log.timestamp).toLocaleTimeString()}</span>
  </div>
  
  {#if expanded}
    <NetworkDetail 
      {log} 
      activeTab={$uiState.activeLogDetailTab} 
      onTabChange={(tab) => uiState.setLogDetailTab(tab)} 
    />
  {/if}
</div>

<style>
  .log-item {
    background: var(--pm-bg);
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid var(--pm-border);
    border-left: 3px solid transparent;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }
  
  .log-item:hover {
    border-color: rgba(var(--pm-primary-rgb), 0.4);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 0 8px rgba(var(--pm-primary-rgb), 0.15);
    transform: translateY(-1px);
    z-index: 1;
  }
  
  .log-item.expanded {
    border-color: var(--pm-border-focus);
    background: var(--pm-hover-bg);
  }
  
  .log-item.is-mock {
    border-left-color: var(--pm-primary);
    background: rgba(var(--pm-primary-rgb), 0.05);
  }

  .log-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .status-badge {
    font-family: monospace;
    font-weight: bold;
    min-width: 30px;
  }
  .status-badge.success { color: #10b981; }
  .status-badge.error { color: #ef4444; }

  .log-url {
    color: var(--pm-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    font-size: 12px;
  }
  
  .log-actions {
    display: flex;
    gap: 4px;
  }
  
  .action-btn {
    background: none;
    border: none;
    color: var(--pm-text-secondary);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    transition: all 0.2s;
  }
  .action-btn:hover {
    background: var(--pm-hover-bg);
    color: var(--pm-text-primary);
  }
  .mock-btn:hover { color: var(--pm-primary); }
  .del-btn:hover { color: var(--pm-danger); }

  .log-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--pm-text-secondary);
    font-size: 10px;
  }
  
  .source-badge {
    font-weight: bold;
    opacity: 0.6;
    font-size: 9px;
    border: 1px solid currentColor;
    padding: 0 4px;
    border-radius: 3px;
  }
</style>
