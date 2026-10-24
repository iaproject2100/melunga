import { getStore } from '@netlify/blobs';

// SDK 10 treats a conditional write as modified for every HTTP status except
// 412. Reject provider failures before that result can be interpreted as a
// successful account update. Preserve only the expected negative results:
// a missing read, an idempotent deletion, and a failed write precondition.
export async function checkedBlobsFetch(input, init) {
  const response = await globalThis.fetch(input, init);
  const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  if (response.ok || (['GET', 'DELETE'].includes(method) && response.status === 404)
      || (method === 'PUT' && response.status === 412)) return response;
  throw new Error('blobs_request_failed');
}

export function getAccessStore() {
  return getStore({ name: 'melunga-access', consistency: 'strong', fetch: checkedBlobsFetch });
}
