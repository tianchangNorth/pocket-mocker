import type { MockRule, OpenAPIDocument, OpenAPISchema } from '../types';

export function importOpenAPI(doc: OpenAPIDocument): MockRule[] {
  const rules: MockRule[] = [];
  const schemas = doc.components?.schemas || {};

  for (const [path, pathItem] of Object.entries(doc.paths)) {
    const ruleUrl = path.replace(/\{([a-zA-Z0-9_]+)\}/g, ':$1');

    const methods = ['get', 'post', 'put', 'delete', 'patch', 'options'];

    methods.forEach(method => {
      if (pathItem[method]) {
        const operation = pathItem[method];
        const rule = {
          id: generateId(),
          url: ruleUrl,
          method: method.toUpperCase(),
          status: 200,
          delay: 0,
          enabled: true,
          headers: { 'Content-Type': 'application/json' },
          response: generateResponseFromOperation(operation, schemas)
        };
        rules.push(rule);
      }
    });
  }

  return rules;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function generateResponseFromOperation(operation: any, schemas: Record<string, OpenAPISchema>): any {

  const responses = operation.responses || {};
  const successCode = Object.keys(responses).find(code => code.startsWith('2')) || 'default';

  if (!successCode || !responses[successCode]) {
    return { status: 'ok', message: 'No response schema defined' };
  }

  const responseObj = responses[successCode];

  const content = responseObj.content || {};
  const jsonContent = content['application/json'] || content['*/*'];

  if (!jsonContent || !jsonContent.schema) {
    return { status: 'ok', message: 'No JSON schema defined' };
  }

  return generateMockFromSchema(jsonContent.schema, schemas);
}

function generateMockFromSchema(schema: OpenAPISchema, schemas: Record<string, OpenAPISchema>, depth = 0): any {
  if (depth > 5) return null;

  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop();
    if (refName && schemas[refName]) {
      return generateMockFromSchema(schemas[refName], schemas, depth + 1);
    }
    return {};
  }

  if (schema.type === 'string') {
    if (schema.format === 'date' || schema.format === 'date-time') return '@date';
    if (schema.format === 'uuid') return '@guid';
    if (schema.format === 'email') return '@email';
    if (schema.format === 'uri') return '@image';
    return '@string(10)';
  }

  if (schema.type === 'integer' || schema.type === 'number') {
    return '@integer(1,100)';
  }

  if (schema.type === 'boolean') {
    return '@boolean';
  }

  if (schema.type === 'array') {
    if (schema.items) {
      return [generateMockFromSchema(schema.items, schemas, depth + 1)];
    }
    return [];
  }

  if (schema.type === 'object' || schema.properties) {
    const result: any = {};
    const props = schema.properties || {};

    for (const [key, propSchema] of Object.entries(props)) {
      if (propSchema.type === 'string' && !propSchema.format) {
        const lowerKey = key.toLowerCase();
        if (lowerKey === 'id' || lowerKey.endsWith('_id')) {
          result[key] = '@guid';
          continue;
        }
        if (lowerKey.includes('name')) {
          result[key] = '@cname';
          continue;
        }
        if (lowerKey.includes('avatar') || lowerKey.includes('image')) {
          result[key] = '@image(200x200)';
          continue;
        }
      }

      result[key] = generateMockFromSchema(propSchema, schemas, depth + 1);
    }
    return result;
  }

  return {};
}
