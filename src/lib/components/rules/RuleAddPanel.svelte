<script lang="ts">
  import { addRule } from '@/store/store';
  import { uiState } from '@/lib/stores/dashboard-store';
  import Button from '@/lib/ui/Button.svelte';
  import Input from '@/lib/ui/Input.svelte';
  import Select from '@/lib/ui/Select.svelte';
  import { showToast } from '@/lib/ui/toast-store';

  let newRuleUrl = "";
  let newRuleMethod = "GET";

  const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];

  function handleAddRule() {
    if (!newRuleUrl) {
      showToast("Please enter URL", "warning");
      return;
    }
    addRule(newRuleUrl, newRuleMethod);
    uiState.setAddRulePanel(false);
    newRuleUrl = "";
    newRuleMethod = "GET";
  }
</script>

<div class="add-panel">
  <div class="form-row">
    <div style="width: 100px;">
      <Select bind:value={newRuleMethod} options={METHODS} />
    </div>
    <div style="flex: 1;">
      <Input placeholder="/api/path" bind:value={newRuleUrl} />
    </div>
  </div>
  <div class="form-actions">
    <Button size="sm" on:click={() => uiState.setAddRulePanel(false)}>Cancel</Button>
    <Button size="sm" variant="primary" on:click={handleAddRule}>Add Rule</Button>
  </div>
</div>

<style>
  .add-panel {
    background: var(--pm-bg-tertiary);
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    border: 1px solid var(--pm-border);
  }

  .form-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
