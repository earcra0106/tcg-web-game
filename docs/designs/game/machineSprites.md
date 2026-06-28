# machineSprites.ts

## 責務

機械スプライトシートの物理寸法、表示寸法、登録順と各フレーム矩形を定義する。

## データ仕様

- URL `/assets/sprites/machines.png`、sheet 幅1024・高さ512、cell 256、表示サイズ36、列数4。
- フレーム対象順は splitter, merger, cutter, heater, mixer, combiner, trash-bin。storage と shipping は対象外。
- 各 index について column=`index%4`、row=`floor(index/4)`、x/y は column/row×256、width/height=256、key=`${id}.png`。

## 関数仕様

### MachineSpriteFrame | null getMachineSpriteFrame(machineId: MachineId)

`machineSpriteFrames` から ID 一致の最初のフレーム、なければ null。
