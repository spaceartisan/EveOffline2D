// Weapon Module Definitions
// Each weapon has different stats: damage, range, fire rate, capacitor usage
// Easy to add new weapons by following the template below

const WEAPON_MODULES = {
  // ===== TURRETS =====
  // Small turrets for frigates
  
  '125mm Railgun I': {
    type: 'weapon',
    category: 'turret',
    size: 'small',
    name: '125mm Railgun I',
    description: 'Basic hybrid turret with good range',
    
    // Combat stats
    damage: 15,
    fireRate: 20, // Frames between shots (lower = faster)
    maxRange: 500,
    optimalRange: 350, // Best accuracy within this range
    capacitorUse: 5, // Cap per shot
    
    // Accuracy by range brackets
    accuracyClose: 0.90, // 0-65% range
    accuracyMedium: 0.70, // 65-85% range
    accuracyLong: 0.35, // 85-100% range
    
    // Fitting requirements
    powergridUsage: 2,
    cpuUsage: 15,
    
    // Economy
    price: 5000
  },
  
  '150mm Railgun I': {
    type: 'weapon',
    category: 'turret',
    size: 'small',
    name: '150mm Railgun I',
    description: 'Upgraded railgun with better damage',
    
    damage: 22,
    fireRate: 22,
    maxRange: 600,
    optimalRange: 400,
    capacitorUse: 7,
    
    accuracyClose: 0.92,
    accuracyMedium: 0.75,
    accuracyLong: 0.40,
    
    powergridUsage: 3,
    cpuUsage: 20,
    
    price: 15000
  },
  
  'Light Neutron Blaster I': {
    type: 'weapon',
    category: 'turret',
    size: 'small',
    name: 'Light Neutron Blaster I',
    description: 'Close-range blaster with high damage',
    
    damage: 28,
    fireRate: 16, // Faster fire rate
    maxRange: 350,
    optimalRange: 250,
    capacitorUse: 8,
    
    accuracyClose: 0.95,
    accuracyMedium: 0.60,
    accuracyLong: 0.20,
    
    powergridUsage: 4,
    cpuUsage: 18,
    
    price: 12000
  },
  
  'Light Beam Laser I': {
    type: 'weapon',
    category: 'turret',
    size: 'small',
    name: 'Light Beam Laser I',
    description: 'Energy weapon with good range and accuracy',
    
    damage: 18,
    fireRate: 18,
    maxRange: 550,
    optimalRange: 400,
    capacitorUse: 10, // High cap usage
    
    accuracyClose: 0.93,
    accuracyMedium: 0.80,
    accuracyLong: 0.45,
    
    powergridUsage: 3,
    cpuUsage: 12,
    
    price: 10000
  },
  
  '200mm AutoCannon I': {
    type: 'weapon',
    category: 'turret',
    size: 'small',
    name: '200mm AutoCannon I',
    description: 'Projectile weapon with no capacitor usage',
    
    damage: 20,
    fireRate: 14, // Very fast
    maxRange: 400,
    optimalRange: 280,
    capacitorUse: 0, // No cap needed!
    
    accuracyClose: 0.88,
    accuracyMedium: 0.65,
    accuracyLong: 0.30,
    
    powergridUsage: 2,
    cpuUsage: 8,
    
    price: 8000
  },
  
  // ===== MISSILES =====
  // Different weapon type for future expansion
  
  'Rocket Launcher I': {
    type: 'weapon',
    category: 'missile',
    size: 'small',
    name: 'Rocket Launcher I',
    description: 'Short-range missile launcher - always hits',
    
    damage: 25,
    fireRate: 30, // Slower reload
    maxRange: 450,
    optimalRange: 450, // Full range is optimal
    capacitorUse: 6,
    
    // Missiles always hit within range
    accuracyClose: 1.0,
    accuracyMedium: 1.0,
    accuracyLong: 1.0,
    
    powergridUsage: 1,
    cpuUsage: 25, // High CPU
    
    price: 18000
  },
  
  // ===== MINING LASERS =====
  
  'Miner I': {
    type: 'weapon',
    category: 'mining',
    size: 'small',
    name: 'Miner I',
    description: 'Basic mining laser',
    
    damage: 0,
    fireRate: 300,
    maxRange: 200, // Short range for mining
    optimalRange: 200,
    capacitorUse: 3,
    
    // Mining specific
    miningYield: 1,
    
    powergridUsage: 1,
    cpuUsage: 10,
    
    price: 3000
  },
  
  'Miner II': {
    type: 'weapon',
    category: 'mining',
    size: 'small',
    name: 'Miner II',
    description: 'Improved mining laser with better yield',
    
    damage: 0,
    fireRate: 400,
    maxRange: 350,
    optimalRange: 350,
    capacitorUse: 4,
    
    miningYield: 4,
    
    powergridUsage: 2,
    cpuUsage: 15,
    
    price: 20000
  }
};

// Helper function to get weapon stats
function getWeaponModule(moduleName) {
  return WEAPON_MODULES[moduleName] || null;
}

// Helper function to list weapons by category
function getWeaponsByCategory(category) {
  return Object.keys(WEAPON_MODULES)
    .filter(key => WEAPON_MODULES[key].category === category)
    .map(key => WEAPON_MODULES[key]);
}
