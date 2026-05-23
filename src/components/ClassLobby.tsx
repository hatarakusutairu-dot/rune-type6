import { useEffect, useRef, useState } from 'react';

const CLASS_COLORS = ['#FF4081', '#00E676', '#FFD700', '#448AFF', '#AA00FF', '#FF6D00', '#00BCD4'];
const CLASS_ICONS = ['🎮', '🕹️', '👾', '🎯', '🚀', '⚡', '🔥', '🎲', '💎', '🛸'];
const PLAYER_ICONS = ['🧑‍🎤', '🧑‍🚀', '🧑‍🎓', '🥷', '🦸', '🧙', '🦹', '🤖', '👽', '👻'];

interface Props {
  classes: string[];
  perClassCount: Record<string, number>;
  totalCount: number;
}

export default function ClassLobby({ classes, perClassCount, totalCount }: Props) {
  return (
    <div>
      <TotalBanner total={totalCount} />
      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        {classes.map((c, i) => (
          <ClassRow
            key={c}
            name={c}
            count={perClassCount[c] ?? 0}
            color={CLASS_COLORS[i % CLASS_COLORS.length]}
            icon={CLASS_ICONS[i % CLASS_ICONS.length]}
          />
        ))}
      </div>
    </div>
  );
}

function TotalBanner({ total }: { total: number }) {
  const [bump, setBump] = useState(false);
  const prev = useRef(total);
  useEffect(() => {
    if (total > prev.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 600);
      return () => clearTimeout(t);
    }
    prev.current = total;
  }, [total]);

  return (
    <div className="text-center">
      <p className="text-white/60 text-sm tracking-widest">PLAYERS ENTERED</p>
      <div
        className={`inline-block text-7xl font-black bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-yellow-300 bg-clip-text text-transparent transition-transform ${
          bump ? 'scale-125' : 'scale-100'
        }`}
        style={{ transitionDuration: '300ms' }}
      >
        {total}
      </div>
      <p className="text-white/50 text-xs mt-1">
        {total === 0 ? '誰か入ってきたら光るよ ✨' : 'みんな集まってきた 🎮'}
      </p>
    </div>
  );
}

function ClassRow({
  name,
  count,
  color,
  icon,
}: {
  name: string;
  count: number;
  color: string;
  icon: string;
}) {
  const [pulse, setPulse] = useState(false);
  const prev = useRef(count);
  useEffect(() => {
    if (count > prev.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 700);
      return () => clearTimeout(t);
    }
    prev.current = count;
  }, [count]);

  const maxVisible = 12;
  const visible = Math.min(count, maxVisible);
  const extra = Math.max(0, count - maxVisible);

  return (
    <div
      className="relative rounded-2xl border p-4 overflow-hidden transition-all"
      style={{
        borderColor: count > 0 ? `${color}88` : 'rgba(255,255,255,0.12)',
        background:
          count > 0
            ? `linear-gradient(135deg, ${color}18, transparent 70%)`
            : 'rgba(255,255,255,0.03)',
        boxShadow: pulse ? `0 0 32px ${color}88` : undefined,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <span className="font-bold text-lg">{name}</span>
        </div>
        <div
          className={`text-2xl font-black transition-transform ${pulse ? 'scale-125' : ''}`}
          style={{ color }}
        >
          {count}
          <span className="text-xs text-white/50 ml-1">名</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 min-h-[36px]">
        {Array.from({ length: visible }).map((_, i) => (
          <PlayerChip key={i} index={i} color={color} isNew={pulse && i === visible - 1} />
        ))}
        {extra > 0 && (
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold"
            style={{ background: `${color}33`, color }}
          >
            +{extra}
          </span>
        )}
        {count === 0 && (
          <span className="text-white/30 text-xs self-center">
            まだ誰もいない
          </span>
        )}
      </div>

      <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-1 rounded-full transition-all"
          style={{
            width: `${Math.min(100, count * 8)}%`,
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            boxShadow: count > 0 ? `0 0 8px ${color}` : undefined,
            transitionDuration: '500ms',
          }}
        />
      </div>
    </div>
  );
}

function PlayerChip({
  index,
  color,
  isNew,
}: {
  index: number;
  color: string;
  isNew: boolean;
}) {
  const ico = PLAYER_ICONS[index % PLAYER_ICONS.length];
  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-lg border ${
        isNew ? 'animate-bounce' : ''
      }`}
      style={{
        background: `${color}22`,
        borderColor: `${color}88`,
        boxShadow: isNew ? `0 0 12px ${color}` : undefined,
      }}
    >
      {ico}
    </span>
  );
}
