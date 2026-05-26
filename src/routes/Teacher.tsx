import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useRoom } from '../RoomContext';
import { createRoom } from '../lib/sync';
import { DEFAULT_CLASSES } from '@shared/protocol';
import TeacherStage from '../stages/TeacherStage';

type Step = 'select' | 'creating' | 'ready';

export default function Teacher() {
  const room = useRoom();
  const [step, setStep] = useState<Step>('select');
  const [selected, setSelected] = useState<string[]>([...DEFAULT_CLASSES]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    room.setRole('teacher');
  }, [room]);

  function toggle(c: string) {
    setSelected((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));
  }

  async function handleCreate() {
    if (selected.length === 0) return;
    setStep('creating');
    setError(null);
    try {
      const { code, teacherToken } = await createRoom(selected);
      room.setTeacherToken(teacherToken);
      room.setCode(code);
      // Arm BEFORE connecting so the very first on-open fires T_CREATE_ROOM, and so do all reconnects.
      room.armTeacherClaim(teacherToken);
      room.connectToRoom(code);
      setStep('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStep('select');
    }
  }

  if (step === 'select') {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="panel max-w-xl w-full">
          <h1 className="text-3xl font-black mb-2 text-center">
            <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
              READY CHECK
            </span>
          </h1>
          <p className="text-white/70 text-center mb-6">今日参加するクラスを選択してね</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {DEFAULT_CLASSES.map((c, i) => {
              const on = selected.includes(c);
              const accent = ['#FF4081', '#00E676', '#FFD700', '#448AFF', '#AA00FF'][i % 5];
              return (
                <button
                  key={c}
                  onClick={() => toggle(c)}
                  className={`relative rounded-xl border-2 p-4 transition-all text-left ${
                    on
                      ? 'bg-white/10 scale-100'
                      : 'bg-white/5 opacity-50 hover:opacity-80 scale-95'
                  }`}
                  style={{
                    borderColor: on ? accent : 'rgba(255,255,255,0.15)',
                    boxShadow: on ? `0 0 24px ${accent}55, inset 0 0 12px ${accent}22` : undefined,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl">{['🎮', '🕹️', '👾', '🎯', '🚀'][i % 5]}</span>
                    <span
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center text-xs font-black ${
                        on ? 'bg-white text-black' : 'border-white/30'
                      }`}
                      style={{ borderColor: on ? accent : undefined }}
                    >
                      {on ? '✓' : ''}
                    </span>
                  </div>
                  <div className="font-bold text-lg">{c}</div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-sm text-white/60 mb-4">
            <span>選択中：{selected.length} クラス</span>
            <button
              onClick={() =>
                setSelected(selected.length === DEFAULT_CLASSES.length ? [] : [...DEFAULT_CLASSES])
              }
              className="underline text-white/50 hover:text-white"
            >
              {selected.length === DEFAULT_CLASSES.length ? '全て解除' : '全て選択'}
            </button>
          </div>

          <button
            onClick={handleCreate}
            disabled={selected.length === 0}
            className="btn-primary w-full text-lg disabled:opacity-30"
          >
            🚀 セッション開始
          </button>
          {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
        </div>
      </main>
    );
  }

  if (step === 'creating' || !room.state) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="panel max-w-md w-full text-center">
          <div className="text-6xl mb-4 animate-pulse">⚡</div>
          <h1 className="text-2xl font-black mb-2">起動中…</h1>
          <p className="text-white/60 text-sm">
            ルームコード <span className="font-mono">{room.code ?? '------'}</span>
          </p>
        </div>
      </main>
    );
  }

  return <TeacherStage />;
}

export function JoinQR({ code }: { code: string }) {
  const url = `${location.origin}/?room=${code}`;
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignored
    }
  }

  return (
    <div className="mt-6 flex flex-col lg:flex-row items-center gap-6 justify-center">
      <div className="bg-white p-4 rounded-2xl shadow-neon">
        <QRCodeSVG value={url} size={220} />
      </div>
      <div className="text-center lg:text-left max-w-sm">
        <div className="text-white/50 text-xs mb-1">ルームコード</div>
        <div className="font-mono text-5xl font-black tracking-widest mb-4 bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
          {code}
        </div>
        <div className="text-white/50 text-xs mb-1">URL</div>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm rounded-lg bg-bg-700 border border-white/10 px-3 py-2 break-all">
            {url}
          </code>
          <button onClick={copy} className="btn-ghost whitespace-nowrap">
            {copied ? '✓ コピー済' : '📋 コピー'}
          </button>
        </div>
      </div>
    </div>
  );
}
