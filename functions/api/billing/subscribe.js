import { json, badRequest } from '../../lib/response.js';
import { requireUser } from '../../lib/auth.js';
export const onRequest = requireUser(async ({ request }) => {
  if (request.method !== 'POST') return badRequest('POST only');
  return json({ ok: true, status: 'active', plan: 'pro' });
});
