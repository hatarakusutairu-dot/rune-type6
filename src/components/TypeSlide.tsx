import { typeInfo } from '../data/typeInfo';

interface Props {
  typeId: string;
}

export default function TypeSlide({ typeId }: Props) {
  const t = typeInfo[typeId];
  if (!t) return null;
  return (
    <article
      className="rounded-2xl border p-8"
      style={{ borderColor: `${t.color}66`, background: `${t.color}10` }}
    >
      <header className="mb-6">
        <p className="text-white/50 text-sm">{t.nameEn}</p>
        <h2 className="text-5xl font-black" style={{ color: t.color }}>
          {t.name}
        </h2>
        {t.catchcopy && <p className="text-white/80 mt-2 text-lg">{t.catchcopy}</p>}
      </header>
      {t.description && (
        <p className="text-white/90 mb-6 leading-relaxed">{t.description}</p>
      )}
      <div className="grid sm:grid-cols-2 gap-6">
        <Block emoji="💬" title="燃える言葉" items={t.motivators} />
        <Block emoji="🚫" title="やる気なくす言葉" items={t.demotivators} />
        <Block emoji="⚡" title="調子いい時のサイン" items={t.goodSigns} />
        <Block emoji="📉" title="調子悪い時のサイン" items={t.badSigns} />
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mt-6 text-sm">
        {t.helpfulActions && <Para emoji="🤝" title="助かるフォロー" body={t.helpfulActions} />}
        {t.teamValue && <Para emoji="🎮" title="チームの価値" body={t.teamValue} />}
        {t.overdone && <Para emoji="⚠️" title="過剰になると" body={t.overdone} />}
      </div>
      {t.innerVoice && (
        <p className="mt-6 text-white/70 italic">★ {t.innerVoice}</p>
      )}
    </article>
  );
}

function Block({ emoji, title, items }: { emoji: string; title: string; items: string[] }) {
  return (
    <div>
      <h4 className="font-bold mb-2">
        {emoji} {title}
      </h4>
      {items && items.length > 0 ? (
        <ul className="list-disc list-inside space-y-1 text-white/85 text-sm">
          {items.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      ) : (
        <p className="text-white/40 text-xs">（本文は授業当日に投入）</p>
      )}
    </div>
  );
}

function Para({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
      <h4 className="font-bold text-xs mb-1">
        {emoji} {title}
      </h4>
      <p className="text-white/85">{body}</p>
    </div>
  );
}
