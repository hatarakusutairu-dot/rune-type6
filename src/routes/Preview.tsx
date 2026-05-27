import { useSearchParams, Link } from 'react-router-dom';
import ResultCard from '../components/ResultCard';
import { generateTotalAnalysis } from '../lib/scoring';
import type { Work1Scores, Work2Scores } from '../types/analysis';

const W1_KEYS = ['competitor', 'achiever', 'socializer', 'explorer'] as const;
const W2_KEYS = ['attacker', 'guardian', 'analyst', 'booster'] as const;

const PRESETS: { label: string; w1: number[]; w2: number[]; note: string }[] = [
  { label: '1: extreme × dominant',           w1: [14, 3, 2, 1], w2: [10, 5, 3, 2], note: '' },
  { label: '2: double × double (対立検出あり)', w1: [7, 7, 4, 2], w2: [7, 7, 4, 2], note: 'comp+soc / att+gua' },
  { label: '3: balanced × balanced',          w1: [5, 5, 5, 5], w2: [5, 5, 5, 5], note: '' },
  { label: '4: dominant × double',            w1: [8, 6, 4, 2], w2: [3, 2, 8, 7], note: 'analyst×booster 対立' },
  { label: '5: triple × extreme',             w1: [6, 6, 6, 2], w2: [12, 4, 2, 2], note: '' },
  { label: '6: dominant(comp) × dominant(boo)', w1: [10, 5, 3, 2], w2: [2, 2, 6, 10], note: '' },
  { label: '7: dominant(ach) × double',       w1: [2, 10, 5, 3], w2: [7, 3, 3, 7], note: '' },
  { label: '8: extreme(soc) × balanced',      w1: [3, 2, 12, 3], w2: [5, 5, 5, 5], note: '' },
];

function parseScores(raw: string | null, keys: readonly string[]): Record<string, number> | null {
  if (!raw) return null;
  const parts = raw.split(',').map((s) => Number(s.trim()));
  if (parts.length !== keys.length || parts.some((n) => !Number.isFinite(n))) return null;
  const out: Record<string, number> = {};
  keys.forEach((k, i) => { out[k] = parts[i]; });
  return out;
}

function judge(scores: Record<string, number>, order: readonly string[]): { mainType: string; subType: string } {
  const sorted = order.slice().sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));
  return { mainType: sorted[0], subType: sorted[1] };
}

export default function Preview() {
  const [params, setParams] = useSearchParams();
  const w1Raw = params.get('w1');
  const w2Raw = params.get('w2');
  const w1 = parseScores(w1Raw, W1_KEYS);
  const w2 = parseScores(w2Raw, W2_KEYS);

  function apply(p: { w1: number[]; w2: number[] }) {
    setParams({ w1: p.w1.join(','), w2: p.w2.join(',') });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const w1Judge = w1 ? judge(w1, W1_KEYS) : null;
  const w2Judge = w2 ? judge(w2, W2_KEYS) : null;
  const total = w1 && w2
    ? generateTotalAnalysis(w1 as unknown as Work1Scores, w2 as unknown as Work2Scores)
    : null;

  return (
    <main className="min-h-screen p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="panel">
          <div className="flex items-baseline justify-between mb-3">
            <h1 className="text-2xl font-black">分析プレビュー</h1>
            <Link to="/" className="text-white/50 text-sm underline">
              トップへ
            </Link>
          </div>
          <p className="text-white/60 text-xs mb-3">
            URLパラメータ <code>?w1=コンペ,アチー,ソシャ,エクスプ&w2=アタック,ガード,アナリスト,ブースター</code>
            （各0–20）で4タイプのスコアを与えると、ワーク1／ワーク2／総合 のカードを一度に描画します。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => apply(p)}
                className="text-left rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm"
              >
                <div className="font-bold">{p.label}</div>
                <div className="text-white/50 text-xs mt-0.5">
                  w1: [{p.w1.join(', ')}] / w2: [{p.w2.join(', ')}]
                  {p.note && <span className="text-amber-300 ml-2">{p.note}</span>}
                </div>
              </button>
            ))}
          </div>
        </header>

        {!w1 && !w2 && (
          <p className="text-white/60 text-sm text-center">
            上のプリセットを選ぶか、URL にスコアを指定してください。
          </p>
        )}

        {w1 && w1Judge && (
          <section>
            <h2 className="text-white/70 text-sm font-bold mb-2 px-2">
              WORK 1 — ゲーマータイプ
            </h2>
            <ResultCard
              workId={1}
              scores={w1}
              mainType={w1Judge.mainType}
              subType={w1Judge.subType}
            />
          </section>
        )}

        {w2 && w2Judge && (
          <section>
            <h2 className="text-white/70 text-sm font-bold mb-2 px-2">
              WORK 2 — 危機対応タイプ
            </h2>
            <ResultCard
              workId={2}
              scores={w2}
              mainType={w2Judge.mainType}
              subType={w2Judge.subType}
            />
          </section>
        )}

        {total && (
          <section>
            <h2 className="text-white/70 text-sm font-bold mb-2 px-2">
              TOTAL — 総合分析
            </h2>
            <article className="panel">
              <p className="text-white/50 text-xs">あなたのタイプ</p>
              <h3 className="text-3xl font-black bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
                {total.catchcopy}
              </h3>
              <p className="text-white/80 text-sm mt-3 leading-relaxed whitespace-pre-line">
                {total.summary}
              </p>
              <div className="mt-4 space-y-4 text-sm">
                {total.detail && <Para emoji="🔍" title="詳細分析" body={total.detail} />}
                <List emoji="💬" title="燃える言葉" items={total.motivators} />
                <List emoji="🚫" title="やる気なくす言葉" items={total.demotivators} />
                <List emoji="⚡" title="調子いいサイン" items={total.goodSigns} />
                <List emoji="📉" title="調子悪いサイン" items={total.badSigns} />
                {total.helpfulActions && <Para emoji="🤝" title="助かるフォロー" body={total.helpfulActions} />}
                {total.teamRole && <Para emoji="🎮" title="チームでの活かし方" body={total.teamRole} />}
                {total.growthTip && <Para emoji="🌱" title="伸びしろ" body={total.growthTip} />}
              </div>
            </article>
          </section>
        )}
      </div>
    </main>
  );
}

function List({ emoji, title, items }: { emoji: string; title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h4 className="font-bold mb-1">{emoji} {title}</h4>
      <ul className="list-disc list-inside space-y-1 text-white/85">
        {items.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </div>
  );
}

function Para({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  if (!body) return null;
  return (
    <div>
      <h4 className="font-bold mb-1">{emoji} {title}</h4>
      <p className="text-white/85 whitespace-pre-line leading-relaxed">{body}</p>
    </div>
  );
}
