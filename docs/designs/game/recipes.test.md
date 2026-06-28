# recipes.test.ts

## 責務

レシピ導出、機械加工対応、材料正規化、検索、提供可能フィルタを固定する。

## 関数仕様

### void describe('recipes')

導出結果に cooked-rice（heating、rice→cooked-rice）があり raw rice はないこと。cutter/heater/mixer/combiner の process と、storage/shipping/splitter/trash-bin の null を検証する。heater レシピに cooked-rice/toast、splitter は空。`[sliced-tomato,chopped-lettuce]` のソート結果、逆順材料+combiner で salad、heater+egg+明示 fried-egg で fried-egg、cutter では同指定が null を検証する。servable は全件 true で boiled-egg を含まず、output toast の検索結果は toast/トースト。
