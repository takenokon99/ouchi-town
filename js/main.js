// おうちタウン 本体: 表示・指の操作・置く場所の判定・保存
import { drawCharacter, FAMILY, PATTERN_DEFS, metrics, handOverlay, setPack, SPRITES, OUTFIT_IMGS, spriteDefs } from './characters.js';
import { ITEMS, drawItem } from './items.js';
import { FURNITURE, backgroundSvg, ROOM_DEFS, ROOM_W, WORLD_H, FLOOR_MIN, FLOOR_MAX, FLOOR_DEFAULT, roomShade } from './rooms.js';
import { unlock, sfx, setMusic } from './sound.js';
import { openDress, initDress } from './dress.js';

const WORLD_W = ROOM_W * 2;
const SAVE_KEY = 'ouchi-town-v1';
const NS = 'http://www.w3.org/2000/svg';
const MOVE_PX = 10; // これ以上指が動いたら「つまむ」、動かなければ「タップ」

// ---------- 状態 ----------
function initialState() {
  const it = (id, type, x, y, cont = null) => ({ id, type, x, y, cont, bites: 0, heldBy: null, home: null });
  const items = [
    it('teddy', 'teddy', 1420, 690),
    it('ball', 'ball', 1230, 950),
    it('book', 'book', 630, 590),
    it('vase', 'vase', 1270, 380),
    it('phone', 'phone', 650, 690, 'dresser'),
    it('brush', 'toothbrush', 780, 690, 'dresser'),
    it('cat', 'cat', 360, 940),
    it('apple', 'apple', 1745, 410, 'fridge'),
    it('banana', 'banana', 1835, 410, 'fridge'),
    it('milk', 'milk', 1740, 590, 'fridge'),
    it('cake', 'cake', 1835, 590, 'fridge'),
    it('icecream', 'icecream', 1745, 760, 'fridge'),
    it('onigiri', 'onigiri', 1835, 760, 'fridge'),
    it('pan', 'pan', 2300, 572),
    it('mug', 'mug', 2175, 590),
    it('radio', 'radio', 2650, 690),
    it('donut', 'donut', 2770, 690),
    it('bread', 'bread', 2870, 690),
    it('juice', 'juice', 2950, 690),
  ];
  // 冷蔵庫の食べ物は、食べ終わると冷蔵庫に戻る
  for (const i of items) if (i.cont === 'fridge') i.home = { x: i.x, y: i.y, cont: 'fridge' };
  return {
    v: 1,
    camX: 0,
    sel: FAMILY[0].id,
    f: { wardrobe: false, drawer: false, fridge: false, lamp0: true, lamp1: true, night: false, faucet: false, stove: false, tv: 0, music: false },
    chars: FAMILY.map((c, i) => ({ id: c.id, look: { ...c.look }, x: 470 + i * 200, y: i % 2 ? 915 : 880, pose: 'stand', seat: null })),
    items,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s.v !== 1) return null;
    const base = initialState();
    s.f = { ...base.f, ...s.f };
    // 後から増えた物・人は初期位置で足す
    for (const i of base.items) if (!s.items.some((x) => x.id === i.id) && !s.eaten?.includes(i.id)) s.items.push(i);
    for (const c of base.chars) if (!s.chars.some((x) => x.id === c.id)) s.chars.push(c);
    return s;
  } catch (e) {
    return null;
  }
}

// 4人の絵（キャラクターファイル）。端末に読み込み済みならそれを、なければ同じ場所の pack.json を使う
const PACK_KEY = 'ouchi-pack';
async function loadPack() {
  try { const raw = localStorage.getItem(PACK_KEY); if (raw) return JSON.parse(raw); } catch (e) { /* なし */ }
  try { const r = await fetch('pack.json', { cache: 'no-cache' }); if (r.ok) return await r.json(); } catch (e) { /* なし */ }
  return null;
}
const pack = await loadPack();
if (pack) setPack(pack);

let state = load() || initialState();
applySprites();
// キャラクターファイルがあれば家族4人はその絵で、なければ自作の絵で描く
function applySprites() {
  for (const c of state.chars) {
    if (SPRITES[c.id]) c.look.sprite = c.id;
    else delete c.look.sprite;
    if (c.look.outfitImg && !OUTFIT_IMGS[c.look.outfitImg]) delete c.look.outfitImg;
  }
}
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const out = {
        v: 1, camX: state.camX, sel: state.sel, f: state.f, eaten: state.eaten || [],
        chars: state.chars.map(({ id, look, x, y, pose, seat }) => ({ id, look, x, y, pose: pose === 'drag' ? 'stand' : pose, seat })),
        items: state.items.map(({ id, type, x, y, cont, bites, heldBy, home }) => ({ id, type, x, y, cont, bites, heldBy, home })),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(out));
    } catch (e) { /* 保存できない環境でも遊べるようにする */ }
  }, 400);
}

// ---------- 画面 ----------
const svg = document.getElementById('world');
const L = {};
svg.innerHTML = `<defs>${PATTERN_DEFS}${ROOM_DEFS}${spriteDefs()}</defs><g id="bg"></g><g id="furn"></g><g id="ents"></g><g id="shade" pointer-events="none"></g><g id="fx" pointer-events="none"></g>`;
for (const k of ['bg', 'furn', 'ents', 'shade', 'fx']) L[k] = svg.querySelector('#' + k);
L.bg.innerHTML = backgroundSvg();

const charById = (id) => state.chars.find((c) => c.id === id);
const itemById = (id) => state.items.find((i) => i.id === id);
const furnById = (id) => FURNITURE.find((f) => f.id === id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// 見た目だけの一時的な状態（保存しない）
const anim = new Map(); // id -> { vy, ty, hop, squash, wob }
const A = (id) => { if (!anim.has(id)) anim.set(id, { vy: 0, ty: null, hop: 0, hopV: 0, squash: 0, wob: 0 }); return anim.get(id); };

function renderFurniture() {
  let s = '';
  for (const f of FURNITURE) s += `<g data-furn="${f.id}"${f.tap ? ` data-tap="${f.tap}"` : ''}>${f.draw(state.f)}</g>`;
  L.furn.innerHTML = s;
  L.shade.innerHTML = [0, 1].map((r) => `<rect x="${r * ROOM_W}" y="0" width="${ROOM_W}" height="${WORLD_H}" fill="#151a45" style="opacity:${roomShade(state.f, r)};transition:opacity .5s"/>`).join('');
}

function entGroup(key, kind, id) {
  let g = L.ents.querySelector(`[data-key="${key}"]`);
  if (!g) {
    g = document.createElementNS(NS, 'g');
    g.dataset.key = key;
    if (kind) { g.dataset.kind = kind; g.dataset.id = id; }
    L.ents.appendChild(g);
  }
  return g;
}

function charInner(c) {
  const pose = c.pose;
  let s = drawCharacter(c.look, c.id, { pose, expr: c.expr, closed: c.blink });
  const held = state.items.find((i) => i.heldBy === c.id);
  if (held) {
    const h = metrics(c.look, pose).hand;
    const dy = c.look.sprite ? 22 : 30;
    s += `<g data-kind="item" data-id="${held.id}" transform="translate(${h.x + 4},${h.y + dy})">${drawItem(held.type, held.id, held.bites)}</g>`;
    s += handOverlay(c.look, c.id, pose);
  }
  return s;
}

function placeChar(c) {
  const g = entGroup(c.id, 'char', c.id);
  const a = A(c.id);
  const sq = 1 - a.squash * 0.12;
  let t = `translate(${c.x},${c.y - a.hop})`;
  if (c.pose === 'lie') t += ' rotate(-90)';
  else if (c.pose === 'drag') t += ` rotate(${Math.sin(a.wob) * 6})`;
  t += ` scale(${2 - sq},${sq})`;
  g.setAttribute('transform', t);
}

function renderChar(c) {
  const g = entGroup(c.id, 'char', c.id);
  g.innerHTML = charInner(c);
  placeChar(c);
}

function itemVisible(i) {
  if (i.heldBy) return false;
  if (i.cont) {
    const f = furnById(i.cont);
    return !!state.f[f.container.open];
  }
  return true;
}

function placeItem(i) {
  const g = entGroup(i.id, 'item', i.id);
  const a = A(i.id);
  const sq = 1 - a.squash * 0.15;
  g.setAttribute('transform', `translate(${i.x},${i.y - a.hop}) rotate(${Math.sin(a.wob) * 8}) scale(${2 - sq},${sq})`);
}

function renderItem(i) {
  const key = i.id;
  if (!itemVisible(i)) {
    const g = L.ents.querySelector(`[data-key="${key}"]`);
    if (g) g.remove();
    return;
  }
  const g = entGroup(key, 'item', i.id);
  g.innerHTML = drawItem(i.type, i.id, i.bites);
  placeItem(i);
}

function renderFronts() {
  for (const f of FURNITURE) {
    if (!f.front) continue;
    const g = entGroup('fg-' + f.id);
    g.setAttribute('pointer-events', 'none');
    g.innerHTML = f.front.draw(state.f);
  }
}

const depthOf = (key) => {
  if (key.startsWith('fg-')) return furnById(key.slice(3)).front.depth;
  const c = charById(key);
  if (c) return c.y + (c.pose === 'lie' ? 0 : 0.5);
  const i = itemById(key);
  return i ? i.y + 0.2 : 0;
};
function sortEnts() {
  const gs = [...L.ents.children];
  const dragging = new Set([...drags.values()].filter((d) => d.active).map((d) => d.id));
  gs.sort((a, b) => {
    const da = dragging.has(a.dataset.key) ? 1e6 : depthOf(a.dataset.key);
    const db = dragging.has(b.dataset.key) ? 1e6 : depthOf(b.dataset.key);
    return da - db;
  });
  for (const g of gs) L.ents.appendChild(g);
}

function renderAll() {
  L.ents.innerHTML = '';
  renderFurniture();
  renderFronts();
  for (const c of state.chars) renderChar(c);
  for (const i of state.items) renderItem(i);
  sortEnts();
}

// ---------- カメラ ----------
let viewW = 1600;
function applyCam() {
  const r = svg.getBoundingClientRect();
  viewW = WORLD_H * (r.width / Math.max(1, r.height));
  if (viewW >= WORLD_W) state.camX = (WORLD_W - viewW) / 2;
  else state.camX = clamp(state.camX, 0, WORLD_W - viewW);
  svg.setAttribute('viewBox', `${state.camX} 0 ${viewW} ${WORLD_H}`);
}
window.addEventListener('resize', applyCam);

function toWorld(clientX, clientY) {
  const r = svg.getBoundingClientRect();
  const k = WORLD_H / r.height;
  return { x: state.camX + (clientX - r.left) * k, y: (clientY - r.top) * k, k };
}

// ---------- 小さな演出 ----------
const parts = [];
function spawn(x, y, kind, n = 1) {
  for (let k = 0; k < n; k++) {
    const el = document.createElementNS(NS, kind === 'note' ? 'text' : kind === 'heart' ? 'path' : 'circle');
    if (kind === 'crumb') { el.setAttribute('r', 5 + Math.random() * 4); el.setAttribute('fill', ['#e7a85b', '#f8e7c6', '#d9a066'][k % 3]); }
    if (kind === 'drop') { el.setAttribute('r', 7); el.setAttribute('fill', '#9ed8f8'); }
    if (kind === 'heart') { el.setAttribute('d', 'M 0,6 C -14,-6 -8,-16 0,-8 C 8,-16 14,-6 0,6 Z'); el.setAttribute('fill', '#f27b9b'); }
    if (kind === 'note') { el.textContent = '♪'; el.setAttribute('font-size', '44'); el.setAttribute('fill', '#7f6cc8'); el.setAttribute('font-weight', 'bold'); }
    if (kind === 'star') { el.setAttribute('r', 6); el.setAttribute('fill', '#ffe27a'); }
    L.fx.appendChild(el);
    const up = kind === 'note' || kind === 'heart' || kind === 'star';
    parts.push({ el, x, y, vx: (Math.random() - 0.5) * (up ? 3 : 7), vy: up ? -2 - Math.random() * 2 : -4 - Math.random() * 3, g: up ? -0.02 : 0.45, life: up ? 70 : 40, t: 0 });
  }
}

function hop(id, power = 9) { const a = A(id); a.hopV = power; a.hop = Math.max(a.hop, 0.1); }

let exprTimers = new Map();
function setExpr(c, expr, ms) {
  c.expr = expr;
  renderChar(c);
  clearTimeout(exprTimers.get(c.id));
  exprTimers.set(c.id, setTimeout(() => { c.expr = null; renderChar(c); }, ms));
}

// 人の体の位置（足元からの距離）を世界の座標にする。寝ているときは左に90度回っている
function toWorldOf(c, p) {
  return c.pose === 'lie' ? { x: c.x + p.y, y: c.y - p.x } : { x: c.x + p.x, y: c.y + p.y };
}

// ---------- 食べる・持つ ----------
function eat(c, i) {
  const old = state.items.find((x) => x.heldBy === c.id && x.id !== i.id);
  if (old) dropNear(old, c);
  i.bites++;
  i.cont = null;
  const drink = ITEMS[i.type].drink;
  (drink ? sfx.gulp : sfx.munch)();
  const mouth = toWorldOf(c, metrics(c.look, c.pose).mouth);
  if (!drink) spawn(mouth.x, mouth.y, 'crumb', 6);
  let k = 0;
  const chomp = () => {
    c.expr = k % 2 ? null : 'eat';
    renderChar(c);
    if (++k < 5) setTimeout(chomp, 120);
    else setExpr(c, 'grin', 700);
  };
  if (i.bites >= 3) {
    if (i.home) {
      Object.assign(i, { x: i.home.x, y: i.home.y, cont: i.home.cont, bites: 0, heldBy: null });
    } else {
      state.items = state.items.filter((x) => x !== i);
      state.eaten = [...(state.eaten || []), i.id];
      const g = L.ents.querySelector(`[data-key="${i.id}"]`);
      if (g) g.remove();
    }
    spawn(mouth.x, mouth.y - 40, 'heart', 3);
  } else {
    i.heldBy = c.id;
  }
  renderItem(i);
  chomp();
  save();
}

function hold(c, i) {
  const old = state.items.find((x) => x.heldBy === c.id && x.id !== i.id);
  if (old) dropNear(old, c);
  i.heldBy = c.id;
  i.cont = null;
  renderItem(i);
  renderChar(c);
  sfx.pick();
  save();
}

function dropNear(i, c) {
  i.heldBy = null;
  i.x = c.x + 90;
  i.y = c.pose === 'lie' ? c.y + 40 : c.y;
  landItem(i);
}

// ---------- 置き場所の判定 ----------
function surfaceBelow(x, y) {
  let best = null;
  for (const f of FURNITURE) for (const s of f.surfaces || []) {
    if (x >= s.x0 && x <= s.x1 && s.y >= y - 30 && (!best || s.y < best)) best = s.y;
  }
  return best;
}

function fallTo(id, ty) {
  const a = A(id);
  a.ty = ty;
  a.vy = 0;
}

function landChar(c) {
  const px = c.x, py = c.y;
  for (const f of FURNITURE) {
    const b = f.bed;
    if (b && px >= b.x0 - 40 && px <= b.x1 + 40 && py >= b.y - 160 && py <= b.y + 130) {
      c.pose = 'lie';
      c.x = clamp(px, b.headX - metrics(c.look, 'lie').head.y, b.x1 - 10);
      c.y = b.y - 30;
      c.seat = null;
      sfx.drop();
      return;
    }
  }
  for (const f of FURNITURE) {
    const s = f.seat;
    if (s && Math.abs(px - s.x) < 85 && py >= s.y - 80 && py <= s.y + 170 && !state.chars.some((o) => o !== c && o.seat === f.id)) {
      c.pose = 'sit';
      c.seat = f.id;
      c.x = s.x;
      c.y = s.y + metrics(c.look, 'sit').sitDy;
      sfx.drop();
      return;
    }
  }
  c.pose = 'stand';
  c.seat = null;
  c.x = clamp(px, 60, WORLD_W - 60);
  if (py >= FLOOR_MIN) { c.y = clamp(py, FLOOR_MIN, FLOOR_MAX); sfx.drop(); return; }
  const sy = surfaceBelow(px, py);
  fallTo(c.id, sy ?? FLOOR_DEFAULT);
}

function landItem(i) {
  const def = ITEMS[i.type];
  const cy = i.y - def.h / 2;
  // 人に渡す（食べ物を口に運ぶと食べる）
  const front = [...state.chars].sort((a, b) => b.y - a.y);
  for (const c of front) {
    if (drags.has('c:' + c.id)) continue;
    const head = toWorldOf(c, metrics(c.look, c.pose).head);
    const inHead = Math.hypot(i.x - head.x, cy - head.y) < 85;
    const inBody = c.pose === 'lie'
      ? (i.x > c.x - 150 && i.x < c.x + 10 && Math.abs(cy - c.y) < 70)
      : (Math.abs(i.x - c.x) < 80 && cy > c.y - 150 && cy < c.y - 20);
    if (inHead && def.food) { eat(c, i); return; }
    if (inHead || inBody) { hold(c, i); return; }
  }
  i.heldBy = null;
  i.cont = null;
  // 開いている入れ物にしまう
  for (const f of FURNITURE) {
    const ct = f.container;
    if (ct && state.f[ct.open] && i.x >= ct.x0 && i.x <= ct.x1 && cy >= ct.y0 && cy <= ct.y1) {
      i.cont = f.id;
      i.x = clamp(i.x, ct.x0 + def.w / 2, ct.x1 - def.w / 2);
      const shelf = ct.shelves.find((s) => s >= i.y - 25) ?? ct.shelves[ct.shelves.length - 1];
      fallTo(i.id, shelf);
      return;
    }
  }
  i.x = clamp(i.x, 40, WORLD_W - 40);
  if (i.y >= FLOOR_MIN) { i.y = clamp(i.y, FLOOR_MIN, FLOOR_MAX); sfx.drop(); return; }
  const sy = surfaceBelow(i.x, i.y);
  fallTo(i.id, sy ?? FLOOR_DEFAULT + 20);
}

// ---------- タップ ----------
function tapChar(c) {
  state.sel = c.id;
  const held = state.items.find((i) => i.heldBy === c.id);
  if (held && ITEMS[held.type].food) { eat(c, held); return; }
  if (c.pose !== 'lie') hop(c.id, 10);
  sfx.giggle();
  setExpr(c, Math.random() < 0.5 ? 'grin' : 'wow', 900);
  spawn(c.x, c.y - (c.pose === 'lie' ? 60 : 320), 'star', 4);
}

function tapItem(i) {
  const def = ITEMS[i.type];
  if (i.heldBy) { const c = charById(i.heldBy); if (c) tapChar(c); return; }
  switch (def.tap) {
    case 'meow': sfx.meow(); hop(i.id, 12); spawn(i.x, i.y - 100, 'heart', 2); break;
    case 'music':
      state.f.music = !state.f.music;
      setMusic(state.f.music);
      sfx.toggle();
      hop(i.id, 6);
      break;
    case 'ring': sfx.ring(); A(i.id).wob = 0; shake(i.id); break;
    default:
      if (i.type === 'ball') { sfx.boing(); hop(i.id, 22); } else if (i.type === 'teddy') { sfx.squeak(); hop(i.id, 8); } else { sfx.click(); hop(i.id, 6); }
  }
  save();
}

const shaking = new Map();
function shake(id) { shaking.set(id, 40); }

function tapFurniture(key) {
  if (key === 'tv') state.f.tv++;
  else state.f[key] = !state.f[key];
  if (key === 'night') sfx.done(); else sfx.toggle();
  if (key === 'faucet' && state.f.faucet) spawn(2093, 590, 'drop', 4);
  renderFurniture();
  for (const i of state.items) if (i.cont) renderItem(i);
  sortEnts();
  save();
}

// ---------- 指の操作 ----------
const drags = new Map(); // key -> drag info（複数の指で同時に動かせる）
const pointers = new Map(); // pointerId -> drag key
let pan = null;

svg.addEventListener('pointerdown', (ev) => {
  unlock();
  if (state.f.music) setMusic(true);
  const w = toWorld(ev.clientX, ev.clientY);
  const t = ev.target.closest('[data-kind]');
  svg.setPointerCapture(ev.pointerId);
  if (t) {
    const key = (t.dataset.kind === 'char' ? 'c:' : 'i:') + t.dataset.id;
    if (drags.has(key)) return;
    drags.set(key, { key, kind: t.dataset.kind, id: t.dataset.id, sx: ev.clientX, sy: ev.clientY, cx: ev.clientX, cy: ev.clientY, t0: performance.now(), active: false });
    pointers.set(ev.pointerId, key);
    return;
  }
  const tap = ev.target.closest('[data-tap]');
  pan = { id: ev.pointerId, sx: ev.clientX, cam: state.camX, last: ev.clientX, v: 0, tap: tap ? tap.dataset.tap : null, moved: false, k: w.k };
});

function startDrag(d) {
  d.active = true;
  if (d.kind === 'char') {
    const c = charById(d.id);
    c.pose = 'drag';
    c.seat = null;
    A(c.id).ty = null;
    state.sel = c.id;
    renderChar(c);
  } else {
    const i = itemById(d.id);
    if (i.heldBy) {
      const c = charById(i.heldBy);
      i.heldBy = null;
      renderChar(c);
    }
    A(i.id).ty = null;
    renderItem(i);
  }
  sfx.pick();
  sortEnts();
}

function moveDrag(d) {
  const w = toWorld(d.cx, d.cy);
  if (d.kind === 'char') {
    const c = charById(d.id);
    c.x = w.x; c.y = w.y + 170;
    A(c.id).wob += 0.25;
    placeChar(c);
  } else {
    const i = itemById(d.id);
    i.x = w.x; i.y = w.y + ITEMS[i.type].h / 2;
    placeItem(i);
  }
}

svg.addEventListener('pointermove', (ev) => {
  const key = pointers.get(ev.pointerId);
  if (key) {
    const d = drags.get(key);
    d.cx = ev.clientX; d.cy = ev.clientY;
    if (!d.active && Math.hypot(d.cx - d.sx, d.cy - d.sy) > MOVE_PX) startDrag(d);
    if (d.active) moveDrag(d);
    return;
  }
  if (pan && pan.id === ev.pointerId) {
    if (Math.abs(ev.clientX - pan.sx) > MOVE_PX) pan.moved = true;
    if (pan.moved) {
      pan.v = (ev.clientX - pan.last) * pan.k;
      state.camX = pan.cam - (ev.clientX - pan.sx) * pan.k;
      applyCam();
    }
    pan.last = ev.clientX;
  }
});

function endPointer(ev) {
  const key = pointers.get(ev.pointerId);
  if (key) {
    pointers.delete(ev.pointerId);
    const d = drags.get(key);
    drags.delete(key);
    if (!d.active) {
      if (d.kind === 'char') tapChar(charById(d.id));
      else tapItem(itemById(d.id));
      return;
    }
    if (d.kind === 'char') {
      const c = charById(d.id);
      landChar(c);
      renderChar(c);
    } else {
      const i = itemById(d.id);
      landItem(i);
      if (state.items.includes(i)) renderItem(i);
    }
    sortEnts();
    save();
    return;
  }
  if (pan && pan.id === ev.pointerId) {
    if (!pan.moved && pan.tap && ev.type === 'pointerup') tapFurniture(pan.tap);
    else inertia = -pan.v;
    pan = null;
    save();
  }
}
svg.addEventListener('pointerup', endPointer);
svg.addEventListener('pointercancel', endPointer);
let inertia = 0;

// ---------- 毎フレームの更新 ----------
let blinkAt = performance.now() + 2000;
let noteAt = 0;
function frame(now) {
  // 指を画面の端に持っていくと、となりの部屋へ動く
  let edgeMove = 0;
  const r = svg.getBoundingClientRect();
  for (const d of drags.values()) {
    if (!d.active) continue;
    if (d.cx < r.left + r.width * 0.07) edgeMove = -16;
    if (d.cx > r.right - r.width * 0.07) edgeMove = 16;
  }
  if (edgeMove) {
    state.camX += edgeMove;
    applyCam();
    for (const d of drags.values()) if (d.active) moveDrag(d);
  } else if (Math.abs(inertia) > 0.5 && !pan) {
    state.camX += inertia;
    inertia *= 0.92;
    applyCam();
  }

  for (const [id, a] of anim) {
    const c = charById(id);
    const i = c ? null : itemById(id);
    if (!c && !i) { anim.delete(id); continue; }
    const obj = c || i;
    let dirty = false;
    if (a.ty != null) {
      a.vy += 2.2;
      obj.y += a.vy;
      if (obj.y >= a.ty) {
        obj.y = a.ty; a.ty = null;
        a.squash = Math.min(1, a.vy / 30);
        a.vy = 0;
        sfx.land();
        sortEnts();
        save();
      }
      dirty = true;
    }
    if (a.hop > 0 || a.hopV) {
      a.hop += a.hopV;
      a.hopV -= 1.4;
      if (a.hop <= 0) { a.hop = 0; a.hopV = 0; a.squash = 0.6; }
      dirty = true;
    }
    if (a.squash > 0) { a.squash = Math.max(0, a.squash - 0.08); dirty = true; }
    const sh = shaking.get(id);
    if (sh) { a.wob += 1.2; shaking.set(id, sh - 1); if (sh <= 1) { shaking.delete(id); a.wob = 0; } dirty = true; }
    if (dirty) (c ? placeChar(c) : placeItem(i));
  }

  // まばたき
  if (now > blinkAt) {
    const cands = state.chars.filter((c) => c.pose !== 'lie' && !c.expr);
    const c = cands[Math.floor(Math.random() * cands.length)];
    if (c) { c.blink = true; renderChar(c); setTimeout(() => { c.blink = false; renderChar(c); }, 140); }
    blinkAt = now + 1200 + Math.random() * 2500;
  }
  // 音楽が鳴っている間は音符を出す
  if (state.f.music && now > noteAt) {
    const radio = itemById('radio');
    if (radio) {
      const holder = radio.heldBy ? charById(radio.heldBy) : null;
      const x = holder ? holder.x + 60 : radio.x, y = holder ? holder.y - 120 : radio.y - 80;
      spawn(x, y, 'note');
    }
    noteAt = now + 700;
  }
  if (state.f.faucet && Math.random() < 0.15) spawn(2093, 585, 'drop');

  for (let k = parts.length - 1; k >= 0; k--) {
    const p = parts[k];
    p.t++; p.vy += p.g; p.x += p.vx; p.y += p.vy;
    p.el.setAttribute('transform', `translate(${p.x},${p.y})`);
    p.el.setAttribute('opacity', String(Math.max(0, 1 - p.t / p.life)));
    if (p.t >= p.life) { p.el.remove(); parts.splice(k, 1); }
  }
  requestAnimationFrame(frame);
}

// ---------- ボタン ----------
document.getElementById('btn-dress').addEventListener('click', () => {
  unlock();
  sfx.click();
  openDress(state, (c) => { renderChar(c); save(); });
});

const gear = document.getElementById('settings');
document.getElementById('btn-gear').addEventListener('click', () => { unlock(); sfx.click(); gear.hidden = false; });
document.getElementById('settings-close').addEventListener('click', () => { gear.hidden = true; });
document.getElementById('btn-full').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.().catch(() => {});
});
// 「はじめから」は2秒長押し（うっかり消さないように）
const resetBtn = document.getElementById('btn-reset');
let resetTimer = null;
const startReset = (ev) => {
  ev.preventDefault();
  resetBtn.classList.add('holding');
  resetTimer = setTimeout(() => {
    resetBtn.classList.remove('holding');
    setMusic(false);
    state = initialState();
    applySprites();
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* なし */ }
    anim.clear();
    renderAll();
    applyCam();
    gear.hidden = true;
    sfx.done();
  }, 2000);
};
const stopReset = () => { clearTimeout(resetTimer); resetBtn.classList.remove('holding'); };
resetBtn.addEventListener('pointerdown', startReset);
resetBtn.addEventListener('pointerup', stopReset);
resetBtn.addEventListener('pointerleave', stopReset);

// キャラクターファイルの読み込み（端末ごとに1回だけ。端末の中に保存される）
document.getElementById('pack-file').addEventListener('change', async (ev) => {
  const f = ev.target.files[0];
  if (!f) return;
  try {
    const text = await f.text();
    const p = JSON.parse(text);
    if (p.v !== 1 || !p.chars) throw new Error('bad');
    localStorage.setItem(PACK_KEY, text);
    location.reload();
  } catch (e) {
    alert('このファイルは よみこめませんでした');
  }
});

// 切り抜きの絵の人は、キャラクターファイルに服が入っているときだけ着替えられる
document.getElementById('btn-dress').hidden = state.chars.every((c) => c.look.sprite) && !Object.keys(OUTFIT_IMGS).length;

initDress();
renderAll();
applyCam();
requestAnimationFrame(frame);

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// 自動テスト用（ブラウザの自動操作から中身を確かめる）
window.__game = { get state() { return state; }, toWorld, renderAll };
