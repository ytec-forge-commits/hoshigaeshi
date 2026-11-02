# Six-chunk runtime candidate — updated integration contract

This package supersedes earlier runtime delivery logistics only. Artwork bytes are unchanged. It contains ALL SIX route textures, old-edge reference bands, provenance and this updated contract. No audio, master PNG, user data or game code is included. Full masters remain in separately retained v3/v4 Library packages.

Display each960×1440 texture at480×720logical, route01→06 upward, successive origin offsets -600logicalpx, overlap120logicalpx. Six chunks yield3720logical height, camera travel3000.84second field implies35.714logicalpx/sec average. Cleanup decelerates near last vista; boss holds. No wrapping, no whole-screen frame switch.

IMPORTANT updated memory contract: PC integration found overlap may require THREE simultaneous visible textures transiently. This is accepted; earlier docs claiming maximum two are superseded here. Three raw RGBA textures cost approximately16.59MB excluding engine overhead. Load/dispose policy and mobile performance still require actual measurement.

Exact overlap pairs:01→02,03→04,05→06. Their240texture-row shared regions are identical after decode. Cross-generation joins02→03 and04→05 are NOT pixel-identical and NOT yet accepted seamless. join-after-02-reference.webp and join-after-04-reference.webp preserve exact old edge pixels. Apply spatial local overlap/masking at these boundaries and test actual movement. Do not claim all joins passed based on the three exact pairs. The root instruction is continuous journey; no return to three full-screen crossfades.

All imagery is original built-in OpenAI generated raster output with generated predecessor reference only. No stock or third-party art was used. Technical preparation used resizing/cropping/lossless encoding; actual source724×2172 rather than requested1024×3072 is documented. To extent rights are held, project-generated imagery is contributed underCC0 1.0; no exclusive copyright or third-party clearance assertion. PNG masters and reproduction scripts exist in separate archives. No vector/procedural illustration substitute.

QA status: original images visually inspected; exact shared pairs verified; file SHA and ZIP CRC verified. Actual game cross-generation boundary traversal, side-shot contrast, phone performance, pause/resize and renderer allocation are pending PC QA. Candidate/staging only, not complete/public release.

