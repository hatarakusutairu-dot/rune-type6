import { useEffect, useRef, useState } from 'react';
import { useRoom } from '../RoomContext';

const EXPLAIN_INFO: Record<string, { name: string; color: string; emoji: string }> = {
  stage1_explain_1: { name: 'コンペティター', color: '#FF4444', emoji: '⚔️' },
  stage1_explain_2: { name: 'アチーバー', color: '#FFD700', emoji: '🏆' },
  stage1_explain_3: { name: 'ソーシャライザー', color: '#00E676', emoji: '🤝' },
  stage1_explain_4: { name: 'エクスプローラー', color: '#448AFF', emoji: '🧭' },
  stage2_explain_1: { name: 'アタッカー', color: '#FF6D00', emoji: '🔥' },
  stage2_explain_2: { name: 'ガーディアン', color: '#00BCD4', emoji: '🛡️' },
  stage2_explain_3: { name: 'アナリスト', color: '#AA00FF', emoji: '🔍' },
  stage2_explain_4: { name: 'ブースター', color: '#FF4081', emoji: '✨' },
};

interface Burst {
  id: number;
  x: number;
  driftX: number;
  rotate: number;
  duration: number;
}

let nextBurstId = 0;

export default function CharacterPressCounter() {
  const room = useRoom();
  const phase = room.phase;
  const info = EXPLAIN_INFO[phase];
  const count = room.state?.characterPressCounts?.[phase] ?? 0;
  const last = room.events.lastCharacterPress;

  const [pop, setPop] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const seenSeqRef = useRef<Set<number>>(new Set());
  const initRef = useRef(false);

  // Pop animation on count increase for the current phase.
  useEffect(() => {
    if (!info) return;
    setPop(true);
    const t = window.setTimeout(() => setPop(false), 350);
    return () => clearTimeout(t);
  }, [count, info]);

  // Spawn one floating burst per fresh press event on the current phase.
  useEffect(() => {
    if (!info) return;
    if (!last) return;
    if (last.phase !== phase) return;
    if (!initRef.current) {
      initRef.current = true;
      seenSeqRef.current.add(last.seq);
      return;
    }
    if (seenSeqRef.current.has(last.seq)) return;
    seenSeqRef.current.add(last.seq);

    const burst: Burst = {
      id: ++nextBurstId,
      x: 6 + Math.random() * 88,
      driftX: -80 + Math.random() * 160,
      rotate: -25 + Math.random() * 50,
      duration: 2600 + Math.random() * 800,
    };
    setBursts((b) => [...b, burst]);
    const timer = window.setTimeout(() => {
      setBursts((b) => b.filter((x) => x.id !== burst.id));
    }, burst.duration + 200);
    return () => clearTimeout(timer);
  }, [last?.seq, last?.phase, phase, info]);

  // Reset init flag when leaving an explain phase.
  useEffect(() => {
    if (!info) initRef.current = false;
  }, [info]);

  if (!info) return null;

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-8 mt-6"
      style={{
        background: `radial-gradient(circle at 50% 0%, ${info.color}33, transparent 70%), linear-gradient(180deg, #0d1117, #1a1f2e)`,
        border: `2px solid ${info.color}55`,
        boxShadow: `0 0 60px ${info.color}22, inset 0 0 24px ${info.color}11`,
      }}
    >
      <div className="text-center">
        <div className="text-white/60 text-sm mb-1">「わたしや！」って押した人</div>
        <div
          className="font-black tabular-nums leading-none transition-transform"
          style={{
            fontSize: 'clamp(72px, 18vw, 220px)',
            color: info.color,
            textShadow: `0 0 40px ${info.color}aa, 0 0 80px ${info.color}66`,
            transform: pop ? 'scale(1.18)' : 'scale(1)',
            transitionDuration: '300ms',
            transitionTimingFunction: 'cubic-bezier(.34,1.56,.64,1)',
          }}
        >
          {count}
        </div>
        <div className="text-2xl font-bold mt-2" style={{ color: info.color }}>
          <span className="mr-2">{info.emoji}</span>
          {info.name}
        </div>
      </div>

      {count > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-6 max-h-40 overflow-hidden">
          {Array.from({ length: Math.min(count, 60) }).map((_, i) => (
            <span
              key={i}
              className="text-3xl"
              style={{
                animation: `character-pop 400ms ease-out both`,
                animationDelay: `${Math.min(i * 30, 800)}ms`,
              }}
            >
              {info.emoji}
            </span>
          ))}
          {count > 60 && (
            <span className="text-white/70 text-lg self-center ml-2">+{count - 60}</span>
          )}
        </div>
      )}

      <div className="pointer-events-none absolute inset-0">
        {bursts.map((b) => (
          <span
            key={b.id}
            className="absolute text-5xl"
            style={{
              left: `${b.x}%`,
              bottom: '-60px',
              ['--cp-drift' as never]: `${b.driftX}px`,
              ['--cp-rotate' as never]: `${b.rotate}deg`,
              animation: `character-float ${b.duration}ms cubic-bezier(.25,.5,.25,1) forwards`,
              filter: `drop-shadow(0 0 16px ${info.color})`,
            }}
          >
            {info.emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
