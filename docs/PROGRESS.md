# TYPE SCANNER ─ 実装進捗・タスクリスト

凡例：`[ ]` 未着手 / `[~]` 着手中 / `[x]` 完了

---

## Phase 1 ─ 基盤構築

### 1.1 リポジトリ初期化
- [x] `package.json` 作成、依存導入
- [x] `tsconfig.json` / `tsconfig.app.json` / `tsconfig.worker.json` / `tsconfig.node.json` を分離
- [x] `vite.config.ts`（React plugin、`dist/` 出力）
- [x] `tailwind.config.js` / `postcss.config.js` / `src/styles/index.css`
- [x] `index.html` ルートマウント
- [x] `.gitignore` 拡張（`.wrangler`, `.dev.vars`）

### 1.2 Worker / Durable Object
- [x] `wrangler.toml`（DO バインディング `ROOM_DO`、`compatibility_date`、`assets` 設定）
- [x] `worker/index.ts`（fetch ハンドラ、`/ws/:code` upgrade、アセット委譲）
- [x] `worker/RoomDO.ts`（Hibernation API、接続管理、ブロードキャスト）
- [x] `worker/state.ts`（PHASES、`nextPhase`、`endActive`、進捗・分布・クロス・ワードクラウド集計）

### 1.3 共有プロトコル
- [x] `shared/protocol.ts`（メッセージ型 union、`Phase` 型、`PublicRoomState`/`StudentInfo`、`nextPhase`）

### 1.4 クライアント基盤
- [x] `src/main.tsx` / `src/App.tsx`（HashRouter）
- [x] `src/routes/Landing.tsx` / `Teacher.tsx` / `Student.tsx`
- [x] `src/lib/sync.ts`（WebSocket クライアント、再接続、`createRoom`）
- [x] `src/lib/storage.ts`（localStorage v2.0）
- [x] `src/types/index.ts`
- [x] `RoomContext`（接続状態 + state + send ヘルパー + イベントスナップショット）

### 1.5 ルーム作成・参加
- [x] 講師: `POST /api/rooms` でコード発行 → WS 接続 → `T_CREATE_ROOM` で claim → QR 表示
- [x] 生徒: `?room=` 取得 → クラス選択 → `S_JOIN` → 待機画面
- [x] sid 発行（Worker 側 `crypto.randomUUID()`）
- [x] 再接続時 sid 送信 → `JOINED` で state 復旧

### 1.6 フェーズ進行
- [x] 講師「次へ」ボタン → `T_NEXT_PHASE` → `PHASE_CHANGE` 配信
- [x] 各端末で現フェーズに応じたコンポーネント描画（lobby / active / その他は Phase 2 以降）
- [x] `stage*_active` での「締切」ボタン → `T_END_ACTIVE`

### 1.7 デプロイ確認（Phase 1 完了基準）
- [x] `npm run build` 成功（client bundle）
- [x] `npx wrangler deploy --dry-run` 成功（worker + DO バインディング）
- [ ] ローカル `npm run dev` + `wrangler dev` で講師1/生徒1 が同期できる（要：ブラウザ実機確認）
- [ ] 本番 `wrangler deploy`（要：CF アカウント／API token 設定）
- [x] GitHub Actions（`deploy.yml`）配置済み

---

## Phase 2 ─ 診断機能

### 2.1 データ構造
- [x] `src/data/work1Questions.ts`（型定義 + 空配列）
- [x] `src/data/work2Questions.ts`（同上）
- [x] `src/data/typeInfo.ts`（8タイプ、ID/name/カラー等の骨組み）
- [x] `src/data/comboAnalysis.ts`（16パターン + balanced の骨組み）

### 2.2 診断 UI
- [x] `src/components/Quiz.tsx`（ワーク1/2共通）
- [x] 1問単位の出題、戻れない、プログレスバー
- [x] 選択肢シャッフル（sid + qid シード、Mulberry32）
- [x] 回答途中の localStorage 保存と復帰
- [x] ワーク2冒頭の前文表示

### 2.3 スコアリング
- [x] `src/lib/scoring.ts`
  - `scoreAnswers`, `judgeType`, `shuffledIndices`
  - 同点処理（タイプID昇順）、バランス判定（max-min≤2）
- [ ] 単体テスト（Vitest 任意導入）

### 2.4 結果カード
- [x] `components/RadarChart.tsx`（4軸、自前SVG、ネオン配色）
- [x] `components/ResultCard.tsx`（2段階表示、「詳しく見る」展開）
- [x] 「同程度の傾向」併記（tieWith）
- [x] バランス型カード分岐
- [x] 注記テキスト（学術的検査ではない旨）

### 2.5 サーバー集計
- [x] `S_WORK_RESULT` を Worker が受領 → `StudentInfo` 更新
- [x] `PROGRESS` 配信（active 中、回答ごとにブロードキャスト）
- [x] `WORK_DISTRIBUTION` 配信（results フェーズ遷移時）

---

## Phase 3 ─ 講師画面

### 3.1 lobby
- [x] QR、合計人数、クラス別人数

### 3.2 進捗モニター
- [x] クラス別進捗バー（active 中）
- [x] 締切ボタン

### 3.3 タイプ分布
- [x] `components/Distribution.tsx`（棒グラフ + %）
- [x] 全体 / クラス別タブ切替（`T_SET_DISTRIBUTION_VIEW` 同期）

### 3.4 タイプ解説スライド
- [x] `components/TypeSlide.tsx`（typeInfo 駆動）
- [x] 8枚分の遷移を `stage1_explain_1..4`, `stage2_explain_1..4` で表示

### 3.5 ブリッジ・テーマ・ルール・流れ・共有・まとめ
- [x] スライドコンポーネント実装（TeacherStage 内の Slide ヘルパー）

### 3.6 クロス集計
- [x] `components/CrossMatrix.tsx`（4×4＋balanced 別枠）
- [x] `CROSS_MATRIX` 配信（stage3_summary 遷移時）

### 3.7 ワードクラウド
- [x] `S_COMMENT` 受領、簡易分かち書き（スペース/句読点 + ストップワード除去）
- [x] `components/WordCloud.tsx`（頻度に応じたフォントサイズ）

---

## Phase 4 ─ 仕上げ

- [ ] 設問・タイプ解説・16パターンの本文を投入（提供待ち）
- [ ] スライド画像があれば差し替え
- [ ] 復帰テスト（暗転 → 復帰、ルーム再入室）
- [ ] レスポンシブ調整（375 / 768 / 1024 / 1280）
- [ ] アクセシビリティ（コントラスト、フォーカスリング）
- [ ] パフォーマンス計測（100端末同時、WSサイズ）
- [ ] README 整備、運用手順、トラブルシューティング
- [ ] 本番デプロイ・ドメイン公開
- [ ] 授業当日リハーサル

---

## マイルストーン

| マイルストーン | 内容 | 期日（目安） |
|----------------|------|--------------|
| M1 | Phase 1 完了：1講師1生徒で同期確認 | 着手後 2 日 |
| M2 | Phase 2 完了：診断 → 結果カード表示 | M1+3 日 |
| M3 | Phase 3 完了：講師集計画面 | M2+3 日 |
| M4 | Phase 4 完了：本文投入＋本番リハーサル | 授業 3 日前 |

---

## 未確定事項リスト

- [ ] 設問本文（提供待ち）
- [ ] タイプ解説本文（提供待ち）
- [ ] 16パターン解説本文（提供待ち）
- [ ] スライド画像の有無
- [ ] Cloudflare アカウント情報、`*.workers.dev` サブドメイン名
- [ ] GitHub Secrets（`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`）設定
