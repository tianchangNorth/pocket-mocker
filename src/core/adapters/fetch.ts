import { appReady } from '@/store/store';
import { requestLogs } from '@/store/log-store';
import { formatRequestPayload, formatHeaders, parseBodyData } from '../utils/http';
import { findMatchingRule, resolveMockResponse, logMockRequest } from '../engine/handler';

export function patchFetch() {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());

    if (url.includes('/__pocket_mock/')) {
      return originalFetch(input, init);
    }
    await appReady;

    const startTime = performance.now();
    const method = (init?.method || 'GET').toUpperCase();
    const requestHeaders = new Headers(init?.headers);

    let bodyData: any = init?.body;
    bodyData = parseBodyData(bodyData);

    const matchResult = await findMatchingRule(method, url);

    if (matchResult) {
      const { rule, match } = matchResult;

      const result = await resolveMockResponse(rule, match.params, url, method, requestHeaders, bodyData);

      if (result.response instanceof Response) {
        logMockRequest(method, url, result.response.status, startTime, '[Response Object]');
        return result.response;
      }

      logMockRequest(method, url, result.status, startTime, result.response);

      return new Response(
        typeof result.response === 'string' ? result.response : JSON.stringify(result.response),
        {
          status: result.status,
          headers: {
            'Content-Type': 'application/json',
            ...result.headers
          }
        }
      );
    }

    const promise = originalFetch(input, init);

    promise.then(async (response) => {
      const duration = Math.round(performance.now() - startTime);
      let responseBody = '';
      try {
        const clone = response.clone();
        const contentType = clone.headers.get('content-type') || '';
        if (contentType.includes('application/json') || contentType.includes('text/') || contentType.includes('xml')) {
          responseBody = await clone.text();
        } else {
          responseBody = '[Binary/Stream Data]';
        }
      } catch (e) {
        responseBody = '[Error reading body]';
      }

      requestLogs.add({
        method,
        url,
        status: response.status,
        timestamp: Date.now(),
        duration,
        isMock: false,
        responseBody,
        requestPayload: formatRequestPayload(bodyData),
        requestHeaders: formatHeaders(requestHeaders)
      });
    }).catch(() => {
      requestLogs.add({
        method,
        url,
        status: 0,
        timestamp: Date.now(),
        duration: Math.round(performance.now() - startTime),
        isMock: false,
        responseBody: '[Network Error]',
        requestPayload: formatRequestPayload(bodyData),
        requestHeaders: formatHeaders(requestHeaders)
      });
    });

    return promise;
  };
}
