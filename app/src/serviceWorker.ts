import { manifest, version } from '@parcel/service-worker';

self.addEventListener('install', (e: Event) => {
  return (e as ExtendableEvent).waitUntil(async () => {
    const cache = await caches.open(version);
    await cache.addAll(manifest);
  });
});

self.addEventListener('activate', (e: Event) => {
  return (e as ExtendableEvent).waitUntil(async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map(key => key !== version && caches.delete(key))
    );
  });
});

self.addEventListener('fetch', (e: Event) => {
  const event = e as FetchEvent;
  return event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      const parsedUrl = new URL(event.request.url);
      let path = parsedUrl.pathname;
      // Don't cache the /healthy endpoint
      if (event.request.method === 'GET' && (path.indexOf('healthy') < 0)) {
        const cache = await caches.open(version);
        cache.put(event.request, response.clone());
      }
      return response;
    } catch(err: unknown) {
      return await caches.match(event.request) || new Response("url:./index.html");
    }
  })());
});
