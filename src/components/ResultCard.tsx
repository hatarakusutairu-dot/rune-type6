import { useState } from 'react';
import RadarChart from './RadarChart';
import { typeInfo } from '../data/typeInfo';
import { WORK1_ORDER, WORK2_ORDER } from '../lib/scoring';

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
  const [expanded, setExpanded] = useState(false);
  const order = workId === 1 ? [...WORK1_ORDER] : [...WORK2_ORDER];
  const labels = workId === 1 ? LABELS_W1 : LABELS_W2;
  const isBalanced = mainType === 'balanced';

  const headline = isBalanced ? 'バランス型' : labels[mainType] ?? mainType;
  const color = isBalanced ? '#A0E7FF' : COLORS[mainType] ?? '#fff';
  const main = isBalanced ? null : typeInfo[mainType];
  const sub = typeInfo[subType];

  const hasDetail =
    !!main &&
    ((main.motivators && main.motivators.length > 0) ||
      (main.demotivators && main.demotivators.length > 0) ||
      (main.goodSigns && main.goodSigns.length > 0) ||
      (main.badSigns && main.badSigns.length > 0) ||
      !!main.helpfulActions ||
      !!main.teamValue ||
      !!main.overdone);

  return (
    <article className="panel" style={{ borderColor: `${color}55` }}>
      <header className="mb-4">
        <p className="text-white/60 text-sm">今日の回答では</p>
        <h2 className="text-4xl font-black" style={{ color }}>
          {headline}
        </h2>
        {main?.catchcopy && <p className="text-white/80 mt-1">{main.catchcopy}</p>}
        {main?.description && (
          <p className="text-white/70 text-sm mt-2 leading-relaxed">{main.description}</p>
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

      {!isBalanced && sub && (
        <p className="text-white/80 text-sm mb-3">
          サブ傾向：<span className="font-bold">{labels[subType]}</span>{' '}
          の要素も強めです。
        </p>
      )}

      <p className="text-white/60 text-xs mb-4">
        ※ 今日の回答での傾向です。固定的な性格分類ではありません。
      </p>

      {(hasDetail || isBalanced) && (
        <button onClick={() => setExpanded((v) => !v)} className="btn-ghost w-full">
          {expanded ? '閉じる' : '詳しく見る'}
        </button>
      )}

      {!hasDetail && !isBalanced && (
        <p className="text-white/50 text-xs text-center">
          このあと両方のワークが終わると、もっと詳しい総合分析が見られるよ ✨
        </p>
      )}

      {expanded && !isBalanced && main && hasDetail && (
        <div className="mt-5 space-y-4 text-sm">
          <DetailSection emoji="💬" title="燃える言葉" items={main.motivators} />
          <DetailSection emoji="🚫" title="やる気なくす言葉" items={main.demotivators} />
          <DetailSection emoji="⚡" title="調子いい時のサイン" items={main.goodSigns} />
          <DetailSection emoji="📉" title="調子悪い時のサイン" items={main.badSigns} />
          {main.helpfulActions && (
            <DetailPara emoji="🤝" title="こうしてもらえると助かる" body={main.helpfulActions} />
          )}
          {main.teamValue && (
            <DetailPara emoji="🎮" title="チームでの価値" body={main.teamValue} />
          )}
          {main.overdone && (
            <DetailPara emoji="⚠️" title="過剰になると" body={main.overdone} />
          )}
        </div>
      )}

      {expanded && isBalanced && (
        <div className="mt-5 text-sm text-white/80 space-y-2">
          <p>
            4タイプすべてのスコアが近い、バランス型の傾向です。
            状況や相手に合わせて柔軟に役割を変えられるのが強みです。
          </p>
          <p className="text-white/60">
            ※ 今日の回答のスコアが拮抗していたため、特定のタイプを断定していません。
          </p>
        </div>
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
      <p className="text-white/80">{body}</p>
    </div>
  );
}
