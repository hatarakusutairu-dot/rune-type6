# TYPE SCANNER ─ 実装進捗・タスクリスト

凡例：`[ ]` 未着手 / `[~]` 着手中 / `[x]` 完了

---

## Phase 1 ─ 基盤構築 ✅

すべて完了。詳細省略（前バージョン参照）。

---

## Phase 2 ─ 診断機能 ✅

- [x] 設問データ：ワーク1 20問、ワーク2 20問 投入済み
- [x] 8タイプ解説 + **バランス型 2タイプ追加（計10タイプ）**：catchcopy / description / motivators 等すべて埋め込み済み
- [x] 16パターン総合分析：すべて投入済み（balanced 含む）
- [x] Quiz UI（プログレスバー、戻れない、シャッフル、途中再開）
- [x] スコアリング（同点処理、バランス判定）
- [x] **`generateWorkXAnalysis` / `generateTotalAnalysis` 投入**：work1Analysis / work2Analysis / totalAnalysis データ＋エンジン
- [x] ResultCard 刷新（リッチ版：catchcopy + サマリ + パターン解説 + 燃え/萎え + 好調/不調 + フォロー方法 + 伸びしろ）
- [x] CombinedResult 刷新（16コンボ＋サブ/パターン補足＋スコア内訳）
- [x] **balanced 判定の閾値統一**：scoreUtils.judgeType と lib/scoring.analyzeScores が同じ「3〜7点かつ差4以内」
- [x] サーバー集計（PROGRESS / WORK_DISTRIBUTION 配信、balanced 含む）

---

## Phase 3 ─ 講師画面 ✅

すべて完了。タイプ分布、クロス集計、ワードクラウド、タイプ解説スライド、ルール/テーマ/流れ等。

### 拡張で実装したもの
- [x] READY CHECK（クラスチェックボックス）画面
- [x] ロビーの遊び心UI（アバターチップ、ゲージ、bounce、グラデ）
- [x] URL コピーボタン
- [x] 「前へ」ボタン（フェーズ巻き戻し）
- [x] スライド画像の自動差し替え（`public/slides/<phase>.png`）
- [x] 6つの追加フェーズ（stage0_title / work1title / work1 / stage2_work2title / work2 / stage3_type）
- [x] **タイプ解説スライド 4枚→5枚に拡張**（バランス型追加：stage1_explain_5 / stage2_explain_5）
- [x] ワーク1/2 結果カード上に **5タイプ概要バナー**（stage0_1type4 / stage2_2type4）
- [x] 生徒側で各フェーズが同期する（slide image + stage0 ミラー）
- [x] **講師画面に各フェーズのスライド下にテキスト解説併置**（rules / flow / work1title / work1 / work2title / work2）
- [x] **分布表示の刷新**：タブ廃止 → 全体大きく＋各クラス並列表示
- [x] **クロス集計 5×5 化**（balanced 行/列を含む）
- [x] **ブリッジ画面の刷新**（グラデーションパネル＋WORK1×WORK2カード）

---

## Phase 4 ─ 仕上げ ✅

### 完了
- [x] 設問・タイプ解説・16パターンの本文投入
- [x] スライド画像差し替え（25枚以上、PNG 自動ロード）
- [x] ローカル `npm run dev` + `wrangler dev` での同期動作確認（実機OK）
- [x] **本番デプロイ済み**：https://rune-type6.hatarakusutairu.workers.dev
- [x] **GitHub Actions secrets 設定済み**
- [x] 復帰テスト：暗転 → 復帰、ルーム再入室
- [x] **DO Storage 永続化**：worker 再起動・isolate 退去でもルーム復活
- [x] **デバッグ用 `/preview` ルート**：8パターンのプリセットボタンで分析結果を即確認

---

## Phase 5 ─ リアクション機能 ✅

- [x] **生徒・講師どちらからもリアクション送信**（絵文字 + カスタム画像）
- [x] サーバ REACTION_BURST ブロードキャスト
- [x] **画面下部に常駐リアクションバー**（BUILTIN 6種 + カスタム manifest 読み込み）
- [x] **画面全体に上昇アニメーションでバースト演出**
- [x] カスタムリアクション画像：`public/reactions/<key>.png` + `manifest.json`
- [x] balance リアクション追加
- [x] **重要パネルの上を通らないようレイヤー設計**：reaction (z-10) < panel (z-20) < character-button (z-30) < reaction-bar (z-40)

---

## Phase 6 ─ 感想集約 ✅

- [x] 感想入力 90秒カウントダウン
- [x] 「みんなの感想」カード一覧表示（講師画面で全員の原文を共有）
- [x] **各クラスの送信進捗バー**（ランキング順、1位に 👑）
- [x] サーバ COMMENT_LIST / COMMENT_PROGRESS ブロードキャスト

---

## Phase 7 ─ スマホ復帰・接続安定化 ✅（2026/6 緊急対応）

授業当日の Edge / モバイルでの **画面落ち・入室不能** 多発を受けて、接続周りを大幅補強。

### 接続層
- [x] **WebSocket デッド検知**：20秒ごと PING、30秒サーバから何も来なかったら強制再接続
- [x] **タブ復帰時の強制再接続**：`visibilitychange` / `online` / `pageshow` イベントでソケット確認
- [x] **`forceReconnect` API**：UI 層から再接続を要求できる
- [x] **`armStudentRejoin`**：S_JOIN 送信前に payload 予約 → 再接続時に自動再送（"幽霊入室" 解消）

### UI 層
- [x] **ErrorBoundary**：React の render エラーで黒画面にならず復旧パネル表示
- [x] **ConnectionBanner**：status≠open のとき画面上部にオレンジで警告
- [x] **「入室中…」ローディング画面**：クリック→JOINED 到着までのギャップを埋める

### 入室フロー
- [x] **`clearRoomBinding`**：phase='closed' 受信で localStorage 自動クリア（次のリロードで新規入室扱い）
- [x] **新ルーム入室パネル**：SurveyQR 下に「別のルームに入る」コード入力欄
- [x] **autoreconnect on code change**：URL 切り替えで socket 切替＋state リセット
- [x] **className を localStorage に保存**：リロード時の自動再入室を実現

### レーダー / 表示
- [x] **長いラベル2行折り返し**：エクスプローラー → エクスプ/ローラー 等
- [x] **labelPad 調整**：72px に最適化

---

## 未実装 / 未確定

### 仕様外で「あれば便利」
- [ ] サブタイプ一言補足（combo × subType の組合せごとに固有メッセージ）
- [ ] 講師の「ジャンプ」機能（特定フェーズに直接飛ぶ。リハーサル用）
- [ ] 進行状況表示（「現在 5/28 ステージ」のような講師向けインジケータ）
- [ ] 結果のローカル PNG エクスポート（生徒が「保存して持ち帰る」）
- [ ] スコアリングロジックの単体テスト（任意）

### 課題（次回授業前に検証）
- [ ] **PC Edge での "幽霊入室" 再現テスト**：Phase 7 修正で解消したか実機確認
- [ ] **iOS Safari/Edge での背景復帰**：visibilitychange の挙動確認
- [ ] **closed 後の `clearRoomBinding` 副作用** ：先生が誤って "授業終了" 押した時の影響
- [ ] スコアリングの Vitest 単体テスト（任意）

---

## 既知のアーキテクチャ差分（5月版 `rune-carrer5` との比較）

| | 5月 | 現在 |
|---|---|---|
| 入室済み判定 | サーバ確認後 (`mySid && state`) | local boolean `joined` + 自動 sync ✅ Phase 7 で堅牢化 |
| ストレージ | sessionStorage | localStorage（永続）+ closed で自動クリア ✅ |
| 入室時の WS 未接続 | `pendingActionRef` で送信予約 | `armStudentRejoin` で同等の仕組み実装 ✅ |
| ハートビート | なし | **追加** ✅ |
| visibilitychange | なし | **追加** ✅ |
| DO Storage 永続化 | なし | **追加** ✅ |
| Routing | (Hash の予定?) | BrowserRouter |
