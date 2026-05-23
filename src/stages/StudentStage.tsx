import { useRoom } from '../RoomContext';

export default function StudentStage() {
  const room = useRoom();
  const phase = room.phase;

  if (phase === 'lobby' || phase.startsWith('stage0')) {
    return (
      <Center>
        <h2 className="text-2xl font-bold mb-2">入室しました</h2>
        <p className="text-white/70">講師の合図をお待ちください。</p>
        <p className="text-white/40 text-xs mt-6">クラス：{room.self?.className ?? '-'}</p>
      </Center>
    );
  }

  if (phase === 'stage1_active' || phase === 'stage2_active') {
    return (
      <Center>
        <h2 className="text-2xl font-bold mb-2">
          {phase === 'stage1_active' ? 'ワーク1' : 'ワーク2'} ─ 回答画面
        </h2>
        <p className="text-white/60 text-sm">
          診断UIは Phase 2 で実装します。
        </p>
      </Center>
    );
  }

  if (phase === 'closed') {
    return (
      <Center>
        <h2 className="text-2xl font-bold mb-2">セッション終了</h2>
        <p className="text-white/70">お疲れさまでした。</p>
      </Center>
    );
  }

  return (
    <Center>
      <p className="text-white/70">フェーズ：{phase}</p>
      <p className="text-white/40 text-sm mt-2">講師の合図をお待ちください。</p>
    </Center>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="panel max-w-md w-full text-center">{children}</div>
    </main>
  );
}
