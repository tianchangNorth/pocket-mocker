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

async function postSave(body: string, url = '/__pocket_mock/save') {
  const middleware = createMiddleware();
  const req = new EventEmitter() as any;
  req.url = url;
  req.method = 'POST';

  const res = createResponse();
  const next = vi.fn();

  middleware(req, res, next);
  req.emit('data', Buffer.from(body));
  req.emit('end');
  await res.ended;

  return { res, next };
}

async function getState() {
  const middleware = createMiddleware();
  const req = new EventEmitter() as any;
  req.url = '/__pocket_mock/state';
  req.method = 'GET';

  const res = createResponse();
  const next = vi.fn();

  middleware(req, res, next);
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

  it('should return an empty mock state when state file does not exist', async () => {
    const { res, next } = await getState();

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ persist: true, state: {} });
  });

  it('should save valid mock state JSON in a formatted state file', async () => {
    const { res, next } = await postSave('{"persist":true,"state":{"users":[{"id":1}]}}', '/__pocket_mock/state/save');
    const statePath = path.join(tempDir, 'pocket-mock-state.json');

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ success: true });
    expect(fs.readFileSync(statePath, 'utf-8')).toBe(JSON.stringify({ persist: true, state: { users: [{ id: 1 }] } }, null, 2));
  });

  it('should reject invalid mock state JSON without overwriting the state file', async () => {
    const statePath = path.join(tempDir, 'pocket-mock-state.json');
    fs.writeFileSync(statePath, '{"persist":true,"state":{}}');

    const { res } = await postSave('{invalid', '/__pocket_mock/state/save');

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({ error: 'Invalid JSON' });
    expect(fs.readFileSync(statePath, 'utf-8')).toBe('{"persist":true,"state":{}}');
  });

  it('should reset mock state', async () => {
    const statePath = path.join(tempDir, 'pocket-mock-state.json');
    fs.writeFileSync(statePath, '{"persist":true,"state":{"users":[{"id":1}]}}');

    const { res } = await postSave('', '/__pocket_mock/state/reset');

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ success: true });
    expect(JSON.parse(fs.readFileSync(statePath, 'utf-8'))).toEqual({ persist: true, state: {} });
  });
});
