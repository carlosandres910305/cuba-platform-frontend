// ============================================================
// SERVICE WORKER
// ============================================================
// Recibe notificaciones push y las muestra al usuario.
// ============================================================

self.addEventListener('push', function (event) {
  if (!event.data) {
    console.log('Push sin datos');
    return;
  }

  try {
    const data = event.data.json();

    const options = {
      body: data.body || 'Nueva notificación',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/',
      },
      requireInteraction: true,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Notificación', options),
    );
  } catch (error) {
    console.error('Error al procesar push:', error);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});