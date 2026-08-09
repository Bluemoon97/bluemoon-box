/* ==========================================
   Shopping Support
   Version 0.1.0

   app.js

   アプリ初期設定
   ========================================== */

"use strict";

/* ==========================================
   編集中商品ID
   ========================================== */

let editingProductId = null;

/* ==========================================
   購入予定
   ========================================== */

const SHOPPING_STORAGE_KEY =
    "cocartlyShoppingItems";

let shoppingItems =
    loadShoppingItems();

let pendingShoppingItemId =
    null;

/* ==========================================
   編集中店舗ID
   ========================================== */

let editingStoreId = null;

/* ==========================================
   編集中商品ジャンルID
   ========================================== */

let editingCategoryId = null;

/* ==========================================
   マスター管理画面を開いた元の画面
   ========================================== */

let masterReturnScreen = "settings";

/* ==========================================
   今回の購入 一時入力保存
   ========================================== */

let priceRecordTempStoreId = "";
let priceRecordTempPrice = "";
let priceRecordTempQuantity = "1";

/* ==========================================
   商品登録画面の選択値保持
   ========================================== */

let productSelectedCategoryId = "";

let productSelectedStoreId = "";

/* ==========================================
   アプリ起動
   ========================================== */

/*
  ページの読み込みが完了したら実行する。

  Version 0.1.0では、
  ボタンが正しく取得できるかを確認するだけ。

  将来ここに
  ・データ読込
  ・設定読込
  ・画面初期化
  などを追加していく。
*/

document.addEventListener("DOMContentLoaded", initializeApp);

/* ==========================================
   初期化
   ========================================== */

function initializeApp() {

    console.log("Shopping Support 起動");

    loadProducts();

    loadCategories();

    createDefaultCategories();

    initializeStores();

    loadPriceHistory();

    setupButtons();

    displayCategorySelect();

    displayProducts();

}

/* ==========================================
   購入予定 読み込み
   ========================================== */

function loadShoppingItems() {

    try {

        const saved =
            localStorage.getItem(
                SHOPPING_STORAGE_KEY
            );

        if (!saved) {

            return [];

        }

        const data =
            JSON.parse(saved);

        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        console.error(
            "購入予定読み込みエラー：",
            error
        );

        return [];

    }

}


/* ==========================================
   購入予定 保存
   ========================================== */

function saveShoppingItems() {

    localStorage.setItem(

        SHOPPING_STORAGE_KEY,

        JSON.stringify(
            shoppingItems
        )

    );

}


/* ==========================================
   購入予定 商品選択肢
   ========================================== */

function displayShoppingProductOptions() {

    const select =
        document.getElementById(
            "cmbShoppingProduct"
        );

    if (!select) {

        return;

    }

    const currentValue =
        select.value;

    select.innerHTML = `

        <option value="">
            商品を選択してください
        </option>

    `;

    for (const product of products) {

        if (!product.active) {

            continue;

        }

        const option =
            document.createElement(
                "option"
            );

        option.value =
            product.id;

        option.textContent =
            product.name;

        select.appendChild(
            option
        );

    }

    if (
        currentValue &&
        products.some(
            product =>
                product.id === currentValue
        )
    ) {

        select.value =
            currentValue;

    }

}


/* ==========================================
   購入予定を追加
   ========================================== */

function addShoppingItem() {

    const select =
        document.getElementById(
            "cmbShoppingProduct"
        );

    const quantityInput =
        document.getElementById(
            "txtShoppingQuantity"
        );

    const message =
        document.getElementById(
            "shoppingMessage"
        );

    const productId =
        select.value;

    const quantity =
        Number(
            quantityInput.value
        );


    if (productId === "") {

        message.textContent =
            "商品を選択してください。";

        select.focus();

        return;

    }


    if (
        !Number.isFinite(quantity) ||
        quantity < 1
    ) {

        message.textContent =
            "数量は1以上で入力してください。";

        quantityInput.focus();

        return;

    }


    /*
     同じ商品がすでに予定にある場合
    */

    const existing =
        shoppingItems.find(

            item =>
                item.productId ===
                productId

        );

    if (existing) {

        existing.quantity =
            quantity;

        existing.updatedAt =
            new Date().toISOString();

    } else {

        shoppingItems.push({

            id:
                "shopping-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .slice(2, 8),

            productId:
                productId,

            quantity:
                quantity,

            createdAt:
                new Date().toISOString()

        });

    }


    saveShoppingItems();

    select.value = "";

    quantityInput.value = "1";

    message.textContent =
        "購入予定に追加しました。";

    displayShoppingItems();

}


/* ==========================================
   購入予定一覧表示
   ========================================== */

function displayShoppingItems() {

    const list =
        document.getElementById(
            "shoppingList"
        );

    if (!list) {

        return;

    }

    list.innerHTML = "";


    if (shoppingItems.length === 0) {

        list.innerHTML = `

            <p class="shopping-empty">
                購入予定の商品はありません。
            </p>

        `;

        return;

    }


    for (const item of shoppingItems) {

        const product =
            products.find(

                product =>
                    product.id ===
                    item.productId

            );

        if (!product) {

            continue;

        }


        const card =
            document.createElement(
                "div"
            );

        card.className =
            "shopping-card";


        card.innerHTML = `

            <div class="shopping-card-info">

                <strong>
                    ${product.name}
                </strong>

                <span>
                    予定数量：
                    ${item.quantity}
                </span>

            </div>


            <button
                type="button"
                class="shopping-buy-button"
                onclick="openShoppingProductDecision('${item.id}')">

                価格を確認・購入する

            </button>


            <button
                type="button"
                class="shopping-delete-button"
                onclick="removeShoppingItem('${item.id}')">

                予定から削除

            </button>

        `;


        list.appendChild(
            card
        );

    }

}


/* ==========================================
   購入予定から商品判断画面へ
   ========================================== */

function openShoppingProductDecision(
    itemId
) {

    const item =
        shoppingItems.find(

            item =>
                item.id === itemId

        );

    if (!item) {

        return;

    }

    pendingShoppingItemId =
        item.id;

    openRegisteredJanInfo(

        item.productId,

        "shopping"

    );

}


/* ==========================================
   購入予定から削除
   ========================================== */

function removeShoppingItem(
    itemId
) {

    shoppingItems =
        shoppingItems.filter(

            item =>
                item.id !== itemId

        );

    saveShoppingItems();

    displayShoppingItems();

}


/* ==========================================
   購入完了した予定を削除
   ========================================== */

function completePendingShoppingItem() {

    if (!pendingShoppingItemId) {

        return;

    }

    removeShoppingItem(
        pendingShoppingItemId
    );

    pendingShoppingItemId =
        null;

}

/* ==========================================
   ボタン取得
   ========================================== */

function setupButtons() {

    const btnCode = document.getElementById("btnCode");
    const btnProduct = document.getElementById("btnProduct");
    const btnShopping = document.getElementById("btnShopping");
    const btnBackShopping = document.getElementById("btnBackShopping");
    const btnAddShopping = document.getElementById("btnAddShopping");
    const btnHistory = document.getElementById("btnHistory");
    const btnHistoryByDate = document.getElementById("btnHistoryByDate");
    const btnHistoryByProduct = document.getElementById("btnHistoryByProduct");
    const btnDeletedPriceHistory = document.getElementById("btnDeletedPriceHistory");
    const btnCheck = document.getElementById("btnCheck");
    const btnSettings = document.getElementById("btnSettings");
    const btnHomeFromProduct = document.getElementById("btnHomeFromProduct");
    const btnSaveProduct = document.getElementById("btnSaveProduct");
    const btnVolumeExample = document.getElementById("btnVolumeExample");
    const btnCloseVolumeExample = document.getElementById("btnCloseVolumeExample");

    const btnProductHelp = document.getElementById("btnProductHelp");
    const btnCloseProductHelp = document.getElementById("btnCloseProductHelp");
    const btnCloseProductHelpBottom = document.getElementById("btnCloseProductHelpBottom");

    const btnCloseRegisteredJan = document.getElementById("btnCloseRegisteredJan");
    const btnRegisteredJanPrice = document.getElementById("btnRegisteredJanPrice");
    const btnRegisteredJanSkip = document.getElementById("btnRegisteredJanSkip");
    const btnRegisteredJanEdit = document.getElementById("btnRegisteredJanEdit");

    const btnScrollTop = document.getElementById("btnScrollTop");

    const btnManageCategories = document.getElementById("btnManageCategories");
    const btnManageStores = document.getElementById("btnManageStores");
    const btnManageStoresFromPriceRecord = document.getElementById("btnManageStoresFromPriceRecord");

    const btnDeletedProducts = document.getElementById("btnDeletedProducts");
    const btnBackProduct = document.getElementById("btnBackProduct");
    const btnBackSettings = document.getElementById("btnBackSettings");
    const btnBackHistory = document.getElementById("btnBackHistory");

    const btnCategoryMaster = document.getElementById("btnCategoryMaster");
    const btnStoreMaster = document.getElementById("btnStoreMaster");

    const btnBackCategory = document.getElementById("btnBackCategory");
    const btnBackStore = document.getElementById("btnBackStore");
    const btnSaveCategory = document.getElementById("btnSaveCategory");
    const btnSaveStore = document.getElementById("btnSaveStore");
    const btnBackCode = document.getElementById("btnBackCode");
    const btnFlash = document.getElementById("btnFlash");
    const btnJanInput = document.getElementById("btnJanInput");

    const btnCancelScan = document.getElementById("btnCancelScan");

    btnCode.addEventListener("click", openCode);
    btnProduct.addEventListener("click", openProduct);
    btnShopping.addEventListener("click", openShopping);
    if (btnBackShopping) {
        btnBackShopping.addEventListener(
            "click",
            openHome
        );
    }

    if (btnAddShopping) {
        btnAddShopping.addEventListener(
            "click",
            addShoppingItem
        );
    }

    btnHistory.addEventListener("click", openHistory);
    if (btnHistoryByDate) {
        btnHistoryByDate.addEventListener(
            "click",
            () =>
                setHistoryViewMode(
                    "date"
                )
        );
    }

    if (btnHistoryByProduct) {
        btnHistoryByProduct.addEventListener(
            "click",
            () =>
                setHistoryViewMode(
                    "product"
                )
        );
    }

    if (btnDeletedPriceHistory) {
        btnDeletedPriceHistory.addEventListener(
            "click",
            displayDeletedPriceHistory
        );
    }

    btnCheck.addEventListener("click", openCheck);
    btnSettings.addEventListener("click", openSettings);
    if (btnHomeFromProduct) {
        btnHomeFromProduct.addEventListener("click", openHome);
    }
    btnSaveProduct.addEventListener("click", saveProduct);

    /* ==========================================
       商品登録 使い方
       ========================================== */

    if (btnProductHelp) {
        btnProductHelp.addEventListener(
            "click",
            () => {
                const help =
                    document.getElementById(
                        "productHelp"
                    );
                if (!help) {
                    return;
                }
                help.hidden =
                    !help.hidden;
            }
        );
    }


    if (btnCloseProductHelp) {
        btnCloseProductHelp.addEventListener(
            "click",
            () => {
                const help =
                    document.getElementById(
                        "productHelp"
                    );
                if (help) {
                    help.hidden = true;
                }
            }
        );
    }


    if (btnCloseProductHelpBottom) {
        btnCloseProductHelpBottom.addEventListener(
            "click",
            () => {
                const help =
                    document.getElementById(
                        "productHelp"
                    );
                if (help) {
                    help.hidden = true;
                }
            }
        );
    }

    if (btnVolumeExample) {
        btnVolumeExample.addEventListener(
            "click",
            () => {
                const example =
                    document.getElementById(
                        "volumeExample"
                    );
                if (!example) {
                    return;
                }
                example.hidden =
                    !example.hidden;
            }
        );
    }

    if (btnCloseVolumeExample) {
        btnCloseVolumeExample.addEventListener(
            "click",
            () => {
                const example =
                    document.getElementById(
                        "volumeExample"
                    );
                if (example) {
                    example.hidden = true;
                }
            }
        );
    }

    /* ==========================================
       登録済みJAN確認
       ========================================== */

    if (btnCloseRegisteredJan) {
        btnCloseRegisteredJan.addEventListener(
            "click",
            closeRegisteredJanInfo
        );
    }

    if (btnRegisteredJanPrice) {
        btnRegisteredJanPrice.addEventListener(
            "click",
            recordRegisteredJanPrice
        );
    }

    if (btnRegisteredJanSkip) {
        btnRegisteredJanSkip.addEventListener(
            "click",
            skipRegisteredJanPurchase
        );
    }

    if (btnRegisteredJanEdit) {
        btnRegisteredJanEdit.addEventListener(
            "click",
            editRegisteredJanProduct
        );
    }

    /* 先頭へ戻る */

    if (btnScrollTop) {
        btnScrollTop.addEventListener(
            "click",
            () => {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        );
    }

    btnManageCategories.addEventListener(
        "click",
        openCategoryMasterFromProduct
    );

    btnManageStores.addEventListener(
        "click",
        openStoreMasterFromProduct
    );

    if (btnManageStoresFromPriceRecord) {
        btnManageStoresFromPriceRecord.addEventListener(
            "click",
            () => {
                openStoreMasterFromPriceRecord();
            }
        );
    }

    btnManageCategories.addEventListener(
        "click",
        openCategoryMaster
    );

    btnDeletedProducts.addEventListener("click", openDeletedProducts);
    btnBackProduct.addEventListener("click", backProduct);
    btnBackSettings.addEventListener("click", openHome);
    btnBackHistory.addEventListener("click", openHome);

    btnCategoryMaster.addEventListener("click", openCategoryMaster);
    btnStoreMaster.addEventListener("click", openStoreMaster);

    btnBackCategory.addEventListener("click", backFromMasterScreen);
    btnBackStore.addEventListener("click", backFromMasterScreen);

    btnSaveCategory.addEventListener("click", saveCategory);
    btnSaveStore.addEventListener("click", saveStore);
    btnBackCode.addEventListener("click", backHomeFromCode);
    btnCancelScan.addEventListener("click", backHomeFromCode);
    btnFlash.addEventListener("click", toggleFlash);
    btnJanInput.addEventListener("click", openJanInput);
}

/* ==========================================
   先頭へ戻るボタン表示制御
   ========================================== */

function updateScrollTopButton() {

    const button =
        document.getElementById(
            "btnScrollTop"
        );

    if (!button) {

        return;

    }

    /*
     300px以上スクロールしたら表示
    */

    button.hidden =
        window.scrollY < 300;

}


/* ==========================================
   スクロール監視
   ========================================== */

window.addEventListener(

    "scroll",

    updateScrollTopButton,

    {
        passive: true
    }

);

/* ==========================================
   ボタン処理
   ========================================== */

function openBarcode() {

    changeScreen("バーコード読取");

}

function openProduct() {

    changeScreen("商品登録");

}

/*
 購入先簡易追加欄を初期化
*/

const storeQuickAdd =
    document.getElementById("storeQuickAdd");

const cmbQuickStoreType =
    document.getElementById("cmbQuickStoreType");

const txtQuickStore =
    document.getElementById("txtQuickStore");

if (storeQuickAdd) {

    storeQuickAdd.hidden = true;

}

if (cmbQuickStoreType) {

    cmbQuickStoreType.selectedIndex = 0;

}

if (txtQuickStore) {

    txtQuickStore.value = "";

}

function openShopping() {

    hideAllScreens();

    const shoppingScreen =
        document.getElementById(
            "shoppingScreen"
        );

    if (!shoppingScreen) {

        return;

    }

    shoppingScreen.hidden =
        false;

    displayShoppingProductOptions();

    displayShoppingItems();

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

function openHistory() {

    changeScreen("履歴・価格比較");

    displayPriceHistory();

}

function openCheck() {

    changeScreen("お出かけチェック");

}

/* ==========================================
   マスター管理画面から戻る
   ========================================== */

function backFromMasterScreen() {

    hideAllScreens();

    /*
     商品登録画面から管理画面を開いた場合
    */

    if (masterReturnScreen === "product") {

        document.getElementById("productScreen").hidden =
            false;

        /*
         管理画面で追加・変更した候補を
         選択ボックスへ再表示
        */

        displayCategorySelect();

        populateStoreCombo();

        /*
         商品ジャンルの選択値を戻す
        */

        const cmbCategory =
            document.getElementById("cmbCategory");

        if (
            cmbCategory &&
            productSelectedCategoryId
        ) {

            const categoryExists =
                Array.from(cmbCategory.options).some(

                    option =>
                        option.value ===
                        productSelectedCategoryId

                );

            if (categoryExists) {

                cmbCategory.value =
                    productSelectedCategoryId;

            }

        }

        /*
         購入先の選択値を戻す
        */

        const cmbStore =
            document.getElementById("cmbStore");

        if (
            cmbStore &&
            productSelectedStoreId
        ) {

            const storeExists =
                Array.from(cmbStore.options).some(

                    option =>
                        option.value ===
                        productSelectedStoreId

                );

            if (storeExists) {

                cmbStore.value =
                    productSelectedStoreId;

            }

        }

        return;

    }


    /*
     今回の購入画面から
     購入先管理を開いた場合
    */

    if (
        masterReturnScreen ===
        "priceRecord"
    ) {

        if (!recordingProductId) {

            openHome();

            return;

        }


        /*
         今回の購入画面を再表示
        */

        openPriceRecord(
            recordingProductId
        );


        /*
         購入先を戻す
        */

        const cmbPriceRecordStore =
            document.getElementById(
                "cmbPriceRecordStore"
            );

        if (
            cmbPriceRecordStore &&
            priceRecordTempStoreId
        ) {

            const storeExists =
                Array.from(
                    cmbPriceRecordStore.options
                ).some(

                    option =>
                        option.value ===
                        priceRecordTempStoreId

                );

            if (storeExists) {

                cmbPriceRecordStore.value =
                    priceRecordTempStoreId;

            }

        }


        /*
         今回価格を戻す
        */

        const txtPriceRecordPrice =
            document.getElementById(
                "txtPriceRecordPrice"
            );

        if (txtPriceRecordPrice) {

            txtPriceRecordPrice.value =
                priceRecordTempPrice;

        }


        /*
         購入数量を戻す
        */

        const txtPriceRecordQuantity =
            document.getElementById(
                "txtPriceRecordQuantity"
            );

        if (txtPriceRecordQuantity) {

            txtPriceRecordQuantity.value =
                priceRecordTempQuantity || "1";

        }


        return;

    }


    /*
     設定画面から管理画面を開いた場合
    */

    document.getElementById(
        "settingsScreen"
    ).hidden = false;

}

function saveProduct() {

    const txtProductName = document.getElementById("txtProductName");
    const txtJanCode = document.getElementById("txtJanCode");
    const productMessage = document.getElementById("productMessage");

    const productName = txtProductName.value.trim();
    const janCode = txtJanCode.value.trim();

    const cmbCategory = document.getElementById("cmbCategory");
    const txtVolume = document.getElementById("txtVolume");
    const cmbUnit = document.getElementById("cmbUnit");


    const categoryId = cmbCategory.value;
    const volume = txtVolume.value.trim();
    const unit = cmbUnit.value;

    const txtPrice = document.getElementById("txtPrice");
    const price = txtPrice.value.trim();
    const cmbStore = document.getElementById("cmbStore");
    const storeId = cmbStore.value;
    /*
     内容量と単位の組み合わせチェック
    */

    if (
        volume !== "" &&
        unit === ""
    ) {

        productMessage.textContent =
            "内容量を入力した場合は、単位も選択してください。";

        cmbUnit.focus();

        return;

    }

    if (
        volume === "" &&
        unit !== ""
    ) {

        productMessage.textContent =
            "単位を選択した場合は、内容量も入力してください。";

        txtVolume.focus();

        return;

    }

    if (productName === "") {

        productMessage.textContent = "商品名を入力してください。";

        return;

    }

    if (categoryId === "") {

        productMessage.textContent =
            "商品ジャンルを選択してください。";

        document.getElementById("cmbCategory").focus();

        return;

    }

    if (storeId === "") {

        productMessage.textContent =
            "購入先を選択してください。";

        document.getElementById("cmbStore").focus();

        return;

    }

    if (
        price !== "" &&
        Number(price) < 0
    ) {

        productMessage.textContent =
            "価格は0円以上で入力してください。";

        txtPrice.focus();

        return;

    }

    let product;

    if (editingProductId === null) {

        product = {

            id: createProductId(),

            name: productName,

            janCode: janCode,

            categoryId: categoryId,

            volume: volume,

            unit: unit,

            price: price,

            storeId: storeId,

            createdAt: new Date().toISOString(),

            updatedAt: new Date().toISOString(),

            active: true

        };

        addProduct(product);

        /*
         新規商品登録時、
         購入先と価格が入力されていれば
         自動で価格履歴にも記録
        */

        if (
            storeId !== "" &&
            price !== ""
        ) {

            addPriceHistory(

                product.id,

                storeId,

                price,

                1

            );

        }

    } else {

        const oldProduct = products.find(

            p => p.id === editingProductId

        );

        product = {

            ...oldProduct,

            name: productName,

            janCode: janCode,

            categoryId: categoryId,

            volume: volume,

            unit: unit,

            price: price,

            storeId: storeId,

            updatedAt:
                new Date().toISOString()

        };

        updateProduct(product);

        editingProductId = null;

    }

    document.getElementById("txtProductName").value = "";

    document.getElementById("cmbCategory").selectedIndex = 0;

    document.getElementById("txtVolume").value = "";

    document.getElementById("cmbUnit").selectedIndex = 0;

    document.getElementById("txtPrice").value = "";

    document.getElementById("cmbStore").selectedIndex = 0;

    const volumeExample =
        document.getElementById(
            "volumeExample"
        );

    if (volumeExample) {

        volumeExample.hidden = true;

    }

    productMessage.textContent = "保存しました";

    displayProducts();

}

/* ==========================================
   登録済み商品一覧
   年月別・開閉表示
   ========================================== */

function displayProducts() {

    const productList =
        document.getElementById("productList");

    if (!productList) {

        return;

    }

    productList.innerHTML = "";

    /*
     有効な商品だけを取得し、
     登録日の新しい順へ並べる
    */

    const activeProducts = products

        .filter(product => product.active)

        .sort((productA, productB) => {

            return new Date(productB.createdAt) -
                new Date(productA.createdAt);

        });

    if (activeProducts.length === 0) {

        productList.innerHTML = `

            <p class="empty-product-message">

                登録済みの商品はありません。

            </p>

        `;

        return;

    }

    /*
     登録年月ごとに商品をまとめる
     キーの例：2026-08
    */

    const monthlyProducts = {};

    for (const product of activeProducts) {

        const createdDate =
            new Date(product.createdAt);

        /*
         登録日のない旧データにも対応
        */

        const validDate =
            Number.isNaN(createdDate.getTime())
                ? new Date()
                : createdDate;

        const monthKey =

            validDate.getFullYear() +

            "-" +

            String(
                validDate.getMonth() + 1
            ).padStart(2, "0");

        if (!monthlyProducts[monthKey]) {

            monthlyProducts[monthKey] = [];

        }

        monthlyProducts[monthKey].push(product);

    }

    /*
     年月を新しい順に並べる
    */

    const monthKeys =
        Object.keys(monthlyProducts).sort().reverse();

    monthKeys.forEach((monthKey, monthIndex) => {

        const [year, month] =
            monthKey.split("-");

        const monthProducts =
            monthlyProducts[monthKey];

        /*
         最新月だけ最初から開く
        */

        const isOpen =
            monthIndex === 0;

        const monthSection =
            document.createElement("section");

        monthSection.className =
            "product-month-group";

        monthSection.innerHTML = `

            <button
                type="button"
                class="product-month-header"
                aria-expanded="${isOpen}"
                onclick="toggleProductMonth(this)">

                <span class="product-month-arrow">

                    ${isOpen ? "▼" : "▶"}

                </span>

                <span class="product-month-title">

                    ${Number(year)}年${Number(month)}月

                </span>

                <span class="product-month-count">

                    ${monthProducts.length}件

                </span>

            </button>

            <div
                class="product-month-content"
                ${isOpen ? "" : "hidden"}>

            </div>

        `;

        const monthContent =
            monthSection.querySelector(
                ".product-month-content"
            );

        for (const product of monthProducts) {

            const createdDate =
                new Date(product.createdAt);

            const validDate =
                Number.isNaN(createdDate.getTime())
                    ? new Date()
                    : createdDate;

            const dateText =

                validDate.getFullYear() +

                "/" +

                String(
                    validDate.getMonth() + 1
                ).padStart(2, "0") +

                "/" +

                String(
                    validDate.getDate()
                ).padStart(2, "0");

            const productCard =
                document.createElement("div");

            productCard.className =
                "product-card";

            productCard.innerHTML = `

                <h3>${product.name}</h3>

                <p>
                    <span class="product-label">JAN</span>
                    <span class="product-value">
                        ${product.janCode || "-"}
                    </span>
                </p>

                <p>
                    <span class="product-label">商品ジャンル</span>
                    <span class="product-value">
                        ${getCategoryName(product.categoryId)}
                    </span>
                </p>

                <p>
                    <span class="product-label">購入先</span>
                    <span class="product-value">
                        ${getStoreDisplayName(product.storeId)}
                    </span>
                </p>

                <p>
                    <span class="product-label">内容量</span>
                    <span class="product-value">
                        ${product.volume || "-"}${product.unit || ""}
                    </span>
                </p>

                <p>
                    <span class="product-label">価格</span>
                    <span class="product-value">
                        ¥${product.price || "-"}
                    </span>
                </p>

                <p>
                    <span class="product-label">登録日</span>
                    <span class="product-value">
                        ${dateText}
                    </span>
                </p>

                <div class="product-buttons">

                    <button
                        type="button"
                        class="product-price-button"
                        onclick="openRegisteredJanInfo('${product.id}', 'product')">

                        価格を確認・購入する

                    </button>

                    <div class="product-sub-buttons">

                        <button
                            type="button"
                            class="product-edit-button"
                            onclick="editProduct('${product.id}')">

                            ✏ 編集

                        </button>

                        <button
                            type="button"
                            class="product-delete-button"
                            onclick="deleteProduct('${product.id}')">

                            🗑 削除

                        </button>

                    </div>

                </div>

            `;

            monthContent.appendChild(productCard);

        }

        productList.appendChild(monthSection);

    });

}

/* ==========================================
   商品年月グループ開閉
   ========================================== */

function toggleProductMonth(button) {

    const monthGroup =
        button.closest(".product-month-group");

    if (!monthGroup) {

        return;

    }

    const content =
        monthGroup.querySelector(
            ".product-month-content"
        );

    const arrow =
        button.querySelector(
            ".product-month-arrow"
        );

    if (!content || !arrow) {

        return;

    }

    const willOpen =
        content.hidden;

    content.hidden =
        !willOpen;

    arrow.textContent =
        willOpen ? "▼" : "▶";

    button.setAttribute(
        "aria-expanded",
        String(willOpen)
    );

}

/* ==========================================
   削除済みアイテム画面
   ========================================== */

function openDeletedProducts() {

    document.getElementById("productScreen").hidden = true;

    document.getElementById("deletedProductScreen").hidden = false;

    displayDeletedProducts();

}

function backProduct() {

    document.getElementById("deletedProductScreen").hidden = true;

    document.getElementById("productScreen").hidden = false;

    displayProducts();

}

/* ==========================================
   コード読取画面
   ========================================== */

function openCode() {

    document.getElementById("homeScreen").hidden = true;

    document.getElementById("codeScreen").hidden = false;

    readCode();

}

function backHomeFromCode() {

    document.getElementById("codeScreen").hidden = true;

    document.getElementById("homeScreen").hidden = false;

}

/* ==========================================
   商品情報表示
   ========================================== */

function setProductInfo(product) {

    console.log("txtProductName =", document.getElementById("txtProductName"));
    console.log("txtVolume =", document.getElementById("txtVolume"));
    console.log("cmbUnit =", document.getElementById("cmbUnit"));

    console.log(product);

    document.getElementById("txtProductName").value =
        product.name;

    document.getElementById("txtJanCode").value =
        product.janCode ||
        product.jan ||
        "";

    document.getElementById("txtVolume").value =
        product.volume;

    document.getElementById("cmbUnit").value =
        product.unit;

}

function toggleFlash() {

    alert("ライト機能は次回実装します。");

}

function openJanInput() {

    alert("JAN番号入力は次回実装します。");

}

/* ==========================================
   全画面を閉じる
   ========================================== */

function hideAllScreens() {

    const screens =
        document.querySelectorAll("#app > section");

    for (const screen of screens) {

        screen.hidden = true;

    }

}

/* ==========================================
   設定画面
   ========================================== */

function openSettings() {

    hideAllScreens();

    document.getElementById("settingsScreen").hidden =
        false;

}

/* ==========================================
   ホーム画面
   ========================================== */

function openHome() {

    hideAllScreens();

    document.getElementById("homeScreen").hidden =
        false;

}

/* ==========================================
   カテゴリー管理画面
   ========================================== */

function openCategoryMaster() {

    masterReturnScreen = "product";

    hideAllScreens();

    document.getElementById("categoryScreen").hidden =
        false;

    editingCategoryId = null;

    document.getElementById("txtCategoryName").value =
        "";

    const btnBackCategory =
        document.getElementById(
            "btnBackCategory"
        );

    if (btnBackCategory) {

        btnBackCategory.textContent =
            "← 商品登録へ";

    }

    displayCategoryList();

}

/* ==========================================
   商品登録画面から商品ジャンル管理を開く
   ========================================== */

function openCategoryMasterFromProduct() {

    const cmbCategory =
        document.getElementById("cmbCategory");

    productSelectedCategoryId =
        cmbCategory ? cmbCategory.value : "";

    masterReturnScreen = "product";

    hideAllScreens();

    document.getElementById("categoryScreen").hidden =
        false;

    editingCategoryId = null;

    document.getElementById("txtCategoryName").value =
        "";

    const btnBackCategory =
        document.getElementById(
            "btnBackCategory"
        );

    if (btnBackCategory) {

        btnBackCategory.textContent =
            "← 商品登録へ";

    }

    displayCategoryList();

}

/* ==========================================
   店舗管理画面
   ========================================== */

function openStoreMaster() {

    masterReturnScreen = "settings";

    hideAllScreens();

    document.getElementById("storeScreen").hidden =
        false;

    editingStoreId = null;

    document.getElementById("txtStoreName").value =
        "";

    document.getElementById("cmbStoreType").selectedIndex =
        0;

    document.getElementById("storeMessage").textContent =
        "";

    const btnBackStore =
        document.getElementById(
            "btnBackStore"
        );

    if (btnBackStore) {

        btnBackStore.textContent =
            "← 設定へ";

    }

    displayStores();

}

/* ==========================================
   商品登録画面から購入先管理を開く
   ========================================== */

function openStoreMasterFromProduct() {

    const cmbStore =
        document.getElementById("cmbStore");

    productSelectedStoreId =
        cmbStore ? cmbStore.value : "";

    masterReturnScreen = "product";

    hideAllScreens();

    document.getElementById("storeScreen").hidden =
        false;

    editingStoreId = null;

    document.getElementById("txtStoreName").value =
        "";

    document.getElementById("cmbStoreType").selectedIndex =
        0;

    document.getElementById("storeMessage").textContent =
        "";

    const btnBackStore =
        document.getElementById(
            "btnBackStore"
        );

    if (btnBackStore) {

        btnBackStore.textContent =
            "← 商品登録へ";

    }

    displayStores();

}

/* ==========================================
   今回の購入 → 購入先管理
   ========================================== */

function openStoreMasterFromPriceRecord() {

    /*
     今回の購入で入力中の内容を保存
    */

    const cmbPriceRecordStore =
        document.getElementById(
            "cmbPriceRecordStore"
        );

    const txtPriceRecordPrice =
        document.getElementById(
            "txtPriceRecordPrice"
        );

    const txtPriceRecordQuantity =
        document.getElementById(
            "txtPriceRecordQuantity"
        );


    priceRecordTempStoreId =
        cmbPriceRecordStore
            ? cmbPriceRecordStore.value
            : "";

    priceRecordTempPrice =
        txtPriceRecordPrice
            ? txtPriceRecordPrice.value
            : "";

    priceRecordTempQuantity =
        txtPriceRecordQuantity
            ? txtPriceRecordQuantity.value
            : "1";


    masterReturnScreen =
        "priceRecord";

    hideAllScreens();

    document.getElementById(
        "storeScreen"
    ).hidden = false;

    editingStoreId =
        null;

    document.getElementById(
        "txtStoreName"
    ).value = "";

    document.getElementById(
        "cmbStoreType"
    ).selectedIndex = 0;

    document.getElementById(
        "storeMessage"
    ).textContent = "";

    const btnBackStore =
        document.getElementById(
            "btnBackStore"
        );

    if (btnBackStore) {

        btnBackStore.textContent =
            "← 今回の購入へ";

    }

    displayStores();

}

/* ==========================================
   削除済み商品一覧
   ========================================== */

function displayDeletedProducts() {

    const deletedProductList =
        document.getElementById("deletedProductList");

    deletedProductList.innerHTML = "";

    for (const product of products) {

        if (product.active) {

            continue;

        }

        const createdDate = new Date(product.createdAt);

        const dateText =
            createdDate.getFullYear() + "/" +
            String(createdDate.getMonth() + 1).padStart(2, "0") + "/" +
            String(createdDate.getDate()).padStart(2, "0");

        deletedProductList.innerHTML += `

        <div class="product-card">

            <h3>${product.name}</h3>

            <p><span class="product-label">JAN</span><span class="product-value">${product.janCode || "-"}</span></p>

            <p><span class="product-label">商品ジャンル</span><span class="product-value">${product.categoryId}</span></p>

            <p><span class="product-label">内容量</span><span class="product-value">${product.volume}${product.unit}</span></p>

            <p><span class="product-label">価格</span><span class="product-value">¥${product.price || "-"}</span></p>

            <p><span class="product-label">購入先</span><span class="product-value">${getStoreDisplayName(product.storeId)}</span></p>

            <p><span class="product-label">登録日</span><span class="product-value">${dateText}</span></p>

            <div class="product-buttons">

                <button onclick="restoreProduct('${product.id}')">
                    ♻ 復元
             </button>

            </div>

        </div>

        `;

    }

}

/* ==========================================
   商品編集
   ========================================== */

function editProduct(productId) {

    const product = products.find(

        p => p.id === productId

    );

    if (!product) {

        return;

    }

    editingProductId = product.id;


    /*
     商品登録画面を表示
    */

    hideAllScreens();

    document.getElementById(
        "productScreen"
    ).hidden = false;


    /*
     商品情報を入力欄へ反映
    */

    document.getElementById(
        "txtProductName"
    ).value =
        product.name || "";

    document.getElementById(
        "txtJanCode"
    ).value =
        product.janCode || product.jan || "";

    document.getElementById(
        "cmbCategory"
    ).value =
        product.categoryId || "";

    document.getElementById(
        "txtVolume"
    ).value =
        product.volume || "";

    document.getElementById(
        "cmbUnit"
    ).value =
        product.unit || "";

    document.getElementById(
        "txtPrice"
    ).value =
        product.price || "";

    document.getElementById(
        "cmbStore"
    ).value =
        product.storeId || "";

    document.getElementById(
        "productMessage"
    ).textContent =
        "編集モードです。保存すると商品情報を更新します。";


    /*
     商品登録画面の先頭へ
    */

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

/* ==========================================
   商品削除
   ========================================== */

function deleteProduct(productId) {

    if (!confirm("削除しますか？")) {

        return;

    }

    const product = products.find(

        p => p.id === productId

    );

    if (!product) {

        return;

    }

    product.active = false;

    product.updatedAt = new Date().toISOString();

    saveProducts();

    displayProducts();

    displayDeletedProducts();

}

/* ==========================================
   商品復元
   ========================================== */

function restoreProduct(productId) {

    const product = products.find(

        p => p.id === productId

    );

    if (!product) {

        return;

    }

    product.active = true;

    product.updatedAt = new Date().toISOString();

    saveProducts();

    // 商品一覧更新
    displayProducts();

    // 削除済み一覧更新
    displayDeletedProducts();

}

/* ==========================================
   購入先登録・更新
   ========================================== */

function saveStore() {

    const txtStoreName =
        document.getElementById("txtStoreName");

    const cmbStoreType =
        document.getElementById("cmbStoreType");

    const storeMessage =
        document.getElementById("storeMessage");

    if (!txtStoreName || !cmbStoreType) {

        return;

    }

    const storeName =
        txtStoreName.value.trim();

    const storeTypeId =
        cmbStoreType.value;

    if (storeTypeId === "") {

        storeMessage.textContent =
            "購入先の種類を選択してください。";

        cmbStoreType.focus();

        return;

    }

    if (storeName === "") {

        storeMessage.textContent =
            "購入先名を入力してください。";

        txtStoreName.focus();

        return;

    }

    const duplicateStore = stores.find(

        store =>

            store.active &&

            store.name.toLowerCase() ===
            storeName.toLowerCase() &&

            store.id !== editingStoreId

    );

    if (duplicateStore) {

        storeMessage.textContent =
            "同じ購入先が既に登録されています。";

        return;

    }

    if (editingStoreId === null) {

        const store =
            createStore(
                storeName,
                storeTypeId
            );

        addStore(store);

        storeMessage.textContent =
            "購入先を保存しました。";

    } else {

        const store =
            findStore(editingStoreId);

        if (!store) {

            storeMessage.textContent =
                "編集する購入先が見つかりません。";

            editingStoreId = null;

            return;

        }

        const updatedStore = {

            ...store,

            name: storeName,

            typeId: storeTypeId

        };

        updateStore(updatedStore);

        editingStoreId = null;

        storeMessage.textContent =
            "購入先を更新しました。";

    }

    txtStoreName.value = "";

    cmbStoreType.selectedIndex = 0;

    populateStoreCombo();

    displayStores();

}

/* ==========================================
   店舗編集
   ========================================== */

function editStore(storeId) {

    const store =
        findStore(storeId);

    if (!store) {

        return;

    }

    editingStoreId = store.id;

    document.getElementById("txtStoreName").value =
        store.name;

    document.getElementById("cmbStoreType").value =
        store.typeId || "other";

    document.getElementById("storeMessage").textContent =
        "編集モードです。保存すると更新されます。";

    document.getElementById("txtStoreName").focus();

}

/* ==========================================
   店舗一覧表示
   ========================================== */

function displayStores() {

    const storeList = document.getElementById("storeList");

    if (!storeList) {

        return;

    }

    storeList.innerHTML = "";

    for (const store of stores) {

        if (!store.active) {

            continue;

        }

        storeList.innerHTML += `

        <div class="master-card">

            <div class="store-master-info">

                <strong>${store.name}</strong>

                <small>

                    🏷
                    ${getStoreTypeName(store.typeId || "other")}

                </small>

            </div>

            <div class="master-buttons">

                ${isDefaultStore(store.name)

                ?

                `
                    <span class="master-protected">
                        変更不可
                    </span>
                    `

                :

                `
                    <button onclick="editStore('${store.id}')">

                        ✏ 編集

                    </button>

                    <button onclick="deleteStoreData('${store.id}')">

                        🗑 削除

                    </button>
                    `

            }

            </div>

        </div>

        `;

    }

}

/* ==========================================
   店舗削除
   ========================================== */

function deleteStoreData(storeId) {

    if (!confirm("この店舗を削除しますか？")) {

        return;

    }

    deleteStore(storeId);

    populateStoreCombo();

    displayStores();

}

/* ==========================================
   簡易追加欄の表示切替
   ========================================== */

function toggleQuickAdd(targetId, inputId) {

    const target =
        document.getElementById(targetId);

    const input =
        document.getElementById(inputId);

    if (!target) {

        return;

    }

    target.hidden = !target.hidden;

    if (!target.hidden && input) {

        input.focus();

    }

}

/* ==========================================
   メーカー簡易追加
   ========================================== */

function quickAddMaker() {

    const input =
        document.getElementById("txtQuickMaker");

    const message =
        document.getElementById("productMessage");

    const name =
        input ? input.value.trim() : "";

    if (name === "") {

        if (message) {

            message.textContent =
                "メーカー名を入力してください。";

        }

        return;

    }

    const duplicate = makers.find(

        maker =>

            maker.active &&

            maker.name.toLowerCase() ===
            name.toLowerCase()

    );

    /*
     登録済みメーカーの場合
    */

    if (duplicate) {

        displayMakerSelect();

        document.getElementById("cmbMaker").value =
            duplicate.id;

        input.value = "";

        document.getElementById(
            "makerQuickAdd"
        ).hidden = true;

        if (message) {

            message.textContent =
                "登録済みのメーカーを選択しました。";

        }

        return;

    }

    /*
     addMakerへ文字列だけ渡す
    */

    addMaker(name);

    displayMakerSelect();

    /*
     追加されたメーカーを探して自動選択
    */

    const addedMaker = makers.find(

        maker =>

            maker.active &&

            maker.name.toLowerCase() ===
            name.toLowerCase()

    );

    if (addedMaker) {

        document.getElementById("cmbMaker").value =
            addedMaker.id;

    }

    input.value = "";

    document.getElementById(
        "makerQuickAdd"
    ).hidden = true;

    if (message) {

        message.textContent =
            "メーカーを追加して選択しました。";

    }

}

/* ==========================================
   カテゴリー簡易追加
   ========================================== */

function quickAddCategory() {

    const input =
        document.getElementById("txtQuickCategory");

    const message =
        document.getElementById("productMessage");

    const name =
        input ? input.value.trim() : "";

    if (name === "") {

        message.textContent =
            "商品ジャンルを入力してください。";

        return;

    }

    const duplicate = categories.find(

        category =>

            category.active &&

            category.name.toLowerCase() ===
            name.toLowerCase()

    );

    if (duplicate) {

        displayCategorySelect();

        document.getElementById("cmbCategory").value =
            duplicate.id;

        input.value = "";

        document.getElementById(
            "categoryQuickAdd"
        ).hidden = true;

        message.textContent =
            "登録済みの商品ジャンルを選択しました。";

        return;

    }

    addCategory(name);

    displayCategorySelect();

    const addedCategory = categories.find(

        category =>
            category.active &&
            category.name.toLowerCase() ===
            name.toLowerCase()

    );

    if (addedCategory) {

        document.getElementById("cmbCategory").value =
            addedCategory.id;

    }

    input.value = "";

    document.getElementById(
        "categoryQuickAdd"
    ).hidden = true;

    message.textContent =
        "商品ジャンルを追加しました。";

}

/* ==========================================
   購入先簡易追加
   ========================================== */

function quickAddStore() {

    const input =
        document.getElementById("txtQuickStore");

    const typeSelect =
        document.getElementById("cmbQuickStoreType");

    const message =
        document.getElementById("productMessage");

    const name =
        input ? input.value.trim() : "";

    const typeId =
        typeSelect ? typeSelect.value : "";

    if (typeId === "") {

        message.textContent =
            "購入先の種類を選択してください。";

        if (typeSelect) {

            typeSelect.focus();

        }

        return;

    }

    if (name === "") {

        message.textContent =
            "購入先名を入力してください。";

        if (input) {

            input.focus();

        }

        return;

    }

    const duplicate = stores.find(

        store =>

            store.active &&

            store.name.toLowerCase() ===
            name.toLowerCase()

    );

    /*
     同じ購入先が登録済みの場合
    */

    if (duplicate) {

        populateStoreCombo();

        document.getElementById("cmbStore").value =
            duplicate.id;

        input.value = "";

        typeSelect.selectedIndex = 0;

        document.getElementById(
            "storeQuickAdd"
        ).hidden = true;

        message.textContent =
            "登録済みの購入先を選択しました。";

        return;

    }

    /*
     新しい購入先を作成
    */

    const store =
        createStore(
            name,
            typeId
        );

    addStore(store);

    /*
     商品登録画面の選択枠を更新
    */

    populateStoreCombo();

    document.getElementById("cmbStore").value =
        store.id;

    /*
     入力欄を初期化
    */

    input.value = "";

    typeSelect.selectedIndex = 0;

    document.getElementById(
        "storeQuickAdd"
    ).hidden = true;

    message.textContent =
        "購入先を追加して選択しました。";

}

/* ==========================================
   標準商品ジャンル判定
   ========================================== */

function isDefaultCategory(categoryName) {

    const defaultCategoryNames = [

        "食品",
        "飲料",
        "お菓子",
        "お酒",
        "日用品",
        "洗剤・衛生用品",
        "医薬品",
        "化粧品・美容",
        "衣料品",
        "ベビー用品",
        "ペット用品",
        "文具・雑貨",
        "家電・電池",
        "その他"

    ];

    return defaultCategoryNames.includes(
        categoryName
    );

}

/* ==========================================
   初期購入先判定
   ========================================== */

function isDefaultStore(storeName) {

    const defaultStoreNames = [

        "イオン",
        "ライフ",
        "万代",
        "業務スーパー",
        "コープ",
        "ロピア",
        "ドン・キホーテ",
        "コストコ"

    ];

    return defaultStoreNames.includes(
        storeName
    );

}
