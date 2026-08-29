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

function createStore(
    name,
    typeId = "other",
    country = "JP",
    region = "",
    city = ""
) {

    return {

        id: createStoreId(),

        name: name,

        typeId: typeId,

        /*
         国・地域情報

         country
         → JP / US / CA / AU / KR / CN / TW / OTHER

         region
         → 都道府県・州・省など

         city
         → 市区町村など
        */

        country: country,

        region: region,

        city: city,

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
   購入先名取得
   ========================================== */

function getStoreName(storeId) {

    if (!storeId) {

        return "-";

    }

    const store = stores.find(

        store =>
            store.id === storeId

    );

    if (!store) {

        return "-";

    }

    return store.name;

}

/* ==========================================
   購入先種類名取得
   ========================================== */

function getStoreTypeName(typeId) {

    const storeTypes = {

        supermarket: "スーパー",

        convenience: "コンビニ・売店",

        drugstore: "ドラッグストア",

        discount: "ディスカウントストア",

        "warehouse-club": "会員制倉庫店",

        "fixed-price": "100円・均一価格店",

        "home-center": "ホームセンター",

        "department-mall": "百貨店・ショッピングモール",

        clothing: "衣料品店",

        electronics: "家電量販店",

        "gas-station": "ガソリンスタンド併設店",

        specialty: "専門店",

        online: "通販・オンライン",

        subscription: "定期購入",

        vending: "自動販売機",

        other: "その他"

    };

    return storeTypes[typeId] || "その他";

}

/* ==========================================
   購入先表示名取得
   ========================================== */

function getStoreDisplayName(storeId) {

    if (!storeId) {

        return "-";

    }

    const store = stores.find(

        store =>
            store.id === storeId

    );

    if (!store) {

        return "-";

    }

    const typeName =
        getStoreTypeName(
            store.typeId || "other"
        );

    return `${store.name}（${typeName}）`;

}

/* ==========================================
   購入先コンボボックス読込
   ========================================== */

function populateStoreCombo() {

    const cmbStore =
        document.getElementById("cmbStore");

    const cmbStoreCountry =
        document.getElementById(
            "cmbStoreCountry"
        );

    if (!cmbStore) {

        return;

    }


    /*
     現在選択されている国・地域

     国・地域欄がない場合は
     日本を初期値として使用
    */

    const selectedCountry =
        cmbStoreCountry
            ? cmbStoreCountry.value
            : "JP";


    /*
     購入先を初期化
    */

    cmbStore.innerHTML =
        '<option value="">購入先を選択してください</option>';


    /*
     選択した国・地域の
     購入先だけを表示
    */

    for (const store of stores) {

        if (!store.active) {

            continue;

        }


        /*
         旧データは日本として扱う
        */

        const storeCountry =
            store.country || "JP";


        if (
            storeCountry !==
            selectedCountry
        ) {

            continue;

        }


        const option =
            document.createElement(
                "option"
            );

        const typeName =
            getStoreTypeName(
                store.typeId || "other"
            );

        option.value =
            store.id;

        option.textContent =
            `${store.name}（${typeName}）`;

        cmbStore.appendChild(
            option
        );

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
   既存購入先データ修正
   ========================================== */

function migrateStoreData() {

    const storeTypeMap = {

        "イオン": "supermarket",

        "ライフ": "supermarket",

        "万代": "supermarket",

        "業務スーパー": "discount",

        "コープ": "supermarket",

        "ロピア": "supermarket",

        "ドン・キホーテ": "discount",

        "コストコ": "warehouse-club"

    };

    const hiddenDefaultNames = [

        "ドラッグストア",

        "その他"

    ];

    let changed = false;

    for (const store of stores) {

        /*
         旧データに国・地域情報がない場合は
         日本の購入先として移行
        */

        if (!store.country) {

            store.country = "JP";

            store.updatedAt =
                new Date().toISOString();

            changed = true;

        }

        if (store.region === undefined) {

            store.region = "";

            store.updatedAt =
                new Date().toISOString();

            changed = true;

        }

        if (store.city === undefined) {

            store.city = "";

            store.updatedAt =
                new Date().toISOString();

            changed = true;

        }


        /*
         購入先名として曖昧な旧データを非表示
        */

        if (hiddenDefaultNames.includes(store.name)) {

            if (store.active !== false) {

                store.active = false;

                store.updatedAt =
                    new Date().toISOString();

                changed = true;

            }

            continue;

        }

        /*
         既存購入先へ正しい種類を設定
        */

        const correctType =
            storeTypeMap[store.name];

        if (
            correctType &&
            store.typeId !== correctType
        ) {

            store.typeId =
                correctType;

            store.updatedAt =
                new Date().toISOString();

            changed = true;

        } else if (!store.typeId) {

            store.typeId =
                "other";

            store.updatedAt =
                new Date().toISOString();

            changed = true;

        }

    }

    if (changed) {

        saveStores();

    }

}

/* ==========================================
   購入先初期化
   ========================================== */

function initializeStores() {

    /*
     保存済み購入先を読み込む
    */

    loadStores();


    /*
     購入先が1件もない場合だけ
     デフォルト購入先を作成
    */

    createDefaultStores();


    /*
     旧データを現在の形式へ修正
    */

    migrateStoreData();


    /*
     商品登録画面の購入先を更新
    */

    populateStoreCombo();

    /*
     国・地域を変更したら
     購入先を切り替える
    */

    const cmbStoreCountry =
        document.getElementById(
            "cmbStoreCountry"
        );

    if (cmbStoreCountry) {

        cmbStoreCountry.addEventListener(
            "change",
            populateStoreCombo
        );

    }

}

