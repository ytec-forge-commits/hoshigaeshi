# 星返し v7 — raster art pack

Created 2026-10-25 UTC (2026-10-26 JST) by てんちゃん using the built-in OpenAI image generator. This is a private development asset handoff, NOT a game release and NOT X-post material.

## Files / roles
- title: teal/gold star-whale ship vs magenta crystalline swarm.
- stage1-clear: 潮の峡谷, crystal tide canyon, arch, friendly star-whales.
- stage2-clear: 鏡面水路, reflected crystalline canal and refracted dawn.
- final-clear: 時環の帰路, starfield and irregular nebula arcs opening toward home.
- gameover: intact ship gathering light for another attempt; dawn ahead.
- stage1-mid / stage1-near: far crystal formations / tidal light and drifting chips.
- stage2-mid / stage2-near: far violet crystals / refractive shards.
- stage3-mid / stage3-near: thin blue cloud rifts / irregular blue-gold nebula wisps.

All screen masters are 1024×1536 RGB PNG. Layer masters are 1024×1536 RGBA PNG. Runtime screens retain 1024×1536 WebP; runtime layers are 512×768 RGBA WebP, for the logical 480×720 playfield. Runtime images are quality90 WebP; PNG masters remain unchanged. See manifest.json for dimensions and SHA-256.

## Integration contract and limitations
- Keep text, score, buttons and logo in accessible HTML/game UI, not baked into art. Central dark zones are intended for it. Prefer a readable backing gradient and check actual contrast at mobile size.
- Compose layers BEHIND all gameplay objects, not over enemies/bullets/HUD. Start global opacity around0.08–0.22, tune via actual capture. They are decoration, not collidable objects or attack warnings.
- Alpha is genuine and was tested, but mist is not mathematically absent from the whole central60%. Stage2-mid and stage3-mid need particularly conservative opacity. No synthetic opacity mask was added to the generated art.
- Edges are soft but NOT certified seamless. Use overlapping fade-in/out scroll instances rather than hard adjacent tiles; inspect long recording. Avoid rotating arcs into regular rings that resemble boss telegraphs.
- Parallax speed, slow lateral drift, opacity variation and layering should create motion; this pack alone does not establish background motion quality. Respect reduced-motion and visibility preferences.
- All11 masters were visually inspected. Distinct worlds, alpha channel, image dimensions, decoding and hashes verified. No text/UI/URL included. No game integration, mobile rendering, animated seam test, gameplay or screenshot-export test performed by the asset worker; those remain the single writer's responsibility.
- gameover includes magenta crystal fragments at the border, but the intact luminous hero and distant dawn preserve a hopeful retry reading.

## Provenance / permitted use
These11 assets were newly generated with OpenAI built-in image generation for this user's original game. Five screens used the existing user-provided 星返し promotional artwork as visual reference, through newly generated title art. Six overlay images were independently text-generated. No stock image, third-party font, music or external icon library is embedded. The reference screenshot/promotional source itself is NOT included in the ZIP.

These are AI-generated raster artworks, not third-party OSS code. They may be included and modified in the user's 星返し game and its source ZIP under the user's applicable OpenAI output rights. Do not falsely label them as stock CC0 or claim exclusive copyright/protection where it may not exist. No external stock attribution requirement was introduced by this pack. Existing project licenses remain unchanged. This provenance note must travel with the pack; it does not purport to grant rights beyond those held by the user.

No external API/CLI image generation, user-PC commands, base64 patch saving, Site upload, public publication, or SNS posting was used for this pack.
