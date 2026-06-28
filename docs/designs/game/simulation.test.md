# simulation.test.ts

## 責務

シミュレーション全体の搬送速度、backpressure、生成加工出荷、中継、構成削除時クリーンアップ、容量、出荷選別を統合検証する。

## 補助関数仕様

`machine(id,type,x,foodId?)` は z=0 の配置、`connection(id,from,to)` は有向接続。

## 関数仕様

### void describe('simulation')

次を検証する。

1. storage→隣接heater の rice が600msで到着して搬送から消え cooked-rice process 開始。
2. 入力6件で満杯の heater に出力接続がある場合、到着 item は progress1 で待つ。
3. 距離2は600msで progress.5、さらに600msで時刻1200に出荷。
4. storage→shipping 最小線は1000msで rice をprogress0搬出、600ms後1600に出荷。
5. storage→heater→shipping は1000+600+1000+600ms後、時刻3200に cooked-rice 出荷。
6. splitter 入力4件・出力4本・delta0 で接続1〜4へ即時搬出し、buffer空、roundRobinIndex4。
7. 削除済み接続上 item は消え、heater入力は空。
8. machines空にすると削除 heater の input/output を含む runtime record が空。
9. 出口なし heater に同時到着7件、toast recipe指定で不一致のeggなら最古item-1が落ち item-2..7を保持。
10. splitter と merger の各パラメータケースで出口がないと、到着・既存input/outputをすべて破棄。
11. rice 対象 shipping に rice/egg が同時到着すると双方搬送から消え、履歴は rice のみ、shipping buffer空。
