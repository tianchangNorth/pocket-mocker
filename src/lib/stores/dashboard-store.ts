import { writable } from 'svelte/store';

export type ActiveTab = 'rules' | 'network';
export type RuleTab = 'body' | 'headers';
export type NetworkDetailTab = 'headers' | 'payload' | 'response';

export const uiState = (() => {
  const { subscribe, update, set } = writable({
    minimized: false,
    activeMainTab: 'rules' as ActiveTab,
    
    // Rule Editor State
    editingRuleId: null as string | null,
    activeRuleTab: 'body' as RuleTab,
    showAddRulePanel: false,
    
    // Filter States
    ruleFilterText: "",
    ruleMethodFilter: "ALL",
    ruleStatusFilter: "ALL",

    // Network Log States
    networkFilterText: "",
    networkTypeFilter: 'all' as 'all' | 'mock' | 'real',
    expandedLogId: null as string | null,
    activeLogDetailTab: 'response' as NetworkDetailTab
  });

  return {
    subscribe,
    toggleMinimized: () => update(s => ({ ...s, minimized: !s.minimized })),
    setMainTab: (tab: ActiveTab) => update(s => ({ ...s, activeMainTab: tab })),
    
    // Rules
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

    // Network
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
    }))
  };
})();
