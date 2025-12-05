import type { MockRule } from '../types';

let activeRules: MockRule[] = [];

function getSpecificity(url: string): number {
  if (url.includes('*')) return 10;
  if (url.includes(':')) return 50;
  return 100;
}

export function updateRules(rules: MockRule[]) {
  activeRules = [...rules].sort((a, b) => getSpecificity(b.url) - getSpecificity(a.url));
}

export function getActiveRules() {
  return activeRules;
}
