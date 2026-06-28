# recipes.ts

## 責務

食品マスタからレシピを導出し、機械と加工種別の対応、レシピ検索、材料集合の順序非依存照合を提供する。

## 型・データ仕様

- `FoodRecipe`: id/name/process/inputFoodIds/outputFoodId/outputFood/canBeServed/difficulty。
- `RecipeSearchInput`: machineId, inputFoodIds、任意 recipeId、任意 recipes。
- `machineProcessMap`: cutter→cutting、heater→heating、mixer→mixing、combiner→combining。他5種は null。

## 関数仕様

### CookingProcess | null getProcessForMachine(machineId)

上記 map の値を返す。

### FoodId[] normalizeFoodIds(foodIds)

新配列を作り `localeCompare` で昇順ソートする。元配列は変更しない。

### boolean hasSameInputs(left, right)（内部）

双方を normalize し、長さと各位置がすべて厳密一致する場合のみ true。重複数も区別する。

### readonly FoodRecipe[] getRecipes(sourceFoodInfos = foodInfos)

process が null でない食品だけを型絞り込みし、登録順を保ってレシピ化する。id/name/process は食品値、inputFoodIds=ingredientIds、outputFoodId=id、outputFood=元食品参照、canBeServed/difficulty もコピー。

### FoodRecipe[] getServableRecipes(recipes = getRecipes())

canBeServed が true のもののみ。

### FoodRecipe | null findRecipeByOutput(outputFoodId, recipes = getRecipes())

outputFoodId 一致の最初、なければ null。

### FoodRecipe[] findRecipesByProcess(process, recipes = getRecipes())

process 一致を順序維持して返す。

### FoodRecipe[] findRecipesForMachine(machineId, recipes = getRecipes())

対応 process が null なら空配列、そうでなければ process 検索結果。

### FoodRecipe | null findCookableRecipe(input)

既定 recipeId=null、recipes=getRecipes()。機械 process が null なら null。まず同 process に限定する。recipeId が指定されていれば同 ID の候補だけを選び、材料 multiset が完全一致する場合だけ返す。未指定なら材料が完全一致する最初の候補。余剰・不足・加工種別違いは null。
