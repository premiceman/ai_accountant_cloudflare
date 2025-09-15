// PBKDF2 password hashing/verification (no Node deps)
const ITER = 100_000; const KEYLEN = 32;
function enc(s){ return new TextEncoder().encode(s); }
function b64(buf){ return btoa(String.fromCharCode(...new Uint8Array(buf))); }
function hexFromBytes(buf){ return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2,'0')).join(''); }
function bytesFromHex(hex){ return new Uint8Array(hex.match(/.{1,2}/g).map(h => parseInt(h,16))); }
async function derive(password, saltBytes, iter=ITER){ const key=await crypto.subtle.importKey('raw', enc(password), {name:'PBKDF2'}, false, ['deriveBits']); const bits=await crypto.subtle.deriveBits({ name:'PBKDF2', hash:'SHA-256', salt: saltBytes, iterations: iter }, key, KEYLEN*8); return new Uint8Array(bits); }
export async function hashPassword(password, iter=ITER){ const salt=crypto.getRandomValues(new Uint8Array(16)); const out=await derive(password, salt, iter); return `pbkdf2$${iter}$${hexFromBytes(salt)}$${b64(out)}`; }
export async function verifyPassword(password, stored){ const [scheme,iterStr,saltHex,hashB64]=String(stored).split('$'); if(scheme!=='pbkdf2') return false; const iter=Number(iterStr||ITER); const salt=bytesFromHex(saltHex); const out=await derive(password,salt,iter); return b64(out)===hashB64; }
