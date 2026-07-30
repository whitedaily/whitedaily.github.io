/* Service Worker - force refresh */
const CACHE = 'daily-v6';
const FILES = [
  'index.html',
  'manifest.json',
  'css/style.css',
  'js/data.js','js/calendar.js','js/reminder.js','js/screenshot.js','js/charts.js','js/briefing.js','js/sync.js','js/app.js',
  'lib/chart.umd.min.js','lib/tesseract.min.js'
];
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(res => {
      if(res.ok && e.request.method === 'GET'){
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request).then(cached => cached || caches.match('index.html')))
  );
});
