# ThreeGame.ts

## 責務

Three.js の最小ゲームシーンを所有し、renderer/camera/scene、プレイヤー移動、入力イベント、リサイズ、animation frame、GPU リソースのライフサイクルを管理する。

## 関数仕様

### class ThreeGame

色定数は player `0x38bdf8`、floor `0x1f2937`。field は WebGLRenderer、Scene、PerspectiveCamera(60°, aspect 1, near 0.1, far 100)、player Mesh、Three.Timer、ResizeObserver、4方向 input、nullable animationFrameId。

### constructor(host: HTMLElement)

antialias=true の renderer を作り clear color `0x0f172a`、animation loop null、canvas を host 末尾へ追加、timer を document に接続する。player は1角 BoxGeometry と指定色 MeshStandardMaterial、y=0.5。scene 構成後、host を監視する ResizeObserver を作り、直ちに resize する。

### void start()

window の keydown/keyup に各 handler を登録し、`tick()` を同期的に1回開始する。多重 start 防止はない。

### void dispose()

キー listener 削除、observer disconnect、timer dispose。frame ID が非nullなら cancelAnimationFrame。scene 全 traverse で Mesh の geometry と、配列または単一の全 material を dispose。renderer を dispose し canvas を DOM から remove。frame ID 自体は null に戻さない。

### void configureScene()（private）

player、16×16 Plane floor（x回転 `-PI/2`）、GridHelper(16,16,色 `0x64748b`,`0x334155`)、AmbientLight(白,0.5)、DirectionalLight(白,2.5、位置4,8,6)を追加。camera を(4,4,6)へ置き player を注視。

### void resize()（private）

host と window.devicePixelRatio から viewport を取得し、camera.aspect 更新→projection matrix 更新→renderer pixel ratio→renderer size(width,height,false) の順に適用。

### void tick()（private arrow）

timer.update/getDelta。入力ベクトル長が正なら速度3で正規化した x/z を `speed*delta` 加算し、y回転を `delta*1.8` 加算。停止時は回転を `delta*0.45` 加算。camera を player へ向け、render 後に `requestAnimationFrame(this.tick)` の ID を保存する。

### void handleKeyDown/handleKeyUp(event)（private arrow）

event.code を `updateInputState` へ渡し、それぞれ pressed true/false にする。preventDefault はしない。
