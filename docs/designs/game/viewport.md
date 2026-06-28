# viewport.ts

## 責務

HTML 要素と端末情報から、安全な WebGL 描画サイズとカメラのアスペクト比を算出する。

## 型仕様

`ViewportSize` は `width`, `height`, `pixelRatio` がすべて number のオブジェクト。

## 関数仕様

### ViewportSize getViewportSize(element, devicePixelRatio: number)

`element` は `clientWidth` と `clientHeight` を持つ。幅・高さはそれぞれ `Math.max(1, value)` で最低1、pixel ratio は `Math.min(devicePixelRatio, 2)` で最大2とする。下限の補正はしない。

### number getAspectRatio(size)

`size.width / size.height` を返す。引数は `ViewportSize` の width と height のみを要求する。
