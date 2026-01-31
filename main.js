// EVE Online 2D - Vanilla JS Edition
(function(){
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();

  // Utility
  const rand = (a,b)=>Math.random()*(b-a)+a;
  const dist = (a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

  // === Sound System ===
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const sounds = {
    enabled: true,
    masterVolume: 1.0,
    sfxVolume: 0.3,
    bgmVolume: 0.3,
    
    // Thrust sound (looping) - using HTML5 Audio
    thrustAudio: null,
    isThrustPlaying: false,
    
    // Initialize thrust audio
    initThrustAudio() {
      if(!this.thrustAudio) {
        this.thrustAudio = new Audio('sfx/thrust.mp3');
        this.thrustAudio.loop = true;
      }
    },
    
    playThrust() {
      if(!this.enabled || this.isThrustPlaying) return;
      
      this.initThrustAudio();
      this.thrustAudio.volume = this.sfxVolume * this.masterVolume;
      this.thrustAudio.play().catch(e => console.log('Thrust audio play prevented:', e));
      this.isThrustPlaying = true;
    },
    
    stopThrust() {
      if(!this.isThrustPlaying || !this.thrustAudio) return;
      
      this.thrustAudio.pause();
      this.thrustAudio.currentTime = 0;
      this.isThrustPlaying = false;
    },
    
    playWeaponFire() {
      if(!this.enabled) return;
      
      // Laser blast sound
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 800;
      osc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
      
      gain.gain.value = this.sfxVolume * this.masterVolume * 0.15;
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start();
      osc.stop(audioContext.currentTime + 0.1);
    },
    
    playExplosion() {
      if(!this.enabled) return;
      
      // Explosion: noise burst + low boom
      const bufferSize = audioContext.sampleRate * 0.5;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate noise with decay
      for(let i = 0; i < bufferSize; i++) {
        const decay = 1 - (i / bufferSize);
        data[i] = (Math.random() * 2 - 1) * decay;
      }
      
      const noise = audioContext.createBufferSource();
      noise.buffer = buffer;
      
      const noiseGain = audioContext.createGain();
      noiseGain.gain.value = this.sfxVolume * this.masterVolume * 0.3;
      noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      
      // Low frequency boom
      const boom = audioContext.createOscillator();
      const boomGain = audioContext.createGain();
      
      boom.type = 'sine';
      boom.frequency.value = 60;
      boom.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.3);
      
      boomGain.gain.value = this.sfxVolume * this.masterVolume * 0.4;
      boomGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      
      noise.connect(noiseGain);
      noiseGain.connect(audioContext.destination);
      
      boom.connect(boomGain);
      boomGain.connect(audioContext.destination);
      
      noise.start();
      boom.start();
      
      noise.stop(audioContext.currentTime + 0.5);
      boom.stop(audioContext.currentTime + 0.5);
    },
    
    playMiningLaser() {
      if(!this.enabled) return;
      
      // Mining laser beam sound
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'square';
      osc.frequency.value = 300;
      
      gain.gain.value = this.sfxVolume * this.masterVolume * 0.08;
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start();
      osc.stop(audioContext.currentTime + 0.2);
    },
    
    playGateJump() {
      if(!this.enabled) return;
      
      // Gate jump: whoosh + energy surge
      const osc1 = audioContext.createOscillator();
      const osc2 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      const gain2 = audioContext.createGain();
      
      // Low frequency whoosh
      osc1.type = 'sine';
      osc1.frequency.value = 150;
      osc1.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.8);
      
      gain1.gain.value = this.sfxVolume * this.masterVolume * 0.25;
      gain1.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
      
      // High frequency energy surge
      osc2.type = 'triangle';
      osc2.frequency.value = 400;
      osc2.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.4);
      osc2.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.8);
      
      gain2.gain.value = this.sfxVolume * this.masterVolume * 0.15;
      gain2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
      
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      
      osc1.start();
      osc2.start();
      
      osc1.stop(audioContext.currentTime + 0.8);
      osc2.stop(audioContext.currentTime + 0.8);
    },
    
    playWarpEnter() {
      if(!this.enabled) return;
      
      // Warp activation: rising pitch with echo effect
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 100;
      osc.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 1.5);
      
      gain.gain.value = this.sfxVolume * this.masterVolume * 0.2;
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start();
      osc.stop(audioContext.currentTime + 1.5);
    },
    
    playWarpExit() {
      if(!this.enabled) return;
      
      // Warp deactivation: falling pitch
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 2000;
      osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.8);
      
      gain.gain.value = this.sfxVolume * this.masterVolume * 0.2;
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start();
      osc.stop(audioContext.currentTime + 0.8);
    },
    
    // Gate warmup sound
    gateWarmupNode: null,
    gateWarmupGain: null,
    isGateWarmupPlaying: false,
    
    playGateWarmup() {
      if(!this.enabled || this.isGateWarmupPlaying) return;
      
      // Create building power-up sound
      this.gateWarmupNode = audioContext.createOscillator();
      this.gateWarmupGain = audioContext.createGain();
      
      this.gateWarmupNode.type = 'sawtooth';
      this.gateWarmupNode.frequency.value = 60; // Start low
      // Rise to higher pitch over 10 seconds
      this.gateWarmupNode.frequency.exponentialRampToValueAtTime(180, audioContext.currentTime + 10);
      
      this.gateWarmupGain.gain.value = 0.001;
      // Gradually increase volume
      this.gateWarmupGain.gain.exponentialRampToValueAtTime(this.sfxVolume * this.masterVolume * 0.15, audioContext.currentTime + 10);
      
      this.gateWarmupNode.connect(this.gateWarmupGain);
      this.gateWarmupGain.connect(audioContext.destination);
      
      this.gateWarmupNode.start();
      this.isGateWarmupPlaying = true;
    },
    
    stopGateWarmup() {
      if(!this.isGateWarmupPlaying || !this.gateWarmupNode) return;
      
      this.gateWarmupGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      this.gateWarmupNode.stop(audioContext.currentTime + 0.1);
      this.isGateWarmupPlaying = false;
      this.gateWarmupNode = null;
      this.gateWarmupGain = null;
    }
  };

  // Game data - EVE-like ship with shields, armor, hull, capacitor
  class Ship{
    constructor(templateName = 'Velator'){ 
      // Get ship stats from template
      const stats = createShipFromTemplate(templateName);
      if(!stats) {
        console.error('Failed to create ship, using defaults');
        // Fallback to basic stats
        stats = createShipFromTemplate('Velator');
      }
      
      // Position
      this.x=10000; this.y=10000; 
      this.vx=0; this.vy=0; 
      this.angle=0;
      
      // Ship identity
      this.shipClass = stats.shipClass;
      this.shipName = stats.shipName;
      this.shipDescription = stats.shipDescription;
      this.shipFaction = stats.shipFaction || 'None';
      
      // Movement
      this.maxSpeed = stats.maxSpeed;
      this.sublightSpeed = stats.sublightSpeed;
      this.warpSpeed = 30; // Keep warp speed high for gameplay
      this.accel = stats.accel;
      this.turnRate = stats.turnRate;
      this.drag = stats.drag;
      this.isWarping=false;
      this.warpTarget=null;
      this.warpWarmup=0;
      this.jumpWarmup=0;
      this.jumpDestination=null;
      this.jumpFlashTimer=0;
      this.autoJump=false;
      
      // Defense layers
      this.shield = stats.shield;
      this.maxShield = stats.maxShield;
      this.shieldRegen = stats.shieldRegen;
      this.armor = stats.armor;
      this.maxArmor = stats.maxArmor;
      this.hull = stats.hull;
      this.maxHull = stats.maxHull;
      
      // Offense
      this.dmg = stats.dmg;
      this.fireRate = stats.fireRate;
      this.fireCooldown = stats.fireCooldown;
      this.maxRange = stats.maxRange;
      
      // Mining
      this.miningCooldown = stats.miningCooldown;
      
      // Resources
      this.cap = stats.cap;
      this.maxCap = stats.maxCap;
      this.capRegen = stats.capRegen;
      this.cargoItems = []; // Array of items in cargo
      this.cargoCap = stats.cargoCap;
      this.cargoUsed = 0; // Track current cargo space used
      
      // Economy (persistent across ship changes)
      this.credits = 500000000; // Starting credits
      
      // Fitting system - slot-based
      this.highSlots = []; // Array of fitted items in high slots
      this.mediumSlots = []; // Array of fitted items in medium slots
      this.lowSlots = []; // Array of fitted items in low slots
      this.highSlotsMax = stats.highSlotsMax;
      this.mediumSlotsMax = stats.mediumSlotsMax;
      this.lowSlotsMax = stats.lowSlotsMax;
      this.powergridUsed = 0;
      this.cpuUsed = 0;
      this.powergridTotal = 50; // Default fitting resources
      this.cpuTotal = 100;
      
      // Active module states (for medium and low slots)
      this.activeModuleStates = {
        medium: [],
        low: []
      };
      
      // Anomaly state
      this.inAnomaly = false;
      this.currentAnomaly = null;
      this.anomalyBackup = null; // Store position before entering anomaly
      
      // Commands
      this.targetCommand=null;
    }
  }

  class Asteroid{ 
    constructor(x,y,amt,oreType='Veldspar'){
      this.x=x;this.y=y;this.amount=amt;
      this.maxAmount=amt;
      this.radius=8+Math.sqrt(amt/10);
      this.id=Math.random().toString(36).substr(2,9);
      this.oreType=oreType;
      
      // Generate irregular shape for realistic rocky appearance
      // Creates 8-12 random points around the asteroid for jagged edges
      this.shapePoints = [];
      const numPoints = 8 + Math.floor(Math.random() * 5);
      for(let i = 0; i < numPoints; i++){
        const angle = (i / numPoints) * Math.PI * 2;
        const radiusVar = this.radius * (0.7 + Math.random() * 0.5); // Random radius variance
        this.shapePoints.push({
          angle: angle,
          dist: radiusVar
        });
      }
      
      // Add surface detail (craters and bumps) for visual depth
      this.craters = [];
      const numCraters = 2 + Math.floor(Math.random() * 3);
      for(let i = 0; i < numCraters; i++){
        this.craters.push({
          angle: Math.random() * Math.PI * 2,
          dist: this.radius * (0.3 + Math.random() * 0.4),
          size: this.radius * (0.15 + Math.random() * 0.15)
        });
      }
      
      this.rotation = Math.random() * Math.PI * 2;
    } 
  }

  class NPC{ 
    constructor(x,y){
      this.x=x;this.y=y;
      this.vx=rand(-0.3,0.3);this.vy=rand(-0.3,0.3);
      this.angle=rand(0,Math.PI*2);
      this.shield=50;this.maxShield=50;
      this.armor=30;this.maxArmor=30;
      this.hull=20;this.maxHull=20;
      this.type='pirate';
      this.fireCooldown=0;
      this.maxRange=500;
      this.id=Math.random().toString(36).substr(2,9);
    } 
  }

  class Stargate{
    constructor(x,y,destSystem,name,color='#22d3ee'){
      this.x=x; this.y=y;
      this.destSystem=destSystem;
      this.name=name;
      this.radius=40;
      this.id=Math.random().toString(36).substr(2,9);
      this.color=color;
    }
  }

  class Station{
    constructor(x,y,name,color='#3b82f6',category='outpost'){
      this.x=x; this.y=y;
      this.name=name;
      this.radius=60;
      this.id=Math.random().toString(36).substr(2,9);
      this.inventory = []; // Station storage inventory
      this.color=color;
      this.category=category;
    }
  }

  class Wreck{
    constructor(x,y,name='Wreckage'){
      this.x=x; this.y=y;
      this.name=name;
      this.radius=15;
      this.id=Math.random().toString(36).substr(2,9);
      this.cargo = []; // Lootable items
      this.despawnTimer = 18000; // 5 minutes until despawn (300 seconds * 60 ticks/sec)
    }
  }

  class System{
    constructor(name,security){ 
      this.name=name; this.security=security; 
      this.asteroids=[]; this.npcs=[]; this.stargates=[]; this.stations=[]; this.wrecks=[];
      this.market={ore:Math.round(rand(10,20))}; 
      this.gates=[]; 
      this.width=20000; this.height=20000;
      this.stars=[]; // Background stars
      this.nebulas=[]; // Background nebulas
      this.mapX = 0; // Star map X position
      this.mapY = 0; // Star map Y position
      this.forSale = []; // Items for sale at station
      this.shipsForSale = []; // Ships for sale at station
      this.anomalies = []; // Cosmic anomalies in system
      this.anomalyRespawnQueue = []; // Completed anomalies waiting to respawn
    }
  }

  // Function to calculate static star map positions using force-directed layout
  function calculateStarMapPositions() {
    const centerX = 380;
    const centerY = 250;
    
    // Initialize positions based on security status
    const systemPositions = systems.map((sys, idx) => {
      let regionX, regionY;
      if(sys.security >= 0.5) {
        // High-sec: center cluster
        regionX = centerX + (Math.random() - 0.5) * 80;
        regionY = centerY + (Math.random() - 0.5) * 60;
      } else if(sys.security >= 0.1) {
        // Low-sec: middle ring
        const angle = Math.random() * Math.PI * 2;
        regionX = centerX + Math.cos(angle) * 80;
        regionY = centerY + Math.sin(angle) * 60;
      } else {
        // Null-sec: outer ring
        const angle = Math.random() * Math.PI * 2;
        regionX = centerX + Math.cos(angle) * 120;
        regionY = centerY + Math.sin(angle) * 80;
      }
      
      return {
        x: regionX,
        y: regionY,
        vx: 0,
        vy: 0,
        system: sys,
        index: idx
      };
    });
    
    // Run force-directed layout simulation
    const iterations = 100;
    const attractionStrength = 0.01;
    const repulsionStrength = 300;
    const damping = 0.8;
    
    for(let iter = 0; iter < iterations; iter++){
      // Apply forces
      systemPositions.forEach((pos, i) => {
        let fx = 0, fy = 0;
        
        // Attraction to connected systems
        systems[i].gates.forEach(gateIdx => {
          const other = systemPositions[gateIdx];
          const dx = other.x - pos.x;
          const dy = other.y - pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if(distance > 0){
            const force = distance * attractionStrength;
            fx += (dx / distance) * force;
            fy += (dy / distance) * force;
          }
        });
        
        // Repulsion from all systems
        systemPositions.forEach((other, j) => {
          if(i !== j){
            const dx = pos.x - other.x;
            const dy = pos.y - other.y;
            const distSq = dx * dx + dy * dy;
            if(distSq > 0){
              const force = repulsionStrength / distSq;
              fx += (dx / Math.sqrt(distSq)) * force;
              fy += (dy / Math.sqrt(distSq)) * force;
            }
          }
        });
        
        // Gentle pull toward center to keep things bounded
        const centerPull = 0.002;
        fx += (centerX - pos.x) * centerPull;
        fy += (centerY - pos.y) * centerPull;
        
        // Apply velocity
        pos.vx = (pos.vx + fx) * damping;
        pos.vy = (pos.vy + fy) * damping;
      });
      
      // Update positions
      systemPositions.forEach(pos => {
        pos.x += pos.vx;
        pos.y += pos.vy;
        
        // Keep within bounds with padding
        pos.x = Math.max(30, Math.min(730, pos.x));
        pos.y = Math.max(30, Math.min(470, pos.y));
      });
    }
    
    // Store final positions in system objects
    systemPositions.forEach((pos, idx) => {
      systems[idx].mapX = pos.x;
      systems[idx].mapY = pos.y;
    });
  }
  
  // Create systems using data from systems.js
  const systems = [];
  
  // Create System objects
  SYSTEM_DATA.forEach((data, idx) => {
    const sys = new System(data.name, data.security);
    sys.gates = data.gates;
    sys.mapX = data.mapX || 380; // Use static position from data, or default to center
    sys.mapY = data.mapY || 250;
    sys.forSale = data.forSale || []; // Copy forSale list
    sys.shipsForSale = data.shipsForSale || []; // Copy shipsForSale list
    systems.push(sys);
  });
  
  // Add physical stargates to each system
  SYSTEM_DATA.forEach((data, idx) => {
    const sys = systems[idx];
    
    // Position gates around the system based on number of connections
    data.gates.forEach((destIdx, gateNum) => {
      const destSystem = SYSTEM_DATA[destIdx];
      const angle = (gateNum / data.gates.length) * Math.PI * 2;
      const distance = 7000;
      const x = 10000 + Math.cos(angle) * distance;
      const y = 10000 + Math.sin(angle) * distance;
      
      sys.stargates.push(new Stargate(x, y, destIdx, `Gate to ${destSystem.name}`, destSystem.color));
    });
    
    // Add station
    if (data.station) {
      sys.stations.push(new Station(data.station.x, data.station.y, data.station.name, data.color, data.category));
    }
  });
  
  // Populate all systems with asteroids, NPCs, and background stars
  systems.forEach((sys, idx) => {
    const sec = sys.security;
    
    // Asteroid count: more in null-sec
    const baseAsteroids = 8;
    const secModifier = sec >= 0.5 ? 0 : (sec >= 0.1 ? 4 : 8);
    const astCount = baseAsteroids + secModifier;
    
    // NPC count: more in low/null-sec
    const npcCount = sec >= 0.5 ? Math.floor(Math.random() * 3) + 1 : 
                     sec >= 0.1 ? Math.floor(Math.random() * 5) + 3 : 
                     Math.floor(Math.random() * 8) + 5;
    
    // Generate background stars
    const starCount = 10000;
    for (let i = 0; i < starCount; i++) {
      sys.stars.push({
        x: rand(0, sys.width),
        y: rand(0, sys.height),
        size: Math.random() * 1.5 + 0.5,
        brightness: Math.random() * 0.6 + 0.4,
        twinkle: Math.random() * Math.PI * 2
      });
    }
    
    // Generate nebulas (fewer, larger, colorful clouds)
    const nebulaCount = Math.floor(Math.random() * 3) + 2; // 2-4 nebulas per system
    const nebulaColors = [
      { r: 138, g: 43, b: 226 },  // Blue-violet
      { r: 255, g: 20, b: 147 },  // Deep pink
      { r: 0, g: 191, b: 255 },   // Deep sky blue
      { r: 255, g: 69, b: 0 },    // Red-orange
      { r: 50, g: 205, b: 50 },   // Lime green
      { r: 148, g: 0, b: 211 }    // Dark violet
    ];
    
    for (let i = 0; i < nebulaCount; i++) {
      const color = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
      sys.nebulas.push({
        x: rand(0, sys.width),
        y: rand(0, sys.height),
        size: rand(800, 2000), // Large clouds
        color: color,
        opacity: Math.random() * 0.15 + 0.05, // Very transparent (0.05-0.2)
        drift: Math.random() * Math.PI * 2 // For subtle animation
      });
    }
    
    // Add asteroids
    for (let i = 0; i < astCount; i++) {
      const oreType = getRandomOreType(sec);
      const amount = Math.round(rand(100, 800));
      sys.asteroids.push(new Asteroid(
        rand(3000, 17000),
        rand(3000, 17000),
        amount,
        oreType
      ));
    }
    
    // Add NPCs
    for (let i = 0; i < npcCount; i++) {
      sys.npcs.push(new NPC(
        rand(3000, 17000),
        rand(3000, 17000)
      ));
    }
    
    // Generate cosmic anomalies (max 4 for unique pocket locations)
    const anomalyCount = Math.min(4, sec >= 0.5 ? Math.floor(Math.random() * 2) + 2 :    // High-sec: 2-3
                         sec >= 0.1 ? Math.floor(Math.random() * 3) + 2 :    // Low-sec: 2-4
                         4);                                                  // Null-sec: always 4
    
    // Pocket coordinates for each anomaly slot
    const pocketCoords = [
      {x: 10000, y: -40000},
      {x: -40000, y: 10000},
      {x: 10000, y: 50000},
      {x: 50000, y: 10000}
    ];
    
    for (let i = 0; i < anomalyCount; i++) {
      // Select random anomaly type
      const typeKeys = Object.keys(ANOMALY_TYPES);
      const randomType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
      const anomalyData = ANOMALY_TYPES[randomType];
      
      // Some anomalies start pre-discovered
      const discovered = !anomalyData.requiresScanning || Math.random() < 0.3;
      
      sys.anomalies.push({
        id: Math.random().toString(36).substr(2, 9),
        typeName: randomType,
        type: anomalyData.type,
        name: anomalyData.name,
        category: anomalyData.type,
        difficulty: anomalyData.difficulty,
        discovered: discovered,
        x: rand(3000, 17000),  // Location in system for visual marker
        y: rand(3000, 17000),
        pocketX: pocketCoords[i].x,  // Unique pocket coordinates
        pocketY: pocketCoords[i].y,
        rewardClaimed: false
      });
    }
  });
  
  // Note: Static star map positions are now loaded from systems.js data

  let current = 0;
  const player = new Ship('Velator'); // Start with basic frigate
  const playerHangar = ['Velator']; // Track owned ships
  
  // Give player a starting Miner I in cargo
  const minerModule = getWeaponModule('Miner I');
  addToInventory(player.cargoItems, {
    ...minerModule,
    type: 'weapon',
    name: 'Miner I',
    size: 0.1
  });
  
  let selectedTarget = null;
  let autoFire = false;
  let autoMine = false;
  let showGrid = true;
  const fireEffects = []; // Visual effects for weapon firing
  const camera = {x:0, y:0};
  let lastTargetId = null;
  let lastNearStation = false;

  // DOM refs
  const cargo = document.getElementById('cargo');
  const stationInventoryEl = document.getElementById('stationInventory');
  const marketEl = document.getElementById('market');
  const hangarEl = document.getElementById('hangar');
  const fittingEl = document.getElementById('fitting');
  const shopEl = document.getElementById('shop');
  const anomalyScannerEl = document.getElementById('anomalyScanner');
  const anomalyExitPanel = document.getElementById('anomalyExitPanel');
  const anomalyExitInfo = document.getElementById('anomalyExitInfo');
  const exitAnomalyBtn = document.getElementById('exitAnomalyBtn');
  const bgm = document.getElementById('bgm');
  const sidePanel = document.getElementById('sidePanel');
  
  // Canvas UI button tracking
  let canvasButtons = [];
  
  // Collapse states
  let overviewCollapsed = false;
  let sidePanelCollapsed = false;
  
  // Tactical overview scroll
  let overviewScrollOffset = 0;

  // Start background music on first user interaction
  let musicStarted = false;
  function startMusic(){
    if(!musicStarted){
      bgm.volume = sounds.bgmVolume * sounds.masterVolume;
      bgm.play().catch(e => console.log('Audio play prevented:', e));
      musicStarted = true;
    }
  }

  // Controls
  const keys = {};
  
  // ===== KEYBOARD SHORTCUTS =====
  // Get button references early so keyboard shortcuts can update button states
  const autoFireBtn = document.getElementById('autoFireBtn');
  const autoMineBtn = document.getElementById('autoMineBtn');
  
  // Toggle functions keep button UI and game state synchronized
  // These are called by both keyboard shortcuts and button clicks
  function toggleAutoFire(){
    autoFire = !autoFire;
    autoFireBtn.classList.toggle('active', autoFire);
    autoFireBtn.innerHTML = autoFire ? '🎯<br>Fire<br>ON' : '🎯<br>Fire';
  }
  
  function toggleAutoMine(){
    autoMine = !autoMine;
    autoMineBtn.classList.toggle('active', autoMine);
    autoMineBtn.innerHTML = autoMine ? '⛏️<br>Mine<br>ON' : '⛏️<br>Mine';
  }
  
  // Main keyboard event handler
  window.addEventListener('keydown', e=>{ 
    startMusic();
    keys[e.key.toLowerCase()]=true; 
    if(e.key===' ' || e.key==='w' || e.key==='a' || e.key==='s' || e.key==='d') e.preventDefault();
    
    // Toggle auto-fire with space bar (only on initial press, not repeats)
    if(e.key === ' ' && !e.repeat){
      e.preventDefault();
      toggleAutoFire();
    }
    
    // Toggle auto-mine with 'M' key (only on initial press, not repeats)
    if(e.key.toLowerCase() === 'm' && !e.repeat){
      e.preventDefault();
      toggleAutoMine();
    }
    
    // Toggle star map with 'N' key
    if(e.key.toLowerCase() === 'n'){
      e.preventDefault();
      if(starMapOpen){
        closeStarMap();
      } else {
        openStarMap();
      }
    }
    
    // Toggle anomaly window with 'P' key
    if(e.key.toLowerCase() === 'p' && !e.repeat){
      e.preventDefault();
      toggleAnomalyWindow();
    }
    
    // Toggle audio window with 'V' key
    if(e.key.toLowerCase() === 'v' && !e.repeat){
      e.preventDefault();
      toggleAudioWindow();
    }
  });
  window.addEventListener('keyup', e=>{ keys[e.key.toLowerCase()]=false; });

  // Side panel collapse toggle
  const sidePanelToggle = document.getElementById('sidePanelToggle');
  const sidePanelContent = document.getElementById('sidePanelContent');
  sidePanelToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    sidePanelCollapsed = !sidePanelCollapsed;
    if(sidePanelCollapsed){
      sidePanelContent.style.display = 'none';
      sidePanel.style.width = '40px';
      sidePanel.style.height = '35px';
      sidePanelToggle.textContent = '+';
    } else {
      sidePanelContent.style.display = 'block';
      sidePanel.style.width = '300px';
      sidePanel.style.height = 'auto';
      sidePanelToggle.textContent = '-';
    }
  });
  
  // Fullscreen button
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    } else {
      // Exit fullscreen
      document.exitFullscreen();
    }
  });
  
  // Update button appearance when fullscreen changes
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      fullscreenBtn.textContent = '⛶'; // Exit fullscreen icon
      fullscreenBtn.title = 'Exit Fullscreen';
    } else {
      fullscreenBtn.textContent = '⛶'; // Enter fullscreen icon
      fullscreenBtn.title = 'Toggle Fullscreen';
    }
  });
  
  // Grid Toggle button
  const gridToggleBtn = document.getElementById('gridToggleBtn');
  gridToggleBtn.addEventListener('click', () => {
    startMusic();
    showGrid = !showGrid;
    gridToggleBtn.classList.toggle('active', showGrid);
    gridToggleBtn.innerHTML = showGrid ? '⊞<br>Grid<br>ON' : '⊞<br>Grid';
  });
  // Set initial state
  gridToggleBtn.classList.add('active');
  gridToggleBtn.innerHTML = '⊞<br>Grid<br>ON';
  
  // Anomaly Scanner button
  const anomalyBtn = document.getElementById('anomalyBtn');
  anomalyBtn.addEventListener('click', () => {
    startMusic();
    toggleAnomalyWindow();
  });
  
  // Star Map button
  const starMapBtn = document.getElementById('starMapBtn');
  starMapBtn.addEventListener('click', () => {
    startMusic();
    if(starMapOpen){
      closeStarMap();
    } else {
      openStarMap();
    }
  });
  
  // Auto Fire button
  autoFireBtn.addEventListener('click', () => {
    startMusic();
    toggleAutoFire();
  });
  
  // Auto Mine button
  autoMineBtn.addEventListener('click', () => {
    startMusic();
    toggleAutoMine();
  });
  
  // Audio Controls
  const audioBtn = document.getElementById('audioBtn');
  const audioWindow = document.getElementById('audioWindow');
  const audioWindowClose = document.getElementById('audioWindowClose');
  const masterVolumeSlider = document.getElementById('masterVolumeSlider');
  const masterVolumeLabel = document.getElementById('masterVolumeLabel');
  const sfxVolumeSlider = document.getElementById('sfxVolumeSlider');
  const sfxVolumeLabel = document.getElementById('sfxVolumeLabel');
  const bgmVolumeSlider = document.getElementById('bgmVolumeSlider');
  const bgmVolumeLabel = document.getElementById('bgmVolumeLabel');
  const muteAllBtn = document.getElementById('muteAllBtn');
  let audioWindowOpen = false;
  let wasMuted = false;
  let previousMasterVolume = 1.0;
  
  audioBtn.addEventListener('click', () => {
    startMusic();
    toggleAudioWindow();
  });
  
  audioWindowClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAudioWindow();
  });
  
  masterVolumeSlider.addEventListener('input', (e) => {
    sounds.masterVolume = e.target.value / 100;
    masterVolumeLabel.textContent = e.target.value + '%';
    bgm.volume = sounds.bgmVolume * sounds.masterVolume;
    if(sounds.thrustAudio && sounds.isThrustPlaying) {
      sounds.thrustAudio.volume = sounds.sfxVolume * sounds.masterVolume;
    }
    if(sounds.masterVolume > 0 && wasMuted) {
      wasMuted = false;
      muteAllBtn.textContent = 'Mute All';
    }
  });
  
  sfxVolumeSlider.addEventListener('input', (e) => {
    sounds.sfxVolume = e.target.value / 100;
    sfxVolumeLabel.textContent = e.target.value + '%';
    if(sounds.thrustAudio && sounds.isThrustPlaying) {
      sounds.thrustAudio.volume = sounds.sfxVolume * sounds.masterVolume;
    }
  });
  
  bgmVolumeSlider.addEventListener('input', (e) => {
    sounds.bgmVolume = e.target.value / 100;
    bgmVolumeLabel.textContent = e.target.value + '%';
    bgm.volume = sounds.bgmVolume * sounds.masterVolume;
  });
  
  muteAllBtn.addEventListener('click', () => {
    if(!wasMuted) {
      previousMasterVolume = sounds.masterVolume;
      sounds.masterVolume = 0;
      masterVolumeSlider.value = 0;
      masterVolumeLabel.textContent = '0%';
      bgm.volume = 0;
      muteAllBtn.textContent = 'Unmute';
      muteAllBtn.style.background = '#10b981';
      muteAllBtn.style.borderColor = '#059669';
      wasMuted = true;
    } else {
      sounds.masterVolume = previousMasterVolume;
      masterVolumeSlider.value = previousMasterVolume * 100;
      masterVolumeLabel.textContent = Math.round(previousMasterVolume * 100) + '%';
      bgm.volume = sounds.bgmVolume * sounds.masterVolume;
      muteAllBtn.textContent = 'Mute All';
      muteAllBtn.style.background = '#dc2626';
      muteAllBtn.style.borderColor = '#991b1b';
      wasMuted = false;
    }
  });
  
  function openAudioWindow(){
    audioWindow.style.display = 'block';
    audioWindowOpen = true;
  }
  
  function closeAudioWindow(){
    audioWindow.style.display = 'none';
    audioWindowOpen = false;
  }
  
  function toggleAudioWindow(){
    if(audioWindowOpen){
      closeAudioWindow();
    } else {
      openAudioWindow();
    }
  }
  
  // Anomaly window management
  const anomalyWindow = document.getElementById('anomalyWindow');
  const anomalyWindowClose = document.getElementById('anomalyWindowClose');
  const warpToStationBtn = document.getElementById('warpToStationBtn');
  let anomalyWindowOpen = false;
  
  anomalyWindowClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAnomalyWindow();
  });
  
  if(warpToStationBtn){
    warpToStationBtn.addEventListener('click', () => {
      // Find nearest station in current system
      const currentSystem = systems[current];
      if(currentSystem.stations && currentSystem.stations.length > 0){
        const station = currentSystem.stations[0]; // Usually only one station per system
        // Exit anomaly and warp to station
        if(player.warpWarmup === 0 && player.warpCooldown === 0 && !player.isWarping){
          player.warpWarmup = 180;
          player.warpTarget = {x: station.x, y: station.y};
          player.targetCommand = null;
          console.log('Warping to station:', station.name);
        }
      }
    });
  }
  
  function openAnomalyWindow(){
    anomalyWindow.style.display = 'block';
    anomalyWindowOpen = true;
    updateAnomalyScanner();
  }
  
  function closeAnomalyWindow(){
    anomalyWindow.style.display = 'none';
    anomalyWindowOpen = false;
  }
  
  function toggleAnomalyWindow(){
    if(anomalyWindowOpen){
      closeAnomalyWindow();
    } else {
      openAnomalyWindow();
    }
  }
  
  // Station window management
  const stationWindow = document.getElementById('stationWindow');
  const stationWindowClose = document.getElementById('stationWindowClose');
  const stationWindowTitle = document.getElementById('stationWindowTitle');
  let stationWindowOpen = false;
  
  stationWindowClose.addEventListener('click', (e) => {
    e.stopPropagation();
    stationWindow.style.display = 'none';
    stationWindowOpen = false;
  });
  
  // Function to open station window
  function openStationWindow(station){
    stationWindowTitle.textContent = `${station.name} - Station Services`;
    stationWindow.style.display = 'block';
    stationWindowOpen = true;
    updateUI(); // Refresh station-specific content
  }
  
  // Function to close station window
  function closeStationWindow(){
    stationWindow.style.display = 'none';
    stationWindowOpen = false;
  }
  
  // Wreck window management
  const wreckWindow = document.getElementById('wreckWindow');
  const wreckWindowClose = document.getElementById('wreckWindowClose');
  const wreckWindowTitle = document.getElementById('wreckWindowTitle');
  let wreckWindowOpen = false;
  let currentWreck = null;
  
  wreckWindowClose.addEventListener('click', (e) => {
    e.stopPropagation();
    wreckWindow.style.display = 'none';
    wreckWindowOpen = false;
    currentWreck = null;
  });
  
  // Function to open wreck window
  function openWreckWindow(wreck){
    currentWreck = wreck;
    wreck.despawnTimer = 18000; // Reset despawn timer on interaction
    wreckWindowTitle.textContent = `${wreck.name}`;
    wreckWindow.style.display = 'block';
    wreckWindowOpen = true;
    updateWreckUI();
  }
  
  // Function to close wreck window
  function closeWreckWindow(){
    wreckWindow.style.display = 'none';
    wreckWindowOpen = false;
    currentWreck = null;
  }
  
  // Star Map window management
  const starMapWindow = document.getElementById('starMapWindow');
  const starMapClose = document.getElementById('starMapClose');
  const starMapContent = document.getElementById('starMapContent');
  let starMapOpen = false;
  let starMapCanvas = null;
  let starMapZoom = 1.0;
  let starMapPanX = 0;
  let starMapPanY = 0;
  let starMapDragging = false;
  let starMapDragStartX = 0;
  let starMapDragStartY = 0;
  
  starMapClose.addEventListener('click', (e) => {
    e.stopPropagation();
    starMapWindow.style.display = 'none';
    starMapOpen = false;
  });
  
  // Function to close star map
  function closeStarMap(){
    starMapWindow.style.display = 'none';
    starMapOpen = false;
  }
  
  // Function to update star map display
  function updateStarMap(){
    if(!starMapOpen) return;
    
    const currentSystem = systems[current];
    starMapContent.innerHTML = '';
    
    // Create a visual network map
    if(!starMapCanvas){
      starMapCanvas = document.createElement('canvas');
      starMapCanvas.width = 760;
      starMapCanvas.height = 500;
      starMapCanvas.style.cssText = 'background:rgba(10,14,26,0.8);border-radius:6px;margin-bottom:15px;border:1px solid #334155;cursor:grab;';
      
      // Mouse wheel zoom
      starMapCanvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = starMapCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        const newZoom = Math.max(0.5, Math.min(3.0, starMapZoom * zoomFactor));
        
        // Zoom toward mouse position
        const worldX = (mouseX - starMapPanX) / starMapZoom;
        const worldY = (mouseY - starMapPanY) / starMapZoom;
        starMapPanX = mouseX - worldX * newZoom;
        starMapPanY = mouseY - worldY * newZoom;
        
        starMapZoom = newZoom;
        drawStarMap();
      });
      
      // Mouse drag to pan
      starMapCanvas.addEventListener('mousedown', (e) => {
        starMapDragging = true;
        starMapDragStartX = e.clientX - starMapPanX;
        starMapDragStartY = e.clientY - starMapPanY;
        starMapCanvas.style.cursor = 'grabbing';
      });
      
      starMapCanvas.addEventListener('mousemove', (e) => {
        if(starMapDragging){
          starMapPanX = e.clientX - starMapDragStartX;
          starMapPanY = e.clientY - starMapDragStartY;
          drawStarMap();
        }
      });
      
      starMapCanvas.addEventListener('mouseup', () => {
        starMapDragging = false;
        starMapCanvas.style.cursor = 'grab';
      });
      
      starMapCanvas.addEventListener('mouseleave', () => {
        starMapDragging = false;
        starMapCanvas.style.cursor = 'grab';
      });
    }
    
    starMapContent.appendChild(starMapCanvas);
    drawStarMap();
  }
  
  // Separate function to draw the star map (for pan/zoom updates)
  function drawStarMap(){
    if(!starMapCanvas) return;
    
    const ctx = starMapCanvas.getContext('2d');
    const currentSystem = systems[current];
    
    // Clear canvas
    ctx.clearRect(0, 0, starMapCanvas.width, starMapCanvas.height);
    ctx.fillStyle = 'rgba(10,14,26,0.8)';
    ctx.fillRect(0, 0, starMapCanvas.width, starMapCanvas.height);
    
    // Apply pan and zoom transformations
    ctx.save();
    ctx.translate(starMapPanX, starMapPanY);
    ctx.scale(starMapZoom, starMapZoom);
    
    // Draw connections first (so they appear behind nodes)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    systems.forEach((sys, idx) => {
      sys.gates.forEach(gateIdx => {
        const targetSys = systems[gateIdx];
        ctx.beginPath();
        ctx.moveTo(sys.mapX, sys.mapY);
        ctx.lineTo(targetSys.mapX, targetSys.mapY);
        ctx.stroke();
      });
    });
    
    // Draw system nodes
    systems.forEach((sys, idx) => {
      const isCurrent = idx === current;
      const nodeRadius = isCurrent ? 25 : 20;
      
      // Node circle
      ctx.beginPath();
      ctx.arc(sys.mapX, sys.mapY, nodeRadius, 0, Math.PI * 2);
      
      // Fill based on security and current status
      if(isCurrent){
        ctx.fillStyle = 'rgba(6,182,212,0.4)';
        ctx.fill();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
      } else {
        const secColor = sys.security >= 0.5 ? 'rgba(16,185,129,0.3)' : 
                        sys.security >= 0.1 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)';
        ctx.fillStyle = secColor;
        ctx.fill();
        ctx.strokeStyle = getSecColor(sys.security);
        ctx.lineWidth = 2;
      }
      ctx.stroke();
      
      // System name
      ctx.fillStyle = isCurrent ? '#06b6d4' : '#f1f5f9';
      ctx.font = isCurrent ? 'bold 12px "Segoe UI"' : '11px "Segoe UI"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sys.name, sys.mapX, sys.mapY - 1);
      
      // Security rating below name
      ctx.fillStyle = getSecColor(sys.security);
      ctx.font = '9px "Segoe UI"';
      ctx.fillText(sys.security.toFixed(1), sys.mapX, sys.mapY + 11);
    });
    
    // Restore context
    ctx.restore();
    
    // Draw zoom level indicator
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "Segoe UI"';
    ctx.textAlign = 'right';
    ctx.fillText(`Zoom: ${(starMapZoom * 100).toFixed(0)}%`, starMapCanvas.width - 10, starMapCanvas.height - 10);
  }
  
  // Function to update star map info panels (called after drawing)
  function updateStarMapInfo(){
    if(!starMapOpen) return;
    
    const currentSystem = systems[current];
    
    // Remove old info panels if they exist
    const oldPanels = starMapContent.querySelectorAll('.star-map-info');
    oldPanels.forEach(p => p.remove());
    
    // Create container for info panels
    const infoContainer = document.createElement('div');
    infoContainer.className = 'star-map-info';
    
    // Current system info panel
    const currentDiv = document.createElement('div');
    currentDiv.style.cssText = 'padding:15px;background:rgba(6,182,212,0.15);border:2px solid #06b6d4;border-radius:6px;margin-bottom:10px;';
    currentDiv.innerHTML = `
      <div style="font-size:14px;font-weight:bold;color:#06b6d4;margin-bottom:6px;">📍 Current Location</div>
      <div style="font-size:18px;color:#f1f5f9;margin-bottom:4px;">${currentSystem.name}</div>
      <div style="font-size:12px;color:${getSecColor(currentSystem.security)};">Security Status: ${currentSystem.security.toFixed(1)}</div>
    `;
    infoContainer.appendChild(currentDiv);
    
    // All systems list
    const allSystemsHeader = document.createElement('div');
    allSystemsHeader.style.cssText = 'font-size:14px;font-weight:bold;color:#94a3b8;margin-bottom:8px;';
    allSystemsHeader.textContent = 'All Systems';
    infoContainer.appendChild(allSystemsHeader);
    
    systems.forEach((sys, idx) => {
      const isCurrent = idx === current;
      const isAdjacent = currentSystem.gates.includes(idx);
      
      const sysDiv = document.createElement('div');
      sysDiv.style.cssText = `padding:10px;background:${isCurrent ? 'rgba(6,182,212,0.15)' : 'rgba(30,41,59,0.5)'};border:1px solid ${isCurrent ? '#06b6d4' : '#475569'};border-radius:4px;margin-bottom:6px;`;
      
      const connectionsText = sys.gates.map(gIdx => systems[gIdx].name).join(', ');
      
      sysDiv.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="flex:1;">
            <div style="font-size:14px;color:#f1f5f9;font-weight:${isCurrent ? 'bold' : 'normal'};">
              ${isCurrent ? '📍 ' : ''}${sys.name}${isAdjacent && !isCurrent ? ' →' : ''}
            </div>
            <div style="font-size:11px;color:${getSecColor(sys.security)};margin-top:2px;">
              Security: ${sys.security.toFixed(1)}
            </div>
            ${connectionsText ? `<div style="font-size:10px;color:#64748b;margin-top:3px;">Connects to: ${connectionsText}</div>` : ''}
          </div>
        </div>
      `;
      
      infoContainer.appendChild(sysDiv);
    });
    
    starMapContent.appendChild(infoContainer);
  }
  
  // Update info when opening star map
  function openStarMap(){
    starMapWindow.style.display = 'block';
    starMapOpen = true;
    starMapZoom = 1.0;
    starMapPanX = 0;
    starMapPanY = 0;
    updateStarMap();
    updateStarMapInfo();
  }
  
  // Helper function to get security status color
  function getSecColor(sec){
    if(sec >= 0.5) return '#10b981'; // Green - High sec
    if(sec >= 0.1) return '#f59e0b'; // Orange - Low sec
    return '#ef4444'; // Red - Null sec
  }
  
  // Function to update wreck UI
  function updateWreckUI(){
    if(!currentWreck || !wreckWindowOpen) return;
    
    const wreckCargoEl = document.getElementById('wreckCargo');
    const playerCargoEl = document.getElementById('wreckPlayerCargo');
    
    // Show wreck cargo
    wreckCargoEl.innerHTML = '';
    
    // Add Loot All button if wreck has items
    if(currentWreck.cargo.length > 0){
      const lootAllBtn = document.createElement('button');
      lootAllBtn.textContent = 'Loot All';
      lootAllBtn.style.fontSize = '10px';
      lootAllBtn.style.padding = '3px 8px';
      lootAllBtn.style.marginBottom = '8px';
      lootAllBtn.style.width = '100%';
      lootAllBtn.style.background = '#0284c7';
      lootAllBtn.onclick = (e) => {
        e.stopPropagation();
        // Transfer all items that fit
        for(let i = currentWreck.cargo.length - 1; i >= 0; i--){
          const item = currentWreck.cargo[i];
          if(player.cargoUsed + item.size <= player.cargoCap){
            player.cargoItems.push(item);
            player.cargoUsed += item.size;
            currentWreck.cargo.splice(i, 1);
          }
        }
        
        // Close window if wreck is empty
        if(currentWreck.cargo.length === 0){
          closeWreckWindow();
          if(selectedTarget && selectedTarget.type === 'wreck' && selectedTarget.ref === currentWreck){
            selectedTarget = null;
          }
        }
        
        updateWreckUI();
        updateUI();
      };
      wreckCargoEl.appendChild(lootAllBtn);
    }
    
    if(currentWreck.cargo.length === 0){
      wreckCargoEl.innerHTML += '<div style="color:#64748b;font-size:11px;">Empty</div>';
    } else {
      // Group items by type and ore type
      const grouped = {};
      currentWreck.cargo.forEach((item, idx) => {
        const key = item.oreType || item.name;
        if(!grouped[key]){
          grouped[key] = {count: 0, indices: [], sample: item};
        }
        grouped[key].count++;
        grouped[key].indices.push(idx);
      });
      
      Object.keys(grouped).forEach(key => {
        const group = grouped[key];
        const totalSize = (group.count * group.sample.size).toFixed(1);
        const div = document.createElement('div');
        div.style.cssText = 'margin-bottom:8px;padding:8px;background:rgba(30,41,59,0.5);border-radius:3px;';
        
        const headerDiv = document.createElement('div');
        headerDiv.innerHTML = `
          <div style="color:#f1f5f9;font-size:11px;margin-bottom:4px;">${key} x${group.count}</div>
          <div style="color:#94a3b8;font-size:10px;margin-bottom:6px;">${totalSize} m³</div>
        `;
        div.appendChild(headerDiv);
        
        // Add transfer controls
        const controlsDiv = document.createElement('div');
        controlsDiv.style.display = 'flex';
        controlsDiv.style.gap = '4px';
        controlsDiv.style.alignItems = 'center';
        
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.min = '1';
        qtyInput.max = group.count.toString();
        qtyInput.value = '1';
        qtyInput.style.cssText = 'width:40px;font-size:9px;padding:2px;background:#0f172a;border:1px solid #334155;color:#f1f5f9;border-radius:2px;';
        
        const takeBtn = document.createElement('button');
        takeBtn.textContent = 'Take';
        takeBtn.style.cssText = 'flex:1;background:#166534;color:#f1f5f9;border:1px solid #15803d;padding:4px;font-size:10px;cursor:pointer;border-radius:3px;';
        takeBtn.onclick = (e) => {
          e.stopPropagation();
          const qty = Math.min(parseInt(qtyInput.value) || 1, group.count);
          lootItemQty(key, qty);
        };
        
        controlsDiv.appendChild(qtyInput);
        controlsDiv.appendChild(takeBtn);
        div.appendChild(controlsDiv);
        
        wreckCargoEl.appendChild(div);
      });
    }
    
    // Show player cargo
    playerCargoEl.innerHTML = `<div style="margin-bottom:8px;color:#06b6d4;">Cargo: ${player.cargoUsed.toFixed(1)}/${player.cargoCap} m³</div>`;
    
    // Add Unload All button if player has cargo
    if(player.cargoItems.length > 0){
      const unloadAllBtn = document.createElement('button');
      unloadAllBtn.textContent = 'Unload All';
      unloadAllBtn.style.fontSize = '10px';
      unloadAllBtn.style.padding = '3px 8px';
      unloadAllBtn.style.marginBottom = '8px';
      unloadAllBtn.style.width = '100%';
      unloadAllBtn.style.background = '#dc2626';
      unloadAllBtn.onclick = (e) => {
        e.stopPropagation();
        // Transfer all player cargo to wreck
        while(player.cargoItems.length > 0){
          const item = player.cargoItems.pop();
          player.cargoUsed -= item.size;
          currentWreck.cargo.push(item);
        }
        updateWreckUI();
        updateUI();
      };
      playerCargoEl.appendChild(unloadAllBtn);
    }
    
    if(player.cargoItems.length === 0){
      playerCargoEl.innerHTML += '<div style="color:#64748b;font-size:11px;">Empty cargo hold</div>';
    } else {
      // Group player items
      const grouped = {};
      player.cargoItems.forEach((item, idx) => {
        const key = item.oreType || item.name;
        if(!grouped[key]){
          grouped[key] = {count: 0, indices: [], sample: item};
        }
        grouped[key].count++;
        grouped[key].indices.push(idx);
      });
      
      Object.keys(grouped).forEach(key => {
        const group = grouped[key];
        const totalSize = (group.count * group.sample.size).toFixed(1);
        const div = document.createElement('div');
        div.style.cssText = 'margin-bottom:8px;padding:6px;background:rgba(30,41,59,0.3);border-radius:3px;';
        
        const headerDiv = document.createElement('div');
        headerDiv.innerHTML = `
          <div style="color:#f1f5f9;font-size:11px;margin-bottom:4px;">${key} x${group.count}</div>
          <div style="color:#94a3b8;font-size:10px;margin-bottom:6px;">${totalSize} m³</div>
        `;
        div.appendChild(headerDiv);
        
        // Add unload controls
        const controlsDiv = document.createElement('div');
        controlsDiv.style.display = 'flex';
        controlsDiv.style.gap = '4px';
        controlsDiv.style.alignItems = 'center';
        
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.min = '1';
        qtyInput.max = group.count.toString();
        qtyInput.value = '1';
        qtyInput.style.cssText = 'width:40px;font-size:9px;padding:2px;background:#0f172a;border:1px solid #334155;color:#f1f5f9;border-radius:2px;';
        
        const unloadBtn = document.createElement('button');
        unloadBtn.textContent = 'Unload';
        unloadBtn.style.cssText = 'flex:1;background:#7c2d12;color:#f1f5f9;border:1px solid #991b1b;padding:4px;font-size:10px;cursor:pointer;border-radius:3px;';
        unloadBtn.onclick = (e) => {
          e.stopPropagation();
          const qty = Math.min(parseInt(qtyInput.value) || 1, group.count);
          unloadItemQty(key, qty);
        };
        
        controlsDiv.appendChild(qtyInput);
        controlsDiv.appendChild(unloadBtn);
        div.appendChild(controlsDiv);
        
        playerCargoEl.appendChild(div);
      });
    }
  }
  
  // Global function for loot button (with quantity)
  window.lootItemQty = function(itemKey, qty){
    if(!currentWreck) return;
    
    currentWreck.despawnTimer = 18000; // Reset despawn timer on interaction
    let transferred = 0;
    for(let i = currentWreck.cargo.length - 1; i >= 0 && transferred < qty; i--){
      const item = currentWreck.cargo[i];
      const key = item.oreType || item.name;
      if(key === itemKey){
        if(player.cargoUsed + item.size <= player.cargoCap){
          player.cargoItems.push(item);
          player.cargoUsed += item.size;
          currentWreck.cargo.splice(i, 1);
          transferred++;
        } else {
          break; // Cargo full
        }
      }
    }
    
    // Close window if wreck is empty
    if(currentWreck.cargo.length === 0){
      closeWreckWindow();
      if(selectedTarget && selectedTarget.type === 'wreck' && selectedTarget.ref === currentWreck){
        selectedTarget = null;
      }
    }
    
    updateWreckUI();
    updateUI();
  };
  
  // Global function for unload button (with quantity)
  window.unloadItemQty = function(itemKey, qty){
    if(!currentWreck) return;
    
    currentWreck.despawnTimer = 18000; // Reset despawn timer on interaction
    let transferred = 0;
    for(let i = player.cargoItems.length - 1; i >= 0 && transferred < qty; i--){
      const item = player.cargoItems[i];
      const key = item.oreType || item.name;
      if(key === itemKey){
        currentWreck.cargo.push(item);
        player.cargoUsed -= item.size;
        player.cargoItems.splice(i, 1);
        transferred++;
      }
    }
    
    updateWreckUI();
    updateUI();
  };
  
  // Mouse wheel for scrolling tactical overview
  canvas.addEventListener('wheel', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // Check if mouse is over tactical overview area
    const rightX = canvas.width - 250;
    const overviewY = selectedTarget && selectedTarget.ref ? 140 : 10;
    const overviewHeight = overviewCollapsed ? 30 : 250;
    
    if(mx >= rightX && mx <= rightX + 240 && my >= overviewY && my <= overviewY + overviewHeight && !overviewCollapsed){
      e.preventDefault();
      overviewScrollOffset += e.deltaY > 0 ? 1 : -1;
      if(overviewScrollOffset < 0) overviewScrollOffset = 0;
    }
  }, { passive: false });

  canvas.addEventListener('click', e=>{
    e.preventDefault();
    startMusic();
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // Check canvas buttons first
    for(let btn of canvasButtons){
      if(mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h){
        btn.action();
        return;
      }
    }
    
    // Then check game world objects
    const worldX = mx + camera.x;
    const worldY = my + camera.y;
    const s = systems[current];
    
    let nearest = null; let nd = 1e9; let ntype = null;
    s.stations.forEach(st=>{
      const d=Math.hypot(st.x-worldX, st.y-worldY);
      if(d<nd && d<80){ nd=d; nearest=st; ntype='station'; }
    });
    if(!nearest){
      s.stargates.forEach(g=>{
        const d=Math.hypot(g.x-worldX, g.y-worldY);
        if(d<nd && d<60){ nd=d; nearest=g; ntype='gate'; }
      });
    }
    if(!nearest){
      s.npcs.forEach(n=>{ 
        const d=Math.hypot(n.x-worldX, n.y-worldY); 
        if(d<nd && d<50){ nd=d; nearest=n; ntype='npc'; } 
      });
    }
    if(!nearest){ 
      s.asteroids.forEach(a=>{ 
        const d=Math.hypot(a.x-worldX, a.y-worldY); 
        if(d<nd && d<50){ nd=d; nearest=a; ntype='asteroid'; } 
      }); 
    }
    if(!nearest){
      s.wrecks.forEach(w=>{
        const d=Math.hypot(w.x-worldX, w.y-worldY);
        if(d<nd && d<40){ nd=d; nearest=w; ntype='wreck'; }
      });
    }
    
    if(nearest){ 
      selectedTarget = {type:ntype, ref:nearest}; 
      player.targetCommand = null;
      player.approachRotating = false;
      player.approachRotationTime = 0;
      lastTargetId = null; // Force button recreation
    } else { 
      selectedTarget = null; 
      lastTargetId = null;
    }
    updateUI();
  });

  // UI updates - canvas buttons regenerated when target changes
  function updateStats(){
    // Only update text stats, not the full cargo display
    // Cargo display is updated via updateUI() when items change
  }
  
  function updateCargoDisplay(){
    // Recalculate cargoUsed from actual items to prevent floating point drift
    // This ensures cargo display never shows negative values due to precision errors
    player.cargoUsed = 0;
    player.cargoItems.forEach(item => {
      player.cargoUsed += item.size;
    });
    // Clamp to zero to prevent display of negative values
    player.cargoUsed = Math.max(0, player.cargoUsed);
    
    cargo.innerHTML = `<div style="margin-bottom:8px;">Credits: ${Math.round(player.credits).toLocaleString()} ISK</div>`;
    cargo.innerHTML += `<div style="margin-bottom:8px;color:#06b6d4;">Cargo: ${player.cargoUsed.toFixed(1)}/${player.cargoCap} m³</div>`;
    
    // Add bulk actions if docked
    const nearStation = systems[current].stations.find(st => dist(player, st) < 300);
    if(nearStation && player.cargoItems.length > 0){
      const unloadAllBtn = document.createElement('button');
      unloadAllBtn.textContent = 'Unload All to Station';
      unloadAllBtn.style.fontSize = '10px';
      unloadAllBtn.style.padding = '3px 8px';
      unloadAllBtn.style.marginBottom = '8px';
      unloadAllBtn.style.width = '100%';
      unloadAllBtn.style.background = '#0284c7';
      unloadAllBtn.onclick = (e) => {
        e.stopPropagation();
        // Move all cargo items to station
        while(player.cargoItems.length > 0){
          const item = removeFromInventory(player.cargoItems, 0);
          if(item){
            addToInventory(nearStation.inventory, item);
          }
        }
        updateUI();
      };
      cargo.appendChild(unloadAllBtn);
    }
    
    if(player.cargoItems.length === 0){
      cargo.innerHTML += '<div style="color:#64748b;font-size:11px;">Empty cargo hold</div>';
    } else {
      // Group items by type and name
      const itemGroups = {};
      player.cargoItems.forEach((item, idx) => {
        const key = `${item.type}_${item.name}`;
        if(!itemGroups[key]){
          itemGroups[key] = {type: item.type, name: item.name, indices: [], size: item.size};
        }
        itemGroups[key].indices.push(idx);
      });
      
      Object.values(itemGroups).forEach(group => {
        const itemDiv = document.createElement('div');
        itemDiv.style.fontSize = '11px';
        itemDiv.style.marginBottom = '4px';
        itemDiv.style.padding = '3px';
        itemDiv.style.background = '#1e293b';
        itemDiv.style.borderRadius = '2px';
        
        // Get item details for weapons/modules
        let detailsHtml = '';
        if(group.type === 'weapon' || group.type === 'module'){
          const index = player.cargoItems.findIndex(item => 
            item.type === group.type && item.name === group.name
          );
          if(index !== -1){
            const item = player.cargoItems[index];
            
            // Description
            if(item.description){
              detailsHtml += `<div style="color:#94a3b8;font-size:9px;margin-top:2px;">${item.description}</div>`;
            }
            
            // Slot type
            const slotTypeLabel = item.slotType === 'high' ? 'HIGH SLOT' : (item.slotType === 'medium' ? 'MEDIUM SLOT' : 'LOW SLOT');
            const slotColor = item.slotType === 'high' ? '#ef4444' : (item.slotType === 'medium' ? '#3b82f6' : '#f59e0b');
            detailsHtml += `<div style="color:${slotColor};font-size:9px;font-weight:bold;margin-top:2px;">${slotTypeLabel}</div>`;
            
            if(group.type === 'weapon'){
              detailsHtml += `<div style="color:#94a3b8;font-size:10px;">DMG: ${item.damage || 0} | Range: ${item.maxRange || 0}m | ROF: ${item.fireRate ? (60/item.fireRate).toFixed(1) : 0}/s</div>`;
              detailsHtml += `<div style="color:#64748b;font-size:10px;">PG: ${item.powergridUsage || 0} | CPU: ${item.cpuUsage || 0} | Cap: ${item.capacitorUse || 0}</div>`;
            } else if(group.type === 'module'){
              let effectText = '';
              if(item.shieldBonus) effectText += `+${item.shieldBonus} Shield `;
              if(item.armorBonus) effectText += `+${item.armorBonus} Armor `;
              if(item.shieldRegenBonus) effectText += `+${(item.shieldRegenBonus*100).toFixed(0)}% Shield Regen `;
              if(item.damageBonus) effectText += `+${(item.damageBonus*100).toFixed(0)}% Damage `;
              if(item.speedBonus && item.type === 'passive') effectText += `+${(item.speedBonus*100).toFixed(0)}% Speed `;
              if(item.cargoBonus) effectText += `+${item.cargoBonus} Cargo `;
              if(item.capacitorBonus) effectText += `+${item.capacitorBonus} Cap `;
              if(item.capacitorRegenBonus) effectText += `+${(item.capacitorRegenBonus*100).toFixed(0)}% Cap Regen `;
              detailsHtml += `<div style="color:#94a3b8;font-size:10px;">${effectText}</div>`;
              detailsHtml += `<div style="color:#64748b;font-size:10px;">PG: ${item.powergridUsage || 0} | CPU: ${item.cpuUsage || 0}</div>`;
            }
          }
        }
        
        itemDiv.innerHTML = `<div style="color:#f1f5f9;font-weight:bold;">${group.name} x${group.indices.length}</div>${detailsHtml}<div style="color:#64748b;font-size:10px;margin-top:2px;">${(group.size * group.indices.length).toFixed(1)} m³</div>`;
        
        // Add transfer controls if docked
        const nearStation = systems[current].stations.find(st => dist(player, st) < 300);
        if(nearStation){
          const controlsDiv = document.createElement('div');
          controlsDiv.style.marginTop = '4px';
          controlsDiv.style.display = 'flex';
          controlsDiv.style.gap = '4px';
          controlsDiv.style.alignItems = 'center';
          
          const qtyInput = document.createElement('input');
          qtyInput.type = 'number';
          qtyInput.min = '1';
          qtyInput.max = group.indices.length.toString();
          qtyInput.value = '1';
          qtyInput.style.width = '40px';
          qtyInput.style.fontSize = '9px';
          qtyInput.style.padding = '2px';
          qtyInput.style.background = '#0f172a';
          qtyInput.style.border = '1px solid #334155';
          qtyInput.style.color = '#f1f5f9';
          qtyInput.style.borderRadius = '2px';
          
          const unloadBtn = document.createElement('button');
          unloadBtn.textContent = 'Unload';
          unloadBtn.style.fontSize = '9px';
          unloadBtn.style.padding = '2px 6px';
          unloadBtn.onclick = (e) => {
            e.stopPropagation();
            const qty = Math.min(parseInt(qtyInput.value) || 1, group.indices.length);
            for(let i = 0; i < qty; i++){
              // Find next matching item dynamically
              const index = player.cargoItems.findIndex(item => 
                item.type === group.type && item.name === group.name
              );
              if(index === -1) break;
              
              const item = removeFromInventory(player.cargoItems, index);
              if(item){
                addToInventory(nearStation.inventory, item);
              }
            }
            updateUI();
          };
          
          controlsDiv.appendChild(qtyInput);
          controlsDiv.appendChild(unloadBtn);
          itemDiv.appendChild(controlsDiv);
        }
        
        cargo.appendChild(itemDiv);
      });
    }
  }
  
  function updateUI(){
    // Update cargo display
    updateCargoDisplay();
    
    // Update anomaly exit panel visibility
    if(anomalyExitPanel && anomalyExitInfo){
      if(player.inAnomaly && player.currentAnomaly){
        anomalyExitPanel.style.display = 'block';
        anomalyExitInfo.textContent = `${player.currentAnomaly.name} - ${player.currentAnomaly.category.toUpperCase()}`;
      } else {
        anomalyExitPanel.style.display = 'none';
      }
    }
    
    const s = systems[current];
    const nearStation = systems[current].stations.find(st => dist(player, st) < 300);
    
    // Station Inventory
    stationInventoryEl.innerHTML = '';
    if(!nearStation){
      stationInventoryEl.innerHTML = '<div style="color:#64748b;font-size:11px">Dock at station to access storage</div>';
    } else {
      // Add Sell All Ore button if station has ore
      const stationOreItems = nearStation.inventory.filter(item => item.type === 'ore');
      if(stationOreItems.length > 0){
        const sellAllBtn = document.createElement('button');
        sellAllBtn.textContent = 'Sell All Ore';
        sellAllBtn.style.fontSize = '11px';
        sellAllBtn.style.padding = '5px 10px';
        sellAllBtn.style.marginBottom = '4px';
        sellAllBtn.style.width = '100%';
        sellAllBtn.style.background = '#16a34a';
        sellAllBtn.style.fontWeight = 'bold';
        sellAllBtn.onclick = (e) => {
          e.stopPropagation();
          let totalValue = 0;
          // Sell all ore items from station inventory
          for(let i = nearStation.inventory.length - 1; i >= 0; i--){
            const item = nearStation.inventory[i];
            if(item.type === 'ore' && item.oreType){
              const oreData = ORE_TYPES[item.oreType];
              if(oreData){
                const sellPrice = Math.round(oreData.price * 0.85);
                totalValue += sellPrice;
                removeFromInventory(nearStation.inventory, i);
              }
            }
          }
          player.credits += totalValue;
          updateUI();
        };
        stationInventoryEl.appendChild(sellAllBtn);
      }
      
      // Add Sell All Metal button if station has metal
      const stationMetalItems = nearStation.inventory.filter(item => item.type === 'metal');
      if(stationMetalItems.length > 0){
        const sellMetalBtn = document.createElement('button');
        sellMetalBtn.textContent = 'Sell All Metal';
        sellMetalBtn.style.fontSize = '11px';
        sellMetalBtn.style.padding = '5px 10px';
        sellMetalBtn.style.marginBottom = '8px';
        sellMetalBtn.style.width = '100%';
        sellMetalBtn.style.background = '#0891b2';
        sellMetalBtn.style.fontWeight = 'bold';
        sellMetalBtn.onclick = (e) => {
          e.stopPropagation();
          let totalValue = 0;
          // Sell all metal items from station inventory
          for(let i = nearStation.inventory.length - 1; i >= 0; i--){
            const item = nearStation.inventory[i];
            if(item.type === 'metal' && item.metalType){
              const metalData = METAL_TYPES[item.metalType];
              if(metalData){
                const sellPrice = Math.round(metalData.price * 0.90); // Better price than ore
                totalValue += sellPrice;
                removeFromInventory(nearStation.inventory, i);
              }
            }
          }
          player.credits += totalValue;
          updateUI();
        };
        stationInventoryEl.appendChild(sellMetalBtn);
      }
      
      // Add Load All button if station has inventory
      if(nearStation.inventory.length > 0){
        const loadAllBtn = document.createElement('button');
        loadAllBtn.textContent = 'Load All to Cargo';
        loadAllBtn.style.fontSize = '10px';
        loadAllBtn.style.padding = '3px 8px';
        loadAllBtn.style.marginBottom = '8px';
        loadAllBtn.style.width = '100%';
        loadAllBtn.style.background = '#0284c7';
        loadAllBtn.onclick = (e) => {
          e.stopPropagation();
          // Load as many items as possible
          let i = 0;
          while(i < nearStation.inventory.length){
            const item = nearStation.inventory[i];
            if(player.cargoUsed + item.size <= player.cargoCap){
              const removed = removeFromInventory(nearStation.inventory, i);
              if(removed){
                addToInventory(player.cargoItems, removed);
                // Don't increment i since we removed an item
              } else {
                i++;
              }
            } else {
              break; // Can't fit any more
            }
          }
          updateUI();
        };
        stationInventoryEl.appendChild(loadAllBtn);
      }
      
      if(nearStation.inventory.length === 0){
        stationInventoryEl.innerHTML = '<div style="color:#64748b;font-size:11px">Empty station storage</div>';
      } else {
        // Group items from station inventory only
        const itemGroups = {};
        nearStation.inventory.forEach((item, idx) => {
          const key = `${item.type}_${item.name}`;
          if(!itemGroups[key]){
            itemGroups[key] = {type: item.type, name: item.name, indices: [], size: item.size};
          }
          itemGroups[key].indices.push(idx);
        });
        
        Object.values(itemGroups).forEach(group => {
          const itemDiv = document.createElement('div');
          itemDiv.style.fontSize = '11px';
          itemDiv.style.marginBottom = '4px';
          itemDiv.style.padding = '3px';
          itemDiv.style.background = '#1e293b';
          itemDiv.style.borderRadius = '2px';
          
          // Get item details for weapons/modules
          let detailsHtml = '';
          if(group.type === 'weapon' || group.type === 'module'){
            const index = nearStation.inventory.findIndex(item => 
              item.type === group.type && item.name === group.name
            );
            if(index !== -1){
              const item = nearStation.inventory[index];
              
              // Description
              if(item.description){
                detailsHtml += `<div style="color:#94a3b8;font-size:9px;margin-top:2px;">${item.description}</div>`;
              }
              
              // Slot type
              const slotTypeLabel = item.slotType === 'high' ? 'HIGH SLOT' : (item.slotType === 'medium' ? 'MEDIUM SLOT' : 'LOW SLOT');
              const slotColor = item.slotType === 'high' ? '#ef4444' : (item.slotType === 'medium' ? '#3b82f6' : '#f59e0b');
              detailsHtml += `<div style="color:${slotColor};font-size:9px;font-weight:bold;margin-top:2px;">${slotTypeLabel}</div>`;
              
              if(group.type === 'weapon'){
                detailsHtml += `<div style="color:#94a3b8;font-size:10px;">DMG: ${item.damage || 0} | Range: ${item.maxRange || 0}m | ROF: ${item.fireRate ? (60/item.fireRate).toFixed(1) : 0}/s</div>`;
                detailsHtml += `<div style="color:#64748b;font-size:10px;">PG: ${item.powergridUsage || 0} | CPU: ${item.cpuUsage || 0} | Cap: ${item.capacitorUse || 0}</div>`;
              } else if(group.type === 'module'){
                let effectText = '';
                if(item.shieldBonus) effectText += `+${item.shieldBonus} Shield `;
                if(item.armorBonus) effectText += `+${item.armorBonus} Armor `;
                if(item.shieldRegenBonus) effectText += `+${(item.shieldRegenBonus*100).toFixed(0)}% Shield Regen `;
                if(item.damageBonus) effectText += `+${(item.damageBonus*100).toFixed(0)}% Damage `;
                if(item.speedBonus && item.type === 'passive') effectText += `+${(item.speedBonus*100).toFixed(0)}% Speed `;
                if(item.cargoBonus) effectText += `+${item.cargoBonus} Cargo `;
                if(item.capacitorBonus) effectText += `+${item.capacitorBonus} Cap `;
                if(item.capacitorRegenBonus) effectText += `+${(item.capacitorRegenBonus*100).toFixed(0)}% Cap Regen `;
                detailsHtml += `<div style="color:#94a3b8;font-size:10px;">${effectText}</div>`;
                detailsHtml += `<div style="color:#64748b;font-size:10px;">PG: ${item.powergridUsage || 0} | CPU: ${item.cpuUsage || 0}</div>`;
              }
            }
          }
          
          itemDiv.innerHTML = `<div style="color:#f1f5f9;font-weight:bold;">${group.name} x${group.indices.length}</div>${detailsHtml}<div style="color:#64748b;font-size:10px;margin-top:2px;">${(group.size * group.indices.length).toFixed(1)} m³</div>`;
          
          // Quantity controls
          const controlsDiv = document.createElement('div');
          controlsDiv.style.marginTop = '4px';
          controlsDiv.style.display = 'flex';
          controlsDiv.style.gap = '4px';
          controlsDiv.style.alignItems = 'center';
          
          const qtyInput = document.createElement('input');
          qtyInput.type = 'number';
          qtyInput.min = '1';
          qtyInput.max = group.indices.length.toString();
          qtyInput.value = '1';
          qtyInput.style.width = '40px';
          qtyInput.style.fontSize = '9px';
          qtyInput.style.padding = '2px';
          qtyInput.style.background = '#0f172a';
          qtyInput.style.border = '1px solid #334155';
          qtyInput.style.color = '#f1f5f9';
          qtyInput.style.borderRadius = '2px';
          
          const loadBtn = document.createElement('button');
          loadBtn.textContent = 'Load';
          loadBtn.style.fontSize = '9px';
          loadBtn.style.padding = '2px 6px';
          loadBtn.onclick = (e) => {
            e.stopPropagation();
            const qty = Math.min(parseInt(qtyInput.value) || 1, group.indices.length);
            let loaded = 0;
            for(let i = 0; i < qty; i++){
              // Find next matching item dynamically
              const index = nearStation.inventory.findIndex(item => 
                item.type === group.type && item.name === group.name
              );
              if(index === -1) break;
              
              const item = nearStation.inventory[index];
              if(player.cargoUsed + item.size <= player.cargoCap){
                const removed = removeFromInventory(nearStation.inventory, index);
                if(removed){
                  addToInventory(player.cargoItems, removed);
                  loaded++;
                }
              } else {
                break; // Cargo full
              }
            }
            updateUI();
          };
          
          // Sell button for ore items
          if(group.type === 'ore'){
            const sellBtn = document.createElement('button');
            sellBtn.textContent = 'Sell';
            sellBtn.style.fontSize = '9px';
            sellBtn.style.padding = '2px 6px';
            sellBtn.style.background = '#16a34a';
            sellBtn.onclick = (e) => {
              e.stopPropagation();
              const qty = Math.min(parseInt(qtyInput.value) || 1, group.indices.length);
              let totalValue = 0;
              for(let i = 0; i < qty; i++){
                // Find next matching ore item dynamically
                const index = nearStation.inventory.findIndex(item => 
                  item.type === group.type && item.name === group.name
                );
                if(index === -1) break;
                
                const item = nearStation.inventory[index];
                if(item.oreType){
                  const oreData = ORE_TYPES[item.oreType];
                  if(oreData){
                    const sellPrice = Math.round(oreData.price * 0.85);
                    totalValue += sellPrice;
                    removeFromInventory(nearStation.inventory, index);
                  }
                }
              }
              player.credits += totalValue;
              updateUI();
            };
            controlsDiv.appendChild(qtyInput);
            controlsDiv.appendChild(loadBtn);
            controlsDiv.appendChild(sellBtn);
          } else if(group.type === 'metal'){
            // Sell button for metal items
            const sellBtn = document.createElement('button');
            sellBtn.textContent = 'Sell';
            sellBtn.style.fontSize = '9px';
            sellBtn.style.padding = '2px 6px';
            sellBtn.style.background = '#0891b2';
            sellBtn.onclick = (e) => {
              e.stopPropagation();
              const qty = Math.min(parseInt(qtyInput.value) || 1, group.indices.length);
              let totalValue = 0;
              for(let i = 0; i < qty; i++){
                // Find next matching metal item dynamically
                const index = nearStation.inventory.findIndex(item => 
                  item.type === group.type && item.name === group.name
                );
                if(index === -1) break;
                
                const item = nearStation.inventory[index];
                if(item.metalType){
                  const metalData = METAL_TYPES[item.metalType];
                  if(metalData){
                    const sellPrice = Math.round(metalData.price * 0.90); // Better price than ore
                    totalValue += sellPrice;
                    removeFromInventory(nearStation.inventory, index);
                  }
                }
              }
              player.credits += totalValue;
              updateUI();
            };
            controlsDiv.appendChild(qtyInput);
            controlsDiv.appendChild(loadBtn);
            controlsDiv.appendChild(sellBtn);
          } else if(group.type === 'weapon' || group.type === 'module'){
            // Fit button for weapons and modules
            const fitBtn = document.createElement('button');
            fitBtn.textContent = 'Fit';
            fitBtn.style.fontSize = '9px';
            fitBtn.style.padding = '2px 6px';
            fitBtn.style.background = '#0284c7';
            
            // Check if can fit
            const index = nearStation.inventory.findIndex(item => 
              item.type === group.type && item.name === group.name
            );
            if(index !== -1){
              const item = nearStation.inventory[index];
              
              // Check fitting requirements
              const hasSlots = group.type === 'weapon' 
                ? player.highSlots.filter(w => w).length < player.highSlotsMax
                : (item.slotType === 'medium' 
                  ? player.mediumSlots.filter(m => m).length < player.mediumSlotsMax
                  : player.lowSlots.filter(m => m).length < player.lowSlotsMax);
              const canFit = player.powergridUsed + (item.powergridUsage || 0) <= player.powergridTotal &&
                            player.cpuUsed + (item.cpuUsage || 0) <= player.cpuTotal &&
                            hasSlots;
              
              if(!canFit){
                fitBtn.disabled = true;
                fitBtn.style.background = '#64748b';
                fitBtn.title = 'Insufficient PG/CPU or no free slots';
              }
            }
            
            fitBtn.onclick = (e) => {
              e.stopPropagation();
              // Find the item in station inventory
              const itemIndex = nearStation.inventory.findIndex(item => 
                item.type === group.type && item.name === group.name
              );
              if(itemIndex !== -1){
                const item = nearStation.inventory[itemIndex];
                // Remove from station before fitting
                removeFromInventory(nearStation.inventory, itemIndex);
                // Fit directly
                if(fitItem(item.name)){
                  updateUI();
                } else {
                  // If fit failed, return to station
                  addToInventory(nearStation.inventory, item);
                  updateUI();
                }
              }
            };
            
            // Sell button for weapons and modules
            const sellBtn = document.createElement('button');
            sellBtn.textContent = 'Sell';
            sellBtn.style.fontSize = '9px';
            sellBtn.style.padding = '2px 6px';
            sellBtn.style.background = '#16a34a';
            sellBtn.onclick = (e) => {
              e.stopPropagation();
              const qty = Math.min(parseInt(qtyInput.value) || 1, group.indices.length);
              let totalValue = 0;
              for(let i = 0; i < qty; i++){
                // Find next matching item dynamically
                const itemIndex = nearStation.inventory.findIndex(item => 
                  item.type === group.type && item.name === group.name
                );
                if(itemIndex === -1) break;
                
                const item = nearStation.inventory[itemIndex];
                // Sell at 50% of purchase price
                const sellPrice = Math.round((item.price || 0) * 0.50);
                totalValue += sellPrice;
                removeFromInventory(nearStation.inventory, itemIndex);
              }
              player.credits += totalValue;
              updateUI();
            };
            
            controlsDiv.appendChild(qtyInput);
            controlsDiv.appendChild(fitBtn);
            controlsDiv.appendChild(loadBtn);
            controlsDiv.appendChild(sellBtn);
          } else {
            controlsDiv.appendChild(qtyInput);
            controlsDiv.appendChild(loadBtn);
          }
          
          itemDiv.appendChild(controlsDiv);
          stationInventoryEl.appendChild(itemDiv);
        });
      }
    }
    
    // Market
    marketEl.innerHTML = '';
    if(!nearStation){
      marketEl.innerHTML = '<div style="color:#64748b;font-size:11px">Dock at station to access market</div>';
    } else {
      // Repair Service Section
      const shieldDamage = player.maxShield - player.shield;
      const armorDamage = player.maxArmor - player.armor;
      const hullDamage = player.maxHull - player.hull;
      const totalDamage = shieldDamage + armorDamage + hullDamage;
      
      if(totalDamage > 0){
        // Calculate repair cost: 100 ISK per point of damage
        const repairCost = Math.round(totalDamage * 100);
        
        const repairDiv = document.createElement('div');
        repairDiv.style.marginBottom = '12px';
        repairDiv.style.padding = '8px';
        repairDiv.style.background = '#1e3a4e';
        repairDiv.style.borderRadius = '4px';
        repairDiv.style.border = '1px solid #0284c7';
        
        const titleDiv = document.createElement('div');
        titleDiv.style.color = '#06b6d4';
        titleDiv.style.fontSize = '12px';
        titleDiv.style.fontWeight = 'bold';
        titleDiv.style.marginBottom = '6px';
        titleDiv.textContent = '⚙️ Repair Service';
        repairDiv.appendChild(titleDiv);
        
        const damageDiv = document.createElement('div');
        damageDiv.style.color = '#94a3b8';
        damageDiv.style.fontSize = '10px';
        damageDiv.style.marginBottom = '6px';
        const damageText = [];
        if(shieldDamage > 0) damageText.push(`Shield: ${shieldDamage.toFixed(0)}`);
        if(armorDamage > 0) damageText.push(`Armor: ${armorDamage.toFixed(0)}`);
        if(hullDamage > 0) damageText.push(`Hull: ${hullDamage.toFixed(0)}`);
        damageDiv.textContent = `Damage: ${damageText.join(' | ')}`;
        repairDiv.appendChild(damageDiv);
        
        const repairBtn = document.createElement('button');
        repairBtn.textContent = `Repair All (${repairCost.toLocaleString()} ISK)`;
        repairBtn.style.fontSize = '11px';
        repairBtn.style.padding = '6px 12px';
        repairBtn.style.width = '100%';
        repairBtn.style.background = player.credits >= repairCost ? '#10b981' : '#64748b';
        repairBtn.style.fontWeight = 'bold';
        repairBtn.disabled = player.credits < repairCost;
        repairBtn.onclick = (e) => {
          e.stopPropagation();
          if(player.credits >= repairCost){
            player.credits -= repairCost;
            player.shield = player.maxShield;
            player.armor = player.maxArmor;
            player.hull = player.maxHull;
            updateUI();
          }
        };
        repairDiv.appendChild(repairBtn);
        
        marketEl.appendChild(repairDiv);
      } else {
        // Ship is fully repaired
        const statusDiv = document.createElement('div');
        statusDiv.style.marginBottom = '12px';
        statusDiv.style.padding = '6px';
        statusDiv.style.background = '#1e3a4e';
        statusDiv.style.borderRadius = '4px';
        statusDiv.style.color = '#10b981';
        statusDiv.style.fontSize = '11px';
        statusDiv.style.textAlign = 'center';
        statusDiv.textContent = '✓ Ship Fully Repaired';
        marketEl.appendChild(statusDiv);
      }
      
      // Show ore prices and buy/sell for each type
      Object.keys(ORE_TYPES).forEach(oreType => {
        const oreData = ORE_TYPES[oreType];
        const price = oreData.price;
        
        const oreDiv = document.createElement('div');
        oreDiv.style.marginBottom = '8px';
        oreDiv.style.padding = '4px';
        oreDiv.style.background = '#1e293b';
        oreDiv.style.borderRadius = '2px';
        
        const titleDiv = document.createElement('div');
        titleDiv.style.color = oreData.color;
        titleDiv.style.fontSize = '11px';
        titleDiv.style.fontWeight = 'bold';
        titleDiv.style.marginBottom = '4px';
        titleDiv.textContent = `${oreType} - ${price} ISK/unit`;
        oreDiv.appendChild(titleDiv);
        
        const buyBtn = document.createElement('button');
        buyBtn.textContent = `Buy (${price} ISK)`;
        buyBtn.style.fontSize = '10px';
        buyBtn.onclick = (e)=>{ 
          e.stopPropagation();
          const oreSize = oreData.size;
          if(player.credits >= price){
            player.credits -= price;
            addToInventory(nearStation.inventory, {type: 'ore', name: oreType, size: oreSize, oreType: oreType});
            updateUI();
          }
        };
        
        oreDiv.appendChild(buyBtn);
        marketEl.appendChild(oreDiv);
      });
    }

    // Fitted Modules - slot-based display
    fittingEl.innerHTML = '';
    fittingEl.innerHTML = `<div style="color:#06b6d4;font-size:11px;margin-bottom:8px">Powergrid: ${player.powergridUsed.toFixed(1)}/${player.powergridTotal} | CPU: ${player.cpuUsed.toFixed(1)}/${player.cpuTotal}</div>`;
    
    // Show high slots (weapons)
    const highHeader = document.createElement('div');
    highHeader.style.fontSize = '11px';
    highHeader.style.fontWeight = 'bold';
    highHeader.style.color = '#f59e0b';
    highHeader.style.marginBottom = '4px';
    highHeader.textContent = `High Slots (${player.highSlots.filter(w => w).length}/${player.highSlotsMax})`;
    fittingEl.appendChild(highHeader);
    
    if(player.highSlots.some(w => w)){
      player.highSlots.forEach((weapon, index) => {
        if(!weapon) return;
        const weaponDiv = document.createElement('div');
        weaponDiv.style.fontSize = '11px';
        weaponDiv.style.marginBottom = '6px';
        weaponDiv.style.padding = '4px';
        weaponDiv.style.background = '#1e293b';
        weaponDiv.style.borderRadius = '2px';
        
        weaponDiv.innerHTML = `
          <div style="color:#f1f5f9;font-weight:bold;">${weapon.name}</div>
          <div style="color:#94a3b8;font-size:10px;">DMG: ${weapon.damage} | Range: ${weapon.maxRange}m | ROF: ${(60/weapon.fireRate).toFixed(1)}/s</div>
          <div style="color:#64748b;font-size:10px;">PG: ${weapon.powergridUsage} | CPU: ${weapon.cpuUsage}</div>
        `;
        
        // Add Unfit button
        const unfitBtn = document.createElement('button');
        unfitBtn.textContent = 'Unfit';
        unfitBtn.style.fontSize = '9px';
        unfitBtn.style.padding = '2px 6px';
        unfitBtn.style.background = '#dc2626';
        unfitBtn.style.marginTop = '4px';
        unfitBtn.onclick = (e) => {
          e.stopPropagation();
          if(unfitItem('high', index)){
            updateUI();
          }
        };
        weaponDiv.appendChild(unfitBtn);
        
        fittingEl.appendChild(weaponDiv);
      });
    } else {
      const emptyDiv = document.createElement('div');
      emptyDiv.style.color = '#64748b';
      emptyDiv.style.fontSize = '11px';
      emptyDiv.style.marginBottom = '8px';
      emptyDiv.textContent = 'No weapons fitted';
      fittingEl.appendChild(emptyDiv);
    }
    
    // Show medium slots (shield/capacitor)
    const mediumHeader = document.createElement('div');
    mediumHeader.style.fontSize = '11px';
    mediumHeader.style.fontWeight = 'bold';
    mediumHeader.style.color = '#f59e0b';
    mediumHeader.style.marginTop = '8px';
    mediumHeader.style.marginBottom = '4px';
    mediumHeader.textContent = `Medium Slots (${player.mediumSlots.filter(m => m).length}/${player.mediumSlotsMax})`;
    fittingEl.appendChild(mediumHeader);
    
    if(player.mediumSlots.some(m => m)){
      player.mediumSlots.forEach((module, index) => {
        if(!module) return;
        const moduleDiv = document.createElement('div');
        moduleDiv.style.fontSize = '11px';
        moduleDiv.style.marginBottom = '6px';
        moduleDiv.style.padding = '4px';
        moduleDiv.style.background = '#1e293b';
        moduleDiv.style.borderRadius = '2px';
        
        let effectText = '';
        if(module.shieldBonus) effectText += `+${module.shieldBonus} Shield `;
        if(module.shieldRegenBonus) effectText += `+${(module.shieldRegenBonus*100).toFixed(0)}% Shield Regen `;
        if(module.capacitorBonus) effectText += `+${module.capacitorBonus} Cap `;
        if(module.capacitorRegenBonus) effectText += `+${(module.capacitorRegenBonus*100).toFixed(0)}% Cap Regen `;
        
        moduleDiv.innerHTML = `
          <div style="color:#f1f5f9;font-weight:bold;">${module.name}</div>
          <div style="color:#94a3b8;font-size:10px;">${effectText}</div>
          <div style="color:#64748b;font-size:10px;">PG: ${module.powergridUsage} | CPU: ${module.cpuUsage}</div>
        `;
        
        const btnContainer = document.createElement('div');
        btnContainer.style.marginTop = '4px';
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '4px';
        
        // Add Activate/Deactivate button for active modules
        if(module.type === 'active'){
          if(!player.activeModuleStates) player.activeModuleStates = { medium: [], low: [] };
          const isActive = player.activeModuleStates.medium[index];
          const activateBtn = document.createElement('button');
          activateBtn.textContent = isActive ? 'Deactivate' : 'Activate';
          activateBtn.style.fontSize = '9px';
          activateBtn.style.padding = '2px 6px';
          activateBtn.style.background = isActive ? '#f59e0b' : '#10b981';
          activateBtn.onclick = (e) => {
            e.stopPropagation();
            toggleModuleActivation('medium', index);
            updateUI();
          };
          btnContainer.appendChild(activateBtn);
        }
        
        // Add Unfit button
        const unfitBtn = document.createElement('button');
        unfitBtn.textContent = 'Unfit';
        unfitBtn.style.fontSize = '9px';
        unfitBtn.style.padding = '2px 6px';
        unfitBtn.style.background = '#dc2626';
        unfitBtn.onclick = (e) => {
          e.stopPropagation();
          if(unfitItem('medium', index)){
            updateUI();
          }
        };
        btnContainer.appendChild(unfitBtn);
        
        moduleDiv.appendChild(btnContainer);
        
        fittingEl.appendChild(moduleDiv);
      });
    } else {
      const emptyDiv = document.createElement('div');
      emptyDiv.style.color = '#64748b';
      emptyDiv.style.fontSize = '11px';
      emptyDiv.style.marginBottom = '8px';
      emptyDiv.textContent = 'No modules fitted';
      fittingEl.appendChild(emptyDiv);
    }
    
    // Show low slots (armor/damage)
    const lowHeader = document.createElement('div');
    lowHeader.style.fontSize = '11px';
    lowHeader.style.fontWeight = 'bold';
    lowHeader.style.color = '#f59e0b';
    lowHeader.style.marginTop = '8px';
    lowHeader.style.marginBottom = '4px';
    lowHeader.textContent = `Low Slots (${player.lowSlots.filter(m => m).length}/${player.lowSlotsMax})`;
    fittingEl.appendChild(lowHeader);
    
    if(player.lowSlots.some(m => m)){
      player.lowSlots.forEach((module, index) => {
        if(!module) return;
        const moduleDiv = document.createElement('div');
        moduleDiv.style.fontSize = '11px';
        moduleDiv.style.marginBottom = '6px';
        moduleDiv.style.padding = '4px';
        moduleDiv.style.background = '#1e293b';
        moduleDiv.style.borderRadius = '2px';
        
        let effectText = '';
        if(module.armorBonus) effectText += `+${module.armorBonus} Armor `;
        if(module.damageBonus) effectText += `+${(module.damageBonus*100).toFixed(0)}% Damage `;
        if(module.speedBonus && module.type === 'passive') effectText += `+${(module.speedBonus*100).toFixed(0)}% Speed `;
        if(module.cargoBonus) effectText += `+${module.cargoBonus} Cargo `;
        
        moduleDiv.innerHTML = `
          <div style="color:#f1f5f9;font-weight:bold;">${module.name}</div>
          <div style="color:#94a3b8;font-size:10px;">${effectText}</div>
          <div style="color:#64748b;font-size:10px;">PG: ${module.powergridUsage} | CPU: ${module.cpuUsage}</div>
        `;
        
        const btnContainer = document.createElement('div');
        btnContainer.style.marginTop = '4px';
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '4px';
        
        // Add Activate/Deactivate button for active modules
        if(module.type === 'active'){
          if(!player.activeModuleStates) player.activeModuleStates = { medium: [], low: [] };
          const isActive = player.activeModuleStates.low[index];
          const activateBtn = document.createElement('button');
          activateBtn.textContent = isActive ? 'Deactivate' : 'Activate';
          activateBtn.style.fontSize = '9px';
          activateBtn.style.padding = '2px 6px';
          activateBtn.style.background = isActive ? '#f59e0b' : '#10b981';
          activateBtn.onclick = (e) => {
            e.stopPropagation();
            toggleModuleActivation('low', index);
            updateUI();
          };
          btnContainer.appendChild(activateBtn);
        }
        
        // Add Unfit button
        const unfitBtn = document.createElement('button');
        unfitBtn.textContent = 'Unfit';
        unfitBtn.style.fontSize = '9px';
        unfitBtn.style.padding = '2px 6px';
        unfitBtn.style.background = '#dc2626';
        unfitBtn.onclick = (e) => {
          e.stopPropagation();
          if(unfitItem('low', index)){
            updateUI();
          }
        };
        btnContainer.appendChild(unfitBtn);
        
        moduleDiv.appendChild(btnContainer);
        
        fittingEl.appendChild(moduleDiv);
      });
    } else {
      const emptyDiv = document.createElement('div');
      emptyDiv.style.color = '#64748b';
      emptyDiv.style.fontSize = '11px';
      emptyDiv.textContent = 'No modules fitted';
      fittingEl.appendChild(emptyDiv);
    }

    // Ship Hangar
    hangarEl.innerHTML = '';
    if(!nearStation){
      hangarEl.innerHTML = '<div style="color:#64748b;font-size:11px">Dock at station to access hangar</div>';
    } else {
      // Show current ship
      hangarEl.innerHTML = `<div style="color:#06b6d4;font-size:11px;margin-bottom:8px">Current: ${player.shipName}</div>`;
      
      // Get current system's ships for sale
      const currentSystem = systems[current];
      const shipsAvailable = currentSystem.shipsForSale || [];
      
      // List ships for sale at this station
      const shipKeys = Object.keys(SHIP_CLASSES).filter(key => shipsAvailable.includes(key));
      
      if(shipKeys.length === 0){
        const noShipsDiv = document.createElement('div');
        noShipsDiv.style.color = '#64748b';
        noShipsDiv.style.fontSize = '10px';
        noShipsDiv.style.fontStyle = 'italic';
        noShipsDiv.textContent = 'No ships available at this station';
        hangarEl.appendChild(noShipsDiv);
      }
      
      shipKeys.forEach(shipKey => {
        const ship = SHIP_CLASSES[shipKey];
        const owned = playerHangar.includes(shipKey);
        const isCurrent = player.shipName === shipKey;
        
        const btn = document.createElement('button');
        btn.style.fontSize = '11px';
        btn.style.marginBottom = '4px';
        
        if(isCurrent){
          btn.textContent = `${ship.name} (Active)`;
          btn.style.background = '#166534';
          btn.disabled = true;
        } else if(owned){
          btn.textContent = `Switch to ${ship.name}`;
          btn.style.background = '#1e3a4e';
          btn.onclick = (e) => {
            e.stopPropagation();
            switchShip(shipKey);
          };
        } else {
          btn.textContent = `Buy ${ship.name} (${ship.price.toLocaleString()} ISK)`;
          btn.onclick = (e) => {
            e.stopPropagation();
            if(player.credits >= ship.price){
              player.credits -= ship.price;
              playerHangar.push(shipKey);
              updateUI();
            }
          };
        }
        
        hangarEl.appendChild(btn);
        
        // Show ship stats
        const stats = document.createElement('div');
        stats.style.fontSize = '10px';
        stats.style.color = '#94a3b8';
        stats.style.marginBottom = '6px';
        stats.innerHTML = `${ship.class} | Speed: ${ship.maxSpeed} | Shield: ${ship.maxShield} | DPS: ${ship.dmg}`;
        hangarEl.appendChild(stats);
      });
    }

    // Module Fitting Interface
    shopEl.innerHTML='';
    if(!nearStation){
      shopEl.innerHTML = '<div style="color:#64748b;font-size:11px">Dock at station to fit modules</div>';
    } else {
      // === WEAPONS SECTION ===
      const weaponsHeader = document.createElement('div');
      weaponsHeader.style.fontSize = '12px';
      weaponsHeader.style.fontWeight = 'bold';
      weaponsHeader.style.color = '#ef4444';
      weaponsHeader.style.marginTop = '8px';
      weaponsHeader.style.marginBottom = '6px';
      weaponsHeader.textContent = '=== WEAPONS ===';
      shopEl.appendChild(weaponsHeader);
      
      // Get current system's forSale list
      const currentSystem = systems[current];
      const forSale = currentSystem.forSale || [];
      
      // Get all weapons that are for sale in this system
      const allWeapons = Object.values(WEAPON_MODULES).filter(w => forSale.includes(w.name));
      
      if(allWeapons.length === 0){
        const noStockDiv = document.createElement('div');
        noStockDiv.style.color = '#64748b';
        noStockDiv.style.fontSize = '10px';
        noStockDiv.style.fontStyle = 'italic';
        noStockDiv.textContent = 'No weapons available at this station';
        shopEl.appendChild(noStockDiv);
      }
      
      allWeapons.forEach(weapon => {
        const isFitted = player.highSlots.some(w => w && w.name === weapon.name);
        
        const weaponDiv = document.createElement('div');
        weaponDiv.style.fontSize = '10px';
        weaponDiv.style.marginBottom = '6px';
        weaponDiv.style.padding = '4px';
        weaponDiv.style.background = isFitted ? '#1e3a4e' : '#1e293b';
        weaponDiv.style.borderRadius = '2px';
        weaponDiv.style.border = isFitted ? '1px solid #06b6d4' : '1px solid transparent';
        
        // Weapon name and price
        const nameDiv = document.createElement('div');
        nameDiv.style.color = '#f1f5f9';
        nameDiv.style.fontWeight = 'bold';
        nameDiv.style.marginBottom = '2px';
        nameDiv.textContent = `${weapon.name} (${weapon.price.toLocaleString()} ISK)`;
        weaponDiv.appendChild(nameDiv);
        
        // Weapon description
        const descDiv = document.createElement('div');
        descDiv.style.color = '#94a3b8';
        descDiv.style.fontSize = '9px';
        descDiv.style.marginBottom = '2px';
        descDiv.textContent = weapon.description;
        weaponDiv.appendChild(descDiv);
        
        // Weapon stats
        const statsDiv = document.createElement('div');
        statsDiv.style.color = '#64748b';
        statsDiv.style.fontSize = '9px';
        statsDiv.style.marginBottom = '4px';
        statsDiv.innerHTML = `<span style="color:#ef4444;font-weight:bold">HIGH SLOT</span> | DMG: ${weapon.damage} | Range: ${weapon.maxRange}m | ROF: ${(60/weapon.fireRate).toFixed(1)}/s | Cap: ${weapon.capacitorUse}<br>PG: ${weapon.powergridUsage} | CPU: ${weapon.cpuUsage}`;
        weaponDiv.appendChild(statsDiv);
        
        // Buy button (always available)
        const buyBtn = document.createElement('button');
        buyBtn.textContent = `Buy (${weapon.price.toLocaleString()} ISK)`;
        buyBtn.style.fontSize = '9px';
        buyBtn.style.padding = '2px 6px';
        
        buyBtn.onclick = (e) => {
          e.stopPropagation();
          if(player.credits >= weapon.price){
            player.credits -= weapon.price;
            // Add to station inventory
            addToInventory(nearStation.inventory, {...weapon, type: 'weapon', size: 0.1});
            updateUI();
          }
        };
        weaponDiv.appendChild(buyBtn);
        
        shopEl.appendChild(weaponDiv);
      });
      
      // === MODULES SECTION ===
      const modulesHeader = document.createElement('div');
      modulesHeader.style.fontSize = '12px';
      modulesHeader.style.fontWeight = 'bold';
      modulesHeader.style.color = '#3b82f6';
      modulesHeader.style.marginTop = '12px';
      modulesHeader.style.marginBottom = '6px';
      modulesHeader.textContent = '=== MODULES ===';
      shopEl.appendChild(modulesHeader);
      
      // Group modules by category
      const categories = ['shield', 'armor', 'propulsion', 'capacitor', 'damage', 'utility'];
      const categoryNames = {
        shield: 'Shield Modules',
        armor: 'Armor Modules',
        propulsion: 'Propulsion',
        capacitor: 'Capacitor',
        damage: 'Damage Mods',
        utility: 'Utility'
      };
      
      categories.forEach(cat => {
        const allModulesInCategory = getModulesByCategory(cat);
        // Filter by forSale list
        const modules = allModulesInCategory.filter(m => forSale.includes(m.name));
        if(modules.length === 0) return;
        
        // Category header
        const header = document.createElement('div');
        header.style.fontSize = '11px';
        header.style.fontWeight = 'bold';
        header.style.color = '#f59e0b';
        header.style.marginTop = '8px';
        header.style.marginBottom = '4px';
        header.textContent = categoryNames[cat];
        shopEl.appendChild(header);
        
        // Module list
        modules.forEach(module => {
          const isFitted = [...player.mediumSlots, ...player.lowSlots].some(m => m && m.name === module.name);
          
          const moduleDiv = document.createElement('div');
          moduleDiv.style.fontSize = '10px';
          moduleDiv.style.marginBottom = '6px';
          moduleDiv.style.padding = '4px';
          moduleDiv.style.background = isFitted ? '#1e3a4e' : '#1e293b';
          moduleDiv.style.borderRadius = '2px';
          moduleDiv.style.border = isFitted ? '1px solid #06b6d4' : '1px solid transparent';
          
          // Module name and price
          const nameDiv = document.createElement('div');
          nameDiv.style.color = '#f1f5f9';
          nameDiv.style.fontWeight = 'bold';
          nameDiv.style.marginBottom = '2px';
          nameDiv.textContent = `${module.name} (${module.price.toLocaleString()} ISK)`;
          moduleDiv.appendChild(nameDiv);
          
          // Module description
          const descDiv = document.createElement('div');
          descDiv.style.color = '#94a3b8';
          descDiv.style.fontSize = '9px';
          descDiv.style.marginBottom = '2px';
          descDiv.textContent = module.description;
          moduleDiv.appendChild(descDiv);
          
          // Module stats
          const statsDiv = document.createElement('div');
          statsDiv.style.color = '#64748b';
          statsDiv.style.fontSize = '9px';
          statsDiv.style.marginBottom = '4px';
          const slotLabel = module.slotType === 'medium' ? 'MEDIUM SLOT' : 'LOW SLOT';
          const slotColor = module.slotType === 'medium' ? '#3b82f6' : '#f59e0b';
          statsDiv.innerHTML = `<span style="color:${slotColor};font-weight:bold">${slotLabel}</span> | PG: ${module.powergridUsage} | CPU: ${module.cpuUsage} | ${module.type}`;
          moduleDiv.appendChild(statsDiv);
          
          // Buy button (always available)
          const buyBtn = document.createElement('button');
          buyBtn.textContent = `Buy (${module.price.toLocaleString()} ISK)`;
          buyBtn.style.fontSize = '9px';
          buyBtn.style.padding = '2px 6px';
          
          buyBtn.onclick = (e) => {
            e.stopPropagation();
            if(player.credits >= module.price){
              player.credits -= module.price;
              // Add to station inventory
              addToInventory(nearStation.inventory, {...module, type: 'module', size: 0.1});
              updateUI();
            }
          };
          moduleDiv.appendChild(buyBtn);
          
          shopEl.appendChild(moduleDiv);
        });
      });
    }
    
    // Update module control buttons
    updateModuleButtons();
    
    // Update anomaly scanner if window is open
    if(anomalyWindowOpen){
      updateAnomalyScanner();
    }
  }
  
  function updateModuleButtons(){
    const container = document.getElementById('moduleButtonsContainer');
    if(!container) return;
    
    container.innerHTML = '';
    
    // Initialize activeModuleStates if it doesn't exist
    if(!player.activeModuleStates){
      player.activeModuleStates = { medium: [], low: [] };
    }
    
    // Collect all active modules from medium and low slots
    const activeModules = [];
    
    player.mediumSlots.forEach((module, index) => {
      if(module && module.type === 'active'){
        activeModules.push({
          module: module,
          slotType: 'medium',
          index: index,
          isActive: player.activeModuleStates.medium[index]
        });
      }
    });
    
    player.lowSlots.forEach((module, index) => {
      if(module && module.type === 'active'){
        activeModules.push({
          module: module,
          slotType: 'low',
          index: index,
          isActive: player.activeModuleStates.low[index]
        });
      }
    });
    
    // Create button for each active module
    activeModules.forEach(({module, slotType, index, isActive}) => {
      const btn = document.createElement('button');
      btn.className = 'circularBtn';
      btn.style.minWidth = '60px';
      btn.style.height = '60px';
      btn.style.position = 'relative';
      btn.style.padding = '4px';
      btn.style.fontSize = '9px';
      btn.style.lineHeight = '1.2';
      btn.style.whiteSpace = 'normal';
      btn.style.wordWrap = 'break-word';
      btn.style.background = isActive ? '#10b981' : 'rgba(30,58,78,0.7)';
      btn.style.borderColor = isActive ? '#059669' : 'rgba(71,85,105,0.7)';
      
      // Get short name for button
      let shortName = module.name;
      if(shortName.includes('Small')) shortName = shortName.replace('Small ', '');
      if(shortName.includes(' I')) shortName = shortName.replace(' I', '');
      
      btn.innerHTML = shortName;
      btn.title = `${module.name} - ${isActive ? 'Active' : 'Inactive'}`;
      
      btn.onclick = () => {
        toggleModuleActivation(slotType, index);
        updateModuleButtons(); // Refresh buttons to show new state
      };
      
      container.appendChild(btn);
    });
  }

  function updateAnomalyScanner(){
    if(!anomalyScannerEl) return;
    
    anomalyScannerEl.innerHTML = '';
    
    // Update exit panel visibility
    if(anomalyExitPanel){
      if(player.inAnomaly && player.currentAnomaly){
        anomalyExitPanel.style.display = 'block';
        if(anomalyExitInfo){
          anomalyExitInfo.textContent = `${player.currentAnomaly.name} - ${player.currentAnomaly.difficulty.toUpperCase()}`;
        }
      } else {
        anomalyExitPanel.style.display = 'none';
      }
    }
    
    const currentSystem = systems[current];
    if(!currentSystem || !currentSystem.anomalies) return;
    
    // Check if player has Core Probe Launcher fitted
    const hasProbes = [...player.mediumSlots, ...player.lowSlots].some(m => 
      m && m.name === 'Core Probe Launcher I'
    );
    
    // Separate discovered and undiscovered anomalies
    const discovered = currentSystem.anomalies.filter(a => a.discovered);
    const undiscovered = currentSystem.anomalies.filter(a => !a.discovered);
    
    // Display discovered anomalies
    if(discovered.length > 0){
      const header = document.createElement('div');
      header.style.color = '#10b981';
      header.style.fontSize = '11px';
      header.style.fontWeight = 'bold';
      header.style.marginBottom = '6px';
      header.textContent = 'Discovered Signatures';
      anomalyScannerEl.appendChild(header);
      
      discovered.forEach(anomaly => {
        const anomalyDiv = document.createElement('div');
        anomalyDiv.style.fontSize = '10px';
        anomalyDiv.style.marginBottom = '6px';
        anomalyDiv.style.padding = '4px';
        anomalyDiv.style.background = '#1e293b';
        anomalyDiv.style.borderRadius = '2px';
        anomalyDiv.style.border = '1px solid #10b981';
        
        // Anomaly ID and name
        const nameDiv = document.createElement('div');
        nameDiv.style.color = '#f1f5f9';
        nameDiv.style.fontWeight = 'bold';
        nameDiv.style.marginBottom = '2px';
        nameDiv.textContent = `${anomaly.id} - ${anomaly.name}`;
        anomalyDiv.appendChild(nameDiv);
        
        // Anomaly details
        const detailsDiv = document.createElement('div');
        detailsDiv.style.color = '#94a3b8';
        detailsDiv.style.fontSize = '9px';
        detailsDiv.style.marginBottom = '4px';
        detailsDiv.textContent = `${anomaly.category.toUpperCase()} | ${anomaly.difficulty}`;
        anomalyDiv.appendChild(detailsDiv);
        
        // Warp button
        const warpBtn = document.createElement('button');
        warpBtn.textContent = 'Warp to Anomaly';
        warpBtn.style.fontSize = '9px';
        warpBtn.style.padding = '2px 6px';
        warpBtn.style.width = '100%';
        warpBtn.style.background = '#0891b2';
        warpBtn.onclick = (e) => {
          e.stopPropagation();
          // Check if already warping or on cooldown
          if(player.isWarping || player.warpWarmup > 0 || player.warpCooldown > 0) {
            console.log('Cannot warp: already warping or on cooldown');
            return;
          }
          // Initiate warp to anomaly (no minimum distance for anomalies)
          player.warpWarmup = 180; // 3 second warmup
          player.warpTarget = {x: anomaly.x, y: anomaly.y};
          player.targetCommand = null;
          console.log(`Warping to anomaly: ${anomaly.name} at (${anomaly.x.toFixed(0)}, ${anomaly.y.toFixed(0)})`);
        };
        anomalyDiv.appendChild(warpBtn);
        
        anomalyScannerEl.appendChild(anomalyDiv);
      });
    }
    
    // Display undiscovered signatures (only if has probe launcher)
    if(undiscovered.length > 0){
      const header = document.createElement('div');
      header.style.color = '#64748b';
      header.style.fontSize = '11px';
      header.style.fontWeight = 'bold';
      header.style.marginTop = discovered.length > 0 ? '12px' : '0';
      header.style.marginBottom = '6px';
      header.textContent = 'Unidentified Signatures';
      anomalyScannerEl.appendChild(header);
      
      undiscovered.forEach(anomaly => {
        const anomalyDiv = document.createElement('div');
        anomalyDiv.style.fontSize = '10px';
        anomalyDiv.style.marginBottom = '6px';
        anomalyDiv.style.padding = '4px';
        anomalyDiv.style.background = '#1e293b';
        anomalyDiv.style.borderRadius = '2px';
        anomalyDiv.style.border = '1px solid #64748b';
        
        // Signature ID only (not revealed yet)
        const nameDiv = document.createElement('div');
        nameDiv.style.color = '#94a3b8';
        nameDiv.style.fontWeight = 'bold';
        nameDiv.style.marginBottom = '2px';
        nameDiv.textContent = `${anomaly.id} - Unknown Signature`;
        anomalyDiv.appendChild(nameDiv);
        
        // Scan button (only if has probe launcher)
        if(hasProbes){
          const scanBtn = document.createElement('button');
          scanBtn.textContent = 'Scan Signature';
          scanBtn.style.fontSize = '9px';
          scanBtn.style.padding = '2px 6px';
          scanBtn.style.width = '100%';
          scanBtn.style.background = '#3b82f6';
          scanBtn.onclick = (e) => {
            e.stopPropagation();
            // Mark as discovered
            anomaly.discovered = true;
            updateUI(); // Refresh to show in discovered list
          };
          anomalyDiv.appendChild(scanBtn);
        } else {
          // Show message about needing probe launcher
          const msgDiv = document.createElement('div');
          msgDiv.style.color = '#ef4444';
          msgDiv.style.fontSize = '9px';
          msgDiv.style.marginTop = '2px';
          msgDiv.textContent = 'Requires Core Probe Launcher';
          anomalyDiv.appendChild(msgDiv);
        }
        
        anomalyScannerEl.appendChild(anomalyDiv);
      });
    }
    
    // Show message if no anomalies in system
    if(discovered.length === 0 && undiscovered.length === 0){
      const msgDiv = document.createElement('div');
      msgDiv.style.color = '#64748b';
      msgDiv.style.fontSize = '11px';
      msgDiv.textContent = 'No cosmic signatures detected';
      anomalyScannerEl.appendChild(msgDiv);
    }
  }

  function canWarpToTarget(){
    if(!selectedTarget || !selectedTarget.ref) return false;
    if(player.isWarping || player.warpWarmup > 0 || player.warpCooldown > 0) return false;
    const target = selectedTarget.ref;
    
    // Cannot warp to entities inside anomalies
    if(target.inAnomaly) return false;
    
    const d = dist(player, target);
    if(d < 4000) return false; // Too close to warp
    
    return true;
  }

  function initiateWarp(){
    if(!canWarpToTarget()) return;
    
    const target = selectedTarget.ref;
    player.warpWarmup = 180; // 3 second warmup
    player.warpTarget = {x: target.x, y: target.y};
    player.targetCommand = null;
  }

  // Anomaly pocket functions
  function enterAnomaly(anomaly){
    if(player.inAnomaly) return; // Already in anomaly
    
    console.log('Entering anomaly:', anomaly.name);
    
    // Store current position and state
    player.anomalyBackup = {
      x: player.x,
      y: player.y,
      vx: player.vx,
      vy: player.vy
    };
    
    // Set anomaly state
    player.inAnomaly = true;
    player.currentAnomaly = anomaly;
    player.currentAnomalyId = anomaly.id; // Track which anomaly we're in
    
    // Move player to pocket space (unique coordinates for this anomaly)
    player.x = anomaly.pocketX;
    player.y = anomaly.pocketY;
    player.vx = 0;
    player.vy = 0;
    
    // Generate pocket content based on anomaly type
    generateAnomalyContent(anomaly);
    
    // Open anomaly window if not already open
    if(!anomalyWindowOpen){
      openAnomalyWindow();
    } else {
      updateAnomalyScanner();
    }
    
    updateUI();
  }
  
  function exitAnomaly(){
    if(!player.inAnomaly) return;
    
    console.log('Exiting anomaly');
    
    const completedAnomaly = player.currentAnomaly;
    
    // Clear pocket content
    clearAnomalyContent();
    
    // Restore player position
    if(player.anomalyBackup){
      player.x = player.anomalyBackup.x;
      player.y = player.anomalyBackup.y;
      player.vx = player.anomalyBackup.vx;
      player.vy = player.anomalyBackup.vy;
    }
    
    // If anomaly was completed, mark for respawn
    if(completedAnomaly && completedAnomaly.rewardClaimed){
      const currentSystem = systems[current];
      const anomalyData = ANOMALY_TYPES[completedAnomaly.typeName];
      
      // Remove from active anomalies
      currentSystem.anomalies = currentSystem.anomalies.filter(a => a.id !== completedAnomaly.id);
      
      // Add to respawn queue
      if(anomalyData && anomalyData.respawnTime){
        currentSystem.anomalyRespawnQueue.push({
          typeName: completedAnomaly.typeName,
          x: completedAnomaly.x,
          y: completedAnomaly.y,
          pocketX: completedAnomaly.pocketX,  // Preserve pocket location
          pocketY: completedAnomaly.pocketY,
          timer: anomalyData.respawnTime / 16.666  // Convert milliseconds to frames
        });
      }
    }
    
    // Reset anomaly state
    player.inAnomaly = false;
    player.currentAnomaly = null;
    player.currentAnomalyId = null;
    player.anomalyBackup = null;
    
    // Update anomaly window if open
    if(anomalyWindowOpen){
      updateAnomalyScanner();
    }
    
    updateUI();
  }
  
  function generateAnomalyContent(anomaly){
    const anomalyData = ANOMALY_TYPES[anomaly.typeName];
    if(!anomalyData) return;
    
    const currentSystem = systems[current];
    
    // Clear existing entities in the pocket
    currentSystem.npcs = currentSystem.npcs.filter(npc => !npc.inAnomaly);
    currentSystem.asteroids = currentSystem.asteroids.filter(ast => !ast.inAnomaly);
    
    if(anomaly.category === 'combat'){
      // Spawn NPCs
      const npcCount = Math.floor(Math.random() * (anomalyData.npcs.count[1] - anomalyData.npcs.count[0] + 1)) + anomalyData.npcs.count[0];
      for(let i = 0; i < npcCount; i++){
        const npc = new NPC(
          player.x + rand(1000, 3000) * (Math.random() > 0.5 ? 1 : -1),
          player.y + rand(1000, 3000) * (Math.random() > 0.5 ? 1 : -1)
        );
        // Apply difficulty multiplier
        npc.maxShield *= anomalyData.npcs.difficulty;
        npc.shield = npc.maxShield;
        npc.maxArmor *= anomalyData.npcs.difficulty;
        npc.armor = npc.maxArmor;
        npc.maxHull *= anomalyData.npcs.difficulty;
        npc.hull = npc.maxHull;
        npc.inAnomaly = true; // Mark as anomaly entity
        npc.anomalyId = anomaly.id; // Track which anomaly this belongs to
        currentSystem.npcs.push(npc);
      }
    } else if(anomaly.category === 'mining'){
      // Spawn asteroids
      const asteroidCount = 8 + Math.floor(Math.random() * 8); // 8-15 asteroids
      const oreTypes = Object.keys(ORE_TYPES);
      // Filter to higher-value ores for anomalies
      const premiumOres = oreTypes.filter(ore => ORE_TYPES[ore].price > 50);
      
      for(let i = 0; i < asteroidCount; i++){
        const oreType = premiumOres[Math.floor(Math.random() * premiumOres.length)];
        const amount = Math.floor(rand(500, 1500));
        const asteroid = new Asteroid(
          player.x + rand(500, 2500) * (Math.random() > 0.5 ? 1 : -1),
          player.y + rand(500, 2500) * (Math.random() > 0.5 ? 1 : -1),
          amount,
          oreType
        );
        asteroid.inAnomaly = true; // Mark as anomaly entity
        asteroid.anomalyId = anomaly.id; // Track which anomaly this belongs to
        currentSystem.asteroids.push(asteroid);
      }
    } else if(anomaly.category === 'data' || anomaly.category === 'relic'){
      // Spawn container/hackable objects (for now, spawn some asteroids as placeholders)
      // TODO: Implement actual containers and hacking minigame
      const containerCount = 3 + Math.floor(Math.random() * 3); // 3-5 containers
      for(let i = 0; i < containerCount; i++){
        const asteroid = new Asteroid(
          player.x + rand(800, 2000) * (Math.random() > 0.5 ? 1 : -1),
          player.y + rand(800, 2000) * (Math.random() > 0.5 ? 1 : -1),
          100,
          'Veldspar' // Placeholder
        );
        asteroid.inAnomaly = true;
        asteroid.anomalyId = anomaly.id; // Track which anomaly this belongs to
        asteroid.isContainer = true; // Mark as container for future implementation
        currentSystem.asteroids.push(asteroid);
      }
    }
  }
  
  function clearAnomalyContent(){
    const currentSystem = systems[current];
    // Remove all anomaly entities
    currentSystem.npcs = currentSystem.npcs.filter(npc => !npc.inAnomaly);
    currentSystem.asteroids = currentSystem.asteroids.filter(ast => !ast.inAnomaly);
  }
  
  function checkAnomalyCompletion(){
    if(!player.inAnomaly || !player.currentAnomaly) return false;
    
    const currentSystem = systems[current];
    const anomaly = player.currentAnomaly;
    const anomalyData = ANOMALY_TYPES[anomaly.typeName];
    
    if(!anomalyData) return false;
    
    let completed = false;
    
    if(anomaly.category === 'combat'){
      // Check if all anomaly NPCs are destroyed
      const anomalyNPCs = currentSystem.npcs.filter(npc => npc.inAnomaly);
      if(anomalyNPCs.length === 0){
        completed = true;
      }
    } else if(anomaly.category === 'mining'){
      // Check if all anomaly asteroids are depleted
      const anomalyAsteroids = currentSystem.asteroids.filter(ast => ast.inAnomaly && ast.amount > 0);
      if(anomalyAsteroids.length === 0){
        completed = true;
      }
    } else if(anomaly.category === 'data' || anomaly.category === 'relic'){
      // Check if all containers are looted (for now, just check if depleted)
      const anomalyContainers = currentSystem.asteroids.filter(ast => ast.inAnomaly && ast.isContainer && ast.amount > 0);
      if(anomalyContainers.length === 0){
        completed = true;
      }
    }
    
    if(completed && !anomaly.rewardClaimed){
      awardAnomalyRewards(anomaly, anomalyData);
      anomaly.rewardClaimed = true;
      return true;
    }
    
    return completed;
  }
  
  function awardAnomalyRewards(anomaly, anomalyData){
    if(!anomalyData.rewards) return;
    
    const rewards = anomalyData.rewards;
    
    // ISK bounty
    if(rewards.iskBounty){
      const bounty = Math.floor(rand(rewards.iskBounty[0], rewards.iskBounty[1]));
      player.credits += bounty;
      console.log(`Anomaly completed! Earned ${bounty.toLocaleString()} ISK`);
    }
    
    // Metal scrap
    if(rewards.metalScrap){
      const amount = Math.floor(rand(rewards.metalScrap[0], rewards.metalScrap[1]));
      for(let i = 0; i < amount; i++){
        const metalTypes = Object.keys(METAL_TYPES);
        const randomMetal = metalTypes[Math.floor(Math.random() * metalTypes.length)];
        addToInventory(player.cargoItems, {
          type: 'metal',
          metalType: randomMetal,
          name: randomMetal,
          size: 1
        });
      }
    }
    
    // Ore
    if(rewards.ore){
      const amount = Math.floor(rand(rewards.ore[0], rewards.ore[1]));
      for(let i = 0; i < amount; i++){
        const oreTypes = Object.keys(ORE_TYPES);
        const premiumOres = oreTypes.filter(ore => ORE_TYPES[ore].price > 50);
        const randomOre = premiumOres[Math.floor(Math.random() * premiumOres.length)];
        addToInventory(player.cargoItems, {
          type: 'ore',
          oreType: randomOre,
          name: randomOre,
          size: 1
        });
      }
    }
    
    // Special loot (chance for blueprints/modules)
    if(rewards.specialLoot && Math.random() < rewards.specialLoot){
      // TODO: Implement special loot from ANOMALY_LOOT table
      console.log('Special loot dropped!');
    }
    
    updateUI();
  }

  // Inventory helper functions
  function addToInventory(inventory, item){
    inventory.push(item);
    if(inventory === player.cargoItems){
      player.cargoUsed += item.size;
    }
  }
  
  function removeFromInventory(inventory, index){
    const removed = inventory.splice(index, 1)[0];
    if(inventory === player.cargoItems && removed){
      player.cargoUsed -= removed.size;
    }
    return removed;
  }

  // Fitting functions - slot-based system
  function fitItem(itemName){
    // Try to get weapon or module
    let item = getWeaponModule(itemName);
    let itemType = 'weapon';
    if(!item){
      item = getSubsystemModule(itemName);
      itemType = 'module';
    }
    if(!item) return false;
    
    // Determine which slot array to use
    let slots, slotsMax;
    if(item.slotType === 'high'){
      slots = player.highSlots;
      slotsMax = player.highSlotsMax;
    } else if(item.slotType === 'medium'){
      slots = player.mediumSlots;
      slotsMax = player.mediumSlotsMax;
    } else if(item.slotType === 'low'){
      slots = player.lowSlots;
      slotsMax = player.lowSlotsMax;
    } else {
      console.error(`Invalid slot type: ${item.slotType}`);
      return false;
    }
    
    // Check if slot is available
    if(slots.length >= slotsMax){
      return false; // No free slots
    }
    
    // Check fitting constraints
    if(player.powergridUsed + item.powergridUsage > player.powergridTotal){
      return false;
    }
    if(player.cpuUsed + item.cpuUsage > player.cpuTotal){
      return false;
    }
    
    // Fit the item (already removed from station inventory by caller)
    slots.push(item);
    player.powergridUsed += item.powergridUsage;
    player.cpuUsed += item.cpuUsage;
    
    // Initialize activeModuleStates if it doesn't exist
    if(!player.activeModuleStates){
      player.activeModuleStates = { medium: [], low: [] };
    }
    
    // Initialize active state for active modules
    if(itemType === 'module'){
      if(item.slotType === 'medium'){
        player.activeModuleStates.medium.push(false);
      } else if(item.slotType === 'low'){
        player.activeModuleStates.low.push(false);
      }
    }
    
    // Apply passive bonuses
    if(item.type === 'passive' || (itemType === 'module' && item.type === 'passive')){
      applyModuleBonuses(item, true);
    }
    
    return true;
  }
  
  function unfitItem(slotType, slotIndex){
    let slots;
    if(slotType === 'high'){
      slots = player.highSlots;
    } else if(slotType === 'medium'){
      slots = player.mediumSlots;
    } else if(slotType === 'low'){
      slots = player.lowSlots;
    } else {
      return false;
    }
    
    if(slotIndex < 0 || slotIndex >= slots.length) return false;
    
    const item = slots[slotIndex];
    
    // Remove fitting resources
    player.powergridUsed -= item.powergridUsage;
    player.cpuUsed -= item.cpuUsage;
    
    // Remove passive bonuses
    if(item.type === 'passive'){
      applyModuleBonuses(item, false);
    }
    
    // Initialize activeModuleStates if it doesn't exist
    if(!player.activeModuleStates){
      player.activeModuleStates = { medium: [], low: [] };
    }
    
    // Remove from slot and corresponding active state
    slots.splice(slotIndex, 1);
    if(slotType === 'medium' && player.activeModuleStates.medium.length > slotIndex){
      player.activeModuleStates.medium.splice(slotIndex, 1);
    } else if(slotType === 'low' && player.activeModuleStates.low.length > slotIndex){
      player.activeModuleStates.low.splice(slotIndex, 1);
    }
    
    // Return to station inventory if docked, otherwise to cargo
    const nearStation = systems[current].stations.find(st => dist(player, st) < 300);
    const targetInventory = nearStation ? nearStation.inventory : player.cargoItems;
    const itemType = slotType === 'high' ? 'weapon' : 'module';
    addToInventory(targetInventory, {
      ...item,
      type: itemType,
      name: item.name,
      size: 0.1
    });
    
    return true;
  }
  
  // Apply or remove module bonuses
  function applyModuleBonuses(module, apply){
    const multiplier = apply ? 1 : -1;
    
    if(module.shieldBonus) {
      player.maxShield += module.shieldBonus * multiplier;
      player.shield += module.shieldBonus * multiplier;
    }
    if(module.armorBonus) {
      player.maxArmor += module.armorBonus * multiplier;
      player.armor += module.armorBonus * multiplier;
    }
    if(module.shieldRegenBonus) {
      player.shieldRegen += module.shieldRegenBonus * multiplier;
    }
    if(module.capacitorBonus) {
      player.maxCap += module.capacitorBonus * multiplier;
      player.cap += module.capacitorBonus * multiplier;
    }
    if(module.capacitorRegenBonus) {
      player.capRegen += module.capacitorRegenBonus * multiplier;
    }
    if(module.cargoBonus) {
      player.cargoCap += module.cargoBonus * multiplier;
    }
  }
  
  // Toggle active module activation state
  function toggleModuleActivation(slotType, slotIndex){
    // Initialize activeModuleStates if it doesn't exist
    if(!player.activeModuleStates){
      player.activeModuleStates = { medium: [], low: [] };
    }
    
    let slots, stateArray;
    if(slotType === 'medium'){
      slots = player.mediumSlots;
      stateArray = player.activeModuleStates.medium;
    } else if(slotType === 'low'){
      slots = player.lowSlots;
      stateArray = player.activeModuleStates.low;
    } else {
      return false;
    }
    
    if(slotIndex < 0 || slotIndex >= slots.length) return false;
    
    const module = slots[slotIndex];
    if(!module || module.type !== 'active') return false;
    
    // Toggle state
    const newState = !stateArray[slotIndex];
    stateArray[slotIndex] = newState;
    
    // If activating, apply bonuses (for always-on modules like afterburner)
    if(newState && module.speedBonus && module.category === 'propulsion'){
      // Afterburner speed bonus handled in update loop
    }
    
    return true;
  }
  
  // Process active modules each frame
  function processActiveModules(dt){
    // Initialize activeModuleStates if it doesn't exist
    if(!player.activeModuleStates){
      player.activeModuleStates = { medium: [], low: [] };
    }
    
    // Calculate total speed bonus from all active afterburners
    let totalSpeedMultiplier = 1.0;
    let hasActiveAfterburner = false;
    
    // Process medium slot active modules
    player.mediumSlots.forEach((module, index) => {
      if(!module || module.type !== 'active') return;
      if(!player.activeModuleStates.medium[index]) return; // Not active
      
      // Initialize activation timer if needed
      if(!module.activationTimer) module.activationTimer = 0;
      
      // Afterburner - continuous speed boost with cap drain
      if(module.category === 'propulsion' && module.speedBonus){
        const capPerFrame = (module.capacitorUse / 60) * dt; // Convert per-second to per-frame
        if(player.cap >= capPerFrame){
          player.cap -= capPerFrame;
          // Accumulate speed bonus (multiplicative stacking)
          totalSpeedMultiplier *= module.speedBonus;
          hasActiveAfterburner = true;
        } else {
          // Not enough cap, deactivate
          player.activeModuleStates.medium[index] = false;
        }
      }
      
      // Shield Booster - periodic activation
      if(module.category === 'shield' && module.shieldBoostAmount){
        module.activationTimer -= dt;
        if(module.activationTimer <= 0){
          if(player.cap >= module.capacitorUse){
            player.cap -= module.capacitorUse;
            player.shield = Math.min(player.maxShield, player.shield + module.shieldBoostAmount);
            module.activationTimer = module.activationTime;
          } else {
            // Not enough cap, deactivate
            player.activeModuleStates.medium[index] = false;
          }
        }
      }
      
      // Armor Repairer - periodic activation
      if(module.category === 'armor' && module.armorRepairAmount){
        module.activationTimer -= dt;
        if(module.activationTimer <= 0){
          if(player.cap >= module.capacitorUse){
            player.cap -= module.capacitorUse;
            player.armor = Math.min(player.maxArmor, player.armor + module.armorRepairAmount);
            module.activationTimer = module.activationTime;
          } else {
            // Not enough cap, deactivate
            player.activeModuleStates.medium[index] = false;
          }
        }
      }
    });
    
    // Process low slot active modules (currently only armor repairers can be in low slots)
    player.lowSlots.forEach((module, index) => {
      if(!module || module.type !== 'active') return;
      if(!player.activeModuleStates.low[index]) return;
      
      // Initialize activation timer if needed
      if(!module.activationTimer) module.activationTimer = 0;
      
      // Armor Repairer - periodic activation
      if(module.category === 'armor' && module.armorRepairAmount){
        module.activationTimer -= dt;
        if(module.activationTimer <= 0){
          if(player.cap >= module.capacitorUse){
            player.cap -= module.capacitorUse;
            player.armor = Math.min(player.maxArmor, player.armor + module.armorRepairAmount);
            module.activationTimer = module.activationTime;
          } else {
            // Not enough cap, deactivate
            player.activeModuleStates.low[index] = false;
          }
        }
      }
    });
    
    // Apply accumulated speed bonus from all active afterburners
    if(hasActiveAfterburner && !player.isWarping){
      player.maxSpeed = player.sublightSpeed * totalSpeedMultiplier;
    } else if(!hasActiveAfterburner && !player.isWarping){
      player.maxSpeed = player.sublightSpeed;
    }
  }
  
  // Legacy functions for backwards compatibility - redirect to new system
  function fitWeapon(weaponName){
    return fitItem(weaponName);
  }
  
  function unfitWeapon(weaponName){
    // Find weapon in high slots
    const index = player.highSlots.findIndex(w => w.name === weaponName);
    if(index === -1) return false;
    return unfitItem('high', index);
  }
  
  function fitModule(moduleName){
    return fitItem(moduleName);
  }
  
  function unfitModule(moduleName){
    // Search all slot types
    let index = player.mediumSlots.findIndex(m => m.name === moduleName);
    if(index !== -1) return unfitItem('medium', index);
    
    index = player.lowSlots.findIndex(m => m.name === moduleName);
    if(index !== -1) return unfitItem('low', index);
    
    return false;
  }

  // Old fitModule function removed - replaced above
  // (old code removed for slot-based system)

  function switchShip(shipKey){
    // Save current position and credits
    const savedX = player.x;
    const savedY = player.y;
    const savedCredits = player.credits;
    const savedCargoItems = [...player.cargoItems]; // Copy cargo items array
    
    // Unfit all items and return them to cargo before switching
    while(player.highSlots.length > 0){
      unfitItem('high', 0);
    }
    while(player.mediumSlots.length > 0){
      unfitItem('medium', 0);
    }
    while(player.lowSlots.length > 0){
      unfitItem('low', 0);
    }
    
    // Create new ship
    const newShip = new Ship(shipKey);
    
    // Restore position and economy
    newShip.x = savedX;
    newShip.y = savedY;
    newShip.credits = savedCredits;
    newShip.cargoItems = player.cargoItems; // Use updated cargo with unfitted items
    newShip.cargoUsed = player.cargoItems.reduce((sum, item) => sum + item.size, 0);
    // Trim cargo if new ship can't hold it all
    while(newShip.cargoUsed > newShip.cargoCap && newShip.cargoItems.length > 0){
      const removed = newShip.cargoItems.pop();
      newShip.cargoUsed -= removed.size;
    }
    
    // Copy over to player (replace all properties)
    Object.assign(player, newShip);
    
    // Initialize active module states for new ship
    player.activeModuleStates = {
      medium: [],
      low: []
    };
    
    updateUI();
  }

  function jumpTo(idx, fromGate = null){
    current = idx;
    
    // If jumping from a gate, spawn at the corresponding gate in destination system
    if(fromGate !== null){
      // Find the gate in destination system that leads back to the previous system
      const destGate = systems[idx].stargates.find(g => g.destSystem === fromGate);
      if(destGate){
        player.x = destGate.x + 100; // Spawn slightly offset from gate
        player.y = destGate.y + 100;
      } else {
        // Fallback to station if gate not found
        const station = systems[idx].stations[0];
        player.x = station ? station.x : 10000;
        player.y = station ? station.y : 10000;
      }
    } else {
      // Initial spawn or fallback - spawn at station
      const station = systems[idx].stations[0];
      player.x = station ? station.x : 10000;
      player.y = station ? station.y : 10000;
    }
    
    player.vx = 0;
    player.vy = 0;
    selectedTarget = null;
    player.targetCommand = null;
    autoFire = false;
    player.isWarping = false;
    player.warpTarget = null;
    player.warpWarmup = 0;
    player.warpCooldown = 0;
    player.jumpWarmup = 0;
    player.jumpDestination = null;
    updateUI();
  }

  // Mining action - now uses weapon-based yield system
  function doMine(){
    if(player.miningCooldown > 0) return;
    
    // Mining requires fitted mining laser weapons in high slots
    const miningWeapons = player.highSlots.filter(w => w && w.category === 'mining');
    if(miningWeapons.length === 0) return;
    
    // Check capacitor for all mining lasers
    const totalCapUse = miningWeapons.reduce((sum, w) => sum + w.capacitorUse, 0);
    if(player.cap < totalCapUse) return;
    
    const target = selectedTarget && selectedTarget.type==='asteroid' ? selectedTarget.ref : null;
    if(!target) return;
    
    const d = dist(player, target);
    if(d > 80) return;
    if(target.amount <= 0) return;
    
    const oreData = ORE_TYPES[target.oreType] || ORE_TYPES['Veldspar'];
    const oreSize = oreData.size;
    const maxOre = Math.floor((player.cargoCap - player.cargoUsed) / oreSize);
    if(maxOre <= 0) return;
    
    // Combine mining yield from all mining lasers
    const totalYield = miningWeapons.reduce((sum, w) => sum + w.miningYield, 0);
    const amount = Math.min(target.amount, totalYield, maxOre);
    target.amount -= amount;
    
    // Add ore to cargo
    for(let i = 0; i < amount; i++){
      addToInventory(player.cargoItems, {type: 'ore', name: target.oreType, size: oreSize, oreType: target.oreType});
    }
    player.cap -= totalCapUse;
    
    // Use the fire rate of the first mining laser for cooldown
    player.miningCooldown = miningWeapons[0].fireRate;
    
    // Update cargo display in real-time so player sees ore being collected
    updateCargoDisplay();
    
    // Play mining laser sound
    sounds.playMiningLaser();
    
    // Create mining laser visual effects for each mining laser
    miningWeapons.forEach(weapon => {
      fireEffects.push({
        x1: player.x,
        y1: player.y,
        x2: target.x,
        y2: target.y,
        life: weapon.fireRate,
        maxLife: weapon.fireRate,
        hit: true,
        owner: 'player',
        weaponType: 'mining',
        weaponName: weapon.name
      });
    });
  }

  // Fire with accuracy-based hit calculation
  function fire(){
    if(player.fireCooldown > 0) return;
    
    // Check if we have any combat weapons fitted in high slots (not mining lasers)
    const combatWeapons = player.highSlots.filter(w => w && w.category !== 'mining');
    if(combatWeapons.length === 0) return;
    
    // Check capacitor for all weapons
    const totalCapUse = combatWeapons.reduce((sum, w) => sum + w.capacitorUse, 0);
    if(player.cap < totalCapUse) return;
    
    // Check if near any station (safe zone)
    const s = systems[current];
    if(s.stations.some(st => dist(player, st) < 500)) return;
    
    // Need a target for accuracy-based system
    if(!selectedTarget || !selectedTarget.ref) return;
    if(selectedTarget.type !== 'npc') return; // Only fire at NPCs
    
    const target = selectedTarget.ref;
    const distance = dist(player, target);
    
    // Calculate damage bonus from modules
    let damageBonus = 1.0;
    player.lowSlots.forEach(mod => {
      if(mod && mod.damageBonus) damageBonus += mod.damageBonus;
    });
    
    // Fire each combat weapon
    combatWeapons.forEach(weapon => {
      // Don't fire if beyond max range
      if(distance > weapon.maxRange) return;
      
      // Calculate accuracy based on range
      let accuracy;
      const range65 = weapon.optimalRange * 0.65;
      const range85 = weapon.optimalRange * 0.85;
      
      if(distance <= range65){
        accuracy = weapon.accuracyClose;
      } else if(distance <= range85){
        accuracy = weapon.accuracyMedium;
      } else {
        accuracy = weapon.accuracyLong;
      }
      
      // Roll for hit
      const hit = Math.random() < accuracy;
      
      // Create visual firing effect with weapon info
      fireEffects.push({
        x1: player.x,
        y1: player.y,
        x2: target.x,
        y2: target.y,
        life: 12,
        maxLife: 12,
        hit: hit,
        owner: 'player',
        weaponType: weapon.category,
        weaponName: weapon.name
      });
      
      if(hit){
        // Apply damage to target with damage bonuses
        applyDamage(target, weapon.damage * damageBonus);
      }
    });
    
    // Use fire rate of first weapon for cooldown
    player.fireCooldown = combatWeapons[0].fireRate;
    player.cap -= totalCapUse;
    
    // Play weapon fire sound
    sounds.playWeaponFire();
  }

  // Game loop
  function update(dt){
    dt = Math.min(dt, 2);
    
    // Jump warmup countdown
    if(player.jumpWarmup > 0){
      player.jumpWarmup -= dt;
      if(player.jumpWarmup <= 0 && player.jumpDestination !== null){
        player.jumpFlashTimer = 20; // Flash for ~0.33 seconds
        // Stop warmup sound and play gate jump sound
        sounds.stopGateWarmup();
        sounds.playGateJump();
        jumpTo(player.jumpDestination, current);
        player.jumpDestination = null;
        player.jumpWarmup = 0;
      }
    } else if(sounds.isGateWarmupPlaying) {
      // If warmup was cancelled, stop the sound
      sounds.stopGateWarmup();
    }
    
    // Warp warmup countdown
    if(player.warpWarmup > 0){
      // Smoothly rotate towards warp destination during warmup at fixed rate
      if(player.warpTarget){
        // If in anomaly, calculate angle from backup position (where we'll exit to)
        const fromX = player.inAnomaly && player.anomalyBackup ? player.anomalyBackup.x : player.x;
        const fromY = player.inAnomaly && player.anomalyBackup ? player.anomalyBackup.y : player.y;
        
        const targetAngle = Math.atan2(player.warpTarget.y - fromY, player.warpTarget.x - fromX) + Math.PI / 2;
        
        // Calculate shortest angle difference
        let angleDiff = targetAngle - player.angle;
        while(angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while(angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        // Apply turn rate: 60 deg/sec = ~1.047 rad/sec = 0.01745 rad/frame at 60fps
        const maxTurn = 0.01745 * dt;
        if(Math.abs(angleDiff) > maxTurn){
          player.angle += Math.sign(angleDiff) * maxTurn;
        } else {
          player.angle = targetAngle;
        }
      }
      
      player.warpWarmup -= dt;
      if(player.warpWarmup <= 0 && player.warpTarget){
        // Exit anomaly if warping from inside one
        if(player.inAnomaly){
          exitAnomaly();
        }
        // Play warp enter sound
        sounds.playWarpEnter();
        player.isWarping = true;
        player.maxSpeed = player.warpSpeed;
        player.warpWarmup = 0;
      }
    }
    
    // Warp drive
    if(player.isWarping && player.warpTarget){
      const dx = player.warpTarget.x - player.x;
      const dy = player.warpTarget.y - player.y;
      const d = Math.hypot(dx, dy);
      
      if(d < 500){
        // Play warp exit sound
        sounds.playWarpExit();
        player.isWarping = false;
        player.warpTarget = null;
        player.warpCooldown = 600;
        player.maxSpeed = player.sublightSpeed;
        player.vx = 0;
        player.vy = 0;
        
        // Check if arrived at an anomaly
        if(!player.inAnomaly){
          const currentSystem = systems[current];
          const nearbyAnomaly = currentSystem.anomalies.find(a => {
            const anomalyDist = Math.hypot(player.x - a.x, player.y - a.y);
            return anomalyDist < 1000 && a.discovered; // Within 1000 units and discovered
          });
          
          if(nearbyAnomaly){
            console.log(`Arrived at anomaly ${nearbyAnomaly.name}, entering pocket...`);
            enterAnomaly(nearbyAnomaly);
          } else {
            console.log(`Warp complete at (${player.x.toFixed(0)}, ${player.y.toFixed(0)}), no nearby anomaly found`);
          }
        }
      } else {
        player.vx = (dx/d) * player.warpSpeed;
        player.vy = (dy/d) * player.warpSpeed;
      }
    }
    
    // Manual controls (WASD) - disabled during warp
    if(!player.isWarping && keys['w']) {
      player.vx += Math.sin(player.angle) * player.accel * dt;
      player.vy += -Math.cos(player.angle) * player.accel * dt;
    }
    if(!player.isWarping && keys['s']) {
      player.vx -= Math.sin(player.angle) * player.accel * 0.5 * dt;
      player.vy -= -Math.cos(player.angle) * player.accel * 0.5 * dt;
    }
    if(!player.isWarping && keys['a']) player.angle -= player.turnRate * dt;
    if(!player.isWarping && keys['d']) player.angle += player.turnRate * dt;
    
    // Target command execution (orbit/approach) - disabled during warp
    if(!player.isWarping && player.targetCommand && selectedTarget && selectedTarget.ref){
      const target = selectedTarget.ref;
      const dx = target.x - player.x;
      const dy = target.y - player.y;
      const d = Math.hypot(dx, dy);
      
      const targetAngle = Math.atan2(dy, dx) + Math.PI / 2;
      
      // Smoothly rotate towards target at fixed rate
      let angleDiff = targetAngle - player.angle;
      while(angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while(angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      
      const maxTurn = 0.01745 * dt; // 60 deg/sec
      if(Math.abs(angleDiff) > maxTurn){
        player.angle += Math.sign(angleDiff) * maxTurn;
      } else {
        player.angle = targetAngle;
      }
      
      // Execute movement command
      if(player.targetCommand.type === 'orbit'){
        const targetDist = player.targetCommand.dist;
        if(d > targetDist + 20){
          player.vx += (dx/d) * player.accel * dt;
          player.vy += (dy/d) * player.accel * dt;
        } else if(d < targetDist - 20){
          player.vx -= (dx/d) * player.accel * 0.5 * dt;
          player.vy -= (dy/d) * player.accel * 0.5 * dt;
        }
        player.vx += (-dy/d) * player.accel * 0.6 * dt;
        player.vy += (dx/d) * player.accel * 0.6 * dt;
      } else if(player.targetCommand.type === 'approach'){
        const targetDist = player.targetCommand.dist;
        if(d > targetDist){
          player.vx += (dx/d) * player.accel * dt;
          player.vy += (dy/d) * player.accel * dt;
        } else {
          // Reached approach distance
          // Check if we're auto-jumping to a gate
          if(player.autoJump && selectedTarget && selectedTarget.type === 'gate' && d < 200 && player.jumpWarmup === 0){
            player.jumpWarmup = 600;
            sounds.playGateWarmup();
            player.targetCommand = null;
            player.isWarping = false;
            player.autoJump = false;
          }
        }
      }
    }
    
    // Apply drag and speed cap
    player.vx *= player.drag;
    player.vy *= player.drag;
    const spd = Math.hypot(player.vx, player.vy);
    if(spd > player.maxSpeed){
      player.vx = (player.vx / spd) * player.maxSpeed;
      player.vy = (player.vy / spd) * player.maxSpeed;
    }
    
    // Thrust sound management - sync with thrust animation (when speed > 0.5)
    const shouldPlayThrust = spd > 0.5 && !player.isWarping;
    if(shouldPlayThrust && !sounds.isThrustPlaying) {
      sounds.playThrust();
    } else if(!shouldPlayThrust && sounds.isThrustPlaying) {
      sounds.stopThrust();
    }
    
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    
    // Bounds
    const s = systems[current];
    if(!player.inAnomaly){
      // Normal space boundaries
      player.x = clamp(player.x, 20, s.width - 20);
      player.y = clamp(player.y, 20, s.height - 20);
    } else if(player.currentAnomaly && player.warpWarmup === 0 && !player.isWarping){
      // Anomaly space: confine to 5000 radius circle from pocket center (but not when warping)
      const centerX = player.currentAnomaly.pocketX;
      const centerY = player.currentAnomaly.pocketY;
      const dx = player.x - centerX;
      const dy = player.y - centerY;
      const distFromCenter = Math.hypot(dx, dy);
      const maxRadius = 5000;
      
      if(distFromCenter > maxRadius){
        // Clamp to circle edge
        const angle = Math.atan2(dy, dx);
        player.x = centerX + Math.cos(angle) * maxRadius;
        player.y = centerY + Math.sin(angle) * maxRadius;
        // Stop velocity when hitting boundary
        player.vx = 0;
        player.vy = 0;
      }
    }
    
    // Camera follows player
    camera.x = player.x - canvas.width/2;
    camera.y = player.y - canvas.height/2;
    // Camera bounds (skip when in anomaly pocket)
    if(!player.inAnomaly){
      camera.x = clamp(camera.x, 0, s.width - canvas.width);
      camera.y = clamp(camera.y, 0, s.height - canvas.height);
    }
    
    // Auto-fire
    if(autoFire && selectedTarget && selectedTarget.type==='npc'){
      fire();
    }
    
    // Auto-mine
    if(autoMine && selectedTarget && selectedTarget.type === 'asteroid'){
      doMine();
    }
    
    // Cooldowns and regen
    if(player.fireCooldown > 0) player.fireCooldown = Math.max(0, player.fireCooldown - dt);
    if(player.miningCooldown > 0) player.miningCooldown = Math.max(0, player.miningCooldown - dt);
    if(player.warpCooldown > 0) player.warpCooldown = Math.max(0, player.warpCooldown - dt);
    player.shield = Math.min(player.maxShield, player.shield + player.shieldRegen * dt * 0.1);
    player.cap = Math.min(player.maxCap, player.cap + player.capRegen * dt * 0.1);
    
    // Process active modules
    processActiveModules(dt);

    // NPC AI
    s.npcs.forEach(n=>{
      n.x += n.vx * dt;
      n.y += n.vy * dt;
      
      // Bounds - keep NPCs within system boundaries (skip for anomaly NPCs)
      if(!n.inAnomaly){
        n.x = clamp(n.x, 20, s.width - 20);
        n.y = clamp(n.y, 20, s.height - 20);
      }
      
      // Check if NPC is near any station (safe zone)
      const nearStationNPC = s.stations.some(st => dist(n, st) < 500);
      const nearStationPlayer = s.stations.some(st => dist(player, st) < 500);
      
      const dPlayer = dist(n, player);
      if(dPlayer < 250 && !nearStationNPC){
        const ang = Math.atan2(player.y - n.y, player.x - n.x);
        n.vx += Math.cos(ang) * 0.015 * dt;
        n.vy += Math.sin(ang) * 0.015 * dt;
      }
      
      const nSpd = Math.hypot(n.vx, n.vy);
      if(nSpd > 2){
        n.vx = (n.vx / nSpd) * 2;
        n.vy = (n.vy / nSpd) * 2;
      }
      
      n.fireCooldown = (n.fireCooldown || 0) - dt;
      if(dPlayer <= n.maxRange && n.fireCooldown <= 0 && !nearStationNPC && !nearStationPlayer){
        // Calculate accuracy based on range
        let accuracy;
        const range65 = n.maxRange * 0.65;
        const range85 = n.maxRange * 0.85;
        
        if(dPlayer <= range65){
          accuracy = 0.90;
        } else if(dPlayer <= range85){
          accuracy = 0.70;
        } else {
          accuracy = 0.35;
        }
        
        // Roll for hit
        const hit = Math.random() < accuracy;
        
        // Create visual firing effect
        fireEffects.push({
          x1: n.x,
          y1: n.y,
          x2: player.x,
          y2: player.y,
          life: 12,
          maxLife: 12,
          hit: hit,
          owner: 'npc',
          weaponType: 'turret',
          weaponName: 'Pirate Turret'
        });
        
        // Play enemy weapon fire sound
        sounds.playWeaponFire();
        
        if(hit){
          applyDamage(player, 12);
        }
        
        n.fireCooldown = 40;
      }
      
      n.shield = Math.min(n.maxShield, n.shield + 0.3 * dt * 0.1);
    });

    // Cleanup dead NPCs
    for(let i=s.npcs.length-1; i>=0; i--){
      const n = s.npcs[i];
      if(n.hull <= 0){
        // Play explosion sound
        sounds.playExplosion();
        
        player.credits += 150;
        const killed = s.npcs.splice(i,1)[0];
        
        // Create wreck with loot
        const wreck = new Wreck(killed.x, killed.y, 'Pirate Wreckage');
        
        // Add random ore to wreck cargo (3-8 units)
        const oreTypes = ['Veldspar', 'Scordite', 'Pyroxeres', 'Plagioclase'];
        const oreType = oreTypes[Math.floor(Math.random() * oreTypes.length)];
        const oreAmount = Math.floor(rand(3, 9));
        const oreData = ORE_TYPES[oreType];
        for(let j = 0; j < oreAmount; j++){
          wreck.cargo.push({type: 'ore', name: oreType, size: oreData.size, oreType: oreType});
        }
        
        // Add metal scraps based on ship class (frigates drop fewer, bigger ships more)
        const metalType = getMetalTypeForShip('frigate'); // NPCs are frigates for now
        const metalAmount = getMetalAmount('frigate');
        const metalData = METAL_TYPES[metalType];
        for(let j = 0; j < metalAmount; j++){
          wreck.cargo.push({type: 'metal', name: metalType, size: metalData.size, metalType: metalType});
        }
        
        s.wrecks.push(wreck);
        
        // Schedule NPC respawn after 1 minute
        if(!s.npcRespawnQueue) s.npcRespawnQueue = [];
        s.npcRespawnQueue.push({
          timer: 3600, // 60 seconds * 60 ticks
          systemIndex: current
        });
        
        if(selectedTarget && selectedTarget.type==='npc' && selectedTarget.ref === killed){
          selectedTarget = null;
          player.targetCommand = null;
        }
      }
    }
    
    // Process NPC respawn queue
    if(!s.npcRespawnQueue) s.npcRespawnQueue = [];
    for(let i = s.npcRespawnQueue.length - 1; i >= 0; i--){
      s.npcRespawnQueue[i].timer -= dt;
      if(s.npcRespawnQueue[i].timer <= 0){
        // Respawn NPC at random location
        s.npcs.push(new NPC(
          rand(3000, s.width - 3000),
          rand(3000, s.height - 3000)
        ));
        s.npcRespawnQueue.splice(i, 1);
      }
    }
    
    // Handle depleted asteroids - queue them for respawn
    if(!s.asteroidRespawnQueue) s.asteroidRespawnQueue = [];
    const depletedAsteroids = s.asteroids.filter(a => a.amount <= 0);
    depletedAsteroids.forEach(ast => {
      s.asteroidRespawnQueue.push({
        timer: 18000, // 5 minutes * 60 seconds * 60 ticks
        x: ast.x,
        y: ast.y,
        maxAmount: ast.maxAmount,
        oreType: ast.oreType,
        systemIndex: current
      });
    });
    s.asteroids = s.asteroids.filter(a => a.amount > 0);
    
    // Process asteroid respawn queue
    if(!s.asteroidRespawnQueue) s.asteroidRespawnQueue = [];
    for(let i = s.asteroidRespawnQueue.length - 1; i >= 0; i--){
      s.asteroidRespawnQueue[i].timer -= dt;
      if(s.asteroidRespawnQueue[i].timer <= 0){
        const respawn = s.asteroidRespawnQueue[i];
        // Respawn asteroid at same location with same ore type and amount
        s.asteroids.push(new Asteroid(
          respawn.x,
          respawn.y,
          respawn.maxAmount,
          respawn.oreType
        ));
        s.asteroidRespawnQueue.splice(i, 1);
      }
    }
    
    // Process anomaly respawn queue
    if(!s.anomalyRespawnQueue) s.anomalyRespawnQueue = [];
    for(let i = s.anomalyRespawnQueue.length - 1; i >= 0; i--){
      s.anomalyRespawnQueue[i].timer -= dt;
      if(s.anomalyRespawnQueue[i].timer <= 0){
        const respawn = s.anomalyRespawnQueue[i];
        const anomalyData = ANOMALY_TYPES[respawn.typeName];
        if(anomalyData){
          // Respawn anomaly at same location
          const discovered = !anomalyData.requiresScanning || Math.random() < 0.3;
          s.anomalies.push({
            id: Math.random().toString(36).substr(2, 9),
            typeName: respawn.typeName,
            type: anomalyData.type,
            name: anomalyData.name,
            category: anomalyData.type,
            difficulty: anomalyData.difficulty,
            discovered: discovered,
            x: respawn.x,
            y: respawn.y,
            pocketX: respawn.pocketX,  // Use same pocket location
            pocketY: respawn.pocketY,
            rewardClaimed: false
          });
        }
        s.anomalyRespawnQueue.splice(i, 1);
      }
    }
    
    // Update wreck despawn timers
    s.wrecks.forEach(w => {
      w.despawnTimer -= dt;
    });
    
    // Remove empty wrecks or expired wrecks
    s.wrecks = s.wrecks.filter(w => {
      if(w.cargo.length === 0) return false; // Empty
      if(w.despawnTimer <= 0) {
        // Close wreck window if this wreck is despawning
        if(currentWreck === w){
          closeWreckWindow();
        }
        // Clear selection if this wreck is selected
        if(selectedTarget && selectedTarget.type === 'wreck' && selectedTarget.ref === w){
          selectedTarget = null;
        }
        return false; // Despawned
      }
      return true; // Keep wreck
    });
    
    // Update fire effects
    for(let i = fireEffects.length - 1; i >= 0; i--){
      fireEffects[i].life -= dt;
      if(fireEffects[i].life <= 0){
        fireEffects.splice(i, 1);
      }
    }
    
    // Update jump flash timer
    if(player.jumpFlashTimer > 0){
      player.jumpFlashTimer = Math.max(0, player.jumpFlashTimer - dt);
    }
  }
  
  function applyDamage(target, dmg){
    if(target.shield > 0){
      target.shield -= dmg;
      if(target.shield < 0){
        dmg = -target.shield;
        target.shield = 0;
      } else {
        return;
      }
    }
    if(target.armor > 0){
      target.armor -= dmg;
      if(target.armor < 0){
        dmg = -target.armor;
        target.armor = 0;
      } else {
        return;
      }
    }
    target.hull -= dmg;
    
    // Check if player died
    if(target === player && target.hull <= 0){
      target.hull = 0;
      // Play explosion sound
      sounds.playExplosion();
      handlePlayerDeath();
    }
  }
  
  function handlePlayerDeath(){
    // Respawn at nearest station with penalties
    const s = systems[current];
    const nearestStation = s.stations[0]; // Use first station
    
    if(nearestStation){
      player.x = nearestStation.x + 100;
      player.y = nearestStation.y;
      player.vx = 0;
      player.vy = 0;
      player.isWarping = false;
      player.warpWarmup = 0;
      player.warpTarget = null;
    }
    
    // Restore all defenses
    player.shield = player.maxShield;
    player.armor = player.maxArmor;
    player.hull = player.maxHull;
    player.cap = player.maxCap;
    
    // Apply death penalty
    const deathPenalty = Math.floor(player.credits * 0.1); // Lose 10% of credits
    player.credits = Math.max(0, player.credits - deathPenalty);
    
    // Clear target
    selectedTarget = null;
    
    updateUI();
  }

  // Render HUD on canvas
  function renderHUD(){
    canvasButtons = []; // Reset button tracking
    const s = systems[current];
    
    // === TOP LEFT: System Info ===
    const secColor = s.security > 0.5 ? '#4ade80' : (s.security > 0.2 ? '#fbbf24' : '#ef4444');
    ctx.fillStyle = 'rgba(10, 14, 26, 0.7)';
    ctx.fillRect(10, 10, 180, 60);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 180, 60);
    
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(s.name, 20, 32);
    
    ctx.fillStyle = secColor;
    ctx.font = '13px sans-serif';
    ctx.fillText(`Security: ${s.security.toFixed(1)}`, 20, 52);
    
    // === CENTER BOTTOM: Ship Status ===
    const spd = Math.hypot(player.vx, player.vy);
    const statWidth = 280;
    const statX = (canvas.width - statWidth) / 2;
    const statY = canvas.height - 130;
    
    ctx.fillStyle = 'rgba(10, 14, 26, 0.7)';
    ctx.fillRect(statX, statY, statWidth, 120);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(statX, statY, statWidth, 120);
    
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    let yOffset = statY + 20;
    
    // Shield bar
    if(player.maxShield > 0){
      const sPct = player.shield / player.maxShield;
      ctx.fillText(`Shield: ${Math.round(player.shield)}/${player.maxShield}`, statX + 10, yOffset);
      const barY = yOffset + 4;
      const barW = statWidth - 20;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(statX + 10, barY, barW, 6);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(statX + 10, barY, barW * sPct, 6);
      yOffset += 20;
    }
    
    // Armor bar
    if(player.maxArmor > 0){
      const aPct = player.armor / player.maxArmor;
      ctx.fillStyle = '#f1f5f9';
      ctx.fillText(`Armor: ${Math.round(player.armor)}/${player.maxArmor}`, statX + 10, yOffset);
      const barY = yOffset + 4;
      const barW = statWidth - 20;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(statX + 10, barY, barW, 6);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(statX + 10, barY, barW * aPct, 6);
      yOffset += 20;
    }
    
    // Hull bar
    const hPct = player.hull / player.maxHull;
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(`Hull: ${Math.round(player.hull)}/${player.maxHull}`, statX + 10, yOffset);
    const barY = yOffset + 4;
    const barW = statWidth - 20;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(statX + 10, barY, barW, 6);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(statX + 10, barY, barW * hPct, 6);
    yOffset += 20;
    
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(`Cap: ${Math.round(player.cap)}/${player.maxCap}`, statX + 10, yOffset);
    yOffset += 16;
    ctx.fillText(`Speed: ${spd.toFixed(1)} m/s`, statX + 10, yOffset);
    
    // Timers
    yOffset += 16;
    if(player.warpCooldown > 0){
      ctx.fillStyle = '#64748b';
      ctx.fillText(`Warp cooldown: ${(player.warpCooldown/60).toFixed(1)}s`, statX + 10, yOffset);
      yOffset += 16;
    }
    if(player.warpWarmup > 0){
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`WARP IN ${(player.warpWarmup/60).toFixed(1)}s`, canvas.width/2, 30);
      ctx.textAlign = 'left';
      ctx.font = '12px monospace';
      ctx.fillStyle = '#f1f5f9';
    }
    if(player.jumpWarmup > 0){
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`JUMP IN ${(player.jumpWarmup/60).toFixed(1)}s`, canvas.width/2, 30);
      ctx.textAlign = 'left';
      ctx.font = '12px monospace';
      ctx.fillStyle = '#f1f5f9';
    }
    
    // Jump flash effect overlay
    if(player.jumpFlashTimer > 0){
      const flashAlpha = player.jumpFlashTimer / 20;
      
      // Full screen flash
      ctx.fillStyle = `rgba(34, 211, 238, ${flashAlpha * 0.4})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Radial burst from center
      const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width * 0.7);
      gradient.addColorStop(0, `rgba(251, 191, 36, ${flashAlpha * 0.6})`);
      gradient.addColorStop(0.4, `rgba(34, 211, 238, ${flashAlpha * 0.3})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // === TOP RIGHT: Target Info & Actions ===
    const rightX = canvas.width - 250;
    const rightY = 10;
    const rightWidth = 240;
    let targetPanelHeight = 0;
    
    if(selectedTarget && selectedTarget.ref){
      const target = selectedTarget.ref;
      const d = Math.round(dist(player, target));
      let panelHeight = 120;
      targetPanelHeight = panelHeight;
      
      ctx.fillStyle = 'rgba(10, 14, 26, 0.7)';
      ctx.fillRect(rightX, rightY, rightWidth, panelHeight);
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(rightX, rightY, rightWidth, panelHeight);
      
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      
      let ty = rightY + 20;
      if(selectedTarget.type === 'npc'){
        const n = target;
        ctx.fillText(`Target: ${n.type}`, rightX + 10, ty);
        ty += 16;
        ctx.font = '11px monospace';
        ctx.fillText(`Distance: ${d}m`, rightX + 10, ty);
        ty += 16;
        
        // Shield bar
        if(n.maxShield > 0){
          const sPct = n.shield / n.maxShield;
          ctx.fillStyle = '#f1f5f9';
          ctx.font = '10px monospace';
          ctx.fillText(`Shield: ${Math.round(n.shield)}/${n.maxShield}`, rightX + 10, ty);
          const barY = ty + 2;
          const barW = rightWidth - 20;
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(rightX + 10, barY, barW, 5);
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(rightX + 10, barY, barW * sPct, 5);
          ty += 14;
        }
        
        // Armor bar
        if(n.maxArmor > 0){
          const aPct = n.armor / n.maxArmor;
          ctx.fillStyle = '#f1f5f9';
          ctx.font = '10px monospace';
          ctx.fillText(`Armor: ${Math.round(n.armor)}/${n.maxArmor}`, rightX + 10, ty);
          const barY = ty + 2;
          const barW = rightWidth - 20;
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(rightX + 10, barY, barW, 5);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(rightX + 10, barY, barW * aPct, 5);
          ty += 14;
        }
        
        // Hull bar
        const hPct = n.hull / n.maxHull;
        ctx.fillStyle = '#f1f5f9';
        ctx.font = '10px monospace';
        ctx.fillText(`Hull: ${Math.round(n.hull)}/${n.maxHull}`, rightX + 10, ty);
        const barY = ty + 2;
        const barW = rightWidth - 20;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(rightX + 10, barY, barW, 5);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(rightX + 10, barY, barW * hPct, 5);
        ty += 14;
        
        // Buttons
        ty += 5;
        const warpEnabled = canWarpToTarget();
        const btn1 = {x: rightX + 10, y: ty, w: 70, h: 20, label: 'Warp To', action: initiateWarp, disabled: !warpEnabled};
        drawButton(btn1, warpEnabled ? undefined : '#0f172a');
        if(warpEnabled) canvasButtons.push(btn1);
        
        const btn2 = {x: rightX + 85, y: ty, w: 60, h: 20, label: 'Orbit', action: () => { 
          console.log('Orbit button clicked');
          const orbitDist = d > 400 ? 400 : d;
          player.targetCommand={type:'orbit',dist:orbitDist}; 
        }};
        drawButton(btn2);
        canvasButtons.push(btn2);
        
        const btn3 = {x: rightX + 150, y: ty, w: 80, h: 20, label: 'Approach', action: () => { 
          console.log('Approach button clicked');
          player.targetCommand={type:'approach',dist:500}; 
        }};
        drawButton(btn3);
        canvasButtons.push(btn3);
        
      } else if(selectedTarget.type === 'asteroid'){
        const a = target;
        ctx.fillText('Target: Asteroid', rightX + 10, ty);
        ty += 16;
        ctx.font = '11px monospace';
        ctx.fillText(`Distance: ${d}m`, rightX + 10, ty);
        ty += 14;
        ctx.fillText(`Ore: ${Math.round(a.amount)}/${a.maxAmount}`, rightX + 10, ty);
        
        ty += 20;
        const warpEnabled = canWarpToTarget();
        const btn1 = {x: rightX + 10, y: ty, w: 70, h: 20, label: 'Warp To', action: initiateWarp, disabled: !warpEnabled};
        drawButton(btn1, warpEnabled ? undefined : '#0f172a');
        if(warpEnabled) canvasButtons.push(btn1);
        
        const btn2 = {x: rightX + 85, y: ty, w: 80, h: 20, label: 'Approach', action: () => { player.targetCommand={type:'approach',dist:500}; }};
        drawButton(btn2);
        canvasButtons.push(btn2);
        
        const btn3 = {x: rightX + 170, y: ty, w: 60, h: 20, label: 'Mine', action: () => {
          autoMine = true;
          player.targetCommand = {type:'approach', dist:100};
        }};
        drawButton(btn3);
        canvasButtons.push(btn3);
        
      } else if(selectedTarget.type === 'gate'){
        const g = target;
        ctx.fillText(`${g.name}`, rightX + 10, ty);
        ty += 16;
        ctx.font = '11px monospace';
        ctx.fillText(`Distance: ${d}m`, rightX + 10, ty);
        ty += 14;
        ctx.fillText(`To: ${systems[g.destSystem].name}`, rightX + 10, ty);
        
        ty += 20;
        const warpEnabled = canWarpToTarget();
        const btn1 = {x: rightX + 10, y: ty, w: 60, h: 20, label: 'Warp', action: initiateWarp, disabled: !warpEnabled};
        drawButton(btn1, warpEnabled ? undefined : '#0f172a');
        if(warpEnabled) canvasButtons.push(btn1);
        
        const btn2 = {x: rightX + 75, y: ty, w: 80, h: 20, label: 'Approach', action: () => { player.targetCommand={type:'approach',dist:500}; }};
        drawButton(btn2);
        canvasButtons.push(btn2);
        
        const btn3 = {x: rightX + 160, y: ty, w: 70, h: 20, label: 'Jump', action: () => {
          const d = dist(player, target);
          if(d > 1000){
            // Too far to jump
            return;
          } else if(d < 200 && player.jumpWarmup === 0){
            // Close enough - jump immediately
            player.jumpWarmup = 600;
            sounds.playGateWarmup();
            player.jumpDestination = g.destSystem;
            player.targetCommand = null;
            player.isWarping = false;
            player.autoJump = false;
          } else if(player.jumpWarmup === 0){
            // Within 1000m but not close enough - approach and auto-jump
            player.targetCommand = {type:'approach', dist:150};
            player.autoJump = true;
            player.jumpDestination = g.destSystem;
          }
        }};
        drawButton(btn3, '#166534');
        canvasButtons.push(btn3);
        
      } else if(selectedTarget.type === 'wreck'){
        const w = target;
        ctx.fillText('Target: Wreck', rightX + 10, ty);
        ty += 16;
        ctx.font = '11px monospace';
        ctx.fillText(`Distance: ${d}m`, rightX + 10, ty);
        ty += 14;
        
        // Show cargo contents
        const cargoCount = w.cargo.length;
        ctx.fillText(`Contents: ${cargoCount} items`, rightX + 10, ty);
        ty += 20;
        
        // Open Cargo button
        const openBtn = {x: rightX + 10, y: ty, w: 100, h: 20, label: 'Open Cargo', action: () => {
          if(d > 200){
            console.log('Too far to loot');
            return;
          }
          openWreckWindow(w);
        }};
        drawButton(openBtn, d <= 200 ? '#166534' : '#1e3a4e');
        canvasButtons.push(openBtn);
        
        const approachBtn = {x: rightX + 115, y: ty, w: 115, h: 20, label: 'Approach', action: () => {
          player.targetCommand={type:'approach',dist:100};
        }};
        drawButton(approachBtn);
        canvasButtons.push(approachBtn);
        
      } else if(selectedTarget.type === 'station'){
        const st = target;
        ctx.fillText(`${st.name}`, rightX + 10, ty);
        ty += 16;
        ctx.font = '11px monospace';
        ctx.fillText(`Distance: ${d}m`, rightX + 10, ty);
        ty += 14;
        ctx.fillText('Safe Zone - Services', rightX + 10, ty);
        
        ty += 20;
        const warpEnabled = canWarpToTarget();
        const btn1 = {x: rightX + 10, y: ty, w: 60, h: 20, label: 'Warp', action: initiateWarp, disabled: !warpEnabled};
        drawButton(btn1, warpEnabled ? undefined : '#0f172a');
        if(warpEnabled) canvasButtons.push(btn1);
        
        const btn2 = {x: rightX + 75, y: ty, w: 80, h: 20, label: 'Approach', action: () => { player.targetCommand={type:'approach',dist:500}; }};
        drawButton(btn2);
        canvasButtons.push(btn2);
        
        const btn3 = {x: rightX + 160, y: ty, w: 70, h: 20, label: 'Dock', action: () => { player.targetCommand={type:'approach',dist:50}; }};
        drawButton(btn3, '#166534');
        canvasButtons.push(btn3);
        
        // Add Station Services button if docked
        if(d < 30){
          ty += 25;
          const btn4 = {x: rightX + 10, y: ty, w: 220, h: 20, label: 'Open Station Services', action: () => { openStationWindow(selectedTarget.ref); }};
          drawButton(btn4, '#0284c7');
          canvasButtons.push(btn4);
        }
      }
    }
    
    // === Tactical Overview (always visible) ===
    const overviewY = selectedTarget && selectedTarget.ref ? rightY + targetPanelHeight + 10 : rightY;
    const overviewHeight = overviewCollapsed ? 30 : 250;
    
    ctx.fillStyle = 'rgba(10, 14, 26, 0.7)';
    ctx.fillRect(rightX, overviewY, rightWidth, overviewHeight);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(rightX, overviewY, rightWidth, overviewHeight);
    
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('TACTICAL OVERVIEW', rightX + 10, overviewY + 18);
    
    // Collapse/Expand button
    const toggleBtn = {
      x: rightX + rightWidth - 25,
      y: overviewY + 5,
      w: 20,
      h: 20,
      label: overviewCollapsed ? '+' : '-',
      action: () => { overviewCollapsed = !overviewCollapsed; }
    };
    drawButton(toggleBtn, '#1e3a4e');
    canvasButtons.push(toggleBtn);
    
    // Build nearby list (only if not collapsed)
    if(!overviewCollapsed){
      const nearby = [];
      
      // Only show stations/gates if not in anomaly
      if(!player.inAnomaly){
        s.stations.forEach(st=>{
          const d = Math.round(dist(player, st));
          nearby.push({type:'station', obj:st, dist:d, name:st.name});
        });
        s.stargates.forEach(g=>{
          const d = Math.round(dist(player, g));
          nearby.push({type:'gate', obj:g, dist:d, name:g.name});
        });
      }
      
      // Filter asteroids/NPCs/wrecks by anomaly context
      s.asteroids.forEach(a=>{
        // Skip if entity is in different anomaly than player
        if(a.inAnomaly && (!player.inAnomaly || a.anomalyId !== player.currentAnomalyId)) return;
        // Skip if player is in anomaly but entity is not
        if(player.inAnomaly && !a.inAnomaly) return;
        
        const d = Math.round(dist(player, a));
        nearby.push({type:'asteroid', obj:a, dist:d, name:`Asteroid (${a.oreType})`});
      });
      s.npcs.forEach(n=>{
        // Skip if entity is in different anomaly than player
        if(n.inAnomaly && (!player.inAnomaly || n.anomalyId !== player.currentAnomalyId)) return;
        // Skip if player is in anomaly but entity is not
        if(player.inAnomaly && !n.inAnomaly) return;
        
        const d = Math.round(dist(player, n));
        nearby.push({type:'npc', obj:n, dist:d, name:n.type});
      });
      s.wrecks.forEach(w=>{
        // Skip if entity is in different anomaly than player
        if(w.inAnomaly && (!player.inAnomaly || w.anomalyId !== player.currentAnomalyId)) return;
        // Skip if player is in anomaly but entity is not
        if(player.inAnomaly && !w.inAnomaly) return;
        
        const d = Math.round(dist(player, w));
        nearby.push({type:'wreck', obj:w, dist:d, name:w.name});
      });
      nearby.sort((a,b)=>a.dist-b.dist);
      
      // Limit scroll
      const maxScroll = Math.max(0, nearby.length - 9);
      if(overviewScrollOffset > maxScroll) overviewScrollOffset = maxScroll;
      
      const visibleArea = overviewHeight - 35;
      const itemHeight = 22;
      const startY = overviewY + 35;
      
      // Render visible items
      let oy = startY;
      const startIdx = Math.floor(overviewScrollOffset);
      const endIdx = Math.min(nearby.length, startIdx + Math.ceil(visibleArea / itemHeight));
      
      for(let i = startIdx; i < endIdx; i++){
        const item = nearby[i];
        const btn = {
          x: rightX + 10,
          y: oy,
          w: rightWidth - 30,
          h: 18,
          label: `${item.name} (${item.dist}m)`,
          action: () => {
            selectedTarget = {type:item.type, ref:item.obj};
            player.targetCommand = null;
            player.approachRotating = false;
            player.approachRotationTime = 0;
          }
        };
        if(oy >= startY && oy + 18 <= overviewY + overviewHeight){
          drawButton(btn, '#1e3a4e');
          canvasButtons.push(btn);
        }
        oy += itemHeight;
      }
      
      // Draw scrollbar if needed
      if(nearby.length > 9){
        const scrollbarX = rightX + rightWidth - 15;
        const scrollbarY = startY;
        const scrollbarHeight = visibleArea - 10;
        const thumbHeight = Math.max(20, (9 / nearby.length) * scrollbarHeight);
        const thumbY = scrollbarY + (overviewScrollOffset / maxScroll) * (scrollbarHeight - thumbHeight);
        
        // Scrollbar track
        ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
        ctx.fillRect(scrollbarX, scrollbarY, 10, scrollbarHeight);
        
        // Scrollbar thumb
        ctx.fillStyle = '#475569';
        ctx.fillRect(scrollbarX, thumbY, 10, thumbHeight);
      }
    }
    
    // Off-screen target indicator
    if(selectedTarget && selectedTarget.ref){
      const target = selectedTarget.ref;
      const screenX = target.x - camera.x;
      const screenY = target.y - camera.y;
      
      if(screenX < 0 || screenX > canvas.width || screenY < 0 || screenY > canvas.height){
        const angle = Math.atan2(target.y - player.y, target.x - player.x);
        const indicatorDist = 60;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        let edgeX = centerX + Math.cos(angle) * indicatorDist;
        let edgeY = centerY + Math.sin(angle) * indicatorDist;
        
        const margin = 30;
        edgeX = Math.max(margin, Math.min(canvas.width - margin, edgeX));
        edgeY = Math.max(margin, Math.min(canvas.height - margin, edgeY));
        
        ctx.save();
        ctx.translate(edgeX, edgeY);
        ctx.rotate(angle);
        
        const color = selectedTarget.type === 'npc' ? '#ef4444' : 
                     (selectedTarget.type === 'gate' ? '#fbbf24' : 
                     (selectedTarget.type === 'station' ? '#3b82f6' : 
                     (selectedTarget.type === 'wreck' ? '#94a3b8' : '#06b6d4')));
        ctx.fillStyle = color;
        ctx.strokeStyle = '#0a0e1a';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(-8, -8);
        ctx.lineTo(-8, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
        
        const d = Math.round(dist(player, target));
        ctx.fillStyle = color;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${(d/1000).toFixed(1)}km`, edgeX, edgeY + 20);
      }
    }
    
    // Coordinates
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    if(player.inAnomaly){
      ctx.fillText('[ ANOMALY SPACE ]', 55, canvas.height - 10);
    } else {
      ctx.fillText(`X: ${Math.round(player.x)} Y: ${Math.round(player.y)}`, 55, canvas.height - 10);
    }
    if(player.isWarping){
      ctx.textAlign = 'center';
      ctx.fillText('[ WARP DRIVE ACTIVE ]', canvas.width/2, 30);
    }
  }
  
  function drawButton(btn, bgColor = '#1e3a4e'){
    ctx.fillStyle = bgColor;
    ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
    
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(btn.label, btn.x + btn.w/2, btn.y + btn.h/2 + 4);
  }

  // Draw
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    const s = systems[current];
    
    // Draw nebulas (behind stars) - tile across all space
    const time = Date.now() / 1000;
    const tileSize = 20000; // Match the original system size for tiling
    
    // Calculate which tiles are visible
    const tileMinX = Math.floor((camera.x - 2000) / tileSize);
    const tileMaxX = Math.floor((camera.x + canvas.width + 2000) / tileSize);
    const tileMinY = Math.floor((camera.y - 2000) / tileSize);
    const tileMaxY = Math.floor((camera.y + canvas.height + 2000) / tileSize);
    
    // Draw nebulas from each visible tile
    for(let tileX = tileMinX; tileX <= tileMaxX; tileX++){
      for(let tileY = tileMinY; tileY <= tileMaxY; tileY++){
        const offsetX = tileX * tileSize;
        const offsetY = tileY * tileSize;
        
        s.nebulas.forEach(nebula => {
          const nebulaX = nebula.x + offsetX;
          const nebulaY = nebula.y + offsetY;
          
          // Only render nebulas visible in viewport (with margin for size)
          if(nebulaX < camera.x - nebula.size || nebulaX > camera.x + canvas.width + nebula.size) return;
          if(nebulaY < camera.y - nebula.size || nebulaY > camera.y + canvas.height + nebula.size) return;
          
          // Subtle pulsing effect
          const pulse = Math.sin(time * 0.5 + nebula.drift) * 0.03 + 0.97;
          const opacity = nebula.opacity * pulse;
          
          // Create radial gradient for nebula
          const gradient = ctx.createRadialGradient(nebulaX, nebulaY, 0, nebulaX, nebulaY, nebula.size);
          gradient.addColorStop(0, `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, ${opacity})`);
          gradient.addColorStop(0.5, `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, ${opacity * 0.5})`);
          gradient.addColorStop(1, `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(nebulaX, nebulaY, nebula.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }
    
    // Draw background stars - tile across all space
    for(let tileX = tileMinX; tileX <= tileMaxX; tileX++){
      for(let tileY = tileMinY; tileY <= tileMaxY; tileY++){
        const offsetX = tileX * tileSize;
        const offsetY = tileY * tileSize;
        
        s.stars.forEach(star => {
          const starX = star.x + offsetX;
          const starY = star.y + offsetY;
          
          // Only render stars visible in viewport (with some margin)
          if(starX < camera.x - 100 || starX > camera.x + canvas.width + 100) return;
          if(starY < camera.y - 100 || starY > camera.y + canvas.height + 100) return;
          
          // Subtle twinkling effect
          const twinkle = Math.sin(time * 2 + star.twinkle) * 0.15 + 0.85;
          const alpha = star.brightness * twinkle;
          
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(starX, starY, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }
    
    // Draw anomaly boundary circle (if in anomaly)
    if(player.inAnomaly && player.currentAnomaly){
      const centerX = player.currentAnomaly.pocketX;
      const centerY = player.currentAnomaly.pocketY;
      const radius = 5000;
      
      // Draw boundary circle
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 3;
      ctx.setLineDash([20, 10]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw faint inner circle
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 50, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Draw grid (if enabled)
    if(showGrid){
      ctx.strokeStyle='rgba(20,60,80,0.3)';
      ctx.lineWidth = 1;
      const startX = Math.floor(camera.x/80)*80;
      const startY = Math.floor(camera.y/80)*80;
      const endX = camera.x + canvas.width;
      const endY = camera.y + canvas.height;
      for(let x=startX; x<endX; x+=80){
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }
      for(let y=startY; y<endY; y+=80){
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }
    }
    
    // Stations (skip if in anomaly)
    if(!player.inAnomaly){
      s.stations.forEach(st=>{
        const baseColor = st.color || '#3b82f6';
        const lighterColor = st.color ? st.color + 'cc' : '#60a5fa';
      
      ctx.shadowBlur = 20;
      ctx.shadowColor = baseColor;
      ctx.save();
      ctx.translate(st.x, st.y);
      
      // Draw different station types based on category
      switch(st.category) {
        case 'navy': // Military assembly - cross shape with turrets
          ctx.rotate(Date.now() / 5000);
          ctx.fillStyle = baseColor;
          ctx.strokeStyle = lighterColor;
          ctx.lineWidth = 3;
          // Central core
          ctx.fillRect(-15, -15, 30, 30);
          ctx.strokeRect(-15, -15, 30, 30);
          // Arms
          for(let i = 0; i < 4; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI / 2));
            ctx.fillRect(-8, -45, 16, 30);
            ctx.strokeRect(-8, -45, 16, 30);
            // Turret
            ctx.beginPath();
            ctx.arc(0, -45, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
          break;
          
        case 'academy': // Academy - hexagon with rings
          ctx.rotate(Date.now() / 6000);
          ctx.fillStyle = baseColor;
          ctx.strokeStyle = lighterColor;
          ctx.lineWidth = 3;
          // Hexagon core
          ctx.beginPath();
          for(let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * 25;
            const y = Math.sin(angle) * 25;
            if(i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Orbital rings
          ctx.lineWidth = 2;
          for(let r = 35; r <= 45; r += 10) {
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
          
        case 'treasury': // Treasury - diamond with vaults
          ctx.rotate(Date.now() / 4500 + Math.PI / 4);
          ctx.fillStyle = baseColor;
          ctx.strokeStyle = lighterColor;
          ctx.lineWidth = 3;
          // Diamond core
          ctx.beginPath();
          ctx.moveTo(0, -30);
          ctx.lineTo(30, 0);
          ctx.lineTo(0, 30);
          ctx.lineTo(-30, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Vault compartments
          for(let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            ctx.fillRect(Math.cos(angle) * 20 - 5, Math.sin(angle) * 20 - 5, 10, 10);
          }
          break;
          
        case 'industrial': // Industrial - rectangular with storage
          ctx.fillStyle = baseColor;
          ctx.strokeStyle = lighterColor;
          ctx.lineWidth = 3;
          // Main structure
          ctx.fillRect(-35, -20, 70, 40);
          ctx.strokeRect(-35, -20, 70, 40);
          // Storage modules
          for(let i = 0; i < 3; i++) {
            ctx.fillRect(-25 + i * 25, -15, 15, 30);
            ctx.strokeRect(-25 + i * 25, -15, 15, 30);
          }
          // Rotating crane
          ctx.save();
          ctx.rotate(Date.now() / 3000);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -40);
          ctx.stroke();
          ctx.restore();
          break;
          
        case 'trading': // Trading hub - octagon with docking bays
          ctx.rotate(Date.now() / 5000);
          ctx.fillStyle = baseColor;
          ctx.strokeStyle = lighterColor;
          ctx.lineWidth = 3;
          // Octagon
          ctx.beginPath();
          for(let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 28;
            const y = Math.sin(angle) * 28;
            if(i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Docking ports
          for(let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * 40, Math.sin(angle) * 40, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          break;
          
        case 'moon': // Moon base - crescent with modules
          ctx.fillStyle = baseColor;
          ctx.strokeStyle = lighterColor;
          ctx.lineWidth = 3;
          // Crescent shape
          ctx.beginPath();
          ctx.arc(0, 0, 25, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(10, 0, 20, 0, Math.PI * 2);
          ctx.fill();
          // Mining modules
          ctx.fillStyle = baseColor;
          for(let i = 0; i < 3; i++) {
            const angle = Math.PI * 0.5 + (i - 1) * 0.6;
            ctx.fillRect(Math.cos(angle) * 35 - 3, Math.sin(angle) * 35 - 8, 6, 16);
          }
          break;
          
        case 'outpost': // Simple outpost - circle with basic docking
          ctx.rotate(Date.now() / 5000);
          ctx.fillStyle = baseColor;
          ctx.strokeStyle = lighterColor;
          ctx.lineWidth = 3;
          // Central hub
          ctx.beginPath();
          ctx.arc(0, 0, 25, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Docking rings
          for(let i = 0; i < 4; i++){
            const angle = (i / 4) * Math.PI * 2;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * 35, Math.sin(angle) * 35, 8, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
          
        case 'military': // Military base - fortress shape
          ctx.fillStyle = baseColor;
          ctx.strokeStyle = lighterColor;
          ctx.lineWidth = 3;
          // Main fortress
          ctx.fillRect(-30, -25, 60, 50);
          ctx.strokeRect(-30, -25, 60, 50);
          // Battlements
          for(let i = 0; i < 5; i++) {
            ctx.fillRect(-25 + i * 12, -35, 8, 10);
          }
          // Shield emitters
          ctx.save();
          ctx.rotate(Date.now() / 2000);
          for(let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * 40, Math.sin(angle) * 40, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          break;
          
        case 'sovereignty': // Sovereignty - star fortress
          ctx.rotate(Date.now() / 6000);
          ctx.fillStyle = baseColor;
          ctx.strokeStyle = lighterColor;
          ctx.lineWidth = 3;
          // Star shape
          ctx.beginPath();
          for(let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = i % 2 === 0 ? 35 : 15;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if(i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Central core
          ctx.beginPath();
          ctx.arc(0, 0, 12, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'citadel': // Keepstar citadel - massive structure
          ctx.fillStyle = baseColor;
          ctx.strokeStyle = lighterColor;
          ctx.lineWidth = 4;
          // Central sphere
          ctx.beginPath();
          ctx.arc(0, 0, 30, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Three massive spires
          ctx.save();
          ctx.rotate(Date.now() / 8000);
          for(let i = 0; i < 3; i++) {
            ctx.save();
            ctx.rotate((i / 3) * Math.PI * 2);
            ctx.fillRect(-6, -60, 12, 35);
            ctx.strokeRect(-6, -60, 12, 35);
            // Spire tip
            ctx.beginPath();
            ctx.moveTo(-10, -60);
            ctx.lineTo(0, -75);
            ctx.lineTo(10, -60);
            ctx.fill();
            ctx.restore();
          }
          ctx.restore();
          break;
          
        case 'mining': // Mining colony - drill structure
          ctx.fillStyle = baseColor;
          ctx.strokeStyle = lighterColor;
          ctx.lineWidth = 3;
          // Platform
          ctx.fillRect(-35, -10, 70, 20);
          ctx.strokeRect(-35, -10, 70, 20);
          // Drills
          for(let i = 0; i < 4; i++) {
            const x = -25 + i * 17;
            ctx.fillRect(x - 4, 10, 8, 25);
            ctx.strokeRect(x - 4, 10, 8, 25);
            // Drill bit
            ctx.beginPath();
            ctx.moveTo(x - 5, 35);
            ctx.lineTo(x, 42);
            ctx.lineTo(x + 5, 35);
            ctx.fill();
          }
          // Ore processor (rotating)
          ctx.save();
          ctx.rotate(Date.now() / 1500);
          ctx.beginPath();
          ctx.arc(0, -5, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
          
        case 'logistics': // Logistics hub - modular design
          ctx.fillStyle = baseColor;
          ctx.strokeStyle = lighterColor;
          ctx.lineWidth = 3;
          // Central module
          ctx.fillRect(-20, -20, 40, 40);
          ctx.strokeRect(-20, -20, 40, 40);
          // Cargo modules
          for(let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
            const x = Math.cos(angle) * 35;
            const y = Math.sin(angle) * 35;
            ctx.fillRect(x - 10, y - 10, 20, 20);
            ctx.strokeRect(x - 10, y - 10, 20, 20);
          }
          break;
          
        case 'staging': // Staging point - arrow/launch platform
          ctx.rotate(Date.now() / 4000);
          ctx.fillStyle = baseColor;
          ctx.strokeStyle = lighterColor;
          ctx.lineWidth = 3;
          // Arrow shape pointing up
          ctx.beginPath();
          ctx.moveTo(0, -35);
          ctx.lineTo(20, -10);
          ctx.lineTo(10, -10);
          ctx.lineTo(10, 25);
          ctx.lineTo(-10, 25);
          ctx.lineTo(-10, -10);
          ctx.lineTo(-20, -10);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Launch bays
          for(let i = 0; i < 3; i++) {
            ctx.fillRect(-6, -5 + i * 12, 12, 8);
          }
          break;
          
        default: // Fallback to outpost design
          ctx.rotate(Date.now() / 5000);
          ctx.fillStyle = baseColor;
          ctx.strokeStyle = lighterColor;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 25, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
      }
      
      ctx.restore();
      ctx.shadowBlur = 0;
      
      // Station name
      ctx.fillStyle = '#3b82f6';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(st.name, st.x, st.y + 50);
      
      // Safe zone indicator
      if(dist(player, st) < 500){
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(st.x, st.y, 500, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    } // End if(!player.inAnomaly)
    
    // Stargates (skip if in anomaly)
    if(!player.inAnomaly){
      s.stargates.forEach(g=>{
        const time = Date.now() / 1000;
        const gateColor = g.color || '#22d3ee';
      // Parse hex color to RGB for alpha blending
      const r = parseInt(gateColor.slice(1,3), 16);
      const gR = parseInt(gateColor.slice(3,5), 16);
      const b = parseInt(gateColor.slice(5,7), 16);
      
      ctx.save();
      ctx.translate(g.x, g.y);
      
      // Outer rotating ring structure
      ctx.save();
      ctx.rotate(time * 0.3);
      ctx.strokeStyle = gateColor;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 15;
      ctx.shadowColor = gateColor;
      
      // Draw ring segments (looks like a gate frame)
      for(let i = 0; i < 8; i++){
        const angle = (i / 8) * Math.PI * 2;
        const startAngle = angle - 0.15;
        const endAngle = angle + 0.15;
        ctx.beginPath();
        ctx.arc(0, 0, g.radius + 12, startAngle, endAngle);
        ctx.stroke();
      }
      ctx.restore();
      
      // Animated pulsing rings
      for(let i = 0; i < 3; i++){
        const offset = (time * 0.5 + i * 0.33) % 1;
        ctx.strokeStyle = `rgba(${r}, ${gR}, ${b}, ${(1 - offset) * 0.7})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = gateColor;
        ctx.beginPath();
        ctx.arc(0, 0, g.radius + offset * 20, 0, Math.PI*2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      
      // Main gate ring
      ctx.strokeStyle = gateColor;
      ctx.fillStyle = `rgba(${r}, ${gR}, ${b}, 0.4)`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = gateColor;
      ctx.beginPath();
      ctx.arc(0, 0, g.radius, 0, Math.PI*2);
      ctx.fill();
      ctx.stroke();
      
      // Energy arcs connecting points on the ring
      ctx.save();
      ctx.rotate(time * 0.5);
      ctx.strokeStyle = `rgba(${r}, ${gR}, ${b}, 0.6)`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 8;
      for(let i = 0; i < 4; i++){
        const angle1 = (i / 4) * Math.PI * 2;
        const angle2 = ((i + 2) / 4) * Math.PI * 2;
        const x1 = Math.cos(angle1) * (g.radius - 8);
        const y1 = Math.sin(angle1) * (g.radius - 8);
        const x2 = Math.cos(angle2) * (g.radius - 8);
        const y2 = Math.sin(angle2) * (g.radius - 8);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();
      ctx.shadowBlur = 0;
      
      // Inner portal effect with swirling gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, g.radius - 5);
      gradient.addColorStop(0, `rgba(${r}, ${gR}, ${b}, 0.8)`);
      gradient.addColorStop(0.3, `rgba(${r}, ${gR}, ${b}, 0.5)`);
      gradient.addColorStop(0.7, `rgba(${r}, ${gR}, ${b}, 0.3)`);
      gradient.addColorStop(1, `rgba(${r}, ${gR}, ${b}, 0.05)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, g.radius - 5, 0, Math.PI*2);
      ctx.fill();
      
      // Swirling particles in portal
      ctx.save();
      ctx.rotate(-time * 0.8);
      for(let i = 0; i < 6; i++){
        const angle = (i / 6) * Math.PI * 2 + time;
        const dist = (g.radius - 10) * (0.3 + Math.sin(time * 2 + i) * 0.2);
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        ctx.fillStyle = `rgba(${r}, ${gR}, ${b}, ${0.6 + Math.sin(time * 3 + i) * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      
      ctx.restore();
      
      ctx.fillStyle = '#22d3ee';
      ctx.font = '12px monospace';
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#22d3ee';
      ctx.fillText(g.name, g.x - 50, g.y - 50);
      ctx.shadowBlur = 0;
      
      if(selectedTarget && selectedTarget.ref === g){
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fbbf24';
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.radius + 8, 0, Math.PI*2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });
    } // End if(!player.inAnomaly)
    
    // Asteroids
    s.asteroids.forEach(a=>{
      const pct = a.amount / a.maxAmount;
      
      // Draw irregular asteroid shape
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rotation);
      
      // Main asteroid body
      ctx.fillStyle = `rgb(${100+pct*55}, ${80+pct*40}, 30)`;
      ctx.beginPath();
      a.shapePoints.forEach((p, i) => {
        const x = Math.cos(p.angle) * p.dist;
        const y = Math.sin(p.angle) * p.dist;
        if(i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      
      // Add darker edge for depth
      ctx.strokeStyle = `rgba(${60+pct*30}, ${50+pct*20}, 20, 0.6)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Draw craters for surface detail
      ctx.fillStyle = `rgba(${70+pct*30}, ${60+pct*20}, 25, 0.5)`;
      a.craters.forEach(c => {
        const cx = Math.cos(c.angle) * c.dist;
        const cy = Math.sin(c.angle) * c.dist;
        ctx.beginPath();
        ctx.arc(cx, cy, c.size, 0, Math.PI*2);
        ctx.fill();
      });
      
      ctx.restore();
      
      // Selection ring
      if(selectedTarget && selectedTarget.ref === a){
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius + 8, 0, Math.PI*2);
        ctx.stroke();
      }
    });

    // Weapon fire effects (render before NPCs so they don't overlap ships)
    fireEffects.forEach(effect => {
      const alpha = effect.life / effect.maxLife; // Fade out over time
      const ownerColor = effect.owner === 'player' ? '#22d3ee' : '#fb923c';
      
      // Different rendering based on weapon type
      if(effect.weaponType === 'mining'){
        // Mining laser: pulsing yellow-green beam
        const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.globalAlpha = alpha * pulse * 0.6;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(effect.x1, effect.y1);
        ctx.lineTo(effect.x2, effect.y2);
        ctx.stroke();
        
        // Pulsing impact
        ctx.fillStyle = '#84cc16';
        ctx.globalAlpha = alpha * pulse;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#84cc16';
        ctx.beginPath();
        ctx.arc(effect.x2, effect.y2, 6 * pulse, 0, Math.PI * 2);
        ctx.fill();
        
      } else if(effect.weaponName && effect.weaponName.includes('Railgun')){
        // Railgun: thin, bright electric blue beam
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = alpha * 0.9;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#60a5fa';
        ctx.beginPath();
        ctx.moveTo(effect.x1, effect.y1);
        ctx.lineTo(effect.x2, effect.y2);
        ctx.stroke();
        
        // Electric impact flash
        if(effect.hit && effect.life > effect.maxLife * 0.5){
          ctx.fillStyle = '#60a5fa';
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = 12;
          for(let i = 0; i < 3; i++){
            const angle = (Math.PI * 2 / 3) * i + (effect.life * 0.3);
            const sparkX = effect.x2 + Math.cos(angle) * 8;
            const sparkY = effect.y2 + Math.sin(angle) * 8;
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
      } else if(effect.weaponName && effect.weaponName.includes('Blaster')){
        // Blaster: thick plasma bolt (green/yellow)
        const gradient = ctx.createLinearGradient(effect.x1, effect.y1, effect.x2, effect.y2);
        gradient.addColorStop(0, '#84cc16');
        gradient.addColorStop(1, '#fbbf24');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.globalAlpha = alpha * 0.7;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#84cc16';
        ctx.beginPath();
        ctx.moveTo(effect.x1, effect.y1);
        ctx.lineTo(effect.x2, effect.y2);
        ctx.stroke();
        
        // Plasma impact explosion
        if(effect.hit && effect.life > effect.maxLife * 0.4){
          ctx.fillStyle = '#fbbf24';
          ctx.globalAlpha = alpha * 0.8;
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#f59e0b';
          ctx.beginPath();
          ctx.arc(effect.x2, effect.y2, 10 * (1 - alpha), 0, Math.PI * 2);
          ctx.fill();
        }
        
      } else if(effect.weaponName && effect.weaponName.includes('Laser')){
        // Laser: continuous red/orange beam
        const gradient = ctx.createLinearGradient(effect.x1, effect.y1, effect.x2, effect.y2);
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(1, '#f97316');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = alpha * 0.8;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(effect.x1, effect.y1);
        ctx.lineTo(effect.x2, effect.y2);
        ctx.stroke();
        
        // Burning impact
        if(effect.hit){
          ctx.fillStyle = '#f97316';
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(effect.x2, effect.y2, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        
      } else if(effect.weaponName && effect.weaponName.includes('AutoCannon')){
        // Autocannon: fast projectile tracers (yellow bullets)
        const distance = Math.hypot(effect.x2 - effect.x1, effect.x2 - effect.y1);
        const progress = 1 - (effect.life / effect.maxLife);
        const currentX = effect.x1 + (effect.x2 - effect.x1) * progress;
        const currentY = effect.y1 + (effect.y2 - effect.y1) * progress;
        
        // Tracer trail
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.globalAlpha = alpha * 0.6;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(effect.x1, effect.y1);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        // Bullet head
        ctx.fillStyle = '#facc15';
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Impact
        if(effect.hit && progress > 0.8){
          ctx.fillStyle = '#fb923c';
          ctx.globalAlpha = alpha * 0.7;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(effect.x2, effect.y2, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        
      } else if(effect.weaponName && effect.weaponName.includes('Rocket')){
        // Rocket Launcher: missile with smoke trail
        const distance = Math.hypot(effect.x2 - effect.x1, effect.x2 - effect.y1);
        const progress = 1 - (effect.life / effect.maxLife);
        const currentX = effect.x1 + (effect.x2 - effect.x1) * progress;
        const currentY = effect.y1 + (effect.y2 - effect.y1) * progress;
        
        // Smoke trail
        for(let i = 0; i < 5; i++){
          const trailProgress = progress - (i * 0.1);
          if(trailProgress > 0){
            const trailX = effect.x1 + (effect.x2 - effect.x1) * trailProgress;
            const trailY = effect.y1 + (effect.y2 - effect.y1) * trailProgress;
            ctx.fillStyle = '#64748b';
            ctx.globalAlpha = alpha * 0.3 * (1 - i / 5);
            ctx.beginPath();
            ctx.arc(trailX, trailY, 4 - i * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        // Missile body
        ctx.fillStyle = '#dc2626';
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#f59e0b';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Explosion on impact
        if(effect.hit && progress > 0.9){
          const explosionSize = 15 * (1 - (effect.life / effect.maxLife));
          ctx.fillStyle = '#f59e0b';
          ctx.globalAlpha = alpha * 0.6;
          ctx.shadowBlur = 25;
          ctx.shadowColor = '#dc2626';
          ctx.beginPath();
          ctx.arc(effect.x2, effect.y2, explosionSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
      } else {
        // Default turret effect (for NPCs and fallback)
        ctx.strokeStyle = ownerColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = alpha * 0.8;
        ctx.shadowBlur = 10;
        ctx.shadowColor = ownerColor;
        ctx.beginPath();
        ctx.moveTo(effect.x1, effect.y1);
        ctx.lineTo(effect.x2, effect.y2);
        ctx.stroke();
        
        // Impact flash
        if(effect.hit && effect.life > effect.maxLife * 0.5){
          ctx.fillStyle = ownerColor;
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(effect.x2, effect.y2, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    });

    // Ship drawing functions
    function drawFrigate(ctx, color, scale = 1) {
      // Sleek frigate with defined wings and cockpit
      
      // Main fuselage
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -14 * scale);
      ctx.lineTo(4 * scale, -6 * scale);
      ctx.lineTo(4 * scale, 6 * scale);
      ctx.lineTo(0, 8 * scale);
      ctx.lineTo(-4 * scale, 6 * scale);
      ctx.lineTo(-4 * scale, -6 * scale);
      ctx.closePath();
      ctx.fill();
      
      // Wings
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(-4 * scale, 0);
      ctx.lineTo(-12 * scale, 2 * scale);
      ctx.lineTo(-12 * scale, 8 * scale);
      ctx.lineTo(-4 * scale, 6 * scale);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(4 * scale, 0);
      ctx.lineTo(12 * scale, 2 * scale);
      ctx.lineTo(12 * scale, 8 * scale);
      ctx.lineTo(4 * scale, 6 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      
      // Cockpit highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, -14 * scale);
      ctx.lineTo(2 * scale, -8 * scale);
      ctx.lineTo(-2 * scale, -8 * scale);
      ctx.closePath();
      ctx.fill();
      
      // Engine pods
      ctx.fillStyle = 'rgba(34, 211, 238, 0.5)';
      ctx.beginPath();
      ctx.arc(-10 * scale, 6 * scale, 2.5 * scale, 0, Math.PI * 2);
      ctx.arc(10 * scale, 6 * scale, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    
    function drawDestroyer(ctx, color, scale = 1) {
      // Longer, more angular destroyer
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -18 * scale);
      ctx.lineTo(6 * scale, -8 * scale);
      ctx.lineTo(12 * scale, 12 * scale);
      ctx.lineTo(0, 8 * scale);
      ctx.lineTo(-12 * scale, 12 * scale);
      ctx.lineTo(-6 * scale, -8 * scale);
      ctx.closePath();
      ctx.fill();
      
      // Engine glow
      ctx.fillStyle = `rgba(34, 211, 238, 0.6)`;
      ctx.beginPath();
      ctx.arc(-8 * scale, 10 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.arc(8 * scale, 10 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    
    function drawCruiser(ctx, color, scale = 1) {
      // Bulkier, larger cruiser
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -20 * scale);
      ctx.lineTo(14 * scale, -10 * scale);
      ctx.lineTo(16 * scale, 14 * scale);
      ctx.lineTo(8 * scale, 10 * scale);
      ctx.lineTo(-8 * scale, 10 * scale);
      ctx.lineTo(-16 * scale, 14 * scale);
      ctx.lineTo(-14 * scale, -10 * scale);
      ctx.closePath();
      ctx.fill();
      
      // Hull details
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(-10 * scale, -6 * scale);
      ctx.lineTo(-10 * scale, 8 * scale);
      ctx.moveTo(10 * scale, -6 * scale);
      ctx.lineTo(10 * scale, 8 * scale);
      ctx.stroke();
      
      // Triple engines
      ctx.fillStyle = `rgba(34, 211, 238, 0.7)`;
      ctx.beginPath();
      ctx.arc(-12 * scale, 12 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.arc(0, 12 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.arc(12 * scale, 12 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    
    function drawPirateShip(ctx, scale = 1) {
      // Menacing pirate design - asymmetric and aggressive
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(0, -15 * scale);
      ctx.lineTo(12 * scale, -4 * scale);
      ctx.lineTo(14 * scale, 10 * scale);
      ctx.lineTo(6 * scale, 6 * scale);
      ctx.lineTo(0, 8 * scale);
      ctx.lineTo(-8 * scale, 6 * scale);
      ctx.lineTo(-12 * scale, 10 * scale);
      ctx.lineTo(-10 * scale, -4 * scale);
      ctx.closePath();
      ctx.fill();
      
      // Darker accent
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.moveTo(0, -15 * scale);
      ctx.lineTo(8 * scale, 0);
      ctx.lineTo(0, 4 * scale);
      ctx.lineTo(-6 * scale, 0);
      ctx.closePath();
      ctx.fill();
      
      // Red engine glow
      ctx.fillStyle = `rgba(239, 68, 68, 0.8)`;
      ctx.shadowBlur = 8 * scale;
      ctx.shadowColor = '#ef4444';
      ctx.beginPath();
      ctx.arc(-10 * scale, 8 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.arc(12 * scale, 8 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    function drawBattlecruiser(ctx, color, scale = 1) {
      // Heavy battlecruiser - massive firepower platform
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -24 * scale);
      ctx.lineTo(10 * scale, -16 * scale);
      ctx.lineTo(18 * scale, -8 * scale);
      ctx.lineTo(20 * scale, 16 * scale);
      ctx.lineTo(10 * scale, 12 * scale);
      ctx.lineTo(-10 * scale, 12 * scale);
      ctx.lineTo(-20 * scale, 16 * scale);
      ctx.lineTo(-18 * scale, -8 * scale);
      ctx.lineTo(-10 * scale, -16 * scale);
      ctx.closePath();
      ctx.fill();
      
      // Armored sections
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.rect(-8 * scale, -12 * scale, 16 * scale, 8 * scale);
      ctx.fill();
      
      // Weapons hardpoints
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(-14 * scale, -4 * scale);
      ctx.lineTo(-14 * scale, 6 * scale);
      ctx.moveTo(14 * scale, -4 * scale);
      ctx.lineTo(14 * scale, 6 * scale);
      ctx.stroke();
      
      // Quad engines
      ctx.fillStyle = `rgba(34, 211, 238, 0.75)`;
      ctx.beginPath();
      ctx.arc(-16 * scale, 14 * scale, 3.5 * scale, 0, Math.PI * 2);
      ctx.arc(-6 * scale, 14 * scale, 3.5 * scale, 0, Math.PI * 2);
      ctx.arc(6 * scale, 14 * scale, 3.5 * scale, 0, Math.PI * 2);
      ctx.arc(16 * scale, 14 * scale, 3.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    
    function drawBattleship(ctx, color, scale = 1) {
      // Massive battleship - capital-class vessel
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -28 * scale);
      ctx.lineTo(12 * scale, -20 * scale);
      ctx.lineTo(22 * scale, -6 * scale);
      ctx.lineTo(24 * scale, 18 * scale);
      ctx.lineTo(12 * scale, 14 * scale);
      ctx.lineTo(-12 * scale, 14 * scale);
      ctx.lineTo(-24 * scale, 18 * scale);
      ctx.lineTo(-22 * scale, -6 * scale);
      ctx.lineTo(-12 * scale, -20 * scale);
      ctx.closePath();
      ctx.fill();
      
      // Central superstructure
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(-10 * scale, -16 * scale, 20 * scale, 20 * scale);
      
      // Bridge tower
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.rect(-6 * scale, -20 * scale, 12 * scale, 8 * scale);
      ctx.fill();
      ctx.globalAlpha = 1;
      
      // Armor plates
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(-18 * scale, -4 * scale);
      ctx.lineTo(-18 * scale, 10 * scale);
      ctx.moveTo(18 * scale, -4 * scale);
      ctx.lineTo(18 * scale, 10 * scale);
      ctx.moveTo(-10 * scale, 2 * scale);
      ctx.lineTo(10 * scale, 2 * scale);
      ctx.stroke();
      
      // Main engines
      ctx.fillStyle = `rgba(34, 211, 238, 0.85)`;
      ctx.shadowBlur = 12 * scale;
      ctx.shadowColor = '#06b6d4';
      ctx.beginPath();
      ctx.arc(-18 * scale, 16 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.arc(-6 * scale, 16 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.arc(6 * scale, 16 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.arc(18 * scale, 16 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    function drawIndustrial(ctx, color, scale = 1) {
      // Industrial hauler - cargo ship design
      
      // Main cargo hull (wide and boxy)
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.rect(-16 * scale, -8 * scale, 32 * scale, 20 * scale);
      ctx.fill();
      
      // Front section
      ctx.beginPath();
      ctx.moveTo(-16 * scale, -8 * scale);
      ctx.lineTo(0, -16 * scale);
      ctx.lineTo(16 * scale, -8 * scale);
      ctx.fill();
      
      // Cargo bay sections
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(-14 * scale, -6 * scale, 12 * scale, 16 * scale);
      ctx.fillRect(-0 * scale, -6 * scale, 12 * scale, 16 * scale);
      
      // Cargo bay dividers
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(-8 * scale, -6 * scale);
      ctx.lineTo(-8 * scale, 10 * scale);
      ctx.moveTo(6 * scale, -6 * scale);
      ctx.lineTo(6 * scale, 10 * scale);
      ctx.stroke();
      
      // Cockpit window
      ctx.fillStyle = 'rgba(100, 200, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(0, -12 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      // Industrial engines (large and efficient)
      ctx.fillStyle = `rgba(34, 211, 238, 0.6)`;
      ctx.beginPath();
      ctx.arc(-12 * scale, 14 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.arc(12 * scale, 14 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      // Heat exhausts
      ctx.strokeStyle = 'rgba(255, 150, 100, 0.4)';
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(-12 * scale, 18 * scale);
      ctx.lineTo(-12 * scale, 22 * scale);
      ctx.moveTo(12 * scale, 18 * scale);
      ctx.lineTo(12 * scale, 22 * scale);
      ctx.stroke();
    }
    
    function drawCorvette(ctx, color, scale = 1) {
      // Fast attack corvette - between frigate and destroyer
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -16 * scale);
      ctx.lineTo(7 * scale, -10 * scale);
      ctx.lineTo(10 * scale, 0);
      ctx.lineTo(12 * scale, 10 * scale);
      ctx.lineTo(4 * scale, 8 * scale);
      ctx.lineTo(0, 10 * scale);
      ctx.lineTo(-4 * scale, 8 * scale);
      ctx.lineTo(-12 * scale, 10 * scale);
      ctx.lineTo(-10 * scale, 0);
      ctx.lineTo(-7 * scale, -10 * scale);
      ctx.closePath();
      ctx.fill();
      
      // Sensor array
      ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(0, -12 * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      // Interceptor engines
      ctx.fillStyle = `rgba(34, 211, 238, 0.7)`;
      ctx.shadowBlur = 6 * scale;
      ctx.shadowColor = '#22d3ee';
      ctx.beginPath();
      ctx.arc(-10 * scale, 8 * scale, 2.5 * scale, 0, Math.PI * 2);
      ctx.arc(10 * scale, 8 * scale, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    function drawMiningBarge(ctx, color, scale = 1) {
      // Specialized mining vessel
      
      // Main hull
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.rect(-14 * scale, -6 * scale, 28 * scale, 18 * scale);
      ctx.fill();
      
      // Mining laser arrays (front)
      ctx.fillStyle = 'rgba(255, 200, 50, 0.6)';
      ctx.beginPath();
      ctx.rect(-12 * scale, -10 * scale, 8 * scale, 6 * scale);
      ctx.rect(4 * scale, -10 * scale, 8 * scale, 6 * scale);
      ctx.fill();
      
      // Laser emitters
      ctx.fillStyle = '#fbbf24';
      ctx.shadowBlur = 8 * scale;
      ctx.shadowColor = '#f59e0b';
      ctx.beginPath();
      ctx.arc(-8 * scale, -10 * scale, 2 * scale, 0, Math.PI * 2);
      ctx.arc(8 * scale, -10 * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Ore hold sections
      ctx.fillStyle = 'rgba(100, 80, 60, 0.4)';
      ctx.fillRect(-12 * scale, -4 * scale, 10 * scale, 14 * scale);
      ctx.fillRect(2 * scale, -4 * scale, 10 * scale, 14 * scale);
      
      // Industrial thrusters
      ctx.fillStyle = `rgba(34, 211, 238, 0.5)`;
      ctx.beginPath();
      ctx.arc(-10 * scale, 14 * scale, 3.5 * scale, 0, Math.PI * 2);
      ctx.arc(10 * scale, 14 * scale, 3.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    
    function drawShipByClass(ctx, shipClass, color, scale = 1) {
      switch(shipClass) {
        case 'Frigate':
          drawFrigate(ctx, color, scale);
          break;
        case 'Destroyer':
          drawDestroyer(ctx, color, scale);
          break;
        case 'Cruiser':
          drawCruiser(ctx, color, scale);
          break;
        case 'Battlecruiser':
          drawBattlecruiser(ctx, color, scale);
          break;
        case 'Battleship':
          drawBattleship(ctx, color, scale);
          break;
        case 'Industrial':
        case 'Hauler':
        case 'Cargo':
          drawIndustrial(ctx, color, scale);
          break;
        case 'Corvette':
          drawCorvette(ctx, color, scale);
          break;
        case 'Mining Barge':
          drawMiningBarge(ctx, color, scale);
          break;
        default:
          drawFrigate(ctx, color, scale);
      }
    }

    // NPCs
    s.npcs.forEach(n=>{
      ctx.save();
      ctx.translate(n.x, n.y);
      ctx.rotate(n.angle);
      
      // Draw pirate ship
      drawPirateShip(ctx, 1);
      
      ctx.restore();
      
      if(selectedTarget && selectedTarget.ref === n){
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 20, 0, Math.PI*2);
        ctx.stroke();
      }
    });

    // Wrecks
    s.wrecks.forEach(w=>{
      // Draw wreck as debris
      ctx.fillStyle = '#64748b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      
      // Draw wreck shape (broken/damaged look)
      ctx.save();
      ctx.translate(w.x, w.y);
      
      // Main wreck body
      ctx.beginPath();
      ctx.moveTo(-10, -8);
      ctx.lineTo(8, -6);
      ctx.lineTo(10, 4);
      ctx.lineTo(-8, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Debris pieces
      ctx.fillRect(-6, -3, 3, 2);
      ctx.fillRect(2, -2, 2, 3);
      ctx.fillRect(-2, 4, 4, 2);
      
      ctx.restore();
      
      if(selectedTarget && selectedTarget.ref === w){
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w.x, w.y, 18, 0, Math.PI*2);
        ctx.stroke();
      }
    });

    // Player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    
    // Warp warmup effect
    if(player.warpWarmup > 0){
      const warpProgress = 1 - (player.warpWarmup / 180);
      ctx.strokeStyle = `rgba(6, 182, 212, ${warpProgress})`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#06b6d4';
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2 * warpProgress);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    // Jump warmup effect
    if(player.jumpWarmup > 0){
      const progress = 1 - (player.jumpWarmup / 600);
      
      // Pulsing outer ring
      const pulse = Math.sin(progress * Math.PI * 8) * 0.3 + 0.7;
      ctx.strokeStyle = `rgba(251, 191, 36, ${progress * pulse})`;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 0, 30 + pulse * 10, 0, Math.PI * 2);
      ctx.stroke();
      
      // Progress arc
      ctx.strokeStyle = `rgba(34, 211, 238, ${progress})`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#22d3ee';
      ctx.beginPath();
      ctx.arc(0, 0, 25, -Math.PI/2, (-Math.PI/2) + (Math.PI * 2 * progress));
      ctx.stroke();
      
      // Energy particles
      for(let i = 0; i < 6; i++){
        const angle = (progress * Math.PI * 4 + i * Math.PI / 3) % (Math.PI * 2);
        const dist = 35 + Math.sin(progress * Math.PI * 4 + i) * 5;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        ctx.fillStyle = `rgba(251, 191, 36, ${progress})`;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.shadowBlur = 0;
    }
    
    if(player.isWarping){
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#22d3ee';
      for(let i=0; i<3; i++){
        ctx.beginPath();
        ctx.arc(0, 0, 20+i*10, 0, Math.PI*2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }
    
    // Draw ship based on class
    // Determine ship color based on faction
    let shipColor;
    if(player.isWarping) {
      shipColor = '#22d3ee'; // Cyan when warping
    } else {
      switch(player.shipFaction) {
        case 'Caldari':
          shipColor = '#6366f1'; // Indigo blue
          break;
        case 'Amarr':
          shipColor = '#f59e0b'; // Gold/amber
          break;
        case 'Gallente':
          shipColor = '#10b981'; // Emerald green
          break;
        case 'Minmatar':
          shipColor = '#f97316'; // Rust orange
          break;
        default:
          shipColor = '#06b6d4'; // Default cyan for non-faction
      }
    }
    drawShipByClass(ctx, player.shipClass, shipColor, 1);
    
    const spd = Math.hypot(player.vx, player.vy);
    if(spd > 0.5 && !player.isWarping){
      ctx.fillStyle = `rgba(34, 211, 238, ${Math.min(1, spd/3)})`;
      ctx.beginPath();
      ctx.arc(0, 10, 4, 0, Math.PI*2);
      ctx.fill();
    }
    
    ctx.restore();
    
    ctx.restore();
    
    // === CANVAS HUD ===
    renderHUD();
  }
  
  function drawHealthBars(entity, x, y){
    const w = 40;
    const h = 4;
    const gap = 1;
    
    if(entity.maxShield > 0){
      const sPct = entity.shield / entity.maxShield;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x - w/2, y, w, h);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x - w/2, y, w * sPct, h);
      y += h + gap;
    }
    
    if(entity.maxArmor > 0){
      const aPct = entity.armor / entity.maxArmor;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x - w/2, y, w, h);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x - w/2, y, w * aPct, h);
      y += h + gap;
    }
    
    const hPct = entity.hull / entity.maxHull;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - w/2, y, w, h);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x - w/2, y, w * hPct, h);
  }

  let last = performance.now();
  let frameCount = 0;
  function loop(t){ 
    const dt = (t - last) / 16.666; 
    last = t; 
    update(dt); 
    draw(); 
    
    frameCount++;
    if(frameCount % 10 === 0){
      updateStats();
      
      // Check anomaly completion
      if(player.inAnomaly){
        checkAnomalyCompletion();
      }
      
      // Check if station proximity changed
      const nearStation = systems[current].stations.find(st => dist(player, st) < 300);
      if(nearStation !== lastNearStation){
        lastNearStation = nearStation;
        updateUI();
        
        // Close station window if undocking
        if(!nearStation && stationWindowOpen){
          closeStationWindow();
        }
      }
      
      // Close wreck window if too far away
      if(wreckWindowOpen && currentWreck){
        const d = dist(player, currentWreck);
        if(d > 200){
          closeWreckWindow();
        }
      }
    }
    
    requestAnimationFrame(loop); 
  }
  
  updateUI();
  requestAnimationFrame(loop);

  window._EVE = {player, systems, jumpTo, selectedTarget};
})();
