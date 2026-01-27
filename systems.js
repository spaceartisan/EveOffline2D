// systems.js - Star system definitions and points of interest

// System configuration data
const SYSTEM_DATA = [
  // High Security Space (≥0.5) - Central hub triangle
  { name: 'Jita', security: 1.0, gates: [1, 2], station: { x: 10000, y: 10000, name: 'Jita IV - Caldari Navy Assembly Plant' }, mapX: 380, mapY: 200 },
  { name: 'Amarr', security: 1.0, gates: [0, 3, 5], station: { x: 10000, y: 10000, name: 'Amarr VIII - Emperor Family Academy' }, mapX: 310, mapY: 270 },
  { name: 'Dodixie', security: 0.9, gates: [0, 4, 6], station: { x: 10000, y: 10000, name: 'Dodixie IX - Moon 20 - Federation Navy' }, mapX: 450, mapY: 270 },
  { name: 'Rens', security: 0.9, gates: [1, 7], station: { x: 10000, y: 10000, name: 'Rens VI - Moon 8 - Brutor Tribe Treasury' }, mapX: 240, mapY: 270 },
  { name: 'Hek', security: 0.8, gates: [2, 8], station: { x: 10000, y: 10000, name: 'Hek VIII - Moon 12 - Boundless Creation' }, mapX: 520, mapY: 270 },
  { name: 'Perimeter', security: 0.9, gates: [1, 9], station: { x: 10000, y: 10000, name: 'Perimeter Trading Hub' }, mapX: 310, mapY: 340 },
  { name: 'Oursulaert', security: 0.7, gates: [2, 10], station: { x: 10000, y: 10000, name: 'Oursulaert VII - Moon 1' }, mapX: 450, mapY: 340 },
  { name: 'Lustrevik', security: 0.6, gates: [3, 11], station: { x: 10000, y: 10000, name: 'Lustrevik VII - Moon 9' }, mapX: 170, mapY: 270 },
  
  // Low Security Space (0.1-0.4) - Middle ring branching out
  { name: 'Tama', security: 0.3, gates: [4, 7, 12], station: { x: 10000, y: 10000, name: 'Tama Outpost' }, mapX: 590, mapY: 270 },
  { name: 'Amamake', security: 0.4, gates: [5, 13], station: { x: 10000, y: 10000, name: 'Amamake II - Republic Fleet Assembly' }, mapX: 310, mapY: 410 },
  { name: 'Rancer', security: 0.4, gates: [6, 14], station: { x: 10000, y: 10000, name: 'Rancer Trading Post' }, mapX: 450, mapY: 410 },
  { name: 'Old Man Star', security: 0.3, gates: [7, 15], station: { x: 10000, y: 10000, name: 'Old Man Star Station' }, mapX: 100, mapY: 270 },
  { name: 'Egghelende', security: 0.2, gates: [8, 16], station: { x: 10000, y: 10000, name: 'Egghelende VII - Moon 20' }, mapX: 660, mapY: 270 },
  { name: 'Huola', security: 0.3, gates: [9, 17], station: { x: 10000, y: 10000, name: 'Huola Factional Warfare Base' }, mapX: 310, mapY: 480 },
  
  // Null Security Space (0.0) - Outer edge
  { name: 'NOL-M9', security: 0.0, gates: [10, 12], station: { x: 10000, y: 10000, name: 'NOL-M9 Outpost' }, mapX: 550, mapY: 340 },
  { name: 'VFK-IV', security: 0.0, gates: [11, 19], station: { x: 10000, y: 10000, name: 'VFK-IV Sovereignty Station' }, mapX: 50, mapY: 320 },
  { name: '1DQ1-A', security: 0.0, gates: [12, 14], station: { x: 10000, y: 10000, name: '1DQ1-A Keepstar' }, mapX: 660, mapY: 340 },
  { name: 'Delve', security: 0.0, gates: [13, 16], station: { x: 10000, y: 10000, name: 'Delve Mining Colony' }, mapX: 380, mapY: 480 },
  { name: 'Fountain', security: 0.0, gates: [15, 19], station: { x: 10000, y: 10000, name: 'Fountain Logistics Hub' }, mapX: 200, mapY: 380 },
  { name: 'Catch', security: 0.0, gates: [15, 18], station: { x: 10000, y: 10000, name: 'Catch Staging Point' }, mapX: 100, mapY: 420 }
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
