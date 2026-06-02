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

function isValidWork(w: unknown): w is PersistedWork {
  if (!w || typeof w !== 'object') return false;
  const obj = w as Record<string, unknown>;
  if (!Array.isArray(obj.answers)) return false;
  if (obj.scores !== undefined && (obj.scores === null || typeof obj.scores !== 'object')) {
    return false;
  }
  if (obj.mainType !== undefined && typeof obj.mainType !== 'string') return false;
  if (obj.subType !== undefined && typeof obj.subType !== 'string') return false;
  return true;
}

function sanitize(s: PersistedState): PersistedState {
  // Defensive: localStorage may have been touched by an older app version,
  // a misbehaving extension, or the user via DevTools. Drop any work1/work2
  // blob whose shape would make Quiz/ResultCard misread it (the type of
  // 'scores' is the realistic damage vector — a null/string slips past the
  // truthiness guards and crashes RadarChart / analyzeScores).
  const next: PersistedState = { ...s, version: VERSION };
  if (next.work1 !== undefined && !isValidWork(next.work1)) delete next.work1;
  if (next.work2 !== undefined && !isValidWork(next.work2)) delete next.work2;
  if (next.sid !== undefined && typeof next.sid !== 'string') delete next.sid;
  if (next.roomCode !== undefined && typeof next.roomCode !== 'string') delete next.roomCode;
  if (next.className !== undefined && typeof next.className !== 'string') delete next.className;
  if (next.comment !== undefined && typeof next.comment !== 'string') delete next.comment;
  return next;
}

function safeRead(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== VERSION) return { ...DEFAULT_STATE };
    return sanitize(parsed);
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
 * Clear the student's room-binding state (sid / roomCode / className /
 * work data) so the next page load shows the join form instead of
 * auto-rejoining a finished session. Called when the room enters phase
 * 'closed'.
 */
export function clearRoomBinding() {
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
