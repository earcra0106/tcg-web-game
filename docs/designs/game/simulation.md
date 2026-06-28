# simulation.ts

## 責務

盤面構成を入力として、搬送、到着配送、機械稼働、出力搬出、出荷履歴を決定論的な1ステップで更新する。

## 型・定数仕様

- `CONVEYOR_TRAVEL_TIME_MS=600`（互換用公開定数。実進捗計算は速度定数を使う）。
- `SimulationState`: nowMs, nextItemIndex, 搬送 items, runtime record, shippingHistory。
- `SimulationInput`: machines, connections, deltaMs、任意 configs と stageGoal。stageGoal は現実装では未使用。

## 関数仕様

### SimulationState createInitialSimulationState(nowMs = 0)

指定時刻、nextItemIndex=1、空 items/runtimes/history。

### string createItemId(index)（内部）

`item-${index}`。

### number calculateConnectionLength({item,machines})（内部）

始終機械がなければ1。あれば grid x/z のユークリッド距離を計算し最低0.001。

### DeliveryResult deliverArrivedItems(...)（内部）

items を順番に処理する。progress<1 は waiting に維持。到着先 runtime 不在は破棄。splitter/merger に出力接続がなければ破棄。受入不可かつ出力接続ありなら progress=1 のまま waiting。shipping は配置 foodId と item.foodId が一致する場合だけ nowMs で履歴追加し、常に item を消費。trash-bin も消費。その他は `receiveMachineInput` で runtime record をその場更新する。出力接続なしの通常加工機は満杯でも receive が最後6件を保持するため最古を落として到着品を受ける。

### RuntimeAdvanceResult advanceRuntimes(...)（内部）

machines 順に存在する runtime を `advanceMachineRuntime` し新 record へ格納する。ID factory は現在 index を `item-N` 化後に1増やす。configs は placement ID で参照。runtime 不在は飛ばす。

### TransportingFoodItem[] extractOutputs(...)（内部）

待機 items コピーと、その connectionId の占有 Set を作る。各機械について出力接続を得る。出口なし splitter/merger は input/output を即空にする。他は output を抽出し、接続を占有、progress=0 の搬送 item を追加する。通常機械は1回で終了。splitter/merger は抽出後 delta=0 で次入力を出力へ移し、空または全接続占有までループする。この内部呼出の ID factory は空文字だが中継機なので生成には使われない。

### SimulationState stepSimulation(state, input)

deltaMs<0 は `RangeError('deltaMs must be greater than or equal to zero')`。nowMs を加算する。存在しない接続上の旧 items を削除し、machines に runtime を同期。移動セル=`deltaMs/1000*5/3`、各 item の進捗増分は移動セル/接続長。順に到着配送→全 runtime 稼働→出力抽出を行う。返却 state は更新時刻・ID index・新 items/runtimes/history。machineConfigs 省略時は空 record。1ステップ内で到着材料が加工開始でき、完成出力は即搬送開始できる。
