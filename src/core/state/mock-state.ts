import type { MockContext, MockStateStore } from '../types';

type StateListener = (value: Record<string, any>) => void;

let mockState: Record<string, any> = {};
const listeners = new Set<StateListener>();

function cloneState<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function assertPlainState(value: Record<string, any>) {
  try {
    JSON.stringify(value);
  } catch (e: any) {
    throw new Error(`Mock State must be JSON serializable: ${e.message}`);
  }
}

function notify() {
  const snapshot = mockStateStore.all();
  listeners.forEach(listener => listener(snapshot));
}

export const mockStateStore: MockStateStore = {
  get: (key) => mockState[key],
  set: (key, value) => {
    const next = { ...mockState, [key]: value };
    assertPlainState(next);
    mockState = next;
    notify();
  },
  update: (key, updater) => {
    const next = {
      ...mockState,
      [key]: updater(mockState[key])
    };
    assertPlainState(next);
    mockState = next;
    notify();
  },
  delete: (key) => {
    const next = { ...mockState };
    delete next[key];
    mockState = next;
    notify();
  },
  clear: () => {
    mockState = {};
    notify();
  },
  all: () => cloneState(mockState),
  replace: (value) => {
    assertPlainState(value);
    mockState = cloneState(value);
    notify();
  },
  subscribe: (listener) => {
    listeners.add(listener);
    listener(mockStateStore.all());
    return () => listeners.delete(listener);
  }
};

export function createMockContext(): MockContext {
  return {
    state: mockStateStore
  };
}
