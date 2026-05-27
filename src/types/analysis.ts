// src/types/analysis.ts
// TYPE SCANNER 分析エンジンの型定義

// ===== スコア関連 =====

export interface Work1Scores {
  competitor: number;
  achiever: number;
  socializer: number;
  explorer: number;
  [key: string]: number;
}

export interface Work2Scores {
  attacker: number;
  guardian: number;
  analyst: number;
  booster: number;
  [key: string]: number;
}

export type Work1Type = 'competitor' | 'achiever' | 'socializer' | 'explorer';
export type Work2Type = 'attacker' | 'guardian' | 'analyst' | 'booster';
export type ScorePattern = 'extreme' | 'dominant' | 'double' | 'triple' | 'balanced';

// ===== スコア分析結果 =====

export interface ScoreAnalysis {
  mainType: string;
  mainScore: number;
  subType: string;
  subScore: number;
  thirdType: string;
  thirdScore: number;
  weakType: string;
  weakScore: number;
  pattern: ScorePattern;
  hasConflict: boolean;
  conflictPair?: [string, string];
  gapSize: number; // 1位と最下位の差
}

// ===== 分析結果テキスト =====

export interface AnalysisResult {
  catchcopy: string;
  summary: string;       // 全体像（3〜4文）
  detail: string;        // 詳細分析（4〜6文）
  motivators: string[];  // 燃える言葉・シチュエーション（5つ）
  demotivators: string[]; // 萎える言葉・シチュエーション（5つ）
  goodSigns: string[];   // 調子いいサイン（3つ）
  badSigns: string[];    // 調子悪いサイン（3つ）
  helpfulActions: string; // フォロー方法
  growthTip: string;     // 伸びしろ
}

export interface TotalAnalysisResult {
  catchcopy: string;
  summary: string;       // 全体像（4〜6文）
  detail: string;        // 詳細分析（5〜8文）
  motivators: string[];
  demotivators: string[];
  goodSigns: string[];
  badSigns: string[];
  helpfulActions: string;
  teamRole: string;      // チームでの活かし方
  growthTip: string;
}

// ===== 設問 =====

export interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    type: string;
  }[];
}

// ===== タイプ解説スライド用 =====

export interface TypeSlideInfo {
  id: string;
  name: string;
  nameEn: string;
  catchcopy: string;
  color: string;
  description: string;
  motivators: string[];
  demotivators: string[];
  goodSigns: string[];
  badSigns: string[];
  helpfulActions: string;
  teamValue: string;
  overdone: string;
  innerVoice?: string; // ワーク2のみ
}
