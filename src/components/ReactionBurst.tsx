import { useEffect, useRef, useState } from 'react';
import { useRoom } from '../RoomContext';
import { imageUrlFor, isImageKey } from '../lib/reactions';

interface Burst {
  id: number;
  key: string;
  x: number;
  driftX: number;
  scale: number;
  rotate: number;
  duration: number;
}

let nextId = 0;

export default function ReactionBurst() {
  const room = useRoom();
  const last = room.events.lastReaction;
  const [bursts, setBursts] = useState<Burst[]>([]);

  const seenSeqRef = useRef<Set<number>>(new Set());
  const initializedRef = useRef(false);

  // Hide reaction bursts on the student device only while they're answering a
  // quiz (stage1_active / stage2_active) so the flying icons don't distract
  // from the questions. Reactions still float on the teacher's big screen
  // throughout, and on every other student phase they keep adding energy.
  const isStudent = room.role === 'student';
  const isAnswering = room.phase === 'stage1_active' || room.phase === 'stage2_active';
  const suppressBurst = isStudent && isAnswering;

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      if (last?.seq) seenSeqRef.current.add(last.seq);
      return;
    }
    if (!last?.seq) return;
    if (seenSeqRef.current.has(last.seq)) return;
    // Always mark this seq as seen, even when suppressed, so a quiz-phase
    // reaction backlog doesn't burst out the moment the student moves on.
    seenSeqRef.current.add(last.seq);
    if (suppressBurst) return;

    if (seenSeqRef.current.size > 200) {
      const arr = Array.from(seenSeqRef.current);
      seenSeqRef.current = new Set(arr.slice(-100));
    }

    const id = ++nextId;
    const burst: Burst = {
      id,
      key: last.emoji,
      x: 8 + Math.random() * 84,
      driftX: -60 + Math.random() * 120,
      scale: 1.0 + Math.random() * 0.5,
      rotate: -20 + Math.random() * 40,
      duration: 5000 + Math.random() * 1800,
    };
    setBursts((prev) => [...prev, burst]);
    const timer = window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, burst.duration + 200);
    return () => clearTimeout(timer);
  }, [last?.seq, last?.emoji, suppressBurst]);

  if (suppressBurst) return null;
  if (bursts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">      {bursts.map((b) => (
        <span
          key={b.id}
          className="absolute"
          style={{
            left: `${b.x}vw`,
            bottom: '-100px',
            ['--drift' as never]: `${b.driftX}px`,
            ['--rotate' as never]: `${b.rotate}deg`,
            ['--scale' as never]: b.scale,
            animation: `reaction-float ${b.duration}ms cubic-bezier(.25,.5,.25,1) forwards`,
            filter:
              'drop-shadow(0 0 20px rgba(255,255,255,0.55)) drop-shadow(0 0 40px rgba(168,85,247,0.4))',
          }}
        >
          {isImageKey(b.key) ? (
            <img
              src={imageUrlFor(b.key)}
              alt=""
              className="w-24 h-24 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-7xl leading-none">{b.key}</span>
          )}
        </span>
      ))}
    </div>
  );
}
