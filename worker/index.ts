import { RoomDO } from './RoomDO';

export { RoomDO };

export interface Env {
  ROOM_DO: DurableObjectNamespace;
  ASSETS: Fetcher;
}

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers ?? {}) },
  });
}

function generateRoomCode(): string {
  // 6-digit numeric code, leading-zero allowed
  const n = Math.floor(Math.random() * 1_000_000);
  return n.toString().padStart(6, '0');
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    // POST /api/rooms — create a new room. Returns { code }.
    if (url.pathname === '/api/rooms' && req.method === 'POST') {
      let body: { classes?: string[] } = {};
      try {
        body = (await req.json()) as { classes?: string[] };
      } catch {
        // ignore, defaults apply
      }
      const code = generateRoomCode();
      const id = env.ROOM_DO.idFromName(code);
      const stub = env.ROOM_DO.get(id);
      const initRes = await stub.fetch('https://do/init', {
        method: 'POST',
        body: JSON.stringify({ code, classes: body.classes ?? null }),
        headers: { 'content-type': 'application/json' },
      });
      if (!initRes.ok) {
        return jsonResponse({ error: 'INIT_FAILED' }, { status: 500 });
      }
      const initBody = (await initRes.json()) as { teacherToken: string };
      return jsonResponse({ code, teacherToken: initBody.teacherToken });
    }

    // WebSocket: /ws/:code
    const wsMatch = url.pathname.match(/^\/ws\/([0-9]{6})$/);
    if (wsMatch) {
      if (req.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected websocket', { status: 426 });
      }
      const code = wsMatch[1];
      const id = env.ROOM_DO.idFromName(code);
      const stub = env.ROOM_DO.get(id);
      return stub.fetch(req);
    }

    // Static assets fallback (SPA).
    return env.ASSETS.fetch(req);
  },
};
