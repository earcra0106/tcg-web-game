# viewport.test.ts

## 責務

viewport の最低寸法、pixel ratio 上限、aspect 計算を固定する。

## 関数仕様

### void describe('viewport helpers')

0×0/DPR1 は1×1/DPR1、1200×800/DPR3 は同寸/DPR2、16×9 の aspect は `16/9` に近似一致。
