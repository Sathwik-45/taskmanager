self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  console.log('Push Recieved...');
  self.registration.showNotification(data.title || 'TaskMaster Reminder', {
    body: data.body || 'You have pending tasks left for today! Time to wrap up.',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzI1NjNlYiI+PHBhdGggZD0iTTMgM2gxOHYxOEgzVjN6Ii8+PC9zdmc+',
    vibrate: [200, 100, 200, 100, 200]
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
