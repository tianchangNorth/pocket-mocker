export interface MockRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: any;
  json: any;
  params: Record<string, string>;
  query: Record<string, string>;
}

export type DynamicResponseFunction = (req: MockRequest) => any | Promise<any>;

export interface MockRule {
  id: string;
  url: string;
  method: string;
  response: any | DynamicResponseFunction;
  enabled: boolean;
  delay: number;
  status: number;
  headers: Record<string, string>;
}
