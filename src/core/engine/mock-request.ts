import type { MockRequest } from '../types';

export async function createMockRequest(
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