// items.js - Item definitions for EVE Offline 2D

// Ore types with different values and sizes
const ORE_TYPES = {
  'Veldspar': { price: 12, size: 1.0, color: '#94a3b8', rarity: 0.4 },
  'Scordite': { price: 18, size: 1.2, color: '#fbbf24', rarity: 0.3 },
  'Pyroxeres': { price: 25, size: 1.5, color: '#f97316', rarity: 0.15 },
  'Plagioclase': { price: 32, size: 1.8, color: '#84cc16', rarity: 0.1 },
  'Omber': { price: 45, size: 2.0, color: '#3b82f6', rarity: 0.04 },
  'Kernite': { price: 70, size: 2.5, color: '#8b5cf6', rarity: 0.01 }
};

// Metal scrap types - dropped from destroyed ships
const METAL_TYPES = {
  'Tritanium Scrap': { 
    price: 35, 
    size: 0.5, 
    color: '#94a3b8', 
    description: 'Basic metal scrap from ship hulls',
    shipClass: ['frigate', 'destroyer']
  },
  'Pyerite Scrap': { 
    price: 55, 
    size: 0.6, 
    color: '#f59e0b', 
    description: 'Refined metal salvage from ship armor',
    shipClass: ['cruiser', 'battlecruiser']
  },
  'Mexallon Scrap': { 
    price: 85, 
    size: 0.7, 
    color: '#06b6d4', 
    description: 'High-grade structural components',
    shipClass: ['battleship', 'capital']
  },
  'Isogen Scrap': { 
    price: 120, 
    size: 0.8, 
    color: '#8b5cf6', 
    description: 'Rare isotopes from advanced ship systems',
    shipClass: ['battleship', 'capital']
  }
};

// Helper function to get metal type based on ship class
function getMetalTypeForShip(shipClass) {
  const lowerClass = (shipClass || 'frigate').toLowerCase();
  
  // Determine which metal types can drop
  const possibleMetals = Object.keys(METAL_TYPES).filter(metalName => {
    const metal = METAL_TYPES[metalName];
    return metal.shipClass.some(cls => lowerClass.includes(cls) || cls.includes(lowerClass));
  });
  
  // Default to Tritanium if no match
  if (possibleMetals.length === 0) {
    return 'Tritanium Scrap';
  }
  
  // Return random from possible types
  return possibleMetals[Math.floor(Math.random() * possibleMetals.length)];
}

// Get random amount of metal scraps based on ship class
function getMetalAmount(shipClass) {
  const lowerClass = (shipClass || 'frigate').toLowerCase();
  
  if (lowerClass.includes('capital')) return Math.floor(Math.random() * 10) + 20; // 20-30
  if (lowerClass.includes('battleship')) return Math.floor(Math.random() * 8) + 12; // 12-20
  if (lowerClass.includes('battlecruiser')) return Math.floor(Math.random() * 6) + 8; // 8-14
  if (lowerClass.includes('cruiser')) return Math.floor(Math.random() * 5) + 5; // 5-10
  if (lowerClass.includes('destroyer')) return Math.floor(Math.random() * 4) + 3; // 3-7
  
  // Frigate or unknown
  return Math.floor(Math.random() * 3) + 2; // 2-5
}

// Loot tables for weapon and module drops
// Define what items can drop from different ship classes and factions
const LOOT_TABLES = {
  // Frigate loot - basic weapons and modules
  frigate: {
    weapons: [
      { name: '125mm Railgun I', chance: 0.25 },
      { name: 'Light Neutron Blaster I', chance: 0.20 },
      { name: 'Light Beam Laser I', chance: 0.18 },
      { name: '200mm AutoCannon I', chance: 0.22 },
      { name: 'Rocket Launcher I', chance: 0.15 }
    ],
    modules: [
      { name: 'Small Shield Booster I', chance: 0.20 },
      { name: 'Small Shield Extender I', chance: 0.18 },
      { name: 'Small Armor Repairer I', chance: 0.15 },
      { name: '200mm Armor Plate I', chance: 0.12 },
      { name: '1MN Afterburner I', chance: 0.25 },
      { name: 'Overdrive Injector I', chance: 0.10 }
    ],
    // Chance to drop at least one weapon or module
    dropChance: 0.30,
    // Max number of items that can drop
    maxDrops: 2
  },
  
  // Destroyer loot - slightly better items
  destroyer: {
    weapons: [
      { name: '125mm Railgun I', chance: 0.20 },
      { name: '150mm Railgun I', chance: 0.25 },
      { name: 'Light Neutron Blaster I', chance: 0.22 },
      { name: 'Light Beam Laser I', chance: 0.18 },
      { name: '200mm AutoCannon I', chance: 0.15 }
    ],
    modules: [
      { name: 'Small Shield Booster I', chance: 0.15 },
      { name: 'Small Shield Extender I', chance: 0.18 },
      { name: 'Shield Recharger I', chance: 0.12 },
      { name: 'Small Armor Repairer I', chance: 0.15 },
      { name: '200mm Armor Plate I', chance: 0.12 },
      { name: '1MN Afterburner I', chance: 0.18 },
      { name: 'Capacitor Recharger I', chance: 0.10 }
    ],
    dropChance: 0.40,
    maxDrops: 3
  },
  
  // Cruiser loot - better equipment
  cruiser: {
    weapons: [
      { name: '150mm Railgun I', chance: 0.30 },
      { name: 'Light Neutron Blaster I', chance: 0.25 },
      { name: 'Light Beam Laser I', chance: 0.22 },
      { name: '200mm AutoCannon I', chance: 0.23 }
    ],
    modules: [
      { name: 'Small Shield Booster I', chance: 0.18 },
      { name: 'Small Shield Extender I', chance: 0.15 },
      { name: 'Shield Recharger I', chance: 0.15 },
      { name: 'Small Armor Repairer I', chance: 0.18 },
      { name: '200mm Armor Plate I', chance: 0.12 },
      { name: '1MN Afterburner I', chance: 0.12 },
      { name: 'Capacitor Recharger I', chance: 0.10 }
    ],
    dropChance: 0.50,
    maxDrops: 4
  },
  
  // Battlecruiser loot - high-end equipment
  battlecruiser: {
    weapons: [
      { name: '150mm Railgun I', chance: 0.35 },
      { name: 'Light Neutron Blaster I', chance: 0.30 },
      { name: 'Light Beam Laser I', chance: 0.20 },
      { name: '200mm AutoCannon I', chance: 0.15 }
    ],
    modules: [
      { name: 'Small Shield Booster I', chance: 0.20 },
      { name: 'Small Shield Extender I', chance: 0.18 },
      { name: 'Shield Recharger I', chance: 0.15 },
      { name: 'Small Armor Repairer I', chance: 0.15 },
      { name: '200mm Armor Plate I', chance: 0.10 },
      { name: 'Magnetic Field Stabilizer I', chance: 0.12 },
      { name: 'Heat Sink I', chance: 0.10 }
    ],
    dropChance: 0.60,
    maxDrops: 5
  },
  
  // Faction-specific modifiers
  factionModifiers: {
    pirate: {
      // Pirates have slightly higher drop chance and might drop weapons more often
      dropChanceMultiplier: 1.1,
      weaponChanceMultiplier: 1.2
    },
    police: {
      // Police drop better modules but fewer weapons
      dropChanceMultiplier: 0.9,
      weaponChanceMultiplier: 0.7,
      moduleChanceMultiplier: 1.3
    }
  }
};

// Function to generate loot based on ship class and faction
function generateLoot(shipClass, faction = 'pirate') {
  const loot = [];
  const lowerClass = (shipClass || 'frigate').toLowerCase();
  
  // Get the appropriate loot table
  let lootTable = LOOT_TABLES.frigate; // Default
  if (lowerClass.includes('battlecruiser')) {
    lootTable = LOOT_TABLES.battlecruiser;
  } else if (lowerClass.includes('cruiser')) {
    lootTable = LOOT_TABLES.cruiser;
  } else if (lowerClass.includes('destroyer')) {
    lootTable = LOOT_TABLES.destroyer;
  }
  
  // Get faction modifiers
  const factionMod = LOOT_TABLES.factionModifiers[faction] || { 
    dropChanceMultiplier: 1.0, 
    weaponChanceMultiplier: 1.0, 
    moduleChanceMultiplier: 1.0 
  };
  
  // Apply faction modifier to drop chance
  const finalDropChance = lootTable.dropChance * factionMod.dropChanceMultiplier;
  
  // Check if we should drop anything
  if (Math.random() > finalDropChance) {
    return loot; // No drops
  }
  
  // Determine how many items to drop
  const numDrops = Math.floor(Math.random() * lootTable.maxDrops) + 1;
  
  for (let i = 0; i < numDrops; i++) {
    // 50/50 chance between weapon and module (modified by faction)
    const isWeapon = Math.random() < (0.5 * (factionMod.weaponChanceMultiplier || 1.0));
    
    const itemPool = isWeapon ? lootTable.weapons : lootTable.modules;
    const multiplier = isWeapon ? (factionMod.weaponChanceMultiplier || 1.0) : (factionMod.moduleChanceMultiplier || 1.0);
    
    // Calculate total weight with multiplier
    const totalWeight = itemPool.reduce((sum, item) => sum + (item.chance * multiplier), 0);
    
    // Roll for an item
    let roll = Math.random() * totalWeight;
    for (const item of itemPool) {
      roll -= item.chance * multiplier;
      if (roll <= 0) {
        // Found the item! Get its data from the appropriate module
        const itemData = isWeapon ? WEAPON_MODULES[item.name] : SUBSYSTEM_MODULES[item.name];
        if (itemData) {
          // Create loot item using the module's defined cargo size
          const lootItem = {
            type: isWeapon ? 'weapon' : 'module',
            name: item.name,
            size: itemData.cargoSize || 5, // Use module's cargoSize or default to 5
            // Store full module data for reference
            moduleData: itemData
          };
          loot.push(lootItem);
        }
        break;
      }
    }
  }
  
  return loot;
}
