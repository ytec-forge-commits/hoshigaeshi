COMPACT APP SOURCE PACKAGE NOTE: The distributed game is fully runnable from the included runtime MP3 files without rebuilding audio. This compact ZIP includes composition scripts and provenance, but does NOT include the 109 MB source samples or WAV masters. To regenerate audio, restore the exact named CC0 samples from the official sources in provenance.json, then run the scripts in this directory. References below to samples/ or masters/ describe the full optional audio-production pack, not files included here.

STAR REBOUND AUDIO — implementation handoff

Use runtime/star-tide-loop.mp3 as the gameplay loop. It is a complete self-contained 64-second, 120 BPM / 32-bar score, not a fragment with a fade-out. The music moves through introduction, energetic development, a lighter oceanic section, and a brighter final return. Real upright-piano samples remain foregrounded throughout, with stereo reverberation, warm low end and restrained rhythm.

Recommended runtime integration:
- Load/decode once with Web Audio after a user gesture. Do not autoplay.
- Create an AudioBufferSourceNode, loop=true, loopStart=0, loopEnd=64.0. Browser decode duration should be checked; the verified ffmpeg gapless decoder yields precisely 2,822,400 stereo frames at 44,100 Hz. Do not loop via repeated HTMLAudio ended callbacks, which can introduce gaps.
- Store a single music source, not one per restart. Stop/disconnect old sources, use a short GainNode ramp when pausing/restarting, and honor mute and page visibility.
- Start music bus gain around 0.60 and SFX bus around 0.28–0.45. Use a conservative master gain or limiter because simultaneous non-clipped files can sum above full scale. Test the actual game's largest simultaneous burst.
- Limit capture sound to ~10 Hz and enemy-pop to ~8 Hz; coalesce clusters. Avoid triggering one sound per captured bullet. Suggested priority: hit/return/boss above capture/enemy-pop.
- Return burst: one sound per conversion wave. Boss: one warning/arrival accent, not a continuous alarm. Victory: play once when gameplay ends; fade music down.
- Supply a clearly labeled audio toggle and persist its state. Sound must not be the sole carrier of gameplay information.

Runtime files (all stereo MP3):
star-tide-loop.mp3 — 64.000 s background music, 112 kbit/s
capture.mp3 — 0.300 s softly rising acoustic sparkle
return-burst.mp3 — approximately 0.680 s upward piano flourish and whoosh
hit.mp3 — 0.320 s rounded low impact
 enemy-pop.mp3 — 0.200 s compact subdued pop
boss.mp3 — 1.450 s low resonant arrival accent
victory.mp3 — 2.150 s rising acoustic resolution
button.mp3 — 0.140 s small piano confirmation

Source / rebuild:
python compose_star_tide.py
python master_and_verify.py
Requires Python 3, numpy, scipy and ffmpeg with libmp3lame. No network is needed when samples/ is present. The deterministic seed is in the composer. All WAV masters are in masters/ (main master is 24-bit PCM; SFX masters are 16-bit PCM); the 32-bit float premaster is included. Source samples are included for full reproducibility and may be redistributed under the included CC0 and instrument-specific grant, but add roughly 109 MB. For a compact app source ZIP, include runtime/, scripts, CREDITS.txt, licenses/, provenance.json and this README; note that rebuilding then requires restoring the named source samples from their official distribution. Full reproducible source archive should include samples/ too. QA audition WAV and premaster are optional for an app ZIP.

Verification limitations:
All files decode without ffmpeg errors. Signal checks cover duration, peaks, clipping, DC, loudness and loop boundary. No actual human or audio-capable-model audition was available here. Do not claim the music was heard or that subjective musical quality passed a listening test. Browser-specific playback and simultaneous game SFX mixing remain integration QA.

Loop construction:
Notes, pad tails, early reflections and diffuse reverberation wrap circularly into the beginning; no tail is simply cut at 64 seconds. Filtering uses previous-tail history. The final dominant harmony returns into D minor. MP3 decoding was verified for gapless frame count. The decoded boundary step is smaller than the ordinary 99th percentile adjacent-sample step in each channel, not proof of inaudibility. qa/loop-boundary-audition.wav contains 3 seconds before + 3 seconds after the seam for actual audition.

See qa/audio-analysis.json and qa/loudness-*.txt for exact measured values, and SHA256SUMS.txt for all asset/source hashes. There is no delivery/upload/deployment action in these scripts.
