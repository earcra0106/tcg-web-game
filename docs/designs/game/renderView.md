# renderView.ts

## 責務

ゲーム状態とシミュレーション状態を、機械表示・食品位置・累積目標 HUD に適した副作用のない描画モデルへ変換する。

## 型・定数仕様

- `DEFAULT_EFFICIENCY_WINDOW_MS=60000`。
- 機械 view は machine、処理中/出力待ちフラグ、heldItems。
- held item は id/foodId/spriteId、status=`input|processing`、nullable progress。
- 搬送 item view は world position を持つ。
- HUD goal は food、該当 stageNumbers、合算 required/current efficiency、clear。
- `CreateRenderViewInput.machineConfigs` は型にあるが現実装では参照しない。

## 関数仕様

### number lerp(start,end,progress)（内部）

線形補間。

### RenderMachineHeldItemView | null createInputItemView(item)（内部）

食品未登録なら null。登録済みなら spriteId を解決し status=input、progress=null。

### readonly RenderMachineHeldItemView[] createMachineHeldItemViews(runtime)

undefined は空。inputBuffer を createdAtMs 降順（新しい順）にコピーソートし、未知食品を除外して入力 view 化する。outputBuffer は表示しない。process がなければ入力だけ。process 出力食品が未知でも入力だけ。既知なら末尾に processing view を追加し、ID=`placementId-process-recipeId`、progress=`clamp(1-remainingMs/1000,0,1)`。

### WorldPosition interpolateWorldPosition(fromMachine,toMachine,progress)

双方を cellSize=1,y=0.32 で world 化し、progress を0〜1にクランプして x/y/z を線形補間。

### StageGoal[] getCumulativeStageGoals({seed,stageNumber})

長さ stageNumber の配列を作り、1から stageNumber まで同じ seed で `getStageGoal`。負数は Array.from の結果が空、非整数等の詳細は Array.from/getStageGoal に従う。

### StageHudView createStageHudView(input)

既定 window=60000。goals を順に FoodId で Map 集約する。初出 ID は history から現在効率を1回計算し、要求値と比較。重複 ID は stageNumbers 末尾追加、requiredEfficiency を加算し、初出時に計算した currentEfficiency と合算要求を比較する。Map 挿入順で goals を返す。全体 clear は goal が1件以上かつ全件 clear（空は false）。stageNumber は入力値をそのまま返す。

### RenderView createRenderView(input)

stageNumber=`gameState.stageIndex+1`、1..stageNumber の累積目標を生成。各配置機械を同順で view 化し、process が null/undefined 以外なら isProcessing、outputBuffer 長>0なら hasOutput。connections は元参照。搬送 items は始終機械と食品がすべて見つかるものだけ同順で view 化し補間位置を付与。HUD は simulation の履歴・時刻と指定/既定窓から生成する。seed は目標決定に使用する。
