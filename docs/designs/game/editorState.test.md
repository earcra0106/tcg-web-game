# editorState.test.ts

## 責務

エディタ状態の初期値とツール切替時リセットを固定する。

## 関数仕様

### void describe('editor state')

初期値が select、接続元2種null、連番1であることを検証する。connect 状態（クリック元machine-1、drag元machine-2、連番4/3）から delete へ変更すると両元だけnullとなり連番を維持することも検証する。
