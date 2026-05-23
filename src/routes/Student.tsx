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

  const classes = useMemo(() => room.state?.classes ?? [], [room.state]);

  // If we have a code in the URL, connect immediately so we can fetch classes/state.
  useEffect(() => {
    if (code && /^[0-9]{6}$/.test(code) && room.status === 'idle') {
      room.connectToRoom(code);
    }
  }, [code, room]);

  function handleJoin() {
    if (!code || !className) return;
    const saved = loadState();
    room.send({
      type: 'S_JOIN',
      payload: { code, className, sid: saved.sid },
    });
    setJoined(true);
  }

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
            className="w-full mb-4 rounded-lg bg-bg-700 border border-white/10 px-3 py-2 font-mono"
          />
          <label className="block text-sm text-white/70 mb-1">クラス</label>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {(classes.length > 0
              ? classes
              : ['梅田第1', '梅田第2', '梅田7F', '名古屋', '岡山']
            ).map((c) => (
              <button
                key={c}
                onClick={() => setClassName(c)}
                className={`rounded-lg px-3 py-2 border ${
                  className === c
                    ? 'border-cyan-400 bg-cyan-400/10'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <button
            onClick={handleJoin}
            disabled={!code || !className || room.status !== 'open'}
            className="btn-primary w-full"
          >
            {room.status === 'open' ? '入室する' : `接続中…(${room.status})`}
          </button>
          {room.lastError && <p className="mt-3 text-red-400 text-sm">{room.lastError}</p>}
        </div>
      </main>
    );
  }

  return <StudentStage />;
}
