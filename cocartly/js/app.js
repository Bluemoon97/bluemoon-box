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
    const btnBackHome = document.getElementById("btnBackHome");
    const btnSaveProduct = document.getElementById("btnSaveProduct");
    const btnDeletedProducts = document.getElementById("btnDeletedProducts");
    const btnBackProduct = document.getElementById("btnBackProduct");
    const btnBackSettings = document.getElementById("btnBackSettings");
    const btnMakerMaster = document.getElementById("btnMakerMaster");
    const btnCategoryMaster = document.getElementById("btnCategoryMaster");
    const btnBackMaker = document.getElementById("btnBackMaker");
    const btnBackCategory = document.getElementById("btnBackCategory");
    const btnSaveMaker = document.getElementById("btnSaveMaker");
    const btnSaveCategory = document.getElementById("btnSaveCategory");
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
    btnBackHome.addEventListener("click", openHome);
    btnSaveProduct.addEventListener("click", saveProduct);
    btnDeletedProducts.addEventListener("click", openDeletedProducts);
    btnBackProduct.addEventListener("click", backProduct);
    btnBackSettings.addEventListener("click", openHome);
    btnMakerMaster.addEventListener("click", openMakerMaster);
    btnCategoryMaster.addEventListener("click", openCategoryMaster);
    btnBackMaker.addEventListener("click", openSettings);
    btnBackCategory.addEventListener("click", openSettings);
    btnSaveMaker.addEventListener("click", saveMaker);
    btnSaveCategory.addEventListener("click", saveCategory);
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

function saveProduct() {

    const txtProductName = document.getElementById("txtProductName");
    const productMessage = document.getElementById("productMessage");

    const productName = txtProductName.value.trim();

    const cmbMaker = document.getElementById("cmbMaker");
    const cmbCategory = document.getElementById("cmbCategory");
    const txtVolume = document.getElementById("txtVolume");
    const cmbUnit = document.getElementById("cmbUnit");

    const makerId = cmbMaker.value;
    const categoryId = cmbCategory.value;
    const volume = txtVolume.value.trim();
    const unit = cmbUnit.value;

    if (productName === "") {

        productMessage.textContent = "商品名を入力してください。";

        return;

    }

    let product;

    if (editingProductId === null) {

        product = {

            id: createProductId(),

            name: productName,

            makerId: makerId,

            categoryId: categoryId,

            volume: volume,

            unit: unit,

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

            makerId: makerId,

            categoryId: categoryId,

            volume: volume,

            unit: unit

        };

        updateProduct(product);

        editingProductId = null;

    }

    document.getElementById("txtProductName").value = "";

    document.getElementById("cmbMaker").selectedIndex = 0;

    document.getElementById("cmbCategory").selectedIndex = 0;

    document.getElementById("txtVolume").value = "";

    document.getElementById("cmbUnit").selectedIndex = 0;

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

            <p><strong>メーカー：</strong>${getMakerName(product.makerId)}</p>

            <p><strong>カテゴリー：</strong>${getCategoryName(product.categoryId)}</p>

            <p><strong>内容量：</strong>${product.volume}${product.unit}</p>

            <p><strong>登録日：</strong>${dateText}</p>

            <div class="product-buttons">

                ${product.active
                ?

                `
                    <button onclick="editProduct('${product.id}')">
                        編集
                    </button>

                    <button onclick="deleteProduct('${product.id}')">
                        削除
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

    document.getElementById("txtProductName").value =
        product.name;

    document.getElementById("txtMaker").value =
        product.maker;

    document.getElementById("txtCategory").value =
        product.category;

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

    document.getElementById("settingsScreen").hidden = true;

    document.getElementById("categoryScreen").hidden = false;

    displayCategoryList();

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

            <p><strong>メーカー：</strong>${getMakerName(product.makerId)}</p>

            <p><strong>カテゴリー：</strong>${getCategoryName(product.categoryId)}</p>

            <p><strong>内容量：</strong>${product.volume}${product.unit}</p>

            <p><strong>登録日：</strong>${dateText}</p>

            <button onclick="restoreProduct('${product.id}')">

                復元

            </button>

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
