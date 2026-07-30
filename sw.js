// White 宸ヤ綔鍙?Service Worker 鈥斺€?璁╂墜鏈哄彲"娣诲姞鍒颁富灞忓箷"骞剁绾垮惎鍔ㄥ澹?// v2 鍗囩骇: HTML 璧扮綉缁滀紭鍏堬紙姘歌繙鎷挎渶鏂伴儴缃诧級锛岄潤鎬佽祫婧愮紦瀛樹紭鍏堬紙绂荤嚎绉掑紑锛?const CACHE = 'wb-shell-v2';
const SHELL = ['/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;
  // 鏁版嵁鎺ュ彛姘镐笉缂撳瓨
  if (url.pathname.startsWith('/api/')) return;

  // HTML锛坣avigation/鏂囨。锛夎蛋缃戠粶浼樺厛锛岀‘淇濇洿鏂扮珛鍗崇敓鏁?  const isHTML = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');
  if (isHTML) {
    event.respondWith(
      fetch(req).then((resp) => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return resp;
      }).catch(() => caches.match(req).then((c) => c || caches.match('/')))
    );
    return;
  }

  // 闈欐€佽祫婧愶紙JS/CSS/PNG/SVG/瀛椾綋...锛夌紦瀛樹紭鍏?  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => {
        if (resp && resp.ok && url.origin === self.location.origin) {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return resp;
      }).catch(() => caches.match('/'));
    })
  );
});

