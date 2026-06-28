# placement.test.ts

## 責務

機械配置の成功、拒否条件、検索、削除を固定する。

## フィクスチャ仕様

`cutter` は machine-1/cutter/(0,0)。

## 関数仕様

### void describe('machine placement')

空盤面への配置成功、(1.5,0) 拒否、同じ(0,0)の別ID拒否、同じIDの別位置拒否を検証し、拒否は元配列参照を期待する。ID/位置検索は cutter 参照を返し空位置はnull、machine-1削除後は空。
