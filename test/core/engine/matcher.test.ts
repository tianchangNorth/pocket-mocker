import { describe, it, expect } from 'vitest';
import { matchRoute } from '../../../src/core/engine/matcher';

describe('Route Matcher', () => {
  it('Legacy exact match should pass', () => {
    const res = matchRoute('/api/users', 'http://localhost/api/users');
    expect(res.match).toBe(true);
  });

  it('Legacy includes match should pass', () => {
    const res = matchRoute('users', 'http://localhost/api/users/list');
    expect(res.match).toBe(true);
  });

  it('Param match should pass and extract params', () => {
    const res = matchRoute('/api/users/:id', 'http://localhost/api/users/123');
    expect(res.match).toBe(true);
    expect(res.params.id).toBe('123');
  });

  it('Param match wrong path should fail', () => {
    const res = matchRoute('/api/users/:id', 'http://localhost/api/posts/123');
    // Note: includes match might trigger if we are not careful, but specificity logic handles priority.
    // Here matchRoute returns basic match boolean.
    // Since '/api/users/:id' does not "include" '/api/posts/123' and regex doesn't match.
    expect(res.match).toBe(false);
  });

  it('Wildcard match should pass', () => {
    const res = matchRoute('/api/files/*', 'http://localhost/api/files/images/logo.png');
    expect(res.match).toBe(true);
  });

  it('Mixed Param and Wildcard match', () => {
    const res = matchRoute('/files/:type/*', 'http://localhost/files/img/logo.png');
    expect(res.match).toBe(true);
    expect(res.params.type).toBe('img');
  });
});