# Stage 1 continuous-route candidate: first adjacent two chunks

This is an ASSET-ONLY candidate, not game footage or a completed route. No game/Site/previous assets were modified. Remaining four chunks are on hold until these two pass connection and readability review.

## Contract
Runtime stage1-route-01.webp and stage1-route-02.webp: 960×1440 each, displayed at480×720 logical. Adjacent sections overlap240 texture pixels /120 logical pixels. Route01's TOP240 pixels exactly equal route02's BOTTOM240 pixels (verified after lossless WebP decode). Use one logical path, not full-screen scene crossfades. Route02 is600 logical pixels ABOVE route01. As camera travels upward, geography moves DOWN the screen. Overlapping region is the same geography, not two copies placed end-to-end. No transparency fade is necessary within this overlap.

Start at bottom of route01, progress upward into route02. Six planned chunks would yield3720px total route height, camera travel3000px for720px viewport, approx35.714px/sec over84sec field. These two provide1320px total route height, camera travel600px. Do not falsely declare whole-stage travel from these two. Cleanup should decelerate near the eventual final vista, boss holds there. At most current+next texture resident where implementation permits; two960×1440 RGBA textures approximately11.06MB before other engine overhead. Preserve pause and resize phase.

## Image source and preparation
Built-in OpenAI raster image generation on2026-10-23, no external reference image supplied. Exact prompt in generation-prompt.txt. Generated original dimensions724×2172 despite1024×3072 request. Actual source is included, not a placeholder. Mechanical Lanczos normalization to960×2880 then lossless WebP crop. This is mild upsampling, not claimed native960px detail. prepare.py reproduces files; manifest holds crops/hashes and overlap verification. No vector/procedural illustration substitution.

Original project-generated artwork may be used, modified and redistributed with authorized project materials; to the extent rights are held, contributed underCC0 1.0. This does not assert exclusive copyright, stock provenance or third-party-rights warranties. Public publication remains separate.

## QA and limitations
Original image inspected at384×1152 overview: open lower sea, asymmetric left shelf and emerging right crystals are visibly different geography; central dark lane remains. Rocks extend farther inward than the requested55% empty corridor in places. Validate actual hostile shots near edges; scenery remains non-colliding. The preview MP4 is a12sec accelerated asset-only viewport crop of the original art, NOT a recording of gameplay and not an actual engine/phone test. Adjacent pixel identity verified. Actual PC integration, low-motion behavior, performance and mobile contrast unverified. Remaining chunks need matching continuation and same checks before acceptance.
