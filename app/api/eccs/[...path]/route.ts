// Server-side proxy: browser -> /api/eccs/* (same origin) -> backend.
// Strips Origin/Referer/Host so the backend CORS filter (localhost origins
// only) accepts the request. The container needs
// --add-host=host.docker.internal:host-gateway so BACKEND_URL can reach the
// Spring process on the host.
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND = (
  process.env.BACKEND_URL || 'http://host.docker.internal:8080'
).replace(/\/$/, '');

const DROP_REQUEST_HEADERS = [
  'host',
  'origin',
  'referer',
  'connection',
  'content-length',
  'accept-encoding',
];

const DROP_RESPONSE_HEADERS = [
  'content-encoding',
  'content-length',
  'transfer-encoding',
  'connection',
];

type RouteContext = {
  params: { path: string[] };
};

async function proxy(req: NextRequest, { params }: RouteContext) {
  const path = params.path.map(encodeURIComponent).join('/');
  const target = `${BACKEND}/api/eccs/${path}${req.nextUrl.search}`;

  const headers = new Headers(req.headers);
  for (const name of DROP_REQUEST_HEADERS) headers.delete(name);

  const hasBody = !['GET', 'HEAD'].includes(req.method);

  try {
    const res = await fetch(target, {
      method: req.method,
      headers,
      body: hasBody ? await req.arrayBuffer() : undefined,
      cache: 'no-store',
      redirect: 'manual',
    });

    const out = new Headers(res.headers);
    for (const name of DROP_RESPONSE_HEADERS) out.delete(name);

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: out,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      { message: `Backend unreachable: ${message}` },
      { status: 502 },
    );
  }
}

export {
  proxy as DELETE,
  proxy as GET,
  proxy as OPTIONS,
  proxy as PATCH,
  proxy as POST,
  proxy as PUT,
};
