import { writable } from 'svelte/store';
import { saveUIState, loadUIState } from '@/core/utils/local';

export type ActiveTab = 'rules' | 'network';
export type RuleTab = 'body' | 'headers';
export type NetworkDetailTab = 'headers' | 'payload' | 'response';

export const uiState = (() => {
  const defaultState = {
    minimized: true,
    activeMainTab: 'rules' as ActiveTab,

    editingRuleId: null as string | null,
    activeRuleTab: 'body' as RuleTab,
    showAddRulePanel: false,

    ruleFilterText: "",
    ruleMethodFilter: "ALL",
    ruleStatusFilter: "ALL",

    networkFilterText: "",
    networkTypeFilter: 'all' as 'all' | 'mock' | 'real',
    expandedLogId: null as string | null,
    activeLogDetailTab: 'response' as NetworkDetailTab,
    
    panelPosition: { right: 24, bottom: 24 },
    panelSize: { width: 400, height: 600 }
  };

  const storedState = loadUIState('dashboard', {});
  const initialState = { ...defaultState, ...storedState };

  // Ensure transient states are reset
  initialState.editingRuleId = null;
  initialState.showAddRulePanel = false;
  initialState.expandedLogId = null;

  const { subscribe, update, set } = writable(initialState);

  subscribe((state) => {
    saveUIState('dashboard', state);
  });

  return {
    subscribe,
    toggleMinimized: () => update(s => ({ ...s, minimized: !s.minimized })),
    setMainTab: (tab: ActiveTab) => update(s => ({ ...s, activeMainTab: tab })),

    setEditingRule: (id: string | null) => update(s => ({ ...s, editingRuleId: id, activeRuleTab: 'body' })),
    setRuleTab: (tab: RuleTab) => update(s => ({ ...s, activeRuleTab: tab })),
    toggleAddRulePanel: () => update(s => ({ ...s, showAddRulePanel: !s.showAddRulePanel })),
    setAddRulePanel: (show: boolean) => update(s => ({ ...s, showAddRulePanel: show })),
    setRuleFilters: (text: string, method: string, status: string) => update(s => ({
      ...s, ruleFilterText: text, ruleMethodFilter: method, ruleStatusFilter: status
    })),
    resetRuleFilters: () => update(s => ({
      ...s, ruleFilterText: "", ruleMethodFilter: "ALL", ruleStatusFilter: "ALL"
    })),

    setNetworkFilters: (text: string, type: 'all' | 'mock' | 'real') => update(s => ({
      ...s, networkFilterText: text, networkTypeFilter: type
    })),
    toggleLogDetails: (id: string) => update(s => ({
      ...s,
      expandedLogId: s.expandedLogId === id ? null : id
    })),
    setLogDetailTab: (tab: NetworkDetailTab) => update(s => ({ ...s, activeLogDetailTab: tab })),
    resetNetwork: () => update(s => ({
      ...s, expandedLogId: null
    })),

    setPanelPosition: (right: number, bottom: number) => update(s => ({ ...s, panelPosition: { right, bottom } })),
    setPanelSize: (width: number, height: number) => update(s => ({ ...s, panelSize: { width, height } }))
  };
})();
