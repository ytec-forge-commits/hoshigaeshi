# Generated raster provenance

Generated with the built-in OpenAI image-generation tool on 2026-10-23 for the owner's STAR REBOUND upgrade. Three separate generated PNGs are actually present in masters/. No external reference images were supplied to generation; the existing game background was inspected separately for art-direction continuity. No third-party stock illustration or vector-drawn substitute was used.

The generated images are original project output, not a claim of exclusive copyright or guaranteed third-party clearance. The project owner may include these assets with the authorized game/source distribution; to the extent rights are held, project-created assets are offered under CC0 1.0. Generated-output provenance is disclosed rather than represented as licensed stock. Public publication has not occurred.

Runtime preparation is only Lanczos resize from 1024×1536 to 960×1440 plus WebP compression (quality 90, alpha retained). See prepare.py. No hand-drawn shapes, invented UI, color-mask extraction or procedural illustration was substituted. Master hashes and runtime hashes are in manifest.json. Generation prompts are retained in generation-prompts.txt.

Pixel inspection confirmed: far is opaque; mid and near have real transparency, not a painted checkerboard. Core lane (center 36%) alpha is at most 1/255 in masters. The requested 70–80% empty corridor was not perfectly followed: side artwork reaches farther in. Use low runtime opacity and confirm actual bullet visibility, rather than claiming the whole center is clear. Top/bottom alpha is 0–1/255 in mid and 0/255 in near. Far edges are not seamless.

Visual limitation: individual raster outputs were inspected at 480×720. Browser compositing launch failed in this cloud execution environment (Chromium socket operation not permitted; escalated launcher bwrap setup error). docs/preview.html is a ready-to-open asset-only composition preview for NewLightning. It does not impersonate a real game screenshot. In-game scrolling, game performance and mobile bullet visibility remain unverified.
