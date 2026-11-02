# Stage2 Mirror Tide: six-chunk runtime asset candidate

Six background chunks plus one small enemy and one boss. All planned runtime art is present, but this is not completed game QA. No stage1/old preview/audio/game code was changed. No X media, rejected music, credentials or executables are included.

## Backgrounds
assets/stage2/route/stage2-route-01.webp through06.webp:960×1440 lossless WebP, displayed480×720, anchor0.5/0.5. Route travels upward through01 then02, scenery moves down.02 is−600logicalpx from01. Top240texture rows of01 exactly equal bottom240rows of02 (120logical overlap). Pixel identity checked after decode. No whole-frame crossfade, wrap, or terrain collision. Three concurrent textures may be necessary at later joins. Each next chunk is−600logicalpx from the prior. Full route3720logicalpx, viewport travel3000logicalpx. Do not loop the scenery.

Generated raster opening: reflected drifting tide becomes distant translucent crystal edges. Opaque rock pedestals removed and central60% detail suppressed. Actual original724×2172 normalized960×2880 before overlapping crops; runtime resolution includes upsampling. Individual source inspected, but actual scrolling/projectile contrast/perceived obstacle readability and mobile performance still require the single writer's game QA.

## Sprites
stage2-mirror: assets/stage2/enemy-mirror.png,256×256 RGBA,display64×64,anchor0.5/0.5,downward-facing. Alpha>=128 body width40logicalpx. Collision radius18 is separately defined by game logic, NOT inferred from glow/silhouette.
stage2-boss: assets/stage2/boss-mirror.png,512×512 RGBA,display190×190,anchor0.5/0.5,downward-facing. Alpha>=128 body width110.2logicalpx. Collision radius53 is independent. Fins/glow are not hit geometry. Game-side shot origins x112/368 are separate and need not coincide with painted ports.

Original sprites are1254×1254 generated transparent raster images. Mechanical Lanczos resizing and transparent-canvas placement align the alpha>=128 body bounds to center and target width. All transparency retained; no procedural/vector illustration or alpha silhouette redraw. Original sources and normalization script retained separately. Visual pixel review, dimensions/alpha and hashes checked. Animated orientation, hitbox comfort and projectile readability are not yet tested in game.

## Rights/provenance
Built-in OpenAI image generation on2026-10-23 UTC /2026-10-24 JST. Background used prior generated project art as style reference. Sprite prompts authored for this project without third-party artwork. Generated output may be used/modified/redistributed in the authorized game; to the extent rights are held it is provided underCC0 1.0 https://creativecommons.org/publicdomain/zero/1.0/ . No exclusive copyright or external stock rights are claimed. Public release remains separate.

## Final journey and join limits
03–04: leave the crystal-lined channel; distant crystals fragment into a diagonally receding reflected arch with broken reflective islands at edges, and a visibly broadening dark water surface. No solid obstacle across the center.
05–06: mostly open mirror-water vista, sparse diffuse distant reflections at corners rather than continuous side walls; broad distant circular reflection develops in low contrast while the central combat area remains dark. Boss vista is open and visually distinct, not another hue-swapped corridor. Pairs01/02,03/04,05/06 share exactly equal240px overlaps. Cross-generation joins02/03 and04/05 are NOT pixel-identical; supplied join-after-02/04-reference.webp holds the old edge. The asset-only scroll preview uses a linear local240px overlap blend. This prevents a hard seam in that atlas preview but does not certify actual engine blend, mobile contrast or subjective seamlessness. The PC writer must reproduce and inspect these boundaries. Do not claim all joins pixel-identical.
