# 08 Google Analytics 4 導入

## 目的

Google Analytics 4 の Google タグをアプリ全体で読み込み、アクセスを計測できるようにする。

## スコープ

```text
apps/web/
├── index.html       # Google タグの埋め込み
└── vite.config.ts   # GA_ID を HTML 置換へ公開

docs/
└── web-technical-requirements.md # デプロイ時の環境変数設定
```

## 実装方針

- 提供された `temp.txt` の Google タグを `index.html` の `<head>` に配置する。
- スニペット内の測定 ID は Vite の HTML 定数 `%GA_ID%` とし、ビルド時環境変数 `GA_ID` で置換する。
- GA4 の測定 ID は公開情報のため、Vite の `envPrefix` に `GA_ID` を追加する。
- Google が提供する `gtag.js` を直接利用し、追加パッケージは導入しない。

## 確認事項

- `GA_ID=G-TEST123456 pnpm build` の生成 HTML に測定 ID が2か所埋め込まれることを確認する。
- `pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm format:check` を実行する。
- UI確認用URL: `http://localhost:3000/`。
