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
    city = "",
    isDefault = false
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

        /*
         初期店舗かどうか
        
         true
         → Cocartly標準店舗
         → 編集・削除不可
        
         false
         → ユーザー追加店舗
        */
        isDefault: isDefault,

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
                        defaultStore.country &&
                        store.active !==
                        false
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
                defaultStore.city,
                true
            )
        );

    }

}

/* ==========================================
   既存購入先データ修正
   ========================================== */

function migrateStoreData() {

    /*
     ==================================================
     旧初期店舗
     ↓
     新しい固定初期店舗へ移行

     重要：
     store.id は変更しない

     そのため過去の購入履歴も
     新しい店舗名へ自動的に反映される
     ==================================================
    */

    const defaultStoreMigrationMap = {

        /*
         日本
        */

        "JP|イオン": {
            name: "イオンスタイル品川シーサイド",
            typeId: "supermarket",
            region: "東京都",
            city: "品川区"
        },

        "JP|ライフ": {
            name: "ライフ セントラルスクエア恵比寿ガーデンプレイス店",
            typeId: "supermarket",
            region: "東京都",
            city: "渋谷区"
        },

        "JP|万代": {
            name: "万代 渋川店",
            typeId: "supermarket",
            region: "大阪府",
            city: "東大阪市"
        },

        "JP|業務スーパー": {
            name: "業務スーパー 新宿大久保店",
            typeId: "discount",
            region: "東京都",
            city: "新宿区"
        },

        "JP|コープ": {
            name: "コープみらい コープ戸山店",
            typeId: "supermarket",
            region: "東京都",
            city: "新宿区"
        },

        "JP|ロピア": {
            name: "ロピア 平井島忠ホームズ店",
            typeId: "supermarket",
            region: "東京都",
            city: "江戸川区"
        },

        "JP|ドン・キホーテ": {
            name: "MEGAドン・キホーテ渋谷本店",
            typeId: "discount",
            region: "東京都",
            city: "渋谷区"
        },

        "JP|コストコ": {
            name: "コストコ 川崎倉庫店",
            typeId: "warehouse-club",
            region: "神奈川県",
            city: "川崎市"
        },


        /*
         アメリカ
        */

        "US|Walmart": {
            name: "Walmart Bentonville S Walton Blvd Supercenter",
            typeId: "discount",
            region: "Arkansas",
            city: "Bentonville"
        },

        "US|Target": {
            name: "Target Manhattan Herald Square",
            typeId: "discount",
            region: "New York",
            city: "New York"
        },

        "US|Costco": {
            name: "Costco Seattle Warehouse",
            typeId: "warehouse-club",
            region: "Washington",
            city: "Seattle"
        },


        /*
         カナダ
        */

        "CA|Walmart": {
            name: "Walmart Toronto Downsview Supercenter",
            typeId: "discount",
            region: "Ontario",
            city: "Toronto"
        },

        "CA|Costco": {
            name: "Costco Downsview Warehouse",
            typeId: "warehouse-club",
            region: "Ontario",
            city: "Toronto"
        },


        /*
         オーストラリア
        */

        "AU|Woolworths": {
            name: "Woolworths Town Hall",
            typeId: "supermarket",
            region: "New South Wales",
            city: "Sydney"
        },

        "AU|Coles": {
            name: "Coles World Square",
            typeId: "supermarket",
            region: "New South Wales",
            city: "Sydney"
        },

        "AU|Costco": {
            name: "Costco Lidcombe Warehouse",
            typeId: "warehouse-club",
            region: "New South Wales",
            city: "Sydney"
        },


        /*
         韓国
        */

        "KR|E-Mart": {
            name: "E-Mart Wangsimni",
            typeId: "supermarket",
            region: "서울특별시",
            city: "성동구"
        },

        "KR|Lotte Mart": {
            name: "Lotte Mart Seoul Station",
            typeId: "supermarket",
            region: "서울특별시",
            city: "중구"
        },

        "KR|Costco": {
            name: "Costco Yangjae Warehouse",
            typeId: "warehouse-club",
            region: "서울특별시",
            city: "서초구"
        },


        /*
         中国
        */

        "CN|Walmart": {
            name: "Walmart Shanghai",
            typeId: "supermarket",
            region: "上海市",
            city: "上海市"
        },

        "CN|Costco": {
            name: "Costco Minhang Warehouse",
            typeId: "warehouse-club",
            region: "上海市",
            city: "闵行区"
        },


        /*
         台湾
        */

        "TW|PX Mart": {
            name: "PX Mart Taipei",
            typeId: "supermarket",
            region: "臺北市",
            city: "中正區"
        },

        "TW|Costco": {
            name: "Costco Neihu Warehouse",
            typeId: "warehouse-club",
            region: "臺北市",
            city: "內湖區"
        }

    };


    /*
     新しい固定初期店舗の一覧

     すでに前回の処理で追加されている
     新初期店舗も isDefault:true にする
    */

    const newDefaultStores = [

        ["JP", "イオンスタイル品川シーサイド"],
        ["JP", "ライフ セントラルスクエア恵比寿ガーデンプレイス店"],
        ["JP", "万代 渋川店"],
        ["JP", "業務スーパー 新宿大久保店"],
        ["JP", "コープみらい コープ戸山店"],
        ["JP", "ロピア 平井島忠ホームズ店"],
        ["JP", "MEGAドン・キホーテ渋谷本店"],
        ["JP", "コストコ 川崎倉庫店"],

        ["US", "Walmart Bentonville S Walton Blvd Supercenter"],
        ["US", "Target Manhattan Herald Square"],
        ["US", "Costco Seattle Warehouse"],

        ["CA", "Walmart Toronto Downsview Supercenter"],
        ["CA", "Costco Downsview Warehouse"],

        ["AU", "Woolworths Town Hall"],
        ["AU", "Coles World Square"],
        ["AU", "Costco Lidcombe Warehouse"],

        ["KR", "E-Mart Wangsimni"],
        ["KR", "Lotte Mart Seoul Station"],
        ["KR", "Costco Yangjae Warehouse"],

        ["CN", "Walmart Shanghai"],
        ["CN", "Costco Minhang Warehouse"],

        ["TW", "PX Mart Taipei"],
        ["TW", "Costco Neihu Warehouse"]

    ];


    /*
     昔の曖昧な初期データ

     購入先としては使用しない
    */

    const hiddenDefaultNames = [

        "ドラッグストア",
        "その他"

    ];


    let changed = false;


    /*
     ==================================================
     ① 古いデータの基本形式を整える
     ==================================================
    */

    for (const store of stores) {

        if (!store.country) {

            store.country =
                "JP";

            changed =
                true;

        }


        if (
            store.region === undefined
        ) {

            store.region =
                "";

            changed =
                true;

        }


        if (
            store.city === undefined
        ) {

            store.city =
                "";

            changed =
                true;

        }


        if (
            store.isDefault ===
            undefined
        ) {

            store.isDefault =
                false;

            changed =
                true;

        }


        /*
         曖昧な旧初期店舗は
         非表示にする
        */

        if (
            hiddenDefaultNames.includes(
                store.name
            )
        ) {

            if (
                store.active !==
                false
            ) {

                store.active =
                    false;

                changed =
                    true;

            }

        }

    }


    /*
     ==================================================
     ② 古い初期店舗を
        新しい初期店舗へ変更

     store.idは変更しない
     ==================================================
    */

    for (const store of stores) {

        const storeCountry =
            store.country || "JP";


        const migrationKey =
            storeCountry +
            "|" +
            store.name;


        const migration =
            defaultStoreMigrationMap[
            migrationKey
            ];


        if (!migration) {

            continue;

        }


        store.name =
            migration.name;

        store.typeId =
            migration.typeId;

        store.region =
            migration.region;

        store.city =
            migration.city;

        store.isDefault =
            true;

        store.active =
            true;

        store.updatedAt =
            new Date()
                .toISOString();


        changed =
            true;

    }


    /*
     ==================================================
     ③ すでに追加済みの
        新しい初期店舗も固定店舗にする
     ==================================================
    */

    for (const store of stores) {

        const storeCountry =
            store.country || "JP";


        const isNewDefault =
            newDefaultStores.some(
                ([country, name]) => {

                    return (
                        country ===
                        storeCountry &&
                        name ===
                        store.name
                    );

                }
            );


        if (
            isNewDefault &&
            store.isDefault !==
            true
        ) {

            store.isDefault =
                true;

            store.updatedAt =
                new Date()
                    .toISOString();

            changed =
                true;

        }

    }


    /*
     ==================================================
     ④ 同じ新初期店舗が
        2件以上できてしまっている場合

        1件だけ残す

        古いstoreIdを優先して残す
     ==================================================
    */

    for (
        const [country, name]
        of newDefaultStores
    ) {

        const duplicatedStores =
            stores.filter(
                store => {

                    return (
                        (store.country || "JP") ===
                        country &&
                        store.name ===
                        name &&
                        store.active !==
                        false
                    );

                }
            );


        if (
            duplicatedStores.length <=
            1
        ) {

            continue;

        }


        /*
         store配列で先に存在する店舗
         ＝基本的に古いstoreId

         を残す
        */

        const keepStore =
            duplicatedStores[0];


        keepStore.isDefault =
            true;


        for (
            let i = 1;
            i < duplicatedStores.length;
            i++
        ) {

            duplicatedStores[i].active =
                false;

            duplicatedStores[i].isDefault =
                true;

            duplicatedStores[i].updatedAt =
                new Date()
                    .toISOString();

            changed =
                true;

        }

    }


    /*
     ==================================================
     保存
     ==================================================
    */

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

