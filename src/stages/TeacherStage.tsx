import { useRoom } from '../RoomContext';
import { JoinQR } from '../routes/Teacher';
import Distribution from '../components/Distribution';
import CrossMatrix from '../components/CrossMatrix';
import CommentList from '../components/CommentList';
import Countdown from '../components/Countdown';
import TypeSlide from '../components/TypeSlide';
import ClassLobby from '../components/ClassLobby';
import CharacterPressCounter from '../components/CharacterPressCounter';
import SlideImage from '../components/SlideImage';
import SurveyQR from '../components/SurveyQR';
import { WORK1_ORDER, WORK2_ORDER } from '../lib/scoreUtils';

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
  stage1_explain_5: '解説 バランス型',
  stage1_bridge: 'ブリッジ',
  stage2_work2title: 'WORK2 タイトル',
  stage2_work2: 'WORK2 説明',
  stage2_active: 'ワーク2 回答中',
  stage2_results: 'ワーク2 結果',
  stage2_explain_1: '解説 アタッカー',
  stage2_explain_2: '解説 ガーディアン',
  stage2_explain_3: '解説 アナリスト',
  stage2_explain_4: '解説 ブースター',
  stage2_explain_5: '解説 バランス型',
  stage3_type: '総合タイトル',
  stage3_summary: 'クロス集計',
  stage3_share: '共有タイム',
  stage3_comment: '感想入力',
  stage3_wordcloud: 'みんなの感想',
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
  balanced: '#C0C0C0',
};

const EXPLAIN_TYPE_W1: Record<string, string> = {
  stage1_explain_1: 'competitor',
  stage1_explain_2: 'achiever',
  stage1_explain_3: 'socializer',
  stage1_explain_4: 'explorer',
  stage1_explain_5: 'balanced_w1',
};
const EXPLAIN_TYPE_W2: Record<string, string> = {
  stage2_explain_1: 'attacker',
  stage2_explain_2: 'guardian',
  stage2_explain_3: 'analyst',
  stage2_explain_4: 'booster',
  stage2_explain_5: 'balanced_w2',
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
      <div className="space-y-6">
        <SlideImage phase="stage0_work1title" fallback={null} />
        <WorkIntroSlide
          badge="WORK 1"
          title="ゲーマータイプ診断"
          description="普段ゲームをやるときの『楽しみ方の傾向』を4タイプに分けて見える化します。勝つこと？上達？仲間？新しい発見？——20問の質問に直感で答えてもらいます。"
          bullets={['20問・直感でOK', '一度選ぶと戻れません', '正解はありません']}
        />
      </div>
    );
  }

  if (phase === 'stage0_work1') {
    return (
      <div className="space-y-6">
        <SlideImage phase="stage0_work1" fallback={null} />
        <section className="panel">
          <p className="text-white/40 text-sm mb-3 tracking-widest">WORK 1 ─ 進め方</p>
          <p className="text-white/85 text-lg leading-relaxed mb-4">
            スマホ／PCから20問の質問に答えてもらいます。直感で大丈夫、正解はありません。
          </p>
          <ul className="text-white/75 text-base space-y-2">
            <li>・1問ずつ進行（選ぶと次へ）</li>
            <li>・一度選んだ答えは戻せません</li>
            <li>・全員揃ったら「締切」を押して結果フェーズへ</li>
          </ul>
        </section>
      </div>
    );
  }

  if (phase === 'stage2_work2title') {
    return (
      <div className="space-y-6">
        <SlideImage phase="stage2_work2title" fallback={null} />
        <WorkIntroSlide
          badge="WORK 2"
          title="危機対応タイプ診断"
          description="チームでピンチになったときに自分はどう動くタイプかを診断します。『攻める／守る／分析する／励ます』——4つの危機対応パターンから自分の傾向を見える化。"
          bullets={['想像で答えてOK', '20問・直感で', '間違いはありません']}
        />
      </div>
    );
  }

  if (phase === 'stage2_work2') {
    return (
      <div className="space-y-6">
        <SlideImage phase="stage2_work2" fallback={null} />
        <section className="panel">
          <p className="text-white/40 text-sm mb-3 tracking-widest">WORK 2 ─ 進め方</p>
          <p className="text-white/85 text-lg leading-relaxed mb-4">
            ここからは <span className="font-bold">チームでピンチになった場面</span>{' '}
            を想像して答えてもらいます。チーム経験がなくても大丈夫。
            「もしそうなったら自分はどうするかな？」と想像で選んでOK。
          </p>
          <ul className="text-white/75 text-base space-y-2">
            <li>・想像で答えてOK</li>
            <li>・20問・直感で</li>
            <li>・間違いはありません</li>
          </ul>
        </section>
      </div>
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
      <div className="space-y-6">
        <SlideImage phase="stage0_rules" fallback={null} />
        <section className="panel">
          <p className="text-white/40 text-sm mb-4 tracking-widest text-center">
            RULES ─ きょうのルール
          </p>
          <ol className="space-y-4 text-lg">
            <li className="flex gap-3">
              <span className="text-cyan-400 font-black text-2xl leading-none">①</span>
              <span className="text-white/90">
                診断結果に良い悪いはない。全部チームに必要なタイプ
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-400 font-black text-2xl leading-none">②</span>
              <span className="text-white/90">否定しない・笑わない</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-400 font-black text-2xl leading-none">③</span>
              <span className="text-white/90">ここだけの話</span>
            </li>
          </ol>
        </section>
      </div>
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
      <div className="space-y-6">
        <SlideImage phase="stage0_flow" fallback={null} />
        <section className="panel">
          <p className="text-white/40 text-sm mb-4 tracking-widest text-center">
            TODAY'S FLOW ─ きょうの流れ
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-4">
              <span className="text-pink-400 font-black w-20 shrink-0">WORK 1</span>
              <div>
                <div className="font-bold text-white/90">ゲーマータイプ診断</div>
                <div className="text-white/60 text-sm">自分の楽しみ方を知る</div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-fuchsia-400 font-black w-20 shrink-0">WORK 2</span>
              <div>
                <div className="font-bold text-white/90">危機対応タイプ診断</div>
                <div className="text-white/60 text-sm">ピンチの自分を知る</div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-yellow-300 font-black w-20 shrink-0">TOTAL</span>
              <div>
                <div className="font-bold text-white/90">総合分析</div>
                <div className="text-white/60 text-sm">
                  2つを掛け合わせた、生徒それぞれだけの結果
                </div>
              </div>
            </li>
          </ul>
        </section>
      </div>
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
          <section className="panel text-center bg-gradient-to-br from-fuchsia-500/10 via-violet-500/5 to-cyan-400/10 border-fuchsia-300/30">
            <p className="text-white/50 text-xs tracking-[0.4em] mb-2">BRIDGE</p>
            <h2 className="text-6xl font-black mb-6 bg-gradient-to-r from-fuchsia-400 via-rose-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(255,64,129,0.3)]">
              次は WORK 2
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 max-w-3xl mx-auto mb-6">
              <div className="panel bg-white/5 border-white/10">
                <p className="text-white/50 text-xs mb-1">WORK 1</p>
                <p className="text-lg font-bold">普段の向き合い方</p>
              </div>
              <div className="text-4xl font-black text-white/60">×</div>
              <div className="panel bg-white/5 border-white/10">
                <p className="text-white/50 text-xs mb-1">WORK 2</p>
                <p className="text-lg font-bold">ピンチでの動き</p>
              </div>
            </div>
            <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto">
              2つを掛け合わせると、<br />
              <span className="font-black text-white">
                生徒それぞれのプレイヤータイプ
              </span>
              が見えてくる。
            </p>
          </section>
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
      <div className="space-y-6">
        <SlideImage
          phase="stage3_comment"
          fallback={
            <Slide title="今日の感想を一言で">
              <p className="text-white/80">
                スマホから感想を送ってください。次の画面でみんなの感想が表示されます。
              </p>
            </Slide>
          }
        />
        <section className="panel">
          <div className="text-center mb-6">
            <div className="text-6xl mb-2">
              <Countdown seconds={90} />
            </div>
          </div>
          <CommentProgressBars />
        </section>
      </div>
    );
  }

  if (phase === 'stage3_wordcloud') {
    const items = room.events.commentList?.items ?? [];
    return (
      <section className="panel">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-2xl font-black">みんなの感想</h3>
          <p className="text-white/60 text-sm">{items.length} 件 / {room.studentCount} 名</p>
        </div>
        <CommentList items={items} />
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
    <section className="panel text-center">
      <p className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-500/40 to-cyan-400/40 text-white text-sm font-black tracking-widest mb-4">
        {badge}
      </p>
      <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
        {title}
      </h2>
      <p className="text-white/85 text-lg leading-relaxed max-w-2xl mx-auto mb-6 whitespace-pre-line">
        {description}
      </p>
      {bullets && bullets.length > 0 && (
        <ul className="inline-flex flex-wrap gap-3 justify-center text-white/70 text-sm">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="px-3 py-1 rounded-full bg-white/5 border border-white/10"
            >
              ・{b}
            </li>
          ))}
        </ul>
      )}
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

function CommentProgressBars() {
  const room = useRoom();
  const progress = room.events.commentProgress;
  const classes = room.state?.classes ?? [];
  const overallCount = progress?.count ?? 0;
  const overallTotal = progress?.total ?? room.studentCount;
  const overallPct = overallTotal ? Math.round((overallCount / overallTotal) * 100) : 0;
  const rankedClasses = classes
    .map((c) => {
      const row = progress?.perClass[c] ?? { count: 0, total: room.perClassCount[c] ?? 0 };
      const pct = row.total ? Math.round((row.count / row.total) * 100) : 0;
      return { name: c, count: row.count, total: row.total, pct };
    })
    .sort((a, b) => b.pct - a.pct || b.count - a.count);
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm text-white/80 mb-1">
          <span className="font-bold">全体</span>
          <span>
            {overallCount}/{overallTotal}（{overallPct}%）
          </span>
        </div>
        <div className="h-4 bg-white/10 rounded">
          <div
            className="h-4 bg-gradient-to-r from-fuchsia-500 to-cyan-400 rounded transition-[width] duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        {rankedClasses.map((row, i) => {
          const rank = row.total > 0 ? i + 1 : null;
          const isTop = rank === 1 && row.count > 0;
          return (
            <div key={row.name}>
              <div className="flex justify-between text-sm text-white/70 mb-1">
                <span className={isTop ? 'font-bold text-amber-300' : ''}>
                  {rank ? `${rank}位` : '-'} {row.name}
                  {isTop ? ' 👑' : ''}
                </span>
                <span>
                  {row.count}/{row.total}（{row.pct}%）
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded">
                <div
                  className={`h-3 rounded transition-[width] duration-500 ${
                    isTop
                      ? 'bg-gradient-to-r from-amber-400 to-rose-400'
                      : 'bg-gradient-to-r from-fuchsia-500 to-cyan-400'
                  }`}
                  style={{ width: `${row.pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DistributionView({ workId }: { workId: 1 | 2 }) {
  const room = useRoom();
  const dist = room.events.distribution;
  const data = dist && dist.workId === workId ? dist : null;
  const order = workId === 1 ? WORK1_ORDER : WORK2_ORDER;
  const labels = workId === 1 ? LABELS_W1 : LABELS_W2;
  const classes = room.state?.classes ?? [];

  function orderFor(d: Record<string, number>) {
    return (d.balanced ?? 0) > 0 ? [...order, 'balanced'] : [...order];
  }

  return (
    <div className="space-y-4">
      <section className="panel">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-2xl font-black">タイプ分布（ワーク{workId}）— 全体</h3>
          {data && (
            <span className="text-white/60 text-sm">
              {Object.values(data.overall).reduce((a, b) => a + b, 0)} 名
            </span>
          )}
        </div>
        {data ? (
          <Distribution
            data={data.overall}
            order={orderFor(data.overall)}
            labels={labels}
            colors={COLORS}
          />
        ) : (
          <p className="text-white/60 text-sm">集計中…</p>
        )}
      </section>

      {data && classes.length > 0 && (
        <section className="panel">
          <h3 className="text-lg font-bold mb-4 text-white/80">クラス別</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {classes.map((c) => {
              const d = data.perClass[c] ?? {};
              const total = Object.values(d).reduce((a, b) => a + b, 0);
              return (
                <div key={c}>
                  <div className="flex items-baseline justify-between mb-2">
                    <h4 className="font-bold text-base">{c}</h4>
                    <span className="text-white/50 text-xs">{total} 名</span>
                  </div>
                  {total > 0 ? (
                    <Distribution data={d} order={orderFor(d)} labels={labels} colors={COLORS} />
                  ) : (
                    <p className="text-white/40 text-sm">回答なし</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

