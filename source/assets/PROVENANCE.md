# STAR REBOUND original raster asset provenance

All artwork in this folder was newly generated for this original game using the built-in OpenAI image generation tool on 2026-10-22. No external reference images, stock art, traced art, fonts, vector drawings, or third-party artwork were supplied. This is AI-generated original project artwork, not an assertion of exclusive copyright or a third-party stock license. It may be included with this owner-private game and its source ZIP under the project authorization; public distribution was not performed.

Seven original source PNGs are retained in sources/. generation.json contains the exact prompts, source filenames and SHA-256 hashes. manifest.json contains production file hashes, dimensions, alpha extrema, transparent/partial pixel counts and sizes.

Production preparation was mechanical crop, centered padding, Lanczos resize and background PNG-to-WebP compression only. The four-shot and two-effect source sheets were split along their cell boundaries. No procedural, SVG, CSS or manually drawn artwork was substituted. Generated alpha was preserved through normalization.

## Runtime assets
- background.webp: 1536×1024. Opaque. Quiet central playfield. Recommended portrait crop: center.
- player.png: 256×256. Cyan manta, points upward. Golden core at approximately (128,87), normalized origin (0.5,0.34). Align collision center here rather than tail-weighted geometric center. Recommended display width 50–60px.
- enemy-ray.png: 256×256. Magenta coral seed. Recommended display width 48–56px.
- enemy-jelly.png: 256×256. Violet armored prism lantern. Recommended display height 64–78px.
- boss.png: 512×512. Eclipse flower. Recommended display width 180–210px.
- bullet-petal.png: 128×128. Cyan FRIENDLY pearl. Not for hostile shots.
- bullet-thorn.png: 128×128. Magenta hostile thorn pearl.
- star.png: 128×128. Gold five-point converted star.
- spark.png: 128×128. Ivory four-ray soft spark.
- ring.png: 512×512. Cyan/gold capture ring. Use around 200px diameter, opacity 0.25–0.5; center alpha is 1/255, perceptually transparent.
- glow.png: 256×256. Golden burst haze. Use restrained opacity, avoid rapid or full-screen flash.

## Verification
Actual-pixel montage game-scale-preview.jpg was visually inspected at player50/coral48/prism64/boss180/shot18–24/ring200 pixels. Silhouettes and team color separation are legible. source-preview.jpg is a contact sheet of generation outputs. All production sprites contain true transparent pixels and soft partial-alpha edges; no baked checkerboard or rectangular background was detected. This is asset inspection, not an in-engine playtest.
