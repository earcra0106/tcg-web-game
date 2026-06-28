# gameState.ts

## 責務

配置機械・接続・ステージ・選択を統合した不変ゲーム状態を定義し、下位モジュールの操作を参照同一性を保ちながら適用する。

## 型仕様

- `GameSelection`: `selectedMachineId: PlacementId | null`。
- `GameState`: `machines`, `connections`, `stageIndex`, `selection`。

## 関数仕様

### GameState createInitialGameState()

空の機械・接続、`stageIndex: 0`、未選択を返す。

### GameState placeMachineInState(state, machine)

`placeMachine` を適用する。拒否され配列参照が同じなら state 自体を返し、成功時は machines のみ差し替える。

### GameState removeMachineFromState(state, machineId)

削除後の件数が同じなら state 自体を返す。成功時は機械、関連接続を削除し、削除機が選択中なら選択を null にする。それ以外の選択は維持する。

### GameState connectMachinesInState(state, connection)

`createConnection` が元配列を返したら state 自体、成功なら connections のみ更新した新状態。

### GameState removeConnectionFromState(state, connectionId)

削除後の件数が同じなら state 自体、それ以外は connections のみ更新した新状態。
