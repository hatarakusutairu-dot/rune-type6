interface Props {
  items: { text: string; ts: number }[];
}

const CARD_TONES = [
  'from-fuchsia-500/30 to-pink-500/10 border-fuchsia-300/40',
  'from-cyan-500/30 to-sky-500/10 border-cyan-300/40',
  'from-amber-400/30 to-orange-500/10 border-amber-300/40',
  'from-emerald-500/30 to-teal-500/10 border-emerald-300/40',
  'from-violet-500/30 to-indigo-500/10 border-violet-300/40',
  'from-rose-500/30 to-red-500/10 border-rose-300/40',
];

export default function CommentList({ items }: Props) {
  if (!items || items.length === 0) {
    return <p className="text-white/60">まだ感想が集まっていません。</p>;
  }
  const ordered = [...items].sort((a, b) => b.ts - a.ts);
  const cols = ordered.length <= 6 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  return (
    <div className={`grid ${cols} gap-3`}>
      {ordered.map((c, i) => {
        const tone = CARD_TONES[i % CARD_TONES.length];
        return (
          <div
            key={`${c.ts}-${i}`}
            className={`rounded-xl border bg-gradient-to-br ${tone} p-4 shadow-lg animate-[fadein_400ms_ease-out]`}
          >
            <p className="text-white text-base sm:text-lg font-bold leading-snug break-words">
              {c.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
