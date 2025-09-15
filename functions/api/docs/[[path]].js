import { json, badRequest, notFound } from '../../lib/response.js';
import { requireUser } from '../../lib/auth.js';

export const onRequest = requireUser(async (context) => {
  const { request, env, user, params } = context;
  if (request.method !== 'DELETE') return badRequest('DELETE only');

  const id = params.path; // full R2 key with slashes
  if (!id) return badRequest('Missing id');

  const prefix = `u/${user.id}/`;
  if (!id.startsWith(prefix)) return notFound('Not found');

  await env.R2_DOCUMENTS.delete(id);
  try { await env.DB.prepare('DELETE FROM documents WHERE id = ? AND user_id = ?').bind(id, user.id).run(); } catch {}
  return json({ ok: true });
});
