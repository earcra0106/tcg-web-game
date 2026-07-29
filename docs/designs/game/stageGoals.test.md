# stageGoals.test.ts

## 責務

ステージ目標の決定性、ステージ別の候補条件、重複規則、効率スケール、入力検証を固定する。

## 関数仕様

### void describe('stage goals')

同じ seed・stageNumber の反復結果が同一であることを検証する。stage 1 は難易度1かつ、倉庫材料1つを1回加工して完成する料理だけを選ぶ。stage 2・4 は難易度1、stage 3・5 は難易度2、stage 6 は難易度3だけを選ぶ。stage 1〜6は対象料理が重複しない。stage 7以降のうち3の倍数（stage 9、12など）は難易度3だけを選び、その他は難易度1〜3のすべてを候補にする。stage 7以降は過去の対象料理と重複する結果を許容する。10秒あたりのstage1効率.1、stage12効率.13。stage0 は RangeError。
