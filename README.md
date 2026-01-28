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

**Mining & Economy**
- Mining lasers with weapon-based yield system (Miner I, Miner II)
- Auto-mine mode for automated resource gathering
- Dynamic market prices per system
- Real-time cargo updates during mining
- Multiple ore types with varying rarity and value
- Station trading and storage
- Metal scrap salvaging from destroyed ships

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

**Ship Systems**
- Momentum-based flight physics with inertia
- Shield regeneration
- Capacitor regeneration
- Ship fitting with powergrid/CPU constraints
- Multiple ship classes (Frigates, Battlecruisers, Battleships)
- Real-time cargo space tracking
- Warp drive and jump gate travel

## Controls

**Movement**
- **W/S** - Thrust forward/backward
- **A/D** - Turn left/right
- **Click** - Select targets (NPCs/asteroids/stations/gates)

**Combat & Mining**
- **Space** - Toggle auto-fire on/off
- **M** - Toggle auto-mine on/off

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
3. **Mining:** Select asteroids (A key) and toggle auto-mine (M key) to gather ore
4. **Combat:** Select pirates (red ships) and toggle auto-fire (Space) to engage
5. **Trading:** Dock at stations to sell ore, buy/sell items, and upgrade your ship
6. **Travel:** Use the star map (N key) to view systems, then use jump gates or warp drives
7. **Progression:** Earn ISK to buy better ships (Atron, Tristan, Rifter, Ferox, Apocalypse)
8. **Risk/Reward:** Low-sec and null-sec systems have more pirates but better rewards

**Tips:**
- Use Orbit command to kite enemies while maintaining optimal range
- Manage your capacitor - weapons consume energy
- Watch your cargo space - different ores have different volumes
- Mining yield depends on your equipped mining laser (Miner I = 1, Miner II = 4)
- Auto-mine and auto-fire toggle independently for mixed gameplay

## Technical Details

Pure vanilla JavaScript with Canvas 2D rendering. No frameworks, no dependencies.

**Core Files:**
- [main.js](main.js) - Game engine, rendering, physics (4600+ lines)
- [ships.js](ships.js) - Ship class definitions with faction types
- [weapons.js](weapons.js) - Weapon modules (turrets and mining lasers)
- [modules.js](modules.js) - Ship modules (shields, armor, capacitor)
- [items.js](items.js) - Ore types, metal scraps, market data
- [systems.js](systems.js) - 20 star systems with connections and stations
- [index.html](index.html) - Game container and UI elements
- [style.css](style.css) - UI styling

**For Modders:**
See [CUSTOMIZATION_GUIDE.md](CUSTOMIZATION_GUIDE.md) for detailed instructions on adding ships, weapons, systems, and tweaking game balance.

