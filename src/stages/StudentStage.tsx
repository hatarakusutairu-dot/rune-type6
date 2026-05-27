import { useState } from 'react';
import { useRoom } from '../RoomContext';
import Quiz from '../components/Quiz';
import ResultCard from '../components/ResultCard';
import SlideImage from '../components/SlideImage';
import SurveyQR from '../components/SurveyQR';
import { useCountdown } from '../components/Countdown';
import { work1Questions } from '../data/work1Questions';
import { work2Questions } from '../data/work2Questions';
import { generateTotalAnalysis } from '../lib/scoring';
import type { Work1Scores, Work2Scores } from '../types/analysis';
import { loadState } from '../lib/storage';

/** Renders /slides/<phase>.png if it exists, falling back to the given node. */
function SlidePage({ phase, fallback }: { phase: string; fallback: React.ReactNode }) {
  return (
    <main key={phase} className="min-h-screen p-4 sm:p-6 animate-[fadein_400ms_ease-out]">
      <div className="max-w-xl mx-auto">
        <SlideImage phase={phase} fallback={fallback} />
      </div>
    </main>
  );
}

export default function StudentStage() {
  const room = useRoom();
  const phase = room.phase;
  const persisted = loadState();

  if (phase === 'lobby') {
    return (
      <Center>
        <div className="text-5xl mb-3 animate-pulse">🎮</div>
        <h2 className="text-2xl font-bold mb-2">入室しました</h2>
        <p className="text-white/70">講師の合図をお待ちください。</p>
        <p className="text-white/40 text-xs mt-6">クラス：{room.self?.className ?? '-'}</p>
      </Center>
    );
  }

  if (phase === 'stage0_title') {
    return (
      <SlidePage
        phase="stage0_title"
        fallback={<TextSlide title="TYPE SCANNER" body="はじめるよ" />}
      />
    );
  }

  if (phase === 'stage0_rules') {
    return (
      <SlidePage
        phase="stage0_rules"
        fallback={
          <Center>
            <p className="text-white/40 text-xs mb-3">RULES</p>
            <h2 className="text-2xl font-black mb-4">きょうのルール</h2>
            <ol className="space-y-3 text-left text-sm">
              <li className="flex gap-2">
                <span className="text-cyan-400 font-black">①</span>
                <span>診断結果に良い悪いはない。全部チームに必要なタイプ</span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400 font-black">②</span>
                <span>否定しない・笑わない</span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400 font-black">③</span>
                <span>ここだけの話</span>
              </li>
            </ol>
          </Center>
        }
      />
    );
  }

  if (phase === 'stage0_theme') {
    return (
      <SlidePage
        phase="stage0_theme"
        fallback={
          <Center>
            <p className="text-white/40 text-xs mb-3">THEME</p>
            <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
              他者理解
            </h2>
            <p className="text-white/80 text-sm">"違い" を知ることがチームの第一歩</p>
          </Center>
        }
      />
    );
  }

  if (phase === 'stage0_flow') {
    return (
      <SlidePage
        phase="stage0_flow"
        fallback={
          <Center>
            <p className="text-white/40 text-xs mb-3">FLOW</p>
            <h2 className="text-2xl font-black mb-4">きょうの流れ</h2>
            <ul className="space-y-2 text-left text-sm">
              <li>
                <span className="text-pink-400 font-black">WORK 1</span> ─ ゲーマータイプ診断
              </li>
              <li>
                <span className="text-cyan-400 font-black">WORK 2</span> ─ 危機対応タイプ診断
              </li>
              <li>
                <span className="text-yellow-300 font-black">TOTAL</span> ─ 総合分析
              </li>
            </ul>
          </Center>
        }
      />
    );
  }

  if (phase === 'stage0_work1title') {
    return (
      <SlidePage
        phase="stage0_work1title"
        fallback={
          <WorkIntroSlide
            badge="WORK 1"
            title="ゲーマータイプ診断"
            description="あなたが普段ゲームをやるときの『楽しみ方の傾向』を4タイプに分けて見える化します。勝つこと？上達？仲間との時間？新しい発見？——20問の質問に直感で答えてください。"
            bullets={[
              '20問・直感でOK',
              '一度選ぶと戻れません',
              '正解はありません',
            ]}
          />
        }
      />
    );
  }

  if (phase === 'stage0_work1') {
    return (
      <SlidePage
        phase="stage0_work1"
        fallback={
          <TextSlide
            title="WORK 1 ─ ルール"
            body="これから20問。直感で選んでね。一度選ぶと次の問題に進みます。"
          />
        }
      />
    );
  }

  if (phase === 'stage1_active') {
    return (
      <Page>
        <Quiz workId={1} questions={work1Questions} />
      </Page>
    );
  }

  if (phase === 'stage2_active') {
    return (
      <Page>
        <Quiz workId={2} questions={work2Questions} />
      </Page>
    );
  }

  if (phase === 'stage1_results' || phase.startsWith('stage1_explain')) {
    const w = persisted.work1;
    if (!w || !w.mainType || !w.scores) {
      return (
        <Center>
          <p className="text-white/70">ワーク1の結果を準備中です…</p>
        </Center>
      );
    }
    return (
      <Page>
        <TypeOverviewBanner phase="stage0_1type4" />
        <ResultCard
          workId={1}
          scores={w.scores}
          mainType={w.mainType}
          subType={w.subType ?? ''}
        />
      </Page>
    );
  }

  if (phase === 'stage1_bridge') {
    return (
      <SlidePage
        phase="stage1_bridge"
        fallback={
          <main key={phase} className="min-h-screen flex items-center justify-center p-6">
            <div
              key={phase}
              className="panel max-w-md w-full text-center animate-[fadein_400ms_ease-out] bg-gradient-to-br from-fuchsia-500/10 via-violet-500/5 to-cyan-400/10 border-fuchsia-300/30"
            >
              <p className="text-white/50 text-xs tracking-[0.4em] mb-2">BRIDGE</p>
              <h2 className="text-4xl font-black mb-5 bg-gradient-to-r from-fuchsia-400 via-rose-300 to-cyan-300 bg-clip-text text-transparent">
                次は WORK 2
              </h2>
              <div className="grid grid-cols-3 items-center gap-2 mb-5">
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="text-white/50 text-[10px] mb-1">WORK 1</p>
                  <p className="text-xs font-bold leading-tight">普段の<br />向き合い方</p>
                </div>
                <div className="text-2xl font-black text-white/60">×</div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="text-white/50 text-[10px] mb-1">WORK 2</p>
                  <p className="text-xs font-bold leading-tight">ピンチでの<br />動き</p>
                </div>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">
                2つを掛け合わせると、<br />
                <span className="font-black text-white">あなただけのプレイヤータイプ</span>
                が見えてくる。
              </p>
            </div>
          </main>
        }
      />
    );
  }

  if (phase === 'stage2_work2title') {
    return (
      <SlidePage
        phase="stage2_work2title"
        fallback={
          <WorkIntroSlide
            badge="WORK 2"
            title="危機対応タイプ診断"
            description="チームでピンチになったとき、自分はどう動くタイプかを診断します。『攻める／守る／分析する／励ます』——4つの危機対応パターンから自分の傾向を見える化。チーム経験がなくても「もしそうなったら？」の想像でOK。"
            bullets={[
              '想像で答えてOK',
              '20問・直感で',
              '間違いはありません',
            ]}
          />
        }
      />
    );
  }

  if (phase === 'stage2_work2') {
    return (
      <SlidePage
        phase="stage2_work2"
        fallback={
          <TextSlide
            title="WORK 2 ─ ルール"
            body="ここからはチームでのピンチ場面を想像して答えてください。チーム経験がなくても大丈夫。直感でOK。"
          />
        }
      />
    );
  }

  if (phase === 'stage2_results' || phase.startsWith('stage2_explain')) {
    const w = persisted.work2;
    if (!w || !w.mainType || !w.scores) {
      return (
        <Center>
          <p className="text-white/70">ワーク2の結果を準備中です…</p>
        </Center>
      );
    }
    return (
      <Page>
        <TypeOverviewBanner phase="stage2_2type4" />
        <ResultCard
          workId={2}
          scores={w.scores}
          mainType={w.mainType}
          subType={w.subType ?? ''}
        />
      </Page>
    );
  }

  if (phase === 'stage3_type') {
    return (
      <SlidePage
        phase="stage3_type"
        fallback={
          <Center>
            <p className="text-white/40 text-xs mb-3">TOTAL</p>
            <h2 className="text-2xl font-black mb-2">総合分析</h2>
            <p className="text-white/80 text-sm">
              2つを掛け合わせて、あなただけのプレイヤータイプを見てみよう
            </p>
          </Center>
        }
      />
    );
  }

  if (phase === 'stage3_summary' || phase === 'stage3_share') {
    return (
      <Page>
        <CombinedResult />
      </Page>
    );
  }

  if (phase === 'stage3_comment') {
    return (
      <Page>
        <CommentForm />
      </Page>
    );
  }

  if (phase === 'stage3_wordcloud') {
    return (
      <Center>
        <h2 className="text-xl font-bold mb-2">ありがとう！</h2>
        <p className="text-white/70 text-sm">講師画面で全員の感想を見てみましょう。</p>
      </Center>
    );
  }

  if (phase === 'stage3_closing') {
    return (
      <SlidePage
        phase="stage3_closing"
        fallback={
          <Center>
            <h2 className="text-2xl font-bold mb-3">"違い"を知ることが、チームの第一歩</h2>
            <p className="text-white/70 text-sm">
              今日知ったことを、どこかで思い出してくれたらOK。
            </p>
          </Center>
        }
      />
    );
  }

  if (phase === 'closed') {
    return (
      <main key={phase} className="min-h-screen p-4 sm:p-6 animate-[fadein_400ms_ease-out]">
        <div className="max-w-xl mx-auto">
          <SurveyQR />
        </div>
      </main>
    );
  }

  return (
    <Center>
      <p className="text-white/70">フェーズ：{phase}</p>
    </Center>
  );
}

/** Banner displayed above the result card, showing the 4-type overview slide if provided. */
function TypeOverviewBanner({ phase }: { phase: string }) {
  return (
    <div className="mb-4">
      <SlideImage phase={phase} fallback={null} />
    </div>
  );
}

function CombinedResult() {
  const persisted = loadState();
  const w1 = persisted.work1;
  const w2 = persisted.work2;
  const total = w1?.scores && w2?.scores
    ? generateTotalAnalysis(
        w1.scores as unknown as Work1Scores,
        w2.scores as unknown as Work2Scores,
      )
    : null;

  return (
    <div className="space-y-4">
      <header className="text-center mb-2">
        <p className="text-white/40 text-xs">TOTAL</p>
        <h2 className="text-2xl font-black">総合結果</h2>
      </header>

      {total && (
        <article className="panel">
          <p className="text-white/50 text-xs">あなたのタイプ</p>
          <h3 className="text-3xl font-black bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
            {total.catchcopy}
          </h3>
          <p className="text-white/80 text-sm mt-3 leading-relaxed whitespace-pre-line">
            {total.summary}
          </p>
          <div className="mt-4 space-y-3 text-sm">
            {total.detail && (
              <DetailPara emoji="🔍" title="詳細分析" body={total.detail} />
            )}
            <Detail emoji="💬" title="燃える言葉" items={total.motivators} />
            <Detail emoji="🚫" title="やる気なくす言葉" items={total.demotivators} />
            <Detail emoji="⚡" title="調子いいサイン" items={total.goodSigns} />
            <Detail emoji="📉" title="調子悪いサイン" items={total.badSigns} />
            {total.helpfulActions && (
              <DetailPara emoji="🤝" title="助かるフォロー" body={total.helpfulActions} />
            )}
            {total.teamRole && (
              <DetailPara emoji="🎮" title="チームでの活かし方" body={total.teamRole} />
            )}
            {total.growthTip && (
              <DetailPara emoji="🌱" title="伸びしろ" body={total.growthTip} />
            )}
          </div>
        </article>
      )}

      {w1?.mainType && w1.scores && (
        <ResultCard
          workId={1}
          scores={w1.scores}
          mainType={w1.mainType}
          subType={w1.subType ?? ''}
        />
      )}
      {w2?.mainType && w2.scores && (
        <ResultCard
          workId={2}
          scores={w2.scores}
          mainType={w2.mainType}
          subType={w2.subType ?? ''}
        />
      )}
      <div className="panel text-sm text-white/80">
        <p className="font-bold mb-2">この結果をチームで共有してみよう！</p>
        <ul className="list-disc list-inside space-y-1">
          <li>自分のタイプをチームメイトに紹介する</li>
          <li>相手の『燃えるワード』『萎えるワード』を知る</li>
          <li>チームに足りない役割を話し合う</li>
        </ul>
      </div>
    </div>
  );
}

function Detail({ emoji, title, items }: { emoji: string; title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h4 className="font-bold mb-1">
        {emoji} {title}
      </h4>
      <ul className="list-disc list-inside space-y-1 text-white/85">
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
      <p className="text-white/85 whitespace-pre-line leading-relaxed">{body}</p>
    </div>
  );
}

function CommentForm() {
  const room = useRoom();
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const remaining = useCountdown(90);
  const expired = remaining <= 0;

  function submit() {
    const t = text.trim();
    if (!t || expired) return;
    room.send({ type: 'S_COMMENT', payload: { text: t } });
    setSent(true);
  }

  if (sent) {
    return (
      <Center>
        <h2 className="text-xl font-bold mb-2">送信ありがとう！</h2>
        <p className="text-white/70 text-sm">講師画面でみんなの感想が表示されます。</p>
      </Center>
    );
  }

  return (
    <div className="panel max-w-md w-full mx-auto">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-xl font-bold">今日の感想を一言で</h2>
        <span
          className={`tabular-nums font-black text-lg ${remaining <= 10 ? 'text-rose-300' : 'text-white/80'}`}
        >
          残り {remaining}s
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 80))}
        placeholder="例：自分のタイプが意外だった"
        rows={3}
        disabled={expired}
        className="w-full rounded-lg bg-bg-700 border border-white/10 px-3 py-2 mb-3 disabled:opacity-50"
      />
      <div className="flex justify-between text-xs text-white/50 mb-3">
        <span>最大80文字</span>
        <span>{text.length}/80</span>
      </div>
      <button
        onClick={submit}
        disabled={!text.trim() || expired}
        className="btn-primary w-full"
      >
        {expired ? '時間切れ' : '送信'}
      </button>
    </div>
  );
}

function TextSlide({ title, body }: { title: string; body: string }) {
  return (
    <Center>
      <h2 className="text-3xl font-black mb-3 bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
        {title}
      </h2>
      <p className="text-white/80 text-sm leading-relaxed">{body}</p>
    </Center>
  );
}

function WorkIntroSlide({
  badge,
  title,
  description,
  bullets,
}: {
  badge: string;
  title: string;
  description: string;
  bullets?: string[];
}) {
  return (
    <Center>
      <p className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-fuchsia-500/40 to-cyan-400/40 text-white text-xs font-black tracking-widest mb-3">
        {badge}
      </p>
      <h2 className="text-3xl font-black mb-4 bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
        {title}
      </h2>
      <p className="text-white/85 text-sm leading-relaxed text-left mb-4 whitespace-pre-line">
        {description}
      </p>
      {bullets && bullets.length > 0 && (
        <ul className="text-left text-white/70 text-sm space-y-1">
          {bullets.map((b, i) => (
            <li key={i}>・{b}</li>
          ))}
        </ul>
      )}
    </Center>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen p-4 sm:p-6">
      <div className="max-w-xl mx-auto">{children}</div>
    </main>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  const phase = useRoom().phase;
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div
        key={phase}
        className="panel max-w-md w-full text-center animate-[fadein_400ms_ease-out]"
      >
        {children}
      </div>
    </main>
  );
}
