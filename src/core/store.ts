// src/core/store.ts
import { writable } from 'svelte/store';
import { updateRules } from './interceptor';
import type { MockRule } from './types';

const STORAGE_KEY = 'pocket_mock_rules_v1';
let isServerMode = false;

// 修改 1: 添加 ! 断言，告诉 TS 这个变量会被赋值
let resolveReady!: (value: void | PromiseLike<void>) => void;

export const appReady = new Promise<void>((resolve) => {
  resolveReady = resolve;
});

export const rules = writable<MockRule[]>([]);

// === Initialization logic ===
export const initStore = async () => {
  // 修改 2: 使用 try...finally 包裹所有逻辑
  try {
    // Initialize as LocalStorage mode
    isServerMode = false;

    // --- 阶段一：尝试连接 Server ---
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
                    // console.log(`[PocketMock] Server Mode: Loaded ${data.length} rules`); // Remove log
                    return; // ✅ 即使这里 return，下方的 finally 依然会执行！
                  } else {
                    isServerMode = false;
                    // console.log('[PocketMock] Server response invalid, trying LocalStorage...'); // Remove log
                  }
                }
              } catch (e) {
                // Server 连接失败，静默失败，继续往下走
                isServerMode = false;
              }
          
              // --- 阶段二：降级读取 LocalStorage ---
              try {
                const json = localStorage.getItem(STORAGE_KEY);
                if (json) {
                  const data = JSON.parse(json);
                  rules.set(data);
                  // console.log(`[PocketMock] LocalStorage Mode: Loaded ${data.length} rules`); // Remove log
                  return; // ✅ 即使这里 return，下方的 finally 依然会执行！
                }
              } catch (e) {
                // console.error('[PocketMock] LocalStorage read failed:', e); // Remove log
              }
          
              // --- 阶段三：完全没数据，使用默认 Demo ---
              // const defaultRules = [{
              //   id: 'demo-1',
              //   url: '/api/demo',
              //   method: 'GET',
              //   response: { msg: 'Hello PocketMock' },
              //   enabled: true,
              //   delay: 500,
              //   status: 200,
              //   headers: {}
              // }];
          
              // rules.set(defaultRules);
              // console.log('[PocketMock] No rules found, starting empty.'); // Remove log
            } finally {
              // 修改 3: 这里的代码是“救命稻草”，无论上面发生了什么（报错、return、成功），这里都会执行
              if (resolveReady) resolveReady();
            }
          };

// === Subscription and save logic (保持不变) ===
let saveTimer: any;
rules.subscribe((value) => {
  updateRules(value);

  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (isServerMode) {
      fetch('/__pocket_mock/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value, null, 2)
      })// .catch(e => console.error('[PocketMock] File save failed:', e)); // Remove log
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } catch (e) {
        // console.error('[PocketMock] LocalStorage save failed:', e); // Remove log
      }
    }
  }, 500);
});

// ... 下面的 Actions (toggleRule, addRule 等) 保持原样即可 ...
export const toggleRule = (id: string) => {
  rules.update(items => items.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
};

export const updateRuleResponse = (id: string, newResponseContent: string) => {
  let parsedResponse: any;
  
  try {
    // 1. Try strict JSON parsing
    parsedResponse = JSON.parse(newResponseContent);
  } catch (e) {
    // 2. If JSON fails, it might be:
    //    a) A JS object literal: { a: 1 } (valid JS, invalid JSON)
    //    b) A function: (req) => { ... }
    //    c) A plain string: Hello World
    
    // We treat it as a string. The interceptor will decide how to execute it.
    // However, to support { a: 1 } auto-conversion to JSON, we could try to evaluate it safely?
    // For now, to support functions, we MUST save as string if it looks like a function.
    
    parsedResponse = newResponseContent;
  }

  rules.update(items => items.map(r => r.id === id ? { ...r, response: parsedResponse } : r));
  return true;
};

export const updateRuleDelay = (id: string, delay: number) => {
  rules.update(items => items.map(r => r.id === id ? { ...r, delay } : r));
};

export const addRule = (url: string, method: string, initialResponse?: any) => {
  const newRule: MockRule = {
    id: Date.now().toString(),
    url,
    method,
    response: initialResponse || { message: "Hello PocketMock" },
    enabled: true,
    delay: 0,
    status: 200,
    headers: {}
  };
  rules.update(items => [newRule, ...items]);
};

export const deleteRule = (id: string) => {
  rules.update(items => items.filter(r => r.id !== id));
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