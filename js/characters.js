// 人の絵。すべて図形から描く
// 座標は足元の中央が (0,0)、上がマイナス。立った高さはおよそ 330。

export const INK = '#4a3a42';
const SW = 4; // 線の太さ

export const SKINS = ['#f6e0cf', '#f0d6c3', '#ecd2bb', '#e8cc9f', '#d9a57c', '#a8714f'];
export const HAIR_COLORS = ['#1d2229', '#3b2c41', '#5a3b2a', '#a8703f', '#e8c46a', '#e98bb0', '#7fa8e0', '#eeeeee'];
export const HAIRS = ['bun', 'messy', 'long', 'wavy', 'bob', 'pony', 'short', 'twin'];
export const OUTFITS = ['suit', 'plaid', 'plaidShorts', 'hoodie', 'dress', 'pajama', 'overalls'];
export const EYES = ['dot', 'sleepy', 'lash'];

// 最初からいる4人
export const FAMILY = [
  { id: 'c1', look: { skin: '#f0d6c3', hair: 'bun', hairColor: '#3b2c41', outfit: 'suit', glasses: true, eyes: 'dot', mouth: 'smile', brows: false, piercing: false, necklace: false } },
  { id: 'c2', look: { skin: '#e8cc9f', hair: 'messy', hairColor: '#1d2229', outfit: 'plaid', glasses: false, eyes: 'sleepy', mouth: 'smile', brows: true, piercing: true, necklace: true } },
  { id: 'c3', look: { skin: '#f2dccc', hair: 'long', hairColor: '#1d2229', outfit: 'plaidShorts', glasses: true, eyes: 'lash', mouth: 'o', brows: false, piercing: false, necklace: false } },
  { id: 'c4', look: { skin: '#ecd2bb', hair: 'wavy', hairColor: '#2e2236', outfit: 'suit', glasses: true, eyes: 'dot', mouth: 'smile', brows: false, piercing: false, necklace: false } },
];

const HEAD = 'M -80,-198 C -80,-250 -46,-274 0,-274 C 46,-274 80,-250 80,-198 C 80,-152 46,-126 0,-126 C -46,-126 -80,-152 -80,-198 Z';

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c * k)));
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('');
}

// 輪郭つきの太い線（腕・脚）
function limb(d, color, w) {
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + SW * 2}" stroke-linecap="round"/>` +
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
}
const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round" ${extra}/>`;
const C = (x, y, r, fill, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="${SW}" ${extra}/>`;

// ---------- 服 ----------
const OUTFIT = {
  suit: { top: '#2a262c', sleeve: '#2a262c', legs: '#25242a', shoes: '#1f1e22', shoe: 'boot', cuff: 'frill' },
  plaid: { top: 'url(#plaid)', sleeve: 'url(#plaid)', legs: '#cfc3a3', shoes: '#1f1e22', shoe: 'chunky', big: true },
  plaidShorts: { top: 'url(#plaid)', sleeve: 'url(#plaid)', legs: 'skin', shoes: '#b98c6a', shoe: 'slipper', big: true, shorts: '#f4f2ef' },
  hoodie: { top: '#f4a6c0', sleeve: '#f4a6c0', legs: '#5b7fb5', shoes: '#ffffff', shoe: 'sneaker' },
  dress: { top: '#f6cf5f', sleeve: 'skin', legs: 'skin', shoes: '#e0605a', shoe: 'flat' },
  pajama: { top: 'url(#pjs)', sleeve: 'url(#pjs)', legs: 'url(#pjs)', shoes: '#fbfbfb', shoe: 'slipper' },
  overalls: { top: 'url(#stripe)', sleeve: 'url(#stripe)', legs: '#6f93c8', shoes: '#8a5a3c', shoe: 'flat' },
};

function legs(o, skin, pose) {
  const col = o.legs === 'skin' ? skin : o.legs;
  const y1 = pose === 'sit' ? -40 : -20;
  let s = limb(`M -19,-64 L -19,${y1}`, col, 30) + limb(`M 19,-64 L 19,${y1}`, col, 30);
  if (o.shorts) s += P('M -40,-70 L 40,-70 L 42,-46 L 3,-46 L 0,-52 L -3,-46 L -42,-46 Z', o.shorts);
  if (o.legs === '#cfc3a3') s += `<path d="M -19,-50 l 0,26 M 19,-50 l 0,26" stroke="${shade('#cfc3a3', 0.8)}" stroke-width="2"/>`;
  const sy = pose === 'sit' ? -30 : -10;
  const shoe = (x) => {
    switch (o.shoe) {
      case 'boot': return P(`M ${x - 22},${sy + 10} C ${x - 24},${sy - 8} ${x - 16},${sy - 16} ${x},${sy - 16} C ${x + 16},${sy - 16} ${x + 26},${sy - 6} ${x + 24},${sy + 10} Z`, o.shoes) +
        `<path d="M ${x - 22},${sy + 4} L ${x + 24},${sy + 4}" stroke="#555" stroke-width="3"/>`;
      case 'chunky': return P(`M ${x - 24},${sy + 10} C ${x - 26},${sy - 10} ${x - 14},${sy - 16} ${x},${sy - 16} C ${x + 16},${sy - 16} ${x + 28},${sy - 8} ${x + 26},${sy + 10} Z`, o.shoes);
      case 'slipper': return P(`M ${x - 25},${sy + 9} C ${x - 27},${sy - 9} ${x - 14},${sy - 13} ${x},${sy - 13} C ${x + 14},${sy - 13} ${x + 27},${sy - 9} ${x + 25},${sy + 9} Z`, o.shoes) +
        P(`M ${x - 22},${sy - 2} C ${x - 18},${sy - 14} ${x + 18},${sy - 14} ${x + 22},${sy - 2} Z`, shade(o.shoes === '#fbfbfb' ? '#f4e9ff' : '#f6e6d6', 1));
      case 'sneaker': return P(`M ${x - 22},${sy + 9} C ${x - 24},${sy - 10} ${x - 12},${sy - 14} ${x},${sy - 14} C ${x + 14},${sy - 14} ${x + 26},${sy - 6} ${x + 24},${sy + 9} Z`, o.shoes) +
        `<path d="M ${x - 22},${sy + 3} L ${x + 24},${sy + 3}" stroke="#e57e9a" stroke-width="5"/>`;
      default: return P(`M ${x - 20},${sy + 8} C ${x - 22},${sy - 8} ${x - 10},${sy - 12} ${x},${sy - 12} C ${x + 12},${sy - 12} ${x + 22},${sy - 6} ${x + 20},${sy + 8} Z`, o.shoes);
    }
  };
  return s + shoe(-21) + shoe(21);
}

function arms(o, skin, raise) {
  const sl = o.sleeve === 'skin' ? skin : o.sleeve;
  const w = o.big ? 32 : 26;
  const hy = raise ? -150 : -78;
  const hx = raise ? 74 : 62;
  let s = limb(`M -44,-124 Q -56,-100 -${hx},${hy}`, sl, w) + limb(`M 44,-124 Q 56,-100 ${hx},${hy}`, sl, w);
  if (o.big) s += `<path d="M -${hx - 4},${hy - 4} l -12,4 M ${hx - 4},${hy - 4} l 12,4" stroke="${INK}" stroke-width="3"/>`;
  if (o.cuff === 'frill') {
    for (const sx of [-1, 1]) {
      s += P(`M ${sx * (hx - 14)},${hy - 2} q ${sx * 4},8 ${sx * 8},2 q ${sx * 4},8 ${sx * 8},2 q ${sx * 4},8 ${sx * 8},0 q ${sx * 2},-10 ${sx * -2},-10 l ${sx * -20},0 z`, '#fbfaf7');
    }
  }
  s += C(-hx - 1, hy + 10, 14, skin) + C(hx + 1, hy + 10, 14, skin);
  return s;
}

function torso(o, skin, look) {
  const w = o.big ? 54 : 46;
  const top = -140;
  let s = '';
  const body = `M -38,${top} C -46,${top} -${w - 4},${top + 8} -${w},${top + 22} L -${w + 2},-58 C -${w + 2},-52 ${w + 2},-52 ${w + 2},-58 L ${w},${top + 22} C ${w - 4},${top + 8} 46,${top} 38,${top} Z`;
  switch (look.outfit) {
    case 'suit':
      s += P(body, o.top);
      s += P(`M -16,${top} L 16,${top} L 10,-74 L -10,-74 Z`, '#fbfaf7');
      s += `<circle cx="0" cy="-104" r="3" fill="${INK}"/><circle cx="0" cy="-88" r="3" fill="${INK}"/>`;
      s += P(`M -18,${top} L -6,-96 L -24,-116 Z`, shade('#2a262c', 1.4)) + P(`M 18,${top} L 6,-96 L 24,-116 Z`, shade('#2a262c', 1.4));
      // ひだのある襟（ジャボ）と蝶ネクタイ
      s += P(`M -12,${top + 4} q -8,10 0,14 q -6,10 4,12 l 8,0 q 10,-2 4,-12 q 8,-4 0,-14 z`, '#ffffff');
      s += P(`M -14,${top - 2} L 0,${top + 4} L 14,${top - 2} L 14,${top + 10} L 0,${top + 4} L -14,${top + 10} Z`, '#fbfaf7');
      s += P(`M -42,-62 L 42,-62 L 44,-56 L -44,-56 Z`, '#1f1d22');
      break;
    case 'plaid':
    case 'plaidShorts':
      s += P(`M -24,${top} L 24,${top} L 26,-60 L -26,-60 Z`, '#f6f4f1');
      if (look.outfit === 'plaid') s += `<path d="M 0,${top + 10} L 0,-80" stroke="${INK}" stroke-width="3"/><path d="M -6,-86 l 6,10 l 6,-10" fill="none" stroke="${INK}" stroke-width="3"/>`;
      else s += `<path d="M -18,-112 q 18,6 36,0" fill="none" stroke="#c9c3c0" stroke-width="3"/><path d="M -24,-70 L 24,-70" stroke="#d9d4d0" stroke-width="5"/>`;
      s += P(`M -34,${top} C -46,${top} -${w},${top + 10} -${w + 2},${top + 26} L -${w + 4},-56 L -18,-56 L -14,${top + 30} Z`, o.top);
      s += P(`M 34,${top} C 46,${top} ${w},${top + 10} ${w + 2},${top + 26} L ${w + 4},-56 L 18,-56 L 14,${top + 30} Z`, o.top);
      s += P(`M -24,${top} L -10,${top + 22} L -2,${top + 2} Z`, o.top) + P(`M 24,${top} L 10,${top + 22} L 2,${top + 2} Z`, o.top);
      break;
    case 'hoodie':
      s += P(`M -40,${top + 6} C -40,${top - 12} 40,${top - 12} 40,${top + 6} Z`, shade('#f4a6c0', 0.9));
      s += P(body, o.top);
      s += P(`M -26,-92 L 26,-92 L 30,-64 L -30,-64 Z`, shade('#f4a6c0', 0.92));
      s += `<path d="M -10,${top + 6} l -2,26 M 10,${top + 6} l 2,26" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;
      break;
    case 'dress':
      s += P(`M -34,${top} C -42,${top} -46,${top + 10} -48,${top + 24} L -66,-38 C -40,-30 40,-30 66,-38 L 48,${top + 24} C 46,${top + 10} 42,${top} 34,${top} Z`, o.top);
      s += P(`M -22,${top - 2} q 22,18 44,0 l -6,12 q -16,10 -32,0 z`, '#ffffff');
      s += `<path d="M -48,-84 Q 0,-76 48,-84" fill="none" stroke="${shade('#f6cf5f', 0.8)}" stroke-width="4"/>`;
      break;
    case 'pajama':
      s += P(body, o.top);
      s += P(`M -20,${top} L 0,${top + 18} L 20,${top} Z`, '#ffffff');
      s += `<circle cx="0" cy="-106" r="3" fill="#ffffff" stroke="${INK}" stroke-width="2"/><circle cx="0" cy="-86" r="3" fill="#ffffff" stroke="${INK}" stroke-width="2"/>`;
      break;
    case 'overalls':
      s += P(body, o.top);
      s += P(`M -30,-112 L 30,-112 L 34,-58 L -34,-58 Z`, '#6f93c8');
      s += `<path d="M -26,-112 L -36,${top + 2} M 26,-112 L 36,${top + 2}" stroke="#6f93c8" stroke-width="9"/>`;
      s += `<circle cx="-24" cy="-106" r="4" fill="#f2c94c"/><circle cx="24" cy="-106" r="4" fill="#f2c94c"/>`;
      s += P(`M -14,-98 L 14,-98 L 14,-80 L -14,-80 Z`, shade('#6f93c8', 0.9));
      break;
  }
  if (look.necklace) s += `<path d="M -14,${top + 2} Q 0,${top + 34} 14,${top + 2}" fill="none" stroke="#9aa0a6" stroke-width="2.5"/><path d="M 0,${top + 26} l -5,8 l 5,8 l 5,-8 z" fill="#c9ced3" stroke="${INK}" stroke-width="2"/>`;
  return s;
}

// ---------- 髪 ----------
function hairBack(look) {
  const c = look.hairColor;
  switch (look.hair) {
    case 'long': return P('M -84,-214 C -88,-160 -90,-110 -82,-84 C -60,-74 60,-74 82,-84 C 90,-110 88,-160 84,-214 Z', c);
    case 'bob': return P('M -86,-214 C -90,-170 -92,-150 -84,-136 C -40,-126 40,-126 84,-136 C 92,-150 90,-170 86,-214 Z', c);
    case 'pony': return P('M 50,-262 C 110,-270 120,-200 104,-150 C 98,-130 84,-128 80,-140 C 96,-180 90,-220 46,-232 Z', c);
    case 'twin': return P('M -70,-240 C -120,-236 -126,-160 -104,-126 C -94,-116 -82,-124 -86,-138 C -96,-170 -94,-210 -68,-214 Z', c) +
      P('M 70,-240 C 120,-236 126,-160 104,-126 C 94,-116 82,-124 86,-138 C 96,-170 94,-210 68,-214 Z', c);
    default: return '';
  }
}

function hairFront(look, uid) {
  const c = look.hairColor;
  const hi = shade(c, 1.45);
  const shine = (d) => `<path d="${d}" fill="none" stroke="${hi}" stroke-width="4" stroke-linecap="round" opacity="0.8"/>`;
  switch (look.hair) {
    case 'bun': {
      // 刈り上げ（両横を薄く）＋頭のてっぺんのおだんご
      let s = `<g clip-path="url(#hc-${uid})"><path d="M -84,-268 L -46,-268 L -50,-200 L -84,-196 Z M 84,-268 L 46,-268 L 50,-200 L 84,-196 Z" fill="${c}" opacity="0.32"/></g>`;
      for (const [x, y] of [[-34, -304], [-14, -314], [8, -316], [28, -308], [42, -294]]) {
        s += limb(`M 0,-286 Q ${x * 0.6},${y + 10} ${x},${y}`, c, 11);
      }
      s += P('M -30,-282 C -30,-300 30,-300 30,-282 Z', c);
      s += P('M -58,-226 C -64,-262 -36,-284 0,-284 C 36,-284 64,-262 58,-226 C 46,-242 30,-236 18,-246 C 2,-236 -18,-238 -30,-246 C -40,-236 -50,-236 -58,-226 Z', c);
      s += shine('M -30,-270 Q -10,-278 14,-274');
      return s;
    }
    case 'messy':
      return P('M -88,-170 C -104,-196 -96,-236 -76,-256 C -62,-292 -14,-300 14,-292 C 52,-298 92,-270 94,-232 C 106,-212 100,-184 88,-168 C 84,-182 78,-190 74,-198 C 72,-206 70,-212 66,-216 Q 56,-212 50,-226 Q 38,-214 30,-238 Q 16,-216 4,-236 Q -6,-220 -18,-238 Q -30,-218 -42,-232 Q -52,-214 -64,-220 Q -72,-200 -74,-196 C -80,-188 -84,-180 -88,-170 Z', c) +
        P('M -88,-170 q -6,-6 -2,-14 q 4,8 10,4 z', c) + P('M 88,-168 q 8,-4 6,-14 q -6,8 -12,4 z', c) +
        shine('M -40,-276 Q -10,-288 24,-280');
    case 'long':
      return P('M -84,-212 C -86,-262 -46,-288 0,-288 C 46,-288 86,-262 84,-212 L 84,-140 L 66,-140 L 64,-220 C 40,-226 -40,-226 -64,-220 L -66,-140 L -84,-140 Z', c) +
        shine('M -36,-272 Q 0,-282 34,-272');
    case 'wavy':
      return P('M -90,-176 C -100,-200 -92,-230 -80,-246 C -70,-280 -30,-292 0,-290 C 40,-292 80,-276 86,-242 C 98,-226 100,-196 90,-176 C 86,-186 80,-190 76,-188 C 78,-206 72,-218 66,-224 C 46,-230 24,-246 -14,-262 C -24,-244 -50,-232 -64,-222 C -70,-212 -74,-200 -74,-188 C -80,-192 -86,-188 -90,-176 Z', c) +
        shine('M -10,-276 Q 24,-282 52,-266');
    case 'bob':
      return P('M -86,-212 C -88,-262 -46,-288 0,-288 C 46,-288 88,-262 86,-212 L 86,-150 L 70,-150 L 66,-218 C 30,-230 -30,-230 -66,-218 L -70,-150 L -86,-150 Z', c) +
        shine('M -36,-272 Q 0,-282 34,-272');
    case 'pony':
    case 'twin':
      return P('M -82,-206 C -84,-262 -44,-286 0,-286 C 44,-286 84,-262 82,-206 C 74,-214 70,-222 66,-228 C 40,-232 20,-236 6,-244 C -10,-232 -40,-230 -66,-226 C -72,-220 -78,-212 -82,-206 Z', c) +
        (look.hair === 'twin' ? C(-76, -232, 9, '#e85d75') + C(76, -232, 9, '#e85d75') : C(56, -262, 8, '#7fc8a9')) +
        shine('M -36,-272 Q 0,-282 34,-272');
    case 'short':
    default:
      return P('M -82,-200 C -88,-262 -44,-284 0,-284 C 44,-284 88,-262 82,-200 C 78,-214 74,-222 70,-226 Q 50,-232 30,-226 Q 10,-238 -10,-228 Q -40,-236 -70,-226 C -74,-220 -78,-212 -82,-200 Z', c) +
        shine('M -36,-270 Q 0,-280 34,-270');
  }
}

// ---------- 顔 ----------
function face(look, expr, closed, uid) {
  let s = '';
  const ex = 28, ey = -194;
  // ほっぺ
  s += `<ellipse cx="-50" cy="-168" rx="12" ry="7" fill="#f19c9c" opacity="0.55"/><ellipse cx="50" cy="-168" rx="12" ry="7" fill="#f19c9c" opacity="0.55"/>`;
  if (look.brows) s += `<path d="M -42,-222 q 12,-6 24,-2 M 42,-222 q -12,-6 -24,-2" stroke="${shade(look.hairColor, 1.3)}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  if (look.piercing) s += `<circle cx="-40" cy="-226" r="3" fill="#c9ced3" stroke="${INK}" stroke-width="1.5"/><circle cx="-32" cy="-228" r="3" fill="#c9ced3" stroke="${INK}" stroke-width="1.5"/>`;
  if (closed) {
    s += `<path d="M -${ex + 8},${ey} q 8,7 16,0 M ${ex - 8},${ey} q 8,7 16,0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
  } else {
    for (const sx of [-1, 1]) {
      const x = sx * ex;
      s += `<ellipse cx="${x}" cy="${ey}" rx="7" ry="8.5" fill="${INK}"/><circle cx="${x + 2.5}" cy="${ey - 3}" r="2.4" fill="#fff"/>`;
      if (look.eyes === 'sleepy') s += `<path d="M ${x - 11},${ey - 5} L ${x + 11},${ey - 5}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
      if (look.eyes === 'lash') s += `<path d="M ${x + sx * 7},${ey - 6} l ${sx * 6},-5 M ${x + sx * 8},${ey - 1} l ${sx * 7},-2" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;
    }
  }
  // 鼻
  s += `<path d="M -5,-180 q 5,6 10,0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  // 口
  const m = expr || look.mouth;
  if (m === 'o') s += `<ellipse cx="0" cy="-160" rx="4" ry="5" fill="${INK}"/>`;
  else if (m === 'grin') s += `<path d="M -16,-166 Q 0,-142 16,-166 Z" fill="#8c3b4a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  else if (m === 'eat') s += `<ellipse cx="0" cy="-160" rx="11" ry="10" fill="#8c3b4a" stroke="${INK}" stroke-width="3"/>`;
  else if (m === 'wow') s += `<ellipse cx="0" cy="-158" rx="8" ry="11" fill="#8c3b4a" stroke="${INK}" stroke-width="3"/>`;
  else s += `<path d="M -12,-164 q 12,10 24,0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
  if (look.glasses) {
    for (const sx of [-1, 1]) {
      const x = sx * 30;
      s += `<circle cx="${x}" cy="${ey}" r="25" fill="#d6d6de" fill-opacity="0.45" stroke="#2f2a2e" stroke-width="4.5"/>`;
      s += `<path d="M ${x - 14},${ey - 12} q 6,-8 16,-8" fill="none" stroke="#fff" stroke-width="3" opacity="0.8" stroke-linecap="round"/>`;
    }
    s += `<path d="M -6,${ey - 2} q 6,-5 12,0" fill="none" stroke="#2f2a2e" stroke-width="4"/>`;
  }
  return s;
}

/**
 * 人を1体描く。
 * opts.pose: 'stand' | 'sit' | 'lie' | 'drag'
 * opts.expr: 口の形を一時的に変える（'grin' 'eat' 'wow' など）
 */
export function drawCharacter(look, uid, opts = {}) {
  const sp = spriteOf(look);
  if (sp) return drawSprite(sp, uid, opts);
  const o = OUTFIT[look.outfit] || OUTFIT.suit;
  const pose = opts.pose || 'stand';
  const closed = pose === 'lie' || opts.closed;
  let s = `<defs><clipPath id="hc-${uid}"><path d="${HEAD}"/></clipPath></defs>`;
  s += hairBack(look);
  s += legs(o, look.skin, pose);
  s += torso(o, look.skin, look);
  s += arms(o, look.skin, pose === 'drag');
  s += C(-78, -188, 14, look.skin) + C(78, -188, 14, look.skin);
  s += P(HEAD, look.skin);
  s += face(look, opts.expr, closed, uid);
  s += hairFront(look, uid);
  return s;
}

// 手で持つ位置（人の座標系）
export function handPos(pose) {
  return pose === 'drag' ? { x: 75, y: -140 } : { x: 63, y: -68 };
}

// 模様（plaid など）は世界の SVG の defs に1回だけ置く
export const PATTERN_DEFS = `
<pattern id="plaid" width="28" height="28" patternUnits="userSpaceOnUse">
  <rect width="28" height="28" fill="#4f4743"/>
  <rect x="0" y="9" width="28" height="9" fill="#6a605a" opacity="0.8"/>
  <rect x="9" y="0" width="9" height="28" fill="#6a605a" opacity="0.6"/>
  <path d="M 0,4 L 28,4 M 4,0 L 4,28" stroke="#2f2926" stroke-width="2"/>
  <path d="M 0,22 L 28,22 M 22,0 L 22,28" stroke="#8a807a" stroke-width="1.5"/>
</pattern>
<pattern id="pjs" width="36" height="36" patternUnits="userSpaceOnUse">
  <rect width="36" height="36" fill="#a9cdf0"/>
  <path d="M 9,5 l 2,5 5,0 -4,3 2,5 -5,-3 -5,3 2,-5 -4,-3 5,0 z" fill="#fff6c8"/>
  <circle cx="27" cy="26" r="3" fill="#ffffff"/>
</pattern>
<pattern id="stripe" width="20" height="20" patternUnits="userSpaceOnUse">
  <rect width="20" height="20" fill="#ffffff"/><rect width="20" height="10" fill="#e8665f"/>
</pattern>`;

// ---------- キャラクターファイル（pack.json）で読み込む絵。ファイルは端末ごとに読み込み、このリポジトリには入れない ----------
// pack.json（素材/build_pack.py で作る）を setPack で登録すると、look.sprite の人はその絵で描く
export const SPRITES = {};
const K = 1.05; // 切り抜きの画素 → 世界の大きさ

export function setPack(pack) {
  for (const [id, m] of Object.entries(pack.chars || {})) SPRITES[id] = m;
}

const spriteOf = (look) => (look.sprite && SPRITES[look.sprite]) || null;
const toLocal = (m, [x, y]) => ({ x: (x - m.cx) * K, y: (y - m.h) * K });

function drawSprite(m, uid, opts) {
  const pose = opts.pose || 'stand';
  const img = `<image href="${m.png}" width="${m.w}" height="${m.h}"/>`;
  let s = `<g transform="scale(${K}) translate(${-m.cx},${-m.h})">`;
  if (pose === 'sit') {
    // 座ると脚が手前に向くので、脚だけ縦に縮める
    s += `<defs><clipPath id="su-${uid}"><rect x="0" y="0" width="${m.w}" height="${m.hip}"/></clipPath>` +
      `<clipPath id="sl-${uid}"><rect x="0" y="${m.hip}" width="${m.w}" height="${m.h - m.hip}"/></clipPath></defs>`;
    s += `<g transform="translate(0,${m.hip}) scale(1,0.45) translate(0,${-m.hip})"><image href="${m.png}" width="${m.w}" height="${m.h}" clip-path="url(#sl-${uid})"/></g>`;
    s += `<image href="${m.png}" width="${m.w}" height="${m.h}" clip-path="url(#su-${uid})"/>`;
  } else {
    s += img;
  }
  // 目を閉じる（寝ている・まばたき）
  if (pose === 'lie' || opts.closed) {
    for (const [ex, ey] of m.eyes) {
      s += `<ellipse cx="${ex}" cy="${ey}" rx="${m.glasses ? 10 : 9}" ry="10" fill="${m.eyeBg}"/>`;
      s += `<path d="M ${ex - 7},${ey} q 7,6 14,0" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
    }
  }
  // 口を一時的に変える（食べる・笑う・おどろく）
  const ex = opts.expr;
  if (ex) {
    const [mx, my] = m.mouth;
    s += `<ellipse cx="${mx}" cy="${my}" rx="10" ry="6" fill="${m.skin}"/>`;
    if (ex === 'eat') s += `<ellipse cx="${mx}" cy="${my + 1}" rx="6" ry="5.5" fill="#8c3b4a" stroke="${INK}" stroke-width="2"/>`;
    else if (ex === 'grin') s += `<path d="M ${mx - 8},${my - 2} Q ${mx},${my + 11} ${mx + 8},${my - 2} Z" fill="#8c3b4a" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    else if (ex === 'wow') s += `<ellipse cx="${mx}" cy="${my + 1}" rx="4.5" ry="6" fill="#8c3b4a" stroke="${INK}" stroke-width="2"/>`;
  }
  return s + '</g>';
}

/** 人の体の位置（足元の中央からの距離）。頭・口・手・座ったときの沈み込み */
export function metrics(look, pose) {
  const m = spriteOf(look);
  if (!m) return { head: { x: 0, y: -200 }, mouth: { x: 0, y: -160 }, hand: handPos(pose), sitDy: 62 };
  return { head: toLocal(m, m.head), mouth: toLocal(m, m.mouth), hand: toLocal(m, m.hand), sitDy: (m.h - m.hip) * K + 8 };
}

/** 物を持ったとき、手を物の手前に描き直す（自作の絵のみ） */
export function handOverlay(look, uid, pose) {
  const m = spriteOf(look);
  if (!m) {
    const h = handPos(pose);
    return `<circle cx="${h.x + 1}" cy="${h.y + 10}" r="14" fill="${look.skin}" stroke="${INK}" stroke-width="4"/>`;
  }
  return ''; // 切り抜きの絵は手がそでに隠れていることが多いので、物を手の前に置くだけにする
}
