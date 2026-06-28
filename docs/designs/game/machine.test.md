# machine.test.ts

## 責務

機械マスタ、名称、sheet 順・矩形、スプライト非対象、在庫対象を固定する。

## データ仕様

先頭は storage/倉庫、shipping/出荷口。フレーム対象は splitter/分岐機(0,0)、merger/合流機(0,1)、cutter/切断機(0,2)、heater/加熱機(0,3)、mixer/ミキサー(1,0)、combiner/合体機(1,1)、trash-bin/ゴミ箱(1,2)。括弧は row,column。

## 関数仕様

### void describe('machine sprites')

MachineInfoData の型例、上記全登録順・名称、各 index/row/column/x/y/256角を検証する。frame は7件で (1,3) がなく、storage/shipping 検索は null。在庫対象を machineInfos から抽出すると cutter, heater, mixer, combiner の順になる。
