import { json, badRequest } from '../../lib/response.js';
import { verifyPassword } from '../../lib/password.js';
import { issueSession } from '../../lib/auth.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return badRequest('POST only');

  let body; try { body = await request.json(); } catch { return badRequest('Invalid JSON'); }
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email || !password) return badRequest('Missing email/password');

  const row = await env.DB.prepare('SELECT id, email, first_name, last_name, role, password_hash FROM users WHERE email = ?').bind(email).first();
  if (!row) return json({ error: 'Invalid credentials' }, { status: 401 });

  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) return json({ error: 'Invalid credentials' }, { status: 401 });

  const { jwt, cookie } = await issueSession(context, row);
  const res = json({ ok: true, token: jwt, user: { id: row.id, email: row.email, firstName: row.first_name, lastName: row.last_name, role: row.role || 'user' }});
  res.headers.append('Set-Cookie', cookie);
  return res;
}
