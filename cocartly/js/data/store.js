"use strict";

/* ==========================================
   店舗一覧
   ========================================== */

const stores = [];

/* ==========================================
   最終店舗番号
   ========================================== */

let lastStoreNumber = 0;

/* ==========================================
   店舗ID作成
   ========================================== */

function createStoreId() {

    lastStoreNumber++;

    return "ST" + String(lastStoreNumber).padStart(6, "0");

}

/* ==========================================
   店舗追加
   ========================================== */

function addStore(store) {

    stores.push(store);

    saveStores();

}

/* ==========================================
   店舗オブジェクト作成
   ========================================== */

function createStore(name) {

    return {

        id: createStoreId(),

        name: name,

        createdAt: new Date().toISOString(),

        updatedAt: new Date().toISOString(),

        active: true

    };

}

/* ==========================================
   店舗保存
   ========================================== */

function saveStores() {

    localStorage.setItem(

        "shoppingSupportStores",

        JSON.stringify(stores)

    );

}

/* ==========================================
   店舗読込
   ========================================== */

function loadStores() {

    const data = localStorage.getItem(

        "shoppingSupportStores"

    );

    if (data === null) {

        return;

    }

    const list = JSON.parse(data);

    stores.length = 0;

    stores.push(...list);

    if (stores.length > 0) {

        const lastId = stores[stores.length - 1].id;

        lastStoreNumber = Number(lastId.replace("ST", ""));

    }

}

/* ==========================================
   店舗検索
   ========================================== */

function findStore(storeId) {

    return stores.find(

        store => store.id === storeId

    );

}

/* ==========================================
   店舗更新
   ========================================== */

function updateStore(updatedStore) {

    const index = stores.findIndex(

        store => store.id === updatedStore.id

    );

    if (index === -1) {

        return false;

    }

    updatedStore.updatedAt = new Date().toISOString();

    stores[index] = updatedStore;

    saveStores();

    return true;

}

/* ==========================================
   店舗削除（論理削除）
   ========================================== */

function deleteStore(storeId) {

    const store = stores.find(

        store => store.id === storeId

    );

    if (!store) {

        return;

    }

    store.active = false;

    store.updatedAt = new Date().toISOString();

    saveStores();

}

/* ==========================================
   店舗復元
   ========================================== */

function restoreStore(storeId) {

    const store = stores.find(

        store => store.id === storeId

    );

    if (!store) {

        return;

    }

    store.active = true;

    store.updatedAt = new Date().toISOString();

    saveStores();

}

/* ==========================================
   店舗名取得
   ========================================== */

function getStoreName(storeId) {

    if (!storeId) {

        return "-";

    }

    const store = stores.find(

        store =>

            store.id === storeId &&

            store.active

    );

    if (!store) {

        return "-";

    }

    return store.name;

}

/* ==========================================
   店舗コンボボックス読込
   ========================================== */

function populateStoreCombo() {

    const cmbStore = document.getElementById("cmbStore");

    if (!cmbStore) {

        return;

    }

    cmbStore.innerHTML =

        '<option value="">選択してください</option>';

    for (const store of stores) {

        if (!store.active) {

            continue;

        }

        cmbStore.innerHTML +=

            `<option value="${store.id}">

                ${store.name}

            </option>`;

    }

}

/* ==========================================
   初期店舗作成
   ========================================== */

function createDefaultStores() {

    if (stores.length > 0) {

        return;

    }

    addStore(createStore("イオン"));

    addStore(createStore("ライフ"));

    addStore(createStore("万代"));

    addStore(createStore("業務スーパー"));

    addStore(createStore("コープ"));

    addStore(createStore("ロピア"));

    addStore(createStore("ドン・キホーテ"));

    addStore(createStore("コストコ"));

    addStore(createStore("ドラッグストア"));

    addStore(createStore("その他"));

}

/* ==========================================
   店舗初期化
   ========================================== */

function initializeStores() {

    loadStores();

    createDefaultStores();

    populateStoreCombo();

}

