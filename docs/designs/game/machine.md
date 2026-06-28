# machine.ts

## 責務

機械種別、表示名、内部在庫を持つ加工機の分類を一元管理する。

## 型・データ仕様

- `MachineId`: storage, shipping, splitter, merger, cutter, heater, mixer, combiner, trash-bin の9種。
- `MachineInfoData`: `{ id: MachineId; name: string }`。
- `machineInfos` は上記順で、名称は順に「倉庫、出荷口、分岐機、合流機、切断機、加熱機、ミキサー、合体機、ゴミ箱」。
- 内部在庫対象は cutter, heater, mixer, combiner のみ。

## 関数仕様

### MachineInfoData | null getMachineInfo(id: MachineId)

最初の一致データ、なければ null。

### boolean hasMachineInventory(id: MachineId)

内部 Set に含まれる加工機4種だけ true。
