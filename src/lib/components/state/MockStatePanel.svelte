<script lang="ts">
  import { mockState, mockStatePersisted, replaceMockState, clearMockState, setMockStatePersisted } from '@/store/store';
  import { showToast } from '@/lib/ui/toast-store';
  import JsonEditor from '@/lib/ui/JsonEditor.svelte';
  import Button from '@/lib/ui/Button.svelte';
  import Switch from '@/lib/ui/Switch.svelte';

  let editorValue = '{}';
  let lastStateValue = '{}';
  let fileInput: HTMLInputElement;

  $: formattedState = JSON.stringify($mockState, null, 2);
  $: if (formattedState !== lastStateValue && editorValue === lastStateValue) {
    editorValue = formattedState;
    lastStateValue = formattedState;
  }
  $: if (!lastStateValue) {
    editorValue = formattedState;
    lastStateValue = formattedState;
  }

  function handleEditorChange(event: CustomEvent<string>) {
    editorValue = event.detail;
  }

  function saveState() {
    try {
      const parsed = JSON.parse(editorValue);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        showToast('Mock State must be a JSON object', 'error');
        return;
      }

      replaceMockState(parsed);
      lastStateValue = JSON.stringify(parsed, null, 2);
      editorValue = lastStateValue;
      showToast('Mock State saved', 'success');
    } catch (e: any) {
      showToast(`Invalid JSON: ${e.message}`, 'error');
    }
  }

  function handleClear() {
    clearMockState();
    showToast('Mock State cleared', 'success');
  }

  async function copyState() {
    try {
      await navigator.clipboard.writeText(JSON.stringify($mockState, null, 2));
      showToast('Mock State copied', 'success');
    } catch (e) {
      showToast('Failed to copy Mock State', 'error');
    }
  }

  function triggerImport() {
    fileInput.click();
  }

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      try {
        const content = readerEvent.target?.result as string;
        const parsed = JSON.parse(content);
        const state = parsed && typeof parsed === 'object' && 'state' in parsed ? parsed.state : parsed;

        if (!state || typeof state !== 'object' || Array.isArray(state)) {
          showToast('Imported Mock State must be a JSON object', 'error');
          return;
        }

        replaceMockState(state);
        showToast('Mock State imported', 'success');
      } catch (e: any) {
        showToast(`Failed to import Mock State: ${e.message}`, 'error');
      } finally {
        input.value = '';
      }
    };

    reader.readAsText(file);
  }
</script>

<div class="state-panel">
  <div class="state-toolbar">
    <div class="persist-control">
      <Switch checked={$mockStatePersisted} onChange={setMockStatePersisted} />
      <span>Persist</span>
    </div>

    <div class="actions">
      <input type="file" accept=".json" style="display:none" bind:this={fileInput} on:change={handleFileSelect} />
      <Button size="sm" variant="ghost" on:click={triggerImport}>Import</Button>
      <Button size="sm" variant="ghost" on:click={copyState}>Copy</Button>
      <Button size="sm" variant="danger" on:click={handleClear}>Clear</Button>
      <Button size="sm" variant="primary" on:click={saveState}>Save</Button>
    </div>
  </div>

  <div class="editor-wrap">
    <JsonEditor
      value={editorValue}
      height="100%"
      lang="json"
      on:change={handleEditorChange}
    />
  </div>
</div>

<style>
  .state-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: var(--pm-bg-secondary);
  }

  .state-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px;
    border-bottom: 1px solid var(--pm-border);
    background: var(--pm-bg-tertiary);
  }

  .persist-control {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--pm-text-secondary);
    font-size: 12px;
    white-space: nowrap;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .editor-wrap {
    flex: 1;
    min-height: 0;
    padding: 10px;
  }

  @media (max-width: 520px) {
    .state-toolbar {
      align-items: flex-start;
      flex-direction: column;
    }

    .actions {
      justify-content: flex-start;
    }
  }
</style>
