import { writable, get } from 'svelte/store';
import { updateRules as updateInterceptorRules } from '@/core';
import { $fetch } from '@/core/utils/fetch';
import type { MockRule } from '../core/types';

const STORAGE_KEY = 'pocket_mock_rules_v1';
let isServerMode = false;

let resolveReady!: (value: void | PromiseLike<void>) => void;

export const appReady = new Promise<void>((resolve) => {
  resolveReady = resolve;
});

export const rules = writable<MockRule[]>([]);

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
        rules.set(data);
        return;
      }
    } catch (e: any) {
      throw new Error("Failed to parse JSON: Unknown error", e.message)
    }


  } finally {
    if (resolveReady) resolveReady();
  }
};

let saveTimer: any;
rules.subscribe((value) => {
  updateInterceptorRules(value);

  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (isServerMode) {
      fetch('/__pocket_mock/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value, null, 2)
      })
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } catch (e) {
      }
    }
  }, 500);
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

export const addRule = (url: string, method: string, initialResponse?: any, delay: number = 0, status: number = 200) => {
  const newRule: MockRule = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    url,
    method,
    response: initialResponse || { message: "Hello PocketMock" },
    enabled: true,
    delay,
    status,
    headers: {}
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