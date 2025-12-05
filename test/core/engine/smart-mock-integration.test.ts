import { describe, it, expect } from 'vitest';
import { generateMockData } from '../../../src/core/engine/smart-mock';
import { importPostmanCollection } from '../../../src/core/importers/postman';
import { importOpenAPI } from '../../../src/core/importers/openapi';

describe('配置导入与Smart Mock集成测试', () => {
  it('应该正确处理Postman导入后的智能mock数据', () => {
    const postmanCollection = {
      info: { name: 'Test', schema: 'v2.1.0' },
      item: [
        {
          name: 'Create User',
          request: {
            method: 'POST',
            header: [],
            url: { raw: '/users' },
            body: {
              mode: 'raw' as const,
              raw: JSON.stringify({
                name: 'John Doe',
                email: 'john@example.com',
                avatar: 'http://example.com/avatar.jpg',
                age: 30,
                metadata: {
                  created_at: '2023-01-01'
                }
              })
            }
          }
        }
      ]
    };

    const rules = importPostmanCollection(postmanCollection);
    expect(rules).toHaveLength(1);

    const rule = rules[0];
    expect(rule.method).toBe('POST');
    expect(rule.url).toBe('/users');

    // 验证智能mock数据
    const mockData = generateMockData(rule.response);
    expect(mockData).toHaveProperty('name');
    expect(mockData).toHaveProperty('email');
    expect(mockData).toHaveProperty('avatar');
    expect(mockData).toHaveProperty('age');
    expect(mockData).toHaveProperty('metadata');
    expect(mockData.metadata).toHaveProperty('created_at');
  });

  it('应该正确处理OpenAPI导入后的智能mock数据', () => {
    const openapiDoc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0' },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          name: { type: 'string' },
                          email: { type: 'string', format: 'email' },
                          created_at: { type: 'string', format: 'date-time' },
                          is_active: { type: 'boolean' },
                          count: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const rules = importOpenAPI(openapiDoc);
    expect(rules).toHaveLength(1);

    const rule = rules[0];
    expect(rule.method).toBe('GET');
    expect(rule.url).toBe('/users');

    // 验证智能mock数据
    const mockData = generateMockData(rule.response);
    expect(Array.isArray(mockData)).toBe(true);
    expect(mockData[0]).toHaveProperty('id');
    expect(mockData[0]).toHaveProperty('name');
    expect(mockData[0]).toHaveProperty('email');
    expect(mockData[0]).toHaveProperty('created_at');
    expect(mockData[0]).toHaveProperty('is_active');
    expect(mockData[0]).toHaveProperty('count');
  });

  it('应该正确处理嵌套数组和对象', () => {
    const template = {
      users: [
        {
          id: '@guid',
          name: '@cname',
          posts: [
            {
              id: '@guid',
              title: '@string(20)',
              comments: [
                {
                  id: '@guid',
                  text: '@string(50)',
                  author: '@cname'
                }
              ]
            }
          ]
        }
      ]
    };

    const result = generateMockData(template);
    expect(result.users).toHaveLength(1);
    expect(result.users[0].id).toMatch(/^[0-9a-f-]+$/); // UUID format
    expect(result.users[0].posts).toHaveLength(1);
    expect(result.users[0].posts[0].comments).toHaveLength(1);
    expect(typeof result.users[0].posts[0].comments[0].text).toBe('string');
  });
});