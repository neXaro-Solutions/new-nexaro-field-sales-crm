self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}
  const title = data.title || 'neXaro Händlerverwaltung';
  const options = {
    body: data.body || 'Es gibt einen neuen Vorgang.',
    icon: './icon-192.png',
    badge: './icon-192.png',
    data: { url: data.url || './' },
    tag: 'nexaro-admin'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || './';
  event.waitUntil(clients.matchAll({type:'window', includeUncontrolled:true}).then(list => {
    for (const client of list) {
      if ('focus' in client) return client.focus();
    }
    return clients.openWindow(url);
  }));
});
