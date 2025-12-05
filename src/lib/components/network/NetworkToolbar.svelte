<script lang="ts">
  import { requestLogs } from '@/store/log-store';
  import { uiState } from '@/lib/stores/dashboard-store';
  import Button from '@/lib/ui/Button.svelte';
  import Input from '@/lib/ui/Input.svelte';
  import Select from '@/lib/ui/Select.svelte';

  let filterText = "";
  let typeFilter = 'all';

  $: {
    uiState.setNetworkFilters(filterText, typeFilter as any);
  }
</script>

<div class="network-toolbar">
  <div class="search-box">
    <Input placeholder="Filter URL..." bind:value={filterText} />
  </div>
  <div class="type-filter">
    <Select 
      options={['all', 'mock', 'real']} 
      bind:value={typeFilter} 
    />
  </div>
  <Button icon size="sm" on:click={() => requestLogs.clear()} title="Clear Logs">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  </Button>
</div>

<style>
  .network-toolbar {
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    background: var(--pm-bg-tertiary);
    border-bottom: 1px solid var(--pm-border);
    align-items: center;
  }

  .search-box {
    flex: 1;
  }

  .type-filter {
    width: 100px;
  }
</style>
