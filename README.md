# 星返し / STAR REBOUND

迫る弾を、帰り道の光に

近くの敵弾を取り込み、金色の追尾弾として返す縦型ブラウザシューティング
三つの星の海を進み、三体の主を越えて、途切れた星路をつなぎ直します

- 3ステージ、4段階の難しさ、55秒の練習モード
- キーボード、マウス固定、standard配列のゲームパッド、タッチ
- 端末内の記録・設定保存、任意のオンラインランキング
- 音量調整、ミュート、演出控えめ、全画面表示
- 現行候補: v9 feedback27（選択肢の視認性・エンドロール速度・撃破音量） / 2026-11-04

## 起動

ゲーム本体はsourceの静的ファイルです
Phaserとフォントは同梱済みで、ビルドやnpm installは不要です

```sh
python -m http.server 8877 --bind 127.0.0.1 --directory source
```

ブラウザで <http://127.0.0.1:8877/> を開いてください
ランキングにはPHPの設定が必要ですが、静的サーバーでも端末内の記録で遊べます

## 操作

| 方法 | 移動 | 星返し | 停止・再開 |
|---|---|---|---|
| キーボード | 矢印 / WASD | Space | P / Esc |
| マウス固定 | マウスの相対移動 | 左クリック | P / Esc、再開はボタンクリック |
| ゲームパッド | 左スティック / 十字キー | A / × | Start / Menu |
| タッチ | 盤面をなぞる | ダブルタップ / 星返しボタン | Ⅱボタン、再開はタップ |

起動時に言語・操作方法・全画面・音あり／なしを選びます。スマホは「タッチ」がおすすめです
「操作・音」で言語・操作方法・スマホ用ボタンの左右を変更できます。初期位置は左、保存済みの右設定は引き継ぎます
マウス固定の解除や画面離脱でゲームを停止します

## 検証

Node.js 20以上で、依存追加なしに同梱契約テスト・JavaScript構文・ファイルハッシュを確認できます

```sh
node scripts/check.cjs
```

PHP 8.3以上とPDO_SQLITE / mbstringがある環境では次も実行できます
テストは合成データのメモリー内DBを使います

```sh
php verification/feedback4-ranking-contracts.php
php verification/feedback12-ranking.php
php verification/forge-sqlite-compat.php
```

1280×720、375px、320pxで表示・主操作・停止復帰・保存・演出控えめを確認しています
物理スマホ・物理パッド・スピーカー、および人による全難度3面通し攻略は未実施です
合成入力や内部状態を使った自動確認は、人の通常攻略とは区別しています

## 配信とライセンス

Webへ配信するのはsourceだけです
server、DB、署名鍵、認証情報、バックアップ、個人の保存データをWeb公開ルートへ置かないでください
Gitへは実データ・鍵・内部作業記録を含めません

[詳しい遊び方](source/README.md) / [ランキング設定](server/README.md) / [オンラインデータ](source/ONLINE.md)

オリジナルコードはApache-2.0、素材と同梱依存には個別条件を適用します
[LICENSE](LICENSE)、[NOTICE](NOTICE)、[素材とライセンス](source/LICENSES.md) の区分を維持してください
コードの許諾は作品名・ブランドの公式性や推薦を与えません
UI・物語・ランキング案内・結果画像・謝辞は日本語／英語を切り替えられます。[English player guide](source/README.en.md)も同梱しています

## English

STAR REBOUND is a vertical browser shooter: capture nearby bullets and return them as golden homing shots. Three stages, four difficulties and a 55-second practice mode. The full interface and story support Japanese and English, selectable at startup or in Settings. See the [English player guide](source/README.en.md).

Run the Python command above and open http://127.0.0.1:8877/ . No build or npm dependencies are required; Phaser and fonts are bundled. Controls: arrows/WASD + Space; locked mouse + left click; standard gamepad stick/D-pad + A/cross; or touch drag + double-tap/touch button. P/Esc pauses; gamepad Start/Menu pauses and resumes. Mouse resume requires a deliberate click.

Run node scripts/check.cjs with Node.js 20+ for portable verification. PHP tests require PHP 8.3+, PDO SQLite and mbstring. Browser automation does not replace physical phone/controller/audio checks or a human full-game playthrough.

Serve only source/. Keep server/, SQLite, signing keys and backups outside the web root. Online ranking is optional; static hosting supports local records. See [server setup](server/README.md) and [data disclosure](source/ONLINE.md). Original code uses Apache-2.0; assets and dependencies retain the individual licenses in [source/LICENSES.md](source/LICENSES.md). No account, analytics or CDN is required for the static game.
