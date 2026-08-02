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

    loadMakers();

    loadCategories();

    createDefaultCategories();

    initializeStores();

    setupButtons();

    displayMakerSelect();

    displayCategorySelect();

    displayProducts();

}

/* ==========================================
   ボタン取得
   ========================================== */

function setupButtons() {

    const btnCode = document.getElementById("btnCode");
    const btnProduct = document.getElementById("btnProduct");
    const btnShopping = document.getElementById("btnShopping");
    const btnHistory = document.getElementById("btnHistory");
    const btnCheck = document.getElementById("btnCheck");
    const btnSettings = document.getElementById("btnSettings");
    const btnHomeFromProduct = document.getElementById("btnHomeFromProduct");
    const btnSaveProduct = document.getElementById("btnSaveProduct");
    const btnShowMakerInput = document.getElementById("btnShowMakerInput");
    const btnQuickSaveMaker = document.getElementById("btnQuickSaveMaker");

    const btnManageCategories = document.getElementById("btnManageCategories");
    const btnManageStores = document.getElementById("btnManageStores");

    const btnDeletedProducts = document.getElementById("btnDeletedProducts");
    const btnBackProduct = document.getElementById("btnBackProduct");
    const btnBackSettings = document.getElementById("btnBackSettings");
    const btnMakerMaster = document.getElementById("btnMakerMaster");
    const btnCategoryMaster = document.getElementById("btnCategoryMaster");
    const btnStoreMaster = document.getElementById("btnStoreMaster");
    const btnBackMaker = document.getElementById("btnBackMaker");
    const btnBackCategory = document.getElementById("btnBackCategory");
    const btnBackStore = document.getElementById("btnBackStore");
    const btnSaveMaker = document.getElementById("btnSaveMaker");
    const btnSaveCategory = document.getElementById("btnSaveCategory");
    const btnSaveStore = document.getElementById("btnSaveStore");
    const btnBackCode = document.getElementById("btnBackCode");
    const btnFlash = document.getElementById("btnFlash");
    const btnJanInput = document.getElementById("btnJanInput");
    const btnCancelScan = document.getElementById("btnCancelScan");

    btnCode.addEventListener("click", openCode);
    btnProduct.addEventListener("click", openProduct);
    btnShopping.addEventListener("click", openShopping);
    btnHistory.addEventListener("click", openHistory);
    btnCheck.addEventListener("click", openCheck);
    btnSettings.addEventListener("click", openSettings);
    if (btnHomeFromProduct) {
        btnHomeFromProduct.addEventListener("click", openHome);
    }
    btnSaveProduct.addEventListener("click", saveProduct);

    btnManageCategories.addEventListener(
        "click",
        openCategoryMasterFromProduct
    );

    btnManageStores.addEventListener(
        "click",
        openStoreMasterFromProduct
    );

    btnShowMakerInput.addEventListener(

        "click",

        () => toggleQuickAdd(
            "makerQuickAdd",
            "txtQuickMaker"
        )

    );

    btnQuickSaveMaker.addEventListener(
        "click",
        quickAddMaker
    );

    btnManageCategories.addEventListener(
        "click",
        openCategoryMaster
    );

    btnDeletedProducts.addEventListener("click", openDeletedProducts);
    btnBackProduct.addEventListener("click", backProduct);
    btnBackSettings.addEventListener("click", openHome);
    btnMakerMaster.addEventListener("click", openMakerMaster);
    btnCategoryMaster.addEventListener("click", openCategoryMaster);
    btnStoreMaster.addEventListener("click", openStoreMaster);
    btnBackMaker.addEventListener("click", openSettings);

    btnBackCategory.addEventListener("click", backFromMasterScreen);
    btnBackStore.addEventListener("click", backFromMasterScreen);

    btnSaveMaker.addEventListener("click", saveMaker);
    btnSaveCategory.addEventListener("click", saveCategory);
    btnSaveStore.addEventListener("click", saveStore);
    btnBackCode.addEventListener("click", backHomeFromCode);
    btnCancelScan.addEventListener("click", backHomeFromCode);
    btnFlash.addEventListener("click", toggleFlash);
    btnJanInput.addEventListener("click", openJanInput);
}

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

    changeScreen("購入予定");

}

function openHistory() {

    changeScreen("履歴・価格比較");

}

function openCheck() {

    changeScreen("お出かけチェック");

}

function openSettings() {

    changeScreen("設定");

}

function openHome() {

    changeScreen("ホーム");

}

/* ==========================================
   マスター管理画面から戻る
   ========================================== */

function backFromMasterScreen() {

    document.getElementById("categoryScreen").hidden =
        true;

    document.getElementById("storeScreen").hidden =
        true;

    if (masterReturnScreen === "product") {

        document.getElementById("productScreen").hidden =
            false;

        /*
         管理画面で追加・変更した内容を
         商品登録画面へ反映
        */

        displayCategorySelect();

        populateStoreCombo();

        return;

    }

    document.getElementById("settingsScreen").hidden =
        false;

}

function saveProduct() {

    const txtProductName = document.getElementById("txtProductName");
    const txtJanCode = document.getElementById("txtJanCode");
    const productMessage = document.getElementById("productMessage");

    const productName = txtProductName.value.trim();
    const janCode = txtJanCode.value.trim();
    const cmbMaker = document.getElementById("cmbMaker");
    const cmbCategory = document.getElementById("cmbCategory");
    const txtVolume = document.getElementById("txtVolume");
    const cmbUnit = document.getElementById("cmbUnit");

    const makerId = cmbMaker.value;
    const categoryId = cmbCategory.value;
    const volume = txtVolume.value.trim();
    const unit = cmbUnit.value;

    const txtPrice = document.getElementById("txtPrice");
    const price = txtPrice.value.trim();
    const cmbStore = document.getElementById("cmbStore");
    const storeId = cmbStore.value;

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

    let product;

    if (editingProductId === null) {

        product = {

            id: createProductId(),

            name: productName,

            janCode: janCode,

            makerId: makerId,

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

    } else {

        const oldProduct = products.find(

            p => p.id === editingProductId

        );

        product = {

            ...oldProduct,

            name: productName,

            janCode: janCode,

            makerId: makerId,

            categoryId: categoryId,

            volume: volume,

            unit: unit,

            price: price,

            storeId: storeId

        };

        updateProduct(product);

        editingProductId = null;

    }

    document.getElementById("txtProductName").value = "";

    document.getElementById("cmbMaker").selectedIndex = 0;

    document.getElementById("cmbCategory").selectedIndex = 0;

    document.getElementById("txtVolume").value = "";

    document.getElementById("cmbUnit").selectedIndex = 0;

    document.getElementById("txtPrice").value = "";

    document.getElementById("cmbStore").selectedIndex = 0;

    productMessage.textContent = "保存しました";

    displayProducts();

}

/* ==========================================
   商品一覧表示
   ========================================== */

function displayProducts() {

    const productList = document.getElementById("productList");

    productList.innerHTML = "";

    for (const product of products) {

        if (!product.active) {

            continue;

        }

        const createdDate = new Date(product.createdAt);

        const dateText =
            createdDate.getFullYear() + "/" +
            String(createdDate.getMonth() + 1).padStart(2, "0") + "/" +
            String(createdDate.getDate()).padStart(2, "0");

        productList.innerHTML += `

        <div class="product-card">

            <h3>${product.name}</h3>

            <p>
               <span class="product-label">JAN</span>
               <span class="product-value">
                   ${product.janCode || "-"}
               </span>
            </p>

            <p><span class="product-label">メーカー</span><span class="product-value">${getMakerName(product.makerId)}</span></p>

            <p><span class="product-label">商品ジャンル</span><span class="product-value">${getCategoryName(product.categoryId)}</span></p>

            <p><span class="product-label">内容量</span><span class="product-value">${product.volume}${product.unit}</span></p>

            <p><span class="product-label">価格</span><span class="product-value">¥${product.price || "-"}</span></p>

            <p><span class="product-label">購入先</span><span class="product-value">${getStoreDisplayName(product.storeId)}</span></p>

            <p><span class="product-label">登録日</span><span class="product-value">${dateText}</span></p>

            <div class="product-buttons">

                ${product.active
                ?

                `
                    <button onclick="editProduct('${product.id}')">
                        ✏ 編集
                    </button>

                    <button onclick="deleteProduct('${product.id}')">
                        🗑 削除
                    </button>
                    `

                :

                `
                    <button onclick="restoreProduct('${product.id}')">
                        復元
                    </button>
                    `
            }

            </div>

        </div>

               `;

    }

    const deletedCount = products.filter(

        product => !product.active

    ).length;

    document.getElementById("btnDeletedProducts").textContent =
        `🗑 削除済みアイテム（${deletedCount}）`;

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
    console.log("cmbMaker =", document.getElementById("cmbMaker"));
    console.log("cmbUnit =", document.getElementById("cmbUnit"));

    console.log(product);

    console.log("makers =", makers);

    console.log("makerId =", product.makerId);

    document.getElementById("txtProductName").value =
        product.name;

    document.getElementById("txtJanCode").value =
        product.janCode ||
        product.jan ||
        "";

    document.getElementById("cmbMaker").value =
        product.makerId;

    console.log(
        "現在選択中 =",
        document.getElementById("cmbMaker").value
    );

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
   設定画面
   ========================================== */

function openSettings() {

    document.getElementById("homeScreen").hidden = true;
    document.getElementById("productScreen").hidden = true;
    document.getElementById("deletedProductScreen").hidden = true;
    document.getElementById("makerScreen").hidden = true;
    document.getElementById("categoryScreen").hidden = true;
    document.getElementById("storeScreen").hidden = true;

    document.getElementById("settingsScreen").hidden = false;

}

/* ==========================================
   メーカー管理画面
   ========================================== */

function openMakerMaster() {

    document.getElementById("settingsScreen").hidden = true;

    document.getElementById("makerScreen").hidden = false;

    displayMakerList();

}

/* ==========================================
   カテゴリー管理画面
   ========================================== */

function openCategoryMaster() {

    masterReturnScreen = "settings";

    document.getElementById(
        "settingsScreen"
    ).hidden = true;

    document.getElementById(
        "productScreen"
    ).hidden = true;

    document.getElementById(
        "categoryScreen"
    ).hidden = false;

    editingCategoryId = null;

    document.getElementById(
        "txtCategoryName"
    ).value = "";

    displayCategoryList();

}

/* ==========================================
   商品登録画面から商品ジャンル管理を開く
   ========================================== */

function openCategoryMasterFromProduct() {

    masterReturnScreen = "product";

    document.getElementById("productScreen").hidden =
        true;

    document.getElementById("settingsScreen").hidden =
        true;

    document.getElementById("categoryScreen").hidden =
        false;

    editingCategoryId = null;

    document.getElementById("txtCategoryName").value =
        "";

    displayCategoryList();

}

/* ==========================================
   店舗管理画面
   ========================================== */

function openStoreMaster() {

    masterReturnScreen = "settings";

    document.getElementById("settingsScreen").hidden =
        true;

    document.getElementById("storeScreen").hidden =
        false;

    editingStoreId = null;

    document.getElementById("txtStoreName").value =
        "";

    document.getElementById("cmbStoreType").selectedIndex =
        0;

    document.getElementById("storeMessage").textContent =
        "";

    displayStores();

}

/* ==========================================
   商品登録画面から購入先管理を開く
   ========================================== */

function openStoreMasterFromProduct() {

    masterReturnScreen = "product";

    document.getElementById("productScreen").hidden =
        true;

    document.getElementById("settingsScreen").hidden =
        true;

    document.getElementById("storeScreen").hidden =
        false;

    editingStoreId = null;

    document.getElementById("txtStoreName").value =
        "";

    document.getElementById("cmbStoreType").selectedIndex =
        0;

    document.getElementById("storeMessage").textContent =
        "";

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

            <p><span class="product-label">メーカー</span><span class="product-value">${product.makerId}</span></p>

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

    document.getElementById("txtProductName").value = product.name;

    document.getElementById("cmbMaker").value = product.makerId;

    document.getElementById("cmbCategory").value = product.categoryId;

    document.getElementById("txtVolume").value = product.volume;

    document.getElementById("cmbUnit").value = product.unit;

    document.getElementById("txtPrice").value =
        product.price || "";

    document.getElementById("cmbStore").value =
        product.storeId || "";

    document.getElementById("productMessage").textContent =
        "編集モードです。保存すると更新されます。";

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
                    ${getStoreTypeName(store.typeId || "other")}
                </small>

            </div>

            <div class="master-buttons">

                <button onclick="editStore('${store.id}')">

                    ✏ 編集

                </button>

                <button onclick="deleteStoreData('${store.id}')">

                    🗑 削除

                </button>

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

        message.textContent =
            "メーカー名を入力してください。";

        return;

    }

    const duplicate = makers.find(

        maker =>

            maker.active &&

            maker.name.toLowerCase() ===
            name.toLowerCase()

    );

    if (duplicate) {

        displayMakerSelect();

        document.getElementById("cmbMaker").value =
            duplicate.id;

        input.value = "";

        document.getElementById("makerQuickAdd").hidden =
            true;

        message.textContent =
            "登録済みのメーカーを選択しました。";

        return;

    }

    const maker =
        createMaker(name);

    addMaker(maker);

    displayMakerSelect();

    document.getElementById("cmbMaker").value =
        maker.id;

    input.value = "";

    document.getElementById("makerQuickAdd").hidden =
        true;

    message.textContent =
        "メーカーを追加しました。";

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

