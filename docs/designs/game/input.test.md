# input.test.ts

## 責務

入力初期値、キーマッピング、更新、移動ベクトルを固定する。

## 関数仕様

### void describe('input state')

4方向false、KeyW→forward、ArrowDown→backward、KeyA→left、ArrowRight→right、Space→null を検証。KeyW押下で forward のみtrue、Spaceは同一参照。forward+right は `{x:1,z:-1}`。
