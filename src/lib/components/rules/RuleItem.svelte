<script lang="ts">
  import { toggleRule, deleteRule } from '@/store/store';
  import { uiState } from '@/lib/stores/dashboard-store';
  import Switch from '@/lib/ui/Switch.svelte';

  export let rule: any;

  function handleEdit() {
    uiState.setEditingRule(rule.id);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="card">
  <div
    class="card-header"
    role="button"
    tabindex="0"
    aria-label="Edit rule {rule.method} {rule.url}"
    on:click={handleEdit}
  >
    <div class="badges">
      <span class="badge method" class:GET={rule.method === 'GET'} class:POST={rule.method === 'POST'} class:PUT={rule.method === 'PUT'} class:DELETE={rule.method === 'DELETE'}>{rule.method}</span>
      <span class="url" title={rule.url}>{rule.url}</span>
    </div>

    <div class="header-actions" role="button" tabindex="-1" on:click|stopPropagation>
      <button 
        class="action-btn del-btn rule-delete-btn" 
        title="Delete rule"
        on:click|stopPropagation={() => deleteRule(rule.id)}
      >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
      </button>
      <Switch checked={rule.enabled} onChange={() => toggleRule(rule.id)} />
    </div>
  </div>
  <div
    class="card-meta"
    role="button"
    tabindex="0"
    aria-label="Edit rule configuration"
    on:click={handleEdit}
  >
      <span class="meta-item">Status: <b>{rule.status}</b></span>
      <span class="meta-item">Delay: <b>{rule.delay}ms</b></span>
  </div>
</div>

<style>
  .card {
    background: var(--pm-bg);
    border-radius: 8px;
    margin-bottom: 12px;
    border: 1px solid var(--pm-border);
    transition: transform 0.2s, border-color 0.2s;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }

  .card:hover {
    border-color: var(--pm-border-focus);
    transform: translateY(-1px);
  }

  .card-header {
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
  }

  .badges {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0; 
  }

  .url {
    font-family: monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--pm-text-primary);
  }

  .card-meta {
    padding: 0 12px 12px;
    font-size: 11px;
    color: var(--pm-text-secondary);
    display: flex;
    gap: 12px;
    cursor: pointer;
  }

  .card-meta b {
    color: var(--pm-text-primary);
    font-weight: normal;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rule-delete-btn {
    opacity: 0;
    pointer-events: none;
    transform: translateX(5px);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    background: none;
    border: none;
    color: var(--pm-text-secondary);
    cursor: pointer;
    padding: 4px;
  }
  
  .rule-delete-btn:hover {
      color: var(--pm-danger);
  }

  .card:hover .rule-delete-btn {
    opacity: 1;
    pointer-events: auto;
    transform: translateX(0);
  }

  .badge {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: bold;
    text-transform: uppercase;
  }
  .method.GET { background: rgba(37, 99, 235, 0.15); color: #3b82f6; }
  .method.POST { background: rgba(5, 150, 105, 0.15); color: #10b981; }
  .method.PUT { background: rgba(217, 119, 6, 0.15); color: #f59e0b; }
  .method.DELETE { background: rgba(220, 38, 38, 0.15); color: #ef4444; }
</style>
