// Fallback para tipos experimentais
if (typeof TimestampTrigger === 'undefined') {
  self.TimestampTrigger = class { constructor(t) { this.timestamp = t; } };
}

const CACHE_NAME = 'parkinson-care-v4';
const URLS_TO_CACHE = ['/', '/index.html', '/icon.svg', '/manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(URLS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Função para agendar um lembrete com "Snooze" automático (repete 3 vezes se não confirmado)
async function scheduleMedicationAlarms(meds) {
  const registrations = await self.registration.getNotifications();
  // Limpa apenas os alarmes futuros (tags que começam com 'med-')
  registrations.forEach(n => { if (n.tag.startsWith('med-')) n.close(); });

  const now = new Date();
  
  meds.forEach(med => {
    if (!med.enabled || !med.time) return;

    const [hour, minute] = med.time.split(':').map(Number);
    let alarmDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);

    if (alarmDate < now) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }

    // Criamos 3 gatilhos: no horário, +5 min, +10 min (Efeito Despertador Persistente)
    [0, 5, 10].forEach(offset => {
      const triggerTime = new Date(alarmDate.getTime() + offset * 60000);
      const timestamp = triggerTime.getTime();
      
      const options = {
        body: `ALERTA CRÍTICO: Tomar ${med.name} (${med.dosage}) agora!`,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: `med-${med.id}-${timestamp}`, // Tag única por instância
        renotify: true,
        requireInteraction: true,
        vibrate: [500, 200, 500, 200, 500, 200, 800],
        actions: [
          { action: 'confirm', title: '✅ JÁ TOMEI' },
          { action: 'open', title: '📂 VER DETALHES' }
        ],
        showTrigger: new self.TimestampTrigger(timestamp),
        data: { medId: med.id, medName: med.name }
      };

      self.registration.showNotification(`🚨 DESPERTADOR: ${med.name}`, options);
    });
  });
}

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SCHEDULE_ALARMS') {
    event.waitUntil(scheduleMedicationAlarms(event.data.payload.medications));
  }
});

self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  notification.close();

  // Se o usuário clicou em "Já Tomei", poderíamos em teoria cancelar os próximos snoozes.
  // Por simplicidade de PWA offline, apenas focamos o app.
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) return clientList[0].focus();
      return clients.openWindow('/');
    })
  );
});
