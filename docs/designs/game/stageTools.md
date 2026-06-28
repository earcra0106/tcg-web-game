# stageTools.ts

## 責務

累積ステージ目標に必要な倉庫材料・出荷対象を導出し、解放食品から推移的に作成可能な食品集合を計算する。

## 関数仕様

### readonly FoodId[] getSpawnableIngredientsForFood(foodId, seen = new Set())

循環防止 Set に既出なら空。直ちに seen へ追加し、未登録食品なら空、storage 生成可能なら `[foodId]`。それ以外は出力レシピを検索し、なければ空。あれば各 input を同じ seen で深さ優先再帰し flatMap する。この共有 seen により同一材料は別枝で再訪されず、戻り値でも実質重複が抑止される。

### FoodId[] uniqueFoodIds(foodIds)（内部）

Set によって最初の出現順を維持して重複除去。

### FoodId[] getStorageFoodIdsForGoals(goals)

各 goal.targetFoodId の spawnable 原料を goal ごとに新規 seen で解決し、連結後に重複除去。

### FoodId[] getShippingFoodIdsForGoals(goals)

targetFoodId を goal 順に重複除去。

### FoodId[] getCraftableFoodIds(unlockedFoodIds, recipes = getRecipes())

解放 ID を Set へ登録し、追加がなくなるまで recipes を登録順に反復する。出力が未登録かつ全 input が登録済みのレシピだけ出力を追加する。最終 Set を挿入順配列にする。存在しない解放 ID もそのまま残る。
