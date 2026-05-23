import { useEffect, useState } from 'react';
import { useRoom } from '../RoomContext';
import {
  BUILTIN_REACTIONS,
  imageUrlFor,
  isImageKey,
  loadCustomReactions,
  type ReactionItem,
} from '../lib/reactions';

const COOLDOWN_MS = 500;

export default function ReactionBar() {
  const room = useRoom();
  const [custom, setCustom] = useState<ReactionItem[]>([]);
  const [lastSentAt, setLastSentAt] = useState(0);
  const [pressed, setPressed] = useState<string | null>(null);

  const visible = room.status === 'open' || room.status === 'connecting';

  useEffect(() => {
    void loadCustomReactions().then(setCustom);
  }, []);

  function send(key: string) {
    const now = Date.now();
    if (now - lastSentAt < COOLDOWN_MS) return;
    setLastSentAt(now);
    room.send({ type: 'REACTION', payload: { emoji: key } });
    setPressed(key);
    window.setTimeout(() => setPressed((p) => (p === key ? null : p)), 300);
  }

  if (!visible) return null;

  const reactions = [...BUILTIN_REACTIONS, ...custom];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-bg-900/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-lg items-center gap-2 overflow-x-auto px-3 py-2">
        <span className="hidden sm:inline text-xs text-white/40 mr-2 whitespace-nowrap">REACT</span>
        {reactions.map((r) => {
          const isPressed = pressed === r.key;
          return (
            <button
              key={r.key}
              onClick={() => send(r.key)}
              title={r.label ?? r.key}
              aria-label={r.label ?? r.key}
              className={`flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl border transition-all ${
                isPressed
                  ? 'border-cyan-300 bg-cyan-300/20 scale-110 shadow-neon'
                  : 'border-white/15 bg-white/10 hover:bg-white/20 active:scale-95'
              }`}
            >
              {isImageKey(r.key) ? (
                <img
                  src={imageUrlFor(r.key)}
                  alt={r.label ?? r.key}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = '0.2';
                  }}
                />
              ) : (
                <span className="text-3xl leading-none">{r.key}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
