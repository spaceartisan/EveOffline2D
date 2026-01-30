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
  // Add destroyers, cruisers, etc. here following the same format
  // Example:
  /*
  'Catalyst': {
    class: 'Destroyer',
    name: 'Catalyst',
    description: 'A destroyer-class ship',
    maxSpeed: 2.5,
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
