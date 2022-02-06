//create two caches
const APP_PREFIX = 'budget-site-cache-';
const VERSION = 'v1';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    "./index.html",
    "./events.html",
    "./tickets.html",
    "./schedule.html",
    "./assets/css/style.css",
    "./assets/css/bootstrap.css",
    "./assets/css/tickets.css",
    "./dist/app.bundle.js",
    "./dist/events.bundle.js",
    "./dist/tickets.bundle.js",
    "./dist/schedule.bundle.js"
];

self.addEventListener('install', function (evt) {
	evt.waitUntil(
		caches.open(CACHE_NAME).then(cache => {
			console.log('Your files were pre-cached successfully!');
			return cache.addAll(FILES_TO_CACHE); //add file to cache
		})
	);

	self.skipWaiting();
});

self.addEventListener('activate', function (evt) {
	evt.waitUntil(
		caches.keys().then(keyList => {
			return Promise.all(
				keyList.map(key => {
					if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
						console.log('Removing old cache data', key);
						return caches.delete(key);
					}
				})
			);
		})
	);
	self.clients.claim();
});

self.addEventListener('fetch', function (evt) {
	if (evt.request.url.includes('/api/')) {
		evt.respondWith(
			caches
				.open(DATA_CACHE_NAME) 
				.then(cache => {
					return fetch(evt.request) 
						.then(response => {
							if (response.status === 200) {
								cache.put(evt.request.url, response.clone());
							return response; //return it to the user
						})
						.catch(err => {
							return cache.match(evt.request);
						});
				})
				.catch(err => console.log(err))
		);
		return;
	}

	evt.respondWith(
		fetch(evt.request).catch(function () {
			return caches.match(evt.request).then(function (response) {
				if (response) {
					return response;
				} else if (evt.request.headers.get('accept').includes('text/html')) {
					return caches.match('/');
				}
			});
		})
	);
});
