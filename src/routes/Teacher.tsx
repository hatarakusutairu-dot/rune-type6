import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useRoom } from '../RoomContext';
import { createRoom } from '../lib/sync';
import TeacherStage from '../stages/TeacherStage';

export default function Teacher() {
  const room = useRoom();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    room.setRole('teacher');
  }, [room]);

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      const { code, teacherToken } = await createRoom();
      room.setTeacherToken(teacherToken);
      room.setCode(code);
      room.connectToRoom(code);
      // Once connected, send T_CREATE_ROOM to claim teacher role on the WS.
      // We rely on the open event; do a small retry until the socket is OPEN.
      const start = Date.now();
      const tryClaim = () => {
        if (Date.now() - start > 5000) return;
        if (room.status === 'open' || true) {
          room.send({ type: 'T_CREATE_ROOM', payload: {} });
        }
      };
      setTimeout(tryClaim, 200);
      setTimeout(tryClaim, 600);
      setTimeout(tryClaim, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  }

  if (!room.code) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="panel max-w-md w-full text-center">
          <h1 className="text-3xl font-black mb-4">講師モード</h1>
          <p className="text-white/70 mb-6">
            セッションを作成すると、6桁のルームコードとQRコードが表示されます。
          </p>
          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? '作成中…' : 'セッション作成'}
          </button>
          {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
        </div>
      </main>
    );
  }

  if (!room.state) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="panel max-w-2xl w-full text-center">
          <h1 className="text-3xl font-black mb-4">接続中…</h1>
          <p className="text-white/70">ルームコード <span className="font-mono">{room.code}</span></p>
          <JoinQR code={room.code} />
        </div>
      </main>
    );
  }

  return <TeacherStage />;
}

export function JoinQR({ code }: { code: string }) {
  const url = `${location.origin}/?room=${code}`;
  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <div className="bg-white p-3 rounded-lg">
        <QRCodeSVG value={url} size={200} />
      </div>
      <code className="text-white/70 text-sm break-all">{url}</code>
    </div>
  );
}
