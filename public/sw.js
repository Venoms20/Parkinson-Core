const CACHE_NAME = 'parkinson-care-v2'; // Mudei para v2 para forçar a atualização
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instala o Service Worker de forma tolerante a erros
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Tentando fazer cache dos arquivos essenciais...');
        // Usa map e catch para que um arquivo ausente não quebre toda a instalação
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.warn(`[Service Worker] Falha ao fazer cache do arquivo: ${url}`, err);
            });
          })
        );
      })
      .then(() => self.skipWaiting()) // Força o SW a ativar imediatamente
  );
});

// Intercepta as requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// Limpa caches antigos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Assume o controle da página imediatamente
  );
});
