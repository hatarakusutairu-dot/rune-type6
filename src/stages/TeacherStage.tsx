import { useEffect, useState } from 'react';
import { useRoom } from '../RoomContext';
import { JoinQR } from '../routes/Teacher';
import Distribution from '../components/Distribution';
import CrossMatrix from '../components/CrossMatrix';
import WordCloud from '../components/WordCloud';
import TypeSlide from '../components/TypeSlide';
import ClassLobby from '../components/ClassLobby';
import CharacterPressCounter from '../components/CharacterPressCounter';
import SlideImage from '../components/SlideImage';
import SurveyQR from '../components/SurveyQR';
import { WORK1_ORDER, WORK2_ORDER } from '../lib/scoring';

const PHASE_LABELS: Record<string, string> = {
  lobby: 'ロビー',
  stage0_title: 'タイトル',
  stage0_rules: 'ルール',
  stage0_theme: 'テーマ',
  stage0_flow: '今日の流れ',
  stage0_work1title: 'WORK1 タイトル',
  stage0_work1: 'WORK1 説明',
  stage1_active: 'ワーク1 回答中',
  stage1_results: 'ワーク1 結果',
  stage1_explain_1: '解説 コンペティター',
  stage1_explain_2: '解説 アチーバー',
  stage1_explain_3: '解説 ソーシャライザー',
  stage1_explain_4: '解説 エクスプローラー',
  stage1_bridge: 'ブリッジ',
  stage2_work2title: 'WORK2 タイトル',
  stage2_work2: 'WORK2 説明',
  stage2_active: 'ワーク2 回答中',
  stage2_results: 'ワーク2 結果',
  stage2_explain_1: '解説 アタッカー',
  stage2_explain_2: '解説 ガーディアン',
  stage2_explain_3: '解説 アナリスト',
  stage2_explain_4: '解説 ブースター',
  stage3_type: '総合タイトル',
  stage3_summary: 'クロス集計',
  stage3_share: '共有タイム',
  stage3_comment: '感想入力',
  stage3_wordcloud: 'ワードクラウド',
  stage3_closing: 'まとめ',
  closed: 'アンケート',
};

const LABELS_W1: Record<string, string> = {
  competitor: 'コンペティター',
  achiever: 'アチーバー',
  socializer: 'ソーシャライザー',
  explorer: 'エクスプローラー',
  balanced: 'バランス型',
};
const LABELS_W2: Record<string, string> = {
  attacker: 'アタッカー',
  guardian: 'ガーディアン',
  analyst: 'アナリスト',
  booster: 'ブースター',
  balanced: 'バランス型',
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
  balanced: '#9CA3AF',
};

const EXPLAIN_TYPE_W1: Record<string, string> = {
  stage1_explain_1: 'competitor',
  stage1_explain_2: 'achiever',
  stage1_explain_3: 'socializer',
  stage1_explain_4: 'explorer',
};
const EXPLAIN_TYPE_W2: Record<string, string> = {
  stage2_explain_1: 'attacker',
  stage2_explain_2: 'guardian',
  stage2_explain_3: 'analyst',
  stage2_explain_4: 'booster',
};

export default function TeacherStage() {
  const room = useRoom();
  const token = room.teacherToken;

  function next() {
    if (!token) return;
    room.send({ type: 'T_NEXT_PHASE', payload: { token } });
  }
  function prev() {
    if (!token) return;
    room.send({ type: 'T_PREV_PHASE', payload: { token } });
  }
  function endActive() {
    if (!token) return;
    room.send({ type: 'T_END_ACTIVE', payload: { token } });
  }
  function close() {
    if (!token) return;
    const phaseNow = room.phase;
    const earlyExit = !phaseNow.startsWith('stage3') && phaseNow !== 'closed';
    const message = earlyExit
      ? `まだ最終フェーズに到達していません（現在：${PHASE_LABELS[phaseNow] ?? phaseNow}）。\n` +
        '今ここで授業を終了すると、生徒の画面が一斉にアンケートQRに切り替わります。\n' +
        '本当に終了しますか？'
      : 'セッションを終了しますか？';
    if (!confirm(message)) return;
    room.send({ type: 'T_CLOSE_ROOM', payload: { token } });
  }

  const phase = room.phase;
  const isActive = phase === 'stage1_active' || phase === 'stage2_active';

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black">TYPE SCANNER ─ 講師モード</h1>
            <p className="text-white/60 text-sm">
              ルーム <span className="font-mono">{room.code}</span>
              {' / '}入室 <span className="font-bold">{room.studentCount}</span>
              {' / '}接続 {room.status}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="btn-ghost"
              onClick={prev}
              disabled={phase === 'lobby'}
              title="ひとつ前のフェーズに戻る"
            >
              ← 前へ
            </button>
            {isActive && (
              <button className="btn-ghost" onClick={endActive}>
                締切
              </button>
            )}
            <button className="btn-primary" onClick={next} disabled={phase === 'closed'}>
              次へ →
            </button>
            <button className="btn-danger" onClick={close}>
              授業終了
            </button>
          </div>
        </header>

        <section className="panel mb-6">
          <h2 className="text-white/70 text-sm">現在のフェーズ</h2>
          <p className="text-3xl font-black mt-1">{PHASE_LABELS[phase] ?? phase}</p>
          <p className="text-white/40 text-xs mt-1 font-mono">{phase}</p>
        </section>

        <PhaseBody />
      </div>
    </main>
  );
}

function PhaseBody() {
  const room = useRoom();
  const phase = room.phase;

  if (phase === 'lobby') {
    return (
      <section className="panel">
        {room.code && <JoinQR code={room.code} />}
        <div className="mt-8">
          <ClassLobby
            classes={room.state?.classes ?? []}
            perClassCount={room.perClassCount}
            totalCount={room.studentCount}
          />
        </div>
        <p className="text-center text-white/40 text-xs mt-6">
          全員揃ったら右上の「次へ →」で開始 ▶
        </p>
      </section>
    );
  }

  if (phase === 'stage0_title') {
    return (
      <SlideImage
        phase="stage0_title"
        fallback={<Slide title="TYPE SCANNER"><p className="text-3xl font-black">TYPE SCANNER</p></Slide>}
      />
    );
  }

  if (phase === 'stage0_work1title') {
    return (
      <SlideImage
        phase="stage0_work1title"
        fallback={<Slide title="WORK 1"><p className="text-3xl font-black">WORK 1</p></Slide>}
      />
    );
  }

  if (phase === 'stage0_work1') {
    return (
      <SlideImage
        phase="stage0_work1"
        fallback={
          <Slide title="WORK 1 ─ 説明">
            <p className="text-white/85">これから20問の質問に答えてください。直感で大丈夫。</p>
          </Slide>
        }
      />
    );
  }

  if (phase === 'stage2_work2title') {
    return (
      <SlideImage
        phase="stage2_work2title"
        fallback={<Slide title="WORK 2"><p className="text-3xl font-black">WORK 2</p></Slide>}
      />
    );
  }

  if (phase === 'stage2_work2') {
    return (
      <SlideImage
        phase="stage2_work2"
        fallback={
          <Slide title="WORK 2 ─ 説明">
            <p className="text-white/85">
              ここからはチームでのピンチ場面を想像して答えてください。
              チーム経験がなくても大丈夫。直感で選んでOK。
            </p>
          </Slide>
        }
      />
    );
  }

  if (phase === 'stage3_type') {
    return (
      <SlideImage
        phase="stage3_type"
        fallback={
          <Slide title="総合分析">
            <p className="text-3xl font-black mb-2">2つを掛け合わせて</p>
            <p className="text-white/80">あなただけのプレイヤータイプを見てみよう</p>
          </Slide>
        }
      />
    );
  }

  if (phase === 'stage0_rules') {
    return (
      <SlideImage
        phase="stage0_rules"
        fallback={
          <Slide title="ルール">
            <ol className="space-y-3 text-2xl">
              <li><span className="text-cyan-400 font-black">①</span> 診断結果に良い悪いはない。全部チームに必要なタイプ</li>
              <li><span className="text-cyan-400 font-black">②</span> 否定しない・笑わない</li>
              <li><span className="text-cyan-400 font-black">③</span> ここだけの話</li>
            </ol>
          </Slide>
        }
      />
    );
  }

  if (phase === 'stage0_theme') {
    return (
      <SlideImage
        phase="stage0_theme"
        fallback={
          <Slide title="今日のテーマ">
            <p className="text-3xl font-black mb-3">他者理解</p>
            <p className="text-xl text-white/80">"違い" を知ることがチームの第一歩</p>
            <p className="mt-6 text-white/70">
              同じゲーマーでも、楽しみ方もピンチの動き方も全然違う。
            </p>
          </Slide>
        }
      />
    );
  }

  if (phase === 'stage0_flow') {
    return (
      <SlideImage
        phase="stage0_flow"
        fallback={
          <Slide title="今日の流れ">
            <ul className="space-y-3 text-xl">
              <li><span className="text-pink-400 font-black">WORK 1</span> ─ ゲーマータイプ診断（自分の楽しみ方を知る）</li>
              <li><span className="text-cyan-400 font-black">WORK 2</span> ─ 危機対応タイプ診断（ピンチの自分を知る）</li>
              <li><span className="text-yellow-300 font-black">TOTAL</span> ─ 総合分析（2つを掛け合わせた自分だけの結果）</li>
            </ul>
          </Slide>
        }
      />
    );
  }

  if (phase === 'stage1_active' || phase === 'stage2_active') {
    return <ProgressView workId={phase === 'stage1_active' ? 1 : 2} />;
  }

  if (phase === 'stage1_results' || phase === 'stage2_results') {
    return <DistributionView workId={phase === 'stage1_results' ? 1 : 2} />;
  }

  if (phase.startsWith('stage1_explain')) {
    const t = EXPLAIN_TYPE_W1[phase];
    return (
      <>
        <SlideImage phase={phase} fallback={<TypeSlide typeId={t} />} />
        <CharacterPressCounter />
      </>
    );
  }

  if (phase.startsWith('stage2_explain')) {
    const t = EXPLAIN_TYPE_W2[phase];
    return (
      <>
        <SlideImage phase={phase} fallback={<TypeSlide typeId={t} />} />
        <CharacterPressCounter />
      </>
    );
  }

  if (phase === 'stage1_bridge') {
    return (
      <SlideImage
        phase="stage1_bridge"
        fallback={
          <Slide title="ワーク2へ">
            <p className="text-white/85 leading-relaxed">
              ワーク1では『普段のゲームとの向き合い方』を見ました。
              次のワーク2では『チームでピンチの時にどう動くか』を見ていきます。
              2つを掛け合わせることで、生徒それぞれのプレイヤータイプが見えてきます。
            </p>
          </Slide>
        }
      />
    );
  }

  if (phase === 'stage3_summary') {
    const cross = room.events.cross;
    return (
      <section className="panel">
        <h3 className="text-xl font-bold mb-4">クロス集計マトリクス</h3>
        {cross ? (
          <CrossMatrix matrix={cross.matrix} balanced={cross.balanced} />
        ) : (
          <p className="text-white/60 text-sm">集計中…</p>
        )}
      </section>
    );
  }

  if (phase === 'stage3_share') {
    return (
      <SlideImage
        phase="stage3_share"
        fallback={
          <Slide title="共有タイム">
            <p className="text-3xl font-black mb-2">グループで結果を見せ合おう</p>
            <p className="text-white/80">"同じだと思ってた？ 違った？" を話してみよう</p>
          </Slide>
        }
      />
    );
  }

  if (phase === 'stage3_comment') {
    return (
      <SlideImage
        phase="stage3_comment"
        fallback={
          <Slide title="今日の感想を一言で">
            <p className="text-white/70">
              スマホから感想を送ってください。次の画面でみんなの感想が表示されます。
            </p>
            <p className="mt-6 text-white/50 text-sm">
              入室者 {room.studentCount} 名 / 感想 {room.events.cloud?.words.length ?? 0} 件
            </p>
          </Slide>
        }
      />
    );
  }

  if (phase === 'stage3_wordcloud') {
    return (
      <section className="panel">
        <h3 className="text-xl font-bold mb-4">みんなの感想</h3>
        <WordCloud words={room.events.cloud?.words ?? []} />
      </section>
    );
  }

  if (phase === 'stage3_closing') {
    return (
      <SlideImage
        phase="stage3_closing"
        fallback={
          <Slide title="まとめ">
            <p className="text-3xl font-black mb-3">"違い" を知ることが、チームの第一歩</p>
            <p className="text-white/80">今日知ったことを、どこかで思い出してくれたらOK</p>
          </Slide>
        }
      />
    );
  }


  if (phase === 'closed') {
    return <SurveyQR />;
  }

  return (
    <section className="panel">
      <p className="text-white/60 text-sm">フェーズ：{phase}</p>
    </section>
  );
}

function Slide({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel min-h-[40vh]">
      <p className="text-white/40 text-xs mb-3">{title}</p>
      <div className="text-white/90">{children}</div>
    </section>
  );
}

function ProgressView({ workId }: { workId: 1 | 2 }) {
  const room = useRoom();
  const token = room.teacherToken;
  const p = room.events.progress;
  const show = p && p.workId === workId ? p : null;
  return (
    <section className="panel">
      <h3 className="text-xl font-bold mb-3">回答状況</h3>
      <p className="text-white/70 mb-4">
        全体：<span className="font-bold">{show?.count ?? 0}</span> /{' '}
        <span className="font-bold">{show?.total ?? room.studentCount}</span>
      </p>
      <div className="space-y-3">
        {(room.state?.classes ?? []).map((c) => {
          const row = show?.perClass[c] ?? { count: 0, total: room.perClassCount[c] ?? 0 };
          const pct = row.total ? Math.round((row.count / row.total) * 100) : 0;
          return (
            <div key={c}>
              <div className="flex justify-between text-sm text-white/70 mb-1">
                <span>{c}</span>
                <span>
                  {row.count}/{row.total}（{pct}%）
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded">
                <div
                  className="h-3 bg-gradient-to-r from-fuchsia-500 to-cyan-400 rounded"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-white/40 text-xs mt-4">
        ワーク{workId} の回答状況。「締切」ボタンで結果フェーズに進めます。
      </p>
      {token && (
        <p className="text-white/30 text-xs mt-1">
          講師トークン認証済み
        </p>
      )}
    </section>
  );
}

function DistributionView({ workId }: { workId: 1 | 2 }) {
  const room = useRoom();
  const token = room.teacherToken;
  const dist = room.events.distribution;
  const data = dist && dist.workId === workId ? dist : null;
  const order = workId === 1 ? WORK1_ORDER : WORK2_ORDER;
  const labels = workId === 1 ? LABELS_W1 : LABELS_W2;

  const [view, setView] = useState<'all' | string>(room.state?.distributionView ?? 'all');

  useEffect(() => {
    if (room.state?.distributionView) setView(room.state.distributionView);
  }, [room.state?.distributionView]);

  function changeView(v: 'all' | string) {
    setView(v);
    if (!token) return;
    room.send({ type: 'T_SET_DISTRIBUTION_VIEW', payload: { token, view: v } });
  }

  const shown =
    view === 'all'
      ? data?.overall ?? {}
      : data?.perClass[view] ?? {};

  return (
    <section className="panel">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">タイプ分布（ワーク{workId}）</h3>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <ViewTab v="all" current={view} onClick={changeView} label="全体" />
        {(room.state?.classes ?? []).map((c) => (
          <ViewTab key={c} v={c} current={view} onClick={changeView} label={c} />
        ))}
      </div>
      {data ? (
        <Distribution
          data={shown}
          order={(shown.balanced ?? 0) > 0 ? [...order, 'balanced'] : [...order]}
          labels={labels}
          colors={COLORS}
        />
      ) : (
        <p className="text-white/60 text-sm">集計中…</p>
      )}
    </section>
  );
}

function ViewTab({
  v,
  current,
  onClick,
  label,
}: {
  v: 'all' | string;
  current: string;
  onClick: (v: 'all' | string) => void;
  label: string;
}) {
  const active = current === v;
  return (
    <button
      onClick={() => onClick(v)}
      className={`rounded-lg px-3 py-1 text-sm border ${
        active ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/15 bg-white/5'
      }`}
    >
      {label}
    </button>
  );
}
