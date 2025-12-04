interface MatchResult {
  match: boolean;
  params: Record<string, string>;
}

interface ParsedRoute {
  regex: RegExp;
  keys: string[];
}

const patternCache = new Map<string, ParsedRoute | null>();

function parseRoute(ruleUrl: string): ParsedRoute | null {
  if (patternCache.has(ruleUrl)) {
    return patternCache.get(ruleUrl)!;
  }

  if (!ruleUrl.includes(':') && !ruleUrl.includes('*')) {
    patternCache.set(ruleUrl, null);
    return null;
  }

  const keys: string[] = [];

  let regexStr = ruleUrl
    .replace(/[.+?^${}()|[\\]/g, '\$&')
    .replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    })
    .replace(/\*/g, '(.*)');

  const regex = new RegExp(regexStr + '$');

  const result = { regex, keys };
  patternCache.set(ruleUrl, result);

  return result;
}

export function matchRoute(ruleUrl: string, requestUrl: string): MatchResult {
  let cleanUrl = requestUrl;

  try {
    if (requestUrl.includes('?')) {
      cleanUrl = requestUrl.split('?')[0];
    }
  } catch (e) {
  }

  const pattern = parseRoute(ruleUrl);

  if (pattern) {
    const match = cleanUrl.match(pattern.regex);
    if (match) {
      const params: Record<string, string> = {};
      pattern.keys.forEach((key, index) => {
        params[key] = match[index + 1];
      });
      return { match: true, params };
    }

    return { match: false, params: {} };
  }

  const isExactMatch = requestUrl === ruleUrl || requestUrl.endsWith(ruleUrl);
  const isIncludeMatch = requestUrl.includes(ruleUrl);

  return { match: isExactMatch || isIncludeMatch, params: {} };
}
