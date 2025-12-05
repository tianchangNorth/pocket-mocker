import { patchFetch } from './adapters/fetch';
import { patchXHR } from './adapters/xhr';

export * from './types';
export { updateRules } from './manager/rule-manager';

export function initInterceptor() {
  patchFetch();
  patchXHR();
}
