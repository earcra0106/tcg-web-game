# efficiencySettings.ts

## 責務

出荷効率の表示単位と、ステージ目標の効率カーブを一箇所で管理する。

## 定数仕様

- `EFFICIENCY_UNIT_MS=10000`: 出荷効率を10秒あたりの値として算出する。
- `STAGE_GOAL_EFFICIENCY_SETTINGS`: ステージ目標の効率設定。通常ステージでは `increasePerStage=5` をステージ番号に乗算し、ステージ番号が5の倍数なら `multipleOfFive=10` を使用する。いずれも10秒あたりの値。
