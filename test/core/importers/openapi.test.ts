import { describe, it, expect } from 'vitest';
import { importOpenAPI } from '../../../src/core/importers/openapi';
import type { OpenAPIDocument } from '../../../src/core/types';

describe('importOpenAPI', () => {
  it('should import basic path with GET operation', () => {
    const doc: OpenAPIDocument = {
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
                          name: { type: 'string' }
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

    const rules = importOpenAPI(doc);
    expect(rules).toHaveLength(1);
    expect(rules[0].url).toBe('/users');
    expect(rules[0].method).toBe('GET');

    const response = rules[0].response;
    expect(Array.isArray(response)).toBe(true);
    expect(response[0].id).toBe('@guid'); // Generated from format: uuid
    expect(response[0].name).toBe('@cname'); // Inferred from key 'name'
  });

  it('should handle path parameters conversion', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.0.0',
      info: { title: 'Params', version: '1.0' },
      paths: {
        '/users/{userId}/posts/{postId}': {
          get: { responses: {} }
        }
      }
    };

    const rules = importOpenAPI(doc);
    expect(rules[0].url).toBe('/users/:userId/posts/:postId');
  });

  it('should resolve $ref schemas', () => {
    const doc: OpenAPIDocument = {
      openapi: '3.0.0',
      info: { title: 'Refs', version: '1.0' },
      paths: {
        '/profile': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/UserProfile' }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        schemas: {
          UserProfile: {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              age: { type: 'integer' }
            }
          }
        }
      }
    };

    const rules = importOpenAPI(doc);
    const response = rules[0].response;
    expect(response.email).toBe('@email');
    expect(response.age).toBe('@integer(1,100)');
  });
});
