<script lang="ts">
  import { deleteRule, updateRuleResponse, updateRuleHeaders, updateRuleUrl, updateRuleMethod, updateRuleStatus, updateRuleDelay } from '@/store/store';
  import { uiState } from '@/lib/stores/dashboard-store';
  import { showToast } from '@/lib/ui/toast-store';
  import Button from '@/lib/ui/Button.svelte';
  import Input from '@/lib/ui/Input.svelte';
  import Select from '@/lib/ui/Select.svelte';
  import JsonEditor from '@/lib/ui/JsonEditor.svelte';

  export let rule: any;

  let editContent = "";
  let editHeadersContent = "";
  let editUrl = "";
  let editMethod = "GET";
  let editStatus: string = "200";
  let editDelay: string = "0";
  
  const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];
  let currentRuleId: string | null = null;

  $: if (rule && rule.id !== currentRuleId) {
    currentRuleId = rule.id;
    
    if (typeof rule.response === 'string') {
      editContent = rule.response;
    } else {
      editContent = JSON.stringify(rule.response, null, 2);
    }
    
    editHeadersContent = JSON.stringify(rule.headers || {}, null, 2);
    editUrl = rule.url;
    editMethod = rule.method;
    editStatus = String(rule.status || 200);
    editDelay = String(rule.delay || 0);
  }

  function saveEdit() {
    if (rule.id) {
      const successBody = updateRuleResponse(rule.id, editContent);
      const successHeaders = updateRuleHeaders(rule.id, editHeadersContent);
      
      if (successBody && successHeaders) {
        updateRuleUrl(rule.id, editUrl);
        updateRuleMethod(rule.id, editMethod);
        updateRuleStatus(rule.id, parseInt(editStatus) || 200);
        updateRuleDelay(rule.id, parseInt(editDelay) || 0);

        uiState.setEditingRule(null);
        showToast("Rule saved successfully", "success");
      } else {
        showToast("Invalid JSON format, please check Body or Headers!", "error");
      }
    }
  }

  function cancelEdit() {
    uiState.setEditingRule(null);
  }
  
  function formatJSON() {
    try {
      const currentContent = $uiState.activeRuleTab === 'body' ? editContent : editHeadersContent;
      const parsed = JSON.parse(currentContent);
      const formatted = JSON.stringify(parsed, null, 2);
      
      if ($uiState.activeRuleTab === 'body') {
        editContent = formatted;
      } else {
        editHeadersContent = formatted;
      }
      showToast("JSON formatted", "success");
    } catch (e) {
      showToast("Invalid JSON, cannot format", "error");
    }
  }
</script>

<div class="editor-panel">
  <div class="rule-config-bar">
      <div class="rule-config-row primary">
        <div style="width: 110px;">
          <Select bind:value={editMethod} options={METHODS} />
        </div>
        <div style="flex: 1;">
          <Input placeholder="/api/path" bind:value={editUrl} />
        </div>
      </div>
      <div class="rule-config-row secondary">
        <div class="mini-field">
          <label for="status">Status</label>
          <Input id="status" type="number" bind:value={editStatus} />
        </div>
        <div class="mini-field">
          <label for="delay">Delay (ms)</label>
          <Input id="delay" type="number" bind:value={editDelay} />
        </div>
      </div>
  </div>

  <div class="editor-header">
    <div class="editor-tabs" role="tablist">
      <button
        role="tab"
        class:active={$uiState.activeRuleTab === 'body'}
        on:click={() => uiState.setRuleTab('body')}
      >Body</button>
      <button
        role="tab"
        class:active={$uiState.activeRuleTab === 'headers'}
        on:click={() => uiState.setRuleTab('headers')}
      >Headers</button>
    </div>
    <div class="editor-actions">
        <button class="action-btn" title="Format JSON" on:click={formatJSON}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10H3M21 6H3M21 14H3M21 18H3"/>
          </svg>
        </button>
        <div class="divider"></div>
        <Button size="sm" variant="danger" icon on:click={() => {
          deleteRule(rule.id);
          uiState.setEditingRule(null);
        }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        </Button>
    </div>
  </div>

  <div class="editor-content">
    {#if $uiState.activeRuleTab === 'body'}
      <JsonEditor
        value={editContent}
        on:change={(e) => (editContent = e.detail)}
        height="100%"
      />
    {:else}
      <JsonEditor
        value={editHeadersContent}
        on:change={(e) => (editHeadersContent = e.detail)}
        height="100%"
      />
    {/if}
  </div>

  <div class="editor-footer">
    <Button size="sm" on:click={cancelEdit}>Cancel</Button>
    <Button size="sm" variant="primary" on:click={saveEdit}>Save Changes</Button>
  </div>
</div>

<style>
  .editor-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--pm-bg-secondary);
    overflow: hidden;
  }

  .editor-panel .editor-header {
    background: var(--pm-bg-tertiary);
    border-bottom: 1px solid var(--pm-border);
    padding: 8px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .editor-actions {
    display: flex;
    align-items: center;
    gap: 8px;
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

  .divider {
    width: 1px;
    height: 16px;
    background: var(--pm-border);
    margin: 0 4px;
  }

  .rule-config-bar {
    padding: 16px;
    background: var(--pm-bg-tertiary);
    border-bottom: 1px solid var(--pm-border);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .rule-config-row {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .rule-config-row.primary {
    width: 100%;
  }

  .rule-config-row.secondary {
    width: 100%;
  }

  .mini-field {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .mini-field label {
    font-size: 11px;
    color: var(--pm-text-secondary);
    white-space: nowrap;
    min-width: 40px;
  }

  .editor-panel .editor-content {
    flex: 1;
    min-height: 0;
    overflow-y: hidden; 
    display: flex;
    flex-direction: column;
    padding: 0;
  }

  .editor-panel .editor-footer {
    background: var(--pm-bg-tertiary);
    border-top: 1px solid var(--pm-border);
    padding: 12px 16px;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .editor-tabs {
    display: flex;
    gap: 4px;
  }

  .editor-tabs button {
    background: transparent;
    border: none;
    color: var(--pm-text-secondary);
    padding: 4px 8px;
    font-size: 11px;
    cursor: pointer;
    border-radius: 4px;
  }

  .editor-tabs button:hover {
    color: var(--pm-text-primary);
    background: var(--pm-hover-bg);
  }

  .editor-tabs button.active {
    color: var(--pm-text-primary);
    background: var(--pm-hover-bg);
    font-weight: 500;
    background: rgba(125,125,125,0.1);
  }

  .editor-panel :global(.json-editor-container) {
    border-left: none;
    border-right: none;
    border-radius: 0;
  }
</style>
