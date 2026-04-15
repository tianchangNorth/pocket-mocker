import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import pocketMockPlugin from '../../plugin/vite-plugin-pocket-mock.js';

type Middleware = (req: any, res: any, next: () => void) => void;

const originalCwd = process.cwd();
let tempDir = '';

function createMiddleware() {
  let middleware: Middleware | undefined;
  const plugin = pocketMockPlugin();
  plugin.configureServer({
    middlewares: {
      use(fn: Middleware) {
        middleware = fn;
      }
    }
  });
  if (!middleware) throw new Error('Middleware was not registered');
  return middleware;
}

function createResponse() {
  let resolveEnd!: () => void;
  const ended = new Promise<void>((resolve) => {
    resolveEnd = resolve;
  });

  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: '',
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    end(body?: string) {
      this.body = body || '';
      resolveEnd();
    },
    ended
  };

  return res;
}

async function postSave(body: string) {
  const middleware = createMiddleware();
  const req = new EventEmitter() as any;
  req.url = '/__pocket_mock/save';
  req.method = 'POST';

  const res = createResponse();
  const next = vi.fn();

  middleware(req, res, next);
  req.emit('data', Buffer.from(body));
  req.emit('end');
  await res.ended;

  return { res, next };
}

describe('vite-plugin-pocket-mock', () => {
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pocket-mock-test-'));
    process.chdir(tempDir);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should save valid JSON in a formatted config file', async () => {
    const { res, next } = await postSave('{"rules":[],"groups":[]}');
    const configPath = path.join(tempDir, 'pocket-mock.json');

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ success: true });
    expect(fs.readFileSync(configPath, 'utf-8')).toBe(JSON.stringify({ rules: [], groups: [] }, null, 2));
  });

  it('should reject invalid JSON without overwriting the config file', async () => {
    const configPath = path.join(tempDir, 'pocket-mock.json');
    fs.writeFileSync(configPath, '{"rules":[]}');

    const { res } = await postSave('{invalid');

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({ error: 'Invalid JSON' });
    expect(fs.readFileSync(configPath, 'utf-8')).toBe('{"rules":[]}');
  });
});
