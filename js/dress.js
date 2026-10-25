// きがえ画面（髪・色・はだ・服・顔・めがね）
import { drawCharacter, HAIRS, HAIR_COLORS, SKINS, OUTFITS, EYES, OUTFIT_IMGS, ACC_IMGS } from './characters.js';
import { sfx } from './sound.js';

const panel = () => document.getElementById('dress');
let st = null;
let onChange = null;
let tab = 'hair';
let n = 0; // プレビューの id が重ならないように

const TABS = [
  { id: 'hair', icon: '💇' },
  { id: 'color', icon: '🎨' },
  { id: 'outfit', icon: '👕' },
  { id: 'face', icon: '🙂' },
  { id: 'skin', icon: '✋' },
  { id: 'extra', icon: '👓' },
];

const body = (look) => `<svg viewBox="-110 -330 220 345" aria-hidden="true">${drawCharacter(look, 'p' + n++)}</svg>`;
const head = (look) => `<svg viewBox="-105 -325 210 210" aria-hidden="true">${drawCharacter(look, 'p' + n++)}</svg>`;

// 切り抜きの絵の人は、キャラクターファイルの服とアクセサリーを選べる
const SPRITE_TABS = [{ id: 'clothes', icon: '👕' }, { id: 'accHead', icon: '🎀' }, { id: 'accFace', icon: '🕶️' }];

function options(c) {
  const L = c.look;
  const with_ = (patch) => ({ ...L, ...patch });
  if (L.sprite) {
    if (!SPRITE_TABS.some((t) => t.id === tab)) tab = 'clothes';
    if (tab === 'clothes') {
      return [null, ...Object.keys(OUTFIT_IMGS)].map((o) => ({ on: (L.outfitImg || null) === o, art: body(with_({ outfitImg: o || undefined })), set: { outfitImg: o || undefined } }));
    }
    // 先頭は「なし」
    const ids = Object.keys(ACC_IMGS).filter((id) => ACC_IMGS[id].slot === (tab === 'accHead' ? 'head' : 'face'));
    return [null, ...ids].map((a) => ({ on: (L[tab] || null) === a, art: head(with_({ [tab]: a || undefined })), set: { [tab]: a || undefined } }));
  }
  if (SPRITE_TABS.some((t) => t.id === tab)) tab = 'hair';
  switch (tab) {
    case 'hair': return HAIRS.map((h) => ({ on: L.hair === h, art: head(with_({ hair: h })), set: { hair: h } }));
    case 'color': return HAIR_COLORS.map((h) => ({ on: L.hairColor === h, art: `<span class="swatch" style="background:${h}"></span>`, set: { hairColor: h } }));
    case 'skin': return SKINS.map((h) => ({ on: L.skin === h, art: `<span class="swatch" style="background:${h}"></span>`, set: { skin: h } }));
    case 'outfit': return OUTFITS.map((o) => ({ on: L.outfit === o, art: body(with_({ outfit: o })), set: { outfit: o } }));
    case 'face': return [
      ...EYES.map((e) => ({ on: L.eyes === e, art: head(with_({ eyes: e })), set: { eyes: e } })),
      ...['smile', 'o', 'grin'].map((m) => ({ on: L.mouth === m, art: head(with_({ mouth: m })), set: { mouth: m } })),
    ];
    case 'extra': return [
      { on: L.glasses, art: head(with_({ glasses: true })), set: { glasses: !L.glasses } },
      { on: L.brows, art: head(with_({ brows: true })), set: { brows: !L.brows } },
      { on: L.piercing, art: head(with_({ piercing: true, brows: true })), set: { piercing: !L.piercing } },
      { on: L.necklace, art: body(with_({ necklace: true })), set: { necklace: !L.necklace } },
    ];
  }
  return [];
}

function render() {
  const c = st.chars.find((x) => x.id === st.sel) || st.chars[0];
  const p = panel();
  p.querySelector('.who').innerHTML = st.chars.map((x) => `<button class="who-btn${x.id === c.id ? ' on' : ''}" data-who="${x.id}">${head(x.look)}</button>`).join('');
  p.querySelector('.stage').innerHTML = body(c.look);
  const opts = options(c); // 人に合わないタブはここで切り替わるので、先に作る
  const tabs = c.look.sprite ? SPRITE_TABS : TABS;
  p.querySelector('.tabs').innerHTML = tabs.map((t) => `<button class="tab${t.id === tab ? ' on' : ''}" data-tab="${t.id}">${t.icon}</button>`).join('');
  p.querySelector('.opts').innerHTML = opts.map((o, k) => `<button class="opt${o.on ? ' on' : ''}" data-opt="${k}">${o.art}</button>`).join('');
  p._opts = opts;
  p._char = c;
}

export function initDress() {
  const p = panel();
  p.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.dataset.who) { st.sel = b.dataset.who; sfx.click(); render(); }
    else if (b.dataset.tab) { tab = b.dataset.tab; sfx.click(); render(); }
    else if (b.dataset.opt) {
      const o = p._opts[+b.dataset.opt];
      Object.assign(p._char.look, o.set);
      sfx.pick();
      onChange(p._char);
      render();
    } else if (b.id === 'dress-close') { p.hidden = true; sfx.done(); }
  });
}

export function openDress(state, cb) {
  st = state;
  onChange = cb;
  render();
  panel().hidden = false;
}
