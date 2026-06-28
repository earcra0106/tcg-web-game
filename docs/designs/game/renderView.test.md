# renderView.test.ts

## 責務

runtime・搬送・累積目標から描画 view への変換、並び、除外、補間、clear 判定を固定する。

## 補助関数仕様

`machine(id,x)` は storage/rice を (x,0) に配置。`goal(stage,id,efficiency)` は name=id、difficulty1 の目標。

## 関数仕様

### void describe('render view')

8ケース: heater の新egg/旧rice入力は新→旧順、その後 cooked-rice processing(.5)で、待機output milkは非表示。remaining 500/0/-100 の進捗は0/1/1。未知入力/process は除き既知riceのみ。x=0→2 の progress 0/.5/1 は world x 0/1/2・y.32。搬送riceを view化し、from の待機outputは hasOutput true、waiting進捗0だが heldItems空。storage elapsed1000/2000 と heater remaining250/500 をそれぞれ waiting/processing進捗.5へ変換する。stage1 toast要求1・stage2 rice要求1・stage3 toast要求1 と各履歴で toastを合算（stages[1,3],要求2,現在2）、rice要求/現在1、全clear。rice要求2に履歴1なら個別 `[true,false]`、全体false。
