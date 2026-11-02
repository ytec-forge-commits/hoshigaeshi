# 星返し / STAR REBOUND — v9 feedback20 起動・戦闘調整・未掲載テスト版

静的HTTPサーバーで index.html を開いてください。画像・音声・フォント・スクリプトは同梱してあり、サブパスから相対参照します。ビルドやアカウントは不要です。

「操作・音」でPCの操作方法を選べます。以前の設定はキーボードとして読み込み、記録・音量・難しさを保持します。

- キーボード：矢印 / WASDで移動、Spaceで星返し。
- マウス固定：準備後に「マウスを固定して出発」をクリックします。カーソルを隠し、マウスの移動量で自機を動かします。左クリックで星返し。盤面の外へカーソルが抜けて移動が止まることはありません。P / Escで固定を解除して一時停止し、ボタンのクリックで再取得します。
- ゲームパッド：standard配列の左スティック / 十字キーで移動、A / ×（右側の下ボタン）で星返し、Start / Menuで一時停止・再開。メニューは上下で選択、左右で値変更、A / ×で決定、B / ○でダイアログを閉じます。
- タッチ：どの選択でも盤面をなぞって移動し、同じあたりを素早く2回タップすると星返し。下の星返しボタンもいつでも使えます。ドラッグ・長押しはダブルタップに数えません。判定には指の小さなずれと間隔の余裕を持たせています。「操作・音」で星返しボタンを右側／左側に選べ、次回も保存されます。縦向き・横向きのスマホサイズに対応します。P / Escと画面の一時停止ボタンも共通です。

マウス固定はブラウザのPointer Lockを使用します。取得前・取得失敗・固定解除・画面を離れたときはゲームを止めます。失敗した場合は再試行するか、「操作・音」で別の操作方法へ切り替えてください。Escで解除した直後に勝手に再取得しません。面間の移動演出では固定を保ち、左クリックで演出を省けます。終了・タイトル・設定・一時停止では通常のカーソルに戻ります。タッチで出発／再開した場合は固定せず、従来のドラッグ操作を使います。

「やり直す」の確認クリックでは固定を取得して新しいプレイを開始します。通常のBGM読み込みはプレイを止めず、失敗した場合だけ再試行などの選択を表示します。大きい斜めの相対入力でも向きを保ち、実際の自機だけを盤面内へ制限します。入力と描画の周期差で移動量を落とさないよう、余りを最大約33msまで受け渡します。古い方向へ長く追従せず、新しい逆方向や直角の入力へ切り替わります。最大移動速度は毎秒680のままです。

ゲームパッドは接続後にページを選び、パッドのボタンを一度押してブラウザへ認識させてください。切断時は一時停止し、再接続後はボタン・スティックを離してから「続きへ」を選びます。複数台の場合、最初に認識した対応パッドを使い、途中で別のパッドへ勝手に切り替えません。未接続・未対応配列・利用不可の場合は設定に表示し、キーボードかマウスへ戻せます。ブラウザの音声制限で音が出ない場合は、画面を一度クリックして操作してください。物理ゲームパッドと実スマホでの確認は未実施です。

どの操作方法でも最大移動速度は毎秒680（ゲーム内座標）で共通です。斜め移動でも上限は同じで、ゲームパッドのスティックを浅く倒す微調整は維持します。ゲームパッドでメニューを動かすと、今選んでいる操作に太い金色の枠と三角の目印が付きます。

設定・ランキング・確認ポップアップは、外側の暗い背景をクリック／タップして閉じられます。確認画面ではキャンセルと同じ扱いです。中の操作やスクロール、内側から外へのドラッグでは閉じません。閉じてもプレイ中の一時停止は自動解除されず、「続きへ」で再開します。

開始前から全画面、BGMとSEの個別音量、ミュート、演出控えめを選べます。途中プレイの保存はなく、難しさ別の記録と設定を端末のブラウザ内に保存します。

今回の改善と確認範囲は CHANGES.md、素材とライセンスは LICENSES.md を参照してください。ソース用の元画像も保持した候補パッケージです。動画・宣伝素材・認証情報は含めていません。一般公開前の最終検証が残ります。

第2面から分裂弾と加速弾、第3面から短時間追尾弾と予告付きビームが登場します。ビームだけは星返しできません。結果の「Xへ投稿」は新しいタブで投稿画面を開きます。投稿文に結果を入れ、ローカルURLは添えません。投稿の確定はX側で行います。

## ライフと高得点の見方

ライフは金色の結晶と現在数／最大数で表示します。暗い枠は失ったライフです。SCORE横の「撃破 ×N」は敵撃破の得点倍率、CHAIN欄は連続撃破数・次の倍率までの機数・継続の残り時間です。

前の撃破から4秒たつ前に次の敵を倒すと連鎖し、通常弾も星返しも対象です。5 / 10 / 15 / 20連鎖で撃破得点が ×2 / ×3 / ×4 / ×5。被弾または時間切れでリセットします。取り込んで返した弾は1発12点、ボス撃破では回復前の残りライフ×500点も別加算します。一時停止画面の「高得点のコツ」でも確認できます。得点の計算式は維持していますが、武器・星返し・敵の調整により得点条件は変わります。

## 今回の追加

難しさは4段階（ライフ5/4/3/2）。ナイトメアは1回の星返しで24発以上つかまえると1回復（48発以上でも最大1、ライフ上限2）、面突破時も1回復。連星は左右の周期レーザーを伴い、各ボスは難しさ別に弾幕を強化しました。導入7.8秒、勝利演出10秒からエンドロールへ進みます。スキップと演出控えめに対応。強化効果は操作付近へ常時表示し、ライフを結晶で表示します。

オンラインランキングは同一サーバーのPHP+SQLiteを設定した場合だけ利用できます。通常出発時に接続し、結果の名前・記録の登録は任意です。各難しさの上位10件を表示します。静的配信では端末内記録として遊べます。送信項目・Cookie・保存期間は ONLINE.md を参照してください。サーバー非公開コード・データはこの公開作品パッケージに含めません。

feedback5では星返し連鎖の数字と段階演出を拡大し、導入を接近・捕獲・出発の3拍にしました。第1/2面の突破待ち3.2秒は次の海へ進む映像になります。面間の「動きを省く」は静止表示に切り替え、元の待ち時間を保持して次面へ進みます。P・画面離脱・設定で停止し、復帰時は「続きへ」を押します。


## 星空アーケード（feedback8）

日本語見出しはZen Kaku Gothic New Black、英字・得点はOrbitron、本文は既存Noto。深海色を基調に、味方は青緑、星返しの成功は金、危険な弾は紫として区別します。三つの海の背景、ボス登場、連鎖4/8/16/24段階、取得・強化中・終了の演出を追加しました。追加SEはKenney Interface Sounds（CC0）から加工した短い7音で、音量・ミュート・演出控えめに対応します。

光と所持アイコンの付いた敵を倒すと、近くの安全な位置に強化アイテムが出現します。敵の数・HPは変えず、既存の敵の一体が運びます。各面最大5回、三連星・連星・貫星・時星・護星が一度ずつの順不同。登場機会は面開始12〜17秒、26〜31秒、40〜45秒、54〜59秒、68〜73秒以降のwaveです。前の運搬役・アイテムが残っていれば延期し、逃した運搬役からは落ちません。アイテム用の乱数を戦闘と分離しています。

効果は20秒。三連星・貫星・連星は新しい武器アイテムへ切り替わり、時星と護星は別枠で併用できます。被弾で効果は消えません。三連星は三方向へ射撃。貫星は通常弾と同じ単体火力で二体まで貫通。連星は左右レーザーを20秒間発射し、8発以上の星返しを一度だけ強化します。その反撃強化を使った後も、レーザーは残り時間まで続きます。

帰り道の星が沈んだ三つの海で、小さな星舟が弾を金色の光へ変え、途切れた星路をつなぎ直す物語です。OP、各面突破、帰還を短い文でつなぎ、既存の演出時間とスキップを維持しています。クレジットは「止めて読む」でスクロールし、「流して見る」でその位置から再開できます。画面離脱・非表示・設定中は進行と音を止めます。演出控えめでは手動で読みます。

この版は非公開の調整段階です。保存形式・ランキングAPI/DB/ルール版は維持し、以前の記録を削除しません。アイテム変更前後の得点条件は完全同一ではありません。無期限強化・被弾時の武器強化解除はありません。物理スマホ・ゲームパッド・スピーカーでの確認、人間による全難度3面攻略、本番公開は未実施です。

## ランキングの詳細・ボス撃破後

ランキングでは順位・名前・得点に加え、時間と返却数を一覧表示し、「プレイ詳細」を開くとライフ、撃破、最高連続撃破、被弾、星返し使用、回復した回数、得点内訳を確認できます。結果画面にも得点内訳を追加しました。保存されていない旧項目は未記録と表示します。公開項目は登録欄とONLINE.mdを確認してください。

各面ボス撃破後、約2.4秒で姿が光へ消えてから従来の面間演出・帰還へ進みます。最初の約0.35秒を過ぎてからEnter／マウス固定中の左クリック／「撃破演出を省く」ボタン／ゲームパッドB・○で省略できます。Space・パッドAの連打では省略しません。P / Esc、画面離脱、設定中は停止し、続きへで再開します。演出控えめでは拡大する輪や収縮を止め、静かなフェードにします。シミュレーション時間と得点は消滅演出中に進めません。

English: Rankings now include expandable run statistics and score breakdowns. Missing historical details are unrecorded. Bosses fade out for about 2.4 seconds before the existing transition; Enter, a locked-mouse left click, the dedicated button, or gamepad B can skip after 0.35 seconds. Pause and reduced motion are supported. Scoring and movement rules are unchanged.

## 星が作る帰り道

3面ボスを倒した後の帰還では、集めた星が金色の道を作り、星舟がその道を飛んで奥へ帰ります。既存の約10秒の演出とクレジットへのスキップを維持。演出控えめでは、同じ星の道と船の静止画を表示します。画面離脱・非表示・設定中は進行を止めます。

English: After the final boss, gathered stars form a shimmering golden road and the ship flies away into the distance. The existing ten-second ending and skip-to-credits control remain. Reduced motion shows a static road and ship; leaving the window or opening settings holds the scene.

## スマホ操作の改善（feedback15）

アイテム説明の表示・消去で盤面や星返しボタンが跳ねないよう、説明欄の高さを確保しました。狭い縦画面の全画面表示も、盤面・ボタン・説明が収まる寸法に調整しています。ダブルタップ判定は少しゆっくりした押し方や指のずれを許容します。星返しボタンは左右同じ大きさで、ダブルタップとの併用も維持しています。

## 星路とボス撃破カットイン（feedback16）

エンディングの星路を細かな光の粒へ変更しました。星舟は左右の揺れ、旋回、翼のしなりを組み合わせ、泳ぐように奥へ帰ります。各面のボス撃破時には、星舟とその面の主を映す金色のカットインを表示します。既存の約2.4秒の撃破時間・停止・スキップを維持します。演出控えめでは星路と星舟を静止させ、カットインのスライドと拡大を止めます。

English: The ending road is now made of fine luminous particles. The starship swims into the distance with gentle turns and flowing wings. Each boss defeat shows a short gold cut-in with the ship and that boss. Timing, pause and skip remain unchanged. Reduced motion keeps the road and ship still and disables cut-in sliding and zooming.

## 撃破演出の余韻と日本語表示（feedback17）

ボス撃破カットインを2.4秒へ延長し、入場0.3秒・中央保持1.8秒・退場0.3秒で見せます。0.35秒後からのスキップ、停止・再開、演出控えめを維持。タイトル、物語、結果、操作案内、ランキングの日本語UIは句点を省き、文の区切りには改行や余白を使います。

English: Boss cut-ins now last 2.4 seconds, including a 1.8-second central hold. Pause, reduced motion and skipping after 0.35 seconds remain available. Japanese UI copy uses spacing and line breaks without Japanese full stops. Gameplay, scoring, records and ranking requests are unchanged.

## 全編の案内と読みやすさ

物語・結果・操作説明は意味のまとまりで改行し、狭い画面の折返しを調整しています。冒頭ヒント・星返しボタン・撃破演出・面間演出・停止復帰の案内は、キーボード・マウス・パッド・タッチに合わせて切り替わります。ゲームパッドB・○はダイアログを閉じるか撃破演出を省く操作、A・×は決定・星返し・面間演出の静止切替です。

English: Guidance follows keyboard, locked mouse, standard gamepad or touch input. Story, results and help copy use deliberate line breaks. Gamepad B/circle closes dialogs or skips a boss defeat; A/cross confirms, captures or freezes the stage transition.


## 星降るスタッフロール（feedback18）

帰還後のエンドクレジットは、暗い星空とゆっくり降る光、時折流れる星を背景にしたスタッフロールです
役割と名前の間に余白を設け、最後の謝辞だけを中央に残し、「結果を見る」を押すと結果画面へ進みます
「止めて読む」、画面を離れたとき、設定中はロールと星の動きが止まります
演出控えめでは静止した星空と手動スクロールになり、すべてのクレジットを読めます
横向きの小さい画面では、クレジット中だけ横幅を使って表示します

The closing roll uses a quiet starfield with occasional falling stars, generous spacing, and a farewell that stays centred until you choose to view the result
Reading mode, loss of focus, and settings pause the visuals; reduced motion provides a still sky and manual scrolling


## 起動・戦闘調整（feedback19–20）

最初の描画は黒画面です。Y-TEC Forgeロゴが短い鐘の音とともに現れ、黒へフェードした後にオープニングが始まります。自動再生を許可しないブラウザでは、クリック／タップ／Enterで音と映像を同時に始めるか、「音なしで進む」を選べます。保存済みのミュートとSE音量0は維持します。画面を離れると進行と音が止まります。

Forgeの固定キャッチフレーズは「アイデアを、動くものへ。」です。文言と句点を保持し、ロゴの色は作品に合わせて変更できます。今回は淡い金と青緑を使用します。

通常弾の威力を0.4→0.5、三連星の各弾を0.34→0.43、連星レーザーを2→4へ調整しました。時星は20秒間、1回の捕獲を0.25秒延長します。護星は20秒以内の被弾を1回だけ防ぎ、破壊後0.35秒の猶予があります。捕獲はバリアより先に判定するので、星返し中の弾を消費しません。護星はライフ回復ではありません。

ボスのHPは従来より15％増加し、残HP68％以下・34％以下で捕獲可能な弾を段階的に増やします。ビームは予告と当たり幅を保ち、外側の光・芯・発射音を強調しました。音量設定・ミュート・演出控えめに対応します。

ボスHPの浮動小数点による極小の残差を0として扱い、致死ダメージと時間切れが同じフレームなら撃破を優先します。HPが実際に残っている時間切れは維持します。報告された実機事象そのものの再現は未確定で、境界条件の修正と撃破後の演出遷移を確認しています。

English: Startup now begins on black, shows the Forge logo with a chime, fades to black, then plays the opening. Browsers that block autoplay require a deliberate click/tap/Enter or silent start. Saved mute and reduced motion are respected. Normal shots and twin lasers are stronger; two independent 20-second supports extend capture by 0.25 seconds or absorb one hit. Boss HP rises by 15%, with more catchable bullets at lower health. Lethal fractional damage resolves as victory before the deadline. Existing saves and optional rankings remain compatible, though score conditions have changed.

星返しゲージの回復速度は従来の1.3倍。成功後は標準系約3.54秒、ナイトメア4秒、空振り約1.04秒で準備完了です。コンボは引き続き撃破間隔4秒以内で継続します。

English: Capture recharge is 1.3× faster: about 3.54 seconds after a successful capture (4 seconds in Nightmare), or 1.04 seconds after an empty capture. The four-second kill-chain window is unchanged.
