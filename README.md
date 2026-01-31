# EVE Offline 2D

A vanilla JavaScript homage to EVE Online featuring true EVE-like mechanics:

## Features

**Combat System**
- Shield/Armor/Hull damage layers with proper damage propagation
- Target selection and lock with visual indicators
- Orbit and approach commands with autopilot
- Capacitor management for weapons
- Auto-fire mode for continuous combat
- Multiple weapon types (turrets, missiles, mining lasers)
- Faction-based ship colors (Caldari, Amarr, Gallente, Minmatar)

**Anomaly Exploration**
- **Core Probe Launcher** - Scan and discover cosmic signatures
- **9 anomaly types** - Combat (3), Mining (3), Data/Relic sites (3)
- **Instanced pockets** - Isolated combat/mining zones at unique coordinates
- **Anomaly scanner** - Dedicated window (P key or 🔍 button) to manage discoveries
- **No warp restrictions** - Warp to anomalies from any distance
- **Pocket boundaries** - 5000m radius circular zones with visual indicators
- **Exit to station** - Quick warp button to leave anomaly space
- **Respawn system** - Completed anomalies regenerate after 30-60 minutes
- **Rewards** - ISK bounties, ore, salvage, and special loot based on difficulty
- **Spatial isolation** - Entities in anomalies don't appear in normal space tactical overview

**Mining & Economy**
- Mining lasers with weapon-based yield system (Miner I, Miner II)
- Auto-mine mode for automated resource gathering
- Dynamic market prices per system
- Real-time cargo updates during mining
- Multiple ore types with varying rarity and value
- Station trading and storage
- Metal scrap salvaging from destroyed ships
- **Customizable station inventories** - Each station sells different items and ships
- **Resource respawn** - Asteroids respawn after 5 minutes, pirates after 1 minute

**Multiple Systems (20 Total)**
- High-sec (1.0-0.5) - Safe zones with low rewards
- Low-sec (0.4-0.1) - Moderate danger with better rewards
- Null-sec (0.0) - Lawless space with best rewards
- Jump gates with animated rings and energy effects
- Stargates color-coded by destination system
- Unique stations with category-based designs (13 types)

**Visual Features**
- 10,000 animated stars per system with parallax effect
- 2-4 nebulas per system with pulsing animations
- Irregular asteroid shapes with surface detail
- Enhanced stargate effects with rotating rings and particles
- Faction-colored ships and pirates
- Toggle-able grid overlay
- Fullscreen support

**Audio System**
- **Thrust sounds** - Engine rumble when accelerating (W/S keys)
- **Weapon fire** - Laser blast effects for combat
- **Explosions** - Impact sounds when ships are destroyed
- **Mining lasers** - Beam sound effects during ore extraction
- **Gate jumps** - 10-second power-up sequence followed by jump whoosh
- **Warp drive** - Rising pitch on warp activation, falling pitch on arrival
- Procedurally generated placeholder sounds (replace with real audio files in sfx/ folder)

**Ship Systems**
- Momentum-based flight physics with inertia
- Shield regeneration
- Capacitor regeneration
- Ship fitting with powergrid/CPU constraints
- Multiple ship classes (Corvettes, Frigates, Battlecruisers, Battleships)
- Real-time cargo space tracking
- Warp drive and jump gate travel
- Ship repair service at stations (100 ISK per damage point)

## Controls

**Movement**
- **W/S** - Thrust forward/backward
- **A/D** - Turn left/right
- **Click** - Select targets (NPCs/asteroids/stations/gates)

**Combat & Mining**
- **Space** - Toggle auto-fire on/off
- **M** - Toggle auto-mine on/off

**Exploration**
- **P** - Toggle anomaly scanner window
- **🔍 Button** - Open anomaly scanner
- **Scan button** - Discover anomalies (requires Core Probe Launcher)
- **Warp to Anomaly** - Enter instanced pocket space
- **Exit to Station** - Quick warp back to station from anomaly

**Navigation**
- **N** - Toggle star map overlay
- **Orbit/Approach buttons** - Automated piloting
- **Warp/Jump buttons** - FTL travel

**Interface**
- **Grid Toggle** - Show/hide coordinate grid
- **Fullscreen** - Toggle fullscreen mode
- **Side Panel Toggle** - Collapse/expand UI panel

## How to Play

1. Open [index.html](index.html) in a browser
2. Start with the Velator (starter frigate) in your chosen system
3. **Mining:** Click to select asteroids and toggle auto-mine (M key) to gather ore
4. **Combat:** Click to select pirates (red ships) and toggle auto-fire (Space) to engage
5. **Exploration:** Buy a Core Probe Launcher (25k ISK), press P to open scanner, scan for anomalies
6. **Trading:** Dock at stations to sell ore, buy/sell items, and upgrade your ship
7. **Travel:** Use the star map (N key) to view systems, then use jump gates or warp drives
8. **Progression:** Earn ISK to buy better ships (Ibis corvette free everywhere, then Atron, Tristan, Rifter, Ferox, Apocalypse)
9. **Risk/Reward:** Low-sec and null-sec systems have more pirates but better rewards

**Tips:**
- Use Orbit command to kite enemies while maintaining optimal range
- Manage your capacitor - weapons consume energy
- Watch your cargo space - different ores have different volumes
- Mining yield depends on your equipped mining laser (Miner I = 1, Miner II = 4)
- Auto-mine and auto-fire toggle independently for mixed gameplay
- Each station has unique inventory - major hubs like Jita have full selection
- Free Ibis corvette available at all stations as emergency backup ship
- Resources respawn: asteroids in 5 minutes, pirates in 1 minute
- **Exploration:** Fit a Core Probe Launcher to discover anomalies - combat sites have bounties, mining sites have rich ore
- **Anomaly isolation:** Entities inside anomalies are in separate pocket space - you can't warp to them from outside
- **Warp buttons disabled:** Grayed out warp buttons mean you're on cooldown, too close, or target is in different space

## Technical Details

Pure vanilla JavaScript with Canvas 2D rendering. No frameworks, no dependencies.

**Core Files:**
- [main.js](main.js) - Game engine, rendering, physics (6000+ lines)
- [ships.js](ships.js) - Ship class definitions with faction types
- [weapons.js](weapons.js) - Weapon modules (turrets and mining lasers)
- [modules.js](modules.js) - Ship modules (shields, armor, capacitor, probe launcher)
- [items.js](items.js) - Ore types, metal scraps, market data
- [systems.js](systems.js) - 20 star systems with connections and stations
- [anomalies.js](anomalies.js) - Cosmic signatures, rewards, and difficulty settings
- [index.html](index.html) - Game container and UI elements (CSS inline)

**For Modders:**
See [CUSTOMIZATION_GUIDE.md](CUSTOMIZATION_GUIDE.md) for detailed instructions on adding ships, weapons, systems, and tweaking game balance.

