# ライセンスと素材クレジット

このファイルの自作部分に関する条件は、以下の第三者素材の条件を変更しません。再配布時は該当するライセンスと権利表示を維持してください。

## 自作コード

本作品のオリジナルのHTML / CSS / JavaScriptは Apache License 2.0 で提供します（SPDX: Apache-2.0）。利用・改変・再配布には同ライセンスの条件が適用されます。配布には Apache License 2.0 の全文を同梱してください。作品は現状のまま提供され、動作保証はありません。

## 生成ラスタ画像・自作音源

assets/ のオリジナル画像は生成AIを用いたラスタ画像です。audio/ のオリジナル楽曲・効果音とともに、提供者が保有し、適法に放棄・許諾できる著作権等の範囲で CC0 1.0 Universal により提供します。第三者由来の素材には、次節の個別条件が適用されます。

生成物に独占的な著作権が成立すること、または第三者の権利が一切存在しないことを保証するものではありません。CC0は、提供者が保有しない権利を譲渡するものではありません。

## Phaser

- 使用箇所：vendor/phaser.min.js
- ライセンス：MIT
- 同梱通知の権利者：Copyright (c) 2024 Richard Davey, Phaser Studio Inc.
- ライセンス全文：licenses/PHASER-MIT.txt

## Noto Sans JP

- 使用箇所：fonts/noto-sans-jp.woff2
- ライセンス：SIL Open Font License 1.1
- 同梱の出典・著作権・ライセンス通知：licenses/Noto-CJK-OFL.txt
- 上流プロジェクト：Noto CJK（同梱通知に出典を記載）

フォントは自作素材のCC0対象ではありません。変更・再配布時はOFLの条件に従ってください。

## Zen Kaku Gothic New / Orbitron（見出し・数字）

- 日本語見出し：Zen Kaku Gothic New Black。Copyright 2022 The Zen Kaku Gothic Project Authors。
- 英字・得点・連鎖数字：Orbitron variable。Copyright 2018 The Orbitron Project Authors。Reserved Font Name: Orbitron。
- `fonts/ZenKakuGothicNew-Black.ttf` と `fonts/Orbitron-Variable.ttf` はGoogle Fonts公式リポジトリの固定commitから取得した未改変原本。
- SIL Open Font License 1.1。著作権と全文を `licenses/zenkakugothicnew-OFL.txt`、`licenses/orbitron-OFL.txt` に同梱。取得URL・日付・SHAは `fonts/Arcade-PROVENANCE.json`。
- 作品へ埋込み・再配布可、フォント単体販売不可。ローカル配信のみ。フォントはApache-2.0/CC0へ再許諾せずOFLを維持。

## VSCO 2 Community Edition / Upright Piano

音源制作には、VSCO 2 Community Edition の Upright Piano サンプルを使用しています。

- サンプリング：Simon Dalzell / Ivy Audio、2015–2016年冬。
- 付属情報には、Versilian Studios LLC によるこのサンプルセットの再配布許可、および原作者とVersilian Studiosへのクレジット推奨を記載。
- 出典通知：licenses/Upright-Piano-Info.txt
- 同梱CC0全文：licenses/VSCO-2-CE-CC0-LICENSE.txt

Simon Dalzell、Ivy Audio、Versilian Studios に感謝します。本作品がこれらの作者・団体から推奨または認定されていることを意味しません。

## 第1ステージ開発素材（2026-10-23）

第1ステージの背景3層は、作品用に生成したラスタ画像を縮小・WebP化したものです。外部の参照画像やストック画像は使っていません。生成物の排他的な著作権や第三者権利の完全な保証は主張しません。権利が成立する範囲で、作品用素材は CC0 1.0 として提供します。詳細は `assets/stage1/PROVENANCE.md` と `assets/stage1/manifest.json` に記録しています。

BGM `stage1-flow` と新SE `capture`、`rebound`、`hit` の制作・再配布根拠は `audio/stage1/CREDITS.md` と `audio/stage1/manifest.json` を参照してください。実録サンプルの出所は VSCO 2 Community Edition 公式リポジトリで、同梱 `audio/stage1/licenses/VSCO-2-CE-CC0-LICENSE.txt` を適用します。Upright Piano の個別説明は `audio/stage1/licenses/Upright-Piano-Info.txt` に保存しています。ランタイムZIPには編集用WAV原本を含めず、クラウド側で別保管します。
# ボス曲候補（試遊のみ・正式採用未決定）

- 作品：Heavy Battle 2
- 作者：MintoDog（てんちゃんの作曲ではありません）
- 作者公開ページ：https://opengameart.org/content/heavy-battle-2
- ライセンス：CC0 1.0 Universal（作者公開ページに表示）
- 配置：`audio/stage1/candidate-heavy-battle-2/heavy_battle_2_bpm185.ogg` / `.mp3`
- OGG SHA-256：`01d3d505139161a04b3f225ad9cdc0acb52a8e21c997e658c916173def647df8`
- MP3 SHA-256：`3dd1b959c4734a7463998e07f9b95a810d277c3b8946630988651ff2ef3fc222`

候補専用の固定試遊版でボス曲として評価するために同梱しています。既存の道中曲とSEの作者・権利表記は変更していません。

## 第2ステージ内部候補素材（2026-10-24）

第2面の背景6区間と敵・ボス画像は、この作品用に生成したラスタ画像を縮小・WebP化または透過PNG化したものです。作者から渡された素材パックの来歴、サイズ、ハッシュは `assets/stage2/source-pack/README.md` と `manifest.json` に記録しています。権利が成立する範囲で CC0 1.0 として提供されます。第2面の実ゲーム内での見え方は検証中です。

第2面の道中候補は Some Weirdo「Frenzied Swimming」、ボス候補は MintoDog「Hard Boss Battle 1」。両作者の OpenGameArt 公開ページで CC0 と表示されています。公式音声の URL・SHA-256、道中曲の互換用 MP3 変換は `audio/stage2/CREDITS.md` に記録しています。候補曲は本人の正式採用・公開許可を意味しません。第1面の楽曲とSEは保持しています。

## Stage 3 candidate assets (private development copy)

The Stage 3 route paintings and enemy/boss sprites were generated on NewLightning for this game. Original PNGs, runtime files, display dimensions, and the non-identical join treatment are documented in `assets/stage3/PROVENANCE.md`. No third-party stock imagery is included in these Stage 3 visuals. Final user acceptance of the artwork remains pending.

Stage 3 candidate field music is MintoDog's "Space Battle" and candidate boss music is MintoDog's "Space Boss Battle". Both author pages state CC0 and loopable. Sources: https://opengameart.org/content/space-battle and https://opengameart.org/content/space-boss-battle . The byte-for-byte download hashes, official formats, and loop values are recorded in `audio/stage3/CREDITS.md`. These are not compositions by the game's developer and have not yet passed a user listening review.

## V5 generated item illustrations (private work copy)

`assets/item-twin-v5.png` and `assets/item-spread-v5.png` were generated with the built-in OpenAI image generation tool for this game on 2026-10-24. Both are transparent raster illustrations, 1254 × 1254 pixels, and contain no third-party stock assets. The twin prompt requested two golden stellar crystals in an amber orbit; the spread prompt requested one blue-green three-pronged energy crystal. Both requested a hand-painted game sprite, clear small-scale silhouette, no text, no UI panel and genuine transparency. These assets are in the V5 work copy only and are not yet a released art set.

`assets/enemy-skimmer-v5.png` is a generated transparent raster illustration of a cyan/indigo glass manta skimmer, intended as a moving flank enemy in Stage 1. `assets/stage1/landmark-star-whale-v5.png` and `assets/stage1/landmark-broken-arch-v5.png` are generated transparent raster illustrations for the Stage 1 scenery. The whale prompt requested a colossal distant dark indigo star whale with restrained turquoise bioluminescence. The arch prompt requested an asymmetrical broken amber/blue-black celestial arch with no closed circle or small bright particles. These were made with the same built-in image generation tool on 2026-10-24. Game-context visual approval is pending.

## V6 generated enemy illustrations (private work copy)

`assets/stage2/enemy-darter-v6.png` and `assets/stage3/enemy-lantern-v6.png` are transparent raster illustrations generated with the built-in OpenAI image generation tool for this game on 2026-10-24. They represent a cyan mirror-tide darter and a violet nebula lantern. The optimized 320×320 runtime derivatives are `enemy-darter-v6-runtime.webp` and `enemy-lantern-v6-runtime.webp` in their respective stage folders. No third-party stock image was supplied for these two pieces. The artwork is pending final user acceptance and has not been published. Their SHA-256 hashes, in the order above, are `C06A4ED54BD3D9FD736BDA3FFD3B793DEB9100E96FB4244FAE86690915E6A471`, `06420121A666A9C4819F6CB112E70DD96745A798AEF8DB3B8DC894ACF2066330`; the runtime derivatives are `4E764FBDC6C93E0F0D4A842D0EDE770759107C48DC0F48EA532AC5469E547BC9`, `5A948754196755DFC62B2A84F636278E285AC7380CB45BE242BF6889FD96CF42`.


## V7 generated screen and environment art (private work copy)

The five screen illustrations and six transparent scenery layers in `assets/v7-art/` were generated with OpenAI image generation for the user's original game on 2026-10-25. They are not third-party CC0 stock and are not labeled as such. The user may use and modify the output under the applicable OpenAI output rights. The source promotional image used as visual reference is not redistributed here. File roles, provenance, dimensions, and SHA-256 hashes are in `docs/v7-art/README.md`, `GENERATION.md`, and `manifest.json`. Master PNGs are stored separately by the asset creator; these WebPs are runtime derivatives. The artwork remains a private development candidate pending game-context and user review.

## 星空アーケード追加SE / Arcade cues (2026-11-01)

`audio/arcade/chain-1..4` と `pickup-spread/twin/pierce`（OGG/MP3）は Kenney **Interface Sounds 1.0**（CC0 1.0）の confirmation_001/003/004、glass_001 から音程変更・短い重ね合わせ・音量調整・fadeを施したものです。原作者は Kenney。商用利用・改変・再配布可、任意の帰属表示を行います。既存BGM/SEの権利は不変です。

公式出典: https://kenney.nl/assets/interface-sounds 。同梱通知: `audio/arcade/License.txt`。変換元・手順・各ファイルSHA-256: `audio/arcade/PROVENANCE.json`。ブラウザで音声を復号し波形を確認済み、物理スピーカーでの聴取は未実施です。
