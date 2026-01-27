// Module Definitions (Non-weapon subsystems)
// Includes shield boosters, armor repairers, propulsion, capacitor modules, etc.
// Easy to add new modules by following the template below

const SUBSYSTEM_MODULES = {
  // ===== SHIELD MODULES =====
  
  'Small Shield Booster I': {
    type: 'active',
    category: 'shield',
    size: 'small',
    name: 'Small Shield Booster I',
    description: 'Repairs shield when activated',
    
    // Module stats
    shieldBoostAmount: 30,
    activationTime: 60, // Frames between activations
    capacitorUse: 20,
    
    // Fitting requirements
    powergridUsage: 2,
    cpuUsage: 20,
    
    price: 8000
  },
  
  'Small Shield Extender I': {
    type: 'passive',
    category: 'shield',
    size: 'small',
    name: 'Small Shield Extender I',
    description: 'Increases maximum shield capacity',
    
    shieldBonus: 50, // Flat increase
    
    powergridUsage: 1,
    cpuUsage: 15,
    
    price: 6000
  },
  
  'Shield Recharger I': {
    type: 'passive',
    category: 'shield',
    size: 'small',
    name: 'Shield Recharger I',
    description: 'Increases shield regeneration rate',
    
    shieldRegenBonus: 0.3, // Added to base regen
    
    powergridUsage: 1,
    cpuUsage: 12,
    
    price: 7000
  },
  
  // ===== ARMOR MODULES =====
  
  'Small Armor Repairer I': {
    type: 'active',
    category: 'armor',
    size: 'small',
    name: 'Small Armor Repairer I',
    description: 'Repairs armor when activated',
    
    armorRepairAmount: 25,
    activationTime: 90, // Slower than shields
    capacitorUse: 15,
    
    powergridUsage: 3,
    cpuUsage: 18,
    
    price: 9000
  },
  
  '200mm Armor Plate I': {
    type: 'passive',
    category: 'armor',
    size: 'small',
    name: '200mm Armor Plate I',
    description: 'Increases armor hit points but reduces speed',
    
    armorBonus: 60,
    speedPenalty: 0.1, // 10% speed reduction
    
    powergridUsage: 2,
    cpuUsage: 8,
    
    price: 5000
  },
  
  // ===== PROPULSION MODULES =====
  
  '1MN Afterburner I': {
    type: 'active',
    category: 'propulsion',
    size: 'small',
    name: '1MN Afterburner I',
    description: 'Increases speed while active',
    
    speedBonus: 1.5, // Multiplier
    capacitorUse: 8, // Per second (divide by 60 for per frame)
    activationTime: 1, // Always active when on
    
    powergridUsage: 1,
    cpuUsage: 20,
    
    price: 12000
  },
  
  'Overdrive Injector I': {
    type: 'passive',
    category: 'propulsion',
    size: 'small',
    name: 'Overdrive Injector I',
    description: 'Permanently increases maximum speed',
    
    speedBonus: 0.3, // 30% increase
    
    powergridUsage: 1,
    cpuUsage: 10,
    
    price: 8000
  },
  
  // ===== CAPACITOR MODULES =====
  
  'Capacitor Recharger I': {
    type: 'passive',
    category: 'capacitor',
    size: 'small',
    name: 'Capacitor Recharger I',
    description: 'Increases capacitor recharge rate',
    
    capacitorRegenBonus: 0.5,
    
    powergridUsage: 0,
    cpuUsage: 15,
    
    price: 7000
  },
  
  'Capacitor Battery I': {
    type: 'passive',
    category: 'capacitor',
    size: 'small',
    name: 'Capacitor Battery I',
    description: 'Increases maximum capacitor capacity',
    
    capacitorBonus: 40,
    
    powergridUsage: 1,
    cpuUsage: 12,
    
    price: 6000
  },
  
  // ===== DAMAGE MODULES =====
  
  'Magnetic Field Stabilizer I': {
    type: 'passive',
    category: 'damage',
    size: 'small',
    name: 'Magnetic Field Stabilizer I',
    description: 'Increases hybrid turret damage',
    
    damageBonus: 0.10, // 10% increase
    
    powergridUsage: 1,
    cpuUsage: 18,
    
    price: 10000
  },
  
  'Heat Sink I': {
    type: 'passive',
    category: 'damage',
    size: 'small',
    name: 'Heat Sink I',
    description: 'Increases laser damage',
    
    damageBonus: 0.10,
    
    powergridUsage: 1,
    cpuUsage: 18,
    
    price: 10000
  },
  
  'Gyrostabilizer I': {
    type: 'passive',
    category: 'damage',
    size: 'small',
    name: 'Gyrostabilizer I',
    description: 'Increases projectile weapon damage',
    
    damageBonus: 0.10,
    
    powergridUsage: 1,
    cpuUsage: 18,
    
    price: 10000
  },
  
  'Ballistic Control System I': {
    type: 'passive',
    category: 'damage',
    size: 'small',
    name: 'Ballistic Control System I',
    description: 'Increases missile damage',
    
    damageBonus: 0.10,
    
    powergridUsage: 1,
    cpuUsage: 18,
    
    price: 10000
  },
  
  // ===== UTILITY MODULES =====
  
  'Cargo Expander I': {
    type: 'passive',
    category: 'utility',
    size: 'small',
    name: 'Cargo Expander I',
    description: 'Increases cargo capacity',
    
    cargoBonus: 50,
    
    powergridUsage: 0,
    cpuUsage: 8,
    
    price: 5000
  },
  
  'Warp Core Stabilizer I': {
    type: 'passive',
    category: 'utility',
    size: 'small',
    name: 'Warp Core Stabilizer I',
    description: 'Reduces warp cooldown time',
    
    warpCooldownReduction: 0.2, // 20% faster
    
    powergridUsage: 1,
    cpuUsage: 15,
    
    price: 15000
  }
};

// Helper function to get module stats
function getSubsystemModule(moduleName) {
  return SUBSYSTEM_MODULES[moduleName] || null;
}

// Helper function to list modules by category
function getModulesByCategory(category) {
  return Object.keys(SUBSYSTEM_MODULES)
    .filter(key => SUBSYSTEM_MODULES[key].category === category)
    .map(key => SUBSYSTEM_MODULES[key]);
}
