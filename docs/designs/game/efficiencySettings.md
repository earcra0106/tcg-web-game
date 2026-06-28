# efficiencySettings.ts

## 責務

出荷効率の表示単位と、ステージ目標の効率カーブを一箇所で管理する。

## 定数仕様

- `EFFICIENCY_UNIT_MS=10000`: 出荷効率を10秒あたりの値として算出する。
- `STAGE_GOAL_EFFICIENCY_SETTINGS`: 毎分基準の目標カーブ設定。序盤・通常ステージの基準値、増分、増分間隔、上限を持つ。`stageGoals.ts` が表示単位へ換算する。
