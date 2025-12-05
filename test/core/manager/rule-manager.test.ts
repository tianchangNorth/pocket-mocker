import { describe, it, expect, beforeEach } from 'vitest';
import { updateRules, getActiveRules } from '../../../src/core/manager/rule-manager';
import type { MockRule } from '../../../src/core/types';

describe('Rule Manager', () => {
  const createRule = (id: string, url: string): MockRule => ({
    id,
    url,
    method: 'GET',
    response: {},
    enabled: true,
    delay: 0,
    status: 200,
    headers: {}
  });

  beforeEach(() => {
    updateRules([]);
  });

  it('should update rules', () => {
    const rules = [createRule('1', '/api/test')];
    updateRules(rules);
    expect(getActiveRules()).toEqual(rules);
    expect(getActiveRules()).toHaveLength(1);
  });

  it('should sort rules by specificity', () => {
    const rules = [
      createRule('1', '/api/*'),           // Wildcard (Low specificity)
      createRule('2', '/api/users/:id'),   // Param (Medium specificity)
      createRule('3', '/api/users/123'),   // Exact (High specificity)
    ];

    // Shuffle input
    updateRules([rules[0], rules[2], rules[1]]);

    const active = getActiveRules();

    // Expect order: Exact -> Param -> Wildcard
    expect(active[0].id).toBe('3'); // /api/users/123
    expect(active[1].id).toBe('2'); // /api/users/:id
    expect(active[2].id).toBe('1'); // /api/*
  });

  it('should handle multiple rules with same specificity', () => {
    const rules = [
      createRule('1', '/api/a'),
      createRule('2', '/api/b')
    ];

    updateRules(rules);
    const active = getActiveRules();
    expect(active).toHaveLength(2);
    // Stable sort is not guaranteed by the simple subtract logic if equal, 
    // but we just ensure they are both present. 
    // In V8, sort is stable, so they should remain in order or reverse depending on implementation detail,
    // but for our manager logic, we just care that they are there.
    // Actually, our getSpecificity returns constant for same type.
    expect(active.map(r => r.id)).toContain('1');
    expect(active.map(r => r.id)).toContain('2');
  });
});
