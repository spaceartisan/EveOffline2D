// Ship Class Definitions
// Each ship class has different stats and capabilities
// Easy to add new ships by following the template below

const SHIP_CLASSES = {
  // ===== FRIGATES =====
  // Fast, agile ships with moderate firepower
  
  'Atron': {
    class: 'Frigate',
    name: 'Atron',
    faction: 'Gallente',
    description: 'A versatile Gallente frigate with balanced stats',
    
    // Fitting slots
    highSlots: 3,
    mediumSlots: 3,
    lowSlots: 2,
    
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
    price: 50000
  },
  
  'Tristan': {
    class: 'Frigate',
    name: 'Tristan',
    faction: 'Gallente',
    description: 'A drone-focused frigate with strong capacitor',
    
    // Fitting slots
    highSlots: 2,
    mediumSlots: 4,
    lowSlots: 2,
    
    // Movement
    maxSpeed: 3.2,
    sublightSpeed: 3.2,
    warpSpeed: 4,
    accel: 0.10,
    turnRate: 0.05,
    drag: 0.98,
    
    // Defense
    maxShield: 140,
    shieldRegen: 0.7,
    maxArmor: 100,
    maxHull: 80,
    
    // Offense
    dmg: 15,
    fireRate: 20,
    maxRange: 500,
    
    // Resources
    maxCap: 150,
    capRegen: 1.8,
    cargoCap: 100,
    

    // Economy
    price: 55000
  },
  
  'Rifter': {
    class: 'Frigate',
    name: 'Rifter',
    faction: 'Minmatar',
    description: 'A nimble Minmatar frigate focused on speed',
    
    // Fitting slots
    highSlots: 3,
    mediumSlots: 3,
    lowSlots: 3,
    
    // Movement
    maxSpeed: 4.0,
    sublightSpeed: 4.0,
    warpSpeed: 5,
    accel: 0.15,
    turnRate: 0.06,
    drag: 0.98,
    
    // Defense
    maxShield: 100,
    shieldRegen: 0.5,
    maxArmor: 80,
    maxHull: 60,
    
    // Offense
    dmg: 20,
    fireRate: 16,
    maxRange: 500,
    
    // Resources
    maxCap: 100,
    capRegen: 1.2,
    cargoCap: 110,
    

    // Economy
    price: 48000
  },
  
  // ===== CORVETTES =====
  // Ultra-basic ships available everywhere
  
  'Ibis': {
    class: 'Corvette',
    name: 'Ibis',
    faction: 'Caldari',
    description: 'A basic corvette - available at all stations',
    
    // Fitting slots
    highSlots: 1,
    mediumSlots: 2,
    lowSlots: 1,
    
    // Movement
    maxSpeed: 2.8,
    sublightSpeed: 2.8,
    warpSpeed: 3,
    accel: 0.08,
    turnRate: 0.04,
    drag: 0.98,
    
    // Defense
    maxShield: 80,
    shieldRegen: 0.4,
    maxArmor: 60,
    maxHull: 50,
    
    // Offense
    dmg: 10,
    fireRate: 22,
    maxRange: 450,
    
    // Resources
    maxCap: 80,
    capRegen: 1.0,
    cargoCap: 80,
    
    // Economy
    price: 0 // Free corvette, available everywhere
  },
  
  // Starting ship (current default)
  'Velator': {
    class: 'Frigate',
    name: 'Velator',
    faction: 'Gallente',
    description: 'A basic starter frigate - cheap and reliable',
    
    // Fitting slots
    highSlots: 2,
    mediumSlots: 2,
    lowSlots: 2,
    
    // Movement
    maxSpeed: 3.0,
    sublightSpeed: 3.0,
    warpSpeed: 3,
    accel: 0.10,
    turnRate: 0.04,
    drag: 0.98,
    
    // Defense
    maxShield: 100,
    shieldRegen: 0.5,
    maxArmor: 80,
    maxHull: 60,
    
    // Offense
    dmg: 15,
    fireRate: 20,
    maxRange: 500,
    
    // Resources
    maxCap: 100,
    capRegen: 1.2,
    cargoCap: 100,
    
    // Economy
    price: 0 // Starting ship, free
  },
  
  // ===== BATTLECRUISERS =====
  // Heavy combat ships with strong defenses
  
  'Ferox': {
    class: 'Battlecruiser',
    name: 'Ferox',
    faction: 'Caldari',
    description: 'A powerful Caldari battlecruiser with strong shields and hybrid weapons',
    
    // Fitting slots
    highSlots: 5,
    mediumSlots: 5,
    lowSlots: 4,
    
    // Movement
    maxSpeed: 1.8,
    sublightSpeed: 1.8,
    warpSpeed: 3,
    accel: 0.06,
    turnRate: 0.025,
    drag: 0.96,
    
    // Defense
    maxShield: 900,
    shieldRegen: 4.5,
    maxArmor: 500,
    maxHull: 400,
    
    // Offense
    dmg: 65,
    fireRate: 50,
    maxRange: 850,
    
    // Resources
    maxCap: 800,
    capRegen: 8.0,
    cargoCap: 450,
    

    // Economy
    price: 1500000
  },
  
  // ===== DESTROYERS =====
  // Anti-frigate specialists with many weapon slots
  
  'Catalyst': {
    class: 'Destroyer',
    name: 'Catalyst',
    faction: 'Gallente',
    description: 'A destroyer with exceptional firepower against smaller targets',
    
    // Fitting slots
    highSlots: 7,
    mediumSlots: 2,
    lowSlots: 2,
    
    // Movement
    maxSpeed: 2.5,
    sublightSpeed: 2.5,
    warpSpeed: 3.5,
    accel: 0.08,
    turnRate: 0.035,
    drag: 0.97,
    
    // Defense
    maxShield: 200,
    shieldRegen: 1.0,
    maxArmor: 180,
    maxHull: 130,
    
    // Offense
    dmg: 25,
    fireRate: 25,
    maxRange: 600,
    
    // Resources
    maxCap: 250,
    capRegen: 2.5,
    cargoCap: 200,
    
    // Economy
    price: 180000
  },
  
  'Coercer': {
    class: 'Destroyer',
    name: 'Coercer',
    faction: 'Amarr',
    description: 'An Amarr destroyer with devastating energy weapon arrays',
    
    // Fitting slots
    highSlots: 8,
    mediumSlots: 2,
    lowSlots: 1,
    
    // Movement
    maxSpeed: 2.3,
    sublightSpeed: 2.3,
    warpSpeed: 3.5,
    accel: 0.07,
    turnRate: 0.03,
    drag: 0.97,
    
    // Defense
    maxShield: 180,
    shieldRegen: 0.9,
    maxArmor: 220,
    maxHull: 150,
    
    // Offense
    dmg: 28,
    fireRate: 28,
    maxRange: 650,
    
    // Resources
    maxCap: 280,
    capRegen: 2.8,
    cargoCap: 180,
    
    // Economy
    price: 200000
  },
  
  // ===== CRUISERS =====
  // Versatile mid-sized warships
  
  'Vexor': {
    class: 'Cruiser',
    name: 'Vexor',
    faction: 'Gallente',
    description: 'A powerful Gallente cruiser with strong drone capabilities',
    
    // Fitting slots
    highSlots: 4,
    mediumSlots: 4,
    lowSlots: 5,
    
    // Movement
    maxSpeed: 2.2,
    sublightSpeed: 2.2,
    warpSpeed: 3.2,
    accel: 0.07,
    turnRate: 0.03,
    drag: 0.96,
    
    // Defense
    maxShield: 400,
    shieldRegen: 2.0,
    maxArmor: 250,
    maxHull: 180,
    
    // Offense
    dmg: 40,
    fireRate: 35,
    maxRange: 700,
    
    // Resources
    maxCap: 500,
    capRegen: 5.0,
    cargoCap: 350,
    
    // Economy
    price: 650000
  },
  
  'Maller': {
    class: 'Cruiser',
    name: 'Maller',
    faction: 'Amarr',
    description: 'A heavily armored Amarr cruiser built for sustained combat',
    
    // Fitting slots
    highSlots: 5,
    mediumSlots: 3,
    lowSlots: 5,
    
    // Movement
    maxSpeed: 2.0,
    sublightSpeed: 2.0,
    warpSpeed: 3.2,
    accel: 0.06,
    turnRate: 0.028,
    drag: 0.96,
    
    // Defense
    maxShield: 350,
    shieldRegen: 1.8,
    maxArmor: 350,
    maxHull: 200,
    
    // Offense
    dmg: 45,
    fireRate: 38,
    maxRange: 750,
    
    // Resources
    maxCap: 550,
    capRegen: 5.5,
    cargoCap: 300,
    
    // Economy
    price: 700000
  },
  
  'Caracal': {
    class: 'Cruiser',
    name: 'Caracal',
    faction: 'Caldari',
    description: 'A missile-focused Caldari cruiser with powerful shields',
    
    // Fitting slots
    highSlots: 5,
    mediumSlots: 5,
    lowSlots: 3,
    
    // Movement
    maxSpeed: 2.4,
    sublightSpeed: 2.4,
    warpSpeed: 3.2,
    accel: 0.075,
    turnRate: 0.032,
    drag: 0.96,
    
    // Defense
    maxShield: 500,
    shieldRegen: 2.5,
    maxArmor: 200,
    maxHull: 150,
    
    // Offense
    dmg: 42,
    fireRate: 36,
    maxRange: 720,
    
    // Resources
    maxCap: 520,
    capRegen: 5.2,
    cargoCap: 320,
    
    // Economy
    price: 680000
  },
  
  // ===== BATTLESHIPS =====
  // Massive capital ships with devastating firepower
  
  'Apocalypse': {
    class: 'Battleship',
    name: 'Apocalypse',
    faction: 'Amarr',
    description: 'A legendary Amarr battleship with heavy armor and devastating energy weapons',
    
    // Fitting slots
    highSlots: 7,
    mediumSlots: 5,
    lowSlots: 6,
    
    // Movement
    maxSpeed: 1.2,
    sublightSpeed: 1.2,
    warpSpeed: 2.5,
    accel: 0.04,
    turnRate: 0.015,
    drag: 0.95,
    
    // Defense
    maxShield: 800,
    shieldRegen: 3.5,
    maxArmor: 1200,
    maxHull: 900,
    
    // Offense
    dmg: 120,
    fireRate: 80,
    maxRange: 1000,
    
    // Resources
    maxCap: 1200,
    capRegen: 12.0,
    cargoCap: 600,
    

    // Economy
    price: 4500000
  },
  
  // ===== FUTURE SHIP CLASSES =====
  // Add carriers, dreadnoughts, etc. here following the same format
  // Example:
  /*
  'Thanatos': {
    class: 'Carrier',
    name: 'Thanatos',
    description: 'A carrier-class capital ship',
    maxSpeed: 0.8,
    // ... etc
  }
  */
};

// Helper function to create a ship instance from a template
function createShipFromTemplate(templateName) {
  const template = SHIP_CLASSES[templateName];
  if (!template) {
    console.error(`Ship template "${templateName}" not found!`);
    return null;
  }
  
  return {
    // Identity
    shipClass: template.class,
    shipName: template.name,
    shipDescription: template.description,
    shipFaction: template.faction || 'None',
    
    // Fitting slots
    highSlotsMax: template.highSlots,
    mediumSlotsMax: template.mediumSlots,
    lowSlotsMax: template.lowSlots,
    
    // Movement
    maxSpeed: template.maxSpeed,
    sublightSpeed: template.sublightSpeed,
    warpSpeed: template.warpSpeed,
    accel: template.accel,
    turnRate: template.turnRate,
    drag: template.drag,
    
    // Defense - set current to max
    shield: template.maxShield,
    maxShield: template.maxShield,
    shieldRegen: template.shieldRegen,
    armor: template.maxArmor,
    maxArmor: template.maxArmor,
    hull: template.maxHull,
    maxHull: template.maxHull,
    
    // Offense
    dmg: template.dmg,
    fireRate: template.fireRate,
    fireCooldown: 0,
    maxRange: template.maxRange,
    
    // Resources
    cap: template.maxCap,
    maxCap: template.maxCap,
    capRegen: template.capRegen,
    cargo: {ore: 0},
    cargoCap: template.cargoCap,
    
    // Mining
    miningCooldown: 0,
    
    // Economy
    shipPrice: template.price
  };
}
