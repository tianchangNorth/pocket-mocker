import { beforeEach, describe, expect, it } from 'vitest';
import { mockStateStore } from '../../../src/core/state/mock-state';

describe('Mock State Store', () => {
  beforeEach(() => {
    mockStateStore.clear();
  });

  it('should set and get values', () => {
    mockStateStore.set('users', [{ id: 1 }]);

    expect(mockStateStore.get('users')).toEqual([{ id: 1 }]);
  });

  it('should update values', () => {
    mockStateStore.update<number>('count', (count = 0) => count + 1);
    mockStateStore.update<number>('count', (count = 0) => count + 1);

    expect(mockStateStore.get('count')).toBe(2);
  });

  it('should delete values', () => {
    mockStateStore.set('users', [{ id: 1 }]);
    mockStateStore.delete('users');

    expect(mockStateStore.get('users')).toBeUndefined();
  });

  it('should clear all values', () => {
    mockStateStore.set('users', [{ id: 1 }]);
    mockStateStore.set('todos', [{ id: 2 }]);
    mockStateStore.clear();

    expect(mockStateStore.all()).toEqual({});
  });

  it('should replace the full state', () => {
    mockStateStore.replace({ users: [{ id: 1 }] });

    expect(mockStateStore.all()).toEqual({ users: [{ id: 1 }] });
  });

  it('should return a copy from all', () => {
    mockStateStore.replace({ users: [{ id: 1 }] });

    const state = mockStateStore.all();
    state.users.push({ id: 2 });

    expect(mockStateStore.get('users')).toEqual([{ id: 1 }]);
  });
});
