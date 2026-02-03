// Fallback para suporte a navegadores que já possuem a API de triggers
const CACHE_NAME = 'parkinson-care-v5';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Função para agendar as notificações futuras (O Despertador Real)
async function scheduleAlarms(medications) {
  // 1. Limpa agendamentos anteriores para não duplicar
  const notifications = await self.registration.getNotifications();
  notifications.forEach(n => {
    if (n.tag && n.tag.startsWith('alarm-')) n.close();
  });

  const now = new Date();
  
  medications.forEach(med => {
    if (!med.enabled || !med.time) return;

    const [hour, minute] = med.time.split(':').map(Number);
    let targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);

    // Se o horário já passou hoje, agenda para amanhã
    if (targetDate < now) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    // Criamos 3 gatilhos (Snooze): Horário Original, +5min, +10min
    [0, 5, 10].forEach((offset) => {
      const scheduledTime = new Date(targetDate.getTime() + offset * 60000);
      const timestamp = scheduledTime.getTime();
      
      const options = {
        body: `HORA DO REMÉDIO: ${med.name} (${med.dosage}). Por favor, tome agora para manter seu bem-estar.`,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: `alarm-${med.id}-${timestamp}`,
        renotify: true,
        requireInteraction: true, // Mantém a notificação na tela até o usuário clicar
        vibrate: [500, 200, 500, 200, 500, 200, 800, 100, 800],
        actions: [
          { action: 'confirm', title: '✅ TOMEI AGORA' },
          { action: 'open', title: '📂 ABRIR APP' }
        ],
        // Se o navegador suportar showTrigger, ele agenda para o futuro
        // Caso contrário, ele dispara agora (o App.tsx enviará no minuto certo também)
        showTrigger: (typeof TimestampTrigger !== 'undefined') ? new TimestampTrigger(timestamp) : null,
        data: {
          medId: med.id,
          url: '/'
        }
      };

      // Se não houver suporte a trigger, o App.tsx cuidará do disparo em tempo real
      // Mas se houver, o sistema operacional cuidará disso mesmo com app fechado
      if (typeof TimestampTrigger !== 'undefined' || offset === 0) {
        self.registration.showNotification(`🚨 ALERTA: ${med.name}`, options);
      }
    });
  });
}

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SCHEDULE_ALARMS') {
    event.waitUntil(scheduleAlarms(event.data.payload.medications));
  }
});

self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const action = event.action;

  notification.close();

  if (action === 'confirm') {
    // Aqui você pode adicionar lógica para marcar como tomado no DB se necessário
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) return clientList[0].focus();
      return clients.openWindow('/');
    })
  );
});
