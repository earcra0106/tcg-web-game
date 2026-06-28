# editorActions.test.ts

## 責務

エディタ操作から統合モデルへの状態遷移を固定する。

## 補助関数仕様

### EditorModel withTool(model, selectedTool)

model をスプレッドし、`selectEditorTool` の結果で editorState を置換する。

## 関数仕様

### void describe('editor actions')

次の8ケースを検証する: rice 設定 storage を (0,0) に置くと machine-1、spawn config、次番号2になる。同一セル再配置はモデル同一参照。heater 2台をクリック接続すると connection-1 が作られ接続元 null。同じ接続の再試行では1件・次番号2のまま。storage 2台を接続後 delete で machine-1 と接続/config が消える。delete で connection-1 が消える。connect ツールで machine-1 から machine-2 へ drag すると1接続・drag元 null。heater 配置後 recipe toast を設定すると対応 config になる。
