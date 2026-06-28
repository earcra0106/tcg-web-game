# audio.ts

## 責務

ゲーム効果音 URL と、遅延生成・ミュート・再生・破棄を扱う音声コントローラを提供する。

## 型・定数仕様

- `GAME_SOUND_URLS`: select→`/assets/sounds/select.mp3`、confirm→`confirm.mp3`、success→`clear.mp3`、cancel→`cancel.mp3`、reject→`reject.mp3`。
- `GameSoundId`: 上記キー。
- `AudioElementFactory`: URL を受け、currentTime/muted/preload/volume/play と任意 pause/load/removeAttribute を持つ要素を返す。

## 関数仕様

### AudioElementLike createDefaultAudioElement(url: string)（内部）

`new Audio(url)` を返す。

### AudioController createGameAudioController(createAudioElement = createDefaultAudioElement)

初期ミュート false、要素 Map は空。音ごとに初回利用時のみ factory を URL 付きで呼び、preload=`auto`、volume は success のみ0.72、それ以外0.52、muted は現在値としてキャッシュする。

返却オブジェクトの `play(id)` はミュート中なら何もしない。非ミュートなら要素を得て currentTime=0、muted=false とし play を呼ぶ。同期値/Promise を `Promise.resolve` し、拒否は autoplay 対策として握りつぶす。`setMuted(bool)` は内部値と生成済み全要素を更新する。`isMuted()` は内部値を返す。`dispose()` は全要素で任意 pause、`removeAttribute('src')`、任意 load の順に呼び Map を空にする。
