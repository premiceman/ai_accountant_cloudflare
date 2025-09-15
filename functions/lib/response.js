export function json(obj, init = {}) { const h = new Headers(init.headers || {}); if (!h.has('content-type')) h.set('content-type', 'application/json'); return new Response(JSON.stringify(obj), { ...init, headers: h }); }
export function unauthorized(){ return json({ error: 'Unauthorized' }, { status: 401 }); }
export function badRequest(msg){ return json({ error: msg || 'Bad Request' }, { status: 400 }); }
export function notFound(msg){ return json({ error: msg || 'Not Found' }, { status: 404 }); }
