// systems.js - Star system definitions and points of interest

// System configuration data
const SYSTEM_DATA = [
  // High Security Space (≥0.5) - Central hub triangle (0-7)
  { name: 'Jita', security: 1.0, gates: [1, 2], station: { x: 10000, y: 10000, name: 'Jita IV - Caldari Navy Assembly Plant' }, mapX: 380, mapY: 200, color: '#3b82f6', category: 'navy' },            // 0
  { name: 'Amarr', security: 1.0, gates: [0, 2, 3, 5], station: { x: 10000, y: 10000, name: 'Amarr VIII - Emperor Family Academy' }, mapX: 310, mapY: 270, color: '#a855f7', category: 'academy' },       // 1
  { name: 'Dodixie', security: 0.9, gates: [0, 1, 4, 6], station: { x: 10000, y: 10000, name: 'Dodixie IX - Moon 20 - Federation Navy' }, mapX: 450, mapY: 270, color: '#3b82f6', category: 'navy' },  // 2
  { name: 'Rens', security: 0.9, gates: [1, 7], station: { x: 10000, y: 10000, name: 'Rens VI - Moon 8 - Brutor Tribe Treasury' }, mapX: 240, mapY: 290, color: '#f59e0b', category: 'treasury' },         // 3
  { name: 'Hek', security: 0.8, gates: [2, 8], station: { x: 10000, y: 10000, name: 'Hek VIII - Moon 12 - Boundless Creation' }, mapX: 520, mapY: 230, color: '#06b6d4', category: 'industrial' },           // 4
  { name: 'Perimeter', security: 0.9, gates: [1, 9], station: { x: 10000, y: 10000, name: 'Perimeter Trading Hub' }, mapX: 330, mapY: 350, color: '#10b981', category: 'trading' },                       // 5
  { name: 'Oursulaert', security: 0.7, gates: [2, 10], station: { x: 10000, y: 10000, name: 'Oursulaert VII - Moon 1' }, mapX: 450, mapY: 340, color: '#8b5cf6', category: 'moon' },                   // 6
  { name: 'Lustrevik', security: 0.6, gates: [3, 11], station: { x: 10000, y: 10000, name: 'Lustrevik VII - Moon 9' }, mapX: 170, mapY: 230, color: '#8b5cf6', category: 'moon' },                     // 7
   
  // Low Security Space (0.1-0.4) - Middle ring branching out (8-13)
  { name: 'Tama', security: 0.3, gates: [4, 12], station: { x: 10000, y: 10000, name: 'Tama Outpost' }, mapX: 600, mapY: 270, color: '#64748b', category: 'outpost' },                                    // 8
  { name: 'Amamake', security: 0.4, gates: [5, 13], station: { x: 10000, y: 10000, name: 'Amamake II - Republic Fleet Assembly' }, mapX: 300, mapY: 410, color: '#3b82f6', category: 'navy' },         // 9
  { name: 'Rancer', security: 0.4, gates: [6, 14], station: { x: 10000, y: 10000, name: 'Rancer Trading Post' }, mapX: 465, mapY: 410, color: '#10b981', category: 'trading' },                           // 10
  { name: 'Old Man Star', security: 0.3, gates: [7, 15], station: { x: 10000, y: 10000, name: 'Old Man Star Station' }, mapX: 100, mapY: 270, color: '#64748b', category: 'outpost' },                    // 11
  { name: 'Egghelende', security: 0.2, gates: [8, 16], station: { x: 10000, y: 10000, name: 'Egghelende VII - Moon 20' }, mapX: 660, mapY: 360, color: '#8b5cf6', category: 'moon' },                  // 12
  { name: 'Huola', security: 0.3, gates: [9, 17], station: { x: 10000, y: 10000, name: 'Huola Factional Warfare Base' }, mapX: 350, mapY: 500, color: '#ef4444', category: 'military' },                   // 13 
  
  // Null Security Space (0.0) - Outer edge (14-19)
  { name: 'NOL-M9', security: 0.0, gates: [10, 12, 16], station: { x: 10000, y: 10000, name: 'NOL-M9 Outpost' }, mapX: 550, mapY: 390, color: '#64748b', category: 'outpost' },                               // 14
  { name: 'VFK-IV', security: 0.0, gates: [11, 18, 19], station: { x: 10000, y: 10000, name: 'VFK-IV Sovereignty Station' }, mapX: 50, mapY: 320, color: '#dc2626', category: 'sovereignty' },                    // 15
  { name: '1DQ1-A', security: 0.0, gates: [12, 14, 17], station: { x: 10000, y: 10000, name: '1DQ1-A Keepstar' }, mapX: 590, mapY: 460, color: '#fbbf24', category: 'citadel' },                              // 16
  { name: 'Delve', security: 0.0, gates: [13, 16], station: { x: 10000, y: 10000, name: 'Delve Mining Colony' }, mapX: 470, mapY: 510, color: '#84cc16', category: 'mining' },                           // 17
  { name: 'Fountain', security: 0.0, gates: [15, 19], station: { x: 10000, y: 10000, name: 'Fountain Logistics Hub' }, mapX: 200, mapY: 380, color: '#06b6d4', category: 'logistics' },                     // 18
  { name: 'Catch', security: 0.0, gates: [15, 18], station: { x: 10000, y: 10000, name: 'Catch Staging Point' }, mapX: 100, mapY: 420, color: '#f97316', category: 'staging' }                            // 19
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
