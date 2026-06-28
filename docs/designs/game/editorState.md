# editorState.ts

## 責務

エディタの選択ツール、接続操作中の一時状態、連番 ID 用インデックスを定義・初期化する。

## 型仕様

- `EditorTool`: `select`、`connect`、`delete`、または `place-machine`。配置ツールは machineId と任意 foodId を持つ判別共用体。
- `EditorState`: `selectedTool`, クリック接続元、ドラッグ接続元、次の機械番号、次の接続番号。

## 関数仕様

### EditorState createInitialEditorState()

select ツール、両接続元 null、両インデックス1を返す。

### EditorState selectEditorTool(state, selectedTool)

state をスプレッドし、ツールを置換すると同時にクリック・ドラッグ接続元を null にする。連番は維持する。
