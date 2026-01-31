// Anomaly Definitions
// Cosmic signatures that can be scanned and explored
// Different types provide different rewards and challenges

const ANOMALY_TYPES = {
  // ===== COMBAT ANOMALIES =====
  
  'Guristas Hideout': {
    name: 'Guristas Hideout',
    type: 'combat',
    difficulty: 'easy',
    description: 'A small pirate hideout with light resistance',
    
    // Requirements
    requiresScanning: true,
    
    // Pocket contents
    npcs: {
      count: [3, 5],  // Min/max NPCs
      difficulty: 1.2  // HP/damage multiplier
    },
    
    // Rewards
    rewards: {
      iskBounty: [15000, 25000],
      metalScrap: [5, 8],
      ore: [3, 6],
      specialLoot: 0.2  // 20% chance for special item
    },
    
    // Respawn
    respawnTime: 1800000  // 30 minutes in milliseconds
  },
  
  'Blood Raider Outpost': {
    name: 'Blood Raider Outpost',
    type: 'combat',
    difficulty: 'medium',
    description: 'A fortified pirate base with moderate defenses',
    
    requiresScanning: true,
    
    npcs: {
      count: [5, 8],
      difficulty: 1.5
    },
    
    rewards: {
      iskBounty: [35000, 50000],
      metalScrap: [8, 12],
      ore: [5, 10],
      specialLoot: 0.3
    },
    
    respawnTime: 2400000  // 40 minutes
  },
  
  'Serpentis Stronghold': {
    name: 'Serpentis Stronghold',
    type: 'combat',
    difficulty: 'hard',
    description: 'A heavily defended stronghold with elite pirates',
    
    requiresScanning: true,
    
    npcs: {
      count: [8, 12],
      difficulty: 2.0
    },
    
    rewards: {
      iskBounty: [70000, 100000],
      metalScrap: [15, 20],
      ore: [10, 15],
      specialLoot: 0.5
    },
    
    respawnTime: 3600000  // 60 minutes
  },
  
  // ===== MINING ANOMALIES =====
  
  'Ordinary Perimeter Deposit': {
    name: 'Ordinary Perimeter Deposit',
    type: 'mining',
    difficulty: 'easy',
    description: 'A small asteroid cluster with common ores',
    
    requiresScanning: false,  // Pre-discovered
    
    asteroids: {
      count: [8, 12],
      oreTypes: ['Veldspar', 'Scordite', 'Pyroxeres'],
      sizeMultiplier: 1.5  // Larger than normal asteroids
    },
    
    rewards: {
      iskBounty: 0,
      specialLoot: 0
    },
    
    respawnTime: 1800000  // 30 minutes
  },
  
  'Common Perimeter Deposit': {
    name: 'Common Perimeter Deposit',
    type: 'mining',
    difficulty: 'medium',
    description: 'A rich asteroid field with uncommon ores',
    
    requiresScanning: true,
    
    asteroids: {
      count: [10, 15],
      oreTypes: ['Scordite', 'Pyroxeres', 'Plagioclase', 'Omber'],
      sizeMultiplier: 2.0
    },
    
    rewards: {
      iskBounty: 0,
      specialLoot: 0.1
    },
    
    respawnTime: 2400000  // 40 minutes
  },
  
  'Exceptional Core Deposit': {
    name: 'Exceptional Core Deposit',
    type: 'mining',
    difficulty: 'hard',
    description: 'A dense asteroid field with rare ores',
    
    requiresScanning: true,
    
    asteroids: {
      count: [12, 18],
      oreTypes: ['Plagioclase', 'Omber', 'Kernite'],
      sizeMultiplier: 2.5
    },
    
    rewards: {
      iskBounty: 0,
      specialLoot: 0.2
    },
    
    respawnTime: 3600000  // 60 minutes
  },
  
  // ===== DATA/RELIC SITES =====
  
  'Forgotten Data Cache': {
    name: 'Forgotten Data Cache',
    type: 'data',
    difficulty: 'easy',
    description: 'An abandoned data facility with hackable containers',
    
    requiresScanning: true,
    
    containers: {
      count: [3, 5],
      hackDifficulty: 'easy'
    },
    
    rewards: {
      iskBounty: [20000, 35000],
      metalScrap: [3, 5],
      specialLoot: 0.4  // Blueprints, rare modules
    },
    
    respawnTime: 2400000  // 40 minutes
  },
  
  'Ruined Relic Site': {
    name: 'Ruined Relic Site',
    type: 'relic',
    difficulty: 'medium',
    description: 'Ancient ruins containing valuable artifacts',
    
    requiresScanning: true,
    
    containers: {
      count: [4, 6],
      hackDifficulty: 'medium'
    },
    
    rewards: {
      iskBounty: [40000, 60000],
      metalScrap: [5, 8],
      specialLoot: 0.6
    },
    
    respawnTime: 3000000  // 50 minutes
  },
  
  'Sleeper Cache': {
    name: 'Sleeper Cache',
    type: 'data',
    difficulty: 'hard',
    description: 'A mysterious Sleeper facility with advanced technology',
    
    requiresScanning: true,
    
    containers: {
      count: [5, 8],
      hackDifficulty: 'hard'
    },
    
    npcs: {
      count: [2, 4],  // Some sites have both containers and defenders
      difficulty: 1.8
    },
    
    rewards: {
      iskBounty: [80000, 120000],
      metalScrap: [10, 15],
      specialLoot: 0.8
    },
    
    respawnTime: 4200000  // 70 minutes
  }
};

// Special loot table for anomalies
const ANOMALY_LOOT = {
  blueprints: [
    { name: 'Small Shield Booster Blueprint', price: 50000, rarity: 'uncommon' },
    { name: 'Afterburner Blueprint', price: 75000, rarity: 'uncommon' },
    { name: 'Damage Control Blueprint', price: 100000, rarity: 'rare' },
    { name: 'Tracking Enhancer Blueprint', price: 85000, rarity: 'rare' }
  ],
  
  modules: [
    { name: 'Prototype Shield Booster', price: 45000, rarity: 'uncommon', stats: 'Better than T1' },
    { name: 'Experimental Afterburner', price: 65000, rarity: 'rare', stats: '+25% speed' },
    { name: 'Salvager Module', price: 35000, rarity: 'uncommon', stats: 'Extract components from wrecks' }
  ],
  
  materials: [
    { name: 'Melted Nanoribbons', price: 150, rarity: 'uncommon' },
    { name: 'Scorched Telemetry Processor', price: 300, rarity: 'rare' },
    { name: 'Burned Logic Circuit', price: 250, rarity: 'rare' },
    { name: 'Tangled Power Conduit', price: 400, rarity: 'very rare' }
  ]
};

// Helper function to get random anomaly type by difficulty
function getRandomAnomalyType(difficulty = 'any') {
  const types = Object.keys(ANOMALY_TYPES);
  const filtered = difficulty === 'any' 
    ? types 
    : types.filter(key => ANOMALY_TYPES[key].difficulty === difficulty);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

// Helper function to get anomalies by type
function getAnomaliesByType(type) {
  return Object.keys(ANOMALY_TYPES)
    .filter(key => ANOMALY_TYPES[key].type === type)
    .map(key => ANOMALY_TYPES[key]);
}

// Helper function to roll for special loot
function rollSpecialLoot(chance) {
  if (Math.random() > chance) return null;
  
  const roll = Math.random();
  if (roll < 0.4) {
    // 40% blueprints
    const items = ANOMALY_LOOT.blueprints;
    return items[Math.floor(Math.random() * items.length)];
  } else if (roll < 0.7) {
    // 30% modules
    const items = ANOMALY_LOOT.modules;
    return items[Math.floor(Math.random() * items.length)];
  } else {
    // 30% materials
    const items = ANOMALY_LOOT.materials;
    return items[Math.floor(Math.random() * items.length)];
  }
}
