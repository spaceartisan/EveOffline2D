// Ship Class Definitions
// Each ship class has different stats and capabilities
// Easy to add new ships by following the template below

const SHIP_CLASSES = {
  // ===== FRIGATES =====
  // Fast, agile ships with moderate firepower
  
  'Atron': {
    class: 'Frigate',
    name: 'Atron',
    description: 'A versatile Gallente frigate with balanced stats',
    
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
    
    // Mining
    miningYield: 8,
    
    // Economy
    price: 50000
  },
  
  'Tristan': {
    class: 'Frigate',
    name: 'Tristan',
    description: 'A drone-focused frigate with strong capacitor',
    
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
    
    // Mining
    miningYield: 8,
    
    // Economy
    price: 55000
  },
  
  'Rifter': {
    class: 'Frigate',
    name: 'Rifter',
    description: 'A nimble Minmatar frigate focused on speed',
    
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
    
    // Mining
    miningYield: 8,
    
    // Economy
    price: 48000
  },
  
  // Starting ship (current default)
  'Velator': {
    class: 'Frigate',
    name: 'Velator',
    description: 'A basic starter frigate - cheap and reliable',
    
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
    
    // Mining
    miningYield: 8,
    
    // Economy
    price: 0 // Starting ship, free
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
    miningYield: template.miningYield,
    miningCooldown: 0,
    
    // Economy
    shipPrice: template.price
  };
}
