# input.ts

## 責務

キーボードコードを4方向入力へ変換し、押下状態と未正規化の移動ベクトルを管理する。

## 型・定数仕様

- `DirectionKey`: `'forward' | 'backward' | 'left' | 'right'`。
- `InputState`: 全 `DirectionKey` を boolean に対応させるレコード。
- 内部キーマップ: `ArrowUp`/`KeyW`→`forward`、`ArrowDown`/`KeyS`→`backward`、`ArrowLeft`/`KeyA`→`left`、`ArrowRight`/`KeyD`→`right`。

## 関数仕様

### InputState createInitialInputState()

4方向がすべて `false` の新しいオブジェクトを返す。

### DirectionKey | null directionForCode(code: string)

内部キーマップにあるコードの方向を返し、未登録コードは `null`。

### InputState updateInputState(state: InputState, code: string, isPressed: boolean)

登録コードなら元 state をスプレッドした新しいオブジェクトの対応方向だけを `isPressed` にする。未登録コードなら元の参照をそのまま返す。

### { x: number; z: number } getMovementVector(state: InputState)

`x = Number(right) - Number(left)`、`z = Number(backward) - Number(forward)`。相反入力は相殺し、斜め入力は正規化しない。
