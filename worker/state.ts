import type {
  Phase,
  PublicRoomState,
  StudentInfo,
  Work1Scores,
  Work2Scores,
} from '../shared/protocol';
import { DEFAULT_CLASSES, PHASES, isActivePhase, nextPhase, prevPhase } from '../shared/protocol';

export interface InternalRoomState {
  code: string;
  classes: string[];
  phase: Phase;
  distributionView: 'all' | string;
  students: Map<string, StudentInfo>;
  comments: string[];
  createdAt: number;
  teacherToken: string;
}

export function createInternalRoomState(code: string, classes: string[] | null): InternalRoomState {
  return {
    code,
    classes: classes && classes.length > 0 ? classes : DEFAULT_CLASSES,
    phase: 'lobby',
    distributionView: 'all',
    students: new Map(),
    comments: [],
    createdAt: Date.now(),
    teacherToken: crypto.randomUUID(),
  };
}

export function toPublicState(s: InternalRoomState): PublicRoomState {
  const perClassCount: Record<string, number> = {};
  for (const c of s.classes) perClassCount[c] = 0;
  for (const st of s.students.values()) {
    if (!st.online) continue;
    perClassCount[st.className] = (perClassCount[st.className] ?? 0) + 1;
  }
  let count = 0;
  for (const v of Object.values(perClassCount)) count += v;
  return {
    code: s.code,
    classes: s.classes,
    phase: s.phase,
    distributionView: s.distributionView,
    studentCount: count,
    perClassCount,
    createdAt: s.createdAt,
  };
}

export function advancePhase(s: InternalRoomState): Phase {
  s.phase = nextPhase(s.phase);
  return s.phase;
}

export function rewindPhase(s: InternalRoomState): Phase {
  // Skip back past active phases so late joiners can't mutate already-finalized results.
  let p = prevPhase(s.phase);
  let guard = PHASES.length;
  while (isActivePhase(p) && guard-- > 0) {
    const next = prevPhase(p);
    if (next === p) break;
    p = next;
  }
  s.phase = p;
  return s.phase;
}

export function endActive(s: InternalRoomState): Phase {
  if (s.phase === 'stage1_active') s.phase = 'stage1_results';
  else if (s.phase === 'stage2_active') s.phase = 'stage2_results';
  return s.phase;
}

export function closeRoom(s: InternalRoomState): Phase {
  s.phase = 'closed';
  return s.phase;
}

export function isPhase(p: string): p is Phase {
  return (PHASES as readonly string[]).includes(p);
}

export function computeProgress(s: InternalRoomState, workId: 1 | 2) {
  const perClass: Record<string, { count: number; total: number }> = {};
  for (const c of s.classes) perClass[c] = { count: 0, total: 0 };
  let count = 0;
  let total = 0;
  for (const st of s.students.values()) {
    // Include offline students: someone who answered then closed their tab is still "done".
    const bucket = perClass[st.className] ?? (perClass[st.className] = { count: 0, total: 0 });
    bucket.total += 1;
    total += 1;
    const done = workId === 1 ? !!st.work1Type : !!st.work2Type;
    if (done) {
      bucket.count += 1;
      count += 1;
    }
  }
  return { workId, count, total, perClass };
}

export function computeDistribution(s: InternalRoomState, workId: 1 | 2) {
  const overall: Record<string, number> = {};
  const perClass: Record<string, Record<string, number>> = {};
  for (const c of s.classes) perClass[c] = {};
  for (const st of s.students.values()) {
    const t = workId === 1 ? st.work1Type : st.work2Type;
    if (!t) continue;
    overall[t] = (overall[t] ?? 0) + 1;
    const bucket = perClass[st.className] ?? (perClass[st.className] = {});
    bucket[t] = (bucket[t] ?? 0) + 1;
  }
  return { workId, overall, perClass };
}

export function computeCrossMatrix(s: InternalRoomState) {
  const matrix: Record<string, Record<string, number>> = {};
  let balanced = 0;
  for (const st of s.students.values()) {
    if (!st.work1Type || !st.work2Type) continue;
    if (st.work1Type === 'balanced' || st.work2Type === 'balanced') {
      balanced += 1;
      continue;
    }
    const row = matrix[st.work1Type] ?? (matrix[st.work1Type] = {});
    row[st.work2Type] = (row[st.work2Type] ?? 0) + 1;
  }
  return { matrix, balanced };
}

const STOPWORDS = new Set([
  'の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ', 'ある', 'いる',
  'する', 'これ', 'それ', 'あれ', 'です', 'ます', 'こと', 'よう', '思う', 'なる',
]);

export function computeWordCloud(comments: string[]) {
  const freq = new Map<string, number>();
  for (const c of comments) {
    const words = c
      .replace(/[、。．，,.!?！？\n\r\t]/g, ' ')
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 2 && !STOPWORDS.has(w));
    for (const w of words) {
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  const words = Array.from(freq.entries())
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 80);
  return { words };
}

export function setWorkResult(
  s: InternalRoomState,
  sid: string,
  workId: 1 | 2,
  scores: Work1Scores | Work2Scores,
  mainType: string,
  subType: string,
) {
  const st = s.students.get(sid);
  if (!st) return;
  if (workId === 1) {
    st.work1Scores = scores as Work1Scores;
    st.work1Type = mainType;
    st.work1SubType = subType;
  } else {
    st.work2Scores = scores as Work2Scores;
    st.work2Type = mainType;
    st.work2SubType = subType;
  }
}
