import { matchRoute } from './matcher';
import { generateMockData } from './smart-mock';
import { createMockRequest } from './mock-request';
import { getActiveRules } from '../manager/rule-manager';
import { requestLogs } from '@/store/log-store';
import { formatHeaders, formatRequestPayload, formatResponseBody } from '../utils/http';

import type { MockRule } from '../types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface MockResult {
  response: any;
  status: number;
  headers: Record<string, string>;
  delay: number;
}

export async function findMatchingRule(method: string, url: string) {
  const activeRules = getActiveRules();
  return activeRules.map(r => ({
    rule: r,
    match: matchRoute(r.url, url)
  })).find(item => item.rule.enabled && item.rule.method === method && item.match.match);
}

export async function resolveMockResponse(
  rule: MockRule,
  matchParams: Record<string, string>,
  url: string,
  method: string,
  requestHeaders: Headers,
  bodyData: any
): Promise<MockResult> {
  if (rule.delay > 0) {
    await sleep(rule.delay);
  }

  let resolvedResponse: any = rule.response;

  if (typeof resolvedResponse === 'string') {
    const trimmed = resolvedResponse.trim();
    if (trimmed.startsWith('(') || trimmed.startsWith('function') || trimmed.includes('=>') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const evaluated = new Function('return ' + resolvedResponse)();
        resolvedResponse = evaluated;
      } catch (e) {
      }
    }
  }

  if (typeof resolvedResponse === 'function') {
    const mockRequest = await createMockRequest(url, method, requestHeaders, bodyData, matchParams);
    try {
      resolvedResponse = await Promise.resolve(resolvedResponse(mockRequest));
    } catch (e) {
      resolvedResponse = { status: 500, body: { error: 'Mock function execution failed' } };
    }
  }

  if (resolvedResponse && typeof resolvedResponse === 'object' && !Object.prototype.hasOwnProperty.call(resolvedResponse, 'body')) {
    try {
      resolvedResponse = generateMockData(resolvedResponse);
    } catch (e) {
      console.error('[PocketMock] Error generating mock data:', e);
    }
  }

  let finalBody = resolvedResponse;
  let finalStatus = rule.status;
  let finalHeaders = rule.headers || {};

  if (resolvedResponse instanceof Response) {
    return {
      response: resolvedResponse,
      status: resolvedResponse.status,
      headers: {},
      delay: rule.delay
    };
  }

  if (resolvedResponse && typeof resolvedResponse === 'object' && Object.prototype.hasOwnProperty.call(resolvedResponse, 'body')) {
    finalBody = resolvedResponse.body;
    finalStatus = resolvedResponse.status || rule.status;
    finalHeaders = { ...finalHeaders, ...resolvedResponse.headers };
  }

  return {
    response: finalBody,
    status: finalStatus,
    headers: finalHeaders,
    delay: rule.delay
  };
}

export function logMockRequest(
  method: string,
  url: string,
  status: number,
  startTime: number,
  requestHeaders?: any,
  responseBody?: any,
  requestPayload?: any
) {
  const duration = Math.round(performance.now() - startTime);
  requestLogs.add({
    method,
    url,
    status,
    timestamp: Date.now(),
    duration,
    isMock: true,
    requestHeaders: formatHeaders(requestHeaders),
    requestPayload: formatRequestPayload(requestPayload),
    responseBody: formatResponseBody(responseBody)
  });
}
