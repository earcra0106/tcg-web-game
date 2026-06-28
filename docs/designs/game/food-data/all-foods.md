# all-foods.ts

## 責務

ゲームで利用可能な全食品を、スプライト割当・レシピ優先順位・UI 表示順を兼ねる唯一の正規順序で定義する。

## データ仕様

`allFoodInfos` は `as const satisfies readonly FoodInfoData[]`。各要素の spriteId は id と同一。表の列は `id / name / ingredientIds / process / storage / served / ingredient / difficulty` であり、この順序のまま配列化する。`-` は空配列または null、真偽は T/F。

| id                     | name               | ingredientIds（順序厳守）                                   | process   | storage | served | ingredient | difficulty |
| ---------------------- | ------------------ | ----------------------------------------------------------- | --------- | ------: | -----: | ---------: | ---------: |
| rice                   | 米                 | -                                                           | -         |       T |      F |          T |          - |
| egg                    | 卵                 | -                                                           | -         |       T |      F |          T |          - |
| milk                   | 牛乳               | -                                                           | -         |       T |      F |          T |          - |
| bread                  | 食パン             | -                                                           | -         |       T |      F |          T |          - |
| beef                   | 牛肉               | -                                                           | -         |       T |      F |          T |          - |
| chicken                | 鶏肉               | -                                                           | -         |       T |      F |          T |          - |
| shrimp                 | エビ               | -                                                           | -         |       T |      F |          T |          - |
| potato                 | ジャガイモ         | -                                                           | -         |       T |      F |          T |          - |
| carrot                 | ニンジン           | -                                                           | -         |       T |      F |          T |          - |
| onion                  | 玉ねぎ             | -                                                           | -         |       T |      F |          T |          - |
| tomato                 | トマト             | -                                                           | -         |       T |      F |          T |          - |
| lettuce                | レタス             | -                                                           | -         |       T |      F |          T |          - |
| cheese                 | チーズ             | -                                                           | -         |       T |      F |          T |          - |
| curry-powder           | カレー粉           | -                                                           | -         |       T |      F |          T |          - |
| sliced-tomato          | スライストマト     | tomato                                                      | cutting   |       F |      F |          T |          - |
| chopped-onion          | 刻み玉ねぎ         | onion                                                       | cutting   |       F |      F |          T |          - |
| chopped-lettuce        | 刻みレタス         | lettuce                                                     | cutting   |       F |      F |          T |          - |
| cut-potato             | ポテト             | potato                                                      | cutting   |       F |      F |          T |          - |
| cooked-beef            | 炒め肉             | beef                                                        | heating   |       F |      F |          T |          - |
| grilled-chicken        | グリルチキン       | chicken                                                     | heating   |       F |      F |          T |          - |
| prepared-shrimp        | 下処理エビ         | shrimp                                                      | cutting   |       F |      F |          T |          - |
| chopped-carrot         | 刻みニンジン       | carrot                                                      | cutting   |       F |      F |          T |          - |
| tomato-sauce           | トマトソース       | sliced-tomato                                               | mixing    |       F |      F |          T |          - |
| boiled-egg             | ゆで卵             | egg                                                         | heating   |       F |      F |          T |          - |
| curry-sauce            | カレーソース       | curry-powder, chopped-onion, chopped-carrot                 | mixing    |       F |      F |          T |          - |
| omelet-base            | オムレツのもと     | egg, milk, cheese                                           | mixing    |       F |      F |          T |          - |
| cooked-rice            | ごはん             | rice                                                        | heating   |       F |      T |          T |          1 |
| toast                  | トースト           | bread                                                       | heating   |       F |      T |          T |          1 |
| fried-egg              | 目玉焼き           | egg                                                         | heating   |       F |      T |          T |          1 |
| french-fries           | ポテトフライ       | cut-potato                                                  | heating   |       F |      T |          T |          1 |
| salad                  | サラダ             | chopped-lettuce, sliced-tomato                              | combining |       F |      T |          T |          1 |
| beef-steak             | ビーフステーキ     | cooked-beef                                                 | cutting   |       F |      T |          T |          1 |
| chicken-saute          | チキンソテー       | grilled-chicken, french-fries                               | combining |       F |      T |          T |          1 |
| cheese-toast           | チーズトースト     | toast, cheese                                               | combining |       F |      T |          F |          1 |
| potato-salad           | ポテトサラダ       | cut-potato, chopped-carrot                                  | mixing    |       F |      T |          F |          1 |
| fried-egg-toast        | 目玉焼きトースト   | toast, lettuce, fried-egg                                   | combining |       F |      T |          F |          2 |
| egg-sandwich           | 卵サンド           | bread, boiled-egg, chopped-lettuce                          | combining |       F |      T |          F |          2 |
| omelet                 | オムレツ           | omelet-base                                                 | heating   |       F |      T |          T |          2 |
| chicken-salad          | チキンサラダ       | grilled-chicken, salad                                      | combining |       F |      T |          F |          2 |
| shrimp-salad           | エビサラダ         | prepared-shrimp, salad                                      | combining |       F |      T |          F |          2 |
| beef-tomato-stew       | 牛肉のトマト煮     | cooked-beef, tomato-sauce, chopped-onion                    | heating   |       F |      T |          F |          2 |
| chicken-tomato-stew    | チキントマト煮     | grilled-chicken, tomato-sauce, chopped-onion                | heating   |       F |      T |          F |          2 |
| mixed-grill            | ミックスグリル     | beef-steak, chicken-saute                                   | combining |       F |      T |          F |          2 |
| tomato-cheese-sandwich | トマトチーズサンド | bread, sliced-tomato, cheese                                | combining |       F |      T |          F |          2 |
| shrimp-omelet          | エビオムレツ       | prepared-shrimp, omelet-base                                | heating   |       F |      T |          F |          3 |
| hamburg                | ハンバーグ         | beef, chopped-onion, egg, bread, tomato-sauce, milk         | heating   |       F |      T |          F |          3 |
| curry-rice             | カレーライス       | cooked-rice, cooked-beef, curry-sauce                       | combining |       F |      T |          F |          3 |
| omurice                | オムライス         | cooked-rice, grilled-chicken, tomato-sauce, omelet          | combining |       F |      T |          F |          3 |
| fried-rice             | チャーハン         | cooked-rice, egg, chopped-onion, chopped-carrot             | mixing    |       F |      T |          F |          3 |
| shrimp-pilaf           | エビピラフ         | cooked-rice, prepared-shrimp, chopped-onion, chopped-carrot | mixing    |       F |      T |          F |          3 |
| cheese-curry           | チーズカレー       | cooked-rice, cut-potato, cheese, curry-sauce                | combining |       F |      T |          F |          3 |
| chicken-curry          | チキンカレー       | cooked-rice, grilled-chicken, curry-sauce                   | combining |       F |      T |          F |          3 |

## 関数仕様

関数は定義しない。
