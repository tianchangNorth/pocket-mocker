import { describe, it, expect } from 'vitest';
import { parseBodyData, formatJSON } from '../../../src/core/utils/http';

describe('HTTP Utils', () => {
  describe('formatRequestPayload', () => {
    it('should return undefined for null or undefined bodyData', () => {
      expect(formatJSON(null)).toBeUndefined();
      expect(formatJSON(undefined)).toBeUndefined();
    });

    it('should return string as is if it is not JSON', () => {
      const payload = 'plain text';
      expect(formatJSON(payload)).toBe(payload);
    });

    it('should format JSON string if it is valid JSON', () => {
      const payload = '{"key": "value"}';
      const expected = JSON.stringify(JSON.parse(payload), null, 2);
      expect(formatJSON(payload)).toBe(expected);
    });

    it('should stringify an object', () => {
      const payload = { key: 'value', num: 123 };
      expect(formatJSON(payload)).toBe(JSON.stringify(payload, null, 2));
    });

    it('should stringify an array', () => {
      const payload = [{ a: 1 }, { b: 2 }];
      expect(formatJSON(payload)).toBe(JSON.stringify(payload, null, 2));
    });
  });

  describe('formatHeaders', () => {
    it('should return undefined for null or undefined headers', () => {
      expect(formatJSON(null)).toBeUndefined();
      expect(formatJSON(undefined)).toBeUndefined();
    });

    it('should stringify a Headers object', () => {
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('X-Custom', 'Value');
      const expected = JSON.stringify({ 'content-type': 'application/json', 'x-custom': 'Value' }, null, 2);
      expect(formatJSON(headers)).toBe(expected);
    });

    it('should stringify a plain object', () => {
      const headers = { 'Content-Type': 'application/xml', 'Accept': '*/*' };
      expect(formatJSON(headers)).toBe(JSON.stringify(headers, null, 2));
    });
  });

  describe('parseBodyData', () => {
    it('should return bodyData as is for non-FormData/URLSearchParams', () => {
      const obj = { key: 'value' };
      expect(parseBodyData(obj)).toBe(obj);
      const str = 'plain string';
      expect(parseBodyData(str)).toBe(str);
      expect(parseBodyData(null)).toBeNull();
      expect(parseBodyData(undefined)).toBeUndefined();
    });

    it('should parse FormData into a plain object', () => {
      const formData = new FormData();
      formData.append('name', 'test');
      formData.append('age', '30');
      expect(parseBodyData(formData)).toEqual({ name: 'test', age: '30' });
    });

    it('should parse URLSearchParams into a plain object', () => {
      const urlSearchParams = new URLSearchParams();
      urlSearchParams.append('param1', 'value1');
      urlSearchParams.append('param2', 'value2');
      expect(parseBodyData(urlSearchParams)).toEqual({ param1: 'value1', param2: 'value2' });
    });
  });
});
