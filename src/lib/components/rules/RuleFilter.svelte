<script lang="ts">
  import { uiState } from '@/lib/stores/dashboard-store';
  import Button from '@/lib/ui/Button.svelte';
  import Input from '@/lib/ui/Input.svelte';
  import Select from '@/lib/ui/Select.svelte';
  import { addGroup } from '@/store/store';
  
  let filterText = $uiState.ruleFilterText;
  let methodFilter = $uiState.ruleMethodFilter;
  let statusFilter = $uiState.ruleStatusFilter;
  
  const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];

  $: {
    uiState.setRuleFilters(filterText, methodFilter, statusFilter);
  }

  function clearFilters() {
    filterText = "";
    methodFilter = "ALL";
    statusFilter = "ALL";
    uiState.resetRuleFilters();
  }

  function handleAddGroup() {
    addGroup('New Group');
  }
</script>

<div class="rule-toolbar">
  <div class="search-box">
    <Input placeholder="Search URL..." bind:value={filterText} />
  </div>
    <div class="type-filter" style="width: 80px;">
    <Select 
      options={['ALL', ...METHODS]} 
      bind:value={methodFilter} 
    />
  </div>
  <div class="type-filter" style="width: 85px;">
    <Select 
      options={['ALL', 'ENABLED', 'DISABLED']} 
      bind:value={statusFilter} 
    />
  </div>
    {#if filterText || methodFilter !== 'ALL' || statusFilter !== 'ALL'}
      <Button icon size="sm" on:click={clearFilters} title="Clear filters">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </Button>
    {/if}
  <Button icon on:click={handleAddGroup} title="Add New Group">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        <line x1="12" y1="11" x2="12" y2="17"></line>
        <line x1="9" y1="14" x2="15" y2="14"></line>
    </svg>
  </Button>
</div>

<style>
  .rule-toolbar {
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    background: var(--pm-bg-tertiary);
    border-bottom: 1px solid var(--pm-border);
    align-items: center;
    border-radius: 8px;
    border: 1px solid var(--pm-border);
    margin-bottom: 12px;
  }

  .search-box {
    flex: 1;
  }
</style>
