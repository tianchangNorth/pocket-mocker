<script lang="ts">
  import { rules } from '@/store/store';
  import { uiState } from '@/lib/stores/dashboard-store';
  import Container from './components/layout/Container.svelte';
  import RuleList from './components/rules/RuleList.svelte';
  import RuleEditor from './components/rules/RuleEditor.svelte';
  import NetworkLogList from './components/network/NetworkLogList.svelte';
</script>

<Container>
  {#if $uiState.editingRuleId}
    {@const activeRule = $rules.find(r => r.id === $uiState.editingRuleId)}
    {#if activeRule}
      <RuleEditor rule={activeRule} />
    {/if}
  {:else}
    {#if $uiState.activeMainTab === 'rules'}
      <RuleList />
    {:else if $uiState.activeMainTab === 'network'}
      <NetworkLogList />
    {/if}
  {/if}
</Container>
