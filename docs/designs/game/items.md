# items.ts

## 責務

食品アイテムとコンベア搬送中アイテムの型・生成・進捗更新を定義する。

## 型仕様

- `FoodItemId`: string。
- `FoodItem`: `id`, `foodId`, `createdAtMs`。
- `TransportingFoodItem`: FoodItem に `connectionId`, `fromMachineId`, `toMachineId`, `progress` を追加。
- `CreateFoodItemInput`: FoodItem と同じ3フィールド。

## 関数仕様

### FoodItem createFoodItem(input: CreateFoodItemInput)

入力3フィールドを同値で持つ新規オブジェクトを返す。

### TransportingFoodItem createTransportingFoodItem(item, connectionId, fromMachineId, toMachineId)

item をスプレッドし、搬送経路情報と `progress: 0` を追加する。

### TransportingFoodItem advanceTransportingFoodItem(item, deltaProgress: number)

item をスプレッドし、進捗を `Math.max(0, Math.min(1, item.progress + deltaProgress))` に更新する。0未満・1超過をクランプする。
