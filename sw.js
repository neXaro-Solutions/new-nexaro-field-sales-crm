const CACHE='nexaro-field-crm-v3-42';
const ASSETS=["./app.js?v=370", "./area-fix.js?v=2", "./crm-auth-ui.js", "./crm-bootstrap.js", "./icon.svg", "./index.html", "./light-theme.css?v=1", "./manifest.webmanifest", "./nexaro-config.js", "./public-lead.css", "./public-lead.html", "./public-lead.js", "./styles.css?v=380", "./sumup-advisor-clean-v2.js?v=2", "./sumup-advisor-fix.js?v=4", "./sumup-compare-ocr.js?v=1", "./sumup-crm-offer-link.js?v=4", "./sumup-direct.js?v=1", "./sumup-knowledge.js?v=1", "./sumup-offer-bridge.js?v=3", "./sumup-pricing-policy.js?v=3", "./sumup-pro.css?v=1", "./sumup-pro.js?v=1", "./sumup-solution-builder.js?v=3", "./supabase-auth.js", "./supabase-lead-sync.js", "./supabase-lead-sync.js?v=1", "./sw.js"];

const PREFIX = 'nexaro-field-crm-';
self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  await cache.addAll(ASSETS);
  await self.skipWaiting();
})()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)));
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || request.headers.has('Authorization')) return;
  const known = ASSETS.some(asset => new URL(asset, self.registration.scope).href === url.href);
  const isRoot = url.href === self.registration.scope;
  if (!known && !isRoot) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = isRoot ? new URL('./index.html', self.registration.scope).href : request;
    try {
      const response = await fetch(request);
      if (response.ok && response.type !== 'opaque') {
        try { await cache.put(key, response.clone()); } catch { /* Quota must not break online requests. */ }
      }
      return response;
    } catch {
      const cached = await cache.match(key);
      // Never return HTML for missing scripts, styles, data or API responses.
      return cached || Response.error();
    }
  })());
});
