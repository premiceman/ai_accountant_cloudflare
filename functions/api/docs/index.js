import { json, badRequest } from '../../lib/response.js';
import { requireUser } from '../../lib/auth.js';

function safeName(s) { return String(s || 'file').replace(/[^\w.\-]+/g, '_'); }

export const onRequest = requireUser(async (context) => {
  const { request, env, user } = context;
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'other';
  const year = url.searchParams.get('year') || '';

  if (request.method === 'GET') {
    const prefix = `u/${user.id}/${type}/`;
    const files = [];
    let cursor;
    do {
      const resp = await env.R2_DOCUMENTS.list({ prefix, cursor, include: ['customMetadata'] });
      for (const obj of resp.objects) {
        files.push({
          id: obj.key,
          type,
          filename: obj.customMetadata?.filename || obj.key.split('_').slice(1).join('_') || 'file',
          storedAs: obj.key,
          length: obj.size,
          mime: obj.customMetadata?.mime || obj.httpMetadata?.contentType || '',
          uploadDate: obj.uploaded?.toISOString?.() || new Date().toISOString()
        });
      }
      cursor = resp.truncated ? resp.cursor : undefined;
    } while (cursor);
    return json({ files });
  }

  if (request.method === 'POST') {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') return badRequest('No file');

    const ts = Date.now();
    const key = `u/${user.id}/${type}/${ts}_${safeName(file.name)}`;

    await env.R2_DOCUMENTS.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
      customMetadata: { userId: user.id, filename: file.name || 'file', mime: file.type || '', year: String(year || '') }
    });

    try {
      await env.DB.prepare(
        `INSERT INTO documents (id,user_id,type,filename,mime,size,upload_date,r2_key,year)
         VALUES (?,?,?,?,?,?,?, ?, ?)`
      ).bind(key, user.id, type, file.name || 'file', file.type || '', file.size || null, new Date().toISOString(), key, String(year || '')).run();
    } catch {}

    return json({ ok: true, file: { id: key, type, filename: file.name || 'file', storedAs: key, length: file.size || null, mime: file.type || '', uploadDate: new Date().toISOString() }});
  }

  return badRequest('Method not allowed');
});
