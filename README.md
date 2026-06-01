# TYPE SCANNER (rune-type6)

高校 eスポーツコース「メンタルコミュニケーション」授業（60分）用、オールインワン授業進行アプリ。

- 仕様：[docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)
- 構成：[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 進捗：[docs/PROGRESS.md](docs/PROGRESS.md)

## 本番URL

- 講師：https://rune-type6.hatarakusutairu.workers.dev/teacher
- 生徒：https://rune-type6.hatarakusutairu.workers.dev/student
- 生徒（コード入り）：`https://rune-type6.hatarakusutairu.workers.dev/?room=XXXXXX` ← QR用
- **分析プレビュー（QA用）**：https://rune-type6.hatarakusutairu.workers.dev/preview

## ローカル開発

```bash
npm install
npm run dev          # Vite (client) :5173
npm run dev:worker   # Wrangler (worker + DO) :8787
```

`vite.config.ts` の proxy で `/api` と `/ws` を Wrangler に転送します。

## デプロイ

```bash
npm run build
npx wrangler deploy
```

または一発で：

```bash
npm run deploy
```

## 主要機能（最新）

- **5タイプ判定**：ワーク1（コンペ/アチー/ソシャ/エクスプ/バランス）× ワーク2（アタッカー/ガーディアン/アナリスト/ブースター/バランス）
- **25コンボ × 5パターン強度** の個別分析テキスト（`src/data/work1Analysis.ts` / `work2Analysis.ts` / `totalAnalysis.ts`）
- **講師画面**：READY CHECK / 進行ボタン / 分布バー（全体+クラス別） / クロス集計5×5 / 「みんなの感想」一覧
- **生徒画面**：QR入室 / Quiz / 自分の結果カード / 総合分析 / アンケートQR
- **リアクション**：ビルトイン6種 + カスタム画像（manifest.json で定義）
- **接続安定化**：ハートビート / visibility 復帰 / ErrorBoundary / 接続切断バナー
- **DO Storage 永続化**：ルーム状態を Durable Objects Storage に保存し、worker 再起動でも復活

## デプロイ後の動作チェック

1. `/preview?w1=14,3,2,1&w2=10,5,3,2` → extreme×dominant のサンプル分析が出るか
2. `/preview?w1=5,5,5,5&w2=5,5,5,5` → 両方バランス型のキャッチコピーが出るか
3. JS ハッシュが変わっているか（`dist/assets/index-*.js`）

## デバッグ

ブラウザ DevTools の Console に「App crashed:」が出ていれば ErrorBoundary がトリガーしたもの。スタックトレースを共有してください。
