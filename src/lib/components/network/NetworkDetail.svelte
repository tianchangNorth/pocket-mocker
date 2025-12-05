<script lang="ts">
  import type { NetworkDetailTab } from '@/lib/stores/dashboard-store';
  
  export let log: any;
  export let activeTab: NetworkDetailTab = 'response';
  export let onTabChange: (tab: NetworkDetailTab) => void;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="log-details" on:click|stopPropagation>
  <div class="detail-tabs">
    <button
      class="tab-button"
      class:active={activeTab === 'headers'}
      on:click|stopPropagation={() => onTabChange('headers')}
    >
      Headers
    </button>
    <button
      class="tab-button"
      class:active={activeTab === 'payload'}
      on:click|stopPropagation={() => onTabChange('payload')}
    >
      Payload
    </button>
    <button
      class="tab-button"
      class:active={activeTab === 'response'}
      on:click|stopPropagation={() => onTabChange('response')}
    >
      Response
    </button>
  </div>

  <div class="detail-content">
    {#if activeTab === 'headers'}
      <div class="detail-section">
        <div class="detail-label">Request Headers:</div>
        <pre class="detail-body">{log.requestHeaders || '(Empty)'}</pre>
      </div>
    {:else if activeTab === 'payload'}
      <div class="detail-section">
        <div class="detail-label">Request Payload:</div>
        <pre class="detail-body">{log.requestPayload || '(Empty)'}</pre>
      </div>
    {:else if activeTab === 'response'}
      <div class="detail-section">
        <div class="detail-label">Response Body:</div>
        <pre class="detail-body">{log.responseBody || '(Empty)'}</pre>
      </div>
    {/if}
  </div>
</div>

<style>
  .log-details {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--pm-border);
    cursor: auto;
  }

  .detail-tabs {
    display: flex;
    gap: 2px;
    margin-bottom: 8px;
  }

  .tab-button {
    background: transparent;
    border: none;
    color: var(--pm-text-secondary);
    padding: 6px 12px;
    font-size: 11px;
    cursor: pointer;
    border-radius: 4px 4px 0 0;
    transition: all 0.2s;
    font-weight: 500;
  }

  .tab-button:hover {
    color: var(--pm-text-primary);
    background: var(--pm-hover-bg);
  }

  .tab-button.active {
    color: var(--pm-primary);
    background: var(--pm-input-bg);
    border-bottom: 2px solid var(--pm-primary);
  }

  .detail-content {
    background: var(--pm-input-bg);
    border-radius: 0 4px 4px 4px;
    padding: 8px;
  }

  .detail-section {
    min-height: 40px;
  }

  .detail-label {
    font-size: 10px;
    color: var(--pm-text-secondary);
    margin-bottom: 4px;
    font-weight: bold;
  }

  .detail-body {
    font-family: 'Menlo', 'Monaco', monospace;
    font-size: 11px;
    color: var(--pm-text-primary);
    padding: 0;
    border-radius: 0;
    overflow-x: auto;
    white-space: pre-wrap;
    max-height: 200px;
    margin: 0;
  }
</style>
