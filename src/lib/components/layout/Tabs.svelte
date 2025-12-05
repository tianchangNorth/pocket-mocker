<script lang="ts">
  import { uiState } from '@/lib/stores/dashboard-store';
</script>

<div class="main-tabs">
  <button class="main-tab-btn" class:active={$uiState.activeMainTab === 'rules'} on:click={() => uiState.setMainTab('rules')}>Rules</button>
  <button class="main-tab-btn" class:active={$uiState.activeMainTab === 'network'} on:click={() => uiState.setMainTab('network')}>Network</button>
</div>

<style>
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
</style>
