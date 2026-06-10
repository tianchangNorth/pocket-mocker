import { writable } from 'svelte/store';
import { saveUIState, loadUIState } from '@/core/utils/local';

export type ActiveTab = 'rules' | 'network' | 'state';
export type RuleTab = 'body' | 'headers';
export type NetworkDetailTab = 'headers' | 'payload' | 'response';

export type UIState = {
  minimized: boolean;
  activeMainTab: ActiveTab;

  editingRuleId: string | null;
  activeRuleTab: RuleTab;
  showAddRulePanel: boolean;

  ruleFilterText: string;
  ruleMethodFilter: string;
  ruleStatusFilter: string;

  networkFilterText: string;
  networkTypeFilter: 'all' | 'mock' | 'real';
  expandedLogId: string | null;
  activeLogDetailTab: NetworkDetailTab;

  panelPosition: { right: number; bottom: number };
  panelSize: { width: number; height: number };
};

export const uiState = (() => {
  const defaultState: UIState = {
    minimized: true,
    activeMainTab: 'rules',

    editingRuleId: null,
    activeRuleTab: 'body',
    showAddRulePanel: false,

    ruleFilterText: "",
    ruleMethodFilter: "ALL",
    ruleStatusFilter: "ALL",

    networkFilterText: "",
    networkTypeFilter: 'all',
    expandedLogId: null,
    activeLogDetailTab: 'response',

    panelPosition: { right: 24, bottom: 24 },
    panelSize: { width: 400, height: 600 }
  };

  function createSafeInitialState(): UIState {
    const storedState = loadUIState('dashboard', {});

    return {
      ...defaultState,
      ...storedState,
      activeMainTab: (storedState.activeMainTab ?? defaultState.activeMainTab) as ActiveTab,
      activeRuleTab: (storedState.activeRuleTab ?? defaultState.activeRuleTab) as RuleTab,
      networkTypeFilter: (storedState.networkTypeFilter ?? defaultState.networkTypeFilter) as 'all' | 'mock' | 'real',
      activeLogDetailTab: (storedState.activeLogDetailTab ?? defaultState.activeLogDetailTab) as NetworkDetailTab,
      editingRuleId: null,
      showAddRulePanel: false,
      expandedLogId: null,
    };
  }

  const initialState = createSafeInitialState();

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
