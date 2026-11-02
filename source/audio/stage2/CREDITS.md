# 第2ステージ BGM 候補（内部試遊）

## 道中

- 曲：Some Weirdo「Frenzied Swimming」
- 作者公開ページ：https://opengameart.org/content/frenzied-swimming
- 作者表示ライセンス：CC0 1.0
- 公式 OGG：https://opengameart.org/sites/default/files/frenzied_swimming_0.ogg
- 公式 OGG：2,583,514 bytes、SHA-256 `0151e0915001df577133eccf86560ddfc00ecba549fe401dd5cf6a04963e0df5`
- `frenzied_swimming_converted.mp3` は公式 OGG から、既存の FFmpeg 8.1.1 の libmp3lame `-q:a 2` で変換した互換用ファイル。公式 MP3 ではない。1,257,060 bytes、SHA-256 `31404a3f8aad70c37202b91df9233e951a6e07e6a9ff70dfeb8c602d3ca6fed7`。
- 復号長の候補：44,100 Hz、2,822,400 frames、64.000 秒。ループは 0–64 秒を試す。初期 gain は、従来の道中曲の 0.55 に対して 0.35。

## ボス

- 曲：MintoDog「Hard Boss Battle 1」
- 作者公開ページ：https://opengameart.org/content/hard-boss-battle-1
- 作者表示ライセンス：CC0 1.0
- 公式 OGG：https://opengameart.org/sites/default/files/hard_boss_battle_1_bpm200_0.ogg
- 公式 OGG：2,796,698 bytes、SHA-256 `f245060a9bd0ddf0c1ec2b60af47d914d94e2fe53d6f1bbd442163f46c04a30b`
- 公式 MP3：https://opengameart.org/sites/default/files/hard_boss_battle_1_bpm200.mp3
- 公式 MP3：3,206,917 bytes、SHA-256 `28e66087d1ee65aee259778acaaba188978ca43bfd09849e755386a2965922dc`
- 復号長の候補：44,100 Hz、3,532,410 frames、80.100 秒。ループは 0–80.1 秒を試す。初期 gain は 0.27。

作者公開の完成曲を比較するための内部候補であり、正式採用・公開の判断は別途行う。第1面の道中曲、Heavy Battle 2、v2 効果音は変更しない。実ゲームの聴感、ループ境界、音量は試遊で評価する。
