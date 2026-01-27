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
