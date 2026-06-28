# random.test.ts

## 責務

seeded random の決定性、salt 差、pick、入力検証を固定する。

## 関数仕様

### void describe('seeded random')

seed kitchen/salt3 の2インスタンスで next, next, nextInt(10) が一致し、salt1/2では先頭 next が異なることを検証する。seed stage/salt7 で `['rice','egg','bread']` から bread を選び、nextInt(0) は RangeError。
