import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRoom } from '../RoomContext';
import { clearRoomBinding, ensureRoom, loadState, patchState } from '../lib/storage';
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

  // Keep the local `code` state in sync with the URL so that visiting a new
  // room URL in the same tab (e.g. after the teacher started a fresh
  // session) actually picks up the new code instead of staying on the old
  // one that was captured by the initial useState.
  useEffect(() => {
    if (queryRoom && /^[0-9]{6}$/.test(queryRoom) && queryRoom !== code) {
      setCode(queryRoom);
    }
  }, [queryRoom, code]);

  // Connect whenever the code becomes valid or changes. connectToRoom closes
  // the existing socket first, so it's safe to call on every code change.
  useEffect(() => {
    if (code && /^[0-9]{6}$/.test(code)) {
      room.connectToRoom(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const classes = useMemo(() => room.state?.classes ?? [], [room.state]);

  // Reset selected class if it isn't in the teacher's list anymore.
  useEffect(() => {
    if (classes.length > 0 && className && !classes.includes(className)) {
      setClassName('');
    }
  }, [classes, className]);

  function handleJoin(targetClass?: string) {
    const cls = targetClass ?? className;
    if (!code || !cls) return;
    // If the student is joining a *different* room than last time, wipe out
    // stale work1/work2/comment so they don't see fake results.
    const fresh = ensureRoom(code);
    if (cls !== className) setClassName(cls);
    patchState({ className: cls });
    room.send({
      type: 'S_JOIN',
      payload: { code, className: cls, sid: fresh.sid },
    });
    setJoined(true);
  }

  // Auto-rejoin after reload / phone-resume: if we already know the room code
  // and the class from a previous session, jump straight back to StudentStage
  // without forcing the user through the join form again. Skipped once the
  // room has been closed so a finished session doesn't drag the student back
  // in.
  useEffect(() => {
    if (joined) return;
    if (room.state?.phase === 'closed') return;
    if (room.self && room.state) {
      setJoined(true);
      return;
    }
    const stored = loadState();
    if (
      stored.roomCode === code &&
      stored.className &&
      classes.length > 0 &&
      classes.includes(stored.className) &&
      room.status === 'open'
    ) {
      handleJoin(stored.className);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes, code, room.status, room.self, room.state, joined]);

  // When the teacher ends the session, wipe the local room binding so a
  // subsequent reload comes up on the empty join form instead of silently
  // reconnecting to the now-closed room.
  useEffect(() => {
    if (room.state?.phase === 'closed') {
      clearRoomBinding();
    }
  }, [room.state?.phase]);

  // Reset the join flag whenever the room code changes so a tab that's
  // already been "joined" to one room doesn't bypass the join form when the
  // user navigates to a different room (e.g. after the teacher closed the
  // previous session and started a new one).
  useEffect(() => {
    setJoined(false);
  }, [code]);

  // Mirror server's `self` into local `joined` so a reconnect that gets a
  // fresh JOINED payload also flips us out of the form.
  useEffect(() => {
    if (room.self && room.state) setJoined(true);
  }, [room.self, room.state]);

  const statusLabel: Record<typeof room.status, string> = {
    idle: 'コードを入力してね',
    connecting: '接続中…',
    open: classes.length === 0 ? 'ルーム情報を取得中…' : '入室する',
    closed: '接続が切れました。再接続中…',
    error: '接続エラー。再接続中…',
  };

  // After the user pressed "入室", show an explicit loading screen until the
  // server's JOINED response brings room.state back. This avoids the silent
  // "click does nothing" case where the form would otherwise re-render
  // identically and the student would think the button is broken.
  if (joined && !room.state) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="panel max-w-md w-full text-center">
          <div className="text-5xl mb-3 animate-pulse">⚡</div>
          <h2 className="text-xl font-bold mb-2">入室中…</h2>
          <p className="text-white/60 text-sm">
            少し時間がかかる場合があります（最大10秒）
          </p>
        </div>
      </main>
    );
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
            onClick={() => handleJoin()}
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
