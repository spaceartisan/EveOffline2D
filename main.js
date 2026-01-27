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
      this.miningYield = stats.miningYield;
      this.miningCooldown = stats.miningCooldown;
      
      // Resources
      this.cap = stats.cap;
      this.maxCap = stats.maxCap;
      this.capRegen = stats.capRegen;
      this.cargoItems = []; // Array of items in cargo
      this.cargoCap = stats.cargoCap;
      this.cargoUsed = 0; // Track current cargo space used
      
      // Economy (persistent across ship changes)
      this.credits = 50000; // Starting credits
      
      // Fitting system
      this.fittedModules = []; // Array of fitted module objects
      this.fittedWeapons = []; // Array of fitted weapon objects
      this.powergridUsed = 0;
      this.cpuUsed = 0;
      this.powergridTotal = 50; // Default fitting resources
      this.cpuTotal = 100;
      
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
    constructor(x,y,destSystem,name){
      this.x=x; this.y=y;
      this.destSystem=destSystem;
      this.name=name;
      this.radius=40;
      this.id=Math.random().toString(36).substr(2,9);
    }
  }

  class Station{
    constructor(x,y,name){
      this.x=x; this.y=y;
      this.name=name;
      this.radius=60;
      this.id=Math.random().toString(36).substr(2,9);
      this.inventory = []; // Station storage inventory
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
      
      sys.stargates.push(new Stargate(x, y, destIdx, `Gate to ${destSystem.name}`));
    });
    
    // Add station
    if (data.station) {
      sys.stations.push(new Station(data.station.x, data.station.y, data.station.name));
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
  });
  
  // Note: Static star map positions are now loaded from systems.js data

  let current = 0;
  const player = new Ship('Velator'); // Start with basic frigate
  const playerHangar = ['Velator']; // Track owned ships
  const playerModules = []; // Track owned modules
  const playerWeapons = []; // Track owned weapons
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
      bgm.volume = 0.3;
      bgm.play().catch(e => console.log('Audio play prevented:', e));
      musicStarted = true;
    }
  }

  // Controls
  const keys = {};
  window.addEventListener('keydown', e=>{ 
    startMusic();
    keys[e.key.toLowerCase()]=true; 
    if(e.key===' ' || e.key==='w' || e.key==='a' || e.key==='s' || e.key==='d') e.preventDefault();
    
    // Toggle star map with 'N' key
    if(e.key.toLowerCase() === 'n'){
      e.preventDefault();
      if(starMapOpen){
        closeStarMap();
      } else {
        openStarMap();
      }
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
  const autoFireBtn = document.getElementById('autoFireBtn');
  autoFireBtn.addEventListener('click', () => {
    startMusic();
    autoFire = !autoFire;
    autoFireBtn.classList.toggle('active', autoFire);
    autoFireBtn.innerHTML = autoFire ? '🎯<br>Fire<br>ON' : '🎯<br>Fire';
  });
  
  // Auto Mine button
  const autoMineBtn = document.getElementById('autoMineBtn');
  autoMineBtn.addEventListener('click', () => {
    startMusic();
    autoMine = !autoMine;
    autoMineBtn.classList.toggle('active', autoMine);
    autoMineBtn.innerHTML = autoMine ? '⛏️<br>Mine<br>ON' : '⛏️<br>Mine';
  });
  
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
        itemDiv.innerHTML = `<div style="color:#f1f5f9;">${group.name} x${group.indices.length}</div><div style="color:#64748b;font-size:10px;">${(group.size * group.indices.length).toFixed(1)} m³</div>`;
        
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
        // Group items
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
          itemDiv.innerHTML = `<div style="color:#f1f5f9;">${group.name} x${group.indices.length}</div><div style="color:#64748b;font-size:10px;">${(group.size * group.indices.length).toFixed(1)} m³</div>`;
          
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

    // Fitted Modules
    fittingEl.innerHTML = '';
    fittingEl.innerHTML = `<div style="color:#06b6d4;font-size:11px;margin-bottom:8px">Powergrid: ${player.powergridUsed.toFixed(1)}/${player.powergridTotal} | CPU: ${player.cpuUsed.toFixed(1)}/${player.cpuTotal}</div>`;
    
    // Show fitted weapons
    if(player.fittedWeapons.length > 0){
      const weaponsHeader = document.createElement('div');
      weaponsHeader.style.fontSize = '11px';
      weaponsHeader.style.fontWeight = 'bold';
      weaponsHeader.style.color = '#f59e0b';
      weaponsHeader.style.marginBottom = '4px';
      weaponsHeader.textContent = 'Weapons';
      fittingEl.appendChild(weaponsHeader);
      
      player.fittedWeapons.forEach((weapon, index) => {
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
        
        fittingEl.appendChild(weaponDiv);
      });
    }
    
    // Show fitted modules
    if(player.fittedModules.length > 0){
      const modulesHeader = document.createElement('div');
      modulesHeader.style.fontSize = '11px';
      modulesHeader.style.fontWeight = 'bold';
      modulesHeader.style.color = '#f59e0b';
      modulesHeader.style.marginTop = '8px';
      modulesHeader.style.marginBottom = '4px';
      modulesHeader.textContent = 'Modules';
      fittingEl.appendChild(modulesHeader);
    }
    
    if(player.fittedWeapons.length === 0 && player.fittedModules.length === 0){
      fittingEl.innerHTML += '<div style="color:#64748b;font-size:11px">No modules fitted</div>';
    }
    
    if(player.fittedModules.length > 0){
      player.fittedModules.forEach((module, index) => {
        const moduleDiv = document.createElement('div');
        moduleDiv.style.fontSize = '11px';
        moduleDiv.style.marginBottom = '6px';
        moduleDiv.style.padding = '4px';
        moduleDiv.style.background = '#1e293b';
        moduleDiv.style.borderRadius = '2px';
        
        let effectText = '';
        if(module.shieldBonus) effectText += `+${module.shieldBonus} Shield `;
        if(module.armorBonus) effectText += `+${module.armorBonus} Armor `;
        if(module.shieldRegenBonus) effectText += `+${(module.shieldRegenBonus*100).toFixed(0)}% Shield Regen `;
        if(module.damageBonus) effectText += `+${(module.damageBonus*100).toFixed(0)}% Damage `;
        if(module.speedBonus && module.type === 'passive') effectText += `+${(module.speedBonus*100).toFixed(0)}% Speed `;
        if(module.cargoBonus) effectText += `+${module.cargoBonus} Cargo `;
        if(module.capacitorBonus) effectText += `+${module.capacitorBonus} Cap `;
        if(module.capacitorRegenBonus) effectText += `+${(module.capacitorRegenBonus*100).toFixed(0)}% Cap Regen `;
        
        moduleDiv.innerHTML = `
          <div style="color:#f1f5f9;font-weight:bold;">${module.name}</div>
          <div style="color:#94a3b8;font-size:10px;">${effectText}</div>
          <div style="color:#64748b;font-size:10px;">PG: ${module.powergridUsage} | CPU: ${module.cpuUsage}</div>
        `;
        
        fittingEl.appendChild(moduleDiv);
      });
    }

    // Ship Hangar
    hangarEl.innerHTML = '';
    if(!nearStation){
      hangarEl.innerHTML = '<div style="color:#64748b;font-size:11px">Dock at station to access hangar</div>';
    } else {
      // Show current ship
      hangarEl.innerHTML = `<div style="color:#06b6d4;font-size:11px;margin-bottom:8px">Current: ${player.shipName}</div>`;
      
      // List all ships for sale
      Object.keys(SHIP_CLASSES).forEach(shipKey => {
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
      // Show fitting resources
      const resourceDiv = document.createElement('div');
      resourceDiv.style.fontSize = '10px';
      resourceDiv.style.color = '#06b6d4';
      resourceDiv.style.marginBottom = '8px';
      const pgPercent = (player.powergridUsed / player.powergridTotal * 100).toFixed(0);
      const cpuPercent = (player.cpuUsed / player.cpuTotal * 100).toFixed(0);
      resourceDiv.innerHTML = `Available: PG ${(player.powergridTotal - player.powergridUsed).toFixed(1)}/${player.powergridTotal} (${pgPercent}%) | CPU ${(player.cpuTotal - player.cpuUsed).toFixed(1)}/${player.cpuTotal} (${cpuPercent}%)`;
      shopEl.appendChild(resourceDiv);
      
      // === WEAPONS SECTION ===
      const weaponsHeader = document.createElement('div');
      weaponsHeader.style.fontSize = '12px';
      weaponsHeader.style.fontWeight = 'bold';
      weaponsHeader.style.color = '#ef4444';
      weaponsHeader.style.marginTop = '8px';
      weaponsHeader.style.marginBottom = '6px';
      weaponsHeader.textContent = '=== WEAPONS ===';
      shopEl.appendChild(weaponsHeader);
      
      // Get all weapons
      const allWeapons = Object.values(WEAPON_MODULES);
      allWeapons.forEach(weapon => {
        const isFitted = player.fittedWeapons.some(w => w.name === weapon.name);
        
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
        statsDiv.innerHTML = `DMG: ${weapon.damage} | Range: ${weapon.maxRange}m | ROF: ${(60/weapon.fireRate).toFixed(1)}/s | Cap: ${weapon.capacitorUse}<br>PG: ${weapon.powergridUsage} | CPU: ${weapon.cpuUsage}`;
        weaponDiv.appendChild(statsDiv);
        
        // Buttons
        if(isFitted){
          const unfitBtn = document.createElement('button');
          unfitBtn.textContent = 'Unfit';
          unfitBtn.style.fontSize = '9px';
          unfitBtn.style.padding = '2px 6px';
          unfitBtn.style.background = '#dc2626';
          unfitBtn.onclick = (e) => {
            e.stopPropagation();
            if(unfitWeapon(weapon.name)){
              updateUI();
            }
          };
          weaponDiv.appendChild(unfitBtn);
        } else {
          const fitBtn = document.createElement('button');
          const ownsWeapon = playerWeapons.includes(weapon.name);
          fitBtn.textContent = ownsWeapon ? 'Fit' : `Buy & Fit (${weapon.price.toLocaleString()} ISK)`;
          fitBtn.style.fontSize = '9px';
          fitBtn.style.padding = '2px 6px';
          fitBtn.style.marginRight = '4px';
          
          // Check if can fit
          const canFit = player.powergridUsed + weapon.powergridUsage <= player.powergridTotal &&
                        player.cpuUsed + weapon.cpuUsage <= player.cpuTotal;
          
          if(!canFit){
            fitBtn.style.background = '#64748b';
            fitBtn.disabled = true;
          }
          
          fitBtn.onclick = (e) => {
            e.stopPropagation();
            // Only charge if not owned
            if(!ownsWeapon){
              if(player.credits >= weapon.price){
                player.credits -= weapon.price;
                playerWeapons.push(weapon.name);
              } else {
                return;
              }
            }
            // Fit the weapon
            if(fitWeapon(weapon.name)){
              updateUI();
            }
          };
          weaponDiv.appendChild(fitBtn);
        }
        
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
        const modules = getModulesByCategory(cat);
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
          const isFitted = player.fittedModules.some(m => m.name === module.name);
          
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
          statsDiv.innerHTML = `PG: ${module.powergridUsage} | CPU: ${module.cpuUsage} | ${module.type}`;
          moduleDiv.appendChild(statsDiv);
          
          // Buttons
          if(isFitted){
            const unfitBtn = document.createElement('button');
            unfitBtn.textContent = 'Unfit';
            unfitBtn.style.fontSize = '9px';
            unfitBtn.style.padding = '2px 6px';
            unfitBtn.style.background = '#dc2626';
            unfitBtn.onclick = (e) => {
              e.stopPropagation();
              if(unfitModule(module.name)){
                updateUI();
              }
            };
            moduleDiv.appendChild(unfitBtn);
          } else {
            const fitBtn = document.createElement('button');
            const ownsModule = playerModules.includes(module.name);
            fitBtn.textContent = ownsModule ? 'Fit' : `Buy & Fit (${module.price.toLocaleString()} ISK)`;
            fitBtn.style.fontSize = '9px';
            fitBtn.style.padding = '2px 6px';
            fitBtn.style.marginRight = '4px';
            
            // Check if can fit
            const canFit = player.powergridUsed + module.powergridUsage <= player.powergridTotal &&
                          player.cpuUsed + module.cpuUsage <= player.cpuTotal;
            
            if(!canFit){
              fitBtn.style.background = '#64748b';
              fitBtn.disabled = true;
            }
            
            fitBtn.onclick = (e) => {
              e.stopPropagation();
              // Only charge if not owned
              if(!ownsModule){
                if(player.credits >= module.price){
                  player.credits -= module.price;
                  playerModules.push(module.name);
                } else {
                  return; // Can't afford
                }
              }
              // Fit the module
              if(fitModule(module.name)){
                updateUI();
              }
            };
            moduleDiv.appendChild(fitBtn);
          }
          
          shopEl.appendChild(moduleDiv);
        });
      });
    }
  }

  function initiateWarp(){
    if(!selectedTarget || !selectedTarget.ref) return;
    if(player.isWarping || player.warpWarmup > 0 || player.warpCooldown > 0) return;
    const target = selectedTarget.ref;
    const d = dist(player, target);
    if(d < 4000) return; // Too close to warp
    
    player.warpWarmup = 180; // 3 second warmup
    player.warpTarget = {x: target.x, y: target.y};
    player.targetCommand = null;
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

  // Fitting functions
  function fitWeapon(weaponName){
    const weapon = getWeaponModule(weaponName);
    if(!weapon) return false;
    
    // Check if already fitted
    if(player.fittedWeapons.some(w => w.name === weaponName)){
      return false;
    }
    
    // Check fitting constraints
    if(player.powergridUsed + weapon.powergridUsage > player.powergridTotal){
      return false;
    }
    if(player.cpuUsed + weapon.cpuUsage > player.cpuTotal){
      return false;
    }
    
    // Fit the weapon
    player.fittedWeapons.push(weapon);
    player.powergridUsed += weapon.powergridUsage;
    player.cpuUsed += weapon.cpuUsage;
    
    return true;
  }
  
  function unfitWeapon(weaponName){
    const index = player.fittedWeapons.findIndex(w => w.name === weaponName);
    if(index === -1) return false;
    
    const weapon = player.fittedWeapons[index];
    
    // Remove fitting resources
    player.powergridUsed -= weapon.powergridUsage;
    player.cpuUsed -= weapon.cpuUsage;
    
    // Remove from fitted list
    player.fittedWeapons.splice(index, 1);
    return true;
  }
  
  function fitModule(moduleName){
    const module = getSubsystemModule(moduleName);
    if(!module) return false;
    
    // Check if already fitted
    if(player.fittedModules.some(m => m.name === moduleName)){
      return false;
    }
    
    // Check fitting constraints
    if(player.powergridUsed + module.powergridUsage > player.powergridTotal){
      return false; // Not enough powergrid
    }
    if(player.cpuUsed + module.cpuUsage > player.cpuTotal){
      return false; // Not enough CPU
    }
    
    // Fit the module
    player.fittedModules.push(module);
    player.powergridUsed += module.powergridUsage;
    player.cpuUsed += module.cpuUsage;
    
    // Apply passive bonuses immediately
    if(module.type === 'passive'){
      if(module.shieldBonus) {
        player.maxShield += module.shieldBonus;
        player.shield += module.shieldBonus;
      }
      if(module.armorBonus) {
        player.maxArmor += module.armorBonus;
        player.armor += module.armorBonus;
      }
      if(module.shieldRegenBonus) {
        player.shieldRegen += module.shieldRegenBonus;
      }
      if(module.capacitorBonus) {
        player.maxCap += module.capacitorBonus;
        player.cap += module.capacitorBonus;
      }
      if(module.capacitorRegenBonus) {
        player.capRegen += module.capacitorRegenBonus;
      }
      if(module.cargoBonus) {
        player.cargoCap += module.cargoBonus;
      }
      // Note: speed and damage bonuses applied dynamically during use
    }
    
    return true;
  }
  
  function unfitModule(moduleName){
    const index = player.fittedModules.findIndex(m => m.name === moduleName);
    if(index === -1) return false;
    
    const module = player.fittedModules[index];
    
    // Remove fitting resources
    player.powergridUsed -= module.powergridUsage;
    player.cpuUsed -= module.cpuUsage;
    
    // Remove passive bonuses
    if(module.type === 'passive'){
      if(module.shieldBonus) {
        player.maxShield -= module.shieldBonus;
        player.shield = Math.min(player.shield, player.maxShield);
      }
      if(module.armorBonus) {
        player.maxArmor -= module.armorBonus;
        player.armor = Math.min(player.armor, player.maxArmor);
      }
      if(module.shieldRegenBonus) {
        player.shieldRegen -= module.shieldRegenBonus;
      }
      if(module.capacitorBonus) {
        player.maxCap -= module.capacitorBonus;
        player.cap = Math.min(player.cap, player.maxCap);
      }
      if(module.capacitorRegenBonus) {
        player.capRegen -= module.capacitorRegenBonus;
      }
      if(module.cargoBonus) {
        player.cargoCap -= module.cargoBonus;
      }
    }
    
    // Remove from fitted list
    player.fittedModules.splice(index, 1);
    return true;
  }

  function switchShip(shipKey){
    // Save current position and credits
    const savedX = player.x;
    const savedY = player.y;
    const savedCredits = player.credits;
    const savedCargoItems = [...player.cargoItems]; // Copy cargo items array
    
    // Create new ship
    const newShip = new Ship(shipKey);
    
    // Restore position and economy
    newShip.x = savedX;
    newShip.y = savedY;
    newShip.credits = savedCredits;
    newShip.cargoItems = savedCargoItems;
    newShip.cargoUsed = savedCargoItems.reduce((sum, item) => sum + item.size, 0);
    // Trim cargo if new ship can't hold it all
    while(newShip.cargoUsed > newShip.cargoCap && newShip.cargoItems.length > 0){
      const removed = newShip.cargoItems.pop();
      newShip.cargoUsed -= removed.size;
    }
    
    // Copy over to player (replace all properties)
    Object.assign(player, newShip);
    
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

  // Mining action
  function doMine(){
    if(player.miningCooldown > 0) return;
    
    // Check if we have a mining weapon fitted
    const miningWeapon = player.fittedWeapons.find(w => w.category === 'mining');
    if(!miningWeapon) return;
    
    if(player.cap < 10) return;
    const target = selectedTarget && selectedTarget.type==='asteroid' ? selectedTarget.ref : null;
    if(!target) return;
    
    const d = dist(player, target);
    if(d > 80) return;
    if(target.amount <= 0) return;
    
    const oreData = ORE_TYPES[target.oreType] || ORE_TYPES['Veldspar'];
    const oreSize = oreData.size;
    const maxOre = Math.floor((player.cargoCap - player.cargoUsed) / oreSize);
    if(maxOre <= 0) return;
    
    const amount = Math.min(target.amount, player.miningYield, maxOre);
    target.amount -= amount;
    
    // Add ore to cargo
    for(let i = 0; i < amount; i++){
      addToInventory(player.cargoItems, {type: 'ore', name: target.oreType, size: oreSize, oreType: target.oreType});
    }
    player.cap -= miningWeapon.capacitorUse;
    player.miningCooldown = miningWeapon.fireRate;
    
    // Create mining laser visual effect that lasts the full mining cycle
    fireEffects.push({
      x1: player.x,
      y1: player.y,
      x2: target.x,
      y2: target.y,
      life: miningWeapon.fireRate,
      maxLife: miningWeapon.fireRate,
      hit: true,
      owner: 'player',
      weaponType: 'mining',
      weaponName: miningWeapon.name
    });
  }

  // Fire with accuracy-based hit calculation
  function fire(){
    if(player.fireCooldown > 0) return;
    
    // Check if we have any combat weapons fitted (not mining lasers)
    const combatWeapons = player.fittedWeapons.filter(w => w.category !== 'mining');
    if(combatWeapons.length === 0) return;
    const weapon = combatWeapons[0]; // Use first combat weapon
    
    if(player.cap < weapon.capacitorUse) return;
    
    // Check if near any station (safe zone)
    const s = systems[current];
    if(s.stations.some(st => dist(player, st) < 500)) return;
    
    // Need a target for accuracy-based system
    if(!selectedTarget || !selectedTarget.ref) return;
    if(selectedTarget.type !== 'npc') return; // Only fire at NPCs
    
    const target = selectedTarget.ref;
    const distance = dist(player, target);
    
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
      // Apply damage to target (with damage bonuses from modules)
      let damageBonus = 1.0;
      player.fittedModules.forEach(mod => {
        if(mod.damageBonus) damageBonus += mod.damageBonus;
      });
      applyDamage(target, weapon.damage * damageBonus);
    }
    
    player.fireCooldown = weapon.fireRate;
    player.cap -= weapon.capacitorUse;
  }

  // Game loop
  function update(dt){
    dt = Math.min(dt, 2);
    
    // Jump warmup countdown
    if(player.jumpWarmup > 0){
      player.jumpWarmup -= dt;
      if(player.jumpWarmup <= 0 && player.jumpDestination !== null){
        player.jumpFlashTimer = 20; // Flash for ~0.33 seconds
        jumpTo(player.jumpDestination, current);
        player.jumpDestination = null;
        player.jumpWarmup = 0;
      }
    }
    
    // Warp warmup countdown
    if(player.warpWarmup > 0){
      // Smoothly rotate towards warp destination during warmup at fixed rate
      if(player.warpTarget){
        const targetAngle = Math.atan2(player.warpTarget.y - player.y, player.warpTarget.x - player.x) + Math.PI / 2;
        
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
        player.isWarping = false;
        player.warpTarget = null;
        player.warpCooldown = 600;
        player.maxSpeed = player.sublightSpeed;
        player.vx = 0;
        player.vy = 0;
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
    
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    
    // Bounds
    const s = systems[current];
    player.x = clamp(player.x, 20, s.width - 20);
    player.y = clamp(player.y, 20, s.height - 20);
    
    // Camera follows player
    camera.x = player.x - canvas.width/2;
    camera.y = player.y - canvas.height/2;
    camera.x = clamp(camera.x, 0, s.width - canvas.width);
    camera.y = clamp(camera.y, 0, s.height - canvas.height);
    
    // Space key toggles auto-fire
    if(keys[' ']){ 
      if(!keys._firing){ 
        autoFire = !autoFire;
        keys._firing=true; 
      } 
    } else {
      keys._firing=false;
    }
    
    // Auto-fire
    if(autoFire && selectedTarget && selectedTarget.type==='npc'){
      fire();
    }
    
    // Auto-mine
    if(autoMine && selectedTarget && selectedTarget.type === 'asteroid'){
      doMine();
    }
    
    // M key toggles auto-mine
    if(keys['m']){ 
      if(!keys._mining){ 
        autoMine = !autoMine;
        keys._mining=true; 
      } 
    } else {
      keys._mining=false;
    }
    
    // Cooldowns and regen
    if(player.fireCooldown > 0) player.fireCooldown = Math.max(0, player.fireCooldown - dt);
    if(player.miningCooldown > 0) player.miningCooldown = Math.max(0, player.miningCooldown - dt);
    if(player.warpCooldown > 0) player.warpCooldown = Math.max(0, player.warpCooldown - dt);
    player.shield = Math.min(player.maxShield, player.shield + player.shieldRegen * dt * 0.1);
    player.cap = Math.min(player.maxCap, player.cap + player.capRegen * dt * 0.1);

    // NPC AI
    s.npcs.forEach(n=>{
      n.x += n.vx * dt;
      n.y += n.vy * dt;
      
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
        
        if(selectedTarget && selectedTarget.type==='npc' && selectedTarget.ref === killed){
          selectedTarget = null;
          player.targetCommand = null;
        }
      }
    }
    
    s.asteroids = s.asteroids.filter(a => a.amount > 0);
    
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
      ctx.fillText(`WARP IN ${(player.warpWarmup/60).toFixed(1)}s`, canvas.width/2 - 70, canvas.height/2 - 40);
      ctx.font = '12px monospace';
      ctx.fillStyle = '#f1f5f9';
    }
    if(player.jumpWarmup > 0){
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`JUMP IN ${(player.jumpWarmup/60).toFixed(1)}s`, canvas.width/2 - 70, canvas.height/2);
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
        const btn1 = {x: rightX + 10, y: ty, w: 70, h: 20, label: 'Warp To', action: initiateWarp};
        drawButton(btn1);
        canvasButtons.push(btn1);
        
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
        const btn1 = {x: rightX + 10, y: ty, w: 70, h: 20, label: 'Warp To', action: initiateWarp};
        drawButton(btn1);
        canvasButtons.push(btn1);
        
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
        const btn1 = {x: rightX + 10, y: ty, w: 60, h: 20, label: 'Warp', action: initiateWarp};
        drawButton(btn1);
        canvasButtons.push(btn1);
        
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
        const btn1 = {x: rightX + 10, y: ty, w: 60, h: 20, label: 'Warp', action: initiateWarp};
        drawButton(btn1);
        canvasButtons.push(btn1);
        
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
      s.stations.forEach(st=>{
        const d = Math.round(dist(player, st));
        nearby.push({type:'station', obj:st, dist:d, name:st.name});
      });
      s.stargates.forEach(g=>{
        const d = Math.round(dist(player, g));
        nearby.push({type:'gate', obj:g, dist:d, name:g.name});
      });
      s.asteroids.forEach(a=>{
        const d = Math.round(dist(player, a));
        nearby.push({type:'asteroid', obj:a, dist:d, name:`Asteroid (${a.oreType})`});
      });
      s.npcs.forEach(n=>{
        const d = Math.round(dist(player, n));
        nearby.push({type:'npc', obj:n, dist:d, name:n.type});
      });
      s.wrecks.forEach(w=>{
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
    ctx.fillText(`X: ${Math.round(player.x)} Y: ${Math.round(player.y)}`, 55, canvas.height - 10);
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
    
    // Draw nebulas (behind stars)
    const time = Date.now() / 1000;
    s.nebulas.forEach(nebula => {
      // Only render nebulas visible in viewport (with margin for size)
      if(nebula.x < camera.x - nebula.size || nebula.x > camera.x + canvas.width + nebula.size) return;
      if(nebula.y < camera.y - nebula.size || nebula.y > camera.y + canvas.height + nebula.size) return;
      
      // Subtle pulsing effect
      const pulse = Math.sin(time * 0.5 + nebula.drift) * 0.03 + 0.97;
      const opacity = nebula.opacity * pulse;
      
      // Create radial gradient for nebula
      const gradient = ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.size);
      gradient.addColorStop(0, `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, ${opacity})`);
      gradient.addColorStop(0.5, `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, ${opacity * 0.5})`);
      gradient.addColorStop(1, `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(nebula.x, nebula.y, nebula.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw background stars
    s.stars.forEach(star => {
      // Only render stars visible in viewport (with some margin)
      if(star.x < camera.x - 100 || star.x > camera.x + canvas.width + 100) return;
      if(star.y < camera.y - 100 || star.y > camera.y + canvas.height + 100) return;
      
      // Subtle twinkling effect
      const twinkle = Math.sin(time * 2 + star.twinkle) * 0.15 + 0.85;
      const alpha = star.brightness * twinkle;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw grid (if enabled)
    if(showGrid){
      ctx.strokeStyle='rgba(20,60,80,0.3)';
      ctx.lineWidth = 1;
      const startX = Math.floor(camera.x/80)*80;
      const startY = Math.floor(camera.y/80)*80;
      for(let x=startX; x<camera.x+canvas.width; x+=80){
        ctx.beginPath();
        ctx.moveTo(x,0);
        ctx.lineTo(x,20000);
        ctx.stroke();
      }
      for(let y=startY; y<camera.y+canvas.height; y+=80){
        ctx.beginPath();
        ctx.moveTo(0,y);
        ctx.lineTo(20000,y);
        ctx.stroke();
      }
    }
    
    // Stations
    s.stations.forEach(st=>{
      ctx.fillStyle = '#3b82f6';
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#3b82f6';
      
      // Station structure
      ctx.save();
      ctx.translate(st.x, st.y);
      ctx.rotate(Date.now() / 5000);
      
      // Central hub
      ctx.beginPath();
      ctx.arc(0, 0, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Docking rings
      for(let i = 0; i < 4; i++){
        const angle = (i / 4) * Math.PI * 2;
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * 35, Math.sin(angle) * 35, 8, 0, Math.PI * 2);
        ctx.stroke();
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
    
    // Stargates
    s.stargates.forEach(g=>{
      // Animated rings effect
      const time = Date.now() / 1000;
      for(let i = 0; i < 3; i++){
        const offset = (time * 0.5 + i * 0.33) % 1;
        ctx.strokeStyle = `rgba(34, 211, 238, ${1 - offset})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#22d3ee';
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.radius + offset * 20, 0, Math.PI*2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      
      // Main gate structure
      ctx.strokeStyle = '#22d3ee';
      ctx.fillStyle = '#0e7490';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#22d3ee';
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.radius, 0, Math.PI*2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Inner portal effect
      const gradient = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.radius - 5);
      gradient.addColorStop(0, 'rgba(34, 211, 238, 0.6)');
      gradient.addColorStop(0.5, 'rgba(14, 116, 144, 0.4)');
      gradient.addColorStop(1, 'rgba(6, 182, 212, 0.1)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.radius - 5, 0, Math.PI*2);
      ctx.fill();
      
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
    
    // Asteroids
    s.asteroids.forEach(a=>{
      const pct = a.amount / a.maxAmount;
      ctx.fillStyle = `rgb(${100+pct*55}, ${80+pct*40}, 30)`;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.radius, 0, Math.PI*2);
      ctx.fill();
      
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
    const shipColor = player.isWarping ? '#22d3ee' : '#06b6d4';
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
