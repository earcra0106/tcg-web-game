# Voxel Kitchen Automation 要件定義書

## 1. プロジェクト概要

### ゲームタイトル

Voxel Kitchen Automation（ボクセル・キッチン・オートメーション）

### コンセプト

コトコト運ばれる食材、トントン刻まれる音。あなただけの、世界一心地よい自動化キッチンへようこそ。

温かみのあるボクセルアートと、料理を題材にしたラインビルドパズルを組み合わせた自動化シミュレーションゲームとする。派手な演出よりも、見やすさ、手触り、配置の試行錯誤、効率改善の面白さを重視する。

## 2. 技術要件

本リポジトリの既存仕様を優先し、`apps/web` 配下の Vite + React + TypeScript 構成で実装する。

### 技術スタック

- Vite: 開発サーバーと本番ビルド
- React: HUD、メニュー、アプリケーションの UI 境界
- TypeScript: 型安全な実装
- Three.js: 3D レンダリング、シーン、カメラ、ライト、メッシュ
- vite-plugin-pwa: PWA manifest と service worker 生成
- ESLint / Prettier: 静的解析と整形
- Vitest: 単体テスト

### パッケージで解決する範囲

- Vite による dev server、build、preview
- React による UI 描画
- Three.js による WebGL レンダリング
- vite-plugin-pwa による PWA 化
- ESLint / Prettier による品質チェック
- Vitest によるテスト実行

### 自作する範囲

- Three.js のシーン構成、ゲームループ、描画対象の管理
- グリッド座標、配置物、衝突判定、レイキャスト処理
- コンベア、切断機、加熱機、出荷口などのゲームロジック
- レシピデータとシード値ベースのお題生成
- 入力状態の管理
- canvas のリサイズ処理
- HUD とゲーム進行表示
- DOM や WebGL に強く依存しない純粋関数と対応テスト

### アニメーション方針

食材移動や調理機械の演出は、まず Three.js のゲームループ内で実装する。GSAP などの外部アニメーションライブラリは、既存構成に追加する必要性が明確になった場合に導入を検討する。

## 3. 画面・操作要件

### 対応環境

- PC とスマートフォンの両方で動作する
- 画面サイズ変更時に canvas とカメラアスペクト比を適切に更新する
- PWA としてインストール可能にする

### カメラ操作

- PC ではマウスまたはキーボードによる操作に対応する
- スマートフォンではタッチ操作に対応する
- カメラ操作は、グリッド配置操作を妨げないように設計する

### 配置操作

- グリッド上のセルを選択できる
- 選択したセルにコンベアや調理機械を配置できる
- 配置物は整数座標のグリッドにスナップする
- 既存の配置物と衝突する位置には重複配置できない

## 4. 機能要件

### グリッドシステム

- 3D 空間を 2D グリッドとして扱う
- すべての配置物は `(x, z)` の整数座標で管理する
- グリッド座標と Three.js のワールド座標を相互変換できる
- レイキャストにより、ユーザーが指したグリッドセルを判定する

### 調理設備

`docs/requirements/food.md` に記載。

### 食材搬送

- 食材はコンベア上を方向に沿って移動する
- コンベアは `NORTH`、`SOUTH`、`EAST`、`WEST` の方向を持つ
- 食材が 1 マス進んだ後、次のグリッドにある設備へ引き渡す
- 次の受け渡し先がない場合の停止または破棄ルールを定義する
- 搬送中の食材には滑らかな移動演出を付ける
- 必要に応じて、小さな上下バウンドなどの視覚演出を付ける

### レシピ・お題生成

- ステージごとにお題を生成する
- お題には対象レシピと必要効率を含める
- 同じシード値とステージ番号では同じお題を生成する

`docs/requirements/food.md` に記載。

### クリア条件

- 指定された料理を出荷口へ届ける
- 一定時間内または一定期間の効率が、ステージで要求される値を満たす
- クリア時には成功演出と進行状態の更新を行う

### 音響

- 以下の効果音を再生できる構成にする

| ファイル名 | 用途 |
| --- | --- |
| `conveyor_move.mp3` | コンベアの環境駆動音 |
| `cut.mp3` | 切断時の効果音 |
| `cook.mp3` | 加熱完了時の効果音 |
| `success.mp3` | お題クリア時の効果音 |

## 5. デザイン要件

### ビジュアル方針

- 温かみのあるボクセル表現を採用する
- UI はゲーム画面の視認性を妨げないようにする
- 配置、効率、達成状況を素早く把握できる HUD を提供する
- 3D モデルは原則として Three.js のジオメトリを組み合わせて生成し、重い外部 3D モデルの読み込みは避ける

### カラーパレット

| 用途 | カラーコード | カラーネーム | 役割 |
| --- | --- | --- | --- |
| 背景・床面 | `#F4EAE1` | Milk Tea Beige | 空間全体の主色 |
| グリッド線 | `#EEDCC8` | Soft Oak | 配置の目安 |
| コンベアベース | `#FFFDF9` | Pure Ivory | 食材を引き立てる色 |

各食材は制作時に決定

### フォント

- 欧文・数字: `Nunito`, sans-serif
- 和文: `Zen Maru Gothic`, sans-serif

外部フォントの導入は、表示品質、読み込み速度、ライセンスを確認したうえで判断する。

## 6. ディレクトリ構成

既存の `apps/web` 構成に従う。ゲーム機能の追加時は、責務に応じて `src/game`、`src/components`、`src/styles`、`public` に配置する。

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
├── index.html
├── package.json
├── vite.config.ts
└── vitest.config.ts
```

想定される追加ファイルは以下とする。

```text
apps/web/src/game
├── grid.ts
├── machines.ts
├── recipes.ts
└── simulation.ts

apps/web/public/audio
├── conveyor_move.mp3
├── cut.mp3
├── cook.mp3
└── success.mp3
```

## 7. PWA 要件

PWA は `vite-plugin-pwa` により生成する。手書きの `manifest.json` や `sw.js` をルートに追加する方針は採用しない。

### Manifest 設定方針

- アプリ名: Voxel Kitchen Automation
- short name: VoxelKitchen
- display: standalone
- orientation: landscape
- background color: `#F4EAE1`
- theme color: `#A8DADC`
- アイコン: `public` 配下の PWA 用アイコンを参照する

## 8. 品質要件

### テスト

- グリッド座標計算は純粋関数として切り出し、Vitest でテストする
- レシピ生成は、同じシード値で同じ結果になることをテストする
- 入力状態とビューポート計算は既存テスト方針を維持する

### 確認コマンド

```bash
cd apps/web
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
pnpm build
```
