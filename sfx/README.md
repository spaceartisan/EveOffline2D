# Sound Effects

This folder contains game sound effects. Currently using procedurally-generated placeholder sounds via Web Audio API.

## Planned Sound Files

Replace these with actual audio files (mp3, ogg, or wav format):

- `thrust.mp3` - Ship engine thrust sound (looping)
- `weapon_fire.mp3` - Weapon firing sound
- `explosion.mp3` - Ship/NPC destruction sound
- `mining_laser.mp3` - Mining laser sound (looping)
- `gate_warmup.mp3` - Stargate charging sound (10 second buildup)
- `gate_jump.mp3` - Stargate jump sound
- `warp_enter.mp3` - Warp drive activation
- `warp_exit.mp3` - Warp drive deactivation

## Current Implementation

The game uses Web Audio API to generate placeholder sounds:
- **Thrust:** Low rumble (80 Hz) with modulation
- **Weapon Fire:** Sharp laser blast (200-1000 Hz sweep)
- **Explosion:** Noise burst with low-frequency boom
- **Mining Laser:** Mid-range beam (300 Hz)
- **Gate Warmup:** Building power-up (60-180 Hz) over 10 seconds with volume increase
- **Gate Jump:** Whoosh (150-50 Hz) + energy surge (400-1200-200 Hz)
- **Warp Enter:** Rising pitch sweep (100-2000 Hz) over 1.5 seconds
- **Warp Exit:** Falling pitch sweep (2000-100 Hz) over 0.8 seconds

## To Use Real Sounds

1. Add your sound files to this folder
2. Update the sound system in `main.js` to load audio files instead of generating sounds
3. Adjust volume levels as needed
