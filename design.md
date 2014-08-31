設計ドキュメント
===============

知りたいこと
----

スイスドロー方式のトーナメントの正当性の確認。
レーティングと最終結果の一致度を知りたい。

とりあえず単純に差分で見る。レーティング1位が最終結果3位なら一致度2。その合計で大きいほうがダメ。


出力
-------

評価値

* 全選手の差分合計
* レーティングベスト4の選手の差分合計
* レーティングベスト4の選手が優勝する確率
* 1位と2位が試合をしなかった確率(0？)

条件

* 試合数
* メンバーの数

繰り返し

* 固定メンバーでメンバーの数まで。
* 固定メンバーで100回
* メンバーのパターン100種類回
* メンバーの数を8～32

Google Chart

* https://google-developers.appspot.com/chart/interactive/docs/gallery/scatterchart

コンポーネント
-----

### 機能

* メンバーリスト作成
 * レーティングはランダム
 * レーティング順にソート

```
function createPlayers() {
  return players;
}
```


* 1試合
 * レーティングが100離れていたら勝率6:4, 200で7:3とする。

```
function contest( player1, player2 ) {
  return winner; // 勝者を返す
}

```
* メンバーの勝ちをstandingsに反映する

```
Tournament.prototype.win = function( player ){
}
```

* メンバーの負けをstandingsに反映する

```
Tournament.lose = function( player ){
}
```

* 次の試合を決める
 * 対戦数が最小かつ勝ち点が大きい2人を返す
 * array.sort( compareFunction ) もあるけど、破壊的なので自前で実装するかな。
 * 同じ対戦も避ける。

```
Tournament.nextContest = function() {
  return [ player1, player2 ];
}
```

* 次の試合を決めるためのメンバーの現在の勝ち点を返す
 * win にランダムに小数点2桁の数字を足すことで、勝ち数が同数でも差をつける。
 * 初戦でレーティングも考慮する場合はここに加える。
 * ソロコフ、sbは含めない。

* メンバーの現在の勝ち点を返す
 * win, ソロコフ, sbを返す

* ソロコフを返す
 * 対戦相手の勝ち数

* sbを返す
 * 自分が負かした相手の勝ち数

```
Tournament.score = function( player ) {
  return {
    win: num,     // 勝ち数
    solocov: num, // 対戦相手の勝ち数
    sb: num       // 負かした相手の勝ち数
  }
}

```
* 最終順位を出す
 * scoreを元にソート。
 * standingsを破壊せず、新しいarray作る
* メンバーのレーティングと最終順位を比較する
 * 毎試合出力して結果に含める。

### データ

* クラス
 * Tournament
 * 勝敗表を持つ
 * newの引数でメンバーを渡す
* 勝敗表
 * standings
 * メンバー情報も持たせるか
 
```
[
 {
   playerId: id, // メンバーID: arrayの要素と同じ。
   rating: xxx
   progress: {   // 経過。対戦相手と勝敗のarray
     opponent: id,
     result: 0( lose ) or 1(winner)
   },
   win: num, // 勝ち数
 }
]
```

* 試合結果
 * Tournamentクラスを全部持つのは重いので、結果だけ取り出して保存する。
 * 結果は小さいほうが好ましくなるように統一。

```
results: [
  {
    differenceAll: sum, // 全選手の差分の合計
    difference4: sum,   // ベスト4の選手の差分の合計
    lose4: sum,         // ベスト4の選手が優勝しなかった回数
    nonTopBattle:       // 1位と2位が試合をしなかった回数
    contestNum: num,    // 試合数
  }
]
```
