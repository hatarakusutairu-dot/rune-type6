interface Props {
  data: Record<string, number>;
  order: string[];
  labels: Record<string, string>;
  colors: Record<string, string>;
}

export default function Distribution({ data, order, labels, colors }: Props) {
  const total = order.reduce((s, t) => s + (data[t] ?? 0), 0);
  const max = Math.max(1, ...order.map((t) => data[t] ?? 0));
  return (
    <div className="space-y-3">
      {order.map((t) => {
        const v = data[t] ?? 0;
        const pct = total ? Math.round((v / total) * 100) : 0;
        const w = (v / max) * 100;
        return (
          <div key={t}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-bold" style={{ color: colors[t] }}>
                {labels[t] ?? t}
              </span>
              <span className="text-white/70">
                {v} 名（{pct}%）
              </span>
            </div>
            <div className="h-4 bg-white/10 rounded">
              <div
                className="h-4 rounded"
                style={{ width: `${w}%`, background: colors[t] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
