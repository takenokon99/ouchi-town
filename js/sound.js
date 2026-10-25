// 効果音はすべてその場で合成する（音のファイルは使わない）
let ctx = null;
let master = null;

export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
}

function tone(freq, dur, { type = 'sine', vol = 0.3, to = null, delay = 0 } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur, { vol = 0.2, delay = 0, freq = 1200 } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(master);
  src.start(t);
}

export const sfx = {
  pick: () => tone(420, 0.12, { to: 760, vol: 0.18 }),
  drop: () => tone(220, 0.12, { to: 120, vol: 0.25, type: 'triangle' }),
  land: () => { tone(160, 0.1, { to: 90, vol: 0.2, type: 'triangle' }); },
  click: () => tone(900, 0.05, { type: 'square', vol: 0.06 }),
  toggle: () => { tone(600, 0.08, { vol: 0.15 }); tone(900, 0.1, { vol: 0.12, delay: 0.06 }); },
  munch: () => { for (let i = 0; i < 3; i++) noise(0.07, { vol: 0.35, delay: i * 0.11, freq: 900 + i * 300 }); },
  gulp: () => { tone(300, 0.12, { to: 160, vol: 0.25 }); tone(300, 0.12, { to: 160, vol: 0.2, delay: 0.18 }); },
  giggle: () => { const b = 520 + Math.random() * 200; for (let i = 0; i < 4; i++) tone(b + i * 40, 0.07, { vol: 0.12, type: 'triangle', delay: i * 0.08 }); },
  boing: () => tone(180, 0.35, { to: 520, vol: 0.2, type: 'triangle' }),
  meow: () => { tone(700, 0.35, { to: 450, vol: 0.18, type: 'sawtooth' }); },
  ring: () => { for (let i = 0; i < 6; i++) tone(i % 2 ? 1320 : 1180, 0.08, { vol: 0.08, type: 'square', delay: i * 0.09 }); },
  squeak: () => tone(1200, 0.12, { to: 1600, vol: 0.1 }),
  done: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, { vol: 0.14, type: 'triangle', delay: i * 0.08 })); },
};

// ラジオの音楽（短いメロディをくり返す）
let musicTimer = null;
const MELODY = [523, 587, 659, 523, 659, 698, 784, 0, 784, 880, 784, 698, 659, 523, 587, 0];
export function setMusic(on) {
  if (!on) { clearInterval(musicTimer); musicTimer = null; return; }
  if (musicTimer || !ctx) return;
  let i = 0;
  musicTimer = setInterval(() => {
    const f = MELODY[i % MELODY.length];
    if (f) tone(f, 0.22, { vol: 0.08, type: 'triangle' });
    if (i % 4 === 0) tone(f ? f / 4 : 131, 0.3, { vol: 0.06, type: 'sine' });
    i++;
  }, 260);
}
