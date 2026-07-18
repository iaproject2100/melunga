const ALLOWED_ORIGINS = new Set([
  'https://melunga.com',
  'https://www.melunga.com',
  'https://localhost',
  'http://localhost',
  'capacitor://localhost'
]);

export function corsHeaders(req) {
  const origin = req.headers.get('origin') || '';
  const headers = {
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };

  if (ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

export function preflight(req) {
  if (req.method !== 'OPTIONS') return null;
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req)
  });
}

export function jsonResponse(req, body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...extraHeaders
    }
  });
}
