# machineRuntime.test.ts

## 責務

倉庫生成、加工、容量、レシピ変更、中継、分岐、公害物処理の runtime 遷移を固定する。

## 補助関数仕様

`machine(id,type)` は (0,0) の配置、`item(id,foodId)` は createdAt0、`createItemId()` は常に `created-item`。

## 関数仕様

### void describe('machine runtime')

次の12ケースを検証する。

1. storage/rice は接続ありでも1999msでは出力せず、2000msで生成する。
2. storage は2000ms到達時に接続がなければ生成せずelapsedを0へ戻し、接続後も次の2000msを待つ。
3. output capacity+1 回生成しても item-1 のみ。
4. heater に rice を与え delta0 で cooked-rice process・入力消費、次の500msで出力。
5. 既存 toast 出力中に cooked-rice 完成すると新出力を捨て process null。
6. cooked-rice 完成と同時に config toast/入力bread なら旧出力を作り次の toast process を開始。
7. combiner に sliced-tomato のみでは process なし・入力維持。
8. heater config toast に rice は不一致で維持。
9. splitter の4接続へ5 item を順に抽出すると接続1,2,3,4,1。
10. merger 入力 rice,egg は rice だけ出力、egg を維持。
11. cheese-toast 用に旧/新 toast・cheese があれば旧2件を消費し新2件を残す。
12. trash-bin は受入可能で、receive は同一 runtime 参照。
