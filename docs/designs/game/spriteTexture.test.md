# spriteTexture.test.ts

## 責務

異なる縦横比の sheet に対する UV repeat/offset を固定する。

## 関数仕様

### void describe('sprite texture layout')

1024×512 sheet の frame(256,0,256,256) は repeat(.25,.5), offset(.25,.5)。1024角の frame(128,256,128,128) は repeat(.125,.125), offset(.125,.625)。
