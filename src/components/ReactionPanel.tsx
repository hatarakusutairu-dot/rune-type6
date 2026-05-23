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

export default function ReactionPanel() {
  const room = useRoom();
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState<ReactionItem[]>([]);
  const [lastSentAt, setLastSentAt] = useState(0);

  // Show panel only after the room state is loaded (i.e. user is in a room or about to be).
  const visible = room.status === 'open' || room.status === 'connecting';

  useEffect(() => {
    void loadCustomReactions().then(setCustom);
  }, []);

  function send(key: string) {
    const now = Date.now();
    if (now - lastSentAt < COOLDOWN_MS) return;
    setLastSentAt(now);
    room.send({ type: 'REACTION', payload: { emoji: key } });
  }

  if (!visible) return null;

  const reactions = [...BUILTIN_REACTIONS, ...custom];

  return (
    <div className="fixed bottom-4 right-4 z-40 select-none">
      {open && (
        <div className="mb-2 panel !p-3 max-w-[min(88vw,360px)] animate-[fadein_200ms_ease-out]">
          <div className="grid grid-cols-6 gap-2">
            {reactions.map((r) => (
              <button
                key={r.key}
                onClick={() => send(r.key)}
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 hover:bg-white/15 active:scale-95 transition border border-white/10"
                title={r.label ?? r.key}
                aria-label={r.label ?? r.key}
              >
                {isImageKey(r.key) ? (
                  <img
                    src={imageUrlFor(r.key)}
                    alt={r.label ?? r.key}
                    className="w-9 h-9 object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity = '0.2';
                    }}
                  />
                ) : (
                  <span className="text-2xl">{r.key}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-black text-2xl shadow-neon active:scale-95 transition"
        aria-label="リアクション"
      >
        {open ? '×' : '🎉'}
      </button>
    </div>
  );
}
