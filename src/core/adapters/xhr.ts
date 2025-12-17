import { appReady } from '@/store/store';
import { requestLogs } from '@/store/log-store';
import { formatRequestPayload, formatHeaders, formatResponseBody, parseBodyData } from '../utils/http';
import { findMatchingRule, resolveMockResponse, logMockRequest } from '../engine/handler';

export function patchXHR() {
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

          const bodyData = parseBodyData(this._requestBody);

          const matchResult = await findMatchingRule(this._method, this._url);

          if (matchResult) {
            const { rule, match } = matchResult;

            let result = await resolveMockResponse(rule, match.params, this._url, this._method, this._requestHeaders, bodyData);

            if (result.response instanceof Response) {
              const responseText = await result.response.text();
              result = {
                ...result,
                response: responseText,
                status: result.response.status,
                headers: Object.fromEntries(result.response.headers.entries())
              };
            }

            const responseData = (typeof result.response === 'string' ? result.response : JSON.stringify(result.response)) || '{}';

            Object.defineProperty(this, 'status', { value: result.status, writable: true });
            Object.defineProperty(this, 'statusText', { value: result.status === 200 ? 'OK' : 'Mocked', writable: true });
            Object.defineProperty(this, 'readyState', { value: 4, writable: true });
            Object.defineProperty(this, 'response', { value: responseData, writable: true });
            Object.defineProperty(this, 'responseText', { value: responseData, writable: true });
            Object.defineProperty(this, 'responseURL', { value: this._url, writable: true });

            const finalHeaders = Object.entries({
              'content-type': 'application/json',
              ...result.headers
            }).map(([k, v]) => `${k}: ${v}`).join('\r\n');

            this.getAllResponseHeaders = () => finalHeaders;
            this.getResponseHeader = (name: string) => {
              const lowerName = name.toLowerCase();
              const foundKey = Object.keys(result.headers).find(k => k.toLowerCase() === lowerName);
              return foundKey ? result.headers[foundKey] : null;
            };

            logMockRequest(this._method, this._url, result.status, this._startTime, this._requestHeaders, responseData, this._requestBody);

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
              if (this.onreadystatechange) {
                this.onreadystatechange(new Event('readystatechange'));
              }
            }, 1);

            return;
          }

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
              responseBody: formatResponseBody(responseBody),
              requestPayload: formatRequestPayload(this._requestBody),
              requestHeaders: formatHeaders(this._requestHeaders)
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
              responseBody: '[Network Error]',
              requestPayload: formatRequestPayload(this._requestBody),
              requestHeaders: formatHeaders(this._requestHeaders)
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
