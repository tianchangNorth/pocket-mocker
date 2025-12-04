import { requestLogs } from "../store/log-store";
import { appReady } from '../store/store';
import { matchRoute } from './matcher';
import { generateMockData } from './smart-mock';

import type { MockRequest, MockRule } from './types';
export type { MockRule };

let activeRules: MockRule[] = []

function getSpecificity(url: string): number {
  if (url.includes('*')) return 10;
  if (url.includes(':')) return 50;
  return 100;
}

export function updateRules(rules: MockRule[]) {
  activeRules = [...rules].sort((a, b) => getSpecificity(b.url) - getSpecificity(a.url));
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function createMockRequest(
  url: string,
  method: string,
  headers: Headers,
  bodyData: any,
  params: Record<string, string>
): Promise<MockRequest> {
  const urlObj = new URL(url, window.location.origin);
  const query: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const requestHeaders: Record<string, string> = {};
  headers.forEach((value, key) => {
    requestHeaders[key] = value;
  });

  let jsonBody: any = undefined;
  const contentType = requestHeaders['content-type'] || '';
  if (bodyData && typeof bodyData === 'string' && contentType.includes('application/json')) {
    try {
      jsonBody = JSON.parse(bodyData);
    } catch (e: any) {
      throw new Error('Failed to parse JSON: Unknown error');
    }
  }

  const finalBody = jsonBody || bodyData;

  return {
    url: url,
    method: method,
    headers: requestHeaders,
    body: finalBody,
    json: jsonBody,
    params: params,
    query: query,
  };
}

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
    if (bodyData instanceof FormData) {
      const formDataObj: Record<string, string> = {};
      for (const pair of bodyData.entries()) {
        formDataObj[pair[0]] = pair[1].toString();
      }
      bodyData = formDataObj;
    } else if (bodyData instanceof URLSearchParams) {
      const urlSearchParamsObj: Record<string, string> = {};
      for (const pair of bodyData.entries()) {
        urlSearchParamsObj[pair[0]] = pair[1].toString();
      }
      bodyData = urlSearchParamsObj;
    }


    const matchResult = activeRules.map(r => ({
      rule: r,
      match: matchRoute(r.url, url)
    })).find(item => item.rule.enabled && item.rule.method === method && item.match.match);

    if (matchResult) {
      const { rule, match } = matchResult;

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
        const mockRequest = await createMockRequest(url, method, requestHeaders, bodyData, match.params);
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

      const duration = Math.round(performance.now() - startTime);

      let responseContent = resolvedResponse;
      let responseStatus = rule.status;
      let responseHeaders = rule.headers || {};

      if (resolvedResponse instanceof Response) {
        requestLogs.add({
          method,
          url,
          status: resolvedResponse.status,
          timestamp: Date.now(),
          duration,
          isMock: true
        });
        return resolvedResponse;
      }

      if (resolvedResponse && typeof resolvedResponse === 'object' && Object.prototype.hasOwnProperty.call(resolvedResponse, 'body')) {
        responseContent = resolvedResponse.body;
        responseStatus = resolvedResponse.status || rule.status;
        responseHeaders = { ...responseHeaders, ...resolvedResponse.headers };
      }

      requestLogs.add({
        method,
        url,
        status: responseStatus,
        timestamp: Date.now(),
        duration,
        isMock: true
      });

      return new Response(
        typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent),
        {
          status: responseStatus,
          headers: {
            'Content-Type': 'application/json',
            ...responseHeaders
          }
        }
      );
    }

    // === Real Request Monitoring ===
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
        responseBody
      });
    }).catch(() => {
      requestLogs.add({
        method,
        url,
        status: 0,
        timestamp: Date.now(),
        duration: Math.round(performance.now() - startTime),
        isMock: false,
        responseBody: '[Network Error]'
      });
    });

    return promise;
  };
}

function patchXHR() {
  const OriginalXHR = window.XMLHttpRequest;

  class PocketXHR extends OriginalXHR {
    private _url: string = '';
    private _method: string = 'GET';
    private _startTime: number = 0;
    private _requestHeaders: Headers = new Headers();
    private _requestBody: any = undefined;

    open(method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null) {
      this._url = url.toString();
      this._method = method.toUpperCase();
      this._startTime = performance.now();

      if (async !== undefined) {
        super.open(method, url, async, user, password);
      } else {
        super.open(method, url);
      }
    }

    setRequestHeader(name: string, value: string) {
      this._requestHeaders.set(name, value);
      super.setRequestHeader(name, value);
    }

    send(body?: any) {
      this._requestBody = body;

      if (this._url.includes('/__pocket_mock/')) {
        super.send(body);
        return;
      }

      (async () => {
        try {
          await appReady;

          const matchResult = activeRules.map(r => ({
            rule: r,
            match: matchRoute(r.url, this._url)
          })).find(item => item.rule.enabled && item.rule.method === this._method && item.match.match);

          if (matchResult) {
            const { rule, match } = matchResult;


            if (rule.delay > 0) await sleep(rule.delay);

            let resolvedResponse: any = rule.response;
            let bodyData: any = this._requestBody;
            if (bodyData instanceof FormData) {
              const formDataObj: Record<string, string> = {};
              for (const pair of bodyData.entries()) {
                formDataObj[pair[0]] = pair[1].toString();
              }
              bodyData = formDataObj;
            } else if (bodyData instanceof URLSearchParams) {
              const urlSearchParamsObj: Record<string, string> = {};
              for (const pair of bodyData.entries()) {
                urlSearchParamsObj[pair[0]] = pair[1].toString();
              }
              bodyData = urlSearchParamsObj;
            }


            if (typeof rule.response === 'string') {
              const trimmed = rule.response.trim();
              if (trimmed.startsWith('(') || trimmed.startsWith('function') || trimmed.includes('=>') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
                try {
                  const evaluated = new Function('return ' + rule.response)();
                  resolvedResponse = evaluated;
                } catch (e) {
                }
              }
            }

            if (typeof resolvedResponse === 'function') {
              const mockRequest = await createMockRequest(this._url, this._method, this._requestHeaders, bodyData, match.params);
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
                console.error('[PocketMock] Error generating mock data (XHR):', e);
              }
            }

            const duration = Math.round(performance.now() - this._startTime);

            if (resolvedResponse instanceof Response) {
              const responseText = await resolvedResponse.text();
              const responseStatus = resolvedResponse.status;
              const responseHeaders = Object.fromEntries(resolvedResponse.headers.entries());

              resolvedResponse = {
                body: responseText,
                status: responseStatus,
                headers: responseHeaders,
              };
            }

            let actualResponseData = resolvedResponse;
            let actualHeaders = rule.headers || {};
            let actualStatus = rule.status;

            if (resolvedResponse && typeof resolvedResponse === 'object' && Object.prototype.hasOwnProperty.call(resolvedResponse, 'body')) {
              actualResponseData = resolvedResponse.body;
              actualStatus = resolvedResponse.status || rule.status;
              actualHeaders = { ...actualHeaders, ...resolvedResponse.headers };
            }

            const responseData = (typeof actualResponseData === 'string' ? actualResponseData : JSON.stringify(actualResponseData)) || '{}';


            Object.defineProperty(this, 'status', { value: actualStatus, writable: true });
            Object.defineProperty(this, 'statusText', { value: actualStatus === 200 ? 'OK' : 'Mocked', writable: true });
            Object.defineProperty(this, 'readyState', { value: 4, writable: true });
            Object.defineProperty(this, 'response', { value: responseData, writable: true });
            Object.defineProperty(this, 'responseText', { value: responseData, writable: true });
            Object.defineProperty(this, 'responseURL', { value: this._url, writable: true });

            const finalHeaders = Object.entries({
              'content-type': 'application/json',
              ...actualHeaders
            }).map(([k, v]) => `${k}: ${v}`).join('\r\n');

            this.getAllResponseHeaders = () => finalHeaders;
            this.getResponseHeader = (name: string) => actualHeaders[name.toLowerCase()] || null;

            requestLogs.add({
              method: this._method, url: this._url, status: actualStatus, timestamp: Date.now(), duration, isMock: true,
              responseBody: responseData
            });

            setTimeout(() => {
              this.dispatchEvent(new ProgressEvent('loadstart'));
              this.dispatchEvent(new ProgressEvent('progress', {
                lengthComputable: true,
                loaded: responseData.length,
                total: responseData.length
              }));
              this.dispatchEvent(new ProgressEvent('load', {
                lengthComputable: true,
                loaded: responseData.length,
                total: responseData.length
              }));
              this.dispatchEvent(new ProgressEvent('loadend', {
                lengthComputable: true,
                loaded: responseData.length,
                total: responseData.length
              }));
            }, 1);

            return;
          }

          // === Real Request Monitoring for XHR ===
          // Attach listeners BEFORE calling super.send to ensure they are active.
          // Note: XHR event model is different from Fetch, response is available after loadend.
          this.addEventListener('loadend', () => {
            const duration = Math.round(performance.now() - this._startTime);
            let responseBody = '';
            try {
              if (!this.responseType || this.responseType === 'text') {
                responseBody = this.responseText;
              } else if (this.responseType === 'json') {
                responseBody = JSON.stringify(this.response);
              } else {
                responseBody = `[${this.responseType} Data]`
              }
            } catch (e) {
              responseBody = '[Error reading body]';
            }

            requestLogs.add({
              method: this._method,
              url: this._url,
              status: this.status,
              timestamp: Date.now(),
              duration,
              isMock: false,
              responseBody
            });
          });

          this.addEventListener('error', () => {
            requestLogs.add({
              method: this._method,
              url: this._url,
              status: this.status || 0,
              timestamp: Date.now(),
              duration: Math.round(performance.now() - this._startTime),
              isMock: false,
              responseBody: '[Network Error]'
            });
          });

          super.send(body);

        } catch (error) {

          super.send(body);
        }
      })();
    }
  }

  window.XMLHttpRequest = PocketXHR;
}

export function initInterceptor() {
  patchFetch();
  patchXHR();
}

