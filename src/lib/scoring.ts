// src/lib/scoring.ts
// TYPE SCANNER スコアリング＋分析エンジン

import type {
  Work1Scores, Work2Scores, Work1Type, Work2Type,
  ScorePattern, ScoreAnalysis, AnalysisResult, TotalAnalysisResult
} from '../types/analysis';

import {
  WORK1_MAIN_TEXTS, WORK1_SUB_INFLUENCE, WORK1_PATTERN_TEXTS,
  WORK1_CONFLICT_TEXTS, WORK1_WEAK_TEXTS,
  WORK1_MOTIVATORS_MAIN, WORK1_MOTIVATORS_SUB, WORK1_MOTIVATORS_PATTERN,
  WORK1_DEMOTIVATORS_MAIN, WORK1_DEMOTIVATORS_SUB, WORK1_DEMOTIVATORS_PATTERN,
  WORK1_GOOD_SIGNS_MAIN, WORK1_GOOD_SIGNS_SUB,
  WORK1_BAD_SIGNS_MAIN, WORK1_BAD_SIGNS_SUB,
  WORK1_HELPFUL_ACTIONS, WORK1_GROWTH_TIPS,
  WORK1_CATCHCOPIES
} from '../data/work1Analysis';

import {
  WORK2_MAIN_TEXTS, WORK2_SUB_INFLUENCE, WORK2_PATTERN_TEXTS,
  WORK2_CONFLICT_TEXTS, WORK2_WEAK_TEXTS,
  WORK2_MOTIVATORS_MAIN, WORK2_MOTIVATORS_SUB, WORK2_MOTIVATORS_PATTERN,
  WORK2_DEMOTIVATORS_MAIN, WORK2_DEMOTIVATORS_SUB, WORK2_DEMOTIVATORS_PATTERN,
  WORK2_GOOD_SIGNS_MAIN, WORK2_GOOD_SIGNS_SUB,
  WORK2_BAD_SIGNS_MAIN, WORK2_BAD_SIGNS_SUB,
  WORK2_HELPFUL_ACTIONS, WORK2_GROWTH_TIPS,
  WORK2_CATCHCOPIES
} from '../data/work2Analysis';

import { TOTAL_ANALYSIS } from '../data/totalAnalysis';

// ===== スコア計算 =====

export function calculateWork1Scores(answers: number[], questions: any[]): Work1Scores {
  const scores: Work1Scores = { competitor: 0, achiever: 0, socializer: 0, explorer: 0 };
  answers.forEach((answerIndex, qIndex) => {
    const type = questions[qIndex].options[answerIndex].type as Work1Type;
    scores[type]++;
  });
  return scores;
}

export function calculateWork2Scores(answers: number[], questions: any[]): Work2Scores {
  const scores: Work2Scores = { attacker: 0, guardian: 0, analyst: 0, booster: 0 };
  answers.forEach((answerIndex, qIndex) => {
    const type = questions[qIndex].options[answerIndex].type as Work2Type;
    scores[type]++;
  });
  return scores;
}

// ===== スコア分析 =====

const W1_KEYS: readonly string[] = ['competitor', 'achiever', 'socializer', 'explorer'];
const W2_KEYS: readonly string[] = ['attacker', 'guardian', 'analyst', 'booster'];

/**
 * Pad missing types with 0 so `sorted` always has the expected 4 entries.
 * Without this, a student whose 20 answers concentrate on 1-3 types causes
 * `sorted[1][0]` / `sorted[2][0]` / `sorted[3][0]` to throw TypeError, which
 * crashes ResultCard at the quiz-end / analysis-screen transition.
 */
function padScores(scores: Record<string, number>): Record<string, number> {
  const family = Object.keys(scores).some((k) => W1_KEYS.includes(k)) ? W1_KEYS : W2_KEYS;
  const padded: Record<string, number> = {};
  for (const k of family) padded[k] = scores[k] ?? 0;
  // Preserve any unexpected keys (defensive — shouldn't normally happen).
  for (const k of Object.keys(scores)) {
    if (!(k in padded)) padded[k] = scores[k];
  }
  return padded;
}

export function analyzeScores(scores: Record<string, number>): ScoreAnalysis {
  const sorted = Object.entries(padScores(scores)).sort((a, b) => b[1] - a[1]);

  const mainType = sorted[0]?.[0] ?? 'competitor';
  const mainScore = sorted[0]?.[1] ?? 0;
  const subType = sorted[1]?.[0] ?? mainType;
  const subScore = sorted[1]?.[1] ?? 0;
  const thirdType = sorted[2]?.[0] ?? subType;
  const thirdScore = sorted[2]?.[1] ?? 0;
  const weakType = sorted[3]?.[0] ?? thirdType;
  const weakScore = sorted[3]?.[1] ?? 0;
  const gapSize = mainScore - weakScore;

  // パターン判定
  let pattern: ScorePattern;
  const allInRange = sorted.every(([_, s]) => s >= 3 && s <= 7);
  const maxMinDiff = mainScore - weakScore;

  if (allInRange && maxMinDiff <= 4) {
    pattern = 'balanced';
  } else if (mainScore >= 12) {
    pattern = 'extreme';
  } else if (mainScore - subScore >= 3) {
    pattern = 'dominant';
  } else if (mainScore - thirdScore <= 2) {
    pattern = 'triple';
  } else {
    pattern = 'double';
  }

  // 対立検出
  const conflictPairs: [string, string][] = [
    ['competitor', 'socializer'],
    ['achiever', 'explorer'],
    ['attacker', 'guardian'],
    ['analyst', 'booster'],
  ];

  let hasConflict = false;
  let conflictPair: [string, string] | undefined;

  for (const [a, b] of conflictPairs) {
    if (scores[a] !== undefined && scores[b] !== undefined) {
      if (scores[a] >= 6 && scores[b] >= 6) {
        hasConflict = true;
        conflictPair = [a, b];
        break;
      }
    }
  }

  return {
    mainType, mainScore, subType, subScore,
    thirdType, thirdScore, weakType, weakScore,
    pattern, hasConflict, conflictPair, gapSize
  };
}

// ===== 強度レベル判定 =====

function getIntensity(score: number): 'high' | 'mid' | 'low' {
  if (score >= 12) return 'high';
  if (score >= 8) return 'mid';
  return 'low';
}

function getGapLevel(gap: number): 'large' | 'medium' | 'small' {
  if (gap >= 10) return 'large';
  if (gap >= 6) return 'medium';
  return 'small';
}

// ===== ワーク1 分析テキスト生成 =====

export function generateWork1Analysis(scores: Work1Scores): AnalysisResult {
  const analysis = analyzeScores(scores);

  // キャッチコピー
  const catchcopy = analysis.pattern === 'balanced'
    ? WORK1_CATCHCOPIES['balanced']
    : WORK1_CATCHCOPIES[analysis.mainType]?.[analysis.subType]?.[analysis.pattern]
      || WORK1_CATCHCOPIES[analysis.mainType]?.[analysis.subType]?.['dominant']
      || 'ゲーマー';

  // サマリー
  const intensity = getIntensity(analysis.mainScore);
  const mainText = WORK1_MAIN_TEXTS[analysis.mainType]?.[intensity] || '';
  const subText = WORK1_SUB_INFLUENCE[analysis.mainType]?.[analysis.subType] || '';
  const patternText = WORK1_PATTERN_TEXTS[analysis.pattern] || '';
  const summary = `${mainText}${subText}`;

  // 詳細分析
  let detail = patternText;
  if (analysis.hasConflict && analysis.conflictPair) {
    const conflictKey = analysis.conflictPair.sort().join('_');
    const conflictText = WORK1_CONFLICT_TEXTS[conflictKey];
    if (conflictText) detail += conflictText;
  }
  const weakText = WORK1_WEAK_TEXTS[analysis.weakType] || '';
  detail += weakText;

  // 燃える言葉（メイン3 + サブ1 + パターン1 = 5）
  const motivators = [
    ...WORK1_MOTIVATORS_MAIN[analysis.mainType],
    WORK1_MOTIVATORS_SUB[analysis.mainType]?.[analysis.subType] || '',
    WORK1_MOTIVATORS_PATTERN[analysis.pattern] || '',
  ].filter(Boolean);

  // 萎える言葉
  const demotivators = [
    ...WORK1_DEMOTIVATORS_MAIN[analysis.mainType],
    WORK1_DEMOTIVATORS_SUB[analysis.mainType]?.[analysis.subType] || '',
    WORK1_DEMOTIVATORS_PATTERN[analysis.pattern] || '',
  ].filter(Boolean);

  // 好調サイン（メイン2 + サブ1 = 3）
  const goodSigns = [
    ...WORK1_GOOD_SIGNS_MAIN[analysis.mainType],
    WORK1_GOOD_SIGNS_SUB[analysis.mainType]?.[analysis.subType] || '',
  ].filter(Boolean);

  // 不調サイン
  const badSigns = [
    ...WORK1_BAD_SIGNS_MAIN[analysis.mainType],
    WORK1_BAD_SIGNS_SUB[analysis.mainType]?.[analysis.subType] || '',
  ].filter(Boolean);

  // フォロー方法
  const helpfulActions = WORK1_HELPFUL_ACTIONS[analysis.mainType]?.[analysis.subType] || '';

  // 伸びしろ
  const gapLevel = getGapLevel(analysis.gapSize);
  const growthTip = WORK1_GROWTH_TIPS[analysis.weakType]?.[gapLevel] || '';

  return {
    catchcopy, summary, detail,
    motivators, demotivators,
    goodSigns, badSigns,
    helpfulActions, growthTip
  };
}

// ===== ワーク2 分析テキスト生成 =====

export function generateWork2Analysis(scores: Work2Scores): AnalysisResult {
  const analysis = analyzeScores(scores);

  const catchcopy = analysis.pattern === 'balanced'
    ? WORK2_CATCHCOPIES['balanced']
    : WORK2_CATCHCOPIES[analysis.mainType]?.[analysis.subType]?.[analysis.pattern]
      || WORK2_CATCHCOPIES[analysis.mainType]?.[analysis.subType]?.['dominant']
      || 'ピンチの対応者';

  const intensity = getIntensity(analysis.mainScore);
  const mainText = WORK2_MAIN_TEXTS[analysis.mainType]?.[intensity] || '';
  const subText = WORK2_SUB_INFLUENCE[analysis.mainType]?.[analysis.subType] || '';
  const patternText = WORK2_PATTERN_TEXTS[analysis.pattern] || '';
  const summary = `${mainText}${subText}`;

  let detail = patternText;
  if (analysis.hasConflict && analysis.conflictPair) {
    const conflictKey = analysis.conflictPair.sort().join('_');
    const conflictText = WORK2_CONFLICT_TEXTS[conflictKey];
    if (conflictText) detail += conflictText;
  }
  const weakText = WORK2_WEAK_TEXTS[analysis.weakType] || '';
  detail += weakText;

  const motivators = [
    ...WORK2_MOTIVATORS_MAIN[analysis.mainType],
    WORK2_MOTIVATORS_SUB[analysis.mainType]?.[analysis.subType] || '',
    WORK2_MOTIVATORS_PATTERN[analysis.pattern] || '',
  ].filter(Boolean);

  const demotivators = [
    ...WORK2_DEMOTIVATORS_MAIN[analysis.mainType],
    WORK2_DEMOTIVATORS_SUB[analysis.mainType]?.[analysis.subType] || '',
    WORK2_DEMOTIVATORS_PATTERN[analysis.pattern] || '',
  ].filter(Boolean);

  const goodSigns = [
    ...WORK2_GOOD_SIGNS_MAIN[analysis.mainType],
    WORK2_GOOD_SIGNS_SUB[analysis.mainType]?.[analysis.subType] || '',
  ].filter(Boolean);

  const badSigns = [
    ...WORK2_BAD_SIGNS_MAIN[analysis.mainType],
    WORK2_BAD_SIGNS_SUB[analysis.mainType]?.[analysis.subType] || '',
  ].filter(Boolean);

  const helpfulActions = WORK2_HELPFUL_ACTIONS[analysis.mainType]?.[analysis.subType] || '';
  const gapLevel = getGapLevel(analysis.gapSize);
  const growthTip = WORK2_GROWTH_TIPS[analysis.weakType]?.[gapLevel] || '';

  return {
    catchcopy, summary, detail,
    motivators, demotivators,
    goodSigns, badSigns,
    helpfulActions, growthTip
  };
}

// ===== 総合分析テキスト生成 =====

export function generateTotalAnalysis(
  work1Scores: Work1Scores,
  work2Scores: Work2Scores
): TotalAnalysisResult {
  const w1 = analyzeScores(work1Scores);
  const w2 = analyzeScores(work2Scores);

  // メインタイプの掛け合わせキーで基本テンプレートを取得
  const comboKey = `${w1.mainType}_${w2.mainType}`;
  const base = TOTAL_ANALYSIS[comboKey] || TOTAL_ANALYSIS['balanced_balanced'];

  // サブタイプ情報で補足を動的追加
  const w1SubNote = w1.pattern === 'double'
    ? `ゲーマータイプでは${getTypeName(w1.mainType)}と${getTypeName(w1.subType)}の傾向が拮抗しており、場面によってどちらの顔も出る。`
    : w1.pattern === 'extreme'
    ? `ゲーマータイプでは${getTypeName(w1.mainType)}の傾向が圧倒的に強く、ゲームへの向き合い方が明確に定まっている。`
    : `ゲーマータイプでは${getTypeName(w1.mainType)}をベースに${getTypeName(w1.subType)}の要素も持ち合わせている。`;

  const w2SubNote = w2.pattern === 'double'
    ? `ピンチの時は${getTypeName(w2.mainType)}と${getTypeName(w2.subType)}の対応が半々で、状況に応じて切り替わる。`
    : w2.pattern === 'extreme'
    ? `ピンチの時は${getTypeName(w2.mainType)}の反応が非常に強く出る。`
    : `ピンチの時は${getTypeName(w2.mainType)}の動きをベースに、${getTypeName(w2.subType)}の要素も出る。`;

  // サマリーにサブタイプ情報を追加
  const summary = `${base.summary}\n\n${w1SubNote}${w2SubNote}`;

  // 詳細分析にスコア配分の解釈を追加
  const w1Detail = generateScoreInterpretation(work1Scores, 'work1');
  const w2Detail = generateScoreInterpretation(work2Scores, 'work2');
  const detail = `${base.detail}\n\n【ゲーマータイプの内訳】\n${w1Detail}\n\n【危機対応タイプの内訳】\n${w2Detail}`;

  // 燃える言葉: 基本テンプレート3つ + ワーク1メイン1つ + ワーク2メイン1つ = 5つ
  const motivators = [
    ...base.motivators,
    WORK1_MOTIVATORS_MAIN[w1.mainType]?.[0] || '',
    WORK2_MOTIVATORS_MAIN[w2.mainType]?.[0] || '',
  ].filter(Boolean).slice(0, 5);

  const demotivators = [
    ...base.demotivators,
    WORK1_DEMOTIVATORS_MAIN[w1.mainType]?.[0] || '',
    WORK2_DEMOTIVATORS_MAIN[w2.mainType]?.[0] || '',
  ].filter(Boolean).slice(0, 5);

  // 好調/不調サイン: ワーク1メイン1つ + ワーク2メイン1つ + 掛け合わせ1つ = 3つ
  const goodSigns = [
    WORK1_GOOD_SIGNS_MAIN[w1.mainType]?.[0] || '',
    WORK2_GOOD_SIGNS_MAIN[w2.mainType]?.[0] || '',
    base.goodSigns[0] || '',
  ].filter(Boolean);

  const badSigns = [
    WORK1_BAD_SIGNS_MAIN[w1.mainType]?.[0] || '',
    WORK2_BAD_SIGNS_MAIN[w2.mainType]?.[0] || '',
    base.badSigns[0] || '',
  ].filter(Boolean);

  // 伸びしろ: 両ワークの最低スコアタイプを組み合わせ
  const growthTip = `${WORK1_GROWTH_TIPS[w1.weakType]?.[getGapLevel(w1.gapSize)] || ''} また、${WORK2_GROWTH_TIPS[w2.weakType]?.[getGapLevel(w2.gapSize)] || ''}`;

  return {
    catchcopy: base.catchcopy,
    summary,
    detail,
    motivators,
    demotivators,
    goodSigns,
    badSigns,
    helpfulActions: base.helpfulActions,
    teamRole: base.teamRole,
    growthTip,
  };
}

// ===== ヘルパー =====

function getTypeName(type: string): string {
  const names: Record<string, string> = {
    competitor: 'コンペティター',
    achiever: 'アチーバー',
    socializer: 'ソーシャライザー',
    explorer: 'エクスプローラー',
    attacker: 'アタッカー',
    guardian: 'ガーディアン',
    analyst: 'アナリスト',
    booster: 'ブースター',
  };
  return names[type] || type;
}

function generateScoreInterpretation(scores: Record<string, number>, _workId: 'work1' | 'work2'): string {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const lines = sorted.map(([type, score]) => {
    const name = getTypeName(type);
    const pct = Math.round((score / 20) * 100);
    let comment = '';
    if (score >= 12) comment = '（非常に強い傾向）';
    else if (score >= 8) comment = '（強い傾向）';
    else if (score >= 5) comment = '（ある程度の傾向）';
    else if (score >= 2) comment = '（控えめな傾向）';
    else comment = '（ほとんどない）';
    return `${name}：${score}/20（${pct}%）${comment}`;
  });
  return lines.join('\n');
}
