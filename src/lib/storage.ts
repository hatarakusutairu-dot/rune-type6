const KEY = 'rune-type6:v2';
const VERSION = '2.0';

export interface PersistedWork {
  answers: number[];
  scores?: Record<string, number>;
  mainType?: string;
  subType?: string;
}

export interface PersistedState {
  version: string;
  sid?: string;
  className?: string;
  roomCode?: string;
  work1?: PersistedWork;
  work2?: PersistedWork;
  comment?: string;
}

const DEFAULT_STATE: PersistedState = { version: VERSION };

function safeRead(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== VERSION) return { ...DEFAULT_STATE };
    return parsed;
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function safeWrite(s: PersistedState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // ignored — private mode etc.
  }
}

export function loadState(): PersistedState {
  return safeRead();
}

export function patchState(patch: Partial<PersistedState>): PersistedState {
  const next = { ...safeRead(), ...patch, version: VERSION };
  safeWrite(next);
  return next;
}

export function patchWork(workId: 1 | 2, patch: Partial<PersistedWork>): PersistedState {
  const cur = safeRead();
  const key = workId === 1 ? 'work1' : 'work2';
  const next: PersistedState = {
    ...cur,
    version: VERSION,
    [key]: { ...(cur[key] ?? { answers: [] }), ...patch },
  };
  safeWrite(next);
  return next;
}

export function clearState() {
  safeWrite({ ...DEFAULT_STATE });
}

/**
 * Discard any work / comment data when the student joins a different room than
 * the one stored locally. Keeps `sid` so the server still recognises the device.
 */
export function ensureRoom(nextCode: string): PersistedState {
  const cur = safeRead();
  if (cur.roomCode && cur.roomCode !== nextCode) {
    const next: PersistedState = {
      version: VERSION,
      sid: cur.sid,
      roomCode: nextCode,
    };
    safeWrite(next);
    return next;
  }
  // Same room or no previous room — just record the code and keep existing work.
  const next = { ...cur, roomCode: nextCode, version: VERSION };
  safeWrite(next);
  return next;
}
