// 物の絵。足元の中央が (0,0)。food は口に運ぶと食べられる（3口でなくなる）
import { INK } from './characters.js';

const SW = 4;
const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
const C = (x, y, r, fill, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="${SW}" ${extra}/>`;
const R = (x, y, w, h, rx, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${INK}" stroke-width="${SW}" ${extra}/>`;

export const ITEMS = {
  apple: { food: true, w: 64, h: 74, draw: () => P('M 0,-60 C -40,-76 -40,-6 -10,-2 C -4,0 4,0 10,-2 C 40,-6 40,-76 0,-60 Z', '#e8484f') + P('M 0,-60 q 2,-12 8,-16', 'none') + P('M 4,-66 q 14,-14 24,-4 q -10,10 -24,4 z', '#7cc06a') + '<path d="M -18,-48 q -6,10 -4,20" stroke="#fff" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/>' },
  banana: { food: true, w: 90, h: 50, draw: () => P('M -44,-34 C -30,-4 26,-2 44,-30 C 42,-36 38,-38 34,-34 C 16,-16 -18,-14 -34,-40 Z', '#f6d45a') + P('M -44,-34 l -4,-6 l 8,-2 z', '#7a5a2a') },
  cake: { food: true, w: 80, h: 70, draw: () => P('M -38,-4 L 38,-4 L 38,-40 L -38,-56 Z', '#f8e7c6') + P('M -38,-56 L 38,-40 L 38,-32 L -38,-46 Z', '#ffffff') + '<path d="M -38,-26 L 38,-18" stroke="#f08aa5" stroke-width="6"/>' + C(-8, -62, 10, '#e8484f') },
  onigiri: { food: true, w: 72, h: 66, draw: () => P('M 0,-62 C 14,-62 40,-20 34,-6 C 30,0 -30,0 -34,-6 C -40,-20 -14,-62 0,-62 Z', '#ffffff') + P('M -18,-2 L -18,-24 L 18,-24 L 18,-2 Z', '#2e3b33') },
  donut: { food: true, w: 74, h: 50, draw: () => `<ellipse cx="0" cy="-24" rx="36" ry="22" fill="#d9a066" stroke="${INK}" stroke-width="${SW}"/>` + P('M -32,-28 C -30,-48 30,-48 32,-28 C 26,-20 18,-26 12,-20 C 4,-14 -6,-24 -14,-18 C -22,-14 -28,-22 -32,-28 Z', '#f59ac0') + `<ellipse cx="0" cy="-30" rx="10" ry="6" fill="#fff4e8" stroke="${INK}" stroke-width="3"/>` + '<path d="M -20,-36 l 4,-3 M 14,-38 l 5,2 M 4,-42 l 2,4 M -10,-24 l 4,2" stroke="#7fc8e8" stroke-width="3" stroke-linecap="round"/>' },
  icecream: { food: true, w: 54, h: 96, draw: () => P('M -18,-46 L 18,-46 L 0,0 Z', '#e7b36c') + '<path d="M -10,-36 L 6,-20 M 10,-36 L -6,-20" stroke="#c48b45" stroke-width="2.5"/>' + C(0, -62, 22, '#f8c8d8') + C(-6, -82, 16, '#fff3d6') },
  bread: { food: true, w: 76, h: 70, draw: () => P('M -32,-2 L 32,-2 L 32,-44 C 44,-50 40,-70 20,-68 C 10,-74 -10,-74 -20,-68 C -40,-70 -44,-50 -32,-44 Z', '#e7a85b') + P('M -24,-8 L 24,-8 L 24,-44 C 32,-50 26,-62 14,-60 C 6,-64 -6,-64 -14,-60 C -26,-62 -32,-50 -24,-44 Z', '#fbe3b4', 'stroke-width="0"') },
  milk: { food: true, drink: true, w: 52, h: 96, draw: () => P('M -22,-2 L 22,-2 L 22,-66 L 0,-86 L -22,-66 Z', '#ffffff') + P('M -22,-66 L 0,-86 L 22,-66 Z', '#7ab6e8') + R(-14, -50, 28, 24, 5, '#7ab6e8', 'stroke-width="0"') + C(0, -38, 6, '#ffffff', 'stroke-width="0"') },
  juice: { food: true, drink: true, w: 50, h: 90, draw: () => '<path d="M 6,-74 l 12,-22" stroke="#ef6f6f" stroke-width="7" stroke-linecap="round"/>' + P('M -22,-74 L 22,-74 L 18,-2 L -18,-2 Z', '#e9f6ff') + P('M -20,-58 L 20,-58 L 18,-6 L -18,-6 Z', '#f8a93c', 'stroke-width="0"') + C(14, -74, 8, '#f8d34a') },
  teddy: { w: 80, h: 92, draw: () => C(-24, -78, 12, '#c58d5a') + C(24, -78, 12, '#c58d5a') + P('M -30,-4 C -40,-30 -26,-46 0,-46 C 26,-46 40,-30 30,-4 Z', '#c58d5a') + C(0, -62, 28, '#c58d5a') + `<ellipse cx="0" cy="-54" rx="12" ry="9" fill="#f0d2b0"/><circle cx="-10" cy="-68" r="4" fill="${INK}"/><circle cx="10" cy="-68" r="4" fill="${INK}"/><circle cx="0" cy="-57" r="4" fill="${INK}"/>` + C(-30, -30, 9, '#c58d5a') + C(30, -30, 9, '#c58d5a') + '<path d="M -10,-44 l 10,8 l 10,-8 l 0,10 l -10,-6 l -10,6 z" fill="#e85d75"/>' },
  ball: { w: 70, h: 70, draw: () => C(0, -34, 32, '#ffffff') + `<path d="M -32,-34 A 32,32 0 0 1 0,-66 L 0,-34 Z" fill="#ef6f6f"/><path d="M 32,-34 A 32,32 0 0 1 0,-2 L 0,-34 Z" fill="#5fa8e8"/><path d="M 0,-66 A 32,32 0 0 1 32,-34 L 0,-34 Z" fill="#f8d34a"/>` + C(0, -34, 32, 'none') + C(0, -34, 8, '#ffffff') },
  book: { w: 70, h: 80, draw: () => R(-30, -78, 60, 76, 6, '#7f6cc8') + R(-22, -70, 44, 22, 3, '#fff1c8') + '<path d="M -30,-12 L 30,-12" stroke="#5a4a9a" stroke-width="4"/>' + '<path d="M -10,-62 l 20,0 M -10,-54 l 14,0" stroke="#7f6cc8" stroke-width="3"/>' },
  phone: { w: 44, h: 80, tap: 'ring', draw: () => R(-20, -78, 40, 76, 8, '#3a3a46') + R(-14, -70, 28, 54, 3, '#8fd3f5', 'stroke-width="2"') + '<circle cx="0" cy="-10" r="3" fill="#ccc"/>' + '<path d="M -6,-50 l 12,0 M -6,-42 l 8,0" stroke="#fff" stroke-width="3"/>' },
  vase: { w: 70, h: 120, draw: () => '<path d="M -4,-60 C -14,-80 -18,-96 -20,-104 M 4,-60 C 10,-80 20,-92 22,-100 M 0,-60 L 0,-110" stroke="#5aa364" stroke-width="5" fill="none"/>' + C(-20, -106, 11, '#f59ac0') + C(22, -102, 11, '#f8d34a') + C(0, -114, 12, '#ef6f6f') + P('M -20,-2 C -32,-30 -18,-50 -12,-62 L 12,-62 C 18,-50 32,-30 20,-2 Z', '#7ac0c8') },
  pan: { w: 120, h: 40, draw: () => P('M 30,-16 L 76,-22 L 76,-14 L 30,-8 Z', '#4a3a42') + P('M -42,-24 L 42,-24 C 40,-2 -40,-2 -42,-24 Z', '#5c5f66') + `<ellipse cx="0" cy="-24" rx="42" ry="8" fill="#6f727a" stroke="${INK}" stroke-width="${SW}"/>` },
  mug: { w: 64, h: 64, draw: () => P('M 22,-46 C 40,-46 40,-18 22,-18', 'none') + P('M -24,-58 L 24,-58 L 22,-4 C 22,-2 -22,-2 -22,-4 Z', '#f8d34a') + '<path d="M -12,-68 q -6,-8 0,-14 M 4,-70 q -6,-8 0,-14" stroke="#c9c3c0" stroke-width="3" fill="none" stroke-linecap="round"/>' },
  radio: { w: 100, h: 74, tap: 'music', draw: () => '<path d="M 26,-64 L 40,-90" stroke="#4a3a42" stroke-width="4"/>' + R(-46, -64, 92, 62, 12, '#ef8f6f') + C(-18, -32, 18, '#f6e6d6') + C(-18, -32, 6, '#4a3a42') + R(8, -50, 28, 12, 3, '#f6e6d6') + C(14, -20, 5, '#f8d34a') + C(30, -20, 5, '#7ab6e8') },
  cat: { w: 100, h: 90, tap: 'meow', draw: () => '<path d="M 38,-14 C 70,-14 64,-56 50,-58" fill="none" stroke="#4a3a42" stroke-width="18" stroke-linecap="round"/><path d="M 38,-14 C 70,-14 64,-56 50,-58" fill="none" stroke="#f2a65a" stroke-width="10" stroke-linecap="round"/>' + P('M -34,-2 C -44,-34 -24,-52 4,-52 C 34,-52 46,-30 38,-2 Z', '#f2a65a') + P('M -46,-60 L -42,-88 L -24,-72 Z', '#f2a65a') + P('M 4,-72 L 8,-92 L -14,-80 Z', '#f2a65a') + C(-20, -62, 30, '#f2a65a') + `<circle cx="-32" cy="-64" r="4" fill="${INK}"/><circle cx="-10" cy="-64" r="4" fill="${INK}"/><path d="M -25,-54 q 4,4 8,0" stroke="${INK}" stroke-width="3" fill="none"/>` + '<path d="M -6,-82 l 4,10 M 4,-80 l -2,10 M -40,-54 l -14,-2 M -40,-50 l -14,4 M 0,-54 l 14,-2 M 0,-50 l 14,4" stroke="#c97a3a" stroke-width="3" stroke-linecap="round"/>' },
  toothbrush: { w: 30, h: 110, draw: () => R(-7, -100, 14, 98, 6, '#5fc0a8') + R(-9, -112, 18, 22, 4, '#ffffff') + '<path d="M -6,-106 l 0,12 M 0,-106 l 0,12 M 6,-106 l 0,12" stroke="#7ab6e8" stroke-width="3"/>' },
};

/** 物を1つ描く。bites は食べた口数（0〜2） */
export function drawItem(type, id, bites = 0) {
  const it = ITEMS[type];
  if (!it) return '';
  const art = it.draw();
  if (!bites) return art;
  if (it.drink) {
    // 飲み物は中身の量で見せる（上から減る）
    const cut = -it.h + (it.h * 0.75) * (bites / 3) + it.h * 0.2;
    return `<defs><clipPath id="dk-${id}"><rect x="-80" y="${cut}" width="160" height="200"/></clipPath></defs>` +
      `<g opacity="0.55">${art}</g><g clip-path="url(#dk-${id})">${art}</g>`;
  }
  // かじった跡（右上から丸く欠ける）
  const spots = [[0.32, -0.86], [-0.05, -1.0], [0.42, -0.5]];
  let holes = '';
  for (let i = 0; i < bites; i++) {
    const [fx, fy] = spots[i];
    holes += `<circle cx="${fx * it.w}" cy="${fy * it.h}" r="${it.w * 0.26}" fill="#000"/>`;
  }
  return `<defs><mask id="bm-${id}" maskUnits="userSpaceOnUse" x="-150" y="-200" width="300" height="250"><rect x="-150" y="-200" width="300" height="250" fill="#fff"/>${holes}</mask></defs><g mask="url(#bm-${id})">${art}</g>`;
}
