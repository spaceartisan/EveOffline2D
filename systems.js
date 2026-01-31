// systems.js - Star system definitions and points of interest

// System configuration data
const SYSTEM_DATA = [
  // High Security Space (≥0.5) - Central hub triangle (0-7)
  { 
    name: 'Jita', security: 1.0, gates: [1, 2], 
    station: { x: 10000, y: 10000, name: 'Jita IV - Caldari Navy Assembly Plant' }, 
    mapX: 380, mapY: 200, color: '#3b82f6', category: 'navy',
    forSale: ['Core Probe Launcher I','125mm Railgun I', '150mm Railgun I', 'Light Beam Laser I', 'Rocket Launcher I', 'Miner I', 'Miner II', 'Small Shield Booster I', 'Small Shield Extender I', 'Shield Recharger I', 'Damage Control I', 'Micro Auxiliary Power Core I', 'Capacitor Battery I', 'Capacitor Recharger I', 'Overdrive Injector System I', 'Nanofiber Internal Structure I', 'Ballistic Control System I', 'Tracking Enhancer I', 'Cargo Scanner I'],
    shipsForSale: ['Ibis', 'Velator', 'Atron', 'Tristan', 'Rifter', 'Ferox', 'Apocalypse']
  },            // 0 - Major trade hub, full selection
  { 
    name: 'Amarr', security: 1.0, gates: [0, 2, 3, 5], 
    station: { x: 10000, y: 10000, name: 'Amarr VIII - Emperor Family Academy' }, 
    mapX: 310, mapY: 270, color: '#a855f7', category: 'academy',
    forSale: ['Light Beam Laser I', '125mm Railgun I', 'Rocket Launcher I', 'Miner I', 'Small Shield Booster I', 'Small Armor Repairer I', 'Small Armor Plate I', 'Adaptive Nano Plating I', 'Damage Control I', 'Capacitor Battery I', 'Capacitor Recharger I', 'Micro Auxiliary Power Core I', 'Ballistic Control System I', 'Heat Sink I', 'Tracking Enhancer I'],
    shipsForSale: ['Ibis', 'Velator', 'Atron', 'Tristan', 'Apocalypse']
  },       // 1 - Academy, starter ships and Amarr battleship
  { 
    name: 'Dodixie', security: 0.9, gates: [0, 1, 4, 6], 
    station: { x: 10000, y: 10000, name: 'Dodixie IX - Moon 20 - Federation Navy' }, 
    mapX: 450, mapY: 270, color: '#3b82f6', category: 'navy',
    forSale: ['Light Neutron Blaster I', '150mm Railgun I', 'Rocket Launcher I', 'Miner I', 'Small Shield Booster I', 'Small Armor Repairer I', 'Shield Recharger I', 'Damage Control I', 'Afterburner I', 'Overdrive Injector System I', 'Nanofiber Internal Structure I', 'Magnetic Field Stabilizer I', 'Tracking Enhancer I', 'Cargo Scanner I'],
    shipsForSale: ['Ibis', 'Velator', 'Atron', 'Tristan', 'Ferox']
  },  // 2 - Navy station, Gallente ships
  { 
    name: 'Rens', security: 0.9, gates: [1, 7], 
    station: { x: 10000, y: 10000, name: 'Rens VI - Moon 8 - Brutor Tribe Treasury' }, 
    mapX: 240, mapY: 290, color: '#f59e0b', category: 'treasury',
    forSale: ['200mm AutoCannon I', '125mm Railgun I', 'Rocket Launcher I', 'Miner I', 'Small Shield Extender I', 'Shield Recharger I', 'Damage Control I', 'Overdrive Injector System I', 'Afterburner I', 'Capacitor Battery I', 'Tracking Enhancer I'],
    shipsForSale: ['Ibis', 'Velator', 'Rifter', 'Atron']
  },         // 3 - Minmatar hub, Rifter focus
  { 
    name: 'Hek', security: 0.8, gates: [2, 8], 
    station: { x: 10000, y: 10000, name: 'Hek VIII - Moon 12 - Boundless Creation' }, 
    mapX: 520, mapY: 230, color: '#06b6d4', category: 'industrial',
    forSale: ['Miner I', 'Miner II', '125mm Railgun I', '200mm AutoCannon I', 'Small Shield Extender I', 'Damage Control I', 'Overdrive Injector System I', 'Nanofiber Internal Structure I', 'Capacitor Recharger I', 'Cargo Scanner I', 'Expanded Cargohold I'],
    shipsForSale: ['Ibis', 'Velator', 'Atron', 'Rifter']
  },           // 4 - Industrial, starter ships only
  { 
    name: 'Perimeter', security: 0.9, gates: [1, 9], 
    station: { x: 10000, y: 10000, name: 'Perimeter Trading Hub' }, 
    mapX: 330, mapY: 350, color: '#10b981', category: 'trading',
    forSale: ['125mm Railgun I', 'Light Beam Laser I', 'Miner I', 'Small Shield Booster I', 'Small Shield Extender I', 'Damage Control I', 'Capacitor Battery I', 'Capacitor Recharger I', 'Micro Auxiliary Power Core I', 'Overdrive Injector System I', 'Cargo Scanner I', 'Expanded Cargohold I'],
    shipsForSale: ['Ibis', 'Velator', 'Atron', 'Tristan', 'Rifter', 'Ferox']
  },                       // 5 - Trading hub, good variety
  { 
    name: 'Oursulaert', security: 0.7, gates: [2, 10], 
    station: { x: 10000, y: 10000, name: 'Oursulaert VII - Moon 1' }, 
    mapX: 450, mapY: 340, color: '#8b5cf6', category: 'moon',
    forSale: ['Light Neutron Blaster I', '150mm Railgun I', 'Miner I', 'Small Armor Repairer I', 'Small Shield Booster I', 'Afterburner I', 'Damage Control I', 'Nanofiber Internal Structure I', 'Capacitor Recharger I'],
    shipsForSale: ['Ibis', 'Velator', 'Atron']
  },                   // 6 - Moon mining, basic ships
  { 
    name: 'Lustrevik', security: 0.6, gates: [3, 11], 
    station: { x: 10000, y: 10000, name: 'Lustrevik VII - Moon 9' }, 
    mapX: 170, mapY: 230, color: '#8b5cf6', category: 'moon',
    forSale: ['200mm AutoCannon I', '125mm Railgun I', 'Miner I', 'Small Shield Extender I', 'Damage Control I', 'Capacitor Battery I', 'Overdrive Injector System I'],
    shipsForSale: ['Ibis', 'Velator', 'Rifter']
  },                     // 7 - Remote moon station, basics
   
  // Low Security Space (0.1-0.4) - Middle ring branching out (8-13)
  { 
    name: 'Tama', security: 0.3, gates: [4, 12], 
    station: { x: 10000, y: 10000, name: 'Tama Outpost' }, 
    mapX: 600, mapY: 270, color: '#64748b', category: 'outpost',
    forSale: ['Light Neutron Blaster I', '150mm Railgun I', '200mm AutoCannon I', 'Small Shield Extender I', 'Small Armor Plate I', 'Afterburner I', 'Damage Control I', 'Overdrive Injector System I', 'Ballistic Control System I', 'Tracking Enhancer I'],
    shipsForSale: ['Ibis', 'Velator', 'Atron', 'Rifter']
  },                                    // 8 - Pirate outpost, combat ships only
  { 
    name: 'Amamake', security: 0.4, gates: [5, 13], 
    station: { x: 10000, y: 10000, name: 'Amamake II - Republic Fleet Assembly' }, 
    mapX: 300, mapY: 410, color: '#3b82f6', category: 'navy',
    forSale: ['200mm AutoCannon I', 'Rocket Launcher I', 'Light Neutron Blaster I', 'Small Shield Booster I', 'Small Armor Repairer I', 'Afterburner I', 'Damage Control I', 'Nanofiber Internal Structure I', 'Ballistic Control System I', 'Tracking Enhancer I'],
    shipsForSale: ['Ibis', 'Velator', 'Rifter', 'Ferox']
  },         // 9 - Fleet assembly, Minmatar ships
  { 
    name: 'Rancer', security: 0.4, gates: [6, 14], 
    station: { x: 10000, y: 10000, name: 'Rancer Trading Post' }, 
    mapX: 465, mapY: 410, color: '#10b981', category: 'trading',
    forSale: ['125mm Railgun I', 'Light Beam Laser I', 'Miner I', 'Small Shield Booster I', 'Damage Control I', 'Afterburner I', 'Capacitor Battery I', 'Overdrive Injector System I'],
    shipsForSale: ['Ibis', 'Velator', 'Atron']
  },                           // 10 - Lowsec trade post, basic ships
  { 
    name: 'Old Man Star', security: 0.3, gates: [7, 15], 
    station: { x: 10000, y: 10000, name: 'Old Man Star Station' }, 
    mapX: 100, mapY: 270, color: '#64748b', category: 'outpost',
    forSale: ['200mm AutoCannon I', 'Light Neutron Blaster I', 'Small Armor Plate I', 'Small Shield Extender I', 'Afterburner I', 'Damage Control I', 'Nanofiber Internal Structure I', 'Ballistic Control System I'],
    shipsForSale: ['Ibis', 'Velator', 'Rifter']
  },                    // 11 - Pirate haven, starter ships
  { 
    name: 'Egghelende', security: 0.2, gates: [8, 16], 
    station: { x: 10000, y: 10000, name: 'Egghelende VII - Moon 20' }, 
    mapX: 660, mapY: 360, color: '#8b5cf6', category: 'moon',
    forSale: ['150mm Railgun I', 'Rocket Launcher I', 'Miner II', 'Small Shield Booster I', 'Afterburner I', 'Damage Control I', 'Capacitor Recharger I'],
    shipsForSale: ['Ibis', 'Velator']
  },                  // 12 - Moon mining lowsec, only starter
  { 
    name: 'Huola', security: 0.3, gates: [9, 17], 
    station: { x: 10000, y: 10000, name: 'Huola Factional Warfare Base' }, 
    mapX: 350, mapY: 500, color: '#ef4444', category: 'military',
    forSale: ['Light Beam Laser I', '150mm Railgun I', 'Rocket Launcher I', 'Small Armor Repairer I', 'Small Armor Plate I', 'Afterburner I', 'Damage Control I', 'Adaptive Nano Plating I', 'Heat Sink I', 'Ballistic Control System I'],
    shipsForSale: ['Ibis', 'Velator', 'Atron', 'Tristan', 'Ferox']
  },                   // 13 - Military base, combat ships
  
  // Null Security Space (0.0) - Outer edge (14-19)
  { 
    name: 'NOL-M9', security: 0.0, gates: [10, 12, 16], 
    station: { x: 10000, y: 10000, name: 'NOL-M9 Outpost' }, 
    mapX: 550, mapY: 390, color: '#64748b', category: 'outpost',
    forSale: ['Light Neutron Blaster I', '200mm AutoCannon I', 'Small Armor Plate I', 'Afterburner I', 'Damage Control I', 'Nanofiber Internal Structure I', 'Magnetic Field Stabilizer I'],
    shipsForSale: ['Ibis', 'Velator']
  },                               // 14 - Null outpost, starter only
  { 
    name: 'VFK-IV', security: 0.0, gates: [11, 18, 19], 
    station: { x: 10000, y: 10000, name: 'VFK-IV Sovereignty Station' }, 
    mapX: 50, mapY: 320, color: '#dc2626', category: 'sovereignty',
    forSale: ['150mm Railgun I', 'Rocket Launcher I', 'Small Shield Extender I', 'Small Armor Plate I', 'Afterburner I', 'Damage Control I', 'Overdrive Injector System I'],
    shipsForSale: ['Ibis', 'Velator', 'Rifter']
  },                    // 15 - Sovereignty, limited ships
  { 
    name: '1DQ1-A', security: 0.0, gates: [12, 14, 17], 
    station: { x: 10000, y: 10000, name: '1DQ1-A Keepstar' }, 
    mapX: 590, mapY: 460, color: '#fbbf24', category: 'citadel',
    forSale: ['Light Neutron Blaster I', '150mm Railgun I', 'Rocket Launcher I', 'Miner II', 'Small Shield Booster I', 'Small Armor Repairer I', 'Afterburner I', 'Damage Control I', 'Ballistic Control System I', 'Tracking Enhancer I', 'Magnetic Field Stabilizer I'],
    shipsForSale: ['Ibis', 'Velator', 'Atron', 'Tristan', 'Rifter', 'Ferox', 'Apocalypse']
  },                              // 16 - Keepstar citadel, full selection
  { 
    name: 'Delve', security: 0.0, gates: [13, 16], 
    station: { x: 10000, y: 10000, name: 'Delve Mining Colony' }, 
    mapX: 470, mapY: 510, color: '#84cc16', category: 'mining',
    forSale: ['Miner I', 'Miner II', '125mm Railgun I', 'Small Shield Extender I', 'Damage Control I', 'Overdrive Injector System I', 'Nanofiber Internal Structure I', 'Capacitor Recharger I', 'Expanded Cargohold I'],
    shipsForSale: ['Ibis', 'Velator', 'Atron']
  },                           // 17 - Mining colony, basic ships
  { 
    name: 'Fountain', security: 0.0, gates: [15, 19], 
    station: { x: 10000, y: 10000, name: 'Fountain Logistics Hub' }, 
    mapX: 200, mapY: 380, color: '#06b6d4', category: 'logistics',
    forSale: ['125mm Railgun I', '200mm AutoCannon I', 'Miner I', 'Small Shield Booster I', 'Afterburner I', 'Damage Control I', 'Capacitor Battery I', 'Overdrive Injector System I', 'Expanded Cargohold I'],
    shipsForSale: ['Ibis', 'Velator']
  },                     // 18 - Logistics hub, starter only
  { 
    name: 'Catch', security: 0.0, gates: [15, 18], 
    station: { x: 10000, y: 10000, name: 'Catch Staging Point' }, 
    mapX: 100, mapY: 420, color: '#f97316', category: 'staging',
    forSale: ['200mm AutoCannon I', 'Rocket Launcher I', 'Small Armor Plate I', 'Small Shield Extender I', 'Afterburner I', 'Damage Control I', 'Ballistic Control System I'],
    shipsForSale: ['Ibis', 'Velator', 'Rifter', 'Ferox']
  }                            // 19 - Staging area, combat ships
];

// Helper function to get random ore type based on security
function getRandomOreType(security){
  // Higher security = more common ores
  const roll = Math.random();
  if(security > 0.5){
    if(roll < 0.7) return 'Veldspar';
    if(roll < 0.9) return 'Scordite';
    return 'Pyroxeres';
  } else if(security > 0.2){
    if(roll < 0.4) return 'Veldspar';
    if(roll < 0.65) return 'Scordite';
    if(roll < 0.85) return 'Pyroxeres';
    if(roll < 0.95) return 'Plagioclase';
    return 'Omber';
  } else {
    if(roll < 0.2) return 'Veldspar';
    if(roll < 0.4) return 'Scordite';
    if(roll < 0.6) return 'Pyroxeres';
    if(roll < 0.8) return 'Plagioclase';
    if(roll < 0.95) return 'Omber';
    return 'Kernite';
  }
}
