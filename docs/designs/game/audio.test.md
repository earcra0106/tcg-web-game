# audio.test.ts

## 責務

音声コントローラの遅延生成、ミュート、再生位置、キャッシュ、破棄を Vitest で固定する。

## 関数仕様

### void describe('audio')

次を検証する。

1. factory 呼出 URL 配列は生成直後空で、`play('select')` 後に select URL だけとなる。
2. `setMuted(true)` 後の play は spy を呼ばず、`isMuted()` は true。
3. currentTime=12 の confirm 要素は play 時0へ戻り、play が1回。
4. select 2回・confirm 1回で factory は2回だけ、引数順は各 URL。
5. success を生成後 dispose すると pause 1回、`removeAttribute('src')`、load 1回。
