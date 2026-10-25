// 部屋と家具。1部屋の幅 1600、高さ 1000。壁と床の境目は y=760
import { INK } from './characters.js';

export const ROOM_W = 1600;
export const WORLD_H = 1000;
export const WALL_Y = 760;
export const FLOOR_MIN = 790; // 床の上で物や人を置ける奥行きの範囲
export const FLOOR_MAX = 975;
export const FLOOR_DEFAULT = 890;

const SW = 4;
const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round" ${extra}/>`;
const R = (x, y, w, h, rx, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${INK}" stroke-width="${SW}" ${extra}/>`;
const C = (x, y, r, fill, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="${SW}" ${extra}/>`;

// ---------- 部屋の背景（変化しない） ----------
function bedroomBg() {
  const x0 = 0;
  let s = `<rect x="${x0}" y="0" width="${ROOM_W}" height="${WALL_Y}" fill="#f2dfe1"/>`;
  // 壁の飾り枠
  for (let i = 0; i < 6; i++) {
    const x = x0 + 40 + i * 260;
    s += `<rect x="${x}" y="80" width="220" height="300" rx="10" fill="none" stroke="#e5c9cd" stroke-width="5"/>`;
    s += `<rect x="${x}" y="440" width="220" height="250" rx="10" fill="none" stroke="#e5c9cd" stroke-width="5"/>`;
  }
  s += `<rect x="${x0}" y="${WALL_Y - 24}" width="${ROOM_W}" height="24" fill="#fbf3f3" stroke="#e5c9cd" stroke-width="3"/>`;
  s += `<rect x="${x0}" y="${WALL_Y}" width="${ROOM_W}" height="${WORLD_H - WALL_Y}" fill="#ebe3ea"/>`;
  for (let i = 0; i < 12; i++) s += `<path d="M ${x0 + i * 140 + 30},${WALL_Y + 70 + (i % 3) * 60} q 10,-6 20,0" stroke="#d9cfd8" stroke-width="4" fill="none"/>`;
  // ラグ
  s += `<ellipse cx="760" cy="880" rx="320" ry="78" fill="#dcd6de" stroke="#c4bcc8" stroke-width="6"/>`;
  s += `<ellipse cx="760" cy="880" rx="270" ry="58" fill="none" stroke="#ebe6ee" stroke-width="10" stroke-dasharray="30 18"/>`;
  return s;
}

function kitchenBg() {
  const x0 = ROOM_W;
  let s = `<rect x="${x0}" y="0" width="${ROOM_W}" height="${WALL_Y}" fill="#dcefe6"/>`;
  // タイルの腰壁
  s += `<rect x="${x0}" y="420" width="${ROOM_W}" height="${WALL_Y - 420}" fill="#f7fbf8"/>`;
  for (let y = 420; y < WALL_Y; y += 50) s += `<path d="M ${x0},${y} L ${x0 + ROOM_W},${y}" stroke="#d3e6dc" stroke-width="3"/>`;
  for (let x = x0; x < x0 + ROOM_W; x += 50) s += `<path d="M ${x},420 L ${x},${WALL_Y}" stroke="#d3e6dc" stroke-width="3"/>`;
  s += `<rect x="${x0}" y="${WALL_Y - 20}" width="${ROOM_W}" height="20" fill="#bfe0cf"/>`;
  // 木の床
  s += `<rect x="${x0}" y="${WALL_Y}" width="${ROOM_W}" height="${WORLD_H - WALL_Y}" fill="#e8cfa6"/>`;
  for (let y = WALL_Y + 40; y < WORLD_H; y += 46) s += `<path d="M ${x0},${y} L ${x0 + ROOM_W},${y}" stroke="#d8b98a" stroke-width="3"/>`;
  for (let i = 0; i < 16; i++) s += `<path d="M ${x0 + i * 107 + (i % 2) * 50},${WALL_Y + 40 + (i % 5) * 46} l 0,46" stroke="#d8b98a" stroke-width="3"/>`;
  // 上の戸棚
  s += R(1920, 150, 500, 190, 10, '#f6f0e4');
  s += `<path d="M 2045,150 L 2045,340 M 2170,150 L 2170,340 M 2295,150 L 2295,340" stroke="${INK}" stroke-width="4"/>`;
  for (const x of [2025, 2065, 2150, 2190, 2275, 2315]) s += `<rect x="${x - 5}" y="300" width="10" height="24" rx="5" fill="#d9a85b"/>`;
  return s;
}

// 部屋の入り口の柱（寝室と台所の境目）
function divider() {
  return R(ROOM_W - 18, 0, 36, WALL_Y, 4, '#f4eee6');
}

export function backgroundSvg() {
  return bedroomBg() + kitchenBg() + divider();
}

// ---------- 家具（タップで動く・物を置ける） ----------
// f はゲームの家具の状態（open など）。tap: タップで切り替わる状態の名前
export const FURNITURE = [
  {
    id: 'wardrobe', room: 0, tap: 'wardrobe',
    container: { open: 'wardrobe', x0: 110, x1: 450, y0: 200, y1: 750, shelves: [470, 742] },
    draw: (f) => {
      let s = P('M 90,760 L 90,260 C 90,120 470,120 470,260 L 470,760 Z', '#f7f2ee');
      if (f.wardrobe) {
        s += P('M 110,742 L 110,262 C 110,150 450,150 450,262 L 450,742 Z', '#d9c7c2');
        s += `<path d="M 130,250 L 430,250" stroke="#b08a5a" stroke-width="8" stroke-linecap="round"/>`;
        const cols = ['#2a262c', '#5d5450', '#f4a6c0', '#f6cf5f', '#a9cdf0'];
        cols.forEach((c, i) => {
          const x = 160 + i * 58;
          s += `<path d="M ${x},250 l 0,14" stroke="#b08a5a" stroke-width="4"/>`;
          s += P(`M ${x - 26},270 L ${x + 26},270 L ${x + 30},${380 + (i % 2) * 30} L ${x - 30},${380 + (i % 2) * 30} Z`, c);
        });
        s += P('M 110,470 L 450,470 L 450,486 L 110,486 Z', '#efe4dc');
        // 開いた扉
        s += P('M 90,262 L 40,230 L 40,780 L 90,760 Z', '#f7f2ee') + P('M 470,262 L 520,230 L 520,780 L 470,760 Z', '#f7f2ee');
      } else {
        s += P('M 110,742 L 110,262 C 110,150 278,150 278,190 L 278,742 Z', '#fbf8f5') + P('M 282,742 L 282,190 C 282,150 450,150 450,262 L 450,742 Z', '#fbf8f5');
        s += `<rect x="252" y="400" width="12" height="90" rx="6" fill="#d9a85b"/><rect x="296" y="400" width="12" height="90" rx="6" fill="#d9a85b"/>`;
      }
      return s;
    },
  },
  {
    id: 'window1', room: 0, tap: 'night',
    draw: (f) => {
      let s = R(560, 150, 300, 320, 14, '#fbf8f5');
      s += `<rect x="580" y="170" width="260" height="280" rx="6" fill="${f.night ? '#2c3566' : '#bfe3f8'}" stroke="${INK}" stroke-width="4"/>`;
      if (f.night) {
        s += C(780, 230, 26, '#fff3c0') + `<circle cx="792" cy="222" r="22" fill="#2c3566"/>`;
        for (const [x, y] of [[620, 210], [660, 300], [720, 190], [760, 360], [640, 400], [810, 330]]) s += `<path d="M ${x},${y - 6} l 2,4 4,2 -4,2 -2,4 -2,-4 -4,-2 4,-2 z" fill="#fff6c8"/>`;
      } else {
        s += C(790, 220, 26, '#ffd85a');
        s += P('M 610,330 q 0,-30 30,-26 q 10,-26 40,-14 q 30,-6 30,24 q 16,2 14,16 l -110,0 q -14,0 -4,0 z', '#ffffff', 'stroke-width="3"');
      }
      s += `<path d="M 710,170 L 710,450 M 580,310 L 840,310" stroke="#fbf8f5" stroke-width="12"/>`;
      s += P('M 540,140 Q 600,300 560,480 L 600,480 Q 640,300 600,140 Z', '#f5b3c4') + P('M 880,140 Q 820,300 860,480 L 820,480 Q 780,300 820,140 Z', '#f5b3c4');
      s += `<path d="M 520,140 L 900,140" stroke="#b08a5a" stroke-width="10" stroke-linecap="round"/>`;
      return s;
    },
  },
  {
    id: 'dresser', room: 0, tap: 'drawer',
    surfaces: [{ x0: 565, x1: 855, y: 590 }],
    container: { open: 'drawer', x0: 575, x1: 845, y0: 600, y1: 700, shelves: [690] },
    draw: (f) => {
      let s = R(560, 590, 300, 170, 10, '#f6f0e4');
      s += P('M 556,584 L 864,584 L 864,600 L 556,600 Z', '#efe2cf');
      s += R(578, 690, 264, 54, 6, '#fbf8f5') + `<rect x="680" y="710" width="60" height="12" rx="6" fill="#d9a85b"/>`;
      if (f.drawer) {
        s += P('M 566,606 L 854,606 L 870,700 L 550,700 Z', '#d9c7c2');
        s += R(550, 690, 320, 64, 6, '#fbf8f5') + `<rect x="680" y="712" width="60" height="12" rx="6" fill="#d9a85b"/>`;
      } else {
        s += R(578, 616, 264, 60, 6, '#fbf8f5') + `<rect x="680" y="640" width="60" height="12" rx="6" fill="#d9a85b"/>`;
      }
      return s;
    },
  },
  {
    id: 'lamp', room: 0, tap: 'lamp0',
    draw: (f) => {
      let s = '';
      if (f.lamp0) s += `<ellipse cx="955" cy="440" rx="120" ry="140" fill="#fff3b0" opacity="0.45"/>`;
      s += `<path d="M 955,470 L 955,750" stroke="${INK}" stroke-width="12"/><path d="M 955,470 L 955,750" stroke="#c9a46a" stroke-width="6"/>`;
      s += P('M 915,760 C 915,740 995,740 995,760 Z', '#c9a46a');
      s += P('M 905,470 L 1005,470 L 980,370 L 930,370 Z', f.lamp0 ? '#fff0a8' : '#f6e6d6');
      return s;
    },
  },
  {
    // 壁の棚（物を置ける）
    id: 'shelf', room: 0,
    surfaces: [{ x0: 1125, x1: 1415, y: 380 }],
    draw: () => P('M 1120,380 L 1420,380 L 1420,398 L 1120,398 Z', '#e9c9a0') + P('M 1150,398 l 0,30 l 20,-30 z M 1390,398 l 0,30 l -20,-30 z', '#e9c9a0'),
  },
  {
    id: 'bed', room: 0,
    surfaces: [{ x0: 1040, x1: 1500, y: 690 }],
    bed: { x0: 1030, x1: 1510, y: 700, headX: 1110 },
    draw: () => {
      let s = P('M 1010,780 L 1010,520 C 1010,490 1060,490 1060,520 L 1060,780 Z', '#f0b8c6');
      s += P('M 1030,690 L 1510,690 L 1510,770 L 1030,770 Z', '#ffffff');
      s += P('M 1040,770 L 1040,800 M 1500,770 L 1500,800', 'none');
      s += `<rect x="1036" y="770" width="16" height="36" rx="4" fill="#c9a46a" stroke="${INK}" stroke-width="4"/><rect x="1490" y="770" width="16" height="36" rx="4" fill="#c9a46a" stroke="${INK}" stroke-width="4"/>`;
      s += P('M 1066,690 C 1060,656 1170,650 1176,684 C 1180,700 1068,704 1066,690 Z', '#f8d9a8');
      s += `<path d="M 1090,676 l 70,4 M 1100,666 l 60,6" stroke="#e8b878" stroke-width="3"/>`;
      return s;
    },
    // 布団は人より手前に描く（寝ている人にかける）
    front: { depth: 760, draw: () => P('M 1180,700 C 1300,686 1420,686 1514,700 L 1514,772 L 1176,772 C 1170,740 1172,716 1180,700 Z', 'url(#quilt)') },
  },
  // ---------- 台所 ----------
  {
    id: 'fridge', room: 1, tap: 'fridge',
    surfaces: [{ x0: 1690, x1: 1890, y: 240 }],
    container: { open: 'fridge', x0: 1700, x1: 1880, y0: 270, y1: 770, shelves: [410, 590, 760] },
    draw: (f) => {
      let s = R(1680, 240, 220, 540, 22, '#f2f4f6');
      if (f.fridge) {
        s += R(1696, 256, 188, 508, 12, '#e3f2fb');
        s += `<rect x="1696" y="256" width="188" height="40" rx="12" fill="#fffbe0" opacity=".9"/>`;
        s += P('M 1700,410 L 1880,410 L 1880,422 L 1700,422 Z', '#cfe8f5') + P('M 1700,590 L 1880,590 L 1880,602 L 1700,602 Z', '#cfe8f5');
        s += P('M 1900,250 L 1990,220 L 1990,800 L 1900,772 Z', '#f2f4f6');
        s += `<rect x="1966" y="380" width="12" height="120" rx="6" fill="#b8c4cc"/>`;
      } else {
        s += `<path d="M 1680,430 L 1900,430" stroke="${INK}" stroke-width="4"/>`;
        s += `<rect x="1864" y="300" width="12" height="90" rx="6" fill="#b8c4cc"/><rect x="1864" y="470" width="12" height="140" rx="6" fill="#b8c4cc"/>`;
        s += C(1730, 300, 12, '#f59ac0') + C(1760, 330, 10, '#7cc06a');
      }
      return s;
    },
  },
  {
    id: 'counter', room: 1,
    surfaces: [{ x0: 1925, x1: 2415, y: 590 }],
    draw: () => {
      let s = R(1920, 590, 500, 190, 6, '#f6f0e4');
      s += P('M 1910,576 L 2430,576 L 2430,596 L 1910,596 Z', '#c9d6dd');
      s += `<path d="M 2045,610 L 2045,770 M 2170,610 L 2170,770 M 2295,610 L 2295,770" stroke="${INK}" stroke-width="4"/>`;
      for (const x of [2025, 2065, 2150, 2190, 2275, 2315]) s += `<rect x="${x - 5}" y="626" width="10" height="24" rx="5" fill="#d9a85b"/>`;
      return s;
    },
  },
  {
    id: 'sink', room: 1, tap: 'faucet',
    draw: (f) => {
      let s = P('M 1990,580 L 2140,580 L 2130,600 L 2000,600 Z', '#b8c4cc');
      s += P('M 2058,580 L 2058,520 Q 2058,500 2080,500 L 2100,500 L 2100,516 L 2080,516 Q 2074,516 2074,522 L 2074,580 Z', '#c9d6dd');
      s += C(2040, 560, 9, '#ef8f8f') + C(2110, 560, 9, '#7ab6e8');
      if (f.faucet) s += `<rect x="2088" y="516" width="10" height="66" rx="5" fill="#9ed8f8" opacity="0.9"><animate attributeName="opacity" values="0.6;1;0.6" dur="0.4s" repeatCount="indefinite"/></rect>`;
      return s;
    },
  },
  {
    id: 'stove', room: 1, tap: 'stove',
    draw: (f) => {
      let s = P('M 2210,568 L 2400,568 L 2400,580 L 2210,580 Z', '#4a4650');
      for (const x of [2255, 2355]) {
        s += `<ellipse cx="${x}" cy="568" rx="36" ry="7" fill="#2f2c33"/>`;
        if (f.stove) s += `<path d="M ${x - 24},566 q 6,-26 12,-8 q 6,-26 12,-2 q 6,-24 12,-6 q 6,-22 12,0 z" fill="#ff8a3d" opacity="0.9"><animate attributeName="opacity" values="0.6;1;0.7" dur="0.3s" repeatCount="indefinite"/></path>`;
      }
      s += R(2220, 640, 170, 110, 8, '#3d3a44') + `<rect x="2236" y="656" width="138" height="78" rx="6" fill="${f.stove ? '#ff9a5a' : '#5a5662'}" opacity=".7"/>`;
      for (const x of [2245, 2305, 2365]) s += C(x, 620, 8, '#e8e2da');
      return s;
    },
  },
  {
    id: 'tv', room: 1, tap: 'tv',
    draw: (f) => `<g transform="translate(-180,0)">${tvSvg(f)}</g>`,
  },
  {
    id: 'table', room: 1,
    surfaces: [{ x0: 2590, x1: 2990, y: 690 }],
    draw: () => {
      let s = '';
      s += `<rect x="2610" y="700" width="18" height="140" rx="6" fill="#c9a46a" stroke="${INK}" stroke-width="4"/><rect x="2952" y="700" width="18" height="140" rx="6" fill="#c9a46a" stroke="${INK}" stroke-width="4"/>`;
      s += P('M 2580,690 L 3000,690 L 3000,712 L 2580,712 Z', '#dfb57a');
      s += P('M 2620,694 L 2960,694 L 2940,760 L 2640,760 Z', '#fbf3f3', 'opacity="0"');
      return s;
    },
  },
  {
    id: 'chair1', room: 1,
    seat: { x: 2500, y: 724 },
    surfaces: [{ x0: 2450, x1: 2550, y: 718 }],
    draw: () => chair(2500),
  },
  {
    id: 'chair2', room: 1,
    seat: { x: 3080, y: 724 },
    surfaces: [{ x0: 3030, x1: 3130, y: 718 }],
    draw: () => chair(3080),
  },
  {
    id: 'light', room: 1, tap: 'lamp1',
    draw: (f) => {
      let s = `<path d="M 2790,0 L 2790,520" stroke="${INK}" stroke-width="4"/>`;
      if (f.lamp1) s += `<path d="M 2740,560 L 2600,690 L 2980,690 L 2840,560 Z" fill="#fff3b0" opacity="0.35"/>`;
      s += P('M 2730,560 C 2730,500 2850,500 2850,560 Z', '#f8b26a');
      s += `<ellipse cx="2790" cy="562" rx="22" ry="8" fill="${f.lamp1 ? '#fff6c8' : '#e8e2da'}"/>`;
      return s;
    },
  },
  {
    id: 'window2', room: 1, tap: 'night',
    draw: (f) => {
      let s = R(3020, 170, 150, 220, 12, '#fbf8f5');
      s += `<rect x="3036" y="186" width="118" height="188" rx="6" fill="${f.night ? '#2c3566' : '#bfe3f8'}" stroke="${INK}" stroke-width="4"/>`;
      s += f.night ? C(3110, 230, 16, '#fff3c0') : C(3110, 230, 16, '#ffd85a');
      s += `<path d="M 3095,186 L 3095,374" stroke="#fbf8f5" stroke-width="10"/>`;
      return s;
    },
  },
];

// テレビ（タップでチャンネルが変わる）
function tvSvg(f) {
  let s = R(2600, 210, 360, 220, 16, '#3a3a46');
  const ch = f.tv % 5;
  const scr = ['#20232b', '#7ec8f0', '#ffcf6a', '#9ad88f', '#f5a3c7'][ch];
  s += `<rect x="2618" y="228" width="324" height="184" rx="8" fill="${scr}"/>`;
  if (ch === 1) s += `<g><path d="M 2700,330 q 30,-30 60,0 q -30,30 -60,0 z M 2700,330 l -20,-16 l 0,32 z" fill="#f59a5a"><animateTransform attributeName="transform" type="translate" values="0 0;140 -10;0 0" dur="5s" repeatCount="indefinite"/></path><circle cx="2860" cy="270" r="8" fill="#fff" opacity=".7"/><circle cx="2880" cy="300" r="5" fill="#fff" opacity=".7"/></g>`;
  if (ch === 2) s += `<path d="M 2780,250 l 18,40 44,4 -34,28 10,44 -38,-24 -38,24 10,-44 -34,-28 44,-4 z" fill="#fff6c8" stroke="${INK}" stroke-width="4"><animateTransform attributeName="transform" type="rotate" values="0 2780 320;360 2780 320" dur="6s" repeatCount="indefinite"/></path>`;
  if (ch === 3) s += `<path d="M 2618,380 Q 2700,330 2780,370 T 2942,350 L 2942,412 L 2618,412 Z" fill="#6cbf6a"/><circle cx="2700" cy="290" r="26" fill="#fff" opacity=".9"><animate attributeName="cx" values="2640;2920;2640" dur="8s" repeatCount="indefinite"/></circle>`;
  if (ch === 4) for (let i = 0; i < 6; i++) s += `<circle cx="${2650 + i * 52}" cy="320" r="18" fill="${['#ef6f6f', '#f8d34a', '#7cc06a', '#5fa8e8', '#9b7fd8', '#ffffff'][i]}"><animate attributeName="cy" values="320;270;320" dur="0.8s" begin="${i * 0.12}s" repeatCount="indefinite"/></circle>`;
  s += `<path d="M 2740,430 L 2720,470 M 2820,430 L 2840,470" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  return s;
}

function chair(x) {
  let s = R(x - 40, 560, 80, 170, 14, '#f59a7a');
  s += P(`M ${x - 54},718 L ${x + 54},718 L ${x + 54},736 L ${x - 54},736 Z`, '#f8b89a');
  s += `<rect x="${x - 46}" y="736" width="14" height="90" rx="5" fill="#c9a46a" stroke="${INK}" stroke-width="4"/><rect x="${x + 32}" y="736" width="14" height="90" rx="5" fill="#c9a46a" stroke="${INK}" stroke-width="4"/>`;
  return s;
}

export const ROOM_DEFS = `
<pattern id="quilt" width="44" height="44" patternUnits="userSpaceOnUse">
  <rect width="44" height="44" fill="#c9dcf4"/>
  <rect x="0" y="0" width="22" height="22" fill="#e9e1f7"/>
  <rect x="22" y="22" width="22" height="22" fill="#e1f2e4"/>
  <path d="M 0,11 L 44,11 M 11,0 L 11,44" stroke="#f6c8d8" stroke-width="3"/>
</pattern>`;

// 部屋ごとの明るさ（夜で電気が消えていると暗い）
export function roomShade(f, room) {
  const lit = room === 0 ? f.lamp0 : f.lamp1;
  if (f.night) return lit ? 0.12 : 0.48;
  return lit ? 0 : 0.12;
}
