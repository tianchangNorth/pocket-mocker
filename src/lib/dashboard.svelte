<script lang="ts">
  import { rules, toggleRule, updateRuleResponse } from '../core/store';
  
  // 控制浮窗展开/收起
  let minimized = false;
  // 当前正在编辑的规则 ID
  let editingId: string | null = null;
  // 临时的编辑内容字符串
  let editContent = "";

  function startEdit(rule: any) {
    editingId = rule.id;
    // 格式化 JSON，缩进 2 空格
    editContent = JSON.stringify(rule.response, null, 2);
  }

  function saveEdit() {
    if (editingId) {
      const success = updateRuleResponse(editingId, editContent);
      if (success) {
        editingId = null; // 退出编辑模式
      } else {
        alert("JSON 格式有误，请检查！");
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
    </div>
    <button class="toggle-btn" on:click={() => minimized = !minimized} title={minimized ? '展开面板' : '收起面板'}>
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
    <div class="content">
      {#if $rules.length === 0}
        <div class="empty-state">
          <p>暂无拦截规则</p>
          <p style="font-size: 12px; margin-top: 8px;">发起请求后将自动显示规则</p>
        </div>
      {:else}
        {#each $rules as rule (rule.id)}
          <div class="card">
            <div class="card-header">
              <div class="badges">
                <span class="badge method" class:GET={rule.method === 'GET'} class:POST={rule.method === 'POST'} class:PUT={rule.method === 'PUT'} class:DELETE={rule.method === 'DELETE'}>{rule.method}</span>
                <span class="url">{rule.url}</span>
              </div>
              <input type="checkbox" checked={rule.enabled} on:change={() => toggleRule(rule.id)} />
            </div>

            {#if editingId === rule.id}
              <div class="editor-area">
                <textarea bind:value={editContent}></textarea>
                <div class="actions">
                  <button class="btn-save" on:click={saveEdit}>保存</button>
                  <button class="btn-cancel" on:click={cancelEdit}>取消</button>
                </div>
              </div>
            {:else}
              <div
                class="preview"
                on:click={() => startEdit(rule)}
                on:keydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    startEdit(rule);
                  }
                }}
                role="button"
                tabindex="0"
              >
                <pre>{JSON.stringify(rule.response, null, 2)}</pre>
                <div class="hint">点击修改 JSON</div>
              </div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  /* 容器样式 - 现代化卡片设计 */
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
    max-height: 75vh;
    z-index: 10000;
  }

  /* 最小化状态 */
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

  /* 头部样式 */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px;
    background: rgba(255, 255, 255, 0.5);
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    border-radius: 16px 16px 0 0;
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

  /* 规则计数徽章 */
  .rule-count {
    background: #f3f4f6;
    color: #4b5563;
    font-size: 11px;
    font-weight: 500;
    padding: 1px 6px;
    border-radius: 6px;
    border: 1px solid rgba(0,0,0,0.04);
  }

  /* 折叠按钮 */
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

  /* 内容区域 */
  .content {
    padding: 12px;
    overflow-y: auto;
    max-height: calc(75vh - 54px);
  }

  /* 自定义滚动条 */
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

  /* 卡片样式 */
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

  /* 卡片头部 */
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

  /* 徽章区域 */
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

  /* HTTP 方法标签 - 柔和配色 */
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

  /* 复选框样式 */
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

  /* 预览区域 */
  .preview {
    position: relative;
    padding: 12px;
    cursor: pointer;
    background: #fafafa;
    transition: background 0.2s ease;
  }

  .preview:hover {
    background: #f8fafc;
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
  }

  .preview:hover .hint {
    opacity: 1;
  }

  /* 编辑器区域 */
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

  /* 按钮区域 */
  .actions {
    margin-top: 10px;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  /* 按钮样式 */
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

  /* 空状态 */
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

  /* 响应式设计 */
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