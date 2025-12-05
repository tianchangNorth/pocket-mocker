<script lang="ts">
  import { rules } from '@/store/store';
  import { uiState } from '@/lib/stores/dashboard-store';
  import RuleItem from './RuleItem.svelte';
  import RuleFilter from './RuleFilter.svelte';
  import RuleAddPanel from './RuleAddPanel.svelte';
  import Button from '@/lib/ui/Button.svelte';

  $: filteredRules = $rules.filter(rule => {
    const matchText = rule.url.toLowerCase().includes($uiState.ruleFilterText.toLowerCase());
    const matchMethod = $uiState.ruleMethodFilter === "ALL" || rule.method === $uiState.ruleMethodFilter;
    const matchStatus = $uiState.ruleStatusFilter === "ALL" 
      ? true 
      : $uiState.ruleStatusFilter === "ENABLED" ? rule.enabled : !rule.enabled;
    return matchText && matchMethod && matchStatus;
  });

  function clearFilters() {
    uiState.resetRuleFilters();
  }
</script>

{#if $uiState.showAddRulePanel}
  <RuleAddPanel />
{/if}

{#if $rules.length > 0}
  <RuleFilter />
{/if}

{#if $rules.length === 0 && !$uiState.showAddRulePanel}
  <div class="empty-state">
    <div class="empty-icon">👋</div>
    <p>No active rules</p>
    <p class="sub-text">Click the + button above to mock your first API</p>
  </div>
{:else if filteredRules.length === 0 && !$uiState.showAddRulePanel}
    <div class="empty-state">
    <p>No matching rules found</p>
    <Button size="sm" variant="ghost" on:click={clearFilters}>Clear Filters</Button>
  </div>
{:else}
  {#each filteredRules as rule (rule.id)}
    <RuleItem {rule} />
  {/each}
{/if}

<style>
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
</style>
