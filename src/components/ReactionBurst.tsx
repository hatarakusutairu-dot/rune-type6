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

  // Track which reaction timestamps we've already turned into bursts.
  // This prevents:
  //  - replaying past reactions when the component remounts (React StrictMode,
  //    route changes that unmount/remount this tree, etc.)
  //  - the React 18 double-invoke of effects firing two bursts per real press
  const seenTsRef = useRef<Set<number>>(new Set());
  const initializedRef = useRef(false);

  useEffect(() => {
    // First pass: record whatever is already in state as "already seen"
    // so we never burst on mount.
    if (!initializedRef.current) {
      initializedRef.current = true;
      if (last?.ts) seenTsRef.current.add(last.ts);
      return;
    }
    if (!last?.ts) return;
    if (seenTsRef.current.has(last.ts)) return;
    seenTsRef.current.add(last.ts);

    // Cap the seen-set size to avoid unbounded growth over a long session.
    if (seenTsRef.current.size > 200) {
      const arr = Array.from(seenTsRef.current);
      seenTsRef.current = new Set(arr.slice(-100));
    }

    const id = ++nextId;
    const burst: Burst = {
      id,
      key: last.emoji,
      x: 10 + Math.random() * 80,
      driftX: -40 + Math.random() * 80,
      scale: 0.9 + Math.random() * 0.5,
      rotate: -25 + Math.random() * 50,
      duration: 2400 + Math.random() * 1200,
    };
    setBursts((prev) => [...prev, burst]);
    const timer = window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, burst.duration + 200);
    return () => clearTimeout(timer);
  }, [last?.ts, last?.emoji]);

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
