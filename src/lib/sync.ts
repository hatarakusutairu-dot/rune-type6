import type { ClientMessage, ServerMessage } from '@shared/protocol';

export interface SyncOptions {
  code: string;
  onMessage: (msg: ServerMessage) => void;
  onStatus: (status: 'connecting' | 'open' | 'closed' | 'error') => void;
}

export interface SyncHandle {
  send: (msg: ClientMessage) => void;
  close: () => void;
}

export function connect({ code, onMessage, onStatus }: SyncOptions): SyncHandle {
  let ws: WebSocket | null = null;
  let closed = false;
  let attempt = 0;
  let pingTimer: ReturnType<typeof setInterval> | null = null;

  const url = (() => {
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${location.host}/ws/${code}`;
  })();

  function clearPing() {
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
  }

  function open() {
    if (closed) return;
    onStatus('connecting');
    ws = new WebSocket(url);
    ws.addEventListener('open', () => {
      attempt = 0;
      onStatus('open');
      // Greet immediately so the server pushes the current room STATE to us.
      try {
        ws?.send(JSON.stringify({ type: 'HELLO', payload: {} }));
      } catch {
        // ignored
      }
      clearPing();
      pingTimer = setInterval(() => {
        try {
          ws?.send(JSON.stringify({ type: 'PING', payload: {} }));
        } catch {
          // ignored
        }
      }, 25_000);
    });
    ws.addEventListener('message', (ev) => {
      try {
        const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : '') as ServerMessage;
        onMessage(msg);
      } catch {
        // ignored
      }
    });
    ws.addEventListener('close', () => {
      clearPing();
      if (closed) return;
      onStatus('closed');
      const delay = Math.min(15_000, 500 * 2 ** Math.min(attempt, 5));
      attempt += 1;
      setTimeout(open, delay);
    });
    ws.addEventListener('error', () => {
      onStatus('error');
    });
  }

  open();

  return {
    send(msg) {
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      try {
        ws.send(JSON.stringify(msg));
      } catch {
        // ignored
      }
    },
    close() {
      closed = true;
      clearPing();
      ws?.close();
    },
  };
}

export async function createRoom(classes?: string[]): Promise<{ code: string; teacherToken: string }> {
  const res = await fetch('/api/rooms', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ classes }),
  });
  if (!res.ok) throw new Error('CREATE_ROOM_FAILED');
  return (await res.json()) as { code: string; teacherToken: string };
}
