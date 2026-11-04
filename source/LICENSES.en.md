# Licenses and asset credits

[日本語](LICENSES.md)

This English guide follows the existing rights divisions in the Japanese notice. It does not relicense third-party material. Preserve the applicable license texts and copyright notices when redistributing.

## Original code

Original HTML, CSS and JavaScript are provided under the Apache License 2.0 (SPDX: Apache-2.0). Use, modification and redistribution are subject to its terms. Include the full license with distributions. The work is provided as-is, without warranty.

## Generated raster art and original audio

The earlier original images in `assets/` are AI-generated raster artwork. Original music and sound effects in `audio/`, and those original game assets designated CC0 in their records, are provided under CC0 1.0 Universal only to the extent that the provider owns rights and can legally waive or license them. Third-party materials retain their individual conditions below. The additional SVGs and Forge branding are described separately.

No guarantee is made that generated output has exclusive copyright protection or is free of all third-party rights. CC0 cannot transfer rights the provider does not own. Later V7 artwork has the distinct recorded terms described below.

## Bundled libraries and fonts

- **Phaser:** `vendor/phaser.min.js`, MIT. Bundled copyright: Copyright (c) 2024 Richard Davey, Phaser Studio Inc. Full notice: `licenses/PHASER-MIT.txt`.
- **Noto Sans JP:** `fonts/noto-sans-jp.woff2`, SIL Open Font License 1.1. Source, copyright and license: `licenses/Noto-CJK-OFL.txt`; upstream Noto CJK.
- **Zen Kaku Gothic New Black:** Japanese headings. Copyright 2022 The Zen Kaku Gothic Project Authors. Full notice: `licenses/zenkakugothicnew-OFL.txt`.
- **Orbitron variable:** Latin headings, numbers and chains. Copyright 2018 The Orbitron Project Authors; Reserved Font Name: Orbitron. Full notice: `licenses/orbitron-OFL.txt`.

The latter two font files were obtained unmodified from a fixed commit in the official Google Fonts repository. URLs, dates and hashes are in `fonts/Arcade-PROVENANCE.json`. Their OFL terms permit embedding and redistribution, but not sale of the fonts by themselves. Fonts are served locally and are not relicensed under Apache-2.0 or CC0.

## VSCO 2 Community Edition and Upright Piano

Original music production used the Upright Piano samples in VSCO 2 Community Edition. Sampling: **Simon Dalzell / Ivy Audio**, winter 2015–2016. The accompanying information records Versilian Studios LLC's permission to redistribute the sample set and recommends crediting the original author and Versilian Studios.

- Source notice: `licenses/Upright-Piano-Info.txt`.
- Bundled CC0 text: `licenses/VSCO-2-CE-CC0-LICENSE.txt`.

Thanks to Simon Dalzell, Ivy Audio and Versilian Studios. Their names do not imply endorsement or certification of this game.

## Stage art and music records

- **Stage 1 backgrounds (2026-10-23):** three layers generated for the game, resized and converted to WebP, with no external reference or stock image. CC0 applies where the provider holds rights. See `assets/stage1/PROVENANCE.md` and `manifest.json`. Original `stage1-flow`, `capture`, `rebound` and `hit` audio records are in `audio/stage1/CREDITS.md` and `manifest.json`. The underlying piano source is the official VSCO 2 CE repository; local notices are in `audio/stage1/licenses/`. Editable WAV masters are held separately and are not part of the runtime package.
- **Stage 1 boss music:** *Heavy Battle 2* by **MintoDog**, not the game's developer. The author page identifies CC0: https://opengameart.org/content/heavy-battle-2 . OGG/MP3 candidate files are under `audio/stage1/candidate-heavy-battle-2/`; their exact hashes remain in the Japanese notice and provenance records.
- **Stage 2 art (2026-10-24):** six route sections, enemies and boss were generated for this game and resized into WebP or transparent PNG. The source-pack provenance, dimensions and hashes are in `assets/stage2/source-pack/README.md` and `manifest.json`; CC0 applies where rights exist.
- **Stage 2 music:** *Frenzied Swimming* by **Some Weirdo** and *Hard Boss Battle 1* by **MintoDog**, identified as CC0 on their OpenGameArt author pages. Original URLs, hashes and MP3 conversion details are in `audio/stage2/CREDITS.md`.
- **Stage 3 art:** route paintings and enemy/boss sprites generated on NewLightning for this game. Original PNGs, runtime derivatives, dimensions and special join treatment are in `assets/stage3/PROVENANCE.md`. No third-party stock imagery was used for these visuals.
- **Stage 3 music:** *Space Battle* and *Space Boss Battle*, both by **MintoDog**, identified as CC0 and loopable on the author pages: https://opengameart.org/content/space-battle and https://opengameart.org/content/space-boss-battle . Official formats, exact download hashes and loop values are in `audio/stage3/CREDITS.md`.

The historical records describe candidate and private-development status, including pending visual or listening acceptance at that time. Inclusion of those records does not mean that the music was composed by the game's developer or that every physical-device review has been completed.

## V5 and V6 generated illustrations

V5 item images `item-twin-v5.png` and `item-spread-v5.png` were generated with OpenAI image generation on 2026-10-24. They are 1254×1254 transparent raster images with no third-party stock. Their prompts describe twin golden stellar crystals in an amber orbit and a blue-green three-pronged energy crystal, respectively, with a painted sprite appearance, small-scale readability, no text or UI panel, and transparency.

The same tool generated `enemy-skimmer-v5.png`, `stage1/landmark-star-whale-v5.png` and `stage1/landmark-broken-arch-v5.png` for the game: a cyan/indigo glass manta, a vast dark indigo whale with restrained turquoise light, and an asymmetric broken amber/blue-black arch.

V6 `stage2/enemy-darter-v6.png` and `stage3/enemy-lantern-v6.png` were generated on 2026-10-24: a cyan mirror-tide darter and violet nebula lantern. Their optimized 320×320 derivatives are `enemy-darter-v6-runtime.webp` and `enemy-lantern-v6-runtime.webp`. No third-party stock input was supplied. Exact original and derivative hashes remain in the Japanese notice and asset manifests. The source records retain the historical pending-acceptance status.

## V7 screen and environment art

The five screen paintings and six transparent scenery layers in `assets/v7-art/` were generated with OpenAI image generation on 2026-10-25 for the user's original game. They are not third-party CC0 stock and are not labeled as such. The user may use and modify the output under the applicable OpenAI output rights. The promotional reference image is not redistributed.

Roles, provenance, dimensions and hashes are in `docs/v7-art/README.md`, `GENERATION.md` and `manifest.json`. These WebPs are runtime derivatives; master PNGs are held separately by the asset creator. Historical private-candidate and pending-review notes remain in those records.

## Arcade sound effects (2026-11-01)

`audio/arcade/chain-1..4` and `pickup-spread/twin/pierce` in OGG/MP3 are derivatives of **Kenney Interface Sounds 1.0**, CC0 1.0. Source clips are `confirmation_001/003/004` and `glass_001`, with pitch changes, short layering, gain adjustment and fades. Original author: **Kenney**. Commercial use, modification and redistribution are permitted; credit is provided voluntarily. Existing music and sound-effect terms remain unchanged.

Official source: https://kenney.nl/assets/interface-sounds . Bundled notice: `audio/arcade/License.txt`. Inputs, conversion steps and hashes: `audio/arcade/PROVENANCE.json`. Browser decoding and waveform checks do not constitute physical-speaker listening tests.

## Geometric icons, synthesized sounds and Forge branding (2026-11-02)

`assets/item-extend.svg` and `assets/item-guard.svg` are original geometric game icons written in code, without external imagery, stock material or an image-generation model. They follow the existing original-game-asset CC0 1.0 terms, within rights the provider can grant.

The startup chime in `startup.js` and six effects in `sound-design.js` are synthesized at runtime from sine waves, envelopes and pseudorandom noise, with no external samples. Synthesis code is Apache-2.0; the generated sound follows the original-effect CC0 terms. Existing audio files were not overwritten.

**Y-TEC Forge**, its Y mark, wordmark, Japanese tagline **「アイデアを、動くものへ。」**, and English tagline **“Turning ideas into working creations.”** are brand identifiers. Code and game-asset licenses do not grant permission to use the branding freely or imply official endorsement. Their appearance in this game is requested by the owner and does not relicense the brand to third parties. Colors may suit the work; the established tagline wording is retained.

## Generated projectiles / 生成弾素材 (2026-11-04)

`assets/projectiles-v2/petal.png`, `thorn.png`, `gold.png`, `player.png`, `return.png` are original transparent raster illustrations generated with the built-in OpenAI image tool. They follow the existing original generated-raster terms above, within the rights the provider can grant. No third-party reference image or stock was supplied. Prompts, tool and runtime processing are recorded in `assets/projectiles-v2/PROVENANCE.md`; dimensions and SHA-256 are in `manifest.json`. The previous adopted sprites are retained.

The earlier 2026-11-04 procedural boss-defeat, UI and opening cues were replaced by the selected recordings documented below. Their historical description does not apply to the new recordings.

## 選択済み音源 / Selected recordings (2026-11-04, feedback25)

Opening: StumpyStrust — Doodle menu like song (CC0). Chain, metal button and boss defeat: Kenney Interface / Impact / Sci-Fi Sounds (CC0). Player shot: Zane Little — Theremin Laser SFX (CC0). Enemy defeat: qubodup — Dull explosion (CC0). Stage passage: **OtoLogic — Onoma-Sparkle08-1 (Short), CC BY 4.0**.

OtoLogicの素材を使用しています。移動音は先頭3秒へ短縮、音量調整・末尾280msフェードを適用。全選択音源は音程・再生速度を保持。OPは試聴版先頭12秒の抜粋です。 / Sound by OtoLogic; modified with a three-second excerpt, gain adjustment and 280 ms end fade. All selected cues retain their original pitch and speed; the opening is a 12-second excerpt.

出典・改変・原作者通知・全文 / Sources, modifications, original notices and full licenses: [audio/selected/CREDITS.md](audio/selected/CREDITS.md). SHA-256 and processing: [PROVENANCE.json](audio/selected/PROVENANCE.json). Third-party terms remain separate from the original-code and original-asset licenses.

## Bell-chain revision / 連鎖ベル改訂（feedback28）

`audio/selected/chain-bell-1..4.ogg/mp3` are original synthesized bell chords, under the existing CC0 1.0 original-audio policy. They contain no third-party recordings. The previous Kenney chain files and notices remain preserved. Recipe, hashes and verification: [CHAIN_BELLS.json](audio/selected/CHAIN_BELLS.json).

現在の連鎖ベル8ファイルは作品用のオリジナル合成音です。既存の自作音源CC0区分を継続し、他の録音・第三者素材の利用条件は変更しません。
