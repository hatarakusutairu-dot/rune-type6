import type { Work1Scores, Work2Scores } from '@shared/protocol';

export interface Question {
  id: number;
  text: string;
  options: { text: string; type: string }[];
}

export interface JudgeResult {
  mainType: string;
  subType: string;
  isBalanced: boolean;
  /** When the top is tied with another type, that other type id (ID-younger goes to mainType). */
  tieWith?: string;
}

const WORK1_TYPES: (keyof Work1Scores)[] = ['competitor', 'achiever', 'socializer', 'explorer'];
const WORK2_TYPES: (keyof Work2Scores)[] = ['attacker', 'guardian', 'analyst', 'booster'];

/** Score the answers by summing the type tag of each chosen option. */
export function scoreAnswers(answers: number[], questions: Question[]): Record<string, number> {
  const scores: Record<string, number> = {};
  for (let i = 0; i < questions.length && i < answers.length; i += 1) {
    const q = questions[i];
    const choice = answers[i];
    if (choice < 0 || choice >= q.options.length) continue;
    const t = q.options[choice].type;
    scores[t] = (scores[t] ?? 0) + 1;
  }
  return scores;
}

/** Judge the main/sub type. Type IDs (the keys of `order`) win ties going to the younger index. */
export function judgeType(scores: Record<string, number>, order: readonly string[]): JudgeResult {
  // Fill missing types with 0 for deterministic comparisons.
  const filled: Record<string, number> = {};
  for (const t of order) filled[t] = scores[t] ?? 0;

  const values = Object.values(filled);
  const max = Math.max(...values);
  const min = Math.min(...values);
  // Balanced: every type sits in the 3-7 range AND the top-bottom gap is at most 4.
  // Matches the threshold used by analyzeScores in lib/scoring.ts so that a
  // student labelled 'balanced' on the server gets a 'balanced' analysis card too.
  const allInRange = values.every((v) => v >= 3 && v <= 7);
  const isBalanced = allInRange && max - min <= 4;

  // Determine the order-younger top.
  let mainType = order[0];
  for (const t of order) {
    if (filled[t] > filled[mainType]) mainType = t;
  }
  const topTies = order.filter((t) => filled[t] === filled[mainType]);
  const tieWith = topTies.length > 1 ? topTies.find((t) => t !== mainType) : undefined;

  // Sub type = the next highest; on tie, order-younger.
  let subType = order.find((t) => t !== mainType) ?? mainType;
  for (const t of order) {
    if (t === mainType) continue;
    if (filled[t] > filled[subType]) subType = t;
  }

  return {
    mainType: isBalanced ? 'balanced' : mainType,
    subType,
    isBalanced,
    tieWith,
  };
}

export const WORK1_ORDER = WORK1_TYPES as readonly string[];
export const WORK2_ORDER = WORK2_TYPES as readonly string[];

/** Deterministic FNV-1a hash → seed for shuffling. */
function hashSeed(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Shuffle a question's options deterministically by sid+qid. Returns indices into the original order. */
export function shuffledIndices(length: number, sid: string, qid: number): number[] {
  const rng = mulberry32(hashSeed(`${sid}:${qid}`));
  const idx = Array.from({ length }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}
