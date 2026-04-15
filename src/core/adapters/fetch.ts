import { appReady } from '@/store/store';
import { parseBodyData } from '../utils/http';
import { findMatchingRule, resolveMockResponse, logMockRequest } from '../engine/handler';

type PatchedFetch = typeof window.fetch & {
  __pocketMockPatched?: true;
  __pocketMockOriginalFetch?: typeof window.fetch;
};

export function patchFetch() {
  const currentFetch = window.fetch as PatchedFetch;
  if (currentFetch.__pocketMockPatched) return;

  const originalFetch = window.fetch;

  const pocketFetch: PatchedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
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
        logMockRequest(method, url, result.response.status, true, startTime, requestHeaders, '[Response Object]', bodyData);
        return result.response;
      }

      logMockRequest(method, url, result.status, true, startTime, requestHeaders, result.response, bodyData);

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
      logMockRequest(method, url, response.status, false, startTime, requestHeaders, responseBody, bodyData);
    }).catch(() => {
      logMockRequest(method, url, 0, false, startTime, requestHeaders, '[Network Error]', bodyData);
    });

    return promise;
  };

  pocketFetch.__pocketMockPatched = true;
  pocketFetch.__pocketMockOriginalFetch = originalFetch;
  window.fetch = pocketFetch;
}
