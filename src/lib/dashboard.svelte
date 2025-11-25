<script lang="ts">
  import { rules, toggleRule, updateRuleResponse, addRule, deleteRule, updateRuleDelay, updateRuleStatus, updateRuleHeaders } from '../core/store';
  import { requestLogs } from '../core/log-store';
  
  // Control panel expand/collapse
  let minimized = false;
  // Currently editing rule ID
  let editingId: string | null = null;
  // Temporary edit content strings
  let editContent = "";
  let editHeadersContent = "";
  let activeTab: 'body' | 'headers' = 'body';
  
  // Main tab status
  let activeMainTab: 'rules' | 'network' = 'rules';

  // New rule status
  let showAddPanel = false;
  let newRuleUrl = "";
  let newRuleMethod = "GET";

  function handleAddRule() {
    if (!newRuleUrl) {
      alert("Please enter URL");
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
    // Format JSON with 2-space indent
    editContent = JSON.stringify(rule.response, null, 2);
    editHeadersContent = JSON.stringify(rule.headers || {}, null, 2);
  }

  function saveEdit() {
    if (editingId) {
      const successBody = updateRuleResponse(editingId, editContent);
      const successHeaders = updateRuleHeaders(editingId, editHeadersContent);
      
      if (successBody && successHeaders) {
        editingId = null; // Exit edit mode
      } else {
        alert("Invalid JSON format, please check Body or Headers!");
      }
    }
  }

  function cancelEdit() {
    editingId = null;
  }
</script>

<div class="container" class:minimized={minimized}>
  <div class="header">
    <div class="title-area">
      <h3>PocketMock</h3>
      {#if minimized && $rules.length > 0}
        <span class="rule-count">{$rules.length}</span>
      {/if}
      {#if !minimized && activeMainTab === 'rules'}
        <button class="icon-btn" on:click={() => showAddPanel = !showAddPanel} title="Add rule">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      {/if}
    </div>
    
    <button class="toggle-btn" on:click={() => minimized = !minimized} title={minimized ? 'Expand panel' : 'Collapse panel'}>
      {#if minimized}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M3 5h6v2H3z"/>
        </svg>
      {:else}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M3 7l3-3 3 3z"/>
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
              <select bind:value={newRuleMethod}>
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
              <input type="text" placeholder="/api/path" bind:value={newRuleUrl} />
            </div>
            <div class="form-actions">
              <button class="btn-secondary" on:click={() => showAddPanel = false}>Cancel</button>
              <button class="btn-primary" on:click={handleAddRule}>Add</button>
            </div>
          </div>
        {/if}

        {#if $rules.length === 0 && !showAddPanel}
          <div class="empty-state">
            <p>No interception rules</p>
            <p style="font-size: 12px; margin-top: 8px;">Rules will appear automatically after making requests</p>
          </div>
        {:else}
          {#each $rules as rule (rule.id)}
            <div class="card">
              <div class="card-header">
                <div class="badges">
                  <span class="badge method" class:GET={rule.method === 'GET'} class:POST={rule.method === 'POST'} class:PUT={rule.method === 'PUT'} class:DELETE={rule.method === 'DELETE'}>{rule.method}</span>
                  <span class="url">{rule.url}</span>
                </div>
                <div class="header-actions">
                  <input type="checkbox" checked={rule.enabled} on:change={() => toggleRule(rule.id)} title="Enable/Disable" />
                  <button class="icon-btn delete-btn" on:click={() => deleteRule(rule.id)} title="Delete rule">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="card-toolbar">
                <div class="toolbar-group">
                  <div class="delay-control">
                    <span class="label">Delay: {rule.delay || 0}ms</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="5000" 
                      step="100" 
                      value={rule.delay || 0} 
                      on:input={(e) => updateRuleDelay(rule.id, +e.currentTarget.value)}
                    />
                  </div>
                </div>
                
                <div class="toolbar-group">
                  <div class="status-control">
                    <span class="label">Status:</span>
                    <input
                      type="text"
                      class="status-input"
                      value={rule.status || 200}
                      on:input={(e) => {
                        const value = e.currentTarget.value;
                        // Allow 5-digit input, real-time update
                        if (/^\d{0,5}$/.test(value)) {
                          updateRuleStatus(rule.id, value ? parseInt(value) : 200);
                        }
                      }}
                      on:blur={(e) => {
                        // Ensure valid value on blur
                        const value = parseInt(e.currentTarget.value) || 200;
                        if (value < 100) updateRuleStatus(rule.id, 200);
                        else if (value > 999) updateRuleStatus(rule.id, 999);
                        else updateRuleStatus(rule.id, value);
                      }}
                      placeholder="200"
                      maxlength="5"
                      title="Enter HTTP status code (100-999)"
                    />
                  </div>
                </div>
              </div>

              {#if editingId === rule.id}
                <div class="editor-area">
                  <div class="tabs">
                    <button class="tab-btn" class:active={activeTab === 'body'} on:click|stopPropagation={() => activeTab = 'body'}>Body</button>
                    <button class="tab-btn" class:active={activeTab === 'headers'} on:click|stopPropagation={() => activeTab = 'headers'}>Headers</button>
                  </div>

                  {#if activeTab === 'body'}
                    <textarea bind:value={editContent} placeholder="Response Body JSON"></textarea>
                  {:else}
                    <textarea bind:value={editHeadersContent} placeholder="Response Headers JSON"></textarea>
                  {/if}

                  <div class="actions">
                    <button class="btn-save" on:click|stopPropagation={saveEdit}>Save</button>
                    <button class="btn-cancel" on:click|stopPropagation={cancelEdit}>Cancel</button>
                  </div>
                </div>
              {:else}
                <div
                  class="preview"
                  on:click|stopPropagation={() => startEdit(rule)}
                  on:keydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      startEdit(rule);
                    }
                  }}
                  role="button"
                  tabindex="0"
                >
                  <pre>{JSON.stringify(rule.response, null, 2)}</pre>
                  <div class="hint">Click to edit JSON</div>
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
              <div class="log-item">
                <div class="log-header">
                  <span class="status-badge" class:success={log.status >= 200 && log.status < 300} class:error={log.status >= 400}>{log.status}</span>
                  <span class="method-badge">{log.method}</span>
                  <span class="log-url" title={log.url}>{log.url}</span>
                </div>
                <div class="log-meta">
                  <span class="duration">{log.duration}ms</span>
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
  .container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 380px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    color: #1a1a1a;
    border-radius: 16px;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.05),
      0 10px 15px -3px rgba(0, 0, 0, 0.05),
      0 20px 25px -5px rgba(0, 0, 0, 0.05),
      0 0 0 1px rgba(255, 255, 255, 0.5) inset;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    line-height: 1.5;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    border: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    height: 600px; /* Fixed height */
    max-height: 80vh;
    z-index: 10000;
  }

  /* Minimized state */
  .container.minimized {
    width: auto;
    min-width: 140px;
    height: auto;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .container.minimized .header {
    padding: 10px 14px;
    border-bottom: none;
  }
  
  .container.minimized .main-tabs {
    display: none;
  }

  .container.minimized .toggle-btn {
    background: transparent;
    border: none;
    color: #666;
    padding: 4px;
  }

  .container.minimized .toggle-btn:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #000;
    transform: none;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px;
    background: rgba(255, 255, 255, 0.5);
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    border-radius: 16px 16px 0 0;
  }
  
  .main-tabs {
    display: flex;
    background: #f1f5f9;
    padding: 4px;
    margin: 12px 16px 0;
    border-radius: 8px;
    gap: 4px;
  }

  .main-tab-btn {
    flex: 1;
    padding: 6px 12px;
    background: transparent;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    transition: color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
    text-align: center;
  }

  .main-tab-btn:hover {
    color: #334155;
    background: rgba(255, 255, 255, 0.5);
  }

  .main-tab-btn.active {
    color: #0f172a;
    background: white;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    font-weight: 600;
  }

  .title-area {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #111;
    letter-spacing: -0.01em;
  }

  /* Rule count badge */
  .rule-count {
    background: #f3f4f6;
    color: #4b5563;
    font-size: 11px;
    font-weight: 500;
    padding: 1px 6px;
    border-radius: 6px;
    border: 1px solid rgba(0,0,0,0.04);
  }

  /* Toggle button */
  .toggle-btn {
    background: transparent;
    border: none;
    color: #888;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .toggle-btn:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #333;
  }

  .content {
    padding: 12px;
    overflow-y: auto;
    flex: 1;
  }

  .content::-webkit-scrollbar {
    width: 4px;
  }

  .content::-webkit-scrollbar-track {
    background: transparent;
  }

  .content::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  .content::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
  }

  .card {
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.04);
    border-radius: 10px;
    margin-bottom: 10px;
    overflow: hidden;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }

  .card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    border-color: rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: transparent;
    border-bottom: 1px solid transparent;
  }
  
  .card:has(.preview:hover) .card-header,
  .card:has(.editor-area) .card-header {
    border-bottom-color: rgba(0,0,0,0.04);
  }

  .badges {
    display: flex;
    align-items: center;
    gap: 10px;
    overflow: hidden;
    flex: 1;
    margin-right: 12px;
  }

  .badge {
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .method {
    background: #f3f4f6;
    color: #4b5563;
  }

  .method.GET { background: #eff6ff; color: #2563eb; }
  .method.POST { background: #ecfdf5; color: #059669; }
  .method.PUT { background: #fffbeb; color: #d97706; }
  .method.DELETE { background: #fef2f2; color: #dc2626; }

  .url {
    font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 12px;
    color: #555;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    letter-spacing: -0.01em;
  }

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    border: 1.5px solid #d1d5db;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    appearance: none;
    background: white;
    position: relative;
    margin: 0;
  }

  input[type="checkbox"]:checked {
    background: #2563eb;
    border-color: #2563eb;
  }

  input[type="checkbox"]:checked::after {
    content: '';
    position: absolute;
    top: 45%;
    left: 50%;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 1.5px 1.5px 0;
    transform: translate(-50%, -50%) rotate(45deg);
  }

  /* Preview area */
  .preview {
    position: relative;
    padding: 12px;
    cursor: pointer;
    background: #fafafa;
    transition: background 0.2s ease;
    z-index: 1;
    isolation: isolate; /* Create new stacking context */
  }

  .preview:hover {
    background: #f8fafc;
    z-index: 2; /* Increase z-index on hover */
  }

  .preview pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
    color: #444;
    font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 11.5px;
    line-height: 1.5;
    max-height: 100px;
    overflow-y: auto;
    pointer-events: none; /* Prevent text from interfering with clicks */
  }

  .hint {
    position: absolute;
    bottom: 8px;
    right: 12px;
    font-size: 10px;
    color: #94a3b8;
    opacity: 0;
    transition: opacity 0.2s ease;
    font-weight: 500;
    background: rgba(255,255,255,0.8);
    padding: 2px 6px;
    border-radius: 4px;
    backdrop-filter: blur(4px);
    pointer-events: none; /* Prevent hint box from interfering with clicks */
    z-index: 3;
  }

  .preview:hover .hint {
    opacity: 1;
  }

  /* Editor area */
  .editor-area {
    padding: 12px;
    background: #fff;
  }

  textarea {
    width: 100%;
    min-height: 140px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #334155;
    font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.5;
    padding: 10px;
    border-radius: 6px;
    resize: vertical;
    transition: all 0.2s ease;
  }

  textarea:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Button area */
  .actions {
    margin-top: 10px;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  /* Button styles */
  button {
    cursor: pointer;
    padding: 6px 14px;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .btn-save {
    background: #2563eb;
    color: white;
    box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
  }

  .btn-save:hover {
    background: #1d4ed8;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
  }

  .btn-cancel {
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
  }

  .btn-cancel:hover {
    background: #f8fafc;
    color: #334155;
    border-color: #cbd5e1;
  }

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 32px 20px;
    color: #94a3b8;
  }
  
  .empty-state p:first-child {
    font-weight: 500;
    color: #64748b;
    margin-bottom: 4px;
  }

  .add-panel {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
  }

  .form-row {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
  }

  .form-row select {
    padding: 6px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    font-size: 12px;
  }

  .form-row input {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 12px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }
  
  .btn-secondary {
    background: white;
    border: 1px solid #d1d5db;
    color: #4b5563;
  }

  .icon-btn {
    background: transparent;
    border: none;
    padding: 4px;
    border-radius: 4px;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-btn:hover {
    background: rgba(0,0,0,0.05);
    color: #1e293b;
  }

  .delete-btn:hover {
    background: #fee2e2;
    color: #ef4444;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Toolbar (delay slider + status code) */
  .card-toolbar {
    padding: 8px 12px;
    border-bottom: 1px solid rgba(0,0,0,0.04);
    background: #fafafa;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toolbar-group:first-child {
    flex: 1;
    min-width: 120px;
  }

  .toolbar-group:last-child {
    flex: 0 0 auto;
  }

  .delay-control {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    color: #64748b;
    width: 100%;
  }

  .delay-control .label {
    min-width: 75px; /* Fixed width to prevent jitter */
    font-variant-numeric: tabular-nums; /* Tabular numbers */
  }

  .delay-control input[type="range"] {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: #e2e8f0;
    outline: none;
    -webkit-appearance: none;
  }

  .delay-control input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }
  
  .status-control {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #64748b;
    margin-left: auto;
  }

  .status-input {
    width: 48px;
    padding: 2px 4px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 11px;
    background: white;
    color: #334155;
    text-align: center;
    font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
  }

  .status-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  /* Tabs styles */
  .tabs {
    display: flex;
    gap: 2px;
    margin-bottom: 8px;
    border-bottom: 1px solid #e2e8f0;
  }

  .tab-btn {
    padding: 6px 12px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    font-size: 12px;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    border-radius: 4px 4px 0 0;
  }

  .tab-btn:hover {
    color: #334155;
    background: #f1f5f9;
  }

  .tab-btn.active {
    color: #2563eb;
    border-bottom-color: #2563eb;
    background: transparent;
  }

  /* Network Logs styles */
  .network-logs {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .log-item {
    background: white;
    border: 1px solid rgba(0,0,0,0.04);
    border-radius: 8px;
    padding: 10px;
    font-size: 12px;
  }

  .log-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .status-badge {
    font-weight: 700;
    font-family: monospace;
    color: #64748b;
  }
  
  .status-badge.success { color: #059669; }
  .status-badge.error { color: #dc2626; }

  .method-badge {
    font-weight: 600;
    color: #4b5563;
    font-size: 11px;
  }

  .log-url {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #334155;
    font-family: monospace;
  }

  .log-meta {
    display: flex;
    justify-content: space-between;
    color: #94a3b8;
    font-size: 11px;
  }

  /* Responsive design */
  @media (max-width: 640px) {
    .container {
      width: calc(100vw - 32px);
      right: 16px;
      bottom: 16px;
      left: 16px;
    }

    .container.minimized {
      width: auto;
      min-width: 120px;
      left: auto;
    }
  }
</style>