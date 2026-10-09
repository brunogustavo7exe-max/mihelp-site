/* MiHelp — service worker. Só cuida de arquivos do próprio site.
   Pedidos para outros endereços (worker, Wix, Mercado Pago) passam direto, sem cache. */
const VERSAO = 'mihelp-v1';
const BASE = ['./', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  /* página: tenta a internet primeiro (sempre a versão nova); sem internet usa a guardada */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((r) => { const c = r.clone(); caches.open(VERSAO).then((x) => x.put('./', c)); return r; })
        .catch(() => caches.match('./').then((r) => r || caches.match(req)))
    );
    return;
  }
  /* imagens, ícones e fontes: mostra o guardado e atualiza em segundo plano */
  e.respondWith(
    caches.match(req).then((guardado) => {
      const rede = fetch(req).then((r) => { if (r && r.ok) { const c = r.clone(); caches.open(VERSAO).then((x) => x.put(req, c)); } return r; }).catch(() => guardado);
      return guardado || rede;
    })
  );
});
