const C = 'miplan-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(C).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // Primero la red, para recibir actualizaciones; sin conexión, la copia guardada.
    e.respondWith(fetch(req).then(function (res) {
      if (res.ok) { const cp = res.clone(); caches.open(C).then(function (c) { c.put(req, cp); }); }
      return res;
    }).catch(function () { return caches.match(req).then(function (m) { return m || caches.match('index.html'); }); }));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(function (m) {
      return m || fetch(req).then(function (res) { const cp = res.clone(); caches.open(C).then(function (c) { c.put(req, cp); }); return res; });
    }));
  }
});
