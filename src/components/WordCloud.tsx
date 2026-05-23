interface Props {
  words: { text: string; count: number }[];
}

export default function WordCloud({ words }: Props) {
  if (!words || words.length === 0) {
    return <p className="text-white/60 text-sm">まだ感想が集まっていません。</p>;
  }
  const maxCount = Math.max(...words.map((w) => w.count));
  const palette = ['#FF4081', '#00E676', '#448AFF', '#FFD700', '#AA00FF', '#00BCD4', '#FF6D00'];
  return (
    <div className="flex flex-wrap gap-3 items-baseline justify-center">
      {words.map((w, i) => {
        const size = 14 + Math.round((w.count / maxCount) * 56);
        const color = palette[i % palette.length];
        return (
          <span
            key={w.text}
            style={{ fontSize: size, color, lineHeight: 1.2 }}
            className="font-black"
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
}
