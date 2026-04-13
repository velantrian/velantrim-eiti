// VELANTRIM EITI — Service Worker v12.0
// v12.0: EITI Memory (Personal Storage), \x08 regex fix

const CACHE_NAME = 'eiti-cache-v12.0';
const SW_VERSION = '12.0';
const TRANSFORMERS_CACHE = 'eiti-transformers-v1'; // отвязан от версии — модели не перекачиваются при обновлении UI
const TRANSFORMERS_CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 дней

// v10.4 FIX: require-corp нужно для SharedArrayBuffer (Transformers.js WASM multi-thread)
function addCoopHeaders(response, request) {
    if (!response || response.type === 'opaque') return response;
    var isCrossOrigin = request && new URL(request.url).origin !== location.origin;
    var h = new Headers(response.headers);
    if (!isCrossOrigin) {
        h.set('Cross-Origin-Opener-Policy', 'same-origin');
    }
    h.set('Cross-Origin-Embedder-Policy', 'require-corp');
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: h
    });
}

var ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './sql-wasm.js',
    './sql-wasm.wasm',
    './eiti_kb.json',
    './lemma.json',
    './mosc_graph.json',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', function(e) {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS).catch(function(err) {
                console.warn('[SW v12.0] Cache addAll partial fail:', err);
            });
        })
    );
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) {
                    return k !== CACHE_NAME && k !== TRANSFORMERS_CACHE;
                }).map(function(k) {
                    console.log('[SW v12.0] Deleting old cache:', k);
                    return caches.delete(k);
                })
            );
        }).then(function() { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function(e) {
    var url = e.request.url;

    // Transformers.js модели — долгосрочный кэш с TTL
    if (url.includes('cdn-lfs') || url.includes('huggingface.co') || url.includes('xenova') || url.includes('transformers')) {
        e.respondWith(
            caches.open(TRANSFORMERS_CACHE).then(function(cache) {
                return cache.match(e.request).then(function(cached) {
                    if (cached) {
                        var dateHeader = cached.headers.get('sw-cached-date');
                        if (dateHeader && (Date.now() - parseInt(dateHeader)) < TRANSFORMERS_CACHE_TTL) {
                            return addCoopHeaders(cached, e.request);
                        }
                    }
                    return fetch(e.request).then(function(resp) {
                        if (resp && resp.status === 200) {
                            var headers = new Headers(resp.headers);
                            headers.set('sw-cached-date', Date.now().toString());
                            var cloned = new Response(resp.clone().body, { status: resp.status, statusText: resp.statusText, headers: headers });
                            cache.put(e.request, cloned);
                        }
                        return addCoopHeaders(resp, e.request);
                    }).catch(function() { return cached || new Response('', { status: 503 }); });
                });
            })
        );
        return;
    }

    // Основные ресурсы — cache-first
    e.respondWith(
        caches.match(e.request).then(function(cached) {
            if (cached) return addCoopHeaders(cached, e.request);
            return fetch(e.request).then(function(resp) {
                if (resp && resp.status === 200 && e.request.method === 'GET') {
                    var c = resp.clone();
                    caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, c); });
                }
                return addCoopHeaders(resp, e.request);
            }).catch(function() {
                return new Response('Offline — ресурс недоступен', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
            });
        })
    );
});

// v12.0: notificationclick — открыть/сфокусировать приложение при тапе на уведомление
self.addEventListener('notificationclick', function(e) {
    e.notification.close();
    e.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clients) {
            for (var i = 0; i < clients.length; i++) {
                if (clients[i].url.indexOf(self.registration.scope) === 0 && 'focus' in clients[i]) {
                    return clients[i].focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow('./index.html');
            }
        })
    );
});
