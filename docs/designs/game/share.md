# share.ts

## 責務

ステージ進行とシード値から、シェア画像に使う目標ステージとX投稿用文面・Web Intent URLを決定する。

## 関数仕様

### number[] getShareStageNumbers(completedStageCount)

0なら空配列を返す。1以上なら、最大5件のクリア済みステージを古い順に返す。負の整数または整数以外は `RangeError`。

### ShareStageGoal[] getShareStageGoals({ completedStageCount, getStageGoal })

選ばれた各ステージ番号を `getStageGoal` で目標料理へ変換する。

### string createSharePostText({ completedStageCount, seed })

ステージ番号は `max(1, completedStageCount)` とし、達成ステージとシード値を含む指定の投稿文面を返す。

### string createXPostIntentUrl(text)

投稿文面を `https://x.com/intent/tweet` の `text` クエリへエンコードして返す。

### string createLineShareUrl(text)

ゲームURLと投稿文面を LINE share URL の `url`・`text` クエリへエンコードして返す。
