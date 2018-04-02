var dataCacheName = 'weatherData-v1';
var cacheName = 'weatherPWA-step-6-1';
var filesToCache = [
  'https://it202spr2018-mkim288.c9users.io/projects/p4/',
  'https://it202spr2018-mkim288.c9users.io/projects/p4/index.html',
  'https://it202spr2018-mkim288.c9users.io/projects/p4/scripts/app.js',
  'https://it202spr2018-mkim288.c9users.io/projects/p4/styles/inline.css',
  'https://it202spr2018-mkim288.c9users.io/projects/p4/images/clear.png',
  'https://it202spr2018-mkim288.c9users.io/projects/p4/images/cloudy-scattered-showers.png',
  'https://it202spr2018-mkim288.c9users.io/projects/p4/images/cloudy.png',
  'https://it202spr2018-mkim288.c9users.io/projects/p4/images/fog.png',
  'https://it202spr2018-mkim288.c9users.io/projects/p4/images/ic_add_white_24px.svg',
  'https://it202spr2018-mkim288.c9users.io/projects/p4/images/ic_refresh_white_24px.svg',
  'https://it202spr2018-mkim288.c9users.io/projects/p4/images/partly-cloudy.png',
  'https://it202spr2018-mkim288.c9users.io/projects/p4/images/rain.png',
  'https://it202spr2018-mkim288.c9users.io/projects/p4/images/scattered-showers.png',
  'https://it202spr2018-mkim288.c9users.io/projects/p4/images/sleet.png',
  'https://it202spr2018-mkim288.c9users.io/projects/p4/images/snow.png',
  'https://it202spr2018-mkim288.c9users.io/projects/p4/images/thunderstorm.png',
  'https://it202spr2018-mkim288.c9users.io/projects/p4/images/wind.png'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
  if (e.request.url.indexOf(dataUrl) > -1) {
    /*
     * When the request URL contains dataUrl, the app is asking for fresh
     * weather data. In this case, the service worker always goes to the
     * network and then caches the response. This is called the "Cache then
     * network" strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
     */
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
     */
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});