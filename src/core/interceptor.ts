export interface MockRule {
  id: string;
  url: string;
  method: string;
  response: any;
  enabled: boolean
}

// 当前规则列表
let activeRules: MockRule[] = []

// 提供给外部更新规则的方法
export function updateRules(rules: MockRule[]) {
  activeRules = rules
}

export function initInterceptor() {
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
    const method = (init?.method || 'GET').toUpperCase();

    // 查找匹配且开启的规则
    const matchedRule = activeRules.find(r =>
      r.enabled && url.includes(r.url) && r.method === method
    );

    if (matchedRule) {
      console.log(`⚡ [PocketMock] 拦截: ${url}`);
      return new Response(JSON.stringify(matchedRule.response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return originalFetch(input, init);
  };
}