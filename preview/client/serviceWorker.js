
let CACHE_NAME = 'preview-cache';

self.addEventListener('install', async (event) => {
  self.skipWaiting(); // don't wait for old worker version to unload
});


self.addEventListener('activate', function(event) {

  self.clients.claim();
  event.waitUntil(clearOldCaches());
  // console.log('ACTIVATED', event);
});


// Delete caches except the latest cache
async function clearOldCaches() {
  let keys = await caches.keys();
  
  for(let key of keys) {
    if (key != CACHE_NAME) {
      await caches.delete(key);
    }
  }
}


self.addEventListener('fetch', (event) => {
  event.respondWith(respond(event));
});

async function respond(event) {
  let cache = await caches.open(CACHE_NAME);

  let response = await cache.match(event.request);
  if (response) {
    // console.log("SW response", event.request, response);
    
    return response;
  } else {
    let response = fetch(event.request);
    // just fetch, no caching

    console.log("FETCH", event.request)
    //cache.put(event.request, (await response).clone());


    return response;
  }

}
