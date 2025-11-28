import { writable } from 'svelte/store';

export interface LogEntry {
  id: string;
  method: string;
  url: string;
  status: number;
  timestamp: number;
  duration: number;
  isMock: boolean;
  responseBody?: string;
}

function createLogStore() {
  const { subscribe, update } = writable<LogEntry[]>([]);

  return {
    subscribe,
    add: (log: Omit<LogEntry, 'id'>) => {
      const entry = { ...log, id: Date.now().toString() + Math.random() };
      update(logs => {
        const newLogs = [entry, ...logs];
        return newLogs.slice(0, 50);
      });
    },
    remove: (id: string) => update(logs => logs.filter(l => l.id !== id)),
    clear: () => update(() => [])
  };
}

export const requestLogs = createLogStore();