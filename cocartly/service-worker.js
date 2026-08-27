/* ==========================================
   Cocartly Service Worker
   ========================================== */

/*
 キャッシュ構造そのものを変更した時だけ
 このバージョンを変更する
*/

const CACHE_NAME =
    "cocartly-v2";


/* ==========================================
   オフライン用 基本ファイル
   ========================================== */

const APP_FILES = [

    "./",
    "./index.html",

    "./manifest.webmanifest",

    "./css/style.css",

    "./js/data/maker.js",
    "./js/data/category.js",
    "./js/data/product.js",
    "./js/data/store.js",
    "./js/data/price.js",

    "./js/history.js",
    "./js/router.js",
    "./js/app.js",

    "./js/lib/zxing.min.js",

    "./js/barcode/code.js",
    "./js/barcode/barcode.js",
    "./js/barcode/qrcode.js",

    "./js/api/productApi.js",

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
                .then(
                    () => {

                        return self.skipWaiting();

                    }
                )

        );

    }
);


/* ==========================================
   有効化
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
                .then(
                    () => {

                        return self.clients.claim();

                    }
                )

        );

    }
);


/* ==========================================
   通信処理

   オンライン
   → ネットから最新版を取得
   → キャッシュも最新版へ更新

   オフライン
   → 保存済みキャッシュを使用
   ========================================== */

self.addEventListener(
    "fetch",
    (event) => {

        /*
         GET以外は処理しない
        */

        if (
            event.request.method !==
            "GET"
        ) {

            return;

        }


        /*
         Cocartly自身のファイルだけを
         Service Workerで管理する
        */

        const requestUrl =
            new URL(
                event.request.url
            );

        if (
            requestUrl.origin !==
            self.location.origin
        ) {

            return;

        }


        event.respondWith(

            fetch(
                event.request
            )
                .then(
                    (networkResponse) => {

                        /*
                         正常に取得できた場合
                         キャッシュも更新する
                        */

                        if (
                            networkResponse &&
                            networkResponse.ok
                        ) {

                            const responseCopy =
                                networkResponse.clone();

                            caches
                                .open(CACHE_NAME)
                                .then(
                                    (cache) => {

                                        cache.put(
                                            event.request,
                                            responseCopy
                                        );

                                    }
                                );

                        }


                        return networkResponse;

                    }
                )
                .catch(
                    () => {

                        /*
                         オフライン時は
                         キャッシュから取得
                        */

                        return caches.match(
                            event.request
                        );

                    }
                )

        );

    }
);