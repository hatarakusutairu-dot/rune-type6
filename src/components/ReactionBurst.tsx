import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!last) return;
    const id = ++nextId;
    const burst: Burst = {
      id,
      key: last.emoji,
      x: 10 + Math.random() * 80, // viewport-% horizontal
      driftX: -40 + Math.random() * 80,
      scale: 0.9 + Math.random() * 0.5,
      rotate: -25 + Math.random() * 50,
      duration: 2400 + Math.random() * 1200,
    };
    setBursts((prev) => [...prev, burst]);
    const timer = setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, burst.duration + 200);
    return () => clearTimeout(timer);
    // last.ts is part of the dependency so each new reaction fires a new burst.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [last?.ts]);

  if (bursts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {bursts.map((b) => (
        <span
          key={b.id}
          className="absolute"
          style={{
            left: `${b.x}vw`,
            bottom: '-80px',
            ['--drift' as never]: `${b.driftX}px`,
            ['--rotate' as never]: `${b.rotate}deg`,
            ['--scale' as never]: b.scale,
            animation: `reaction-float ${b.duration}ms cubic-bezier(.2,.7,.2,1) forwards`,
            filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.35))',
          }}
        >
          {isImageKey(b.key) ? (
            <img
              src={imageUrlFor(b.key)}
              alt=""
              className="w-16 h-16 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-5xl">{b.key}</span>
          )}
        </span>
      ))}
    </div>
  );
}
