# 07 シェア機能

## 目的

現在のステージ番号とシード値を含むプレイ結果を、X、LINE、クリップボードへ共有できるようにする。

## スコープ

```text
apps/web/src/
├── App.tsx                         # モーダルの開閉状態と値の受け渡し
├── components/
│   ├── StageHud.tsx                 # ヘッダーのシェアボタン
│   ├── ShareModal.tsx               # 文面生成と共有UI
│   └── ShareModal.test.tsx          # 文面・共有リンク・コピーの検証
└── styles/global.css                # モーダルと操作ボタンの配置
```

## 実装方針

- X Web Intent と LINE Social Plugin の共有URLを使用し、外部SDK・追加パッケージは導入しない。
- `buildShareText(stageNumber, seed)` は指定された改行を含む共有文面を返す。
- クリップボードコピーは `navigator.clipboard.writeText` を利用する。

## 確認事項

- `pnpm typecheck`、`pnpm test`、`pnpm build` を実行する。
- UI確認用URL: `http://localhost:3000/`。
