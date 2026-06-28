# conveyorRender.ts

## 責務

2つの格子座標からコンベアの線分、発光帯、進行方向、一定速度で巡回する三角マーカーの描画モデルを算出する。

## 型・定数仕様

- `ConveyorTriangleMarker`: world position、角度、`[0,1)` の進捗。
- `ConveyorRenderModel`: start/end/midpoint、length、angleRad、glowScale、markers。
- `ConveyorRenderInput`: from/to 必須。cellSize, height, nowMs, markerCount は任意。
- `CONVEYOR_SPEED_CELLS_PER_SECOND = 5 / 3`。

## 関数仕様

### number lerp(start, end, progress)（内部）

`start + (end-start)*progress`。

### number normalizeProgress(progress)（内部）

`((progress % 1)+1)%1` とし負値も `[0,1)` にする。

### ConveyorRenderModel createConveyorRenderModel(input)

既定値は cellSize=1、height=0.04、nowMs=0、markerCount=3。from/to を指定 height の world 座標に変換し、`dx`, `dz`, `Math.hypot` で長さを得る。角度は `atan2(-dz, dx)`、結果が `-0` なら0。経過移動距離は `nowMs/1000*5/3`、基準進捗はそれを `max(length,0.001)` で割って正規化する。

midpoint は x/z の平均、y は height。glowScale は `[max(length,0.001), 0.08, 0.28]`。marker 間隔は markerCount>0 なら `1/markerCount`、そうでなければ1。`Array.from({length: markerCount})` で各 marker の進捗を `base+index*spacing` から正規化し、位置を start/end 間で線形補間、y=`height+0.075`、角度を本体と同じにする。負の markerCount は Array.from の仕様上0件。
