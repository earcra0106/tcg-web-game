# machineRuntime.ts

## 責務

各配置機械の入力・出力バッファ、加工進捗、倉庫タイマー、分岐ラウンドロビン位置を管理し、1ステップの生成・加工・中継と出力取り出しを実装する。

## 型・定数仕様

- `STORAGE_SPAWN_INTERVAL_MS=2000`, `MACHINE_PROCESS_TIME_MS=500`, `MACHINE_INPUT_CAPACITY=6`, `MACHINE_OUTPUT_CAPACITY=1`。
- `MachineRuntimeConfig`: 任意 spawnFoodId、任意 `recipeId`（FoodId|null）。
- `MachineProcessRuntime`: recipeId, outputFoodId, remainingMs。
- `MachineRuntime`: placementId, machineId, readonly input/output buffers, nullable process, storageElapsedMs, roundRobinIndex。
- `AdvanceMachineRuntimeInput`: runtime, deltaMs, nowMs, 任意の出力接続有無/config/recipes、必須 ID factory。
- `ExtractMachineOutputInput`: runtime, 出力接続一覧。

## 関数仕様

### MachineRuntime createMachineRuntime(machine)

配置 ID・機械種をコピーし、両 buffer 空、process null、elapsed/index 0。

### Record syncMachineRuntimes(machines, runtimes)

現在の machines だけをキーに新 record を構築する。同 ID runtime があり machineId も一致すれば参照を再利用し、それ以外は初期化。削除機の runtime は脱落する。

### boolean canAcceptMachineInput(runtime)

storage は false。shipping/trash-bin は常に true。他は input length<6。

### MachineRuntime receiveMachineInput(runtime, item)

shipping/trash-bin は消費扱いで元 runtime を返す。他は末尾に item を追加して最後の6件だけを保持するため、満杯時は最古が落ちる。capacity 判定は呼出側責務。

### boolean isSpawnableFood(foodId)（内部）

食品が存在し `canSpawnFromStorage===true` の場合だけ true。

### boolean includesFoodIds(items, foodIds)（内部）

items の foodId コピーから要求 ID を順番に1件ずつ `indexOf`/`splice` し、重複数を含め全要求があれば true。

### FoodRecipe | null findConsumableRecipe(...)（内部）

機械対応レシピに限定する。config.recipeId が undefined/null 以外ならその ID かつ材料包含のものだけ。未指定/nullなら材料が包含される最初のレシピ。入力の余剰は許容する。

### {consumedItems, remainingItems} consumeRecipeInputs(buffer, recipe)（内部）

要求 ID コピーを持ち、buffer を古い順に走査する。まだ必要な foodId の item は consumed に入れて要求を1つ除去、それ以外は remaining。よって各材料の最古一致を消費する。

### MachineRuntime startProcessIfReady(runtime, config, recipes)（内部）

process 中なら同一参照。消費可能レシピなしも同一参照。あれば必要入力を除き、`{recipeId, outputFoodId, remainingMs:500}` を process にする。

### MachineRuntime advanceStorage(input)（内部）

spawnFoodId が未設定/生成不可なら elapsed を0にする。設定済みなら elapsed+deltaMs。2000未満は蓄積のみ。到達時は elapsed から2000を1回だけ引き、出力接続がなければ生成せず次周期を待つ。接続があれば ID factory を呼んで nowMs の item を作る。出力が1件以上なら新 item を破棄し既存 buffer を維持、空なら追加する。大きい delta でも1呼出で最大1生成。

### MachineRuntime advancePassThrough(runtime)（内部）

出力あり、splitter/merger 以外、入力なしのいずれかなら同一参照。そうでなければ先頭入力1件を出力へ移す。

### MachineRuntime advanceProcessor(input)（内部）

process があれば remainingMs から deltaMs を引く。0以下なら完成 item を ID factory/nowMs で作り、出力空なら追加、満杯なら破棄し、process を null にする。未完なら remainingMs を更新。その後、完成直後も含め `startProcessIfReady` を呼び次レシピを開始できる。非加工機は対応レシピがなく何もしない。

### MachineRuntime advanceMachineRuntime(input)

storage は advanceStorage、splitter/merger は advancePassThrough、それ以外は advanceProcessor へ分岐する。delta の妥当性は検査しない。

### MachineConnection | null selectOutputConnection(input)（内部）

接続がなければ null。splitter 以外は先頭。splitter は `roundRobinIndex % outputConnections.length` の接続を返す。接続上の搬送食品数は選択条件にしない。

### { item, connection, runtime } | null extractMachineOutput(input)

出力先頭 item がなければ null。接続を選べなければ null で buffer を変更しない。選べたら先頭を除いた runtime を返す。splitter の roundRobinIndex は選択接続の元配列 index+1、他機械は維持する。
