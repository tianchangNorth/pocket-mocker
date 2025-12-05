import Dashboard from './lib/dashboard.svelte';
import { initInterceptor } from '@/core';
import { initStore } from './store/store';
import globalStyles from './app.css?inline';
import type { MockRule } from '@/core';

let app: Dashboard | null = null;
let shadowHost: HTMLElement | null = null;

export interface PocketMockOptions {
  enable?: boolean;
}

export type { MockRule, MockRequest, DynamicResponseFunction } from './core/types';

export function defineConfig(config: MockRule[]): MockRule[] {
  return config;
}

export function pocketMock(options: PocketMockOptions = {}) {
  initInterceptor();
  initStore();
  mountUI();
}

function mountUI() {
  if (app) return;

  const hostId = 'pocket-mock-host';
  shadowHost = document.getElementById(hostId);
  if (!shadowHost) {
    shadowHost = document.createElement('div');
    shadowHost.id = hostId;
    shadowHost.style.position = 'fixed';
    shadowHost.style.zIndex = '99999';
    document.body.appendChild(shadowHost);
  }

  const shadow = shadowHost.attachShadow({ mode: 'open' });

  const styleTag = document.createElement('style');
  styleTag.textContent = globalStyles;
  shadow.appendChild(styleTag);

  app = new Dashboard({
    target: shadow,
  });
}