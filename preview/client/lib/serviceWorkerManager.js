// Save/load from cache (used by SW)
// run SW
// import serviceWorker from '../serviceWorker.js';

let CACHE_NAME = "preview-cache";

export default class ServiceWorkerManager {
  constructor() {
    if ('serviceWorker' in navigator) {
      // navigator.serviceWorker.register(window.PREVIEW_SERVICE_WORKER_URL, { scope: '/' });
      navigator.serviceWorker.register('http://localhost:9080/serviceWorker.js', { scope: '/' })
        .then(registration => {
          // console.error('registration', registration)
        })
        .catch(error => {
          console.error('registration error', error)
        });
    } else {
      // TODO: replace message
      throw new Error("Not supported navigator.serviceWorker: old browser or not HTTPS?");
    }
  }

  static instance() {
    if (!this._instance) {
      this._instance = new ServiceWorkerManager();
    }
    return this._instance;
  }

  string2response(filepath, text) {
    let extension = filepath.match(/\.([^.]+)$/);
    extension = extension && extension[1];
    let typeMap = {
      'js': 'application/javascript',
      'json': 'application/json',
      'html': 'text/html',
      'css': 'text/css',
      'txt': 'text/plain'
    };

    let type = typeMap[extension] || 'text/plain'; // default type is text/plain
    let blob = new Blob([text], { type });
    let contentType = `${type}${type.match('text|javascript|json|css') ? ';charset=utf-8' : ''}`;

    return new Response(blob, {
      headers: {
        'Content-Type': contentType,
      },
    })
  }

  // NOTE: we should work only with service worker in "ready" status!
  async ready() {
    return await navigator.serviceWorker.ready;
  }

  async clearCache (name) {
    return await caches.delete(name); // clear old data
  }

  async saveSandboxResourcesToCache (resources) {
    const isCacheCleared = await this.clearCache(CACHE_NAME);

    // NOTE: just keep it for debug purpose. Maybe we should delete it in future...
    if (isCacheCleared) console.error(`Cache "${CACHE_NAME}" was successfully cleared`);

    const cache = await caches.open(CACHE_NAME);

    for (let [filepath, resource] of Object.entries(resources)) {
      // console.error('resource', resource);

      const response = typeof resource === 'string'
        ? this.string2response(filepath, resource)
        : new Response(...resource);

      await cache.put(filepath, response)
    }

    return cache;
  }

  async saveSandboxToCache(sandbox) {
    await caches.delete(CACHE_NAME); // clear old data
    let cache = await caches.open(CACHE_NAME);

    let jobs = [];

    for (const [filepath, response] of Object.entries(sandbox)) {
      if (typeof response == 'string') {
        response = this.string2response(filepath, response);
      } else {
        response = new Response(...response);
      }

      jobs.push(cache.put(filepath, response));
    }

    await Promise.all(jobs);
  }

}
