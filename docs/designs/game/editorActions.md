# editorActions.ts

## 責務

ゲーム状態、エディタ操作状態、機械実行設定を `EditorModel` に統合し、盤面・機械・接続のクリック、接続ドラッグ、レシピ設定を不変更新として解釈する。

## 型・内部規約

- `EditorMachineConfigs`: placement ID を `MachineRuntimeConfig` に対応させる readonly record。
- `EditorModel`: `gameState`, `editorState`, `machineConfigs`。
- 機械 ID は `machine-${nextMachineIndex}`、接続 ID は `connection-${nextConnectionIndex}`。
- storage を foodId 付きで配置した場合だけ config は `{spawnFoodId: foodId}`。他は空オブジェクト。

## 関数仕様

### EditorModel createInitialEditorModel(gameState = createInitialGameState())

指定 gameState、初期 editorState、空 configs を返す。

### string createMachineId(index: number)（内部）

入力を検査・丸めせず、テンプレートリテラル `machine-${index}` を返す。

### string createConnectionId(index: number)（内部）

入力を検査・丸めせず、テンプレートリテラル `connection-${index}` を返す。

### MachineRuntimeConfig getMachineConfig(machineId: string, foodId: FoodId | undefined)（内部）

machineId が `storage` かつ foodId が undefined でない場合だけ `{ spawnFoodId: foodId }`、それ以外は空オブジェクト。MachineId 型ではなく string を受ける。

### GameState setSelectedMachine(gameState: GameState, selectedMachineId: PlacementId | null)（内部）

gameState をスプレッドし、selection を既存値とのマージではなく `{ selectedMachineId }` に置換する。

### EditorMachineConfigs removeMachineConfig(machineConfigs, machineId)（内部）

configs を浅くコピーし、ブラケット記法で該当プロパティを delete して返す。該当なしでも新規オブジェクト。

### EditorModel handleGridClick(model, position)

配置ツール以外では、select の場合だけ選択機械とクリック接続元を null にした新 model を返す（ドラッグ元は維持）。connect/delete は元 model。

配置ツールでは次番号から機械を作り、tool の machineId/foodId と位置を設定して `placeMachineInState`。拒否なら元 model。成功なら新機械を選択し、nextMachineIndex を1増やし、ID に対応する config を追加する。ツールは維持する。

### EditorModel handleMachineClick(model, machineId)

機械が存在しなければ元 model。delete ツールなら機械・関連接続・config を削除し、両接続元を null。connect 以外なら機械を選択しクリック接続元を null。connect で接続元未設定ならクリック機を選択・接続元にする。設定済みならその元からクリック機へ次番号の接続を試み、結果にかかわらずクリック機を選択し接続元を null、成功時だけ接続番号を1増やす。

### EditorModel handleConnectionClick(model, connectionId)

delete ツール以外は元 model。delete なら `removeConnectionFromState` の結果で gameState を置換する（不存在なら gameState は同一だが model は新規）。

### EditorModel startConnectionDrag(model, machineId)

connect ツールかつ機械が存在するときだけ dragConnectionSourceMachineId を設定した新 model。それ以外は元 model。

### EditorModel finishConnectionDrag(model, targetMachineId)

ドラッグ元または target が null なら、ドラッグ元を null にした新 model（両方とも元から null でも新規）。双方があれば次番号で接続を試行し、ドラッグ元を必ず null、成功時だけ番号を1増やす。クリック接続元・選択は変更しない。接続先の存在/制約は `connectMachinesInState` に委譲する。

### EditorModel setMachineRecipe(model, machineId, recipeId)

機械不存在なら元 model。存在すれば configs の対象エントリをスプレッド（未定義も許容）し `recipeId` を設定する。null は自動レシピ選択を意味し、undefined にはしない。機械種別・レシピ妥当性は検査しない。
