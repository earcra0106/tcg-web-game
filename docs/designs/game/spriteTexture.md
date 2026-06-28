# spriteTexture.ts

## 責務

左上原点のスプライトシート矩形を、Three.js の下原点 UV repeat/offset に変換する。

## 型仕様

- `SpriteTextureFrame`: x, y, width, height。
- `SpriteTextureLayout`: `repeat` と `offset` が各 `[number, number]`。

## 関数仕様

### SpriteTextureLayout createSpriteTextureLayout({ frame, sheetWidth, sheetHeight })

`repeatX=width/sheetWidth`, `repeatY=height/sheetHeight`。repeat は `[repeatX, repeatY]`、offset は `[x/sheetWidth, 1-y/sheetHeight-repeatY]`。入力妥当性の検査はしない。
