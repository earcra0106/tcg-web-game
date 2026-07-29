# stageGoals.ts

## 責務

seed と1始まりのステージ番号から、難易度と導入条件に応じた候補を決定的な疑似乱数で選び、出荷目標と必要効率を決定する。

## 型・データ仕様

- `StageGoal`: stageNumber, targetFoodId/name, difficulty(非null), requiredEfficiency。
- `StageGoalInput`: seed, stageNumber、任意 recipes。
- お題候補は `getServableRecipes(recipes)` のうち、`difficulty` が非nullのレシピとする。
- stage 1 の候補は、難易度1かつ、倉庫から搬出できる材料1つを1回加工して完成するレシピとする。すなわち、入力材料が1件であり、その材料の `process` が `null` であることを条件とする。
- stage 1〜6 は、すでに選ばれた対象料理を候補から除外する。同一 seed では stage 1 から順に選択を再現して重複を防ぐ。
- stage 7 以降は過去の対象料理を除外しないため、お題が重複しうる。

## 関数仕様

### void assertStageNumber(stageNumber)（内部）

正の整数でなければ `RangeError('stageNumber must be a positive integer')`。

### number calculateRequiredEfficiency(stageNumber)（内部）

通常は `stageNumber*increasePerStage` として10秒あたりの要求効率を返す。ステージ番号が5の倍数の場合は、`multipleOfFive`（10秒あたり10）を返す。

### StageGoalCandidateRule getStageGoalCandidateRule(stageNumber)（内部）

各ステージの候補条件を以下のとおり返す。stage 7以降で3の倍数である条件を、全難易度の条件より優先する。

| ステージ | 候補条件 |
| --- | --- |
| 1 | 難易度1かつ、材料1つを1回加工して完成する料理 |
| 2 | 難易度1かつ、材料1つを1回加工して完成する料理 |
| 3 | 難易度1かつ、材料1つを1回加工して完成する料理に該当しない料理 |
| 4 | 難易度2 |
| 5 | 難易度1 |
| 6 | 難易度2 |
| 7 | 難易度3 |
| 8 | 難易度2 |
| 9 | 難易度3 |
| 10以降の3の倍数 | 難易度3 |
| その他の10以降 | 難易度1〜3のすべて |

### StageGoal toStageGoal(stageNumber, recipe)（内部）

difficulty が null なら `Error('Stage goal recipe must have difficulty: '+id)`。それ以外は recipe の出力 ID・name・difficulty と算出効率から goal を作る。

### StageGoal getStageGoal({ seed, stageNumber, recipes })

番号を検査し、候補元を `getServableRecipes(recipes)` とする。ステージごとの候補条件で絞り込み、stage 1〜6では同じ seed による先行ステージの対象料理を除外する。候補から `createSeededRandom(seed, stageNumber).pick` で1件を選ぶ。stage 7以降は先行ステージの対象料理を除外しない。候補なしなら `Error('No servable recipes are available for stage goals')`。
