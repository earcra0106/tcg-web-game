# gameState.test.ts

## 責務

統合ゲーム状態の初期値、機械・接続更新、拒否時同一性、連鎖削除を固定する。

## 関数仕様

### void describe('game state')

空配列・stageIndex0・未選択の初期値、cutter 配置で新 state/1機械、同セル heater 配置拒否で同一 state、cutter→heater 接続の生成を検証する。また machine-1 選択済み・2機械・1接続から machine-1 を削除し、machine-2 のみ残り、接続なし、選択 null となることを検証する。
