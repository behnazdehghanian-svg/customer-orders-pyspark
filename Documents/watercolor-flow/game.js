const canvas = document.getElementById('gameCanvas');

// ---- Paper colors ----
const paperColors = {
  cream: 0xf2ece4,
  white: 0xffffff,
  night: 0x1a1a2e,
  aged:  0xe8d5a3,
  blush: 0xfce4ec,
  sage:  0xe8f5e9,
};

let currentPaper = 'cream';

const app = new PIXI.Application({
  view: canvas,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: paperColors[currentPaper],
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
});

// ---- Helpers ----
function hexToNum(hex) { return parseInt(hex.replace('#',''), 16); }
function hexToRgb(hex) {
  const n = hexToNum(hex);
  return { r: (n>>16)&255, g: (n>>8)&255, b: n&255 };
}
function rgbToHex(r,g,b) {
  return '#' + [r,g,b].map(v=>Math.min(255,Math.round(v)).toString(16).padStart(2,'0')).join('');
}
function lerpColor(a, b, t) {
  const ca = hexToRgb(a), cb = hexToRgb(b);
  return rgbToHex(
    ca.r+(cb.r-ca.r)*t,
    ca.g+(cb.g-ca.g)*t,
    ca.b+(cb.b-ca.b)*t
  );
}

// ---- State ----
let selectedColor = '#e07a9f';
let isDrawing     = false;
let brushSize     = 28;
let selectedBrush = 'watercolor';

// ---- Layers ----
const permanentLayer = new PIXI.Graphics();
const bloomLayer     = new PIXI.Graphics();
const glowLayer      = new PIXI.Graphics();
app.stage.addChild(permanentLayer, bloomLayer, glowLayer);

// ---- Drops ----
const drops = [];

function spawnBloom(x, y, color, radius) {
  drops.push({
    x, y, color, radius,
    life: 1,
    decay: 0.008 + Math.random() * 0.006,
    grow: 0.3 + Math.random() * 0.3,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.05 + Math.random() * 0.04,
    vx: (Math.random()-0.5) * 0.4,
    vy: (Math.random()-0.5) * 0.4,
  });
}

// ---- Brush types ----
function paintWatercolor(x, y) {
  for (let i = 0; i < 6; i++) {
    const angle  = Math.random() * Math.PI * 2;
    const spread = Math.random() * brushSize * 0.5;
    const px = x + Math.cos(angle) * spread;
    const py = y + Math.sin(angle) * spread;
    const r  = brushSize * (0.4 + Math.random() * 0.7);
    permanentLayer.beginFill(hexToNum(selectedColor), 0.07 + Math.random() * 0.08);
    permanentLayer.drawCircle(px, py, r);
    permanentLayer.endFill();
    permanentLayer.beginFill(hexToNum(selectedColor), 0.02);
    permanentLayer.drawCircle(px, py, r * 1.6);
    permanentLayer.endFill();
    spawnBloom(px, py, selectedColor, r * 1.2);
  }
}

function paintInkDrop(x, y) {
  const r = brushSize * (0.8 + Math.random() * 0.4);
  permanentLayer.beginFill(hexToNum(selectedColor), 0.55);
  permanentLayer.drawCircle(x, y, r * 0.5);
  permanentLayer.endFill();
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 / 8) * i + Math.random() * 0.4;
    const len   = r * (0.6 + Math.random() * 0.8);
    const tx    = x + Math.cos(angle) * len;
    const ty    = y + Math.sin(angle) * len;
    permanentLayer.beginFill(hexToNum(selectedColor), 0.3 + Math.random() * 0.2);
    permanentLayer.drawCircle(tx, ty, 2 + Math.random() * (brushSize * 0.2));
    permanentLayer.endFill();
  }
  spawnBloom(x, y, selectedColor, r);
}

function paintSplatter(x, y) {
  const count = 18 + Math.floor(Math.random() * 14);
  for (let i = 0; i < count; i++) {
    const angle  = Math.random() * Math.PI * 2;
    const dist   = Math.random() * brushSize * 2.5;
    const px     = x + Math.cos(angle) * dist;
    const py     = y + Math.sin(angle) * dist;
    const r      = 1 + Math.random() * (brushSize * 0.3);
    const alpha  = 0.4 + Math.random() * 0.4;
    permanentLayer.beginFill(hexToNum(selectedColor), alpha);
    permanentLayer.drawCircle(px, py, r);
    permanentLayer.endFill();
    if (Math.random() > 0.7) spawnBloom(px, py, selectedColor, r * 2);
  }
}

function paintCloud(x, y) {
  for (let i = 0; i < 8; i++) {
    const angle  = Math.random() * Math.PI * 2;
    const spread = Math.random() * brushSize * 0.8;
    const px     = x + Math.cos(angle) * spread;
    const py     = y + Math.sin(angle) * spread;
    const r      = brushSize * (0.8 + Math.random() * 1.2);
    permanentLayer.beginFill(hexToNum(selectedColor), 0.025 + Math.random() * 0.03);
    permanentLayer.drawCircle(px, py, r);
    permanentLayer.endFill();
    spawnBloom(px, py, selectedColor, r * 1.4);
  }
}

function paint(x, y) {
  if (selectedBrush === 'watercolor') paintWatercolor(x, y);
  else if (selectedBrush === 'inkdrop')  paintInkDrop(x, y);
  else if (selectedBrush === 'splatter') paintSplatter(x, y);
  else if (selectedBrush === 'cloud')    paintCloud(x, y);
}

// ---- Tick ----
app.ticker.add(() => {
  bloomLayer.clear();
  glowLayer.clear();

  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.radius     += d.grow;
    d.grow       *= 0.94;
    d.x          += d.vx;
    d.y          += d.vy;
    d.vx         *= 0.97;
    d.vy         *= 0.97;
    d.wobble     += d.wobbleSpeed;
    d.life       -= d.decay;

    if (d.life <= 0 || d.radius > 250) { drops.splice(i, 1); continue; }

    let blendColor = d.color;
    for (let j = 0; j < drops.length; j++) {
      if (i === j) continue;
      const o = drops[j];
      const dist = Math.hypot(d.x - o.x, d.y - o.y);
      const overlap = (d.radius + o.radius) - dist;
      if (overlap > 10 && o.color !== d.color) {
        const t = Math.min(0.4, overlap / (d.radius * 2));
        blendColor = lerpColor(blendColor, o.color, t * 0.4);
      }
    }

    const wobbleAmt = d.radius * 0.07;
    const wx    = Math.cos(d.wobble) * wobbleAmt;
    const wy    = Math.sin(d.wobble) * wobbleAmt;
    const alpha = d.life * 0.18;

    bloomLayer.beginFill(hexToNum(blendColor), alpha);
    bloomLayer.drawEllipse(d.x + wx, d.y + wy, d.radius, d.radius * (0.88 + Math.sin(d.wobble)*0.08));
    bloomLayer.endFill();
    bloomLayer.beginFill(hexToNum(blendColor), alpha * 0.3);
    bloomLayer.drawCircle(d.x, d.y, d.radius * 1.4);
    bloomLayer.endFill();
    glowLayer.beginFill(hexToNum(blendColor), 0.012);
    glowLayer.drawCircle(d.x, d.y, d.radius * 2);
    glowLayer.endFill();
  }
});

// ---- Events ----
function getPos(e) {
  const r = canvas.getBoundingClientRect();
  if (e.touches) return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

canvas.addEventListener('mousedown',  (e) => { isDrawing = true; const p = getPos(e); paint(p.x, p.y); });
canvas.addEventListener('mousemove',  (e) => { if (!isDrawing) return; const p = getPos(e); paint(p.x, p.y); });
canvas.addEventListener('mouseup',    ()  => { isDrawing = false; });
canvas.addEventListener('mouseleave', ()  => { isDrawing = false; });
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); isDrawing = true; const p = getPos(e); paint(p.x, p.y); }, { passive: false });
canvas.addEventListener('touchmove',  (e) => { e.preventDefault(); if (!isDrawing) return; const p = getPos(e); paint(p.x, p.y); }, { passive: false });
canvas.addEventListener('touchend',   ()  => { isDrawing = false; });

// ---- Palette ----
const colorBtns = document.querySelectorAll('.color-btn');
colorBtns[0].classList.add('selected');
colorBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    colorBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedColor = btn.dataset.color;
  });
});

// ---- Brush size ----
document.getElementById('brushSize').addEventListener('input', e => {
  brushSize = parseInt(e.target.value);
});

// ---- Brush type ----
const brushBtns = document.querySelectorAll('.brush-btn');
brushBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    brushBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedBrush = btn.dataset.brush;
  });
});

// ---- Paper ----
const paperBtns = document.querySelectorAll('.paper-btn');
paperBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    paperBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    currentPaper = btn.dataset.paper;
    app.renderer.backgroundColor = paperColors[currentPaper];
    document.body.style.background = btn.style.background;
    document.body.className = currentPaper === 'night' ? 'night' : '';
    permanentLayer.clear();
    bloomLayer.clear();
    glowLayer.clear();
    drops.length = 0;
  });
});

// ---- Clear ----
document.getElementById('clearBtn').addEventListener('click', () => {
  drops.length = 0;
  permanentLayer.clear();
  bloomLayer.clear();
  glowLayer.clear();
});

// ---- Save ----
document.getElementById('saveBtn').addEventListener('click', () => {
  app.renderer.extract.canvas(app.stage).toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'watercolor-flow.png'; a.click();
    URL.revokeObjectURL(url);
  });
});

// ---- Resize ----
window.addEventListener('resize', () => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
});