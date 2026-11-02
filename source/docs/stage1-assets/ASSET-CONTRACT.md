# Stage 1 candidate asset contract — 2026-10-23

Private development handoff, not a release or proof of in-game approval. Existing v1 is unchanged.

## Images
- Three original generated raster layers: stage1-far / stage1-mid / stage1-near.
- Master PNGs are 1024×1536, runtime WebP files 960×1440. Logical display size 480×720. Center origin (0.5,0.5). No gameplay/collision meaning.
- Far is opaque: keep stable or use overscan and bounded slow drift. It is NOT verified seamless, so do not hard-loop it. Forward motion comes from independently scrolling mid/near.
- Mid and near have true alpha and essentially transparent top/bottom rows (0–1/255). Repeat vertically; starting speeds +28/+74 logical px/sec. Both are decorative, non-colliding layers below enemies/bullets.
- Start with mid opacity .30, near .42. Do not increase brightness to manufacture speed. Their center 36% has at most 1/255 alpha; side forms extend beyond intended outer 15%, so the readable lane is narrower than initial concept. Actual bullet contrast and side-hit readability require in-engine playtesting, including maximum hostile density.
- Reduced motion: lower scroll speed substantially or make layers static; no rapid flash. Pausing freezes scroll. Resize maintains scale and phase rather than resetting to a visibly different scene.
- These are background-only assets. No new particle, bullet, enemy, player or UI images are supplied. Preserve existing actor colors/anchors.

## Integration
NewLightning is the single game writer. This pack contains only candidate assets and source/QA metadata, not app.js/core.js or Site changes. Runtime assets are separate from masters and provenance; ship runtime plus required licenses, not all WAV/sample/PNG masters in the browser download. Original source distribution can include actual masters/source as needed.

## Acceptance
Inspect at 480×720 and narrow mobile viewport, dark/bright displays, active boss patterns, reduced motion, pause/resume, and repeated scroll boundaries. Asset-only pixel QA does not establish game performance or gameplay readability. Do not count this upgrade as a daily new work. Public Forge deployment remains a separate step.
