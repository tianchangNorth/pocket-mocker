<script lang="ts">
  import { requestLogs } from '@/store/log-store';
  import { uiState } from '@/lib/stores/dashboard-store';
  import NetworkToolbar from './NetworkToolbar.svelte';
  import NetworkLogItem from './NetworkLogItem.svelte';

  $: filteredLogs = $requestLogs.filter(log => {
    const matchText = log.url.toLowerCase().includes($uiState.networkFilterText.toLowerCase()) || log.method.toLowerCase().includes($uiState.networkFilterText.toLowerCase());
    const matchType = $uiState.networkTypeFilter === 'all' 
      ? true 
      : $uiState.networkTypeFilter === 'mock' ? log.isMock : !log.isMock;
    return matchText && matchType;
  });
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
      />
    {/each}
  {/if}
</div>

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
