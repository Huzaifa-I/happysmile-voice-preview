// Mints a short-lived, single-use token for the Gemini Live API. The real key never leaves the server.
export default async () => {
  const key = process.env.MOLI_GEMINI_KEY;
  const h = { 'content-type': 'application/json', 'cache-control': 'no-store' };
  if (!key) return new Response(JSON.stringify({ error: 'not_configured' }), { status: 503, headers: h });
  const now = Date.now();
  const body = {
    uses: 1,
    expireTime: new Date(now + 10 * 60 * 1000).toISOString(),
    newSessionExpireTime: new Date(now + 60 * 1000).toISOString(),
  };
  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/auth_tokens', {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (!r.ok || !j.name) return new Response(JSON.stringify({ error: 'upstream', status: r.status }), { status: 502, headers: h });
    return new Response(JSON.stringify({ token: j.name }), { status: 200, headers: h });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'network' }), { status: 502, headers: h });
  }
};
export const config = { path: '/api/token' };
