# shipping.test.ts

## 責務

出荷記録、時間窓効率、目標達成判定を固定する。

## フィクスチャ仕様

履歴は cooked-rice@10000、toast@20000、cooked-rice@50000。

## 関数仕様

### void describe('shipping')

空履歴へ toast/item-1/@500 を追加した配列、now60000/window60000 の cooked-rice 効率1/3（10秒あたり）を検証する。必要効率1/3の cooked-rice goal は clear、同 goal の target だけ toast にすると false。
