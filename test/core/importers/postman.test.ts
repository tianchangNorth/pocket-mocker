import { describe, it, expect } from 'vitest';
import { importPostmanCollection } from '../../../src/core/importers/postman';
import type { PostmanCollection } from '../../../src/core/types';

describe('importPostmanCollection', () => {
  it('should import a simple collection with one request', () => {
    const collection: PostmanCollection = {
      info: { name: 'Test', schema: 'v2.1.0' },
      item: [
        {
          name: 'Get User',
          request: {
            method: 'GET',
            header: [],
            url: { raw: 'https://api.example.com/users/1' }
          }
        }
      ]
    };

    const rules = importPostmanCollection(collection);
    expect(rules).toHaveLength(1);
    expect(rules[0].method).toBe('GET');
    expect(rules[0].url).toBe('https://api.example.com/users/1');
  });

  it('should handle nested folders', () => {
    const collection: PostmanCollection = {
      info: { name: 'Nested', schema: 'v2.1.0' },
      item: [
        {
          name: 'Folder A',
          item: [
            {
              name: 'Req A',
              request: {
                method: 'POST',
                header: [],
                url: { raw: '/a' }
              }
            }
          ]
        },
        {
          name: 'Req B',
          request: {
            method: 'DELETE',
            header: [],
            url: { raw: '/b' }
          }
        }
      ]
    };

    const rules = importPostmanCollection(collection);
    expect(rules).toHaveLength(2);
    expect(rules.find(r => r.url === '/a')?.method).toBe('POST');
    expect(rules.find(r => r.url === '/b')?.method).toBe('DELETE');
  });

  it('should replace {{variables}} with :param', () => {
    const collection: PostmanCollection = {
      info: { name: 'Vars', schema: 'v2.1.0' },
      item: [
        {
          name: 'Var Req',
          request: {
            method: 'GET',
            header: [],
            url: { raw: 'https://api.example.com/users/{{userId}}/posts/{{postId}}' }
          }
        }
      ]
    };

    const rules = importPostmanCollection(collection);
    expect(rules[0].url).toBe('https://api.example.com/users/:userId/posts/:postId');
  });

  it('should infer smart mock data from POST body', () => {
    const collection: PostmanCollection = {
      info: { name: 'Smart', schema: 'v2.1.0' },
      item: [
        {
          name: 'Create User',
          request: {
            method: 'POST',
            header: [],
            url: { raw: '/users' },
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                name: 'John Doe',
                avatar: 'http://...',
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

    const rules = importPostmanCollection(collection);
    const response = rules[0].response;

    expect(response.id).toBe('@guid'); // Automatically added ID
    expect(response.name).toBe('@name'); // Inferred name
    expect(response.avatar).toBe('@image(200x200)'); // Inferred image
    expect(response.age).toBe('@integer(1,100)'); // Inferred integer
    expect(response.metadata.created_at).toBe('@date'); // Inferred date in nested object
  });
});
