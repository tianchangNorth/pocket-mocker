<script lang="ts">
  import { onMount } from 'svelte';
  import { rules, toggleRule, updateRuleResponse, addRule, deleteRule, updateRuleDelay, updateRuleStatus, updateRuleHeaders, updateRuleMethod, updateRuleUrl } from '../core/store';
  import { requestLogs } from '../core/log-store';
  import Button from './ui/Button.svelte';
  import Input from './ui/Input.svelte';
  import Select from './ui/Select.svelte';
  import Switch from './ui/Switch.svelte';
  import JsonEditor from './ui/JsonEditor.svelte';
  import Toast from './ui/Toast.svelte';
  import { showToast } from './ui/toast-store';
  
  // Control panel expand/collapse
  let minimized = false;
  // Currently editing rule ID
  let editingId: string | null = null;
  // Temporary edit content strings
  let editContent = "";
  let editHeadersContent = "";
  let editUrl = "";
  let editMethod = "GET";
  let editStatus: string = "200";
  let editDelay: string = "0";
  
  let activeTab: 'body' | 'headers' | 'config' = 'body';
  
  // Main tab status
  let activeMainTab: 'rules' | 'network' = 'rules';

  // New rule status
  let showAddPanel = false;
  let newRuleUrl = "";
  let newRuleMethod = "GET";

  const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];

  function createRuleFromLog(log: any) {
    let responseBody = log.responseBody;
    
    // Try to parse JSON string if applicable
    if (typeof responseBody === 'string') {
      try {
        responseBody = JSON.parse(responseBody);
      } catch (e) {
        // Keep as string if not valid JSON
      }
    }

    // If body is still empty string or undefined, use default
    if (!responseBody && responseBody !== 0) {
       responseBody = { message: "Mocked from " + log.url };
    }

    addRule(log.url, log.method, responseBody);
    activeMainTab = 'rules';
    showToast("Rule created from network log", "success");
  }

  function handleAddRule() {
    if (!newRuleUrl) {
      showToast("Please enter URL", "warning");
      return;
    }
    addRule(newRuleUrl, newRuleMethod);
    showAddPanel = false;
    newRuleUrl = "";
    newRuleMethod = "GET";
  }

  function startEdit(rule: any) {
    editingId = rule.id;
    activeTab = 'body';
    
    // Handle content display: if response is a string (function/code), show as is.
    // If object, format as JSON.
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
    if (editingId) {
      const successBody = updateRuleResponse(editingId, editContent);
      const successHeaders = updateRuleHeaders(editingId, editHeadersContent);
      
      if (successBody && successHeaders) {
        // Save other fields
        updateRuleUrl(editingId, editUrl);
        updateRuleMethod(editingId, editMethod);
        updateRuleStatus(editingId, parseInt(editStatus) || 200);
        updateRuleDelay(editingId, parseInt(editDelay) || 0);

        editingId = null; // Exit edit mode
        showToast("Rule saved successfully", "success");
      } else {
        showToast("Invalid JSON format, please check Body or Headers!", "error");
      }
    }
  }

  function cancelEdit() {
    editingId = null;
  }

  // Draggable logic
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialRight = 0; // Anchor to RIGHT
  let initialBottom = 0; // Anchor to BOTTOM
  let containerRef: HTMLDivElement;
  
  // Normalize position on mount to ensure consistent behavior
  onMount(() => {
    if (containerRef) {
      const rect = containerRef.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate distances
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

    // Prevent going off-screen right
    if (newRight < 0) newRight = 0;
    // Prevent going off-screen left
    if (newRight > viewportWidth - width) newRight = viewportWidth - width;

    // Prevent going off-screen bottom
    if (newBottom < 0) newBottom = 0;
    // Prevent going off-screen top (ensure header stays visible)
    if (newBottom > viewportHeight - height) newBottom = viewportHeight - height;

    // Update styles
    containerRef.style.right = `${newRight}px`;
    containerRef.style.bottom = `${newBottom}px`;
  }

  function handleMouseUp() {
    isDragging = false;
    // Restore transition for minimize/expand animations
    if (containerRef) {
       containerRef.style.transition = '';
    }
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }

  $: if (!minimized && containerRef) {
    const viewportHeight = window.innerHeight;
    // Match CSS max-height constraints
    const maxHeight = Math.min(600, viewportHeight * 0.85);
    
    // Get current bottom value
    const currentBottom = parseFloat(containerRef.style.bottom) || 0;
    
    // Calculate where the top would be after expansion
    const projectedTop = viewportHeight - currentBottom - maxHeight;
    
    // If top would be off-screen (or too close to top), shift down
    if (projectedTop < 24) {
      const newBottom = Math.max(0, viewportHeight - maxHeight - 24);
      containerRef.style.bottom = `${newBottom}px`;
    }
  }
</script>

<div 
  class="container" 
  class:minimized={minimized} 
  bind:this={containerRef}
>
  <Toast />
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="header" on:mousedown={handleMouseDown}>
    <div class="title-area">
      <h3>PocketMock</h3>
      {#if minimized && $rules.length > 0}
        <span class="rule-count">{$rules.length}</span>
      {/if}
      {#if !minimized}
        <div class="add-btn-wrapper" class:visible={activeMainTab === 'rules'}>
          <Button size="sm" variant="ghost" icon on:click={() => showAddPanel = !showAddPanel}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </Button>
        </div>
      {/if}
    </div>
    
    <button class="toggle-btn" on:click={() => minimized = !minimized} title={minimized ? 'Expand panel' : 'Collapse panel'}>
      {#if minimized}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      {:else}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14"/>
        </svg>
      {/if}
    </button>
  </div>

  {#if !minimized}
    <div class="main-tabs">
      <button class="main-tab-btn" class:active={activeMainTab === 'rules'} on:click={() => activeMainTab = 'rules'}>Rules</button>
      <button class="main-tab-btn" class:active={activeMainTab === 'network'} on:click={() => activeMainTab = 'network'}>Network</button>
    </div>
  {/if}

  {#if !minimized}
    <div class="content">
      {#if activeMainTab === 'rules'}
        {#if showAddPanel}
          <div class="add-panel">
            <div class="form-row">
              <div style="width: 100px;">
                <Select bind:value={newRuleMethod} options={METHODS} />
              </div>
              <div style="flex: 1;">
                <Input placeholder="/api/path" bind:value={newRuleUrl} />
              </div>
            </div>
            <div class="form-actions">
              <Button size="sm" on:click={() => showAddPanel = false}>Cancel</Button>
              <Button size="sm" variant="primary" on:click={handleAddRule}>Add Rule</Button>
            </div>
          </div>
        {/if}

        {#if $rules.length === 0 && !showAddPanel}
          <div class="empty-state">
            <div class="empty-icon">👋</div>
            <p>No active rules</p>
            <p class="sub-text">Click the + button above to mock your first API</p>
          </div>
        {:else}
          {#each $rules as rule (rule.id)}
            <div class="card" class:editing={editingId === rule.id}>
              {#if editingId === rule.id}
                <!-- Edit Mode -->
                <div class="editor-container">
                  <div class="editor-header">
                    <div class="editor-tabs" role="tablist">
                      <button
                        role="tab"
                        id="config-tab"
                        class:active={activeTab === 'config'}
                        aria-selected={activeTab === 'config'}
                        on:click={() => activeTab = 'config'}
                        on:keydown={(e) => {
                          if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            activeTab = activeTab === 'config' ? 'body' : activeTab === 'body' ? 'headers' : 'config';
                          } else if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            activeTab = activeTab === 'config' ? 'headers' : activeTab === 'body' ? 'config' : 'body';
                          }
                        }}
                      >Config</button>
                      <button
                        role="tab"
                        id="body-tab"
                        class:active={activeTab === 'body'}
                        aria-selected={activeTab === 'body'}
                        on:click={() => activeTab = 'body'}
                        on:keydown={(e) => {
                          if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            activeTab = activeTab === 'config' ? 'body' : activeTab === 'body' ? 'headers' : 'config';
                          } else if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            activeTab = activeTab === 'config' ? 'headers' : activeTab === 'body' ? 'config' : 'body';
                          }
                        }}
                      >Body</button>
                      <button
                        role="tab"
                        id="headers-tab"
                        class:active={activeTab === 'headers'}
                        aria-selected={activeTab === 'headers'}
                        on:click={() => activeTab = 'headers'}
                        on:keydown={(e) => {
                          if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            activeTab = activeTab === 'config' ? 'body' : activeTab === 'body' ? 'headers' : 'config';
                          } else if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            activeTab = activeTab === 'config' ? 'headers' : activeTab === 'body' ? 'config' : 'body';
                          }
                        }}
                      >Headers</button>
                    </div>
                    <div class="editor-actions">
                       <Button size="sm" variant="danger" icon on:click={() => {
                          deleteRule(rule.id);
                          editingId = null;
                       }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                       </Button>
                    </div>
                  </div>

                  <div class="editor-content">
                    {#if activeTab === 'config'}
                      <div class="config-grid">
                         <!-- svelte-ignore a11y-label-has-associated-control -->
                         <div class="field-group">
                            <label>Method</label>
                            <Select bind:value={editMethod} options={METHODS} />
                         </div>
                         <!-- svelte-ignore a11y-label-has-associated-control -->
                         <div class="field-group url-group">
                            <label>URL Pattern</label>
                            <Input bind:value={editUrl} />
                         </div>
                         <!-- svelte-ignore a11y-label-has-associated-control -->
                         <div class="field-group">
                            <label>Status</label>
                            <Input type="number" bind:value={editStatus} />
                         </div>
                         <!-- svelte-ignore a11y-label-has-associated-control -->
                         <div class="field-group">
                            <label>Delay (ms)</label>
                            <Input type="number" bind:value={editDelay} />
                         </div>
                      </div>
                    {:else if activeTab === 'body'}
                      <JsonEditor
                        value={editContent}
                        on:change={(e) => (editContent = e.detail)}
                      />
                    {:else}
                      <JsonEditor
                        value={editHeadersContent}
                        on:change={(e) => (editHeadersContent = e.detail)}
                      />
                    {/if}
                  </div>

                  <div class="editor-footer">
                    <Button size="sm" on:click={cancelEdit}>Cancel</Button>
                    <Button size="sm" variant="primary" on:click={saveEdit}>Save Changes</Button>
                  </div>
                </div>
              {:else}
                <!-- Preview Mode -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                  class="card-header"
                  role="button"
                  tabindex="0"
                  aria-label="Edit rule {rule.method} {rule.url}"
                  on:click={() => startEdit(rule)}
                  on:keydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      startEdit(rule);
                    }
                  }}
                >
                  <div class="badges">
                    <span class="badge method" class:GET={rule.method === 'GET'} class:POST={rule.method === 'POST'} class:PUT={rule.method === 'PUT'} class:DELETE={rule.method === 'DELETE'}>{rule.method}</span>
                    <span class="url" title={rule.url}>{rule.url}</span>
                  </div>
                  <!-- svelte-ignore a11y-no-static-element-interactions -->
                  <div class="header-actions" role="button" tabindex="-1" on:click|stopPropagation on:keydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleRule(rule.id);
                    }
                  }}>
                    <Switch checked={rule.enabled} onChange={() => toggleRule(rule.id)} />
                  </div>
                </div>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                  class="card-meta"
                  role="button"
                  tabindex="0"
                  aria-label="Edit rule configuration"
                  on:click={() => startEdit(rule)}
                  on:keydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      startEdit(rule);
                    }
                  }}
                >
                   <span class="meta-item">Status: <b>{rule.status}</b></span>
                   <span class="meta-item">Delay: <b>{rule.delay}ms</b></span>
                </div>
              {/if}
            </div>
          {/each}
        {/if}
      {:else if activeMainTab === 'network'}
        <div class="network-logs">
          {#if $requestLogs.length === 0}
            <div class="empty-state">
              <p>No request records</p>
            </div>
          {:else}
            {#each $requestLogs as log (log.id)}
              <div class="log-item" class:is-mock={log.isMock}>
                <div class="log-header">
                  <span class="status-badge" class:success={log.status >= 200 && log.status < 300} class:error={log.status >= 400}>{log.status}</span>
                  <span class="method-badge">{log.method}</span>
                  <span class="log-url" title={log.url}>{log.url}</span>
                  {#if !log.isMock}
                    <button class="mock-it-btn" title="Mock this request" on:click={() => createRuleFromLog(log)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </button>
                  {/if}
                </div>
                <div class="log-meta">
                  <span class="duration">{log.duration}ms</span>
                  <span class="source-badge">{log.isMock ? 'MOCK' : 'REAL'}</span>
                  <span class="time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* Reset & Base */
  * { box-sizing: border-box; }

  .container {
    /* --- Theme Variables (Default: Dark) --- */
    --pm-bg: #1a1a1a;
    --pm-bg-secondary: #252525; /* Cards, Log items */
    --pm-bg-tertiary: #2a2a2a; /* Editor, Minimized */
    
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

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--pm-bg-tertiary); /* Lighter/Darker header background */
    border-bottom: 1px solid var(--pm-border);
  }

  .title-area {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--pm-text-primary);
  }

  .rule-count {
    background: var(--pm-hover-bg);
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 11px;
    color: var(--pm-text-secondary);
  }

  .toggle-btn {
    background: transparent;
    border: none;
    color: var(--pm-text-secondary);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
  }

  .toggle-btn:hover {
    color: var(--pm-text-primary);
    background: var(--pm-hover-bg);
  }

  /* Tabs */
  .main-tabs {
    display: flex;
    padding: 0 16px;
    border-bottom: 1px solid var(--pm-border);
    background: var(--pm-bg-tertiary);
  }

  .main-tab-btn {
    flex: 1;
    padding: 10px;
    background: transparent;
    border: none;
    color: var(--pm-text-secondary);
    font-weight: 500;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  .main-tab-btn:hover {
    color: var(--pm-text-primary);
    background: var(--pm-hover-bg);
  }

  .main-tab-btn.active {
    color: var(--pm-primary);
    border-bottom-color: var(--pm-primary);
  }

  /* Content */
  .content {
    padding: 16px;
    overflow-y: auto;
    flex: 1;
    background: var(--pm-bg-secondary); /* Main content area bg */
  }

  /* Add Panel */
  .add-panel {
    background: var(--pm-bg-tertiary);
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    border: 1px solid var(--pm-border);
  }

  .form-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--pm-text-secondary);
  }

  .empty-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }

  .sub-text {
    font-size: 12px;
    margin-top: 4px;
    color: var(--pm-text-secondary);
    opacity: 0.8;
  }

  /* Card */
  .card {
    background: var(--pm-bg); /* Card stands out from secondary bg */
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

  .card.editing {
    border-color: var(--pm-primary);
    transform: none;
  }

  /* Preview Mode */
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
    min-width: 0; /* enable text truncation */
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

  /* Editor Mode */
  .editor-container {
    background: var(--pm-bg-tertiary);
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--pm-hover-bg);
    border-bottom: 1px solid var(--pm-border);
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

  .editor-content {
    padding: 12px;
    min-height: 200px;
    display: flex;
    flex-direction: column;
  }

  .config-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    flex: 1;
  }

  .url-group {
    grid-column: span 2;
  }

  .field-group label {
    display: block;
    font-size: 11px;
    color: var(--pm-text-secondary);
    margin-bottom: 4px;
  }



  .editor-footer {
    padding: 10px 12px;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    border-top: 1px solid var(--pm-border);
    background: var(--pm-hover-bg);
  }

  /* Badges */
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
  /* Adjust method colors for light mode visibility if needed, or stick to generic accessible colors */

  /* Logs */
  .network-logs {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .log-item {
    background: var(--pm-bg);
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid var(--pm-border);
    border-left: 3px solid transparent;
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
  
  .mock-it-btn {
    background: none;
    border: none;
    color: var(--pm-text-secondary);
    cursor: pointer;
    padding: 2px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    margin-left: 4px;
  }
  .mock-it-btn:hover {
    color: var(--pm-primary);
    background: var(--pm-hover-bg);
  }

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