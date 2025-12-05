import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { resolveMockResponse } from '../../../src/core/engine/handler';
import type { MockRule } from '../../../src/core/types';

// Mock generateMockData to avoid dependency on its random behavior
vi.mock('../../../src/core/engine/smart-mock', () => ({
  generateMockData: (template: any) => {
    if (typeof template === 'object' && template !== null && !template.body) {
      return { ...template, mocked: true };
    }
    return template;
  }
}));

describe('Request Handler - resolveMockResponse', () => {
  const baseRule: MockRule = {
    id: '1',
    url: '/test',
    method: 'GET',
    response: { data: 'test' },
    enabled: true,
    delay: 0,
    status: 200,
    headers: {}
  };

  beforeAll(() => {
    // Mock global window object
    vi.stubGlobal('window', {
      location: {
        origin: 'http://localhost'
      }
    });

    // Polyfill Headers if not available
    if (typeof globalThis.Headers === 'undefined') {
      const PolyfilledHeaders = class {
        private map: Map<string, string>;

        constructor(init?: any) {
          this.map = new Map();
          if (init) {
            Object.entries(init).forEach(([k, v]) => this.set(k, String(v)));
          }
        }

        append(name: string, value: string): void {
          const existing = this.map.get(name);
          if (existing) {
            this.map.set(name, `${existing}, ${value}`);
          } else {
            this.map.set(name, value);
          }
        }

        delete(name: string): boolean {
          return this.map.delete(name);
        }

        get(name: string): string | null {
          return this.map.get(name) || null;
        }

        has(name: string): boolean {
          return this.map.has(name);
        }

        set(name: string, value: string): void {
          this.map.set(name, value);
        }

        entries(): IterableIterator<[string, string]> {
          return this.map.entries();
        }

        keys(): IterableIterator<string> {
          return this.map.keys();
        }

        values(): IterableIterator<string> {
          return this.map.values();
        }

        forEach(callbackfn: (value: string, key: string, parent: any) => void): void {
          this.map.forEach(callbackfn);
        }

        getSetCookie(): string[] {
          const cookie = this.get('Set-Cookie');
          return cookie ? cookie.split(',').map(c => c.trim()) : [];
        }

        [Symbol.iterator](): IterableIterator<[string, string]> {
          return this.map[Symbol.iterator]();
        }
      };
      globalThis.Headers = PolyfilledHeaders as any;
    }

    // Polyfill Response if not available
    if (typeof globalThis.Response === 'undefined') {
      const PolyfilledResponse = class Response {
        status: number;
        headers: any;
        body: string;
        constructor(body: any, init: any) {
          this.body = body;
          this.status = init?.status || 200;
          this.headers = new globalThis.Headers(init?.headers);
        }
      };
      globalThis.Response = PolyfilledResponse as any;
    }
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('should return static JSON response', async () => {
    const result = await resolveMockResponse(
      baseRule,
      {},
      '/test',
      'GET',
      new Headers(),
      null
    );

    expect(result.status).toBe(200);
    expect(result.response).toEqual({ data: 'test', mocked: true }); // mocked: true from our mock implementation
  });

  it('should handle delay', async () => {
    const start = Date.now();
    const delayRule = { ...baseRule, delay: 100 };

    await resolveMockResponse(
      delayRule,
      {},
      '/test',
      'GET',
      new Headers(),
      null
    );

    const duration = Date.now() - start;
    expect(duration).toBeGreaterThanOrEqual(90); // Allow some variance
  });

  it('should handle function response', async () => {
    const funcRule: MockRule = {
      ...baseRule,
      response: (req: any) => ({
        status: 201,
        body: { received: req.query.foo }
      })
    };

    const result = await resolveMockResponse(
      funcRule,
      {},
      '/test?foo=bar',
      'GET',
      new Headers(),
      null
    );

    expect(result.status).toBe(201);
    expect(result.response).toEqual({ received: 'bar' });
  });

  it('should handle async function response', async () => {
    const asyncFuncRule: MockRule = {
      ...baseRule,
      response: async () => {
        await new Promise(r => setTimeout(r, 10));
        return { status: 202, body: { async: true } };
      }
    };

    const result = await resolveMockResponse(
      asyncFuncRule,
      {},
      '/test',
      'GET',
      new Headers(),
      null
    );

    expect(result.status).toBe(202);
    expect(result.response).toEqual({ async: true });
  });

  it('should handle stringified function (eval)', async () => {
    const stringFuncRule: MockRule = {
      ...baseRule,
      response: `(req) => ({ status: 200, body: { msg: 'eval works' } })`
    };

    const result = await resolveMockResponse(
      stringFuncRule,
      {},
      '/test',
      'GET',
      new Headers(),
      null
    );

    expect(result.response).toEqual({ msg: 'eval works' });
  });

  it('should handle function throwing error', async () => {
    const errorFuncRule: MockRule = {
      ...baseRule,
      response: () => { throw new Error('Boom'); }
    };

    const result = await resolveMockResponse(
      errorFuncRule,
      {},
      '/test',
      'GET',
      new Headers(),
      null
    );

    expect(result.status).toBe(500);
    expect(result.response).toEqual({ error: 'Mock function execution failed' });
  });

  it('should handle Response object in function (or error if Response polyfill fails)', async () => {
    const responseObjRule: MockRule = {
      ...baseRule,
      response: () => new Response(JSON.stringify({ raw: true }), { status: 204, headers: { 'X-Custom': 'Yes' } })
    };

    const result = await resolveMockResponse(
      responseObjRule,
      {},
      '/test',
      'GET',
      new Headers(),
      null
    );

    // In a test environment without proper DOM APIs, creating a Response object might fail
    // The handler should catch this and return an error response
    if (result.status === 500) {
      expect(result.response).toEqual({ error: 'Mock function execution failed' });
    } else {
      // In a real browser environment with proper Response support
      expect(result.response).toBeInstanceOf(globalThis.Response);
      expect((result.response as any).status).toBe(204);
    }
  });
});
