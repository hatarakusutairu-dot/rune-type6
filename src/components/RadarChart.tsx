interface Props {
  scores: Record<string, number>;
  order: string[];
  colors: Record<string, string>;
  labels: Record<string, string>;
  max?: number;
  size?: number;
}

export default function RadarChart({
  scores,
  order,
  colors,
  labels,
  max = 20,
  size = 280,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 36;
  const n = order.length;

  function pointFor(value: number, i: number): [number, number] {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (radius * Math.min(value, max)) / max;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  function axisFor(i: number): [number, number] {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  }

  const points = order.map((t, i) => pointFor(scores[t] ?? 0, i));
  const polygon = points.map(([x, y]) => `${x},${y}`).join(' ');

  // Background rings
  const rings = [0.25, 0.5, 0.75, 1].map((s) => {
    const ringPoints = order
      .map((_, i) => {
        const [x, y] = pointFor(max * s, i);
        return `${x},${y}`;
      })
      .join(' ');
    return ringPoints;
  });

  const mainTypeColor = order.reduce(
    (best, t) => ((scores[t] ?? 0) > (scores[best] ?? 0) ? t : best),
    order[0],
  );
  const fill = colors[mainTypeColor] ?? '#ffffff';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="select-none">
      {rings.map((rp, idx) => (
        <polygon
          key={idx}
          points={rp}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1}
        />
      ))}
      {order.map((_, i) => {
        const [x, y] = axisFor(i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
          />
        );
      })}
      <polygon points={polygon} fill={fill} fillOpacity={0.35} stroke={fill} strokeWidth={2} />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill={colors[order[i]] ?? '#fff'} />
      ))}
      {order.map((t, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const lx = cx + (radius + 18) * Math.cos(angle);
        const ly = cy + (radius + 18) * Math.sin(angle);
        return (
          <text
            key={t}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fill={colors[t]}
            className="font-bold"
          >
            {labels[t] ?? t}
          </text>
        );
      })}
    </svg>
  );
}
