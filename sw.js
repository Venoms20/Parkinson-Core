const CACHE_NAME = 'parkinson-care-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/icon.svg',
  '/manifest.json',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/hooks/useLocalStorage.ts',
  '/utils/haptic.ts',
  '/utils/sound.ts',
  '/components/Header.tsx',
  '/components/BottomNav.tsx',
  '/components/PatientProfile.tsx',
  '/components/MedicationList.tsx',
  '/components/AppointmentList.tsx',
  '/components/Diary.tsx',
  '/components/Modal.tsx',
  '/components/HealthTipModal.tsx',
  '/components/NotificationPermission.tsx',
  '/components/Icons.tsx',
  '/components/SplashScreen.tsx',
  '/components/MedicationCard.tsx'
];

// Instala o service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Responde às solicitações com uma estratégia network-first
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      // Se a rede falhar, tenta buscar no cache
      return caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        // Para requisições de navegação, retorna a página principal em cache se nada for encontrado
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

// Atualiza o service worker e limpa caches antigos
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
    })
  );
});
