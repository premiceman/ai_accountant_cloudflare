export const onRequest = async (context) => {
  const res = await context.next();
  const h = new Headers(res.headers);
  h.set('X-Frame-Options', 'DENY');
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
};
