// 一度開けば、ネットがなくても遊べるようにする。中身を変えたら VERSION を上げる
const VERSION = 'ouchi-v3';
const FILES = [
  './', './index.html', './style.css', './manifest.webmanifest',
  './js/main.js', './js/characters.js', './js/items.js', './js/rooms.js', './js/sound.js', './js/dress.js',
  './icons/icon-192.png', './icons/icon-512.png',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// ネットにつながっていれば新しい版を使い、つながらなければ保存した版を使う
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true })),
  );
});
