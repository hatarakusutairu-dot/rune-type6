import type { ClientMessage, ServerMessage } from '@shared/protocol';

export interface SyncOptions {
  code: string;
  onMessage: (msg: ServerMessage) => void;
  onStatus: (status: 'connecting' | 'open' | 'closed' | 'error') => void;
  /** Fired after HELLO on every (re)open, so callers can re-issue S_JOIN / T_CREATE_ROOM. */
  onOpen?: () => void;
}

export interface SyncHandle {
  send: (msg: ClientMessage) => void;
  close: () => void;
  /** Force-tear-down + immediate reconnect (used by visibility/online handlers). */
  forceReconnect: () => void;
}

const PING_INTERVAL_MS = 20_000;
const HEARTBEAT_TIMEOUT_MS = 30_000;

export function connect({ code, onMessage, onStatus, onOpen }: SyncOptions): SyncHandle {
  let ws: WebSocket | null = null;
  let closed = false;
  let attempt = 0;
  let pingTimer: ReturnType<typeof setInterval> | null = null;
  let heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
  let lastMessageAt = Date.now();
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const url = (() => {
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${location.host}/ws/${code}`;
  })();

  function clearTimers() {
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
    if (heartbeatTimer) {
      clearTimeout(heartbeatTimer);
      heartbeatTimer = null;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  function armHeartbeat() {
    if (heartbeatTimer) clearTimeout(heartbeatTimer);
    heartbeatTimer = setTimeout(() => {
      // No traffic at all from the server for HEARTBEAT_TIMEOUT_MS — assume the
      // WebSocket is silently dead (common on iOS / Edge after background) and
      // force a reconnect rather than waiting for the OS to surface a close
      // event that may never come.
      if (closed) return;
      const stale = Date.now() - lastMessageAt;
      if (stale >= HEARTBEAT_TIMEOUT_MS) {
        try {
          ws?.close();
        } catch {
          // ignored
        }
        scheduleReconnect(0);
      } else {
        armHeartbeat();
      }
    }, HEARTBEAT_TIMEOUT_MS);
  }

  function scheduleReconnect(delay: number) {
    if (closed) return;
    if (reconnectTimer) return;
    onStatus('closed');
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      open();
    }, delay);
  }

  function open() {
    if (closed) return;
    clearTimers();
    onStatus('connecting');
    lastMessageAt = Date.now();
    try {
      ws = new WebSocket(url);
    } catch {
      const delay = Math.min(15_000, 500 * 2 ** Math.min(attempt, 5));
      attempt += 1;
      scheduleReconnect(delay);
      return;
    }
    ws.addEventListener('open', () => {
      attempt = 0;
      lastMessageAt = Date.now();
      onStatus('open');
      // Greet immediately so the server pushes the current room STATE to us.
      try {
        ws?.send(JSON.stringify({ type: 'HELLO', payload: {} }));
      } catch {
        // ignored
      }
      try {
        onOpen?.();
      } catch {
        // ignored
      }
      pingTimer = setInterval(() => {
        try {
          ws?.send(JSON.stringify({ type: 'PING', payload: {} }));
        } catch {
          // ignored
        }
      }, PING_INTERVAL_MS);
      armHeartbeat();
    });
    ws.addEventListener('message', (ev) => {
      lastMessageAt = Date.now();
      armHeartbeat();
      try {
        const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : '') as ServerMessage;
        onMessage(msg);
      } catch {
        // ignored
      }
    });
    ws.addEventListener('close', () => {
      clearTimers();
      if (closed) return;
      const delay = Math.min(15_000, 500 * 2 ** Math.min(attempt, 5));
      attempt += 1;
      scheduleReconnect(delay);
    });
    ws.addEventListener('error', () => {
      onStatus('error');
    });
  }

  function forceReconnect() {
    if (closed) return;
    // Kick the socket regardless of its declared readyState — on iOS/Edge a
    // background tab can leave us with a socket that *says* OPEN but no longer
    // delivers messages.
    try {
      ws?.close();
    } catch {
      // ignored
    }
    clearTimers();
    attempt = 0;
    scheduleReconnect(0);
  }

  // Visibility / connectivity recovery: if we come back from background or
  // the network reconnects, immediately verify the socket. On mobile this is
  // the most common cause of "the screen looks fine but nothing works".
  const onVisibility = () => {
    if (document.visibilityState === 'visible') {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        forceReconnect();
      } else {
        // Probe with a PING; armHeartbeat will fire if we get no traffic.
        try {
          ws.send(JSON.stringify({ type: 'PING', payload: {} }));
        } catch {
          forceReconnect();
        }
        armHeartbeat();
      }
    }
  };
  const onOnline = () => {
    forceReconnect();
  };
  const onPageShow = (e: PageTransitionEvent) => {
    // bfcache restore on iOS/Edge sometimes resumes the page with a dead socket.
    if (e.persisted) forceReconnect();
  };
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('online', onOnline);
  window.addEventListener('pageshow', onPageShow);

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
      clearTimers();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('pageshow', onPageShow);
      ws?.close();
    },
    forceReconnect,
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
