# grid.ts

## 責務

整数格子座標と Three.js ワールド座標の基礎型を定義し、座標の検証、比較、キー化、変換、上下左右の隣接計算を純粋関数として提供する。

## 型・定数仕様

- `GridPosition`: `{ x: number; z: number }`。盤面の2次元座標。
- `WorldPosition`: `{ x: number; y: number; z: number }`。描画空間の3次元座標。
- `GridDirection`: `'north' | 'south' | 'west' | 'east'`。

## 関数仕様

### boolean isValidGridPosition(position: GridPosition)

`x` と `z` の両方が `Number.isInteger` を満たす場合だけ `true`。有限性などを別途補正しない。

### string gridKey(position: GridPosition)

`${x}:${z}` 形式のキーを返す。例: `{x: 2, z: -3}` は `2:-3`。

### boolean isSameGridPosition(first: GridPosition, second: GridPosition)

両座標の `x` と `z` がそれぞれ厳密等価なら `true`。

### WorldPosition toWorldPosition(position: GridPosition, cellSize = 1, y = 0)

`{ x: position.x * cellSize, y, z: position.z * cellSize }` を返す。入力は変更しない。

### GridPosition getAdjacentPosition(position: GridPosition, direction: GridDirection)

北は `z - 1`、南は `z + 1`、西は `x - 1`、東は `x + 1` とし、新しい座標を返す。

### GridDirection | null getAdjacentDirection(from: GridPosition, to: GridPosition)

差分 `(dx, dz)` が `(0,-1)`, `(0,1)`, `(-1,0)`, `(1,0)` の場合に順に `north`, `south`, `west`, `east` を返す。同一点、斜め、2セル以上離れた位置は `null`。
