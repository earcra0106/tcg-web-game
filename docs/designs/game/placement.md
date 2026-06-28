# placement.ts

## 責務

格子上に配置された機械の型を定義し、ID・位置検索、重複を防ぐ配置、削除を提供する。

## 型仕様

- `PlacementId`: string。
- `PlacedMachine`: `id`, `machineId`, `position` と任意の `foodId`。foodId は倉庫の生成食品や出荷口の対象食品に使う。

## 関数仕様

### PlacedMachine | null findMachineAtPosition(machines, position)

`gridKey` が一致する最初の機械を返す。なければ `null`。

### PlacedMachine | null findMachineById(machines, machineId)

`id` が厳密一致する最初の機械を返す。なければ `null`。

### readonly PlacedMachine[] placeMachine(machines, machine)

位置が整数格子でない、同じ ID がある、同じ位置が占有済み、のいずれかなら元配列参照を返す。成功時は `[...machines, machine]`。

### readonly PlacedMachine[] removeMachine(machines, machineId)

指定 ID 以外を `filter` した新配列を返す。該当がなくても filter の新配列となる。
