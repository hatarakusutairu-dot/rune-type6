import { useEffect, useRef, useState } from 'react';
import { useRoom } from '../RoomContext';
import type { Phase } from '@shared/protocol';

const EXPLAIN_LABEL: Record<string, { name: string; color: string; emoji: string }> = {
  stage1_explain_1: { name: 'コンペティター', color: '#FF4444', emoji: '⚔️' },
  stage1_explain_2: { name: 'アチーバー', color: '#FFD700', emoji: '🏆' },
  stage1_explain_3: { name: 'ソーシャライザー', color: '#00E676', emoji: '🤝' },
  stage1_explain_4: { name: 'エクスプローラー', color: '#448AFF', emoji: '🧭' },
  stage1_explain_5: { name: 'バランス型', color: '#C0C0C0', emoji: '🎛️' },
  stage2_explain_1: { name: 'アタッカー', color: '#FF6D00', emoji: '🔥' },
  stage2_explain_2: { name: 'ガーディアン', color: '#00BCD4', emoji: '🛡️' },
  stage2_explain_3: { name: 'アナリスト', color: '#AA00FF', emoji: '🔍' },
  stage2_explain_4: { name: 'ブースター', color: '#FF4081', emoji: '✨' },
  stage2_explain_5: { name: 'バランス型', color: '#C0C0C0', emoji: '🎛️' },
};

export default function CharacterCheckButton() {
  const room = useRoom();
  const phase = room.phase;
  const info = EXPLAIN_LABEL[phase];
  const [pressedPhases, setPressedPhases] = useState<Set<string>>(new Set());
  const lastSentPhaseRef = useRef<string | null>(null);

  // Reset visual when leaving an explain phase to a non-explain one.
  useEffect(() => {
    if (!info) lastSentPhaseRef.current = null;
  }, [info]);

  if (!info) return null;
  if (room.role !== 'student') return null;

  const pressed = pressedPhases.has(phase);

  function press() {
    if (pressed) return;
    room.send({ type: 'S_CHARACTER_CHECK', payload: { phase: phase as Phase } });
    setPressedPhases((s) => new Set(s).add(phase));
    lastSentPhaseRef.current = phase;
  }

  return (
    <div
      className="fixed inset-x-0 z-30 pointer-events-none"
      style={{ bottom: 'calc(80px + env(safe-area-inset-bottom))' }}
    >
      <div className="px-4 pb-2 pointer-events-auto max-w-xl mx-auto">
        <button
          onClick={press}
          disabled={pressed}
          className="w-full rounded-2xl py-4 font-black text-xl transition-all active:scale-[0.97] disabled:opacity-100"
          style={{
            background: pressed
              ? `linear-gradient(135deg, ${info.color}66, ${info.color}33)`
              : `linear-gradient(135deg, ${info.color}, ${info.color}cc)`,
            boxShadow: pressed
              ? `0 0 16px ${info.color}66`
              : `0 0 28px ${info.color}aa, inset 0 0 14px ${info.color}44`,
            color: 'white',
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            border: `2px solid ${info.color}`,
          }}
        >
          {pressed ? (
            <span className="flex items-center justify-center gap-2">
              <span className="text-2xl">✓</span>
              <span>押した！</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span className="text-3xl">{info.emoji}</span>
              <span>わたしは {info.name}！</span>
            </span>
          )}
        </button>
        <p className="text-center text-white/50 text-xs mt-2">
          自分がこのキャラだったら押してね
        </p>
      </div>
    </div>
  );
}
