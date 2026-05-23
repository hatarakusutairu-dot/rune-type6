import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRoom } from '../RoomContext';
import { loadState } from '../lib/storage';
import StudentStage from '../stages/StudentStage';

export default function Student() {
  const room = useRoom();
  const [params] = useSearchParams();
  const queryRoom = params.get('room');
  const [code, setCode] = useState<string>(queryRoom ?? loadState().roomCode ?? '');
  const [className, setClassName] = useState<string>(loadState().className ?? '');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    room.setRole('student');
  }, [room]);

  // If we have a code in the URL, connect immediately so we can fetch classes/state.
  useEffect(() => {
    if (code && /^[0-9]{6}$/.test(code) && room.status === 'idle') {
      room.connectToRoom(code);
    }
  }, [code, room]);

  const classes = useMemo(() => room.state?.classes ?? [], [room.state]);

  // Reset selected class if it isn't in the teacher's list anymore.
  useEffect(() => {
    if (classes.length > 0 && className && !classes.includes(className)) {
      setClassName('');
    }
  }, [classes, className]);

  function handleJoin() {
    if (!code || !className) return;
    const saved = loadState();
    room.send({
      type: 'S_JOIN',
      payload: { code, className, sid: saved.sid },
    });
    setJoined(true);
  }

  const statusLabel: Record<typeof room.status, string> = {
    idle: 'コードを入力してね',
    connecting: '接続中…',
    open: classes.length === 0 ? 'ルーム情報を取得中…' : '入室する',
    closed: '接続が切れました。再接続中…',
    error: '接続エラー。再接続中…',
  };

  if (!joined || !room.state) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="panel max-w-md w-full">
          <h1 className="text-2xl font-black mb-4 text-center">入室</h1>
          <label className="block text-sm text-white/70 mb-1">ルームコード</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            inputMode="numeric"
            placeholder="6桁"
            className="w-full mb-4 rounded-lg bg-bg-700 border border-white/10 px-3 py-2 font-mono text-lg tracking-widest"
          />
          {classes.length > 0 ? (
            <>
              <label className="block text-sm text-white/70 mb-1">クラス</label>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {classes.map((c) => (
                  <button
                    key={c}
                    onClick={() => setClassName(c)}
                    className={`rounded-lg px-3 py-2 border font-bold transition ${
                      className === c
                        ? 'border-cyan-400 bg-cyan-400/15 shadow-neon'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-white/60 text-sm mb-6 text-center">
              {room.status === 'open'
                ? 'クラス情報を取得しています…'
                : 'ルームに接続しています…'}
            </p>
          )}
          <button
            onClick={handleJoin}
            disabled={!code || !className || room.status !== 'open' || classes.length === 0}
            className="btn-primary w-full"
          >
            {room.status === 'open' && classes.length > 0 && className
              ? '入室する'
              : statusLabel[room.status]}
          </button>
          {room.lastError && <p className="mt-3 text-red-400 text-sm">{room.lastError}</p>}
        </div>
      </main>
    );
  }

  return <StudentStage />;
}
