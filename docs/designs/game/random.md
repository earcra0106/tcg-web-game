# random.ts

## 責務

文字列 seed と整数 salt から再現可能な疑似乱数列を生成する。

## 型仕様

`SeededRandom`: `next(): number`、`nextInt(maxExclusive): number`、ジェネリック `pick(items): T | null`。

## 関数仕様

### number hashSeed(seed: string, salt: number)（内部）

初期値 `2166136261 ^ salt`。各 UTF-16 code unit について XOR 後 `Math.imul(hash, 16777619)` を行い、最後に符号なし32bit化する（FNV-1a 系）。

### SeededRandom createSeededRandom(seed: string, salt = 0)

hash を可変 state として保持する。`next` は state に `0x6d2b79f5` を加えて32bit乗算し、右シフト15/7/14と `Math.imul` による混合後、符号なし値を `4294967296` で割った `[0,1)` を返す。`nextInt` は maxExclusive が正の整数でなければ `RangeError('maxExclusive must be a positive integer')`、それ以外は `floor(next()*maxExclusive)`。`pick` は空配列なら null、それ以外は `this.nextInt(length)` の要素（欠損なら null）。同じ seed/salt と呼出順で同じ結果になる。
