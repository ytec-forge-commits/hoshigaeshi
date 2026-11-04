# Generated projectile art / 生成弾素材

2026-11-04 · Built-in OpenAI image generation tool (model identifier not exposed). Five original transparent raster sprites for STAR REBOUND; no third-party stock or input images were supplied. Master PNGs are kept in the project's private development/feedback23-art directory. The shipped PNGs are 128 × 128 RGBA downscales made with Sharp; original alpha is retained. Existing sprites are kept separately and unchanged.

These game materials follow the existing generated-raster terms in ../../LICENSES.md, within the rights the provider can grant. Code licensing and brand identifiers are separate. This does not claim exclusive copyright or a guarantee against all third-party rights.

In-game use: petal = regular purple/split/homing enemy fire; thorn = pink regular/accelerating enemy fire; gold = reflected fire from the third boss. player = cyan normal/spread/piercing player fire; return = golden captured stars returned by the player. Tint-fill is not used on the new sprites. Projectile collision geometry is unchanged; normal/spread damage tuning is recorded separately in CHANGES.md. The thin crystal is widened when displayed so its solid body remains legible around the existing collision radius.

## Final prompts

### Petal

Use case: stylized-concept. Asset type: production transparent sprite for a hand-painted cosmic fantasy bullet-hell game, STAR REBOUND. Create ONE centered purple luminous crystal enemy projectile. A symmetrical short plump pointed petal, vertically upright, point at top and bottom, broader middle, height about 1.65 times width. Solid readable lilac-violet outer silhouette, subtly darker plum perimeter, dimensional amethyst facets, bright small ivory core surrounded by rich violet, restrained pearlescent pink edge highlights. Polished painted raster illustration with depth and delicate mineral structure, no flat vector look. Strong clean readable shape at 20px in gameplay, no tiny ornaments. Object fills about 85 percent of canvas height. True transparent background, all corners fully transparent, compact faint glow only next to edges, no long trail, no scattered particles, no detached stars, no shadow on a ground, no scene, no UI, no text, no logo. Square canvas.

### Thorn

Use case: stylized-concept. Asset type: production transparent sprite for a hand-painted cosmic fantasy bullet-hell game, STAR REBOUND. Create ONE centered rose-magenta luminous crystal needle enemy projectile. Symmetrical narrow pointed marquise crystal, upright tip pointing UP and another point at bottom, height about 2.3 times width. Solid readable rose-pink outer silhouette with a dark burgundy perimeter, dimensional ruby and pink facets, bright small ivory central core, restrained glossy pale pink highlights. Polished painted raster illustration with crystalline depth, not a flat vector. Clear dangerous slender silhouette readable at 20px in gameplay. Object fills about 85 percent of canvas height. True transparent background, all corners fully transparent, very restrained glow directly at edges only. No trail, no detached particles, no satellite stars, no ground shadow, no background scene, no UI, no text, no logo. Square canvas.

### Gold

Use case: stylized-concept. One transparent raster game sprite: an upright symmetrical GOLDEN crystal spear projectile for a cosmic fantasy shooting game. Compact wide pointed marquise with faceted amber edges, rich golden body, small ivory luminous central core, painted dimensional mineral facets. Height roughly 1.6 times width, not a thin needle. One point up, one point down, clear broad middle. The complete object fills 90 percent of the square canvas height. Crisp strong silhouette readable at 25px. True transparent background. Minimal glow immediately around outline. No star shape, no trailing light, no scattered sparkles, no text, no logo, no ground shadow, no scene. Amber/gold only. Polished painted raster artwork, not vector.

## Design reference

Y-TEC Design Atlas v1.0.0: watercolor and aurora-gradient sample PNGs and result-progression diagram (workspace-1.2.0) were viewed. The watercolor sample's soft edges were considered for the painted world, but its pale contrast was not adopted for hazards. Aurora's purple colour family supports the existing setting; broad blurred surfaces are confined to backgrounds. Projectile silhouettes use sharp mineral edges. Result sharing is grouped below score information, above separate retry/home actions.


### Player

Use case: stylized-concept. Asset type: one production transparent sprite for hand-painted cosmic fantasy shooting game STAR REBOUND. Create a single vertically upright cyan-white luminous crystal projectile for the PLAYER. A slender elegant pointed teardrop / marquise shard with a long sharp tip pointing UP. Approximate object aspect ratio height 2.5 times width. A bright ivory core, rich turquoise-blue faceted edges, very delicate soft aqua aura immediately adjacent to the object. Polished hand-painted gemstone depth and crystalline facets, not a vector symbol. Strong clean silhouette readable at 20px on navy starfield. Perfectly centered, object occupies 85% of canvas height, true transparent background, fully transparent corners. No detached particles, no satellites, no text, no logo, no ground, no scene. Square canvas.

### Returned star

Use case: stylized-concept. Asset type: single transparent game sprite, player returned star projectile for hand-painted cosmic fantasy shooter STAR REBOUND. Create one compact four-point golden star crystal, longer vertical points than horizontal points, 1.25 times as high as wide. Dimensional translucent amber gemstone facets, small bright ivory core, warm saturated golden edges with restrained pale yellow highlights. Polished hand-painted raster gemstone, clean pointed symmetrical silhouette legible at 25px, not a flat icon. Object centered, complete crystal occupies 82% of square canvas height. True transparency with all corners clear. Only compact adjacent aura. No circles, no detached sparkles, no trail, no text, no logo, no ground shadow, no backdrop.
