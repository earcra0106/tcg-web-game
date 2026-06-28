# food.test.ts

## 責務

全食品マスタの登録順・全属性・参照整合性と、名前解決、フレーム割当、PixiJS sheet data を仕様表に対して検証する。

## データ仕様

`expectedFoods` は `all-foods.md` と同じ52件・同じ順で、各行に id/name/ingredients/process/storage/served/ingredient/difficulty を持つ。spriteId は期待時に id と同値とする。

## 関数仕様

### void describe('food data types')

FoodInfoData として hamburg の全属性を構築できること、foodInfos の ID 順が expectedFoods と完全一致すること、全行の属性と spriteId が一致すること、全 ingredientId が登録済みであることを検証する。curry-rice の材料名が「ごはん、炒め肉、カレーソース」、cooked-rice の加工先がカレーライス、オムライス、チャーハン、エビピラフ、チーズカレー、チキンカレーの順であることも検証する。

全食品フレームが index=登録順、row=floor(index/8)、column=index%8、128角であること、meta が foods.png/1024角、bread.png frame `{384,0,128,128}`、chicken-curry.png が `{384,768,128,128}` であることを検証する。
