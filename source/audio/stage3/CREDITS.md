# Stage 3 music candidates

These two recordings are included only in the private development copy pending a full playtest decision. They are by **MintoDog**, not by the game's developer. The OpenGameArt author pages identify both as CC0 and loopable:

| Use | Title and author page | Official OGG | Official MP3 | Decoded length | In-game candidate gain |
| --- | --- | --- | --- | --- | --- |
| Field | [Space Battle](https://opengameart.org/content/space-battle) by MintoDog | `candidate-space-battle/space_battle_bpm130_0.ogg` | `candidate-space-battle/space_battle_bpm130.mp3` | 3,907,939 frames / 44,100 Hz = 88.6153968254 s | 0.265 |
| Boss | [Space Boss Battle](https://opengameart.org/content/space-boss-battle) by MintoDog | `candidate-space-boss-battle/space_boss_battle_bpm175_0.ogg` | `candidate-space-boss-battle/space_boss_battle_bpm175.mp3` | 4,596,480 frames / 44,100 Hz = 104.2285714286 s | 0.263 |

The original downloads are preserved byte for byte. OGG is tried first; MP3 is used if OGG fetch or decode fails. The decoded duration, resampled to the browser AudioContext's sample rate, sets the final loop point. MP3 container padding is not used as a loop endpoint.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `space_battle_bpm130_0.ogg` | 2,898,663 | `22de767fe7b621eec9cd081d12f4fce4d5effda528bfee90e404dcc2916d485b` |
| `space_battle_bpm130.mp3` | 3,547,547 | `de0db250712a4050af4d4711d5d7ea2a0b100ad51b4d31d740f605cf6c78a974` |
| `space_boss_battle_bpm175_0.ogg` | 3,426,555 | `4fc0898456099db3d9e63bd97450fedc3f9ff0a05cd65a8d363b3f2904415e60` |
| `space_boss_battle_bpm175.mp3` | 4,171,356 | `7e9e1a819fe1b4d640a8168bd4b8d5d9ebdc968965a1469c9676276e2742e903` |

The fixed Stage 1 and Stage 2 preview copies retain their audio. These are candidate assignments for Stage 3 only. An external browser playtest and actual listening are still needed before acceptance.
