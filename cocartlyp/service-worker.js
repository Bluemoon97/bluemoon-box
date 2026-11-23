/* ==========================================
   Cocartly Service Worker
   ========================================== */

/*
 キャッシュ構造を変更した時や、
 PWAへ最新版を確実に反映させたい時に
 このバージョンを変更する
*/

const CACHE_NAME =
    "cocartly-v47-receipt-contrast-review";


/* ==========================================
   オフライン用 基本ファイル
   ========================================== */

const APP_FILES = [

    "./",
    "./index.html",

    "./manifest.webmanifest",

    "./css/style.css",

    "./js/lib/cocartly-html.js",

    "./js/data/maker.js",
    "./js/data/category.js",
    "./js/data/cocartly-owner-storage.js",
    "./js/data/product.js",
    "./js/data/store.js",
    "./js/data/price.js",

    "./js/history.js",
    "./js/router.js",
    "./js/i18n.js",
    "./js/app.js",

    "./js/cloud/cloud-config.js",
    "./js/cloud/cloud-auth.js",
    "./js/cloud/cloud-sync.js",
    "./js/cloud/premium-device-test.js",
    "./js/cloud/cocartly-store-repair.js",
    "./js/cloud/cocartly-data-recovery.js",

    "./js/lib/zxing.min.js",

    "./js/barcode/code.js",
    "./js/barcode/barcode.js",
    "./js/barcode/qrcode.js",

    "./js/api/productApi.js",
    "./js/receipt/labels.js",
    "./js/receipt/models.js",
    "./js/receipt/app.js",
    "./js/lib/receipt-ocr/tesseract.min.js",
    "./js/lib/receipt-ocr/worker.min.js",
    "./js/lib/receipt-ocr/tesseract-core-lstm.wasm.js",

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
                                            cacheName.startsWith("cocartly-") &&
                                            cacheName !== CACHE_NAME
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


        // Cache only this app's static files. Never cache diagnostic pages,
        // callback query strings, downloads or authenticated API responses.
        const staticUrls = new Set(APP_FILES.map(file => new URL(file, self.location.href).href));
        if (requestUrl.search || !staticUrls.has(requestUrl.href) || event.request.headers.has("authorization")) {
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
                            networkResponse.ok &&
                            !/\b(?:private|no-store)\b/i.test(networkResponse.headers.get("cache-control") || "")
                        ) {

                            const responseCopy =
                                networkResponse.clone();

                            event.waitUntil(caches
                                .open(CACHE_NAME)
                                .then(
                                    (cache) => {

                                        return cache.put(
                                            event.request,
                                            responseCopy
                                        );

                                    }
                                ).catch(() => { /* Keep the successful network response if cache storage fails. */ }));

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