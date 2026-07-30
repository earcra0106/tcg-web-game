# 06 Goal Panel Layout 設計書

## 目的

目標パネルを画面左上へ移動し、現在のステージ番号を目標見出しに表示します。

## 変更予定のフォルダ構成

```text
apps/web/src
├── components
│   ├── StageHud.tsx
│   └── StageHud.test.tsx
└── styles
    └── global.css
```

## 実装方針

- `StageHud.tsx` からステージ状態パネルを削除し、目標見出しの右に `(現在:stage n)` を表示します。
- `.hud` をCSS Gridにして、十分な横幅では目標パネルを左、操作ボタンを右の同一行に配置します。
- 操作ボタンと目標パネルが重なる横幅では、メディアクエリで目標パネルを操作ボタンの下へ移します。
- UI配置は既存CSSのみで実現できるため、追加パッケージは導入しません。

## 確認事項

- `pnpm typecheck`、`pnpm test`、`pnpm build` を実行します。
- UIの確認URLは開発サーバーの `http://localhost:3000` です。
