# food.ts

## 責務

食品マスタが従う識別子・加工種別・難易度・属性の型契約だけを定義する。実データや関数は持たない。

## 型仕様

- `FoodId`, `FoodSpriteId`: string。
- `CookingProcess`: cutting, heating, mixing, combining。
- `FoodDifficulty`: 数値リテラル 1, 2, 3。
- `FoodInfoData`: `id`, `name`, `ingredientIds`, nullable `process`, `canSpawnFromStorage`, `canBeServed`, `canBeIngredient`, nullable `difficulty`, `spriteId`。
- `FoodGameData`: `FoodInfoData` の別名。

## 関数仕様

関数は定義しない。
