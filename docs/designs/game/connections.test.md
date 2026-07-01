# connections.test.ts

## 責務

機械接続の方向検索、追加制約、削除を固定する。

## フィクスチャ仕様

machine-1..7 を順に cutter, heater, mixer, splitter, storage, shipping, trash-bin として x=0..6 に置く。基準接続は connection-1: machine-1→machine-2。

## 関数仕様

### void describe('machine connections')

既存機械間の追加成功、全機種の自己接続拒否、同一方向重複拒否（ID違い）、ID重複拒否（経路違い）、通常機の複数出力拒否と splitter の許可、storage への入力拒否、shipping/trash-bin からの出力拒否、始点/終点不存在拒否を検証する。拒否はいずれも元配列参照を期待する。また machine-2 の入力/出力検索が該当1件ずつになること、ID削除と machine-2 関連削除の結果を検証する。
