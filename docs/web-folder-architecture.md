# Web Folder Architecture

## 概要

`apps/web` は Vite、React、Three.js を使ったインストール可能な PWA 形式の3Dゲームテンプレートです。

## フォルダ構成

```text
apps/web
├── public
│   ├── favicon.svg
│   ├── pwa-192.svg
│   └── pwa-512.svg
├── src
│   ├── components
│   │   └── GameCanvas.tsx
│   ├── game
│   │   ├── ThreeGame.ts
│   │   ├── input.test.ts
│   │   ├── input.ts
│   │   ├── viewport.test.ts
│   │   └── viewport.ts
│   ├── styles
│   │   └── global.css
│   ├── test
│   │   └── setup.ts
│   ├── App.tsx
│   └── main.tsx
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
├── vite.config.ts
└── vitest.config.ts
```

## 役割

- `src/game`: Three.js のシーン、ゲームループ、入力、ビューポート計算を配置します。
- `src/components`: React と Three.js の境界になる UI コンポーネントを配置します。
- `src/styles`: アプリ全体のスタイルを配置します。
- `src/test`: Vitest の共通セットアップを配置します。
- `public`: PWA manifest から参照する静的アセットを配置します。

## Docker 構成

- `compose.yaml` の `web` service は `/workspace/apps/web` を作業ディレクトリにして `pnpm dev` を実行します。
- `.docker/web/local.Dockerfile` は Node 24 と pnpm を含むローカル実行用イメージです。
- コンテナは `3000:3000` を公開します。
