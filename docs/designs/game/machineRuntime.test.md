# machineRuntime.test.ts

## 責務

倉庫生成、加工、容量、レシピ変更、中継、分岐、公害物処理の runtime 遷移を固定する。

## 補助関数仕様

`machine(id,type)` は (0,0) の配置、`item(id,foodId)` は createdAt0、`createItemId()` は常に `created-item`。

## 関数仕様

### void describe('machine runtime')

次の11ケースを検証する。

1. storage/rice が1000msで created-item/rice/時刻1000を出力。
2. output capacity+1 回生成しても item-1 のみ。
3. heater に rice を与え delta0 で cooked-rice process・入力消費、次の1000msで出力。
4. 既存 toast 出力中に cooked-rice 完成すると新出力を捨て process null。
5. cooked-rice 完成と同時に config toast/入力bread なら旧出力を作り次の toast process を開始。
6. combiner に sliced-tomato のみでは process なし・入力維持。
7. heater config toast に rice は不一致で維持。
8. splitter の4接続へ5 item を順に抽出すると接続1,2,3,4,1。
9. merger 入力 rice,egg は rice だけ出力、egg を維持。
10. cheese-toast 用に旧/新 toast・cheese があれば旧2件を消費し新2件を残す。
11. trash-bin は受入可能で、receive は同一 runtime 参照。
