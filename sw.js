/* MiHelp — service worker. Fica na RAIZ do site, ao lado do index.html.
   Troque VERSAO sempre que publicar uma mudança grande, para limpar o cache antigo. */
const VERSAO = 'mihelp-v1';
const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSAO)
      .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  /* só mexe no que é do próprio site; API (worker), Wix, esm.sh e fontes passam direto */
  if (url.origin !== location.origin) return;

  /* páginas: tenta a rede primeiro (sempre a versão nova); sem internet, usa o cache */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copia = r.clone();
          caches.open(VERSAO).then((c) => c.put('index.html', copia)).catch(() => {});
          return r;
        })
        .catch(() => caches.match('index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  /* arquivos estáticos (ícones, manifest): cache primeiro, atualiza por trás */
  e.respondWith(
    caches.match(req).then((hit) => {
      const rede = fetch(req)
        .then((r) => {
          if (r && r.ok) { const copia = r.clone(); caches.open(VERSAO).then((c) => c.put(req, copia)).catch(() => {}); }
          return r;
        })
        .catch(() => hit);
      return hit || rede;
    })
  );
});
