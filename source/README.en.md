# STAR REBOUND — v9 feedback25

The opening and main effects use user-selected free audio. Chain cues play only at 4, 8, 16 and 24 CHAIN with four distinct timbres. Sources, licenses and edits are in [audio/selected/CREDITS.md](audio/selected/CREDITS.md).

[日本語](README.md)

Turn incoming fire into guiding light. Guide a little starship through three star seas, defeat their guardians, and restore the way home.

Open `index.html` through a static HTTP server. Images, music, fonts and scripts are bundled and use relative paths. No build, package installation or account is required. For local play, run `python -m http.server 8877 --bind 127.0.0.1` in this directory and open `http://127.0.0.1:8877/`.

## Before you begin

The startup screen lets you choose Japanese or English, controls, windowed or fullscreen display, and whether to start with sound. For new saves, PCs start with **Mouse**; touch-first phones and tablets start with **Touch**. Existing choices are retained. Unsupported fullscreen is disabled; if a fullscreen request fails, you can keep playing in the window.

After the Forge logo and opening, choose a difficulty or try the 55-second practice mode. The title screen's **Watch opening** button replays the opening at any time and returns to the title when finished or skipped. **Settings** lets you change language, controls, music and sound-effect volume, mute, reduced effects, and the side of the touch Rebound button. The default button position is left; saved right-side preferences are retained.

## Controls

| Method | Move | Rebound | Pause / resume |
|---|---|---|---|
| Keyboard | Arrow keys / WASD | Space | P / Esc |
| Locked mouse | Relative mouse movement | Left click | P / Esc; click Resume to reacquire the mouse |
| Standard gamepad | Left stick / D-pad | A / cross | Start / Menu |
| Touch | Drag your finger on the playfield | Double-tap nearby, or press Rebound | On-screen Pause / Resume |

Aiming and normal shots are automatic. Only the small white dot at your ship's center can be hit; its glowing wings cannot. Movement speed is the same across controls, including diagonal movement. Small gamepad stick movements allow finer control. The head, wings and tail follow movement as a visual effect; this does not change the hitbox.

Touch double-taps allow small finger movements and a forgiving interval; drags and long presses do not count. Both touch controls remain available. If a disconnected gamepad is selected, choose Touch in Settings before playing on your phone.

Locked mouse uses the browser's Pointer Lock. The game pauses before ownership is obtained, when it fails, when it is released, or when you leave the page. Retry deliberately or choose another control method. It does not automatically relock immediately after Esc. Clicking a restart confirmation starts a new run with mouse lock; starting or resuming by touch uses drag movement without locking. Stage transitions retain mouse lock and can be skipped with left click.

For gamepads, connect a controller, focus the page and press a pad button once so the browser recognizes it. Menus use up/down to select, left/right to change values, A/cross to confirm, and B/circle to close dialogs. The selected menu control has a gold outline and pointer. Disconnecting pauses the game. Reconnect, release buttons and sticks, then resume. The game retains the first supported controller instead of silently switching to another. Physical controller and phone testing remains outstanding.

Leaving the page pauses play. Dialogs can be closed by clicking or tapping the dim area outside them; a confirmation closes as Cancel. Closing settings does not automatically resume a paused game.

## Capture, survive and score

The capture ring lasts about 0.8 seconds. Bullets entering it become stars and return automatically about 0.3 seconds later. After a successful capture, recharge takes about 3.5 seconds; an empty capture recharges in about one second. Beams cannot be captured: move away from their warning lines. Splitting, accelerating and short-lived homing bullets can be captured.

| Difficulty | Starting / maximum life | Capture healing |
|---|---:|---|
| Easy | 5 | One life per 8 captured bullets, up to 2 per capture |
| Normal | 4 | One life per 12 captured bullets, up to 2 per capture |
| Hard | 3 | One life per 16 captured bullets, up to 2 per capture |
| Nightmare | 2 | At least 24 captured bullets restores 1 life, at most 1 per capture |

Nightmare's capture window is about 0.6 seconds and successful recharge takes about four seconds. Clearing a stage restores one life, up to the maximum.

Defeat another enemy within four seconds to continue the chain. Normal shots and rebounds both count. At 5 / 10 / 15 / 20 consecutive defeats, defeat points become ×2 / ×3 / ×4 / ×5. Taking damage or letting the chain expire resets it. Each captured and returned bullet earns 12 points. Defeating a boss also earns your remaining life before healing ×500 points. The pause screen explains these rules; results and ranking details show the score breakdown.

## Items

Glowing enemies carrying an icon drop an item at the exact point where they are defeated. Enemy bullets are drawn above items and their labels so they remain visible. Escaped carriers do not drop an item. Each stage offers up to five items, with timing and order varying.

- **Tri-Star:** fire in three directions.
- **Pierce Star:** normal shots pass through up to two enemies.
- **Twin Star:** periodic left and right lasers; also strengthens the next rebound that captures at least eight bullets, once.
- **Time Star:** extends capture duration by 0.25 seconds.
- **Guard Star:** prevents one hit, then disappears.

Effects last 20 seconds. A new weapon replaces the previous weapon. Time Star and Guard Star can coexist with a weapon and with each other. Using Twin Star's one-time rebound boost leaves its lasers active for the remaining duration. Taking damage does not remove powerups.

In feedback21, every boss has twice the HP of feedback20, boss time limits are 1.5 times as long, and base rebound damage changes from 3.4 to 3 per returned shot. Score formulas and saved records are retained, but scoring conditions across versions are not identical.

## Story, ending and accessibility

The opening, stage transitions, boss defeat scenes, ending, credits and farewell are available in both languages. Bosses fade out over about 2.4 seconds before the next scene. After 0.35 seconds, use Enter, locked-mouse left click, the dedicated skip button, or gamepad B/circle to skip a defeat scene. Repeated Space/A capture input does not skip it.

After the final boss, stars form a golden road and the ship returns home. The credits scroll over a quiet starfield. **Pause to read** enables manual scrolling; resume continues from that point. The final farewell stays centered until you choose **View results**. Reduced effects uses still visuals and manual credit scrolling, and does not alter bullet speed or collisions. Leaving the page or opening settings holds the relevant animation and audio.

The closing message is: **May the stars light your way.**

## Records, ranking and sharing

Settings and best full-run scores per difficulty are stored in this browser. Practice is not recorded. Runs cannot be resumed after reload. Clearing browser data removes local records. Existing save keys and data remain compatible.

Online ranking is optional and requires the same-origin PHP/SQLite service. Normal runs contact it when starting; failed connection still allows local play. Names and results are sent only when you press the submission button. Do not enter personal information. [Read the full data disclosure](ONLINE.en.md) before submitting.

Rankings show the top ten per difficulty with time, returned bullets, and expandable run details. Missing historical details are shown as unrecorded. Each browser retains one best entry per difficulty. Clearing local records does not delete online entries.

Save a result as a PNG, or open a prefilled post with **Post to X**. Opening that page does not publish the post; publication remains your choice on X. Local development URLs are not included.

## Hosting, credits and limitations

Serve only this `source/` directory. Keep server code, databases, keys, backups and personal data outside the public web root. Static hosting supports local play; no analytics or CDN is required. See [licenses and credits](LICENSES.en.md) and [changes](CHANGES.md).

Original game code is Apache-2.0. Artwork, audio, fonts, dependencies and branding have separate terms. Preserve their notices. The Forge tagline is **Turning ideas into working creations.**

This is an unlisted test build. Automated simulation and browser checks do not replace real phone/controller/speaker checks or a human playthrough of every difficulty. Score validation checks consistency; it is not a server-verified replay.

On the result screen, **Share result** opens the device share menu with your score and, when supported and ready, a result image. Text-only sharing and clipboard copying are fallbacks. If clipboard access is unavailable, select the displayed caption manually. **Save result image** and **Post to X** remain available. Shared content does not include your name or the full local save.


## Practice and presentation (feedback23)

The safe 55-second practice introduces front fans, crossfire, aimed shots, accelerating shots, splitting shots, homing shots and lasers. Each pattern is announced before firing. Spread, Twin, Pierce, Extend and Guard items then appear in sequence: move toward them to collect and try the same powers used in the main game. Practice does not reduce life or affect records and rankings. Lasers cannot be captured; move away from the warning line.

Player and enemy wings, appendages and laser light now move. Reduced effects stops articulated deformation and flowing light. Quiet music accompanies the opening; boss defeat and menu actions have dedicated sounds. BGM, SFX and mute remain adjustable in Settings.

## Audio and result controls (feedback24)

- A soft keyboard melody accompanies the opening, with lower-pitched button sounds.
- Each defeat CHAIN rises one note through three full octaves, from C4 to C7 (22 steps). From CHAIN 23 onward, a star-sparkle sound plays. A broken chain restarts at C4.
- A flowing-star cue accompanies the passage to the next stage.
- The ranking entry stays visible on the result screen and opens a separate dialog for the nickname and public-data notice.
- Share result, Save image and Post on X have equal-sized purple buttons that stay visible beside the result details.
- Gameplay guidance refers to enemy bullets without assuming a particular color.


Shared captions include the planned introduction page at `https://ytec.cloudfree.jp/forge/en/projects/hoshigaeshi/` in English, or `/forge/projects/hoshigaeshi/` in Japanese. These pages are planned for public launch. Captions never include the current local or unlisted test URL.
