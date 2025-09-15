// HS256 JWT sign/verify using Web Crypto (Workers runtime)
function b64urlFromString(s) { return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function b64urlFromBuffer(buf) { const bin = String.fromCharCode(...new Uint8Array(buf)); return b64urlFromString(bin); }
function enc(s) { return new TextEncoder().encode(s); }
function b64urlToUint8(b64url) { const pad = '='.repeat((4 - (b64url.length % 4)) % 4); const b64 = (b64url + pad).replace(/-/g, '+').replace(/_/g, '/'); const bin = atob(b64); return new Uint8Array([...bin].map(c => c.charCodeAt(0))); }
async function importKey(secret) { return crypto.subtle.importKey('raw', enc(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign','verify']); }
export async function signJWT(payload, secret, { expiresInSec = 60*60*24*7 } = {}) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now()/1000);
  const body = { iat: now, exp: now + expiresInSec, ...payload };
  const headerB64 = b64urlFromString(JSON.stringify(header));
  const payloadB64 = b64urlFromString(JSON.stringify(body));
  const data = `${headerB64}.${payloadB64}`;
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, enc(data));
  return `${data}.${b64urlFromBuffer(sig)}`;
}
export async function verifyJWT(token, secret) {
  const [h,p,s] = String(token||'').split('.');
  if (!h || !p || !s) throw new Error('Invalid token');
  const data = `${h}.${p}`;
  const key = await importKey(secret);
  const ok = await crypto.subtle.verify('HMAC', key, b64urlToUint8(s), enc(data));
  if (!ok) throw new Error('Bad signature');
  const payload = JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/')));
  if (payload.exp && Math.floor(Date.now()/1000) > Number(payload.exp)) throw new Error('Token expired');
  return payload;
}
