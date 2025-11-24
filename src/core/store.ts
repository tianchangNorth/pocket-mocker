// src/core/store.ts
import { writable } from 'svelte/store';
import { type MockRule, updateRules } from './interceptor';

// 初始数据
const initialRules: MockRule[] = [
  {
    id: '1',
    url: '/todos/1',
    method: 'GET',
    response: { title: "Svelte 拦截成功！", id: 1 },
    enabled: true
  }
];

// Svelte Store
export const rules = writable<MockRule[]>(initialRules);

// 订阅 Store 的变化，一旦 UI 修改了规则，立刻同步给拦截器核心
rules.subscribe((value) => {
  updateRules(value);
});

export const toggleRule = (id: string) => {
  rules.update(items => items.map(r =>
    r.id === id ? { ...r, enabled: !r.enabled } : r
  ));
};

export const updateRuleResponse = (id: string, newResponseJson: string) => {
  try {
    const parsed = JSON.parse(newResponseJson);
    rules.update(items => items.map(r =>
      r.id === id ? { ...r, response: parsed } : r
    ));
    return true; // 更新成功
  } catch (e) {
    console.error("JSON 格式错误", e);
    return false; // 更新失败
  }
};