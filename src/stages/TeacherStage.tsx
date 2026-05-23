import { useRoom } from '../RoomContext';
import { JoinQR } from '../routes/Teacher';

const PHASE_LABELS: Record<string, string> = {
  lobby: 'ロビー',
  stage0_rules: 'ルール',
  stage0_theme: 'テーマ',
  stage0_flow: '今日の流れ',
  stage1_active: 'ワーク1 回答中',
  stage1_results: 'ワーク1 結果',
  stage1_explain_1: '解説 コンペティター',
  stage1_explain_2: '解説 アチーバー',
  stage1_explain_3: '解説 ソーシャライザー',
  stage1_explain_4: '解説 エクスプローラー',
  stage1_bridge: 'ブリッジ',
  stage2_active: 'ワーク2 回答中',
  stage2_results: 'ワーク2 結果',
  stage2_explain_1: '解説 アタッカー',
  stage2_explain_2: '解説 ガーディアン',
  stage2_explain_3: '解説 アナリスト',
  stage2_explain_4: '解説 ブースター',
  stage3_summary: 'クロス集計',
  stage3_share: '共有タイム',
  stage3_comment: '感想入力',
  stage3_wordcloud: 'ワードクラウド',
  stage3_closing: 'まとめ',
  closed: '終了',
};

export default function TeacherStage() {
  const room = useRoom();
  const token = room.teacherToken;

  function next() {
    if (!token) return;
    room.send({ type: 'T_NEXT_PHASE', payload: { token } });
  }
  function endActive() {
    if (!token) return;
    room.send({ type: 'T_END_ACTIVE', payload: { token } });
  }
  function close() {
    if (!token) return;
    if (!confirm('セッションを終了しますか？')) return;
    room.send({ type: 'T_CLOSE_ROOM', payload: { token } });
  }

  const phase = room.phase;
  const isActive = phase === 'stage1_active' || phase === 'stage2_active';

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black">TYPE SCANNER ─ 講師モード</h1>
            <p className="text-white/60 text-sm">
              ルーム <span className="font-mono">{room.code}</span> ／ 接続 {room.status}
            </p>
          </div>
          <div className="flex gap-2">
            {isActive && (
              <button className="btn-ghost" onClick={endActive}>
                締切
              </button>
            )}
            <button className="btn-primary" onClick={next} disabled={phase === 'closed'}>
              次へ →
            </button>
            <button className="btn-ghost" onClick={close}>
              終了
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
        <h3 className="text-xl font-bold mb-3">参加者を待っています</h3>
        <p className="text-white/70 mb-4">
          現在の入室者：<span className="font-bold">{room.studentCount}</span> 名
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {(room.state?.classes ?? []).map((c) => (
            <div key={c} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-white/60 text-xs">{c}</div>
              <div className="text-2xl font-bold">{room.perClassCount[c] ?? 0}</div>
            </div>
          ))}
        </div>
        {room.code && <JoinQR code={room.code} />}
      </section>
    );
  }

  if (phase === 'stage1_active' || phase === 'stage2_active') {
    const workId = phase === 'stage1_active' ? 1 : 2;
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
                  <div className="h-3 bg-gradient-to-r from-fuchsia-500 to-cyan-400 rounded" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <h3 className="text-xl font-bold mb-2">準備中</h3>
      <p className="text-white/60 text-sm">
        このフェーズの表示は Phase 2 以降で実装します。
      </p>
    </section>
  );
}
