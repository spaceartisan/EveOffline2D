# EVE Offline 2D - Customization Guide

This guide will help you modify and customize various aspects of the game. All values can be tweaked to create your own balanced gameplay experience.

---

## Table of Contents
- [Ships](#ships)
- [Weapons](#weapons)
- [Modules](#modules)
- [Ore & Mining](#ore--mining)
- [Items & Loot](#items--loot)
- [Star Systems](#star-systems)
- [Visual Settings](#visual-settings)
- [Game Mechanics](#game-mechanics)

---

## Ships

**File:** `ships.js`

### Adding a New Ship

Add a new entry to the `SHIP_CLASSES` object:

```javascript
'YourShipName': {
  class: 'Frigate',  // or Destroyer, Cruiser, Battlecruiser, Battleship
  name: 'YourShipName',
  faction: 'Gallente', // or Caldari, Amarr, Minmatar (affects ship color)
  description: 'Description of your ship',
  
  // Movement
  maxSpeed: 3.5,
  sublightSpeed: 3.5,
  warpSpeed: 4,
  accel: 0.12,
  turnRate: 0.05,
  drag: 0.98,
  
  // Defense
  maxShield: 120,
  shieldRegen: 0.6,
  maxArmor: 90,
  maxHull: 70,
  
  // Offense
  dmg: 18,
  fireRate: 18,
  maxRange: 550,
  
  // Resources
  maxCap: 120,
  capRegen: 1.4,
  cargoCap: 120,
  
  // Economy
  price: 50000  // Cost to buy at station
}
```

### Important Changes in Ship System

**⚠️ Mining Yield Removed from Ships**
- Mining yield is now determined by equipped mining lasers only
- Ships no longer have a `miningYield` property
- Use `Miner I` (yield: 1) or `Miner II` (yield: 4) weapons instead

**Ship Factions and Colors**
- Each ship has a `faction` property (Caldari, Amarr, Gallente, Minmatar)
- Ships are automatically colored based on faction:
  - Caldari: Indigo (#6366f1)
  - Amarr: Gold (#f59e0b)
  - Gallente: Green (#10b981)
  - Minmatar: Orange (#f97316)
  - Pirates: Red (#dc2626)

### Modifying Existing Ships

Find the ship in `SHIP_CLASSES` and adjust any values. Common tweaks:
- **More tanky:** Increase `maxShield`, `maxArmor`, `maxHull`, `shieldRegen`
- **Faster:** Increase `maxSpeed`, `accel`, `warpSpeed`, decrease `drag` (keep between 0.95-0.98)
- **Better damage:** Increase `dmg`, decrease `fireRate` (lower = faster firing)
- **More capacitor:** Increase `maxCap`, `capRegen`
- **More cargo:** Increase `cargoCap`

### Removing a Ship

1. Delete the ship entry from `SHIP_CLASSES` in `ships.js`
2. Remove it from any starting inventory if applicable
3. Remove it from station `shipsForSale` arrays in `systems.js`

---

## Station Inventories

**File:** `systems.js`

### Customizing What Stations Sell

Each station has two arrays that control its inventory:

**forSale** - Weapons and modules available:
```javascript
forSale: ['125mm Railgun I', 'Miner I', 'Small Shield Booster I', 'Afterburner I']
```

**shipsForSale** - Ships available:
```javascript
shipsForSale: ['Ibis', 'Velator', 'Atron', 'Rifter']
```

### Example: Creating a Specialized Station

```javascript
{
  name: 'Mining Hub',
  security: 0.8,
  station: { x: 10000, y: 10000, name: 'Mining Station' },
  // Only mining equipment
  forSale: ['Miner I', 'Miner II', 'Expanded Cargohold I', 'Overdrive Injector System I'],
  shipsForSale: ['Ibis', 'Velator', 'Atron'],  // Basic ships only
  // ... other properties
}
```

### Station Inventory Guidelines

- **Ibis corvette** - Should be available at ALL stations (free emergency ship)
- **Major trade hubs** (Jita, 1DQ1-A) - Full selection of items and ships
- **Faction hubs** - Specialize in faction-appropriate items (Amarr = energy weapons/armor)
- **Remote stations** - Limited inventory (1-3 ships, basic modules only)
- **Specialty stations**:
  - Mining colonies: Mining lasers, cargo expanders, industrial ships
  - Military bases: Combat weapons, armor/shield modules, combat ships
  - Trading posts: Mix of items but not full selection

### Item Names Must Match

Use exact names from:
- `WEAPON_MODULES` in `weapons.js`
- `SUBSYSTEM_MODULES` in `modules.js`
- `SHIP_CLASSES` in `ships.js`

---

## Weapons

**File:** `weapons.js`

### Adding a New Weapon

Add to the `WEAPON_MODULES` object:

```javascript
'YourWeaponName': {
  type: 'weapon',
  category: 'turret',  // or 'missile', 'mining'
  size: 'small',       // or 'medium', 'large'
  name: 'Your Weapon Name',
  description: 'A description of your weapon',
  
  // Combat Stats
  damage: 25,
  fireRate: 30,        // Frames between shots (lower = faster)
  maxRange: 800,
  optimalRange: 600,   // Range for best accuracy
  capacitorUse: 5,
  
  // Fitting Requirements
  powergridUsage: 15,
  cpuUsage: 25,
  
  // Economy
  price: 25000
}
```

### Mining Lasers

Mining lasers are weapons with special properties:

```javascript
'Miner III': {
  type: 'weapon',
  category: 'mining',
  size: 'small',
  name: 'Miner III',
  description: 'Advanced mining laser',
  
  damage: 0,
  fireRate: 25,
  maxRange: 500,
  optimalRange: 500,
  capacitorUse: 5,
  
  miningYield: 8,  // Ore units per cycle
  
  powergridUsage: 3,
  cpuUsage: 20,
  price: 50000
}
```

### Weapon Balance Tips
- **DPS calculation:** `DPS = (damage / fireRate) * 60`
- **Small weapons:** 10-20 damage, 15-30 fire rate, 500-700 range
- **Medium weapons:** 20-35 damage, 30-50 fire rate, 700-900 range
- **Large weapons:** 35-60 damage, 50-80 fire rate, 900-1200 range
- **Mining yield:** Miner I = 1, Miner II = 4 (adjust for progression)

---

## Modules

**File:** `modules.js`

### Adding a New Module

Add to the appropriate section (`SHIELD_MODULES`, `ARMOR_MODULES`, etc.):

```javascript
'YourModuleName': {
  name: 'Your Module Name',
  type: 'passive',  // or 'active'
  category: 'shield',  // shield, armor, propulsion, capacitor, damage, utility
  
  // Bonuses (use relevant ones)
  shieldBonus: 200,
  armorBonus: 150,
  shieldRegenBonus: 0.5,  // 50% increase
  damageBonus: 0.2,       // 20% increase
  speedBonus: 0.3,        // 30% increase
  cargoBonus: 100,
  capacitorBonus: 150,
  capacitorRegenBonus: 0.4,
  
  // Fitting
  powergridUsage: 20,
  cpuUsage: 30,
  
  // Economy
  price: 30000,
  
  description: 'Module description'
}
```

### Module Types
- **Passive modules:** Always active, no capacitor cost
- **Active modules:** Require activation (future feature)

---

## Ore & Mining

**File:** `items.js`

### Adding a New Ore Type

Add to the `ORE_TYPES` object:

```javascript
'YourOreName': {
  name: 'Your Ore Name',
  price: 15,        // ISK per unit
  size: 0.1,        // m³ per unit
  rarity: 'rare',   // common, uncommon, rare, very rare
  color: '#00ff00'  // Display color (hex)
}
```

### Modifying Ore Distribution

In `systems.js`, edit the `getRandomOreType()` function:

```javascript
function getRandomOreType(security){
  const roll = Math.random();
  if(security > 0.5){
    // High-sec ore distribution
    if(roll < 0.7) return 'Veldspar';
    if(roll < 0.9) return 'Scordite';
    return 'YourOreName';  // Add your ore here
  }
  // ... adjust other security levels
}
```

### Asteroid Settings

In `main.js`, find the asteroid generation code (~line 310):

```javascript
// Asteroid count per system
const baseAsteroids = 8;      // Base number
const secModifier = ...       // Additional for low/null-sec

// Ore amount per asteroid
const amount = Math.round(rand(100, 800));  // Adjust min/max
```

### Asteroid Respawn Timer

In `main.js`, find the asteroid respawn code (~line 3254):

```javascript
timer: 18000, // 5 minutes * 60 seconds * 60 ticks
// Adjust multiplier to change respawn time
```

Asteroids respawn at their original location with the same ore type and amount.

---

## Items & Loot

**File:** `items.js`

### Adding Metal Scrap Types

Add to `METAL_TYPES`:

```javascript
'YourMetalName': {
  name: 'Your Metal Name',
  price: 50,
  size: 0.5,
  color: '#silver'
}
```

### Modifying Loot Drops

In `main.js`, find NPC death handler (~line 2015):

```javascript
// Ore drops (current: 3-8 units)
const oreCount = Math.floor(rand(3, 8));

// Metal scrap drops (current: 2-5 units)
const metalCount = Math.floor(rand(2, 5));
```

### Wreck Despawn Timer

In `main.js`, find the Wreck class (~line 137):

```javascript
this.despawnTimer = 18000;  // 5 minutes (300 seconds * 60 ticks)
// Change to adjust despawn time
```

---

## Star Systems

**File:** `systems.js`

### Adding a New System

Add to the `SYSTEM_DATA` array in `systems.js`:

```javascript
{
  name: 'Your System Name',
  security: 0.5,              // 0.0 to 1.0
  gates: [0, 1, 2],          // Indices of connected systems
  station: {
    x: 10000,
    y: 10000,
    name: 'Your Station Name'
  },
  mapX: 400,                  // X position on star map
  mapY: 300,                  // Y position on star map
  color: '#3b82f6',          // Hex color for station/gates
  category: 'trading'         // Station type (see below)
}
```

**Station Categories:**
Choose from: `navy`, `academy`, `treasury`, `industrial`, `trading`, `moon`, `outpost`, `military`, `sovereignty`, `citadel`, `mining`, `logistics`, `staging`

Each category has a unique visual design in-game.

**Important:** 
- Update the `gates` arrays of other systems to connect to your new system
- Gate colors automatically match the destination system
- Each system spawns 2-4 nebulas with pulsing animations

### System Security Levels
- **1.0 - 0.5:** High security (safe, low rewards)
- **0.4 - 0.1:** Low security (moderate danger, better rewards)
- **0.0:** Null security (high danger, best rewards)

### NPC Spawn Rates

In `main.js`, find system population code (~line 320):

```javascript
const npcCount = sec >= 0.5 ? Math.floor(Math.random() * 3) + 1 :    // High-sec: 1-3
                 sec >= 0.1 ? Math.floor(Math.random() * 5) + 3 :    // Low-sec: 3-7
                 Math.floor(Math.random() * 8) + 5;                   // Null-sec: 5-12
```

### NPC Respawn Timer

In `main.js`, find the NPC respawn code (~line 3225):

```javascript
timer: 3600, // 60 seconds * 60 ticks (1 minute)
// Adjust to change respawn time
```

NPCs respawn at random locations in the system after being destroyed.

---

## Visual Settings

**File:** `main.js`

### Star Density

Find the background star generation (~line 309):

```javascript
const starCount = 10000;  // Number of stars per system (current: 10000)
```

### Star Appearance

In the same section (~line 311):

```javascript
sys.stars.push({
  x: rand(0, sys.width),
  y: rand(0, sys.height),
  size: Math.random() * 1.5 + 0.5,           // Size range: 0.5 - 2.0
  brightness: Math.random() * 0.6 + 0.4,     // Brightness: 0.4 - 1.0
  twinkle: Math.random() * Math.PI * 2
});
```

### Nebulas

**Nebula Count** (~line 322):
```javascript
const nebulaCount = Math.floor(Math.random() * 3) + 2; // 2-4 nebulas per system
```

**Nebula Colors** (~line 323):

Add or modify colors in the `nebulaColors` array:
```javascript
const nebulaColors = [
  { r: 138, g: 43, b: 226 },  // Blue-violet
  { r: 255, g: 20, b: 147 },  // Deep pink
  { r: 0, g: 191, b: 255 },   // Deep sky blue
  { r: 255, g: 69, b: 0 },    // Red-orange
  { r: 50, g: 205, b: 50 },   // Lime green
  { r: 148, g: 0, b: 211 }    // Dark violet
];
```

**Nebula Properties** (~line 333):
```javascript
sys.nebulas.push({
  x: rand(0, sys.width),
  y: rand(0, sys.height),
  size: rand(800, 2000),                    // Cloud size (800-2000 pixels)
  color: color,                             // RGB color from array
  opacity: Math.random() * 0.15 + 0.05,    // Transparency (0.05-0.2)
  drift: Math.random() * Math.PI * 2       // Animation phase
});
```

**Tips:**
- Larger sizes (1500-3000) create massive nebulas
- Higher opacity (0.2-0.4) makes nebulas more prominent
- More nebulas (5-8) creates denser space clouds
- Add more colors to `nebulaColors` for variety

### UI Panel Sizes

**Ship Status Panel** (~line 2627):
```javascript
const statWidth = 280;           // Panel width
const statY = canvas.height - 120;  // Distance from bottom
```

**Tactical Overview** (~line 2750):
```javascript
const rightX = canvas.width - 250;  // Distance from right
const rightWidth = 240;             // Panel width
```

**Side Panel** (in `index.html`):
```css
#sidePanel {
  width: 300px;          /* Panel width */
  max-height: 90vh;      /* Maximum height */
}
```

---

## Game Mechanics

**File:** `main.js`

### Warp Speed & Cooldowns

Find warp mechanics (~line 1885):

```javascript
player.warpSpeed = 30;        // Warp speed multiplier
player.warpWarmup = 180;      // Warmup time (3 seconds at 60 FPS)
player.warpCooldown = 300;    // Cooldown after warp (5 seconds)
```

### Mining Speed

Mining yield is now determined by equipped mining lasers in `weapons.js`:

```javascript
'Miner I': {
  miningYield: 1,       // 1 ore unit per mining cycle
  fireRate: 30,         // Frames between mining cycles
}
'Miner II': {
  miningYield: 4,       // 4 ore units per mining cycle
  fireRate: 28,
}
```

**Note:** Ships no longer have a `miningYield` property - it's purely weapon-based now.

### Weapon Firing

In weapon definitions (`weapons.js`):

```javascript
fireRate: 18,           // Frames between shots (18 = 0.3 seconds at 60 FPS)
damage: 20,             // Damage per shot
capacitorUse: 5         // Capacitor drained per shot
```

### Auto-Combat & Auto-Mining

Toggle auto-fire and auto-mine using:
- **Space bar** - Toggle auto-fire (attacks selected NPCs automatically)
- **M key** - Toggle auto-mine (mines selected asteroids automatically)

Both systems can be active simultaneously for mixed gameplay.

### Station Prices

**Ore Selling** - In `items.js`:
```javascript
price: 10               // Base price (you get 85% when selling)
```

**Metal Selling** - In `items.js`:
```javascript
price: 35               // Base price (you get 90% when selling)
```

Modify the multipliers in `main.js` (search for `0.85` and `0.90`).

### Starting Resources

In `main.js`, find the Ship class constructor (~line 77):

```javascript
this.credits = 500000000;    // Starting ISK (currently set high for testing)
```

And player initialization (~line 343):

```javascript
const playerHangar = ['Velator'];  // Starting ships
```

---

## Tips for Balanced Gameplay

### Ship Balance Ratios
- **Frigate → Battlecruiser:** 2-3x stats, 30x price
- **Battlecruiser → Battleship:** 1.5x stats, 3x price

**Current Ship Progression:**
- Velator (Frigate, Free starter)
- Atron/Tristan/Rifter (Frigates, 48-55k ISK)
- Ferox (Battlecruiser, 1.5M ISK)
- Apocalypse (Battleship, 4.5M ISK)

### Weapon Balance
- Fitting costs should scale with damage output
- Mining laser yield progression: 1 → 4 → 8+
- Combat weapon DPS should scale with ship class
- Capacitor use should limit sustained fire

### Module Balance
- Passive modules: Higher fitting cost, lower price
- Bonuses should be 20-50% for most modules
- Shield/Armor modules: 100-500 HP per size tier

### Ore Balance
- Rarer ores should be 2-3x price of previous tier
- Size increases with value (0.5-2.5 m³ range)
- Rarity affects spawn frequency
- Current progression: Veldspar (12 ISK) → Kernite (70 ISK)

### Visual Consistency
- Ship colors match factions (avoid pirate red)
- Station colors match system colors
- Gate colors match destination system
- Asteroids have irregular rocky shapes

---

## File Structure Reference

```
EveOffline2D_revert/
├── index.html          # UI structure, CSS styles
├── main.js             # Core game logic, rendering, mechanics
├── ships.js            # Ship definitions
├── weapons.js          # Weapon definitions
├── modules.js          # Module definitions
├── items.js            # Ore and metal scrap definitions
├── systems.js          # Star system configuration
└── README.md           # Basic documentation
```

---

## Testing Your Changes

1. **Save all modified files**
2. **Refresh your browser** (Ctrl+F5 or Cmd+Shift+R)
3. **Check browser console** (F12) for any errors
4. **Test in-game** to verify changes work as expected

### Common Issues

**Item not appearing in station:**
- Check spelling matches exactly
- Verify it's added to correct object (SHIP_CLASSES, WEAPON_MODULES, etc.)
- Ensure price is set

**System gates not working:**
- Verify gate indices are correct (0-based indexing)
- Check that connections are bidirectional
- Ensure mapX/mapY positions are set

**Balance feels off:**
- Start with small adjustments (10-20%)
- Test thoroughly before making more changes
- Use existing items as reference points

---

## Advanced Customization

### Adding New Item Types

1. Create new object in `items.js` (e.g., `BLUEPRINT_TYPES`)
2. Add inventory handling in `main.js`
3. Add UI display in relevant station service
4. Implement crafting/usage mechanics

### Creating New Game Modes

Modify `main.js`:
- Adjust starting resources
- Change NPC behavior
- Add win/loss conditions
- Modify economic multipliers

### Custom Color Schemes

Edit CSS in `index.html`:
- Panel backgrounds: `rgba(15, 23, 42, 0.9)`
- Borders: `#475569`
- Accent colors: `#06b6d4` (cyan)
- Text: `#f1f5f9` (light)

---

**Happy customizing!** If you create something cool, consider sharing your modifications with others.
