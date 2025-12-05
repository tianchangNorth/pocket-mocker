export function formatRequestPayload(bodyData: any): string | undefined {
  if (!bodyData) return undefined;

  if (typeof bodyData === 'string') {
    try {
      JSON.parse(bodyData);
      return bodyData;
    } catch {
      return bodyData;
    }
  }

  return JSON.stringify(bodyData, null, 2);
}

export function formatHeaders(headers: Headers | Record<string, string> | null | undefined): string | undefined {
  if (!headers) return undefined;

  if (headers instanceof Headers) {
    const headersObj: Record<string, string> = {};
    for (const [key, value] of headers.entries()) {
      headersObj[key] = value;
    }
    return JSON.stringify(headersObj, null, 2);
  }

  return JSON.stringify(headers, null, 2);
}

export function parseBodyData(bodyData: any): any {
  if (bodyData instanceof FormData) {
    const formDataObj: Record<string, string> = {};
    bodyData.forEach((value, key) => {
      formDataObj[key] = value.toString();
    });
    return formDataObj;
  } else if (bodyData instanceof URLSearchParams) {
    const urlSearchParamsObj: Record<string, string> = {};
    bodyData.forEach((value, key) => {
      urlSearchParamsObj[key] = value.toString();
    });
    return urlSearchParamsObj;
  }
  return bodyData;
}