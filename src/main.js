/**
 * SWITCHBOARD — Interactive 3D Modular Product Viewer
 * Built with Three.js + GSAP
 *
 * Realism & Component Architecture:
 *   - Industrial ABS Back Box (Conduit entries, knockouts, mounting ears)
 *   - Precision Modular Faceplate (Warm satin PC/ABS, gang bezel, branding)
 *   - 7 Interactive 3D Rocker Switches (Physical pivoted tilt, status LED, tactile click)
 *   - Dedicated Mains Neon Power Indicator (Chrome bezel, faceted ruby jewel, internal glow)
 *   - 16A Universal 3-Pin / 5-Pin Socket Outlet (Recessed dish, Earth & Live/Neutral holes, brass contacts, safety shutters, live LED)
 *   - Raised Tactile Symbols with Photoluminescent Inlays (Day/Night glow)
 *   - Synthesized Mechanical Audio Feedback (Web Audio API)
 *
 * Product Interactions:
 *   - Direct 3D Click to Toggle any switch ON/OFF (pivots in 3D with spring snap)
 *   - Day ↔ Night Mode (Photoluminescent glow charging & twilight studio lighting)
 *   - Exploded View (Precision multi-layer engineering teardown)
 *   - Camera Presets (3D Perspective / Front / Side / Top)
 *   - Component Inspector with Live Wattage, Ratings, & Interactive Toggle
 *   - Master Quick Controls ("Toggle All", "Sound")
 */

import * as THREE from 'three';
import { OrbitControls }      from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment }    from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';

/* ================================================================
   AUDIO SYNTHESIZER (Pure Web Audio API — Mechanical Switch Clicks)
================================================================ */

let audioCtx = null;
let soundEnabled = true;

function playSwitchClick(isOn) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const t = audioCtx.currentTime;

    // 1. High crisp mechanical snap (contact leaf impact)
    const snapOsc = audioCtx.createOscillator();
    const snapGain = audioCtx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(isOn ? 3100 : 2300, t);
    snapOsc.frequency.exponentialRampToValueAtTime(280, t + 0.024);
    snapGain.gain.setValueAtTime(0.30, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.028);
    snapOsc.connect(snapGain);
    snapGain.connect(audioCtx.destination);
    snapOsc.start(t);
    snapOsc.stop(t + 0.03);

    // 2. Low casing resonance thump (spring snap in cavity)
    const thumpOsc = audioCtx.createOscillator();
    const thumpGain = audioCtx.createGain();
    thumpOsc.type = 'sine';
    thumpOsc.frequency.setValueAtTime(isOn ? 195 : 145, t);
    thumpOsc.frequency.exponentialRampToValueAtTime(40, t + 0.045);
    thumpGain.gain.setValueAtTime(0.35, t);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.048);
    thumpOsc.connect(thumpGain);
    thumpGain.connect(audioCtx.destination);
    thumpOsc.start(t);
    thumpOsc.stop(t + 0.052);
  } catch {
    // Audio optional if browser policy suspends before interaction
  }
}

/* ================================================================
   GRID & DIMENSIONS (5 Columns × 2 Rows Modular Architecture)
================================================================ */

const DIM = {
  cols: 5,
  rows: 2,
  modW: 0.58,   // module width
  modH: 0.64,   // module height
  btnW: 0.52,   // rocker button width
  btnH: 0.58,   // rocker button height
  btnD: 0.088,  // rocker button depth
  gapX: 0.09,
  gapY: 0.10,
  faceW: 3.86,  // faceplate width
  faceH: 1.96,  // faceplate height
  faceD: 0.076, // faceplate thickness
  houseW: 4.10, // back box width
  houseH: 2.20, // back box height
  houseD: 0.44, // back box depth
};

// Layout coordinates
const totalZoneW = DIM.cols * DIM.modW + (DIM.cols - 1) * DIM.gapX; // 3.26
const totalZoneH = DIM.rows * DIM.modH + (DIM.rows - 1) * DIM.gapY; // 1.38
const startX = -totalZoneW / 2 + DIM.modW / 2;
const startY =  totalZoneH / 2 - DIM.modH / 2;
const colPitch = DIM.modW + DIM.gapX;
const rowPitch = DIM.modH + DIM.gapY;

/* ================================================================
   MODULE CONFIGURATIONS (7 Switches + 1 Indicator + 1 Socket)
================================================================ */

const SWITCH_CONFIGS = [
  // ROW 0 (Upper row)
  {
    id: 'switch_light1',
    label: 'Main Ceiling Light',
    icon: 'light1',
    col: 0, row: 0,
    cat: '6A Modular Switch',
    specs: '230V AC · 6A · 60W LED Fixture',
    material: 'Polycarbonate Satin White · Solid Brass Terminals',
    loadWatts: 60,
    isOn: true,
  },
  {
    id: 'switch_light2',
    label: 'Chandelier / Ambient',
    icon: 'light2',
    col: 1, row: 0,
    cat: '6A Modular Switch',
    specs: '230V AC · 6A · 120W Pendant Luminaire',
    material: 'Polycarbonate Satin White · Silver Cadmium Contacts',
    loadWatts: 120,
    isOn: false,
  },
  {
    id: 'switch_fan',
    label: 'Ceiling Fan Control',
    icon: 'fan',
    col: 2, row: 0,
    cat: '6A Modular Switch',
    specs: '230V AC · 6A · 75W BLDC Motor',
    material: 'Polycarbonate Satin White · Arc-resistant Cam',
    loadWatts: 75,
    isOn: true,
  },
  {
    id: 'switch_spot',
    label: 'Accent Spotlight',
    icon: 'spot',
    col: 3, row: 0,
    cat: '6A Modular Switch',
    specs: '230V AC · 6A · 40W Focus Downlights',
    material: 'Polycarbonate Satin White · Spark-shielded Base',
    loadWatts: 40,
    isOn: false,
  },

  // ROW 1 (Lower row)
  {
    id: 'switch_exhaust',
    label: 'Exhaust Fan',
    icon: 'exhaust',
    col: 0, row: 1,
    cat: '6A Modular Switch',
    specs: '230V AC · 6A · 45W Louvered Blower',
    material: 'Polycarbonate Satin White · Solid Brass Terminals',
    loadWatts: 45,
    isOn: false,
  },
  {
    id: 'switch_night',
    label: 'Night Lamp / Balcony',
    icon: 'night',
    col: 1, row: 1,
    cat: '6A Modular Switch',
    specs: '230V AC · 6A · 15W Ambient Night Glow',
    material: 'Polycarbonate Satin White · Photoluminescent Insert',
    loadWatts: 15,
    isOn: false,
  },
  {
    id: 'switch_socket',
    label: '16A Socket Master Switch',
    icon: 'socket_sw',
    col: 2, row: 1,
    cat: '16A Heavy-Duty Switch',
    specs: '230V AC · 16A · Controls Universal Outlet',
    material: 'Heavy-Duty Polycarbonate · Silver Alloy Rivets',
    loadWatts: 1500,
    isOn: true, // socket starts energized!
  },
];

const COMPONENT_INFO = {
  housing: {
    name: 'Main Housing / Back Box',
    material: 'High-Impact Flame Retardant ABS · Charcoal Black',
    cat: 'Enclosure',
    specs: 'Wall-Mount Cavity · 25mm Conduit Knockouts · IP30',
    state: 'PASSIVE (FLUSH MOUNTED)',
  },
  faceplate: {
    name: 'Modular Gang Faceplate',
    material: 'UV-Stabilized Polycarbonate / ABS Blend · Warm White Satin',
    cat: 'Architectural Plate',
    specs: 'Snap-Fit Gang Frame · Beveled Perimeter · Flame Retardant V0',
    state: 'SECURELY LATCHED',
  },
  screws: {
    name: 'Countersunk Mounting Fasteners',
    material: 'Zinc-Plated Hardened Steel · Polished Cross/Slotted Head',
    cat: 'Hardware',
    specs: 'M3.5 × 30mm · Anti-corrosion Passivated',
    state: 'TORQUED 1.2 Nm',
  },
  module_indicator: {
    name: 'Mains Neon Power Indicator',
    material: 'Faceted Ruby Acrylic Lens · Brushed Chrome Bezel',
    cat: 'Power Indicator',
    specs: '230V AC Continuous · High-Luminance Neon Tube with 220kΩ Resistor',
    state: 'MAINS VOLTAGE NORMAL (230V AC)',
  },
  module_socket: {
    name: '16A Universal 3-Pin / 5-Pin Socket',
    material: 'Engineered Nylon / Phosphor Bronze Terminals · Child Safety Shutters',
    cat: 'Power Outlet',
    specs: 'Dual 16A / 6A Rating · Accepts International Plugs · Interlocked with Switch 7',
    state: 'ENERGIZED (230V LIVE)',
  },
};

/* ================================================================
   RENDERER SETUP
================================================================ */

const canvas = document.getElementById('canvas-container');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
renderer.outputColorSpace = THREE.SRGBColorSpace;
canvas.appendChild(renderer.domElement);

/* ================================================================
   SCENE & ENVIRONMENT
================================================================ */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0c);
scene.fog = new THREE.FogExp2(0x0a0a0c, 0.045);

const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.03).texture;

/* ================================================================
   CAMERAS & CONTROLS
================================================================ */

const DEFAULT_POS    = new THREE.Vector3(3.6, 2.5, 4.3);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

const perspCam = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.01, 80);
perspCam.position.copy(DEFAULT_POS);

const orthoHalf = 2.45;
const orthoAspect = window.innerWidth / window.innerHeight;
const orthoCam = new THREE.OrthographicCamera(
  -orthoHalf * orthoAspect, orthoHalf * orthoAspect,
   orthoHalf, -orthoHalf,
  0.01, 80
);

let activeCamera = perspCam;

const controls = new OrbitControls(perspCam, renderer.domElement);
controls.enableDamping   = true;
controls.dampingFactor   = 0.055;
controls.minDistance     = 1.6;
controls.maxDistance     = 9.5;
controls.minPolarAngle   = 0.1;
controls.maxPolarAngle   = Math.PI - 0.1;
controls.target.copy(DEFAULT_TARGET);
controls.update();

/* ================================================================
   STUDIO LIGHTING
================================================================ */

const ambientLight = new THREE.AmbientLight(0xffffff, 0.18);
scene.add(ambientLight);

// Key light
const keyLight = new THREE.DirectionalLight(0xfff5e8, 2.5);
keyLight.position.set(5.0, 7.5, 4.5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far  = 26;
keyLight.shadow.camera.left = -4.5;  keyLight.shadow.camera.right  = 4.5;
keyLight.shadow.camera.top  =  4.5;  keyLight.shadow.camera.bottom = -4.5;
keyLight.shadow.bias = -0.0004;
keyLight.shadow.normalBias = 0.02;
scene.add(keyLight);

// Fill light
const fillLight = new THREE.DirectionalLight(0xb2d2ff, 0.65);
fillLight.position.set(-5, 1, 3);
scene.add(fillLight);

// Rim light
const rimLight = new THREE.SpotLight(0xffffff, 2.2);
rimLight.position.set(-1.5, 5.5, -5.5);
rimLight.angle    = Math.PI / 9;
rimLight.penumbra = 0.5;
rimLight.castShadow = false;
scene.add(rimLight);

// Hemisphere subtle tint
const hemi = new THREE.HemisphereLight(0x0a0e14, 0x161a20, 0.35);
scene.add(hemi);

// Shadow plane
const groundMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(16, 16),
  new THREE.ShadowMaterial({ opacity: 0.42, transparent: true })
);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.position.y = -1.8;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

// Dark grid
const grid = new THREE.GridHelper(16, 32, 0x14141a, 0x101014);
grid.position.y = -1.801;
scene.add(grid);

/* ================================================================
   SWITCHBOARD 3D MODEL
================================================================ */

const boardGroup = new THREE.Group();
scene.add(boardGroup);

const interactables   = [];
const explodeParts    = []; // { mesh, basePos, explodeOffset }
const allGlowMats     = [];
const switchRockerMap = new Map(); // id -> { group, config, ledMat, glowMat, symGroup, pointLight, rockerBody }

function stdMat(color, roughness, metalness, params = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, ...params });
}

/* ── 1. MAIN HOUSING / BACK BOX ──────────────────────────────── */
const housingMat = stdMat(0x19191e, 0.82, 0.10);
const housingGeo = new RoundedBoxGeometry(DIM.houseW, DIM.houseH, DIM.houseD, 4, 0.045);
const housing    = new THREE.Mesh(housingGeo, housingMat);
housing.castShadow    = true;
housing.receiveShadow = true;
housing.name = 'housing';
boardGroup.add(housing);
interactables.push(housing);
explodeParts.push({
  mesh: housing,
  basePos: new THREE.Vector3(0, 0, 0),
  explodeOffset: new THREE.Vector3(0, 0, -0.38),
});

// Rear conduit knockouts
[-1.6, 0, 1.6].forEach(cx => {
  const knock = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.03, 20),
    stdMat(0x111115, 0.9, 0.0)
  );
  knock.rotation.x = Math.PI / 2;
  knock.position.set(cx, 0, -DIM.houseD / 2 - 0.015);
  boardGroup.add(knock);
});

// Top & bottom conduit entry collars
[-1.2, 1.2].forEach(cx => {
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16),
    stdMat(0x131317, 0.85, 0.0)
  );
  collar.position.set(cx, DIM.houseH / 2 + 0.015, -0.05);
  boardGroup.add(collar);
});

/* ── 2. MODULAR FACEPLATE ────────────────────────────────────── */
const faceZ = DIM.houseD / 2 + DIM.faceD / 2;
const faceplateMat = stdMat(0xf0eee7, 0.22, 0.02, { envMapIntensity: 0.38 });
const faceplateGeo = new RoundedBoxGeometry(DIM.faceW, DIM.faceH, DIM.faceD, 4, 0.032);
const faceplate    = new THREE.Mesh(faceplateGeo, faceplateMat);
faceplate.position.z   = faceZ;
faceplate.castShadow   = true;
faceplate.receiveShadow = true;
faceplate.name = 'faceplate';
boardGroup.add(faceplate);
interactables.push(faceplate);
explodeParts.push({
  mesh: faceplate,
  basePos: new THREE.Vector3(0, 0, faceZ),
  explodeOffset: new THREE.Vector3(0, 0, 0.32),
});

// Inner module gang bezel frame (recessed border around all modules)
const gangBezelGeo = new THREE.BoxGeometry(totalZoneW + 0.16, totalZoneH + 0.16, 0.006);
const gangBezel = new THREE.Mesh(gangBezelGeo, stdMat(0xd8d4c8, 0.45, 0.02));
gangBezel.position.set(0, 0, faceZ + DIM.faceD / 2 + 0.002);
boardGroup.add(gangBezel);
explodeParts.push({
  mesh: gangBezel,
  basePos: new THREE.Vector3(0, 0, faceZ + DIM.faceD / 2 + 0.002),
  explodeOffset: new THREE.Vector3(0, 0, 0.48),
});

// Faceplate laser marking / branding bar at bottom
const brandMarking = new THREE.Mesh(
  new THREE.BoxGeometry(DIM.faceW * 0.45, 0.014, 0.002),
  stdMat(0xb2ada0, 0.5, 0.0)
);
brandMarking.position.set(0, -DIM.faceH / 2 + 0.075, faceZ + DIM.faceD / 2 + 0.002);
boardGroup.add(brandMarking);

/* ── 3. CORNER MOUNTING FASTENERS ────────────────────────────── */
const screwMat  = stdMat(0xa5a8ad, 0.25, 0.90);
const screwSlot = stdMat(0x3e3e44, 0.50, 0.50);
const screwCorners = [
  [-DIM.faceW / 2 + 0.12,  DIM.faceH / 2 - 0.12],
  [ DIM.faceW / 2 - 0.12,  DIM.faceH / 2 - 0.12],
  [-DIM.faceW / 2 + 0.12, -DIM.faceH / 2 + 0.12],
  [ DIM.faceW / 2 - 0.12, -DIM.faceH / 2 + 0.12],
];
screwCorners.forEach(([sx, sy], i) => {
  const screwGroup = new THREE.Group();
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.016, 20), screwMat);
  head.rotation.x = Math.PI / 2;
  screwGroup.add(head);

  // Phillips cross slot
  const slot1 = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.009, 0.006), screwSlot);
  slot1.position.z = 0.009;
  screwGroup.add(slot1);
  const slot2 = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.068, 0.006), screwSlot);
  slot2.position.z = 0.009;
  screwGroup.add(slot2);

  const basePos = new THREE.Vector3(sx, sy, faceZ + DIM.faceD / 2 + 0.007);
  screwGroup.position.copy(basePos);
  screwGroup.name = `screw_${i}`;
  boardGroup.add(screwGroup);
  interactables.push(screwGroup);
  explodeParts.push({
    mesh: screwGroup,
    basePos: basePos.clone(),
    explodeOffset: new THREE.Vector3(0, 0, 1.40),
  });
});

/* ── 4. 7 INTERACTIVE 3D ROCKER SWITCHES ─────────────────────── */

const btnSurfZ = faceZ + DIM.faceD / 2;
const btnBaseZ = btnSurfZ + DIM.btnD / 2 + 0.004;

SWITCH_CONFIGS.forEach((sw) => {
  const mx = startX + sw.col * colPitch;
  const my = startY - sw.row * rowPitch;

  // Outer module bezel frame (recessed pocket)
  const pocketGeo = new RoundedBoxGeometry(DIM.modW - 0.012, DIM.modH - 0.012, 0.02, 3, 0.012);
  const pocket = new THREE.Mesh(pocketGeo, stdMat(0xd0ccc0, 0.55, 0.0));
  pocket.position.set(mx, my, btnSurfZ + 0.008);
  boardGroup.add(pocket);
  explodeParts.push({
    mesh: pocket,
    basePos: new THREE.Vector3(mx, my, btnSurfZ + 0.008),
    explodeOffset: new THREE.Vector3(0, 0, 0.62),
  });

  // Rocker assembly group (pivots around central horizontal X axis!)
  const rockerGroup = new THREE.Group();
  rockerGroup.position.set(mx, my, btnBaseZ);
  // Physical mechanical tilt: ON = pressed bottom inward (-0.15 rad), OFF = pressed top inward (+0.15 rad)
  rockerGroup.rotation.x = sw.isOn ? -0.15 : 0.15;
  rockerGroup.name = sw.id;
  boardGroup.add(rockerGroup);
  interactables.push(rockerGroup);

  // Button body (smooth satin polycarbonate with beveled edges)
  const btnMat = stdMat(0xeae7df, 0.22, 0.02, { envMapIntensity: 0.42 });
  const btnGeo = new RoundedBoxGeometry(DIM.btnW - 0.018, DIM.btnH - 0.018, DIM.btnD, 4, 0.018);
  const btnMesh = new THREE.Mesh(btnGeo, btnMat);
  btnMesh.castShadow    = true;
  btnMesh.receiveShadow = true;
  btnMesh.name = `${sw.id}_body`;
  rockerGroup.add(btnMesh);

  // Subtle center crease (rocker pivot division line)
  const crease = new THREE.Mesh(
    new THREE.BoxGeometry(DIM.btnW - 0.08, 0.005, 0.003),
    stdMat(0xada89c, 0.5, 0.05)
  );
  crease.position.set(0, 0, DIM.btnD / 2 + 0.001);
  rockerGroup.add(crease);

  // Tactile 3D raised symbol group (top half)
  const symGroup = buildSymbol(sw.icon);
  symGroup.position.set(0, 0.085, DIM.btnD / 2 + 0.003);
  symGroup.name = `symbol_${sw.icon}`;
  rockerGroup.add(symGroup);

  // Photoluminescent green inlay insert (center-low)
  const glowMatInst = new THREE.MeshStandardMaterial({
    color:             0x44dd88,
    emissive:          new THREE.Color(0x00ff88),
    emissiveIntensity: 0.0,
    roughness:         0.22,
    metalness:         0.0,
    transparent:       true,
    opacity:           0.95,
  });
  allGlowMats.push(glowMatInst);

  const glowGeo = new THREE.BoxGeometry(DIM.btnW - 0.12, 0.034, 0.004);
  const glowMesh = new THREE.Mesh(glowGeo, glowMatInst);
  glowMesh.position.set(0, -0.055, DIM.btnD / 2 + 0.002);
  glowMesh.name = `glow_${sw.icon}`;
  rockerGroup.add(glowMesh);

  // Micro-LED power/status indicator slit (bottom edge)
  const ledMatInst = new THREE.MeshStandardMaterial({
    color:             0x00ffaa,
    emissive:          new THREE.Color(0x00ff88),
    emissiveIntensity: sw.isOn ? 3.0 : 0.04,
    roughness:         0.2,
    metalness:         0.0,
  });
  const ledGeo = new THREE.BoxGeometry(DIM.btnW * 0.35, 0.012, 0.004);
  const ledMesh = new THREE.Mesh(ledGeo, ledMatInst);
  ledMesh.position.set(0, -0.19, DIM.btnD / 2 + 0.002);
  ledMesh.name = `${sw.id}_led`;
  rockerGroup.add(ledMesh);

  // Local point light for night mode / active glow
  const ptLight = new THREE.PointLight(0x00ff88, 0, 0.75, 2.0);
  ptLight.position.set(mx, my - 0.055, btnBaseZ + DIM.btnD / 2 + 0.06);
  scene.add(ptLight);

  // Exploded view registration
  explodeParts.push({
    mesh: rockerGroup,
    basePos: new THREE.Vector3(mx, my, btnBaseZ),
    explodeOffset: new THREE.Vector3(0, 0, 0.88),
  });

  // Save to lookup map
  switchRockerMap.set(sw.id, {
    group: rockerGroup,
    config: sw,
    ledMat: ledMatInst,
    glowMat: glowMatInst,
    symGroup: symGroup,
    pointLight: ptLight,
    rockerBody: btnMesh,
  });
});

/* ── 5. MAINS NEON POWER INDICATOR MODULE (Row 0, Col 4) ──────── */
const indX = startX + 4 * colPitch;
const indY = startY - 0 * rowPitch;

const indicatorGroup = new THREE.Group();
indicatorGroup.position.set(indX, indY, btnSurfZ);
indicatorGroup.name = 'module_indicator';
boardGroup.add(indicatorGroup);
interactables.push(indicatorGroup);

// Indicator module base plate
const indPlateGeo = new RoundedBoxGeometry(DIM.modW - 0.012, DIM.modH - 0.012, 0.04, 3, 0.016);
const indPlateMesh = new THREE.Mesh(indPlateGeo, stdMat(0xeae7df, 0.22, 0.02));
indPlateMesh.position.set(0, 0, 0.02);
indPlateMesh.castShadow = true;
indicatorGroup.add(indPlateMesh);

// Chrome outer bezel ring
const indBezel = new THREE.Mesh(
  new THREE.TorusGeometry(0.148, 0.016, 14, 32),
  stdMat(0xdce0e5, 0.15, 0.95, { envMapIntensity: 0.85 })
);
indBezel.position.set(0, 0, 0.042);
indicatorGroup.add(indBezel);

// Inner knurled/stepped ring
const indInnerRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.118, 0.008, 8, 24),
  stdMat(0x8a8e94, 0.35, 0.8)
);
indInnerRing.position.set(0, 0, 0.046);
indicatorGroup.add(indInnerRing);

// Faceted domed ruby red neon jewel lens
const neonLensMat = new THREE.MeshStandardMaterial({
  color:             0xdd1800,
  emissive:          new THREE.Color(0xff4400),
  emissiveIntensity: 2.2,
  roughness:         0.12,
  metalness:         0.08,
  transparent:       true,
  opacity:           0.92,
  envMapIntensity:   0.7,
});
const neonLensGeo = new THREE.CylinderGeometry(0.108, 0.116, 0.035, 24);
const neonLensMesh = new THREE.Mesh(neonLensGeo, neonLensMat);
neonLensMesh.rotation.x = Math.PI / 2;
neonLensMesh.position.set(0, 0, 0.054);
indicatorGroup.add(neonLensMesh);

// Inner glowing neon electrode tube
const neonCoreMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 });
const neonCoreMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.018, 12), neonCoreMat);
neonCoreMesh.rotation.x = Math.PI / 2;
neonCoreMesh.position.set(0, 0, 0.052);
indicatorGroup.add(neonCoreMesh);

// Dedicated neon point light
const indicatorPointLight = new THREE.PointLight(0xff3300, 0.55, 1.4);
indicatorPointLight.position.set(indX, indY, btnSurfZ + 0.12);
scene.add(indicatorPointLight);

explodeParts.push({
  mesh: indicatorGroup,
  basePos: new THREE.Vector3(indX, indY, btnSurfZ),
  explodeOffset: new THREE.Vector3(0, 0, 0.88),
});

/* ── 6. 16A UNIVERSAL ELECTRICAL SOCKET OUTLET (Row 1, Cols 3 & 4) */
const sockW = 2 * DIM.modW + DIM.gapX - 0.012; // ~ 1.25 wide
const sockH = DIM.modH - 0.012;
const sockX = startX + 3.5 * colPitch; // Centered across cols 3 and 4
const sockY = startY - 1 * rowPitch;

const socketGroup = new THREE.Group();
socketGroup.position.set(sockX, sockY, btnSurfZ);
socketGroup.name = 'module_socket';
boardGroup.add(socketGroup);
interactables.push(socketGroup);

// Socket Base Plate:
const sockPlateGeo = new RoundedBoxGeometry(sockW, sockH, 0.04, 4, 0.016);
const sockPlateMesh = new THREE.Mesh(sockPlateGeo, stdMat(0xeae7df, 0.22, 0.02, { envMapIntensity: 0.38 }));
sockPlateMesh.position.set(0, 0, 0.02);
sockPlateMesh.castShadow    = true;
sockPlateMesh.receiveShadow = true;
socketGroup.add(sockPlateMesh);

// Center Recessed Circular Socket Basin (Contrast dish):
const dishGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.005, 32);
const dishMesh = new THREE.Mesh(dishGeo, stdMat(0xd8d4c8, 0.45, 0.02));
dishMesh.rotation.x = Math.PI / 2;
dishMesh.position.set(0, -0.01, 0.041);
socketGroup.add(dishMesh);

const dishRim = new THREE.Mesh(new THREE.TorusGeometry(0.232, 0.008, 8, 32), stdMat(0xbebaa8, 0.4, 0.05));
dishRim.position.set(0, -0.01, 0.042);
socketGroup.add(dishRim);

// Materials for socket internals
const brassMat = stdMat(0xd4af37, 0.25, 0.85); // Phosphor bronze / solid brass
const cavityMat = stdMat(0x0a0a0e, 0.95, 0.0);
const shutterMat = stdMat(0xd02518, 0.45, 0.0); // Safety shutter red

// 1. Earth Pin Terminal (Top Center):
const earthBezel = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.009, 8, 24), stdMat(0xa5a092, 0.35, 0.15));
earthBezel.position.set(0, 0.105, 0.043);
socketGroup.add(earthBezel);

const earthCavity = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.02, 20), cavityMat);
earthCavity.rotation.x = Math.PI / 2;
earthCavity.position.set(0, 0.105, 0.042);
socketGroup.add(earthCavity);

const earthBrass = new THREE.Mesh(new THREE.TorusGeometry(0.030, 0.006, 8, 20), brassMat);
earthBrass.position.set(0, 0.105, 0.040);
socketGroup.add(earthBrass);

// 2. Live & Neutral Universal Terminals (Bottom Left & Right):
[-0.12, 0.12].forEach((px, i) => {
  // Bezel ring for universal opening:
  const slotBezel = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.007, 8, 20), stdMat(0xb0aca0, 0.4, 0.1));
  slotBezel.position.set(px, -0.085, 0.043);
  socketGroup.add(slotBezel);

  // Deep dark rectangular & circular holes:
  const slotHole = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.060, 0.02), cavityMat);
  slotHole.position.set(px, -0.085, 0.042);
  socketGroup.add(slotHole);

  const roundCavity = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 16), cavityMat);
  roundCavity.rotation.x = Math.PI / 2;
  roundCavity.position.set(px, -0.085, 0.042);
  socketGroup.add(roundCavity);

  // Red Child Safety Shutter (visible inside slot):
  const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.048, 0.006), shutterMat);
  shutter.position.set(px, -0.085, 0.038);
  socketGroup.add(shutter);

  // Brass terminal leaf contact clips:
  const clip = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.040, 0.010), brassMat);
  clip.position.set(px + (i === 0 ? -0.010 : 0.010), -0.085, 0.032);
  socketGroup.add(clip);
});

// 3. Socket Power Status LED:
const socketLedMat = new THREE.MeshStandardMaterial({
  color:             0x00ff88,
  emissive:          new THREE.Color(0x00ff88),
  emissiveIntensity: 3.0,
  roughness:         0.15,
  metalness:         0.0,
});
const socketLedBezel = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.005, 8, 16), stdMat(0x999999, 0.2, 0.85));
socketLedBezel.position.set(0, 0.19, 0.044);
socketGroup.add(socketLedBezel);

const socketLedLens = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.008, 16), socketLedMat);
socketLedLens.rotation.x = Math.PI / 2;
socketLedLens.position.set(0, 0.19, 0.044);
socketGroup.add(socketLedLens);

// 4. Socket Specification Markings:
const markEarth = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.007, 0.004), stdMat(0x9a9588, 0.6, 0.0));
markEarth.position.set(0, 0.155, 0.042);
socketGroup.add(markEarth);

const markRating = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.007, 0.004), stdMat(0x9a9588, 0.6, 0.0));
markRating.position.set(0, -0.185, 0.042);
socketGroup.add(markRating);

explodeParts.push({
  mesh: socketGroup,
  basePos: new THREE.Vector3(sockX, sockY, btnSurfZ),
  explodeOffset: new THREE.Vector3(0, 0, 0.88),
});

/* ================================================================
   TACTILE SYMBOL GEOMETRY BUILDERS
================================================================ */

function buildSymbol(type) {
  const g = new THREE.Group();
  const m = () => stdMat(0x18181c, 0.55, 0.08);
  const H = 0.004;

  switch (type) {
    case 'light1': {
      // Main Bulb
      g.add(mesh(new THREE.TorusGeometry(0.052, 0.008, 8, 24), m()));
      g.add(boxMesh(0.068, 0.008, H, m()));
      g.add(boxMesh(0.008, 0.068, H, m()));
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const ray = boxMesh(0.026, 0.006, H, m());
        ray.position.set(Math.cos(a) * 0.086, Math.sin(a) * 0.086, 0);
        ray.rotation.z = a;
        g.add(ray);
      }
      g.add(positioned(boxMesh(0.020, 0.015, H, m()), 0, -0.068, 0));
      break;
    }

    case 'light2': {
      // Chandelier / Ambient pendant
      g.add(positioned(boxMesh(0.12, 0.007, H, m()), 0, 0.07, 0));
      [-0.045, 0, 0.045].forEach((dx, i) => {
        const wire = boxMesh(0.006, 0.055, H, m());
        wire.position.set(dx, 0.038, 0);
        g.add(wire);
        const pod = mesh(new THREE.CylinderGeometry(0.016, 0.010, 0.026, 12), m());
        pod.rotation.x = Math.PI / 2;
        pod.position.set(dx, 0.005 - (i === 1 ? 0.012 : 0), 0);
        g.add(pod);
      });
      break;
    }

    case 'fan': {
      // Aerodynamic 4-blade fan
      g.add(mesh(new THREE.TorusGeometry(0.092, 0.007, 8, 28), m()));
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, H * 2, 12), m());
      hub.rotation.x = Math.PI / 2;
      g.add(hub);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const blade = boxMesh(0.066, 0.022, H, m());
        blade.position.set(Math.cos(a + 0.55) * 0.048, Math.sin(a + 0.55) * 0.048, 0);
        blade.rotation.z = a + 0.55 + Math.PI / 6;
        g.add(blade);
      }
      break;
    }

    case 'spot': {
      // Accent spotlight / cone beam
      const hood = mesh(new THREE.CylinderGeometry(0.03, 0.018, 0.025, 16), m());
      hood.rotation.x = Math.PI / 2;
      hood.position.set(0, 0.05, 0);
      g.add(hood);
      [-0.04, 0, 0.04].forEach((dx, i) => {
        const ray = boxMesh(0.006, 0.065, H, m());
        ray.position.set(dx, -0.015, 0);
        ray.rotation.z = (i - 1) * -0.25;
        g.add(ray);
      });
      break;
    }

    case 'exhaust': {
      // Louvered vent slats + direction arrow
      [-0.042, 0, 0.042].forEach(dy => {
        g.add(positioned(boxMesh(0.12, 0.011, H, m()), 0, dy, 0));
      });
      g.add(positioned(boxMesh(0.009, 0.13, H, m()), -0.062, 0, 0));
      g.add(positioned(boxMesh(0.009, 0.13, H, m()),  0.062, 0, 0));
      // Flow arrow
      g.add(positioned(boxMesh(0.032, 0.007, H, m()), 0.092, 0, 0));
      const a1 = positioned(boxMesh(0.018, 0.006, H, m()), 0.104, 0.010, 0);
      a1.rotation.z = Math.PI / 4; g.add(a1);
      const a2 = positioned(boxMesh(0.018, 0.006, H, m()), 0.104, -0.010, 0);
      a2.rotation.z = -Math.PI / 4; g.add(a2);
      break;
    }

    case 'night': {
      // Crescent moon + star
      const moon = mesh(new THREE.TorusGeometry(0.048, 0.012, 8, 20, Math.PI * 1.3), m());
      moon.rotation.z = 0.6;
      moon.position.set(-0.015, 0, 0);
      g.add(moon);
      const starV = boxMesh(0.007, 0.035, H, m());
      starV.position.set(0.045, 0.02, 0);
      g.add(starV);
      const starH = boxMesh(0.035, 0.007, H, m());
      starH.position.set(0.045, 0.02, 0);
      g.add(starH);
      break;
    }

    case 'socket_sw': {
      // Master power symbol (open circle + vertical I)
      const ring = mesh(new THREE.TorusGeometry(0.046, 0.008, 8, 24, Math.PI * 1.55), m());
      ring.rotation.z = Math.PI * 0.725;
      g.add(ring);
      const bar = boxMesh(0.008, 0.046, H, m());
      bar.position.set(0, 0.024, 0);
      g.add(bar);
      break;
    }
  }

  return g;
}

function mesh(geo, mat) {
  return new THREE.Mesh(geo, mat);
}
function boxMesh(w, h, d, mat) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
}
function positioned(obj, x, y, z) {
  obj.position.set(x, y, z);
  return obj;
}

/* ================================================================
   INTERACTION: 3D SWITCH TOGGLING & SELECTION
================================================================ */

const raycaster = new THREE.Raycaster();
const pointer   = new THREE.Vector2();

let selectedObj = null;
let hoveredObj  = null;
const origMaterialMap = new Map();

function getClickableMeshes() {
  const list = [];
  interactables.forEach(obj => {
    if (obj.isMesh) list.push(obj);
    else obj.traverse(c => { if (c.isMesh) list.push(c); });
  });
  return list;
}

function findInteractable(obj) {
  let cur = obj;
  while (cur) {
    if (interactables.includes(cur)) return cur;
    cur = cur.parent;
  }
  return null;
}

function highlight(obj, col = 0x3388ee) {
  const apply = (m) => {
    if (!origMaterialMap.has(m.uuid)) origMaterialMap.set(m.uuid, m.material);
    const clone = m.material.clone();
    clone.emissive.set(col);
    clone.emissiveIntensity = 0.28;
    m.material = clone;
  };
  obj.isMesh ? apply(obj) : obj.traverse(c => c.isMesh && apply(c));
}

function clearHighlight(obj) {
  if (!obj) return;
  const restore = (m) => {
    const orig = origMaterialMap.get(m.uuid);
    if (orig) { m.material = orig; origMaterialMap.delete(m.uuid); }
  };
  obj.isMesh ? restore(obj) : obj.traverse(c => c.isMesh && restore(c));
}

/* ── SWITCH TOGGLE LOGIC ─────────────────────────────────────── */

function toggleSwitch(switchId) {
  const entry = switchRockerMap.get(switchId);
  if (!entry) return;

  const sw = entry.config;
  sw.isOn = !sw.isOn;

  // Mechanical switch audio click
  playSwitchClick(sw.isOn);

  // 3D Rocker tilt animation with mechanical spring bounce
  const targetAngle = sw.isOn ? -0.15 : 0.15;
  gsap.to(entry.group.rotation, {
    x: targetAngle,
    duration: 0.20,
    ease: 'back.out(2.2)',
  });

  // Switch status LED
  gsap.to(entry.ledMat, {
    emissiveIntensity: sw.isOn ? 3.0 : 0.04,
    duration: 0.15,
  });

  // Switch glow light (in night mode)
  if (isNight) {
    gsap.to(entry.pointLight, {
      intensity: sw.isOn ? 0.65 : 0.08,
      duration: 0.2,
    });
  }

  // Interlocked: If this is Switch 7 (Socket Switch), energize the 16A Socket!
  if (switchId === 'switch_socket') {
    updateSocketState(sw.isOn);
  }

  // Update HUD status & Inspector
  updateStatusChip();
  if (selectedObj && (selectedObj.name === switchId || selectedObj === entry.group)) {
    updateInspectorForSwitch(sw);
  }
}

function updateSocketState(isEnergized) {
  gsap.to(socketLedMat, {
    emissiveIntensity: isEnergized ? 3.0 : 0.04,
    duration: 0.2,
  });
  COMPONENT_INFO.module_socket.state = isEnergized ? 'ENERGIZED (230V LIVE)' : 'DE-ENERGIZED (0V SAFE)';
  if (selectedObj && selectedObj.name === 'module_socket') {
    showInspector(COMPONENT_INFO.module_socket);
  }
}

/* ── POINTER HANDLING ────────────────────────────────────────── */

let ptrDownPos = { x: 0, y: 0 };
let ptrMoved   = false;

renderer.domElement.addEventListener('pointerdown', e => {
  ptrDownPos = { x: e.clientX, y: e.clientY };
  ptrMoved = false;
});

renderer.domElement.addEventListener('pointermove', e => {
  if (!ptrMoved) {
    const d = Math.hypot(e.clientX - ptrDownPos.x, e.clientY - ptrDownPos.y);
    if (d > 4) ptrMoved = true;
  }
  updatePointer(e);
  raycaster.setFromCamera(pointer, activeCamera);
  const hits = raycaster.intersectObjects(getClickableMeshes(), true);
  const hit  = hits.length ? findInteractable(hits[0].object) : null;

  if (hit !== hoveredObj) {
    if (hoveredObj && hoveredObj !== selectedObj) clearHighlight(hoveredObj);
    hoveredObj = hit;
    if (hoveredObj && hoveredObj !== selectedObj) highlight(hoveredObj, 0x113322);
    renderer.domElement.style.cursor = hit ? 'pointer' : 'default';
  }
});

renderer.domElement.addEventListener('pointerup', e => {
  if (ptrMoved) return;
  updatePointer(e);
  raycaster.setFromCamera(pointer, activeCamera);
  const hits = raycaster.intersectObjects(getClickableMeshes(), true);
  const hit  = hits.length ? findInteractable(hits[0].object) : null;

  if (hit) {
    const switchId = hit.name;
    // If a switch was clicked, toggle it in 3D!
    if (switchRockerMap.has(switchId)) {
      toggleSwitch(switchId);
    }

    // Update selection
    if (selectedObj && selectedObj !== hit) clearHighlight(selectedObj);
    selectedObj = hit;
    highlight(hit, 0x3388ee);

    // Inspector reflection
    if (switchRockerMap.has(switchId)) {
      updateInspectorForSwitch(switchRockerMap.get(switchId).config);
    } else {
      const infoKey = hit.name.startsWith('screw') ? 'screws' : hit.name;
      showInspector(COMPONENT_INFO[infoKey] || {
        name: hit.name,
        material: 'Modular Engineered Polymer',
        cat: 'Switchboard Assembly',
        specs: 'Standard Precision Component',
        state: 'SECURE',
      });
    }
  } else {
    if (selectedObj) { clearHighlight(selectedObj); selectedObj = null; }
    showInspector(null);
  }
});

function updatePointer(e) {
  pointer.x =  (e.clientX / window.innerWidth)  * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

/* ================================================================
   HUD & INSPECTOR UI
================================================================ */

const statusChipText = document.getElementById('status-chip-text');
const inspectorEl    = document.getElementById('inspector');
const inspNameEl     = document.getElementById('inspector-name');
const inspMatEl      = document.getElementById('inspector-material');
const inspCatEl      = document.getElementById('inspector-category');
const inspSpecsEl    = document.getElementById('inspector-specs');
const inspStateEl    = document.getElementById('inspector-state');
const inspBadgeEl    = document.getElementById('inspector-badge');
const btnToggleSw    = document.getElementById('btn-toggle-switch');
const toggleLabel    = document.getElementById('toggle-btn-label');

function updateStatusChip() {
  const activeCount = SWITCH_CONFIGS.filter(s => s.isOn).length;
  const totalWatts  = SWITCH_CONFIGS.reduce((sum, s) => s.isOn ? sum + s.loadWatts : sum, 0);
  statusChipText.textContent = `${activeCount} / 7 ON · ${totalWatts} W`;
}
updateStatusChip();

function updateInspectorForSwitch(sw) {
  inspNameEl.textContent  = sw.label;
  inspMatEl.textContent   = sw.material;
  inspCatEl.textContent   = sw.cat;
  inspSpecsEl.textContent = sw.specs;
  inspStateEl.textContent = sw.isOn ? `ACTIVE (ON) · Draws ~${sw.loadWatts}W` : 'STANDBY (OFF) · 0W';

  inspBadgeEl.textContent = sw.isOn ? 'ON' : 'OFF';
  inspBadgeEl.className   = `badge-status ${sw.isOn ? 'badge-on' : 'badge-off'}`;

  btnToggleSw.classList.remove('hidden');
  btnToggleSw.classList.toggle('btn-is-off', sw.isOn);
  toggleLabel.textContent = sw.isOn ? 'Turn OFF' : 'Turn ON';

  inspectorEl.classList.add('visible', 'selected');
}

function showInspector(data) {
  if (data) {
    inspNameEl.textContent  = data.name;
    inspMatEl.textContent   = data.material;
    inspCatEl.textContent   = data.cat;
    inspSpecsEl.textContent = data.specs || 'Standard Spec';
    inspStateEl.textContent = data.state || 'PASSIVE';

    inspBadgeEl.textContent = data.state && data.state.includes('LIVE') ? 'LIVE' : 'INFO';
    inspBadgeEl.className   = 'badge-status badge-neutral';

    btnToggleSw.classList.add('hidden');
    inspectorEl.classList.add('visible', 'selected');
  } else {
    inspectorEl.classList.remove('visible', 'selected');
  }
}

// Inspector interactive toggle button
btnToggleSw.addEventListener('click', () => {
  if (selectedObj && switchRockerMap.has(selectedObj.name)) {
    toggleSwitch(selectedObj.name);
  }
});

// Deselect button
document.getElementById('btn-deselect').addEventListener('click', () => {
  if (selectedObj) { clearHighlight(selectedObj); selectedObj = null; }
  showInspector(null);
});

/* ================================================================
   TOOLBAR: DAY / NIGHT MODE (Photoluminescent Glow)
================================================================ */

let isNight = false;

document.getElementById('btn-daynight').addEventListener('click', () => {
  isNight = !isNight;
  const btn = document.getElementById('btn-daynight');
  btn.classList.toggle('active', isNight);
  btn.setAttribute('aria-pressed', isNight);

  document.getElementById('mode-dot').classList.toggle('night', isNight);
  document.getElementById('mode-label').textContent = isNight ? 'Night Mode' : 'Day Mode';
  document.getElementById('mode-indicator').classList.toggle('night', isNight);

  const icon = document.getElementById('daynight-icon');
  icon.innerHTML = isNight
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
         <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
       </svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
         <circle cx="12" cy="12" r="5"/>
         <line x1="12" y1="1" x2="12" y2="3"/>
         <line x1="12" y1="21" x2="12" y2="23"/>
         <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
         <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
         <line x1="1" y1="12" x2="3" y2="12"/>
         <line x1="21" y1="12" x2="23" y2="12"/>
         <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
         <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
       </svg>`;

  // Lighting transition
  gsap.to(ambientLight, { intensity: isNight ? 0.02 : 0.18, duration: 1.1 });
  gsap.to(keyLight,     { intensity: isNight ? 0.05 : 2.5,  duration: 1.1 });
  gsap.to(fillLight,    { intensity: isNight ? 0.02 : 0.65, duration: 1.1 });
  gsap.to(rimLight,     { intensity: isNight ? 0.10 : 2.2,  duration: 1.1 });

  const targetBg = isNight ? new THREE.Color(0x040406) : new THREE.Color(0x0a0a0c);
  gsap.to(scene.background, { r: targetBg.r, g: targetBg.g, b: targetBg.b, duration: 1.1 });

  // Photoluminescent green strips charge up!
  allGlowMats.forEach(mat => {
    gsap.to(mat, { emissiveIntensity: isNight ? 3.5 : 0.0, duration: 1.3 });
  });

  // Neon indicator intensifies in night
  gsap.to(neonLensMat, { emissiveIntensity: isNight ? 3.8 : 2.2, duration: 1.2 });
  gsap.to(indicatorPointLight, { intensity: isNight ? 0.95 : 0.55, duration: 1.2 });

  // Switch point lights
  switchRockerMap.forEach(entry => {
    gsap.to(entry.pointLight, {
      intensity: isNight ? (entry.config.isOn ? 0.65 : 0.08) : 0,
      duration: 1.2,
    });
  });
});

/* ================================================================
   TOOLBAR: MASTER "TOGGLE ALL" QUICK CONTROL
================================================================ */

document.getElementById('btn-toggle-all').addEventListener('click', () => {
  const anyOn = SWITCH_CONFIGS.some(s => s.isOn);
  const targetState = !anyOn; // If any is on, turn all off; otherwise turn all on

  SWITCH_CONFIGS.forEach((sw, i) => {
    setTimeout(() => {
      if (sw.isOn !== targetState) {
        toggleSwitch(sw.id);
      }
    }, i * 40); // Staggered mechanical click sequence
  });
});

/* ================================================================
   TOOLBAR: SOUND MUTE TOGGLE
================================================================ */

const btnSound = document.getElementById('btn-sound');
btnSound.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  btnSound.classList.toggle('active', soundEnabled);
  btnSound.setAttribute('aria-pressed', soundEnabled);

  const soundIcon = document.getElementById('sound-icon');
  soundIcon.innerHTML = soundEnabled
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
         <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
         <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
       </svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
         <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
         <line x1="23" y1="9" x2="17" y2="15"/>
         <line x1="17" y1="9" x2="23" y2="15"/>
       </svg>`;
});

/* ================================================================
   TOOLBAR: EXPLODED VIEW (Engineering Layer Teardown)
================================================================ */

let isExploded = false;

document.getElementById('btn-explode').addEventListener('click', () => {
  isExploded = !isExploded;
  const btn = document.getElementById('btn-explode');
  btn.classList.toggle('active', isExploded);
  btn.setAttribute('aria-pressed', isExploded);

  explodeParts.forEach((part, i) => {
    const target = isExploded
      ? part.basePos.clone().add(part.explodeOffset)
      : part.basePos.clone();

    gsap.to(part.mesh.position, {
      x: target.x, y: target.y, z: target.z,
      duration: 0.85,
      delay: isExploded ? i * 0.035 : (explodeParts.length - 1 - i) * 0.025,
      ease: 'power3.inOut',
    });
  });
});

/* ================================================================
   TOOLBAR: CAMERA VIEW PRESETS
================================================================ */

const D_ORTHO = 5.2;

function setView(view) {
  document.querySelectorAll('.view-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });

  if (view === 'perspective') {
    activeCamera = perspCam;
    controls.enabled = true;
    controls.object  = perspCam;
    document.getElementById('btn-persp').classList.add('active');
    document.getElementById('btn-persp').setAttribute('aria-pressed', 'true');
    return;
  }

  activeCamera    = orthoCam;
  controls.enabled = false;

  switch (view) {
    case 'front':
      orthoCam.position.set(0, 0, D_ORTHO);
      orthoCam.up.set(0, 1, 0);
      document.getElementById('btn-front').classList.add('active');
      document.getElementById('btn-front').setAttribute('aria-pressed', 'true');
      break;
    case 'side':
      orthoCam.position.set(D_ORTHO, 0, 0);
      orthoCam.up.set(0, 1, 0);
      document.getElementById('btn-side').classList.add('active');
      document.getElementById('btn-side').setAttribute('aria-pressed', 'true');
      break;
    case 'top':
      orthoCam.position.set(0, D_ORTHO, 0);
      orthoCam.up.set(0, 0, -1);
      document.getElementById('btn-top').classList.add('active');
      document.getElementById('btn-top').setAttribute('aria-pressed', 'true');
      break;
  }
  orthoCam.lookAt(0, 0, 0);
  orthoCam.updateProjectionMatrix();
}

document.getElementById('btn-persp').addEventListener('click', () => setView('perspective'));
document.getElementById('btn-front').addEventListener('click', () => setView('front'));
document.getElementById('btn-side').addEventListener('click',  () => setView('side'));
document.getElementById('btn-top').addEventListener('click',   () => setView('top'));

/* ================================================================
   RESET CAMERA
================================================================ */

document.getElementById('btn-reset').addEventListener('click', () => {
  if (activeCamera !== perspCam) setView('perspective');

  gsap.to(perspCam.position, {
    x: DEFAULT_POS.x, y: DEFAULT_POS.y, z: DEFAULT_POS.z,
    duration: 1.1, ease: 'power3.inOut',
  });
  gsap.to(controls.target, {
    x: 0, y: 0, z: 0,
    duration: 1.1, ease: 'power3.inOut',
    onUpdate: () => controls.update(),
  });
});

/* ================================================================
   RESIZE HANDLER
================================================================ */

window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;

  perspCam.aspect = w / h;
  perspCam.updateProjectionMatrix();

  const aspect = w / h;
  orthoCam.left   = -orthoHalf * aspect;
  orthoCam.right  =  orthoHalf * aspect;
  orthoCam.updateProjectionMatrix();

  renderer.setSize(w, h);
});

/* ================================================================
   LOAD OVERLAY
================================================================ */

window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loading').classList.add('hidden');
    setTimeout(() => {
      document.getElementById('hint').classList.add('fade');
    }, 6000);
  }, 400);
});

/* ================================================================
   IDLE SWAY & RENDER LOOP
================================================================ */

let idleTimer   = 0;
let idleActive  = false;
let lastPointer = { x: -999, y: -999 };

document.addEventListener('pointermove', e => {
  if (Math.abs(e.clientX - lastPointer.x) > 2 || Math.abs(e.clientY - lastPointer.y) > 2) {
    idleTimer  = 0;
    idleActive = false;
    lastPointer = { x: e.clientX, y: e.clientY };
  }
});

let clock = 0;

function animate() {
  requestAnimationFrame(animate);
  clock += 0.012;

  controls.update();

  idleTimer++;
  if (idleTimer > 320 && !isExploded) {
    idleActive = true;
  }
  if (idleActive) {
    boardGroup.rotation.y = Math.sin(clock * 0.22) * 0.035;
    boardGroup.rotation.x = Math.sin(clock * 0.15) * 0.012;
  } else {
    boardGroup.rotation.y += (0 - boardGroup.rotation.y) * 0.04;
    boardGroup.rotation.x += (0 - boardGroup.rotation.x) * 0.04;
  }

  renderer.render(scene, activeCamera);
}

animate();
