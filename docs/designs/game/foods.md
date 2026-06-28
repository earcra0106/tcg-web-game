# foods.ts

## 責務

全食品マスタを公開し、食品検索と加工関係の表示名解決を提供する。

## データ仕様

`foodInfos` は `allFoodInfos` と同じ参照・同じ登録順序で公開する。

## 関数仕様

### FoodInfoData | null getFoodInfo(id: FoodId)

ID が一致する最初の食品、なければ null。

### string[] getIngredientNames(food: FoodInfoData)

ingredientIds を順番どおり名前へ変換する。未登録 ID は ID 文字列自体を返す。

### string[] getProcessedIntoNames(foodId: FoodId)

ingredientIds に foodId を含む全食品を登録順に抽出し、name の配列を返す。
