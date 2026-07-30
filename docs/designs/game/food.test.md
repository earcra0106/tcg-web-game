# food.test.ts

## 責務

全食品マスタの登録順・全属性・参照整合性と、名前解決、フレーム割当、PixiJS sheet data を仕様表に対して検証する。

## データ仕様

`expectedFoods` は `all-foods.md` と同じ50件・同じ順で、各行に id/name/ingredients/process/storage/served/ingredient/difficulty を持つ。spriteId は期待時に id と同値とする。

## 関数仕様

### void describe('food data types')

FoodInfoData として hamburg の全属性を構築できること、foodInfos の ID 順が expectedFoods と完全一致すること、全行の属性と spriteId が一致すること、全 ingredientId が登録済みであることを検証する。curry-rice の材料名が「ごはん、炒め肉、カレーソース」、cooked-rice の加工先がカレーライス、オムライス、チャーハン、エビピラフ、チーズカレー、チキンカレーの順であることも検証する。

全食品フレームが、削除済みのゆで卵・卵サンドの予約枠（23、36）を除く登録順の index、対応する row/column、128角であることを検証する。meta が foods.png/1024角、bread.png frame `{384,0,128,128}`、chicken-curry.png が `{384,768,128,128}` であることも検証する。
