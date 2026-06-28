# stageGoals.ts

## 責務

seed と1始まりのステージ番号から、序盤固定・以降疑似ランダムの出荷目標と必要効率を決定する。

## 型・データ仕様

- `StageGoal`: stageNumber, targetFoodId/name, difficulty(非null), requiredEfficiency。
- `StageGoalInput`: seed, stageNumber、任意 recipes。
- 固定目標: stage 1〜4 は順に cooked-rice, toast, salad, potato-salad。

## 関数仕様

### void assertStageNumber(stageNumber)（内部）

正の整数でなければ `RangeError('stageNumber must be a positive integer')`。

### number calculateRequiredEfficiency(stageNumber)（内部）

`efficiencySettings.ts` の毎分基準値を使い、1〜4は `introBasePerMinute+stage*increasePerMinute`、5以降は `laterBasePerMinute+floor((stage-1)/stagesPerIncrease)*increasePerMinute`。`maximumPerMinute` を上限とし、`EFFICIENCY_UNIT_MS/60000` を乗算して10秒単位へ換算後、小数第2位へ `round(value*100)/100`。

### FoodDifficulty calculateMaxDifficulty(stageNumber)（内部）

1〜5は1、6〜10は2、11以上は3。

### StageGoal toStageGoal(stageNumber, recipe)（内部）

difficulty が null なら `Error('Stage goal recipe must have difficulty: '+id)`。それ以外は recipe の出力 ID・name・difficulty と算出効率から goal を作る。

### StageGoal getStageGoal({ seed, stageNumber, recipes })

番号を検査し、`getServableRecipes(recipes)` を候補元にする。stage 1〜4で対応固定 ID が候補に存在すればそれを返す。なければ最大難易度以下かつ difficulty 非nullに絞り、`createSeededRandom(seed, stageNumber).pick` する。候補なしなら `Error('No servable recipes are available for stage goals')`。固定 ID が欠けた場合もランダム選択へフォールバックする。
