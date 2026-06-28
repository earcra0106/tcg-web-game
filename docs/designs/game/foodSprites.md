# foodSprites.ts

## 責務

食品登録順から 8列スプライトシートのフレーム一覧と PixiJS `SpritesheetData` を構築し、フレーム検索を提供する。

## データ仕様

- URL `/assets/sprites/foods.png`、sheet 1024×1024、cell 128×128、列数8。
- `foodSpriteIndexes` は foodInfos の各 spriteId を登録 index に対応させる。同じ spriteId があれば後の index が勝つ。
- `foodSpriteFrames` は Object.entries の順で、key=`id.png`、column=`index%8`、row=`floor(index/8)`、x/y は column/row×128。
- `foodSpritesheetData.frames` は各矩形、同寸 sourceSize/spriteSourceSize、中心 anchor `{0.5,0.5}`。meta は image URL、format `RGBA8888`、size 1024角、scale文字列`'1'`。

## 関数仕様

### FoodSpriteFrame | null getFoodSpriteFrame(spriteId: FoodSpriteId)

ID 一致の最初のフレーム、なければ null。
