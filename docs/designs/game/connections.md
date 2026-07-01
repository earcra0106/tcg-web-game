# connections.ts

## 責務

機械間の有向接続を定義し、検索、制約付き追加、削除を行う。

## 型仕様

- `ConnectionId`: string。
- `MachineConnection`: `id`, `fromMachineId`, `toMachineId`。

## 関数仕様

### MachineConnection[] findInputConnections(connections, machineId)

`toMachineId` が一致する接続を元の順序で返す。

### MachineConnection[] findOutputConnections(connections, machineId)

`fromMachineId` が一致する接続を元の順序で返す。

### readonly MachineConnection[] createConnection(connections, machines, connection)

始点・終点機械を ID 検索する。次のいずれかなら元配列参照を返す: 始点と終点が同一機械、機械が不存在、始点が splitter 以外ですでに出力が1本以上、始点が shipping/trash-bin、終点が storage、接続 ID が既存、同一始点・終点の組が既存。成功時だけ末尾へ追加した新配列を返す。入力本数はここでは禁止しない。

### MachineConnection[] removeConnection(connections, connectionId)

指定 ID 以外を返す。

### MachineConnection[] removeConnectionsForMachine(connections, machineId)

始点または終点が指定機械である接続をすべて除外する。
