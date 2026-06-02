import RadarChart from './RadarChart';
import { WORK1_ORDER, WORK2_ORDER } from '../lib/scoreUtils';
import { generateWork1Analysis, generateWork2Analysis } from '../lib/scoring';
import type { Work1Scores, Work2Scores } from '../types/analysis';

interface Props {
  workId: 1 | 2;
  scores: Record<string, number>;
  mainType: string;
  subType: string;
  tieWith?: string;
}

const LABELS_W1: Record<string, string> = {
  competitor: 'コンペティター',
  achiever: 'アチーバー',
  socializer: 'ソーシャライザー',
  explorer: 'エクスプローラー',
};
const LABELS_W2: Record<string, string> = {
  attacker: 'アタッカー',
  guardian: 'ガーディアン',
  analyst: 'アナリスト',
  booster: 'ブースター',
};
const COLORS: Record<string, string> = {
  competitor: '#FF4444',
  achiever: '#FFD700',
  socializer: '#00E676',
  explorer: '#448AFF',
  attacker: '#FF6D00',
  guardian: '#00BCD4',
  analyst: '#AA00FF',
  booster: '#FF4081',
};

export default function ResultCard({ workId, scores, mainType, subType, tieWith }: Props) {
  const order = workId === 1 ? [...WORK1_ORDER] : [...WORK2_ORDER];
  const labels = workId === 1 ? LABELS_W1 : LABELS_W2;
  const isBalanced = mainType === 'balanced';

  const headline = isBalanced ? 'バランス型' : labels[mainType] ?? mainType;
  const color = isBalanced ? '#A0E7FF' : COLORS[mainType] ?? '#fff';

  // Defensive: never let analysis generation crash the whole tree. If a
  // student's score distribution surprises the analysis engine, fall back to
  // a minimal card with just the headline + radar instead of taking the
  // student to the global ErrorBoundary recovery screen.
  let analysis: ReturnType<typeof generateWork1Analysis> | null = null;
  try {
    analysis = workId === 1
      ? generateWork1Analysis(scores as unknown as Work1Scores)
      : generateWork2Analysis(scores as unknown as Work2Scores);
  } catch (e) {
    console.error('ResultCard analysis failed:', e, { workId, scores, mainType, subType });
    analysis = null;
  }

  return (
    <article className="panel" style={{ borderColor: `${color}55` }}>
      <header className="mb-4">
        <p className="text-white/60 text-sm">今日の回答では</p>
        <h2 className="text-4xl font-black" style={{ color }}>
          {headline}
        </h2>
        {analysis?.catchcopy && (
          <p className="text-white/90 mt-2 text-lg font-bold">{analysis.catchcopy}</p>
        )}
        {analysis?.summary && (
          <p className="text-white/80 text-sm mt-3 leading-relaxed whitespace-pre-line">
            {analysis.summary}
          </p>
        )}
        {tieWith && (
          <p className="text-white/60 text-sm mt-2">
            ※ {labels[tieWith]} と同程度の傾向も見られました
          </p>
        )}
      </header>

      <div className="flex flex-col items-center mb-4">
        <RadarChart scores={scores} order={order} colors={COLORS} labels={labels} />
      </div>

      {!isBalanced && (
        <p className="text-white/80 text-sm mb-3">
          サブ傾向：<span className="font-bold">{labels[subType] ?? subType}</span>{' '}
          の要素も強めです。
        </p>
      )}

      <p className="text-white/60 text-xs mb-5">
        ※ 今日の回答での傾向です。固定的な性格分類ではありません。
      </p>

      {analysis?.detail && (
        <DetailPara emoji="🔍" title="詳細分析" body={analysis.detail} />
      )}

      {analysis && (
        <div className="mt-4 space-y-4 text-sm">
          <DetailSection emoji="💬" title="燃える言葉" items={analysis.motivators} />
          <DetailSection emoji="🚫" title="やる気なくす言葉" items={analysis.demotivators} />
          <DetailSection emoji="⚡" title="調子いい時のサイン" items={analysis.goodSigns} />
          <DetailSection emoji="📉" title="調子悪い時のサイン" items={analysis.badSigns} />
          {analysis.helpfulActions && (
            <DetailPara emoji="🤝" title="こうしてもらえると助かる" body={analysis.helpfulActions} />
          )}
          {analysis.growthTip && (
            <DetailPara emoji="🌱" title="伸びしろ" body={analysis.growthTip} />
          )}
        </div>
      )}

      {!analysis && (
        <p className="text-white/60 text-sm mt-4 text-center">
          詳細分析の生成に失敗しました。レーダーチャートを参考にしてください。
        </p>
      )}
    </article>
  );
}

function DetailSection({ emoji, title, items }: { emoji: string; title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h4 className="font-bold mb-1">
        {emoji} {title}
      </h4>
      <ul className="list-disc list-inside space-y-1 text-white/80">
        {items.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

function DetailPara({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  if (!body) return null;
  return (
    <div>
      <h4 className="font-bold mb-1">
        {emoji} {title}
      </h4>
      <p className="text-white/80 whitespace-pre-line leading-relaxed">{body}</p>
    </div>
  );
}
