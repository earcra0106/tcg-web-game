# Web Technical Requirements

## 概要

`apps/web` はバックエンドを持たない静的な3Dゲームテンプレートです。Vite で開発・ビルドし、Vercel では `dist` を静的配信します。

## 技術スタック

- Vite: 開発サーバーと本番ビルド
- React: HUD、メニュー、アプリの UI 境界
- TypeScript: 型安全な実装
- Three.js: 3Dレンダリング、シーン、カメラ、ライト、メッシュ
- vite-plugin-pwa: PWA manifest と service worker 生成
- ESLint: 静的解析
- Prettier: フォーマット
- Vitest: 単体テスト

## パッケージで解決する範囲

- Vite による dev server、build、preview
- React による UI 描画
- Three.js による WebGL レンダリング
- vite-plugin-pwa による PWA 化
- ESLint と Prettier による品質チェックと整形
- Vitest によるテスト実行

## 自作する範囲

- Three.js の初期化、シーン構成、ゲームループ
- 入力状態の管理
- canvas のリサイズ処理
- テンプレート用 HUD
- ゲームロジックの純粋関数と対応テスト

## 開発コマンド

```bash
cd apps/web
pnpm dev
```

`http://localhost:3000` で起動します。

## 品質確認

```bash
cd apps/web
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
pnpm build
```

`pnpm lint` は ESLint を実行した後に `pnpm format` を実行します。

## テスト駆動開発

関数を追加または変更する場合は、対応するテスト項目を同時に開発します。DOM や WebGL に強く依存しない処理は純粋関数として切り出し、Vitest でテストします。

初期テンプレートでは以下をテスト対象にしています。

- 入力状態の初期値と更新
- キーボードコードと移動方向の対応
- 移動ベクトルの計算
- viewport サイズと aspect ratio の計算

## 本番相当確認

```bash
cd apps/web
pnpm build
pnpm preview
```

## Docker 確認手順

この環境では Docker 起動確認とブラウザ確認を実施しません。実行可能な環境で以下を確認してください。

```bash
docker compose build web
docker compose up web
```

ブラウザで `http://localhost:3000` を開き、以下を確認してください。

- 3Dシーンが表示されること
- WASD または矢印キーでキューブが移動すること
- ウィンドウサイズ変更後も canvas が崩れないこと
- PWA manifest が読み込まれ、インストール可能であること

## Vercel デプロイ

Vercel の project root は `apps/web` に設定します。

- Build Command: `pnpm build`
- Output Directory: `dist`
- Framework Preset: Vite
