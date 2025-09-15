import { verifyJWT, signJWT } from './jwt.js';
import { json, unauthorized } from './response.js';
function parseCookies(header){ const out={}; (header||'').split(';').forEach(p=>{ const i=p.indexOf('='); if(i>-1) out[p.slice(0,i).trim()]=decodeURIComponent(p.slice(i+1).trim()); }); return out; }
export async function getUser(context){
  const { request, env } = context; const cookieName = env.COOKIE_NAME || 'token';
  const auth = request.headers.get('Authorization') || ''; let token = '';
  const m = auth.match(/^Bearer\s+(.+)$/i); if (m) token = m[1];
  if (!token) { const cookies = parseCookies(request.headers.get('Cookie')); token = cookies[cookieName] || ''; }
  if (!token) return null;
  try { const payload = await verifyJWT(token, env.JWT_SECRET); if(!payload?.sub) return null;
    return { id:String(payload.sub), email:payload.email, role:payload.role||'user', firstName:payload.firstName, lastName:payload.lastName, token };
  } catch { return null; }
}
export function requireUser(handler){ return async (context)=>{ const user = await getUser(context); if(!user) return unauthorized(); context.user = user; return handler(context); }; }
export async function issueSession(context, dbUser){
  const { env } = context;
  const jwt = await signJWT({ sub: dbUser.id, email: dbUser.email, role: dbUser.role||'user', firstName: dbUser.first_name||dbUser.firstName, lastName: dbUser.last_name||dbUser.lastName }, env.JWT_SECRET, { expiresInSec: 60*60*24*7 });
  const cname = env.COOKIE_NAME || 'token';
  const cookie = [`${cname}=${jwt}`,'Path=/','HttpOnly','Secure','SameSite=Lax',`Max-Age=${60*60*24*7}`].join('; ');
  return { jwt, cookie };
}
