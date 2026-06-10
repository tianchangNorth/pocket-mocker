import type { MatchResult, ParsedRoute } from '../types'

const patternCache = new Map<string, ParsedRoute | null>();

function stripQueryAndHash(url: string): string {
  return url.split(/[?#]/)[0];
}

function getPathname(url: string): string {
  try {
    return new URL(url, 'http://pocket-mock.local').pathname;
  } catch {
    return stripQueryAndHash(url);
  }
}

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

  const regex = new RegExp((ruleUrl.startsWith('/') ? '^' : '') + regexStr + '$');

  const result = { regex, keys };
  patternCache.set(ruleUrl, result);

  return result;
}

export function matchRoute(ruleUrl: string, requestUrl: string): MatchResult {
  const cleanUrl = stripQueryAndHash(requestUrl);
  const cleanRuleUrl = stripQueryAndHash(ruleUrl);

  const pattern = parseRoute(ruleUrl);

  if (pattern) {
    const targetUrl = ruleUrl.startsWith('/') ? getPathname(cleanUrl) : cleanUrl;
    const match = targetUrl.match(pattern.regex);
    if (match) {
      const params: Record<string, string> = {};
      pattern.keys.forEach((key, index) => {
        params[key] = match[index + 1];
      });
      return { match: true, params };
    }

    return { match: false, params: {} };
  }

  if (ruleUrl.startsWith('/')) {
    return { match: getPathname(cleanUrl) === cleanRuleUrl, params: {} };
  }

  const isExactMatch = cleanUrl === cleanRuleUrl || cleanUrl.endsWith(cleanRuleUrl);
  const isIncludeMatch = cleanUrl.includes(cleanRuleUrl);

  return { match: isExactMatch || isIncludeMatch, params: {} };
}
