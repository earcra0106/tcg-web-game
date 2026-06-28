# shipping.ts

## 責務

出荷履歴を不変更新し、時間窓内の対象食品の毎分出荷効率とステージ達成を判定する。

## 型仕様

- `ShipmentRecord`: itemId, foodId, shippedAtMs。
- `ShippingEfficiencyInput`: history, targetFoodId, nowMs, windowMs。

## 関数仕様

### ShipmentRecord[] recordShipment(history, record)

末尾に record を追加した新配列。

### number countTargetShipments(input)

開始時刻 `nowMs-windowMs` より厳密に後、かつ nowMs 以下で、foodId が対象と一致する件数。開始境界は除外、終了境界は包含。

### number calculateShippingEfficiency(input)

windowMs が0以下なら `RangeError('windowMs must be greater than zero')`。それ以外は対象件数を `windowMs/60000` で割り毎分値を返す。

### boolean isStageGoalCleared({ history, goal, nowMs, windowMs })

goal.targetFoodId の効率が goal.requiredEfficiency 以上なら true。
