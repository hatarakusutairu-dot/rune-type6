import { WORK1_ORDER, WORK2_ORDER } from '../lib/scoreUtils';

const LABELS_W1: Record<string, string> = {
  competitor: 'コンペティター',
  achiever: 'アチーバー',
  socializer: 'ソーシャライザー',
  explorer: 'エクスプローラー',
};
const LABELS_W2: Record<string, string> = {
  attacker: 'アタッカー',
  guardian: 'ガーディアン',
  analyst: 'アナリスト',
  booster: 'ブースター',
};
const COLORS_W1: Record<string, string> = {
  competitor: '#FF4444',
  achiever: '#FFD700',
  socializer: '#00E676',
  explorer: '#448AFF',
};
const COLORS_W2: Record<string, string> = {
  attacker: '#FF6D00',
  guardian: '#00BCD4',
  analyst: '#AA00FF',
  booster: '#FF4081',
};

interface Props {
  matrix: Record<string, Record<string, number>>;
  balanced: number;
}

export default function CrossMatrix({ matrix, balanced }: Props) {
  const maxCell = Math.max(
    1,
    ...WORK1_ORDER.flatMap((r) => WORK2_ORDER.map((c) => matrix[r]?.[c] ?? 0)),
  );

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left text-white/40 text-xs">W1 ＼ W2</th>
            {WORK2_ORDER.map((c) => (
              <th
                key={c}
                className="p-2 text-xs font-bold"
                style={{ color: COLORS_W2[c] }}
              >
                {LABELS_W2[c]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WORK1_ORDER.map((r) => (
            <tr key={r}>
              <th
                className="p-2 text-right text-xs font-bold"
                style={{ color: COLORS_W1[r] }}
              >
                {LABELS_W1[r]}
              </th>
              {WORK2_ORDER.map((c) => {
                const v = matrix[r]?.[c] ?? 0;
                const intensity = v / maxCell;
                return (
                  <td
                    key={c}
                    className="p-3 text-center border border-white/10"
                    style={{
                      background: `rgba(168, 85, 247, ${0.05 + intensity * 0.5})`,
                    }}
                  >
                    <span className="text-xl font-black">{v}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {balanced > 0 && (
        <p className="mt-3 text-white/70 text-sm">
          バランス型：<span className="font-bold">{balanced}</span> 名
        </p>
      )}
    </div>
  );
}
