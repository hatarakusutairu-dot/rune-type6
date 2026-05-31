import { WORK1_ORDER, WORK2_ORDER } from '../lib/scoreUtils';

const ROW_ORDER = [...WORK1_ORDER, 'balanced'];
const COL_ORDER = [...WORK2_ORDER, 'balanced'];

const LABELS_W1: Record<string, string> = {
  competitor: 'コンペティター',
  achiever: 'アチーバー',
  socializer: 'ソーシャライザー',
  explorer: 'エクスプローラー',
  balanced: 'バランス型',
};
const LABELS_W2: Record<string, string> = {
  attacker: 'アタッカー',
  guardian: 'ガーディアン',
  analyst: 'アナリスト',
  booster: 'ブースター',
  balanced: 'バランス型',
};
const COLORS_W1: Record<string, string> = {
  competitor: '#FF4444',
  achiever: '#FFD700',
  socializer: '#00E676',
  explorer: '#448AFF',
  balanced: '#C0C0C0',
};
const COLORS_W2: Record<string, string> = {
  attacker: '#FF6D00',
  guardian: '#00BCD4',
  analyst: '#AA00FF',
  booster: '#FF4081',
  balanced: '#C0C0C0',
};

interface Props {
  matrix: Record<string, Record<string, number>>;
  /** Retained for protocol compatibility; no longer rendered. */
  balanced?: number;
}

export default function CrossMatrix({ matrix }: Props) {
  const maxCell = Math.max(
    1,
    ...ROW_ORDER.flatMap((r) => COL_ORDER.map((c) => matrix[r]?.[c] ?? 0)),
  );

  return (
    <table className="w-full border-collapse table-fixed">
      <thead>
        <tr>
          <th className="p-2 text-left text-white/40 text-[10px] sm:text-xs w-[14%]">
            W1 ＼ W2
          </th>
          {COL_ORDER.map((c) => (
            <th
              key={c}
              className="p-1 sm:p-2 text-[10px] sm:text-xs font-bold break-keep leading-tight"
              style={{ color: COLORS_W2[c] }}
            >
              {LABELS_W2[c]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROW_ORDER.map((r) => (
          <tr key={r}>
            <th
              className="p-1 sm:p-2 text-right text-[10px] sm:text-xs font-bold break-keep leading-tight"
              style={{ color: COLORS_W1[r] }}
            >
              {LABELS_W1[r]}
            </th>
            {COL_ORDER.map((c) => {
              const v = matrix[r]?.[c] ?? 0;
              const intensity = v / maxCell;
              return (
                <td
                  key={c}
                  className="p-2 text-center border border-white/10"
                  style={{
                    background: `rgba(168, 85, 247, ${0.05 + intensity * 0.5})`,
                  }}
                >
                  <span className="text-lg sm:text-xl font-black">{v}</span>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
