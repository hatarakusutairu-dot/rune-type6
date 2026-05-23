// Shared types between client and Worker. Kept dependency-free.

export const PHASES = [
  'lobby',
  'stage0_title',
  'stage0_rules',
  'stage0_theme',
  'stage0_flow',
  'stage0_work1title',
  'stage0_work1',
  'stage1_active',
  'stage1_results',
  'stage1_explain_1',
  'stage1_explain_2',
  'stage1_explain_3',
  'stage1_explain_4',
  'stage1_bridge',
  'stage2_work2title',
  'stage2_work2',
  'stage2_active',
  'stage2_results',
  'stage2_explain_1',
  'stage2_explain_2',
  'stage2_explain_3',
  'stage2_explain_4',
  'stage3_type',
  'stage3_summary',
  'stage3_share',
  'stage3_comment',
  'stage3_wordcloud',
  'stage3_closing',
  'closed',
] as const;

export type Phase = (typeof PHASES)[number];

export const DEFAULT_CLASSES = ['梅田第1', '梅田第2', '梅田7F', '名古屋', '岡山'];

export type Work1Type = 'competitor' | 'achiever' | 'socializer' | 'explorer';
export type Work2Type = 'attacker' | 'guardian' | 'analyst' | 'booster';
export type TypeId = Work1Type | Work2Type | 'balanced';

export interface Work1Scores {
  competitor: number;
  achiever: number;
  socializer: number;
  explorer: number;
}

export interface Work2Scores {
  attacker: number;
  guardian: number;
  analyst: number;
  booster: number;
}

export interface StudentInfo {
  sid: string;
  className: string;
  joinedAt: number;
  lastSeenAt: number;
  online: boolean;
  work1Scores?: Work1Scores;
  work1Type?: string;
  work1SubType?: string;
  work2Scores?: Work2Scores;
  work2Type?: string;
  work2SubType?: string;
}

export interface PublicRoomState {
  code: string;
  classes: string[];
  phase: Phase;
  distributionView: 'all' | string;
  studentCount: number;
  perClassCount: Record<string, number>;
  createdAt: number;
}

// ----- Messages -----

export type TeacherMessage =
  | { type: 'T_CREATE_ROOM'; payload: { classes?: string[] } }
  | { type: 'T_NEXT_PHASE'; payload: { token: string } }
  | { type: 'T_PREV_PHASE'; payload: { token: string } }
  | { type: 'T_END_ACTIVE'; payload: { token: string } }
  | { type: 'T_CLOSE_ROOM'; payload: { token: string } }
  | { type: 'T_SET_DISTRIBUTION_VIEW'; payload: { token: string; view: 'all' | string } };

export type StudentMessage =
  | { type: 'S_JOIN'; payload: { code: string; className: string; sid?: string } }
  | {
      type: 'S_WORK_RESULT';
      payload: {
        workId: 1 | 2;
        scores: Work1Scores | Work2Scores;
        mainType: string;
        subType: string;
      };
    }
  | { type: 'S_COMMENT'; payload: { text: string } };

export type CommonMessage =
  | { type: 'REACTION'; payload: { emoji: string } }
  | { type: 'PING'; payload: {} }
  | { type: 'HELLO'; payload: {} };

export type ClientMessage = TeacherMessage | StudentMessage | CommonMessage;

export type ServerMessage =
  | { type: 'ROOM_CREATED'; payload: { code: string; teacherToken: string } }
  | {
      type: 'JOINED';
      payload: { sid: string; state: PublicRoomState; self: StudentInfo | null };
    }
  | { type: 'STATE'; payload: { state: PublicRoomState } }
  | { type: 'PHASE_CHANGE'; payload: { phase: Phase } }
  | {
      type: 'PROGRESS';
      payload: {
        workId: 1 | 2;
        count: number;
        total: number;
        perClass: Record<string, { count: number; total: number }>;
      };
    }
  | {
      type: 'WORK_DISTRIBUTION';
      payload: {
        workId: 1 | 2;
        overall: Record<string, number>;
        perClass: Record<string, Record<string, number>>;
      };
    }
  | { type: 'CROSS_MATRIX'; payload: { matrix: Record<string, Record<string, number>>; balanced: number } }
  | { type: 'COMMENT_CLOUD'; payload: { words: { text: string; count: number }[] } }
  | { type: 'STUDENT_COUNT'; payload: { count: number; perClass: Record<string, number> } }
  | { type: 'REACTION_BURST'; payload: { emoji: string } }
  | { type: 'ERROR'; payload: { code: string; message: string } }
  | { type: 'PONG'; payload: {} };

export type AnyMessage = ClientMessage | ServerMessage;

export function nextPhase(p: Phase): Phase {
  const i = PHASES.indexOf(p);
  if (i < 0 || i >= PHASES.length - 1) return p;
  return PHASES[i + 1];
}

export function prevPhase(p: Phase): Phase {
  const i = PHASES.indexOf(p);
  if (i <= 0) return p;
  return PHASES[i - 1];
}

export function isActivePhase(p: Phase): p is 'stage1_active' | 'stage2_active' {
  return p === 'stage1_active' || p === 'stage2_active';
}
