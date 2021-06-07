
const CACHE_NAME = "version-0.1.00";

//const urlsToCache = ["index.html", "offline.html"];
const urlsToCache = []
const self = this;

const unregisterServiceWorker = () => {
  if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
          registration.unregister();
      });
  }
}

unregisterServiceWorker()


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log(`[serviceworker] opened cache ${CACHE_NAME}`);
      return cache.addAll(urlsToCache);
    })
  );
});



self.addEventListener("fetch", (event) => {
    event.respondWith(
      caches.match(event.request).then(() => {
        return fetch(event.request).catch(() => caches.match("offline.html"));
      })
    );
  });


  // self.addEventListener("activate", event => {
  //   event.waitUntil(
  //     caches.keys().then(keyList => {
  //       return Promise.all(
  //         keyList.map(key => {
  //           if (key !== CACHE_NAME) {
  //             return caches.delete(key);
  //           }
  //         })
  //       );
  //     })
  //   );
  //   console.log("app worker {{.Version}} is activated");
  // });


  self.addEventListener("activate", (event) => {
    const cacheWhitelist = [];
    cacheWhitelist.push(CACHE_NAME);
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName))
              console.log(`[serviceworker] delete cache ${cacheName}`);
              return caches.delete(cacheName);
          })
        );
      })
    );
  });