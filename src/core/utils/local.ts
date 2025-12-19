const LOCAL_STORAGE_KEY_PREFIX = 'pocket_mock_ui_state_';

interface UIState {
  minimized?: boolean;
  activeMainTab?: string;
  editingRuleId?: string | null;
  activeRuleTab?: string;
  showAddRulePanel?: boolean;
  ruleFilterText?: string;
  ruleMethodFilter?: string;
  ruleStatusFilter?: string;
  networkFilterText?: string;
  networkTypeFilter?: string;
  expandedLogId?: string | null;
  activeLogDetailTab?: string;
  panelPosition?: { right: number; bottom: number };
  panelSize?: { width: number; height: number };
}

export function saveUIState(key: string, stateObject: Partial<UIState>) {
  try {
    const fullKey = LOCAL_STORAGE_KEY_PREFIX + key;
    const existingState = loadUIState(key, {});
    const newState = { ...existingState, ...stateObject };
    localStorage.setItem(fullKey, JSON.stringify(newState));
  } catch (e) {
    console.error(`[PocketMock] Failed to save UI state for ${key}:`, e);
  }
}

export function loadUIState(key: string, defaultValue: UIState = {}): UIState {
  try {
    const fullKey = LOCAL_STORAGE_KEY_PREFIX + key;
    const stored = localStorage.getItem(fullKey);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.error(`[PocketMock] Failed to load UI state for ${key}:`, e);
    return defaultValue;
  }
}

export function clearUIState(key: string) {
  try {
    const fullKey = LOCAL_STORAGE_KEY_PREFIX + key;
    localStorage.removeItem(fullKey);
  } catch (e) {
    console.error(`[PocketMock] Failed to clear UI state for ${key}:`, e);
  }
}
