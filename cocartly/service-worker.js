/* ==========================================
   Cocartly Service Worker
   ========================================== */

const CACHE_NAME = "cocartly-v1";


/*
 キャッシュする基本ファイル
*/

const APP_FILES = [

    "./",
    "./index.html",
    "./css/style.css",

    "./js/data/maker.js",
    "./js/data/category.js",
    "./js/data/product.js",
    "./js/data/store.js",
    "./js/data/price.js",

    "./js/history.js",
    "./js/router.js",
    "./js/app.js",

    "./images/cocartly-logo.png",
    "./images/cocartly-icon-192.png",
    "./images/cocartly-icon-512.png",
    "./images/apple-touch-icon.png"

];


/* ==========================================
   インストール
   ========================================== */

self.addEventListener(
    "install",
    (event) => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    (cache) => {

                        return cache.addAll(
                            APP_FILES
                        );

                    }
                )

        );

    }
);


/* ==========================================
   キャッシュから取得
   ========================================== */

self.addEventListener(
    "fetch",
    (event) => {

        event.respondWith(

            caches
                .match(event.request)
                .then(
                    (response) => {

                        return (
                            response ||
                            fetch(event.request)
                        );

                    }
                )

        );

    }
);


/* ==========================================
   古いキャッシュを削除
   ========================================== */

self.addEventListener(
    "activate",
    (event) => {

        event.waitUntil(

            caches
                .keys()
                .then(
                    (cacheNames) => {

                        return Promise.all(

                            cacheNames
                                .filter(
                                    (cacheName) => {

                                        return (
                                            cacheName !==
                                            CACHE_NAME
                                        );

                                    }
                                )
                                .map(
                                    (cacheName) => {

                                        return caches.delete(
                                            cacheName
                                        );

                                    }
                                )

                        );

                    }
                )

        );

    }
);