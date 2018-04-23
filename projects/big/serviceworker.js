var cachename = "Cookbook Cache";
var filesToCache = [
    "./",
    "./material-components-web.css",
    "./material-components-web.js",
    "./index.html",
    "./cooking.mp4",
    "./js/d3pie.js",
    "./js/database.js",
    "./js/events.js",
    "./js/geolocation.js"
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(cachename)
        .then(function(cache) {
            console.log('Opened cache');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            // Cache hit - return response
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cachename) {
                    return caches.delete(key);
                }
            }));
        })
    );
});
