# stageGoals.test.ts

## 責務

ステージ目標の決定性、序盤固定順、効率スケール、難易度候補、入力検証を固定する。

## 関数仕様

### void describe('stage goals')

daily/stage8 の反復結果が同一。daily stage1..4 の対象が cooked-rice, toast, salad, potato-salad で各difficulty1。stage1効率.6、stage12効率.8。stage5と12は対象ID+効率の組が異なる。seed normal の stage5..24 は boiled-egg/omelet-base を選ばない。stage0 は RangeError。
