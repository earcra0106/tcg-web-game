# Voxel Kitchen Automation 実装フェーズ計画

## 概要

`docs/plan` の仕様を `apps/web` の既存 Vite + React + TypeScript + Three.js 構成へ段階的に実装するための作業計画です。

実装は、先にテストしやすいゲームドメインを作り、その後にレシピ、お題、シミュレーション、操作、描画を接続します。UI と 3D 表示は既存の React Three Fiber 構成を活かし、ゲーム固有の判定や進行は `src/game` の純粋関数として自作します。

## 参照元

- `docs/plan/overview.md`: ゲーム進行、ステージ、クリア条件
- `docs/plan/guide.md`: PC とスマートフォンの操作
- `docs/plan/machines.md`: マシン、コンベア、詰まり、レシピ指定
- `docs/requirements.md`: 全体要件、技術要件、PWA、品質要件
- `docs/requirements/food.md`: 食材、料理、調理工程
- `docs/web-folder-architecture.md`: `apps/web` のフォルダ構成
- `docs/web-technical-requirements.md`: 検証コマンドと実装方針

## フェーズ一覧

| フェーズ | 設計書 | 目的 | 主な成果物 |
| --- | --- | --- | --- |
| 1 | `docs/task/01-game-domain-foundation.md` | グリッド、配置物、接続、ゲーム状態の土台を作る | 座標変換、占有判定、配置・削除・接続の純粋関数 |
| 2 | `docs/task/02-recipes-and-stage-goals.md` | 既存 food data をレシピ判定とステージお題へ接続する | レシピ検索、調理工程判定、決定的なお題生成 |
| 3 | `docs/task/03-machine-and-line-simulation.md` | マシン処理、搬送、詰まり、出荷効率を実装する | tick ベースのシミュレーション、内部保持、出荷履歴 |
| 4 | `docs/task/04-editor-controls.md` | PC/スマートフォンの編集操作を実装する | ツール選択、配置、接続、削除、選択状態 |
| 5 | `docs/task/05-rendering-hud-audio.md` | 盤面描画、HUD、フィードバック、音響を仕上げる | 3D 盤面、マシン・食材表示、効率 HUD、効果音 |

## 依存関係

1. フェーズ 1 は他フェーズの前提です。
2. フェーズ 2 は既存 `foodInfos` を使うため、フェーズ 1 と並行可能ですが、シミュレーション接続はフェーズ 3 で行います。
3. フェーズ 3 はフェーズ 1 と 2 の型・関数を使用します。
4. フェーズ 4 はフェーズ 1 の配置 API を使用します。
5. フェーズ 5 はフェーズ 1 から 4 の状態を表示します。

## パッケージ利用方針

### 既存パッケージで解決する範囲

- Vite: 開発サーバー、ビルド、静的配信成果物生成
- React: HUD、ツールバー、図鑑、設定パネルなどの UI
- Three.js: 3D シーン、ライト、カメラ、ジオメトリ、テクスチャ、レイキャスト
- `@react-three/fiber`: React と Three.js の接続、Canvas、pointer events
- `@react-three/drei`: カメラ操作補助、既存 OrbitControls
- `vite-plugin-pwa`: PWA manifest と service worker
- Vitest: 純粋関数の単体テスト
- ESLint / Prettier: 静的解析と整形

### 自作する範囲

- グリッド座標、配置、占有、接続、削除のルール
- レシピ検索、工程別の作成可否判定、レシピ指定の優先処理
- seed と stage 番号からのお題生成
- コンベア搬送、マシン処理、内部保持、詰まり処理
- 出荷効率の集計とクリア判定
- ツール選択、接続元選択、編集操作の状態遷移
- ゲーム状態を 3D 表示へ変換する view model

### 追加パッケージ

現時点では追加パッケージは不要です。既存の React Three Fiber と Three.js で、3D 表示、ポインター入力、カメラ操作は実装できます。

乱数生成は決定性が重要なため、外部パッケージを追加せず、テストしやすい小さな seed PRNG を `src/game` に実装します。

## 実装時の検証

各フェーズでは、変更範囲に応じて以下を実行します。

```bash
cd apps/web
pnpm typecheck
pnpm test
pnpm format:check
pnpm build
```

`pnpm lint` は `pnpm format` を実行してファイルを書き換えるため、実行する場合は整形差分を確認してからコミットします。

## 完了条件

- 各タスク設計書に記載したテストが追加され、対象ロジックを検証できること。
- 既存の図鑑、food data、machine data のテストが壊れていないこと。
- PC とスマートフォンの操作仕様が、少なくとも配置、接続、削除、カメラ操作の基本動作を満たすこと。
- ステージのお題、出荷効率、クリア判定が画面上で確認できること。
