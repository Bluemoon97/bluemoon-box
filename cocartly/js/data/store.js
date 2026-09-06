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

    const defaultStores = [

        /*
         日本
        */

        {
            name: "イオンスタイル品川シーサイド",
            typeId: "supermarket",
            country: "JP",
            region: "東京都",
            city: "品川区"
        },

        {
            name: "ライフ セントラルスクエア恵比寿ガーデンプレイス店",
            typeId: "supermarket",
            country: "JP",
            region: "東京都",
            city: "渋谷区"
        },

        {
            name: "万代 渋川店",
            typeId: "supermarket",
            country: "JP",
            region: "大阪府",
            city: "東大阪市"
        },

        {
            name: "業務スーパー 新宿大久保店",
            typeId: "discount",
            country: "JP",
            region: "東京都",
            city: "新宿区"
        },

        {
            name: "コープみらい コープ戸山店",
            typeId: "supermarket",
            country: "JP",
            region: "東京都",
            city: "新宿区"
        },

        {
            name: "ロピア 平井島忠ホームズ店",
            typeId: "supermarket",
            country: "JP",
            region: "東京都",
            city: "江戸川区"
        },

        {
            name: "MEGAドン・キホーテ渋谷本店",
            typeId: "discount",
            country: "JP",
            region: "東京都",
            city: "渋谷区"
        },

        {
            name: "コストコ 川崎倉庫店",
            typeId: "warehouse-club",
            country: "JP",
            region: "神奈川県",
            city: "川崎市"
        },


        /*
         アメリカ
        */

        {
            name: "Walmart Bentonville S Walton Blvd Supercenter",
            typeId: "discount",
            country: "US",
            region: "Arkansas",
            city: "Bentonville"
        },

        {
            name: "Target Manhattan Herald Square",
            typeId: "discount",
            country: "US",
            region: "New York",
            city: "New York"
        },

        {
            name: "Costco Seattle Warehouse",
            typeId: "warehouse-club",
            country: "US",
            region: "Washington",
            city: "Seattle"
        },


        /*
         カナダ
        */

        {
            name: "Walmart Toronto Downsview Supercenter",
            typeId: "discount",
            country: "CA",
            region: "Ontario",
            city: "Toronto"
        },

        {
            name: "Costco Downsview Warehouse",
            typeId: "warehouse-club",
            country: "CA",
            region: "Ontario",
            city: "Toronto"
        },


        /*
         オーストラリア
        */

        {
            name: "Woolworths Town Hall",
            typeId: "supermarket",
            country: "AU",
            region: "New South Wales",
            city: "Sydney"
        },

        {
            name: "Coles World Square",
            typeId: "supermarket",
            country: "AU",
            region: "New South Wales",
            city: "Sydney"
        },

        {
            name: "Costco Lidcombe Warehouse",
            typeId: "warehouse-club",
            country: "AU",
            region: "New South Wales",
            city: "Sydney"
        },


        /*
         韓国
        */

        {
            name: "E-Mart Wangsimni",
            typeId: "supermarket",
            country: "KR",
            region: "서울특별시",
            city: "성동구"
        },

        {
            name: "Lotte Mart Seoul Station",
            typeId: "supermarket",
            country: "KR",
            region: "서울특별시",
            city: "중구"
        },

        {
            name: "Costco Yangjae Warehouse",
            typeId: "warehouse-club",
            country: "KR",
            region: "서울특별시",
            city: "서초구"
        },


        /*
         中国
        */

        {
            name: "Walmart Shanghai",
            typeId: "supermarket",
            country: "CN",
            region: "上海市",
            city: "上海市"
        },

        {
            name: "Costco Minhang Warehouse",
            typeId: "warehouse-club",
            country: "CN",
            region: "上海市",
            city: "闵行区"
        },


        /*
         台湾
        */

        {
            name: "PX Mart Taipei",
            typeId: "supermarket",
            country: "TW",
            region: "臺北市",
            city: "中正區"
        },

        {
            name: "Costco Neihu Warehouse",
            typeId: "warehouse-club",
            country: "TW",
            region: "臺北市",
            city: "內湖區"
        }

    ];


    for (const defaultStore of defaultStores) {

        /*
         同じ国・同じ購入先が
         すでに存在するか確認
        */

        const exists =
            stores.some(
                store => {

                    const storeCountry =
                        store.country || "JP";

                    return (
                        store.name ===
                        defaultStore.name &&
                        storeCountry ===
                        defaultStore.country
                    );

                }
            );


        /*
         すでに存在する場合は
         追加しない
        */

        if (exists) {

            continue;

        }


        /*
         初期購入先を追加
        */

        addStore(
            createStore(
                defaultStore.name,
                defaultStore.typeId,
                defaultStore.country,
                defaultStore.region,
                defaultStore.city
            )
        );

    }

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
     旧データを現在の形式へ修正
    
     店舗名変更も先に行い、
     同じ店舗を重複追加しないようにする
    */

    migrateStoreData();


    /*
     不足している
     デフォルト購入先を作成
    */

    createDefaultStores();


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

    /*
     購入先管理画面で国・地域を変更したら
     登録済み購入先を切り替える
    */

    const cmbStoreMasterCountry =
        document.getElementById(
            "cmbStoreMasterCountry"
        );

    if (cmbStoreMasterCountry) {

        cmbStoreMasterCountry.addEventListener(
            "change",
            displayStores
        );

    }

}

