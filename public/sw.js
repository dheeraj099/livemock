/* LiveMock Service Worker */
'use strict';

const broadcast = new BroadcastChannel('livemock');
let routes = [];
let mockActive = true;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('message', ({ data }) => {
  if (!data) return;
  if (data.type === 'UPDATE_ROUTES') {
    routes = data.routes ?? [];
    mockActive = data.active ?? true;
  }
});

function pathToRegex(pattern) {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/:[^/]+/g, '[^/]+');
  return new RegExp('^' + escaped + '/?$');
}

function findRoute(method, url) {
  if (!mockActive) return null;
  let pathname;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return null;
  }
  return (
    routes.find(
      (r) => r.enabled && r.method === method && pathToRegex(r.path).test(pathname)
    ) ?? null
  );
}

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  let pathname;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return;
  }

  // Always skip Next.js internals and static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/__nextjs') ||
    pathname === '/favicon.ico'
  )
    return;

  const route = findRoute(event.request.method, url);
  if (!route) return;

  const start = Date.now();

  event.respondWith(
    (async () => {
      if (route.delay > 0) await new Promise((r) => setTimeout(r, route.delay));

      const responseTime = Date.now() - start;

      broadcast.postMessage({
        type: 'REQUEST_LOGGED',
        log: {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          method: event.request.method,
          url,
          matched: true,
          routeId: route.id,
          statusCode: route.statusCode,
          responseTime,
        },
      });

      const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-LiveMock': '1',
        ...route.headers,
      };

      return new Response(route.responseBody, {
        status: route.statusCode,
        headers,
      });
    })()
  );
});
