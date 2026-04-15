import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/store/store', () => ({
  appReady: Promise.resolve()
}));

vi.mock('../../../src/core/engine/handler', () => ({
  findMatchingRule: vi.fn(),
  resolveMockResponse: vi.fn(),
  logMockRequest: vi.fn()
}));

describe('HTTP adapter patching', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('window', {
      fetch: vi.fn(),
      XMLHttpRequest: class XMLHttpRequest {}
    });
  });

  it('should patch fetch only once', async () => {
    const { patchFetch } = await import('../../../src/core/adapters/fetch');

    const originalFetch = window.fetch;
    patchFetch();
    const patchedFetch = window.fetch as any;
    patchFetch();

    expect(window.fetch).toBe(patchedFetch);
    expect(patchedFetch).not.toBe(originalFetch);
    expect(patchedFetch.__pocketMockPatched).toBe(true);
    expect(patchedFetch.__pocketMockOriginalFetch).toBe(originalFetch);
  });

  it('should patch XMLHttpRequest only once', async () => {
    const { patchXHR } = await import('../../../src/core/adapters/xhr');

    const OriginalXHR = window.XMLHttpRequest;
    patchXHR();
    const PatchedXHR = window.XMLHttpRequest as any;
    patchXHR();

    expect(window.XMLHttpRequest).toBe(PatchedXHR);
    expect(PatchedXHR).not.toBe(OriginalXHR);
    expect(PatchedXHR.__pocketMockPatched).toBe(true);
    expect(PatchedXHR.__pocketMockOriginalXHR).toBe(OriginalXHR);
  });
});
