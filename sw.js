const CACHE_NAME = 'parkinson-care-v2';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/icon.svg',
  '/manifest.json',
  '/index.tsx',
  '/App.tsx',
  '/utils/sound.ts',
  '/components/AlarmOverlay.tsx'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
    ))
  );
  self.clients.claim();
});

// Listener para mensagens do App (ex: agendar notificação ou disparar imediato)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'TRIGGER_ALARM') {
    const { meds, appts } = event.data.payload;
    
    let bodyText = '';
    if (meds.length > 0) {
      bodyText += 'REMÉDIOS: ' + meds.map(m => `${m.name} (${m.dosage})`).join(', ');
    }
    if (appts.length > 0) {
      bodyText += (bodyText ? ' | ' : '') + 'CONSULTAS: ' + appts.map(a => a.title).join(', ');
    }

    const options = {
      body: bodyText,
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500],
      tag: 'medication-alarm',
      renotify: true,
      requireInteraction: true, // Mantém a notificação até o usuário interagir
      priority: 2, // Alta prioridade (Android)
      actions: [
        { action: 'confirm', title: '✅ Tomei Agora', icon: '/icon.svg' },
        { action: 'open', title: '📂 Abrir App' }
      ],
      data: {
        url: self.registration.scope
      }
    };

    event.waitUntil(
      self.registration.showNotification('🚨 HORA DO SEU CUIDADO! 🚨', options)
    );
  }
});

// Lida com cliques na notificação
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'confirm') {
    // Aqui poderíamos atualizar o localStorage via IndexedDB se necessário
    // Por enquanto, apenas abre o app para o estado atualizado
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
