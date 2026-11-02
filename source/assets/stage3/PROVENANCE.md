# Stage 3 raster art provenance and runtime contract

The six route paintings, pulse enemy, and eclipse boss were generated for this development copy using the available image generation tool on NewLightning. There are no external reference images or stock pictures in the Stage 3 visual assets. The six original PNGs and two sprite source PNGs are retained beside the runtime files. The runtime conversions use FFmpeg resize/crop and WebP or PNG encoding; no drawing with combinations of geometric shapes was used for the illustrations.

The route follows a dark starfield, an approaching partial distant arc, the inside of a nebula, and a brighter homeward view. The incomplete arcs are diffuse scenery, distinct from crisp attack warnings. Each runtime section is 960×1440 px, drawn at logical 480×720. Sections overlap by 120 logical px; independently generated boundaries are **not exact pixel matches**, so the renderer applies a local blend. The game's dark central area remains available for purple enemy bullets, golden returned stars, and the white player hit point.

| Asset | Source dimensions | Runtime file and dimensions | Display |
| --- | --- | --- | --- |
| Route 01–05 | 941×1672 px, except 05 at 940×1672 | `route/stage3-route-01.webp` through `-05.webp`, 960×1440 px | 480×720 per section |
| Route 06 | 1024×1536 px | `route/stage3-route-06.webp`, 960×1440 px | 480×720 |
| Pulse enemy | 1536×1024 RGBA | `enemy-pulse.png`, 256×256 RGBA | 64×64 centered, facing down |
| Eclipse boss | 1024×1536 RGBA | `boss-eclipse.png`, 512×512 RGBA | 190×190 centered, facing down |

The sprite source backgrounds have transparent alpha; runtime corner alpha is zero. Collision and capture geometry live in `core.js` and are independent of these image bounds. Stage 3 art has not yet been reviewed by the user. The route join, HUD contrast, and boss silhouette were inspected in an isolated browser QA tab; physical phone display remains unverified.
