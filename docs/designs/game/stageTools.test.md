# stageTools.test.ts

## 責務

解放材料からの推移的作成可能集合と、累積目標の倉庫・出荷候補を固定する。

## 補助関数仕様

`goal(stageNumber,targetFoodId)` は daily の同 stage goal を作り targetFoodId だけ置換する。

## 関数仕様

### void describe('stage tools')

lettuce+tomato から chopped-lettuce, sliced-tomato, tomato-sauce, salad が作成可能で toast は不可。potato+carrot から cut-potato, chopped-carrot, potato-salad を推移解決。salad の storage 原料は lettuce,tomato。cooked-rice/toast/salad の累積 storage は rice,bread,lettuce,tomato、shipping は cooked-rice,toast,salad の順。
