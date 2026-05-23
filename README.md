# TYPE SCANNER (rune-type6)

高校 eスポーツコース「メンタルコミュニケーション」授業（60分）用、オールインワン授業進行アプリ。

- 仕様：[docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)
- 構成：[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 進捗：[docs/PROGRESS.md](docs/PROGRESS.md)

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

`main` への push で GitHub Actions が自動デプロイします（要 secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`）。
