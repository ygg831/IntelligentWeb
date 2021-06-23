
let version = 'offline-cache-v2';
let cacheUrls = [
    '/javascripts/index.js',
    '/javascripts/canvas.js',
    '/javascripts/database.js',
    '/stylesheets/style.css',
]

self.addEventListener('install',function (e) {
    //check update
    e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate',function (e) {
    e.waitUntil(
        Promise.all([
            self.clients.claim(),
            //delete old version
            caches.keys().then(function (cacheList) {
                return Promise.all(
                    cacheList.map(function (cacheName) {
                        if(cacheName!== version){
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});

self.addEventListener('fetch',function (e) {
    console.log('url is',e.request.url)
    e.respondWith(
        caches.match(e.request).then(function (cacheRes) {
            if(cacheRes){
                return cacheRes;
            }
            var request = e.request.clone();

            return fetch(request).then(function (httpRes) {
                if(!httpRes || httpRes.status !== 200){
                    return httpRes;
                }
                let responseClone = httpRes.clone();
                caches.open('offline-cache-v1').then(function (cache) {
                    cache.put(e.request, responseClone);
                });
                if(cacheUrls.findIndex(e.request.url)!==-1){
                  responseClone = httpRes.clone();
                  caches.open('offline-cache-v1').then(function (cache) {
                      cache.put(e.request, responseClone);
                  }
                    );
                }
                return httpRes;
            });
        })
    );
})
