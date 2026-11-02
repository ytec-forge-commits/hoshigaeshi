# Continuous journey extension: chunks03–06

2026-10-23, private asset candidate. No game/Site/old assets were changed. No audio is included: music adoption is paused pending production-method review.

## Route contract
Requires existing v3 route01/02. Add03–06 at successive offsets of -600 logical pixels each (each texture960×1440 displayed480×720; overlap240texture/120logical). Scenery moves downward as player progresses upward. Full6chunk route height3720 logical, camera travel3000 over84sec average35.714px/sec. Cleanup decelerates at final open vista; boss holds there. Do not wrap map. At most current+next texture resident where feasible. Pausing and reduced-motion handling belong to PC writer.

03/04 come from one continuous generated original.05/06 come from another. Shared adjacent crop rows are exactly equal within each pair, verified after lossless decode. Different generation pairs02→03 and04→05 are visually related but NOT pixel-identical. These two boundaries are not accepted as seamless: use a spatial/local overlap of120logicalpx, not a full-screen scene crossfade. The exact old upper240pixel reference bands are supplied as join-after-02-reference.webp and join-after-04-reference.webp. A runtime mask can keep the old band at one edge and blend into the next strip within that local band, preserving world coordinates. This is a technical raster joining operation, not new illustration or gameplay geometry. Verify each boundary while moving across it; do not report seamlessness from the inner-pair check alone.

A continuous-camera preview in the actual game is required before acceptance. Do not let a static background hold across the entire field, jump between full frames, or count the supplied illustrative map as a gameplay recording.

## Art and provenance
Two new built-in OpenAI raster generations, using the immediately preceding original as continuity reference. Date2026-10-23. Actual source dimensions724×2172 each; requested tall1:3 style. Masters are present. prepare.py only normalizes to960×2880 and crops into overlapping strips, plus copies exact prior edge reference bands. No vector/procedural illustration substitute. Some texture size is upsampled, not claimed native960px detail.

The journey changes from crystalline pillars to fractured cliffs and island debris, then opens into a sparse nebular vista. The center remains dark; marginal rocks and small fragments can still coincide with hostile shots and require actual gameplay contrast review. Scenery has no collision.

Original generated project output may be incorporated, modified and redistributed with the authorized game. To the extent rights are held, provided underCC0 1.0; no exclusive copyright or stock-license provenance is claimed. No third-party reference art was used. Existing generated game sources provided the references. Public release remains separate.

## QA
Individual full sources inspected at320×960 overview. Exact240px overlap03/04 and05/06 verified. Archive CRC and file hashes verified. New generated-pair joins, actual engine scroll, phone contrast, texture load/dispose and performance remain unverified. No subjective audio claims apply to this pack.
