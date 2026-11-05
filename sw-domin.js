/* Domin — guardião offline.
   Guarda o labs.html (e ícones/manifest) neste computador para o Domin abrir mesmo sem internet.
   Com internet: sempre busca a versão nova (e atualiza a cópia). Sem internet ou com rede travada: abre a cópia guardada.
   Só mexe no labs.html; o resto do site (MiHelp etc.) não passa por aqui. */
var V = 'domin-v33';
var SHELL = ['labs.html', 'manifest-domin.webmanifest', 'icons/domin-192.png', 'icons/domin-512.png', 'icons/domin-apple-180.png', 'icons/domin-maskable-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) {
    return Promise.all(SHELL.map(function (u) {
      return fetch(new Request(u, { cache: 'reload' })).then(function (r) { if (r && r.ok) return c.put(new URL(u, self.registration.scope).href.split('?')[0], r) }).catch(function () {})
    }))
  }).then(function () { return self.skipWaiting() }))
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V && k.indexOf('domin-') === 0 }).map(function (k) { return caches.delete(k) }))
  }).then(function () { return self.clients.claim() }))
});

function chave(u) { var x = new URL(u); x.search = ''; x.hash = ''; return x.href }

function rede(req, e) {
  var k = chave(req.url);
  return caches.open(V).then(function (c) {
    return c.match(k).then(function (guard) {
      var net = fetch(req).then(function (r) { if (r && r.ok) { c.put(k, r.clone()); return r } return guard || r }).catch(function () { return guard });
      e.waitUntil(net.catch(function () {}));
      if (!guard) return net.then(function (r) { return r || Response.error() });
      // rede travada: depois de 3,5 s abre a cópia guardada
      return Promise.race([net, new Promise(function (ok) { setTimeout(function () { ok(guard) }, 3500) })]).then(function (r) { return r || guard })
    })
  })
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var u = new URL(req.url);
  if (u.origin !== self.location.origin) return;
  var nome = u.pathname.split('/').pop();
  var ehShell = (req.mode === 'navigate' && nome === 'labs.html') || nome === 'labs.html' || nome === 'manifest-domin.webmanifest' || /\/icons\/domin-[^/]+\.png$/.test(u.pathname);
  if (!ehShell) return;
  e.respondWith(rede(req, e))
});
