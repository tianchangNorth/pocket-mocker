import { writable, get } from 'svelte/store';
import { updateRules as updateInterceptorRules } from '@/core';
import { $fetch } from '@/core/utils/fetch';
import { generateUniqueId } from '@/core/utils/index'
import type { MockRule, MockGroup } from '../core/types';

const STORAGE_KEY = 'pocket_mock_rules_v1';
let isServerMode = false;

let resolveReady!: (value: void | PromiseLike<void>) => void;

export const appReady = new Promise<void>((resolve) => {
  resolveReady = resolve;
});

export const rules = writable<MockRule[]>([]);
export const groups = writable<MockGroup[]>([]);

export const updateRules = (newRules: MockRule[]) => {
  rules.set(newRules);
};

export const initStore = async () => {
  try {
    isServerMode = false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);

      const res = await fetch('/__pocket_mock/rules', {
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        isServerMode = true;
        const data = await res.json();

        if (Array.isArray(data)) {
          rules.set(data);
          groups.set([]);
          isServerMode = true;
          return;
        } else if (data.rules) {
          rules.set(data.rules);
          groups.set(data.groups || []);
          isServerMode = true;
          return;
        } else {
          isServerMode = false;
        }
      }
    } catch (e) {
      isServerMode = false;
    }

    try {
      const json = localStorage.getItem(STORAGE_KEY);
      if (json) {
        const data = JSON.parse(json);
        if (Array.isArray(data)) {
          rules.set(data);
          groups.set([]);
        } else if (data.rules) {
          rules.set(data.rules);
          groups.set(data.groups || []);
        }
        return;
      }
    } catch (e: any) {
      throw new Error(`Failed to parse JSON: ${e.message}`)
    }


  } finally {
    if (resolveReady) resolveReady();
  }
};

let saveTimer: ReturnType<typeof setTimeout> | undefined;

const triggerSave = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const currentRules = get(rules);
    const currentGroups = get(groups);

    const dataToSave = {
      rules: currentRules,
      groups: currentGroups
    };

    if (isServerMode) {
      fetch('/__pocket_mock/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave, null, 2)
      }).catch(err => console.error('[PocketMock] Failed to save to server:', err));
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (e: any) {
        throw new Error(`localStorage write faile:${e.message}`)
      }
    }
  }, 500);
};

rules.subscribe((value) => {
  updateInterceptorRules(value);
  triggerSave();
});

groups.subscribe(() => {
  triggerSave();
});

export const toggleRule = (id: string) => {
  rules.update(items => items.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
};

export const updateRuleResponse = (id: string, newResponseContent: string) => {
  let parsedResponse: any;

  try {
    parsedResponse = JSON.parse(newResponseContent);
  } catch (e) {

    parsedResponse = newResponseContent;
  }

  rules.update(items => items.map(r => r.id === id ? { ...r, response: parsedResponse } : r));
  return true;
};

export const updateRuleDelay = (id: string, delay: number) => {
  rules.update(items => items.map(r => r.id === id ? { ...r, delay } : r));
};

export const addRule = (url: string, method: string, initialResponse?: any, delay: number = 0, status: number = 200, groupId?: string) => {
  const newRule: MockRule = {
    id: generateUniqueId(),
    url,
    method,
    response: initialResponse || { message: "Hello PocketMock" },
    enabled: true,
    delay,
    status,
    headers: {},
    groupId
  };
  rules.update(items => [newRule, ...items]);
};

export const deleteRule = (id: string) => {
  rules.update(items => items.filter(r => r.id !== id));
}

export const fetchRule = (id: string) => {
  const currentRules = get(rules);
  const foundRule = currentRules.find(r => r.id === id) ?? undefined;
  const method = foundRule?.method ?? 'GET'
  const url = foundRule?.url ?? ''
  $fetch(url, method)
}

export const updateRuleHeaders = (id: string, newHeadersJson: string) => {
  try {
    const parsed = JSON.parse(newHeadersJson);
    rules.update(items => items.map(r => r.id === id ? { ...r, headers: parsed } : r));
    return true;
  } catch (e) {
    return false;
  }
};

export const updateRuleStatus = (id: string, status: number) => {
  rules.update(items => items.map(r => r.id === id ? { ...r, status } : r));
};

export const updateRuleMethod = (id: string, method: string) => {
  rules.update(items => items.map(r => r.id === id ? { ...r, method } : r));
};

export const updateRuleUrl = (id: string, url: string) => {
  rules.update(items => items.map(r => r.id === id ? { ...r, url } : r));
};

export const updateRuleGroup = (ruleId: string, groupId?: string) => {
  rules.update(items => items.map(r => r.id === ruleId ? { ...r, groupId } : r));
};

export const addGroup = (name: string) => {
  const newGroup: MockGroup = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    name,
    collapsed: false
  };
  groups.update(items => [...items, newGroup]);
  return newGroup.id;
};

export const updateGroup = (id: string, name: string) => {
  groups.update(items => items.map(g => g.id === id ? { ...g, name } : g));
};

export const deleteGroup = (id: string) => {
  rules.update(items => items.map(r => r.groupId === id ? { ...r, groupId: undefined } : r));
  groups.update(items => items.filter(g => g.id !== id));
};

export const toggleGroupCollapse = (id: string) => {
  groups.update(items => items.map(g => g.id === id ? { ...g, collapsed: !g.collapsed } : g));
};