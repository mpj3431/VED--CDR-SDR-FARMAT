// VED - Share Target Service Worker
const CACHE = 'ved-shared';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && url.pathname.endsWith('/share-target')) {
    event.respondWith((async () => {
      const home = new URL('./', self.registration.scope).href;
      try {
        const form = await event.request.formData();
        const files = form.getAll('files').filter((f) => typeof f !== 'string');
        const cache = await caches.open(CACHE);
        for (const k of await cache.keys()) await cache.delete(k);
        let i = 0;
        for (const f of files) {
          await cache.put(
            new Request(new URL('shared-file-' + i, self.registration.scope).href),
            new Response(f, {
              headers: {
                'Content-Type': f.type || 'application/octet-stream',
                'X-File-Name': encodeURIComponent(f.name || 'shared.xlsx')
              }
            })
          );
          i++;
        }
        return Response.redirect(home + '?shared=' + i, 303);
      } catch (err) {
        return Response.redirect(home, 303);
      }
    })());
  }
});
