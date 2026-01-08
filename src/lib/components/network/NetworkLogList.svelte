<script lang="ts">
  import { tick } from 'svelte';
  import { requestLogs } from '@/store/log-store';
  import { uiState } from '@/lib/stores/dashboard-store';
  import { addRule } from '@/store/store';
  import { showToast } from '@/lib/ui/toast-store';
  import NetworkToolbar from './NetworkToolbar.svelte';
  import NetworkLogItem from './NetworkLogItem.svelte';
  import ContextMenu, { type MenuItem } from '@/lib/ui/ContextMenu.svelte';

  $: filteredLogs = $requestLogs.filter(log => {
    const matchText = log.url.toLowerCase().includes($uiState.networkFilterText.toLowerCase()) || log.method.toLowerCase().includes($uiState.networkFilterText.toLowerCase());
    const matchType = $uiState.networkTypeFilter === 'all' 
      ? true 
      : $uiState.networkTypeFilter === 'mock' ? log.isMock : !log.isMock;
    return matchText && matchType;
  });

  let menuVisible = false;
  let menuX = 0;
  let menuY = 0;
  let selectedLog: any = null;

  $: menuItems = [
    { label: 'Copy URL', action: 'copy-url' },
    { label: 'Copy Response', action: 'copy-response', disabled: !selectedLog?.responseBody },
    { label: 'Copy as cURL', action: 'copy-curl' },
    { type: 'separator' },
    { label: 'Add to Mock Rules', action: 'create-rule', disabled: selectedLog?.isMock }
  ] as MenuItem[];

  async function handleMenuRequest(event: CustomEvent) {
    const { mouseEvent, log } = event.detail;
    
    // Close first to ensure reactivity
    menuVisible = false;
    await tick();
    
    menuX = mouseEvent.clientX;
    menuY = mouseEvent.clientY;
    selectedLog = log;
    menuVisible = true;
  }

  async function handleMenuSelect(event: CustomEvent) {
    const item = event.detail;
    if (!selectedLog) return;

    try {
      switch (item.action) {
        case 'copy-url':
          await navigator.clipboard.writeText(selectedLog.url);
          showToast('URL copied to clipboard', 'success');
          break;
        case 'copy-response':
          const content = typeof selectedLog.responseBody === 'string' 
            ? selectedLog.responseBody 
            : JSON.stringify(selectedLog.responseBody, null, 2);
          await navigator.clipboard.writeText(content);
          showToast('Response copied to clipboard', 'success');
          break;
        case 'copy-curl':
          const curl = generateCurl(selectedLog);
          await navigator.clipboard.writeText(curl);
          showToast('cURL copied to clipboard', 'success');
          break;
        case 'create-rule':
          createRuleFromLog(selectedLog);
          break;
      }
    } catch (e) {
      console.error(e);
      showToast('Action failed', 'error');
    }
  }

  function generateCurl(log: any): string {
    let curl = `curl -X ${log.method} '${log.url}'`;
    
    // Explicit Headers from request
    let headers = log.requestHeaders;
    if (typeof headers === 'string') {
      try {
        headers = JSON.parse(headers);
      } catch (e) {
        headers = {};
      }
    }

    const headerKeys = new Set(Object.keys(headers || {}).map(k => k.toLowerCase()));

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        curl += ` \\\n  -H '${key}: ${value}'`;
      });
    }

    // Auto-append browser headers if not already present
    // 1. User-Agent
    if (!headerKeys.has('user-agent')) {
      curl += ` \\\n  -H 'User-Agent: ${navigator.userAgent}'`;
    }

    // 2. Cookie (only non-HttpOnly cookies are visible to JS)
    if (!headerKeys.has('cookie') && document.cookie) {
      curl += ` \\\n  -H 'Cookie: ${document.cookie}'`;
    }

    // 3. Referer
    if (!headerKeys.has('referer')) {
      curl += ` \\\n  -H 'Referer: ${window.location.href}'`;
    }
    
    // 4. Origin (usually for non-GET requests)
    if (!headerKeys.has('origin') && log.method !== 'GET' && log.method !== 'HEAD') {
      curl += ` \\\n  -H 'Origin: ${window.location.origin}'`;
    }

    // Body
    if (log.requestBody && log.method !== 'GET' && log.method !== 'HEAD') {
      const body = typeof log.requestBody === 'string' ? log.requestBody : JSON.stringify(log.requestBody);
      curl += ` \\\n  -d '${body.replace(/'/g, "'\\''")}'`;
    }

    return curl;
  }

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
</script>

<NetworkToolbar />

<div class="network-logs">
  {#if filteredLogs.length === 0}
    <div class="empty-state">
      <p>No logs found</p>
    </div>
  {:else}
    {#each filteredLogs as log (log.id)}
      <NetworkLogItem 
        {log} 
        expanded={$uiState.expandedLogId === log.id}
        on:menuRequest={handleMenuRequest}
      />
    {/each}
  {/if}
</div>

<ContextMenu
  x={menuX}
  y={menuY}
  visible={menuVisible}
  items={menuItems}
  on:close={() => menuVisible = false}
  on:select={handleMenuSelect}
/>

<style>
  .network-logs {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--pm-text-secondary);
  }
</style>
