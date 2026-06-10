export interface MockRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: any;
  json: any;
  params: Record<string, string>;
  query: Record<string, string>;
}

export interface MockContext {
  state: MockStateStore;
}

export interface MockStateStore {
  get<T = any>(key: string): T | undefined;
  set<T = any>(key: string, value: T): void;
  update<T = any>(key: string, updater: (value: T | undefined) => T): void;
  delete(key: string): void;
  clear(): void;
  all(): Record<string, any>;
  replace(value: Record<string, any>): void;
  subscribe(listener: (value: Record<string, any>) => void): () => void;
}

export type DynamicResponseFunction = (req: MockRequest, ctx: MockContext) => any | Promise<any>;

export interface MockRule {
  id: string;
  url: string;
  method: string;
  response: any | DynamicResponseFunction;
  enabled: boolean;
  delay: number;
  status: number;
  headers: Record<string, string>;
  groupId?: string;
}

export interface MockGroup {
  id: string;
  name: string;
  collapsed: boolean;
}

export interface MatchResult {
  match: boolean;
  params: Record<string, string>;
}

export interface ParsedRoute {
  regex: RegExp;
  keys: string[];
}

export interface MockGenerator {
  (args?: string): any;
}

export interface PostmanCollection {
  info: {
    name: string;
    schema: string;
  };
  item: PostmanItem[];
}

export interface PostmanItem {
  name: string;
  item?: PostmanItem[];
  request?: PostmanRequest;
}

export interface PostmanRequest {
  method: string;
  header: PostmanHeader[];
  body?: PostmanBody;
  url: PostmanUrl | string;
}

export interface PostmanHeader {
  key: string;
  value: string;
  type?: string;
}

export interface PostmanBody {
  mode: 'raw' | 'formdata' | 'urlencoded' | 'file';
  raw?: string;
  formdata?: any[];
  urlencoded?: any[];
}

export interface PostmanUrl {
  raw: string;
  protocol?: string;
  host?: string[];
  path?: string[];
  query?: { key: string; value: string }[];
  variable?: any[];
}

export interface OpenAPIDocument {
  openapi: string;
  info: {
    title: string;
    version: string;
  };
  paths: Record<string, OpenAPIPathItem>;
  components?: {
    schemas?: Record<string, OpenAPISchema>;
  };
}

export interface OpenAPIPathItem {
  get?: OpenAPIOperation;
  post?: OpenAPIOperation;
  put?: OpenAPIOperation;
  delete?: OpenAPIOperation;
  patch?: OpenAPIOperation;
  options?: OpenAPIOperation;
  [key: string]: any;
}

export interface OpenAPIOperation {
  summary?: string;
  operationId?: string;
  responses?: Record<string, OpenAPIResponse>;
}

export interface OpenAPIResponse {
  description?: string;
  content?: Record<string, { schema: OpenAPISchema }>;
}

export interface OpenAPISchema {
  type?: string;
  format?: string;
  properties?: Record<string, OpenAPISchema>;
  items?: OpenAPISchema;
  $ref?: string;
  example?: any;
  default?: any;
}
