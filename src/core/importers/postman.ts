import type { MockRule, PostmanCollection, PostmanItem } from '../types';

export function importPostmanCollection(collection: PostmanCollection): MockRule[] {
  const rules: MockRule[] = [];

  function processItems(items: PostmanItem[]) {
    items.forEach(item => {
      if (item.item) {
        processItems(item.item);
      } else if (item.request) {
        const rule = convertRequestToRule(item);
        if (rule) {
          rules.push(rule);
        }
      }
    });
  }

  if (collection && Array.isArray(collection.item)) {
    processItems(collection.item);
  }

  return rules;
}

function convertRequestToRule(item: PostmanItem): MockRule | null {
  if (!item.request) return null;

  const { request, name } = item;
  let url = '';

  if (typeof request.url === 'string') {
    url = request.url;
  } else if (request.url && request.url.raw) {
    url = request.url.raw;
  }

  url = url.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, ':$1');

  const method = request.method || 'GET';
  let response: any = { status: 'ok', message: 'Imported from Postman' };

  if (request.body && request.body.mode === 'raw' && request.body.raw) {
    try {
      const reqBody = JSON.parse(request.body.raw);
      if (method === 'POST' || method === 'PUT') {
        response = enhanceMockData(reqBody);
        if (!response.id) {
          response.id = '@guid';
        }
      }
    } catch (e) {
    }
  }

  return {
    id: generateId(),
    url,
    method,
    status: 200,
    delay: 0,
    enabled: true,
    headers: { 'Content-Type': 'application/json' },
    response: response
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function enhanceMockData(data: any): any {
  if (Array.isArray(data)) {
    return data.map(item => enhanceMockData(item));
  }
  if (data !== null && typeof data === 'object') {
    const result: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = inferMockValue(key, data[key]);
      }
    }
    return result;
  }
  return data;
}

function inferMockValue(key: string, value: any): any {
  if (typeof value === 'object' && value !== null) {
    return enhanceMockData(value);
  }

  if (typeof value === 'string' && value.startsWith('@')) {
    return value;
  }

  const lowerKey = key.toLowerCase();

  if (lowerKey === 'id' || lowerKey.endsWith('_id')) return '@guid';
  if (lowerKey === 'name') return '@name';
  if (lowerKey === 'username') return '@name';
  if (lowerKey.includes('avatar') || lowerKey.includes('image') || lowerKey.includes('photo')) return '@image(200x200)';
  if (lowerKey.includes('time') || lowerKey.includes('date') || lowerKey.includes('at')) return '@date';
  if (lowerKey.includes('intro') || lowerKey.includes('desc')) return '@string(20)';
  if (lowerKey.includes('num') || lowerKey.includes('count') || lowerKey.includes('age')) return '@integer(1,100)';
  if (lowerKey.includes('is') || lowerKey.includes('has')) return '@boolean';

  return value;
}

