<script lang="ts">
  import { rules } from '@/store/store';
  import { uiState } from '@/lib/stores/dashboard-store';
  import { importPostmanCollection } from '@/core/importers/postman';
  import { importOpenAPI } from '@/core/importers/openapi';
  import { showToast } from '@/lib/ui/toast-store';
  import Button from '@/lib/ui/Button.svelte';

  let fileInput: HTMLInputElement;
  
  function triggerImport() {
    fileInput.click();
  }

  async function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const json = JSON.parse(content);
        
        let newRules: any[] = [];
        let formatName = '';

        if (json.info && json.item) {
           formatName = 'Postman Collection';
           newRules = importPostmanCollection(json);
        } else if (json.openapi || json.swagger) {
           formatName = 'OpenAPI/Swagger';
           newRules = importOpenAPI(json);
        } else {
           showToast("Unknown file format. Supported: Postman, OpenAPI 3.0", "error");
           return;
        }

        if (newRules.length > 0) {
           rules.update(current => [...current, ...newRules]);
           showToast(`Imported ${newRules.length} rules from ${formatName}`, "success");
        } else {
           showToast(`No valid rules found in ${formatName} file`, "warning");
        }

      } catch (err) {
        console.error(err);
        showToast("Failed to parse file", "error");
      } finally {
        input.value = '';
      }
    };
    
    reader.readAsText(file);
  }
</script>

<div class="header" role="button" aria-label="Drag to move panel" tabindex="0" on:mousedown>
  <div class="title-area">
    <h3>PocketMock</h3>
    {#if $uiState.minimized && $rules.length > 0}
      <span class="rule-count">{$rules.length}</span>
    {/if}
    {#if !$uiState.minimized}
      <div class="add-btn-wrapper" class:visible={$uiState.activeMainTab === 'rules'}>
        <input type="file" accept=".json" style="display:none" bind:this={fileInput} on:change={handleFileSelect} />
        <Button size="sm" variant="ghost" icon on:click={triggerImport} title="Import Postman Collection">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
        </Button>
        <Button size="sm" variant="ghost" icon on:click={() => uiState.toggleAddRulePanel()} title="Add New Rule">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </Button>
      </div>
    {/if}
  </div>
  
  <button class="toggle-btn" on:click={() => uiState.toggleMinimized()} title={$uiState.minimized ? 'Expand panel' : 'Collapse panel'}>
    {#if $uiState.minimized}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    {:else}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12h14"/>
      </svg>
    {/if}
  </button>
</div>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--pm-bg-tertiary); 
    border-bottom: 1px solid var(--pm-border);
    cursor: move; 
  }

  .title-area {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--pm-text-primary);
  }

  .rule-count {
    background: var(--pm-hover-bg);
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 11px;
    color: var(--pm-text-secondary);
  }

  .add-btn-wrapper {
    display: flex;
    gap: 4px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }

  .add-btn-wrapper.visible {
    opacity: 1;
    pointer-events: auto;
  }

  .toggle-btn {
    background: transparent;
    border: none;
    color: var(--pm-text-secondary);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
  }

  .toggle-btn:hover {
    color: var(--pm-text-primary);
    background: var(--pm-hover-bg);
  }
</style>
