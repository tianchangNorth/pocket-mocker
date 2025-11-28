import { requestLogs } from "./log-store";
import { appReady } from './store';
import { matchRoute } from './matcher';
import type { MockRequest, MockRule } from './types'; // Use shared types

export type { MockRule }; // Re-export for consumers if needed

// Current rule list
let activeRules: MockRule[] = []

function getSpecificity(url: string): number {
  if (url.includes('*')) return 10;
  if (url.includes(':')) return 50;
  return 100;
}

// Method for external updates to rules
export function updateRules(rules: MockRule[]) {
  activeRules = [...rules].sort((a, b) => getSpecificity(b.url) - getSpecificity(a.url));
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function createMockRequest(
  url: string,
  method: string,
  headers: Headers,
  bodyData: any, // Raw body data can be string, FormData, etc.
  params: Record<string, string>
): Promise<MockRequest> {
  const urlObj = new URL(url, window.location.origin); // Fix: Provide base for relative URLs
  const query: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => { // Query params from search string
    query[key] = value;
  });

  const requestHeaders: Record<string, string> = {};
  headers.forEach((value, key) => { // Headers iterator yields [key, value]
    requestHeaders[key] = value;
  });
  
  let jsonBody: any = undefined;
  const contentType = requestHeaders['content-type'] || '';
  if (bodyData && typeof bodyData === 'string' && contentType.includes('application/json')) {
    try {
      jsonBody = JSON.parse(bodyData);
    } catch (e) {
      // console.warn('[PocketMock] Could not parse JSON body for MockRequest:', e); // Remove log
    }
  }

  // DX Enhancement: If body is parsed JSON, prioritize it for req.body
  // This allows users to use req.body.key directly
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

    // Extract body data for createMockRequest
    let bodyData: any = init?.body;
    if (bodyData instanceof FormData) { // Convert FormData to object for easier access
        const formDataObj: Record<string, string> = {};
        for (const pair of bodyData.entries()) {
            formDataObj[pair[0]] = pair[1].toString();
        }
        bodyData = formDataObj;
    } else if (bodyData instanceof URLSearchParams) { // Convert URLSearchParams to object
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
      // console.log(`[PocketMock] Fetch intercepted: ${method} ${url}`); // Remove log

      if (rule.delay > 0) {
        await sleep(rule.delay);
      }
      
      let resolvedResponse: any = rule.response;

      // Hydrate string response if it looks like code (function or object literal)
      if (typeof resolvedResponse === 'string') {
        const trimmed = resolvedResponse.trim();
        // Check for function signature or object/array literal
        if (trimmed.startsWith('(') || trimmed.startsWith('function') || trimmed.includes('=>') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
          try {
            // Safe-ish evaluation to turn string into JS object/function
            const evaluated = new Function('return ' + resolvedResponse)();
            resolvedResponse = evaluated;
          } catch (e) {
            // Keep as string if eval fails
          }
        }
      }

      if (typeof resolvedResponse === 'function') {
        const mockRequest = await createMockRequest(url, method, requestHeaders, bodyData, match.params);
        try {
          resolvedResponse = await Promise.resolve(resolvedResponse(mockRequest));
        } catch (e) {
          // console.error('[PocketMock] Error executing response function:', e); // Remove log
          resolvedResponse = { status: 500, body: { error: 'Mock function execution failed' } };
        }
      }

      const duration = Math.round(performance.now() - startTime);

      let responseContent = resolvedResponse;
      let responseStatus = rule.status;
      let responseHeaders = rule.headers || {};

      // Handle full Response object returned by function
      if (resolvedResponse instanceof Response) {
        // If the function returns a Response object, use it directly
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

      // Handle { body, status, headers } object returned by function (or standard rule.response)
      if (resolvedResponse && typeof resolvedResponse === 'object' && Object.prototype.hasOwnProperty.call(resolvedResponse, 'body')) {
        responseContent = resolvedResponse.body;
        responseStatus = resolvedResponse.status || rule.status;
        responseHeaders = { ...responseHeaders, ...resolvedResponse.headers };
      }
      // Else, use resolvedResponse as direct content

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
            'Content-Type': 'application/json', // Default to JSON content type
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
       // Network error, usually handled by browser console, but we could log it as status 0
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
    private _requestBody: any = undefined; // raw body sent

    open(method: string, url: string | URL, ...args: any[]) {
      this._url = url.toString();
      this._method = method.toUpperCase();
      this._startTime = performance.now();
      // @ts-ignore
      super.open(method, url, ...args);
    }
    
    setRequestHeader(name: string, value: string) {
      this._requestHeaders.set(name, value);
      super.setRequestHeader(name, value);
    }

    send(body?: any) {
      this._requestBody = body; // Store raw body sent

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
            // console.log(`[PocketMock] XHR intercepted: ${this._method} ${this._url}`); // Remove log

            if (rule.delay > 0) await sleep(rule.delay);

            let resolvedResponse: any = rule.response;
            let bodyData: any = this._requestBody;
            if (bodyData instanceof FormData) { // Convert FormData to object for easier access
                const formDataObj: Record<string, string> = {};
                for (const pair of bodyData.entries()) {
                    formDataObj[pair[0]] = pair[1].toString();
                }
                bodyData = formDataObj;
            } else if (bodyData instanceof URLSearchParams) { // Convert URLSearchParams to object
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
                    // Keep as string
                  }
                }
            }

            if (typeof resolvedResponse === 'function') {
              const mockRequest = await createMockRequest(this._url, this._method, this._requestHeaders, bodyData, match.params);
              // console.log('[PocketMock] Executing dynamic response (XHR) with req:', mockRequest); // Remove log
              try {
                  resolvedResponse = await Promise.resolve(resolvedResponse(mockRequest));
                  // console.log('[PocketMock] Dynamic response result:', resolvedResponse); // Remove log
              } catch (e) {
                  // console.error('[PocketMock] Error executing response function:', e); // Remove log
                  resolvedResponse = { status: 500, body: { error: 'Mock function execution failed' } };
              }
            }

            const duration = Math.round(performance.now() - this._startTime);

            // Handle full Response object from function - XHR specific handling
            if (resolvedResponse instanceof Response) {
              // For XHR, we need to extract properties from Response and set them on the XHR instance
              const responseText = await resolvedResponse.text();
              const responseStatus = resolvedResponse.status;
              const responseHeaders = Object.fromEntries(resolvedResponse.headers.entries());

              // Reconstruct as a compatible object
              resolvedResponse = {
                body: responseText,
                status: responseStatus,
                headers: responseHeaders,
              };
            }

            let actualResponseData = resolvedResponse;
            let actualHeaders = rule.headers || {};
            let actualStatus = rule.status;

            // Handle { body, status, headers } object from function (or standard rule.response)
            if (resolvedResponse && typeof resolvedResponse === 'object' && Object.prototype.hasOwnProperty.call(resolvedResponse, 'body')) {
              actualResponseData = resolvedResponse.body;
              actualStatus = resolvedResponse.status || rule.status;
              actualHeaders = { ...actualHeaders, ...resolvedResponse.headers };
            }

            const responseData = (typeof actualResponseData === 'string' ? actualResponseData : JSON.stringify(actualResponseData)) || '{}';

            // console.log('[PocketMock] XHR responseData being set:', responseData); // Remove log

            Object.defineProperty(this, 'status', { value: actualStatus, writable: true });
            Object.defineProperty(this, 'statusText', { value: actualStatus === 200 ? 'OK' : 'Mocked', writable: true });
            Object.defineProperty(this, 'readyState', { value: 4, writable: true });
            Object.defineProperty(this, 'response', { value: responseData, writable: true });
            Object.defineProperty(this, 'responseText', { value: responseData, writable: true });
            Object.defineProperty(this, 'responseURL', { value: this._url, writable: true });

            const finalHeaders = Object.entries({
              'content-type': 'application/json', // Default to JSON content type
              ...actualHeaders
            }).map(([k, v]) => `${k}: ${v}`).join('\r\n');

            this.getAllResponseHeaders = () => finalHeaders;
            this.getResponseHeader = (name: string) => actualHeaders[name.toLowerCase()] || null;

            requestLogs.add({
              method: this._method, url: this._url, status: actualStatus, timestamp: Date.now(), duration, isMock: true,
              responseBody: responseData // Store response body for mock too
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

            return; // 拦截成功，不再发送真实请求
          }

          // === Real Request Monitoring for XHR ===
          // Attach listeners BEFORE calling super.send to ensure they are active.
          // Note: XHR event model is different from Fetch, response is available after loadend.
          this.addEventListener('loadend', () => { // Use loadend for final state
            const duration = Math.round(performance.now() - this._startTime);
            let responseBody = '';
            try {
              // Try to get response text
              // XHR.response can be object (json), string (text), Blob, ArrayBuffer
              if (!this.responseType || this.responseType === 'text') { // Default or text
                responseBody = this.responseText;
              } else if (this.responseType === 'json') { // Already parsed json
                responseBody = JSON.stringify(this.response);
              } else { // Blob, ArrayBuffer, etc.
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
                status: this.status || 0, // XHR status might be 0 on network error
                timestamp: Date.now(),
                duration: Math.round(performance.now() - this._startTime),
                isMock: false,
                responseBody: '[Network Error]'
             });
          });


          // 未命中规则，透传
          super.send(body);

        } catch (error) {
          // console.error('[PocketMock] XHR Error:', error); // Remove log
          super.send(body);
        }
      })();
    }
  }

  // @ts-ignore
  window.XMLHttpRequest = PocketXHR;
}

export function initInterceptor() {
  // console.log('%c PocketMock started (Fetch + XHR) ', 'background: #222; color: #bada55'); // Remove log
  patchFetch();
  patchXHR();
}
