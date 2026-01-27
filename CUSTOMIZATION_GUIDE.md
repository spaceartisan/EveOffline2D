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
  shipName: 'YourShipName',
  class: 'Frigate',  // or Destroyer, Cruiser, Battlecruiser, Battleship
  shipDescription: 'Description of your ship',
  
  // Defense
  maxShield: 500,
  maxArmor: 300,
  maxHull: 200,
  shieldRegen: 2.0,
  
  // Movement
  maxSpeed: 200,
  sublightSpeed: 200,
  accel: 0.5,
  turnRate: 0.04,
  drag: 0.95,
  
  // Combat
  dmg: 15,
  fireRate: 90,
  fireCooldown: 0,
  maxRange: 600,
  
  // Mining
  miningYield: 10,
  miningCooldown: 0,
  
  // Resources
  cap: 500,
  maxCap: 500,
  capRegen: 2.0,
  cargoCap: 200,
  
  // Economy
  price: 50000  // Cost to buy at station
}
```

### Modifying Existing Ships

Find the ship in `SHIP_CLASSES` and adjust any values. Common tweaks:
- **More tanky:** Increase `maxShield`, `maxArmor`, `maxHull`, `shieldRegen`
- **Faster:** Increase `maxSpeed`, `accel`, decrease `drag` (keep between 0.9-0.98)
- **Better damage:** Increase `dmg`, decrease `fireRate` (lower = faster firing)
- **Better mining:** Increase `miningYield`, decrease `miningCooldown`

### Removing a Ship

1. Delete the ship entry from `SHIP_CLASSES` in `ships.js`
2. Remove it from `playerHangar` array in `main.js` if it's a starting ship

---

## Weapons

**File:** `weapons.js`

### Adding a New Weapon

Add to the `WEAPON_MODULES` object:

```javascript
'YourWeaponName': {
  name: 'Your Weapon Name',
  type: 'turret',  // or 'missile', 'laser'
  size: 'small',   // or 'medium', 'large'
  
  // Stats
  damage: 25,
  maxRange: 800,
  fireRate: 120,  // Ticks between shots (60 = 1 second)
  
  // Fitting
  powergridUsage: 15,
  cpuUsage: 25,
  
  // Economy
  price: 25000,
  
  // Description
  description: 'A description of your weapon'
}
```

### Weapon Balance Tips
- **DPS calculation:** `DPS = (damage / fireRate) * 60`
- **Small weapons:** 10-20 damage, 60-90 fire rate, 500-700 range
- **Medium weapons:** 20-35 damage, 90-120 fire rate, 700-900 range
- **Large weapons:** 35-60 damage, 120-180 fire rate, 900-1200 range

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

Add to the `SYSTEM_DATA` array:

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
  mapY: 300                   // Y position on star map
}
```

**Important:** Update the `gates` arrays of other systems to connect to your new system.

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

In ship definitions (`ships.js`):

```javascript
miningYield: 10,        // Units per mining cycle
miningCooldown: 0       // Cooldown between mining cycles
```

### Weapon Firing

In weapon definitions (`weapons.js`):

```javascript
fireRate: 90,           // Ticks between shots (90 = 1.5 seconds)
damage: 20              // Damage per shot
```

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

In `main.js`, find the Ship class constructor (~line 71):

```javascript
this.credits = 50000;        // Starting ISK
```

And player initialization (~line 343):

```javascript
const playerHangar = ['Velator'];  // Starting ships
```

---

## Tips for Balanced Gameplay

### Ship Balance Ratios
- **Frigate → Destroyer:** 1.5x stats, 3x price
- **Destroyer → Cruiser:** 2x stats, 3x price
- **Cruiser → Battlecruiser:** 1.5x stats, 2x price
- **Battlecruiser → Battleship:** 1.5x stats, 2x price

### Weapon Balance
- Fitting costs should scale with damage
- Range should decrease as damage increases (for balance)
- Price should be ~1000 ISK per DPS

### Module Balance
- Passive modules: Higher fitting cost, lower price
- Bonuses should be 20-50% for most modules
- Shield/Armor modules: 100-500 HP per size tier

### Ore Balance
- Rarer ores should be 2-3x price of previous tier
- Spawn rates should be inverse to price
- Size should increase slightly with value

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
