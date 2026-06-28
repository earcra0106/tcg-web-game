# conveyorRender.test.ts

## 責務

コンベア描画モデルの幾何、方向、アニメーション速度、進捗正規化を固定する。

## 関数仕様

### void describe('conveyor render model')

- (0,0)→(2,0), now=0 で start/end `(0/2,0.04,0)`, midpoint `(1,0.04,0)`, length2, angle0, glow `[2,.08,.28]`。
- (0,0)→(0,2), now=300, marker2 で angle `-PI/2`、進捗 .25/.75、先頭位置 `(0,.115,.5)`。
- 東0、西`-PI`、南`-PI/2`、北`PI/2`。
- now=300 の長さ1/2双方で1 marker の world x=.5、進捗は .5/.25。
- 斜め線・now=1500 の全 marker 進捗が0以上1未満。
