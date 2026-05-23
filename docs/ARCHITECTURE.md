# TYPE SCANNER ─ アーキテクチャ設計書

## 1. 全体構成

```
┌───────────────┐        WSS         ┌──────────────────────┐
│  生徒ブラウザ  │ ───────────────► │ Cloudflare Workers   │
│  (スマホ/PC)   │                  │  ├─ HTTP/Asset 配信  │
└───────────────┘                  │  └─ RoomDO (1/room)  │
        ▲                          │     Durable Object   │
        │  HTTPS (HTML/JS/CSS)     │     + WS Hibernation │
        ▼                          └──────────────────────┘
┌───────────────┐        WSS                  ▲
│  講師ブラウザ  │ ───────────────────────────┘
│  (PC大画面)    │
└───────────────┘
```

- **クライアント：** React 18 + TypeScript + Vite + Tailwind。Hash Router でルーティング。
- **サーバー：** Cloudflare Workers + Durable Objects（Hibernation API）。1ルーム = 1 DO インスタンス。
- **永続化：** なし（揮発のみ）。DBは使わない。
- **配信：** Worker から `dist/` を静的アセットとして配信。

## 2. プロジェクトディレクトリ

```
rune-type6/
├── README.md
├── package.json
├── wrangler.toml
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.worker.json / tsconfig.node.json
├── tailwind.config.js / postcss.config.js
├── index.html
├── src/                         # クライアント
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/                  # /teacher /student / (root)
│   ├── stages/                  # フェーズ別コンポーネント
│   ├── components/              # 結果カード/レーダー/分布/マトリクス/ワードクラウド等
│   ├── data/                    # 設問・タイプ・コンボ
│   ├── lib/                     # storage, scoring, sync(WS)
│   ├── types/
│   └── styles/
├── shared/
│   └── protocol.ts              # クライアント・サーバー共有型
├── worker/
│   ├── index.ts                 # entry / fetch handler
│   ├── RoomDO.ts                # Durable Object
│   └── state.ts                 # フェーズ機械
├── docs/
└── .github/workflows/deploy.yml
```

## 3. ルーティング

- `/` 　　　　─ ランディング（`?room=` 付きなら生徒入室フローへ）
- `/teacher` ─ 講師モード
- `/student` ─ 生徒モード（クエリ `?room=` なしならコード手入力）

HashRouter を採用。`?room=` クエリは URL のクエリ部分で扱い、Hash と独立。

## 4. 通信プロトコル（`shared/protocol.ts`）

### Client → Server

| type | payload | 送信元 |
|------|---------|--------|
| `T_CREATE_ROOM` | `{ classes: string[] }` | 講師 |
| `T_NEXT_PHASE` | `{}` | 講師 |
| `T_END_ACTIVE` | `{}` | 講師 |
| `T_CLOSE_ROOM` | `{}` | 講師 |
| `T_SET_DISTRIBUTION_VIEW` | `{ view: 'all' \| string }` | 講師 |
| `S_JOIN` | `{ code: string, className: string, sid?: string }` | 生徒 |
| `S_WORK_RESULT` | `{ workId: 1\|2, scores, mainType, subType }` | 生徒 |
| `S_COMMENT` | `{ text: string }` | 生徒 |
| `REACTION` | `{ emoji: string }` | 両方 |
| `PING` | `{}` | 両方 |

### Server → Client

| type | payload | 用途 |
|------|---------|------|
| `ROOM_CREATED` | `{ code, teacherToken }` | 講師にコード返却 |
| `JOINED` | `{ sid, state }` | 生徒入室成功 |
| `STATE` | `{ state }` | フル状態同期 |
| `PHASE_CHANGE` | `{ phase }` | フェーズ遷移 |
| `PROGRESS` | `{ workId, count, total, perClass }` | 進捗 |
| `WORK_DISTRIBUTION` | `{ workId, perClass, overall }` | 分布 |
| `CROSS_MATRIX` | `{ matrix }` | クロス集計 |
| `COMMENT_CLOUD` | `{ words: {text,count}[] }` | ワードクラウド |
| `STUDENT_COUNT` | `{ count, perClass }` | 入室人数 |
| `REACTION_BURST` | `{ emoji }` | リアクション |
| `ERROR` | `{ code, message }` | エラー |
| `PONG` | `{}` | ping応答 |

メッセージ形式：`{ type: string, payload: any, ts?: number }`。1メッセージ < 1KB を維持する。

## 5. データモデル

### 5.1 RoomState（Durable Object メモリ）

```typescript
interface RoomState {
  code: string;
  classes: string[];
  phase: Phase;                       // フェーズID
  distributionView: 'all' | string;   // 現在の分布表示対象
  students: Map<string, StudentInfo>;
  comments: string[];
  createdAt: number;
  teacherToken: string;               // 検証用
}

interface StudentInfo {
  sid: string;
  className: string;
  joinedAt: number;
  lastSeenAt: number;
  work1Scores?: { competitor:number; achiever:number; socializer:number; explorer:number };
  work1Type?: string;
  work1SubType?: string;
  work2Scores?: { attacker:number; guardian:number; analyst:number; booster:number };
  work2Type?: string;
  work2SubType?: string;
}
```

### 5.2 localStorage（生徒端末）

仕様書通り、`version: "2.0"` で sid・className・roomCode・work1・work2・comment を保持。

## 6. フェーズ機械（`worker/state.ts`）

フェーズ遷移は単方向リスト。

```typescript
const PHASES = [
  'lobby',
  'stage0_rules','stage0_theme','stage0_flow',
  'stage1_active','stage1_results',
  'stage1_explain_1','stage1_explain_2','stage1_explain_3','stage1_explain_4',
  'stage1_bridge',
  'stage2_active','stage2_results',
  'stage2_explain_1','stage2_explain_2','stage2_explain_3','stage2_explain_4',
  'stage3_summary','stage3_share','stage3_comment','stage3_wordcloud','stage3_closing',
  'closed',
] as const;
```

- `T_NEXT_PHASE` で index+1。
- `T_END_ACTIVE` は `stage1_active`/`stage2_active` 限定で結果フェーズへスキップ。
- `closed` 以降は遷移不可。

## 7. Durable Object（`worker/RoomDO.ts`）

- 1ルーム = 1 DO（`code` を ID 化）
- WebSocket Hibernation API を採用（`acceptWebSocket(ws, tags)` で sid と role をタグ）
- メッセージ受信時：`webSocketMessage(ws, msg)` ハンドラで分岐
- broadcast はタグ付き WS 全件への送信
- 接続喪失：`webSocketClose` で `lastSeenAt` 更新のみ。students から即削除しない（再接続猶予）
- 永続化：必要に応じて DO Storage（KV）に最小限の snapshot を置く。再起動耐性が必要なら採用、不要なら省く

## 8. クライアント設計

### 8.1 状態管理（React Context）

- `RoomContext`: 接続状態、`RoomState`、`role`（teacher/student）、`sid`、送受信ヘルパー
- WebSocket は `lib/sync.ts` でラップ、reconnect with exponential backoff

### 8.2 ステージレンダリング

```
<App>
  <RoomProvider>
    <Router>
      /          → <Landing/>
      /teacher   → <TeacherShell> → 現フェーズに応じた Stage*
      /student   → <StudentShell> → 現フェーズに応じた Stage*
    </Router>
  </RoomProvider>
</App>
```

`stages/` 配下では同じフェーズに対して `TeacherView` と `StudentView` をエクスポート。

### 8.3 主要コンポーネント

| コンポーネント | 役割 |
|---------------|------|
| `ResultCard` | 結果カード2段階表示。`workId`/`type`/`subType`/`scores` を受ける |
| `RadarChart` | 4軸スコアのレーダー。recharts または自前SVG |
| `TypeSlide` | タイプ解説8枚。`typeInfo` データで描画 |
| `ProgressBar` | 回答進捗・回答者進捗の汎用バー |
| `Distribution` | 棒/円グラフ + パーセンテージ |
| `CrossMatrix` | 4×4 マトリクス、人数表示。balanced は別枠 |
| `WordCloud` | 感想テキストの頻度可視化（簡易・自前で十分） |

### 8.4 スコアリング（`src/lib/scoring.ts`）

純関数として実装。サーバーには「結果のみ」送信する。

```typescript
function scoreAnswers(answers: number[], questions: Question[]): Record<string, number>;
function judgeType(scores: Record<string, number>):
  { mainType: string; subType: string; isBalanced: boolean; tie?: string[] };
```

- バランス判定：`max - min <= 2`
- 同点：タイプID昇順でプライマリ採用、tie に併記対象を入れる

### 8.5 シャッフル

`sid` + 設問ID を文字列結合して FNV-1a ハッシュ → 32bit seed → Mulberry32 で Fisher-Yates。
同一 sid・同一設問は常に同じ並び。

### 8.6 ストレージ（`src/lib/storage.ts`）

`version` を `"2.0"` として固定。読み込み時に version 不一致なら破棄。put/get/clear を提供。

## 9. デザイントークン

- 背景：`#0a0a1a` 〜 `#1a1a2e` グラデ、Tailwind の任意色拡張
- アクセント：ネオン系（タイプカラー仕様書通り）
- フォント：太めのゴシック（system-ui / "Noto Sans JP"）
- レスポンシブ：
  - 生徒：`sm` (375+) / `md` (768+) / `lg` (1024+)
  - 講師：`xl` (1280+) を主、`2xl` で投影最適化

## 10. 失敗時フォールバック

| 事象 | 振る舞い |
|------|---------|
| WebSocket 接続失敗 | 5秒間隔で再接続。診断画面はローカル単独で完走可能 |
| 講師不在 | 生徒は最後に受信したフェーズで待機。診断結果は localStorage に保持 |
| ルーム未存在で `S_JOIN` | `ERROR { code: 'NO_ROOM' }` を返す。クライアントはコード再入力へ |

## 11. セキュリティ

- 個人情報・端末識別子を一切収集しない
- `teacherToken` は乱数（crypto.randomUUID）、`sessionStorage` のみ
- `T_*` メッセージは `teacherToken` を payload に含める／サーバーで照合
- CORS：同一オリジンのみ。WebSocket Upgrade は `/ws/:code` などのパス制限

## 12. デプロイ

- `wrangler deploy` で worker と `dist/` を同時アップロード
- GitHub Actions: `main` への push でビルド→デプロイ（secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`）

## 13. 既知の未確定事項

| 項目 | メモ |
|------|------|
| 設問本文 | 別途提供。型と件数のみ先に固める |
| タイプ解説本文 | 別途提供 |
| 16パターン解説 | 別途提供 |
| スライド画像 | あれば差し替え。なければコンポーネント実装 |
| DO ストレージ永続化 | 授業中の DO 再起動が起きた場合の挙動。当面メモリのみで開始 |
