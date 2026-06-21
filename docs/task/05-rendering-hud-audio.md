# 05 Rendering HUD Audio 設計書

## 目的

ゲーム状態を見やすい 3D 盤面と HUD に反映し、出荷効率、ステージ目標、選択状態、成功演出、効果音を提供します。

## 変更予定のフォルダ構成

```text
apps/web/src/components
├── GameScene.tsx
├── MachineObject.tsx
├── ConveyorObject.tsx
├── FoodItemObject.tsx
├── StageHud.tsx
├── ToolBar.tsx
└── MachineInspector.tsx

apps/web/src/game
├── renderView.ts
├── renderView.test.ts
└── audio.ts

apps/web/public/audio
├── conveyor_move.mp3
├── cut.mp3
├── cook.mp3
└── success.mp3
```

## ファイルごとの責務

- `renderView.ts`
  - `GameState` と simulation state から表示用 view model を作成します。
  - マシン位置、接続線、搬送中 food の補間位置、HUD 表示値をまとめます。
- `MachineObject.tsx`
  - 既存 machine sprite 情報または Three.js ジオメトリでマシンを表示します。
  - 選択中、配置不可、処理中などの状態を視覚化します。
- `ConveyorObject.tsx`
  - 接続元から接続先へ向かう搬送路を表示します。
  - 方向がわかる矢印または流れのマークを表示します。
- `FoodItemObject.tsx`
  - 既存 food sprite sheet を使い、搬送中 food を 3D 盤面上に表示します。
  - 移動進捗に応じて位置を補間します。
- `StageHud.tsx`
  - ステージ番号、対象料理、必要効率、現在効率、クリア状態を表示します。
  - ステージ2以降は、それまでのステージ目標に新しい料理を1つ追加した累積目標を表示します。
- `audio.ts`
  - 効果音の読み込み、再生、ミュート状態を管理します。

## 実装のポイント

- 盤面は最初の画面として全画面 Canvas を維持します。
- HUD は視認性を優先し、既存の温かい色調と 8px 以下の角丸を維持します。
- food と machine の既存 sprite asset を優先して使い、重い外部 3D モデルは追加しません。
- 食材移動はシミュレーション state の進捗から表示位置を補間し、ロジックの tick と描画フレームを分離します。
- 成功演出は HUD 表示と軽い 3D エフェクトに留め、ゲーム操作を妨げないようにします。
- ステージ目標を達成して次ステージへ進むときも、配置済みの生産ラインは削除しません。
- ステージ2以降のクリア判定は、新しく追加された料理だけでなく、それまでの全ステージ目標の生産効率を維持していることを条件にします。
- 単一 `StageGoal` 前提の表示から、複数料理の累積目標と料理ごとの現在効率を扱える HUD 表示へ拡張します。
- 効果音ファイルがない環境でもビルドできるよう、音声追加は asset 配置と同時に行います。
- PWA 設定は既存 `vite-plugin-pwa` を維持し、追加 audio を precache 対象に含めるかは容量を確認して判断します。

## パッケージ利用範囲

- Three.js と R3F を描画に使います。
- `@react-three/drei` はカメラ操作や軽量な補助表示に使います。
- 音響はブラウザ標準の `HTMLAudioElement` または Web Audio API で足りる範囲に留め、追加パッケージは導入しません。

## テスト観点

- `renderView.ts` がゲーム状態から安定した表示用データを返すこと。
- 搬送中 food の補間位置が進捗 0、0.5、1 で期待位置になること。
- HUD 表示値が stage goal と出荷履歴から正しく作られること。
- 複数の累積ステージ目標について、各料理の効率と達成状態が個別に表示されること。
- 次ステージへ進んでも `GameState` の配置済みマシン、接続、マシン設定が保持されること。
- audio のミュート時に再生要求しても副作用を抑制できること。
- `pnpm build` で audio asset と PWA 設定が破綻しないこと。
