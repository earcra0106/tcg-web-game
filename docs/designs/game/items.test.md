# items.test.ts

## 責務

食品アイテム生成と搬送進捗の作成・上限クランプを固定する。

## 関数仕様

### void describe('food items')

item-1/rice/createdAt120 が同値で生成されること。createdAt0 の rice を connection-1、storage-1→heater-1 で搬送化し、delta .4 で progress .4、delta2で1になることを検証する。
