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


/*
 お出かけ作成中の
 持ち物一時保存
*/

let outingDraftItems = [];


/*
 保存済みのお出かけ
*/

let outings = [];

/*
 お出かけチェック
 現在表示している状態

 pending = 準備前
 ready   = 準備済
 hold    = 保留
*/

let outingViewMode =
    "pending";


/*
 現在開いている
 お出かけID
*/

let currentOutingId =
    null;

/*
 お出かけ一覧
 現在表示している種類

 upcoming = 予定
 routine  = いつも使う
 past     = 過去
*/

let outingListViewMode =
    "upcoming";

let productFilterCategoryId = "";

/* ==========================================
   購入予定
   ========================================== */

const SHOPPING_STORAGE_KEY =
    "cocartlyShoppingItems";

let shoppingItems =
    loadShoppingItems();

let pendingShoppingItemId =
    null;

/*
 商品詳細で現在表示している
 購入予定商品ID
*/

let shoppingDetailItemId =
    null;

/*
 購入予定の商品絞り込み

 all
 favorite
 categoryId
*/

let shoppingProductFilter =
    "all";

/* ==========================================
   店頭確認履歴
   ========================================== */

const STORE_CHECK_STORAGE_KEY =
    "cocartlyStoreChecks";


let storeChecks =
    loadStoreChecks();

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
   価格計算情報
   ========================================== */

let productPriceCalculation = null;

let purchasePriceCalculation = null;

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

    /*
     買い物セッションを復元
    */

    loadShoppingSession();

    loadOutings();

    setupButtons();

    displayCategorySelect();

    displayProducts();

}

/* ==========================================
   購入予定 状態
   ========================================== */

/*
 pending   = 購入前
 purchased = 購入済み（一時）
 hold      = 保留
*/

let shoppingViewMode =
    "pending";


/*
 現在の買い物セッション
 買い物終了までは一時状態として保持
*/

let shoppingSession = {

    id: null,

    startedAt: null,

    completedAt: null,

    active: false

};

/* ==========================================
   買い物セッション 保存
   ========================================== */

function saveShoppingSession() {

    localStorage.setItem(

        "shoppingSupportShoppingSession",

        JSON.stringify(
            shoppingSession
        )

    );

}


/* ==========================================
   買い物セッション 読み込み
   ========================================== */

function loadShoppingSession() {

    try {

        const saved =
            localStorage.getItem(
                "shoppingSupportShoppingSession"
            );

        if (!saved) {

            return;

        }

        const parsed =
            JSON.parse(saved);

        if (!parsed) {

            return;

        }

        shoppingSession = {

            id:
                parsed.id || null,

            startedAt:
                parsed.startedAt || null,

            completedAt:
                parsed.completedAt || null,

            active:
                parsed.active === true

        };

    } catch (error) {

        console.error(
            "買い物セッションを読み込めませんでした。",
            error
        );

    }

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

        if (!Array.isArray(data)) {

            return [];

        }


        /*
         旧データにはstatusが無いため
         購入前として補完
        */

        return data.map(

            item => {

                return {

                    ...item,

                    status:
                        item.status ||
                        "pending",

                    updatedAt:
                        item.updatedAt ||
                        item.createdAt ||
                        new Date().toISOString()

                };

            }

        );

    } catch (error) {

        console.error(
            "購入予定読み込みエラー：",
            error
        );

        return [];

    }

}

/* ==========================================
   店頭確認履歴 読み込み
   ========================================== */

function loadStoreChecks() {

    try {

        const saved =
            localStorage.getItem(
                STORE_CHECK_STORAGE_KEY
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
            "店頭確認履歴の読み込みエラー：",
            error
        );

        return [];

    }

}

/* ==========================================
   店頭確認履歴 保存
   ========================================== */

function saveStoreChecks() {

    localStorage.setItem(

        STORE_CHECK_STORAGE_KEY,

        JSON.stringify(
            storeChecks
        )

    );

}

/* ==========================================
   店頭確認ID作成
   ========================================== */

function createStoreCheckId() {

    return (
        "store-check-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );

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
   購入予定 商品ジャンル切り替え表示
   ========================================== */

function displayShoppingCategoryTabs() {

    const tabs =
        document.getElementById(
            "shoppingCategoryTabs"
        );

    if (!tabs) {

        return;

    }


    /*
     ⭐よく使う・すべて
     は毎回ここで作り直す
    */

    tabs.innerHTML = `

        <button
            type="button"
            class="shopping-category-button"
            data-shopping-category="favorite">

            ⭐ よく使う

        </button>


        <button
            type="button"
            class="shopping-category-button"
            data-shopping-category="all">

            すべて

        </button>

    `;


    /*
     登録済みジャンルを追加
    */

    const activeCategories =
        categories.filter(

            category =>
                category.active !== false

        );


    for (
        const category of activeCategories
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "shopping-category-button";


        button.dataset.shoppingCategory =
            category.id;


        button.textContent =
            category.name;


        tabs.appendChild(
            button
        );

    }


    /*
     クリック処理
    */

    const buttons =
        tabs.querySelectorAll(
            ".shopping-category-button"
        );


    buttons.forEach(

        button => {

            button.addEventListener(

                "click",

                () => {

                    shoppingProductFilter =
                        button.dataset.shoppingCategory;


                    updateShoppingCategoryTabs();

                    displayShoppingProductOptions();

                }

            );

        }

    );


    updateShoppingCategoryTabs();

}

/* ==========================================
   購入予定 商品ジャンル 選択表示
   ========================================== */

function updateShoppingCategoryTabs() {

    const buttons =
        document.querySelectorAll(
            ".shopping-category-button"
        );


    buttons.forEach(

        button => {

            const category =
                button.dataset.shoppingCategory;


            button.classList.toggle(

                "active",

                category ===
                shoppingProductFilter

            );

        }

    );

}

/* ==========================================
   購入予定 商品候補表示
   ========================================== */

function displayShoppingProductOptions() {

    const select =
        document.getElementById(
            "cmbShoppingProduct"
        );

    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">
            商品を選択してください
        </option>

    `;


    /*
     表示対象商品
    */

    let targetProducts =
        products.filter(

            product =>
                product.active !== false

        );


    /*
     ジャンルで絞り込み

     all
     → 全商品

     favorite
     → まだ③〜⑤で実装するため
       今は0件にする

     それ以外
     → categoryIdで絞る
    */

    if (
        shoppingProductFilter ===
        "favorite"
    ) {

        targetProducts =
            targetProducts.filter(

                product =>
                    product.favorite ===
                    true

            );

    } else if (
        shoppingProductFilter !==
        "all"
    ) {

        targetProducts =
            targetProducts.filter(

                product =>
                    product.categoryId ===
                    shoppingProductFilter

            );

    }


    /*
     商品名順
    */

    targetProducts.sort(

        (a, b) =>

            a.name.localeCompare(
                b.name,
                "ja"
            )

    );


    /*
     商品候補追加
    */

    for (
        const product of targetProducts
    ) {

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


    /*
     該当商品がない場合
    */

    if (
        targetProducts.length === 0
    ) {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            "";

        option.disabled =
            true;


        if (
            shoppingProductFilter ===
            "favorite"
        ) {

            option.textContent =
                "よく使う商品はまだありません";

        } else {

            option.textContent =
                "このジャンルの商品はありません";

        }


        select.appendChild(
            option
        );

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

    const newNameInput =
        document.getElementById(
            "txtShoppingNewProductName"
        );

    const newJanInput =
        document.getElementById(
            "txtShoppingJanCode"
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
        select
            ? select.value
            : "";


    const newProductName =
        newNameInput
            ? newNameInput.value.trim()
            : "";


    const newJanCode =
        newJanInput
            ? newJanInput.value.trim()
            : "";


    const quantity =
        Number(
            quantityInput.value
        );


    /*
     登録済み商品も
     未登録商品名も入力されていない
    */

    if (
        productId === "" &&
        newProductName === ""
    ) {

        message.textContent =
            "登録済み商品を選ぶか、商品名を入力してください。";

        return;

    }


    /*
     数量チェック
    */

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
     未登録商品として追加しようとしていて、
     JANコードが入力されている場合だけ
     登録済み商品のJANと重複していないか確認
    */

    if (
        productId === "" &&
        newJanCode !== ""
    ) {

        const existingJanProduct =
            products.find(

                product =>

                    product.active !== false &&

                    (
                        product.janCode ===
                        newJanCode ||

                        product.jan ===
                        newJanCode
                    )

            );


        if (existingJanProduct) {

            message.textContent =
                "このJANコードの商品はすでに登録されています。";


            alert(

                "このJANコードの商品はすでに登録されています。\n\n" +

                "商品名：" +
                existingJanProduct.name +

                "\n\n登録済み商品から追加してください。"

            );


            /*
             登録済み商品を
             自動選択する
            */

            if (select) {

                select.value =
                    existingJanProduct.id;

            }


            return;

        }

    }


    /*
     登録済み商品を選択した場合
    */

    if (
        productId !== ""
    ) {

        const existing =
            shoppingItems.find(

                item =>
                    item.productId ===
                    productId

            );


        if (existing) {

            existing.quantity =
                quantity;

            /*
             もう一度追加した場合は
             購入前へ戻す
            */

            existing.status =
                "pending";

            existing.holdStartedAt =
                null;

            existing.updatedAt =
                new Date().toISOString();

        } else {

            const now =
                new Date().toISOString();


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

                status:
                    "pending",

                holdStartedAt:
                    null,

                createdAt:
                    now,

                updatedAt:
                    now

            });

        }

    } else {

        /*
         未登録商品を追加
        */

        const now =
            new Date().toISOString();


        /*
         同じ未登録商品が
         すでに購入予定にあるか確認
        */

        const existing =
            shoppingItems.find(

                item =>

                    !item.productId &&

                    (
                        item.productName ||
                        ""
                    ).trim() ===
                    newProductName

            );


        if (existing) {

            existing.quantity =
                quantity;

            /*
             JANを後から入力した場合は更新
            */

            if (
                newJanCode !== ""
            ) {

                existing.janCode =
                    newJanCode;

            }


            existing.status =
                "pending";

            existing.holdStartedAt =
                null;

            existing.updatedAt =
                now;

        } else {

            shoppingItems.push({

                id:
                    "shopping-" +
                    Date.now() +
                    "-" +
                    Math.random()
                        .toString(36)
                        .slice(2, 8),

                /*
                 まだ商品登録済みではないため
                 productIdは持たない
                */

                productId:
                    null,

                productName:
                    newProductName,

                janCode:
                    newJanCode,

                quantity:
                    quantity,

                /*
                 買い物終了時に
                 商品登録が必要
                */

                needsRegistration:
                    true,

                status:
                    "pending",

                holdStartedAt:
                    null,

                createdAt:
                    now,

                updatedAt:
                    now

            });

        }

    }


    /*
     購入予定保存
    */

    saveShoppingItems();


    /*
     入力欄リセット
    */

    if (select) {

        select.value =
            "";

    }


    if (newNameInput) {

        newNameInput.value =
            "";

    }


    if (newJanInput) {

        newJanInput.value =
            "";

    }


    quantityInput.value =
        "1";


    /*
     メッセージ
    */

    message.textContent =
        productId !== ""
            ? "購入予定に追加しました。"
            : "未登録商品を購入予定に追加しました。";


    /*
     追加後は購入前一覧へ戻す
    */

    shoppingViewMode =
        "pending";


    const addArea =
        document.getElementById(
            "shoppingAddArea"
        );


    if (addArea) {

        addArea.hidden =
            true;

    }


    /*
     ＋追加で非表示にしていた
     買い物終了を戻す
    */

    const finishButton =
        document.getElementById(
            "btnFinishShopping"
        );


    if (finishButton) {

        finishButton.style.display =
            "";

    }


    updateShoppingViewButtons();

    updateShoppingCounts();

    displayShoppingItemsByCurrentView();

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
   購入予定 状態変更
   ========================================== */

function changeShoppingItemStatus(
    shoppingItemId,
    status
) {

    const item =
        shoppingItems.find(

            item =>
                item.id ===
                shoppingItemId

        );

    if (!item) {

        return false;

    }


    const allowedStatuses = [

        "pending",

        "purchased",

        "hold"

    ];


    if (
        !allowedStatuses.includes(
            status
        )
    ) {

        return false;

    }


    item.status =
        status;

    item.updatedAt =
        new Date().toISOString();


    /*
     保留にした日時を記録
    */

    if (status === "hold") {

        item.holdStartedAt =
            new Date().toISOString();

    } else {

        item.holdStartedAt =
            null;

    }


    saveShoppingItems();

    updateShoppingCounts();

    displayShoppingItemsByCurrentView();

    return true;

}

/* ==========================================
   購入予定 表示切り替え
   ========================================== */

function changeShoppingView(
    viewMode
) {

    shoppingViewMode =
        viewMode;


    const addArea =
        document.getElementById(
            "shoppingAddArea"
        );

    const finishButton =
        document.getElementById(
            "btnFinishShopping"
        );


    /*
     ＋追加
    */

    if (
        viewMode === "add"
    ) {

        if (addArea) {

            addArea.hidden =
                false;

        }


        if (finishButton) {

            finishButton.style.display =
                "none";

        }

    } else {

        if (addArea) {

            addArea.hidden =
                true;

        }


        if (finishButton) {

            finishButton.style.display =
                "";

        }

    }


    updateShoppingViewButtons();

    updateShoppingCounts();

    displayShoppingItemsByCurrentView();

}

/* ==========================================
   買い物終了
   最終確認
   ========================================== */

function finishShopping() {

    const pendingItems =
        shoppingItems.filter(

            item =>
                item.status ===
                "pending"

        );


    const purchasedItems =
        shoppingItems.filter(

            item =>
                item.status ===
                "purchased"

        );


    const holdItems =
        shoppingItems.filter(

            item =>
                item.status ===
                "hold"

        );


    /*
     購入済み商品がない場合
    */

    if (
        purchasedItems.length === 0
    ) {

        alert(
            "購入済みの商品がありません。"
        );

        return;

    }


    /*
     購入前の商品が残っている場合
    */

    if (
        pendingItems.length > 0
    ) {

        const continueFinish =
            confirm(

                "まだ購入前の商品が " +
                pendingItems.length +
                "商品あります。\n\n" +

                "買い忘れはありませんか？\n\n" +

                "このまま買い物を終了しますか？"

            );


        if (!continueFinish) {

            /*
             購入前へ戻す
            */

            changeShoppingView(
                "pending"
            );

            return;

        }

    }


    /*
     最終確認
    */

    const confirmed =
        confirm(

            "買い物を終了します。\n\n" +

            "購入済み：" +
            purchasedItems.length +
            "商品\n" +

            "購入前：" +
            pendingItems.length +
            "商品\n" +

            "保留：" +
            holdItems.length +
            "商品\n\n" +

            "購入済みの商品を確定しますか？"

        );


    if (!confirmed) {

        return;

    }

    /*
     購入済み商品の
     店・価格情報を確認
    */

    const missingPurchaseInfoItems =
        purchasedItems.filter(

            item =>
                !getShoppingPurchaseStoreCheck(
                    item
                )

        );


    if (
        missingPurchaseInfoItems.length > 0
    ) {

        const names =
            missingPurchaseInfoItems

                .map(

                    item => {

                        const product =
                            products.find(

                                product =>
                                    product.id ===
                                    item.productId

                            );


                        return product
                            ? product.name
                            : (
                                item.productName ||
                                "商品名未設定"
                            );

                    }

                )

                .join("\n・");


        alert(

            "購入履歴へ保存するための" +
            "店頭情報が不足しています。\n\n" +

            "次の商品で、" +
            "「販売あり」と税込価格を" +
            "記録してください。\n\n・" +

            names

        );


        return;

    }

    /*
     購入済み商品を正式確定
    */

    let savedHistoryCount =
        0;

    let registeredProductCount =
        0;


    /*
     未登録商品だった店頭情報を
     正式productIdへ付け替えたかどうか
    */

    let storeChecksChanged =
        false;


    for (
        const shoppingItem of
        purchasedItems
    ) {

        /*
         今回購入した店・価格
        */

        const storeCheck =
            getShoppingPurchaseStoreCheck(
                shoppingItem
            );


        if (!storeCheck) {

            continue;

        }


        /*
         元々未登録商品だったか
        */

        const wasUnregistered =
            !shoppingItem.productId;


        /*
         正式商品を取得または作成
        */

        const product =
            registerShoppingItemProduct(
                shoppingItem,
                storeCheck
            );


        if (!product) {

            continue;

        }


        if (wasUnregistered) {

            registeredProductCount++;

        }


        /*
         未登録商品の店頭情報は
         shoppingItemId参照から
         productId参照へ変更
        */

        if (wasUnregistered) {

            for (
                const check of
                storeChecks
            ) {

                if (
                    check.shoppingItemId ===
                    shoppingItem.id
                ) {

                    check.productId =
                        product.id;

                    check.shoppingItemId =
                        null;

                    storeChecksChanged =
                        true;

                }

            }

        }


        /*
         購入履歴へ正式保存
        */

        const history =
            addPriceHistory(

                product.id,

                storeCheck.storeId,

                storeCheck.taxIncludedPrice,

                shoppingItem.quantity ||
                1

            );


        if (history) {

            savedHistoryCount++;

        }

        /*
         お出かけチェックから追加された商品なら
         元の持ち物を準備済にする
        */

        completeOutingItemsFromShopping(
            shoppingItem
        );

    }


    /*
     新しく作った商品を保存
    */

    if (
        registeredProductCount > 0
    ) {

        saveProducts();

    }


    /*
     店頭情報の参照先変更を保存
    */

    if (storeChecksChanged) {

        saveStoreChecks();

    }


    /*
     購入済み商品だけ
     購入予定から削除
    
     購入前・保留は残す
    */

    shoppingItems =
        shoppingItems.filter(

            item =>
                item.status !==
                "purchased"

        );


    saveShoppingItems();


    /*
     表示更新
    */

    shoppingViewMode =
        "pending";


    updateShoppingViewButtons();

    updateShoppingCounts();

    displayShoppingItemsByCurrentView();


    /*
     完了メッセージ
    */

    alert(

        "買い物を終了しました。\n\n" +

        "購入履歴へ保存：" +
        savedHistoryCount +
        "商品\n" +

        "新しく商品登録：" +
        registeredProductCount +
        "商品"

    );

}

/* ==========================================
   購入予定 切り替えボタン表示
   ========================================== */

function updateShoppingViewButtons() {

    const buttons = {

        pending:
            document.getElementById(
                "btnShoppingPending"
            ),

        purchased:
            document.getElementById(
                "btnShoppingPurchased"
            ),

        hold:
            document.getElementById(
                "btnShoppingHold"
            ),

        add:
            document.getElementById(
                "btnShoppingAddView"
            )

    };


    for (
        const [
            mode,
            button
        ] of
        Object.entries(buttons)
    ) {

        if (!button) {

            continue;

        }

        button.classList.toggle(

            "active",

            shoppingViewMode ===
            mode

        );

    }

}

/* ==========================================
   購入予定 件数更新
   ========================================== */

function updateShoppingCounts() {

    const pendingCount =
        shoppingItems.filter(

            item =>
                item.status === "pending"

        ).length;


    const purchasedCount =
        shoppingItems.filter(

            item =>
                item.status === "purchased"

        ).length;


    const holdCount =
        shoppingItems.filter(

            item =>
                item.status === "hold"

        ).length;


    const pendingCountElement =
        document.getElementById(
            "shoppingPendingCount"
        );

    const purchasedCountElement =
        document.getElementById(
            "shoppingPurchasedCount"
        );

    const holdCountElement =
        document.getElementById(
            "shoppingHoldCount"
        );

    const remainingCountElement =
        document.getElementById(
            "shoppingRemainingCount"
        );


    if (pendingCountElement) {

        pendingCountElement.textContent =
            pendingCount;

    }


    if (purchasedCountElement) {

        purchasedCountElement.textContent =
            purchasedCount;

    }


    if (holdCountElement) {

        holdCountElement.textContent =
            holdCount;

    }


    if (remainingCountElement) {

        remainingCountElement.textContent =
            pendingCount;

    }

}

/* ==========================================
   購入予定 状態別一覧
   ========================================== */

function displayShoppingItemsByCurrentView() {

    const shoppingList =
        document.getElementById(
            "shoppingList"
        );

    if (!shoppingList) {

        return;

    }


    shoppingList.innerHTML =
        "";


    /*
     ＋追加画面では
     商品一覧を表示しない
    */

    if (
        shoppingViewMode === "add"
    ) {

        return;

    }


    const targetItems =
        shoppingItems.filter(

            item =>
                item.status ===
                shoppingViewMode

        );


    if (
        targetItems.length === 0
    ) {

        let emptyMessage =
            "購入予定の商品はありません。";


        if (
            shoppingViewMode ===
            "purchased"
        ) {

            emptyMessage =
                "購入済みの商品はありません。";

        } else if (
            shoppingViewMode ===
            "hold"
        ) {

            emptyMessage =
                "保留中の商品はありません。";

        }


        shoppingList.innerHTML = `

            <p class="shopping-empty-message">

                ${emptyMessage}

            </p>

        `;

        return;

    }


    for (
        const item of targetItems
    ) {

        const product =
            products.find(

                product =>
                    product.id ===
                    item.productId

            );


        /*
         登録済み商品なら
         商品マスターの商品名を利用

         将来の未登録商品にも対応
        */

        const productName =

            product
                ? product.name
                : (
                    item.productName ||
                    item.name ||
                    "商品名未設定"
                );

        /*
         お出かけチェック経由の商品マーク
        */

        const outingMark =

            Array.isArray(
                item.outingLinks
            ) &&
                item.outingLinks.length > 0

                ? "🎒 "
                : "";

        const quantity =
            item.quantity || 1;


        /*
         前回購入店
        */

        let previousStoreText =
            "前回購入：記録なし";


        if (product) {

            const latestHistory =
                getLatestPriceHistory(
                    product.id
                );


            if (latestHistory) {

                previousStoreText =
                    "前回購入：" +
                    getStoreDisplayName(
                        latestHistory.storeId
                    );

            }

        }


        const itemRow =
            document.createElement(
                "div"
            );


        itemRow.className =
            "shopping-item-row";


        itemRow.innerHTML = `

            <button
                type="button"
                class="shopping-item-main"
                data-shopping-id="${item.id}">

                <span class="shopping-item-name">

                    ${outingMark}${productName}

                </span>

                <span class="shopping-item-sub">

                    ${previousStoreText}

                </span>

                <span class="shopping-item-quantity">

                    数量 ${quantity}

                </span>

                <span class="shopping-item-arrow">

                    〉

                </span>

            </button>

        `;

        const itemButton =
            itemRow.querySelector(
                ".shopping-item-main"
            );


        if (itemButton) {

            itemButton.addEventListener(

                "click",

                () => {

                    openShoppingItemDetail(
                        item.id
                    );

                }

            );

        }

        shoppingList.appendChild(
            itemRow
        );

    }

}

/* ==========================================
   購入予定詳細 販売店候補
   ========================================== */

function displayShoppingDetailStoreOptions() {

    const select =
        document.getElementById(
            "cmbShoppingDetailStore"
        );

    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">
            販売店を選択してください
        </option>

    `;


    for (const store of stores) {

        if (
            store.active === false
        ) {

            continue;

        }


        const option =
            document.createElement(
                "option"
            );

        option.value =
            store.id;

        option.textContent =
            getStoreDisplayName(
                store.id
            );


        select.appendChild(
            option
        );

    }

}

/* ==========================================
   購入予定 商品詳細を開く
   ========================================== */

function openShoppingItemDetail(
    shoppingItemId
) {

    const item =
        shoppingItems.find(

            item =>
                item.id ===
                shoppingItemId

        );


    if (!item) {

        return;

    }


    shoppingDetailItemId =
        shoppingItemId;


    const product =
        products.find(

            product =>
                product.id ===
                item.productId

        );


    const productName =

        product
            ? product.name
            : (
                item.productName ||
                item.name ||
                "商品名未設定"
            );

    const isUnregistered =
        !product &&
        item.needsRegistration ===
        true;


    /*
     商品名
    */

    const nameElement =
        document.getElementById(
            "shoppingDetailProductName"
        );

    if (nameElement) {

        nameElement.textContent =
            productName;

    }

    const unregisteredElement =
        document.getElementById(
            "shoppingDetailUnregistered"
        );


    if (unregisteredElement) {

        unregisteredElement.hidden =
            !isUnregistered;

    }

    const janArea =
        document.getElementById(
            "shoppingDetailJanArea"
        );

    const janInput =
        document.getElementById(
            "txtShoppingDetailJanCode"
        );


    if (janArea) {

        janArea.hidden =
            !isUnregistered;

    }


    if (
        janInput &&
        isUnregistered
    ) {

        janInput.value =
            item.janCode ||
            "";

    }

    /*
     数量
    */

    const quantityElement =
        document.getElementById(
            "shoppingDetailQuantity"
        );

    if (quantityElement) {

        quantityElement.textContent =
            item.quantity || 1;

    }


    /*
     前回購入店
    */

    let previousStoreText =
        "前回購入：記録なし";


    if (product) {

        const latestHistory =
            getLatestPriceHistory(
                product.id
            );


        if (latestHistory) {

            previousStoreText =
                "前回購入：" +
                getStoreDisplayName(
                    latestHistory.storeId
                );

        }

    }


    const previousStoreElement =
        document.getElementById(
            "shoppingDetailPreviousStore"
        );


    if (previousStoreElement) {

        previousStoreElement.textContent =
            previousStoreText;

    }

    /*
     購入価格情報
    */

    const latestPriceElement =
        document.getElementById(
            "shoppingDetailLatestPrice"
        );

    const lowestPriceElement =
        document.getElementById(
            "shoppingDetailLowestPrice"
        );

    const averagePriceElement =
        document.getElementById(
            "shoppingDetailAveragePrice"
        );

    const noHistoryElement =
        document.getElementById(
            "shoppingDetailNoHistory"
        );

    const productHistories =
        product
            ? getProductPriceHistory(
                product.id
            )
            : [];


    if (noHistoryElement) {

        noHistoryElement.hidden =
            productHistories.length > 0;

    }

    if (product) {

        const latestPrice =
            getLatestPrice(
                product.id
            );

        const lowestPrice =
            getLowestPrice(
                product.id
            );

        const averagePrice =
            getAveragePrice(
                product.id
            );


        if (latestPriceElement) {

            latestPriceElement.textContent =
                latestPrice !== null &&
                    latestPrice !== undefined
                    ? "¥" + latestPrice
                    : "-";

        }


        if (lowestPriceElement) {

            lowestPriceElement.textContent =
                lowestPrice !== null &&
                    lowestPrice !== undefined
                    ? "¥" + lowestPrice
                    : "-";

        }


        if (averagePriceElement) {

            averagePriceElement.textContent =
                averagePrice !== null &&
                    averagePrice !== undefined
                    ? "¥" + averagePrice
                    : "-";

        }

    } else {

        if (latestPriceElement) {

            latestPriceElement.textContent =
                "-";

        }

        if (lowestPriceElement) {

            lowestPriceElement.textContent =
                "-";

        }

        if (averagePriceElement) {

            averagePriceElement.textContent =
                "-";

        }

    }

    /*
     状態に応じてボタンを切り替える
    */

    updateShoppingDetailButtons(
        item
    );


    displayShoppingDetailStoreOptions();

    displayShoppingStoreChecks(
        item
    );


    /*
     詳細画面表示
    */

    hideAllScreens();


    const detailScreen =
        document.getElementById(
            "shoppingDetailScreen"
        );


    if (detailScreen) {

        detailScreen.hidden =
            false;

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

/* ==========================================
   購入予定 未登録商品のJANコード保存
   ========================================== */

function saveShoppingDetailJanCode() {

    if (!shoppingDetailItemId) {

        return;

    }


    const item =
        shoppingItems.find(

            item =>
                item.id ===
                shoppingDetailItemId

        );


    if (!item) {

        return;

    }


    const input =
        document.getElementById(
            "txtShoppingDetailJanCode"
        );


    if (!input) {

        return;

    }


    item.janCode =
        input.value.trim();


    item.updatedAt =
        new Date().toISOString();


    saveShoppingItems();


    const message =
        document.getElementById(
            "shoppingDetailMessage"
        );


    if (message) {

        message.textContent =
            item.janCode !== ""
                ? "JANコードを保存しました。"
                : "JANコードを空欄で保存しました。";

    }

}

/* ==========================================
   購入予定 詳細ボタン表示
   ========================================== */

function updateShoppingDetailButtons(
    item
) {

    const purchasedButton =
        document.getElementById(
            "btnShoppingMarkPurchased"
        );

    const holdButton =
        document.getElementById(
            "btnShoppingMarkHold"
        );

    const pendingButton =
        document.getElementById(
            "btnShoppingReturnPending"
        );


    if (purchasedButton) {

        purchasedButton.hidden =
            item.status ===
            "purchased";

    }


    if (holdButton) {

        holdButton.hidden =
            item.status ===
            "hold";

    }


    if (pendingButton) {

        pendingButton.hidden =
            item.status ===
            "pending";

    }

}

/* ==========================================
   購入予定から完全削除
   ========================================== */

function permanentlyDeleteShoppingItem(
    shoppingItemId
) {

    const itemIndex =
        shoppingItems.findIndex(

            item =>
                item.id ===
                shoppingItemId

        );


    if (itemIndex === -1) {

        return false;

    }


    const confirmed =
        confirm(

            "この商品を購入予定から削除しますか？\n\n" +

            "商品登録や過去の購入履歴は削除されません。"

        );


    if (!confirmed) {

        return false;

    }


    /*
     shoppingItemsの対象1件だけ削除

     products
     priceHistory
     は一切変更しない
    */

    shoppingItems.splice(
        itemIndex,
        1
    );


    saveShoppingItems();


    shoppingDetailItemId =
        null;


    return true;

}

/* ==========================================
   今日の店頭情報を保存
   ========================================== */

function saveShoppingStoreCheck() {

    if (!shoppingDetailItemId) {

        return;

    }


    const shoppingItem =
        shoppingItems.find(

            item =>
                item.id ===
                shoppingDetailItemId

        );


    if (!shoppingItem) {

        return;

    }


    const storeSelect =
        document.getElementById(
            "cmbShoppingDetailStore"
        );

    const availabilitySelect =
        document.getElementById(
            "cmbShoppingAvailability"
        );

    const taxExcludedInput =
        document.getElementById(
            "txtShoppingStorePriceTaxExcluded"
        );

    const taxIncludedInput =
        document.getElementById(
            "txtShoppingStorePriceTaxIncluded"
        );

    const message =
        document.getElementById(
            "shoppingStoreCheckMessage"
        );


    const storeId =
        storeSelect
            ? storeSelect.value
            : "";

    const availability =
        availabilitySelect
            ? availabilitySelect.value
            : "unknown";

    const taxExcludedPrice =
        taxExcludedInput
            ? taxExcludedInput.value.trim()
            : "";

    const taxIncludedPrice =
        taxIncludedInput
            ? taxIncludedInput.value.trim()
            : "";


    if (storeId === "") {

        if (message) {

            message.textContent =
                "販売店を選択してください。";

        }

        return;

    }


    /*
     商品はproductIdで参照
     未登録商品だけshoppingItemIdを保持
    */

    const storeCheck = {

        id:
            createStoreCheckId(),

        productId:
            shoppingItem.productId ||
            null,

        shoppingItemId:
            shoppingItem.productId
                ? null
                : shoppingItem.id,

        storeId:
            storeId,

        availability:
            availability,

        taxExcludedPrice:
            taxExcludedPrice === ""
                ? null
                : Number(
                    taxExcludedPrice
                ),

        taxIncludedPrice:
            taxIncludedPrice === ""
                ? null
                : Number(
                    taxIncludedPrice
                ),

        checkedAt:
            new Date().toISOString()

    };


    storeChecks.push(
        storeCheck
    );


    saveStoreChecks();


    if (message) {

        message.textContent =
            "店頭情報を記録しました。";

    }


    if (taxExcludedInput) {

        taxExcludedInput.value =
            "";

    }


    if (taxIncludedInput) {

        taxIncludedInput.value =
            "";

    }


    displayShoppingStoreChecks(
        shoppingItem
    );

}

/* ==========================================
   購入履歴に使用する店頭情報取得
   ========================================== */

function getShoppingPurchaseStoreCheck(
    shoppingItem
) {

    if (!shoppingItem) {

        return null;

    }


    const checks =
        storeChecks

            .filter(

                check => {

                    /*
                     登録済み商品
                    */

                    if (
                        shoppingItem.productId
                    ) {

                        return (
                            check.productId ===
                            shoppingItem.productId
                        );

                    }


                    /*
                     未登録商品
                    */

                    return (
                        check.shoppingItemId ===
                        shoppingItem.id
                    );

                }

            )

            /*
             販売あり＋税込価格あり
             だけを購入候補にする
            */

            .filter(

                check =>

                    check.availability ===
                    "available" &&

                    Number.isFinite(
                        Number(
                            check.taxIncludedPrice
                        )
                    )

            )

            /*
             新しい店頭情報を先頭へ
            */

            .sort(

                (a, b) =>

                    new Date(
                        b.checkedAt
                    ) -

                    new Date(
                        a.checkedAt
                    )

            );


    return checks.length > 0
        ? checks[0]
        : null;

}

/* ==========================================
   未登録の購入予定商品を
   正式商品へ登録
   ========================================== */

function registerShoppingItemProduct(
    shoppingItem,
    storeCheck
) {

    if (!shoppingItem) {

        return null;

    }


    /*
     すでに登録済み商品なら
     その商品を返す
    */

    if (shoppingItem.productId) {

        return products.find(

            product =>
                product.id ===
                shoppingItem.productId

        ) || null;

    }


    /*
     JANコードがある場合、
     すでに同じJANの商品が
     登録されていないか確認
    */

    if (shoppingItem.janCode) {

        const existingProduct =
            products.find(

                product =>
                    product.active !== false &&
                    product.janCode ===
                    shoppingItem.janCode

            );


        if (existingProduct) {

            return existingProduct;

        }

    }


    /*
     新しい正式商品を作成
    */

    const product =
        createProduct({

            name:
                shoppingItem.productName ||
                "商品名未設定",

            makerId:
                "",

            categoryId:
                "",

            janCode:
                shoppingItem.janCode ||
                "",

            volume:
                "",

            unit:
                "",

            storeId:
                storeCheck
                    ? storeCheck.storeId
                    : "",

            shared:
                false

        });


    /*
     商品登録画面でも
     今回価格が確認できるよう保持
    */

    product.price =
        storeCheck &&
            storeCheck.taxIncludedPrice !== null
            ? Number(
                storeCheck.taxIncludedPrice
            )
            : null;


    product.favorite =
        false;


    product.updatedAt =
        new Date().toISOString();


    addProduct(
        product
    );


    return product;

}

/* ==========================================
   店頭確認履歴 表示
   ========================================== */

function displayShoppingStoreChecks(
    shoppingItem
) {

    const list =
        document.getElementById(
            "shoppingStoreCheckList"
        );

    if (!list) {

        return;

    }


    list.innerHTML =
        "";


    const checks =
        storeChecks

            .filter(

                check => {

                    if (
                        shoppingItem.productId
                    ) {

                        return (
                            check.productId ===
                            shoppingItem.productId
                        );

                    }


                    return (
                        check.shoppingItemId ===
                        shoppingItem.id
                    );

                }

            )

            .sort(

                (a, b) => {

                    /*
                     販売あり＋価格ありを優先
                    */

                    const aAvailable =
                        a.availability ===
                        "available" &&
                        (
                            a.taxIncludedPrice !== null ||
                            a.taxExcludedPrice !== null
                        );


                    const bAvailable =
                        b.availability ===
                        "available" &&
                        (
                            b.taxIncludedPrice !== null ||
                            b.taxExcludedPrice !== null
                        );


                    if (
                        aAvailable &&
                        !bAvailable
                    ) {

                        return -1;

                    }


                    if (
                        !aAvailable &&
                        bAvailable
                    ) {

                        return 1;

                    }


                    /*
                     両方とも比較できる場合は
                     税込価格を優先して安い順
                    */

                    if (
                        aAvailable &&
                        bAvailable
                    ) {

                        const aPrice =
                            a.taxIncludedPrice !== null
                                ? Number(
                                    a.taxIncludedPrice
                                )
                                : Number(
                                    a.taxExcludedPrice
                                );


                        const bPrice =
                            b.taxIncludedPrice !== null
                                ? Number(
                                    b.taxIncludedPrice
                                )
                                : Number(
                                    b.taxExcludedPrice
                                );


                        if (
                            aPrice !==
                            bPrice
                        ) {

                            return (
                                aPrice -
                                bPrice
                            );

                        }

                    }


                    /*
                     同条件なら新しい確認を先頭
                    */

                    return (

                        new Date(
                            b.checkedAt
                        ) -

                        new Date(
                            a.checkedAt
                        )

                    );

                }

            );

    if (checks.length === 0) {

        list.innerHTML = `

            <p class="shopping-detail-guide">

                店頭確認の記録はありません。

            </p>

        `;

        return;

    }

    /*
     比較可能な最安価格を取得
    */

    const comparableChecks =
        checks.filter(

            check =>

                check.availability ===
                "available" &&

                (
                    check.taxIncludedPrice !== null ||
                    check.taxExcludedPrice !== null
                )

        );


    let cheapestCheckId =
        null;


    if (
        comparableChecks.length > 0
    ) {

        cheapestCheckId =
            comparableChecks[0].id;

    }

    for (const check of checks) {

        let availabilityText =
            "？ 未確認";


        if (
            check.availability ===
            "available"
        ) {

            availabilityText =
                "○ 販売あり";

        } else if (
            check.availability ===
            "soldout"
        ) {

            availabilityText =
                "△ 品切れ中";

        } else if (
            check.availability ===
            "notavailable"
        ) {

            availabilityText =
                "× 取扱なし";

        }


        const checkedDate =
            new Date(
                check.checkedAt
            );


        const dateText =

            checkedDate.getFullYear() +

            "/" +

            String(
                checkedDate.getMonth() + 1
            ).padStart(2, "0") +

            "/" +

            String(
                checkedDate.getDate()
            ).padStart(2, "0");


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "shopping-store-check-card";


        card.innerHTML = `

            ${check.id ===
                cheapestCheckId
                ? `
                        <div class="shopping-store-cheapest">
                            ★ 最安
                        </div>
                    `
                : ""
            }


            <strong>

                ${getStoreDisplayName(
                check.storeId
            )}

            </strong>


            <p>
                ${availabilityText}
            </p>


            ${check.taxExcludedPrice !== null
                ? `
                        <p>
                            税抜
                            ¥${check.taxExcludedPrice}
                        </p>
                    `
                : ""
            }


            ${check.taxIncludedPrice !== null
                ? `
                        <p>
                            税込
                            ¥${check.taxIncludedPrice}
                        </p>
                    `
                : ""
            }


            <small>
                確認：${dateText}
            </small>

        `;


        list.appendChild(
            card
        );

    }

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
   価格計算
   税込 / 税抜
   ％OFF / 円引き
   ========================================== */

function calculateFinalPrice(
    basePrice,
    priceType,
    taxRate,
    discountType,
    discountValue
) {

    const originalPrice =
        Number(basePrice);

    const rate =
        Number(taxRate);

    const discount =
        Number(discountValue || 0);


    if (
        !Number.isFinite(originalPrice) ||
        originalPrice < 0
    ) {

        return null;

    }


    let discountedPrice =
        originalPrice;


    /*
     値引き
    */

    if (
        discountType ===
        "percent"
    ) {

        if (
            discount < 0 ||
            discount > 100
        ) {

            return null;

        }

        discountedPrice =
            originalPrice *
            (1 - discount / 100);

    } else if (
        discountType ===
        "yen"
    ) {

        discountedPrice =
            originalPrice -
            discount;

    }


    /*
     マイナス価格防止
    */

    if (discountedPrice < 0) {

        discountedPrice = 0;

    }


    /*
     税抜表示の場合だけ
     消費税を加える
    */

    let finalPrice =
        discountedPrice;

    if (
        priceType ===
        "taxExcluded"
    ) {

        finalPrice =
            discountedPrice *
            (1 + rate / 100);

    }


    finalPrice =
        Math.round(
            finalPrice
        );


    return {

        finalPrice:
            finalPrice,

        originalPrice:
            originalPrice,

        priceType:
            priceType,

        taxRate:
            priceType ===
                "taxExcluded"
                ? rate
                : null,

        discountType:
            discountType,

        discountValue:
            discountType ===
                "none"
                ? 0
                : discount

    };

}

/* ==========================================
   ボタン取得
   ========================================== */

function setupButtons() {

    const btnCode = document.getElementById("btnCode");
    const btnProduct = document.getElementById("btnProduct");
    const cmbProductFilterCategory = document.getElementById("cmbProductFilterCategory");
    const btnShopping = document.getElementById("btnShopping");

    const btnShoppingPending = document.getElementById("btnShoppingPending");
    const btnShoppingPurchased = document.getElementById("btnShoppingPurchased");
    const btnShoppingHold = document.getElementById("btnShoppingHold");
    const btnShoppingAddView = document.getElementById("btnShoppingAddView");
    const btnFinishShopping = document.getElementById("btnFinishShopping");

    const btnBackShoppingDetail = document.getElementById("btnBackShoppingDetail");
    const btnShoppingMarkPurchased = document.getElementById("btnShoppingMarkPurchased");
    const btnShoppingMarkHold = document.getElementById("btnShoppingMarkHold");
    const btnShoppingReturnPending = document.getElementById("btnShoppingReturnPending");
    const btnDeleteShoppingItem = document.getElementById("btnDeleteShoppingItem");
    const btnSaveShoppingStoreCheck = document.getElementById("btnSaveShoppingStoreCheck");
    const btnSaveShoppingDetailJan = document.getElementById("btnSaveShoppingDetailJan");

    const btnBackShopping = document.getElementById("btnBackShopping");
    const btnAddShopping = document.getElementById("btnAddShopping");
    /*
     購入予定 ＋追加
     JANコード読取ボタン
    */
    const btnScanShoppingJan = document.getElementById("btnScanShoppingJan");
    const btnHistory = document.getElementById("btnHistory");

    const cmbHistoryProductCategory = document.getElementById("cmbHistoryProductCategory");
    const btnHistoryHelp = document.getElementById("btnHistoryHelp");
    const btnCloseHistoryHelp = document.getElementById("btnCloseHistoryHelp");
    const btnCloseHistoryHelpBottom = document.getElementById("btnCloseHistoryHelpBottom");

    const btnHistoryByDate = document.getElementById("btnHistoryByDate");
    const btnHistoryByProduct = document.getElementById("btnHistoryByProduct");
    const btnDeletedPriceHistory = document.getElementById("btnDeletedPriceHistory");
    const btnCheck = document.getElementById("btnCheck");

    const btnBackCheck = document.getElementById("btnBackCheck");
    const btnCreateOuting = document.getElementById("btnCreateOuting");
    const cmbOutingType = document.getElementById("cmbOutingType");

    const btnOutingUpcoming = document.getElementById("btnOutingUpcoming");
    const btnOutingRoutine = document.getElementById("btnOutingRoutine");
    const btnOutingPast = document.getElementById("btnOutingPast");

    const btnBackOutingCreate = document.getElementById("btnBackOutingCreate");
    const btnAddOutingItem = document.getElementById("btnAddOutingItem");
    const btnSaveOuting = document.getElementById("btnSaveOuting");
    const btnBackOutingCheck = document.getElementById("btnBackOutingCheck");
    const btnBackOutingPastDetail = document.getElementById("btnBackOutingPastDetail");

    const btnCompleteOuting = document.getElementById("btnCompleteOuting");

    const btnOutingPending = document.getElementById("btnOutingPending");
    const btnOutingReady = document.getElementById("btnOutingReady");
    const btnOutingHold = document.getElementById("btnOutingHold");
    const btnOutingAdd = document.getElementById("btnOutingAdd");

    const btnSettings = document.getElementById("btnSettings");
    const btnHomeFromProduct = document.getElementById("btnHomeFromProduct");
    const btnSaveProduct = document.getElementById("btnSaveProduct");

    const btnProductTaxCalc = document.getElementById("btnProductTaxCalc");
    const btnShoppingTaxCalc = document.getElementById("btnShoppingTaxCalc");
    const btnUseShoppingTaxPrice = document.getElementById("btnUseShoppingTaxPrice");
    const btnCloseShoppingTaxCalc = document.getElementById("btnCloseShoppingTaxCalc");

    const btnUseProductTaxPrice = document.getElementById("btnUseProductTaxPrice");
    const btnCloseProductTaxCalc = document.getElementById("btnCloseProductTaxCalc");

    const btnPurchaseTaxCalc = document.getElementById("btnPurchaseTaxCalc");
    const btnUsePurchaseTaxPrice = document.getElementById("btnUsePurchaseTaxPrice");
    const btnClosePurchaseTaxCalc = document.getElementById("btnClosePurchaseTaxCalc");

    /*
     今回の購入
     JANコード読取ボタン
    */

    const btnScanPriceRecordJan = document.getElementById("btnScanPriceRecordJan");

    const btnVolumeExample = document.getElementById("btnVolumeExample");
    const btnCloseVolumeExample = document.getElementById("btnCloseVolumeExample");

    const btnProductHelp = document.getElementById("btnProductHelp");
    const btnCloseProductHelp = document.getElementById("btnCloseProductHelp");
    const btnCloseProductHelpBottom = document.getElementById("btnCloseProductHelpBottom");

    const btnCloseRegisteredJan = document.getElementById("btnCloseRegisteredJan");
    const btnRegisteredJanPrice = document.getElementById("btnRegisteredJanPrice");
    const btnRegisteredJanSkip = document.getElementById("btnRegisteredJanSkip");

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

    if (cmbProductFilterCategory) {
        cmbProductFilterCategory.addEventListener(
            "change",
            () => {
                productFilterCategoryId =
                    cmbProductFilterCategory.value;
                displayProducts();
            }
        );
    }

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

    /*
     購入予定 ＋追加
     JANコードをカメラで読み取る
    */

    if (btnScanShoppingJan) {

        btnScanShoppingJan.addEventListener(

            "click",

            () => {

                /*
                 購入予定＋追加から
                 JAN読取を開いたことを記録
                */

                barcodeReadMode =
                    "shoppingAddJan";


                /*
                 購入予定画面を閉じる
                */

                const shoppingScreen =
                    document.getElementById(
                        "shoppingScreen"
                    );

                if (shoppingScreen) {

                    shoppingScreen.hidden =
                        true;

                }


                /*
                 コード読取画面を表示
                */

                const codeScreen =
                    document.getElementById(
                        "codeScreen"
                    );

                if (codeScreen) {

                    codeScreen.hidden =
                        false;

                }


                /*
                 カメラ開始
                */

                readCode();

            }

        );

    }

    if (btnFinishShopping) {

        btnFinishShopping.addEventListener(
            "click",
            finishShopping
        );

    }

    /*
     購入予定 表示切り替え
    */

    if (btnShoppingPending) {
        btnShoppingPending.addEventListener(
            "click",
            () => {
                changeShoppingView(
                    "pending"
                );
            }
        );
    }

    if (btnShoppingPurchased) {
        btnShoppingPurchased.addEventListener(
            "click",
            () => {
                changeShoppingView(
                    "purchased"
                );
            }
        );
    }


    if (btnShoppingHold) {
        btnShoppingHold.addEventListener(
            "click",
            () => {
                changeShoppingView(
                    "hold"
                );
            }
        );
    }


    if (btnShoppingAddView) {
        btnShoppingAddView.addEventListener(
            "click",
            () => {
                changeShoppingView(
                    "add"
                );
            }
        );
    }

    /*
     購入予定 商品詳細
    */

    if (btnBackShoppingDetail) {

        btnBackShoppingDetail.addEventListener(

            "click",

            openShopping

        );

    }


    if (btnShoppingMarkPurchased) {

        btnShoppingMarkPurchased.addEventListener(

            "click",

            () => {

                if (!shoppingDetailItemId) {

                    return;

                }


                changeShoppingItemStatus(

                    shoppingDetailItemId,

                    "purchased"

                );


                openShopping();

            }

        );

    }


    if (btnShoppingMarkHold) {

        btnShoppingMarkHold.addEventListener(

            "click",

            () => {

                if (!shoppingDetailItemId) {

                    return;

                }


                changeShoppingItemStatus(

                    shoppingDetailItemId,

                    "hold"

                );


                alert(
                    "保留に移動しました。\n\n14日後に完全削除されます。"
                );


                openShopping();

            }

        );

    }


    if (btnShoppingReturnPending) {

        btnShoppingReturnPending.addEventListener(

            "click",

            () => {

                if (!shoppingDetailItemId) {

                    return;

                }


                changeShoppingItemStatus(

                    shoppingDetailItemId,

                    "pending"

                );


                openShopping();

            }

        );

    }


    if (btnDeleteShoppingItem) {

        btnDeleteShoppingItem.addEventListener(

            "click",

            () => {

                if (!shoppingDetailItemId) {

                    return;

                }


                const deleted =
                    permanentlyDeleteShoppingItem(
                        shoppingDetailItemId
                    );


                if (!deleted) {

                    return;

                }


                openShopping();

            }

        );

    }

    if (btnSaveShoppingStoreCheck) {

        btnSaveShoppingStoreCheck.addEventListener(

            "click",

            saveShoppingStoreCheck

        );

    }

    if (btnSaveShoppingDetailJan) {

        btnSaveShoppingDetailJan.addEventListener(

            "click",

            saveShoppingDetailJanCode

        );

    }

    btnHistory.addEventListener("click", openHistory);

    if (cmbHistoryProductCategory) {
        cmbHistoryProductCategory.addEventListener(
            "change",
            () => {
                historyProductCategoryId =
                    cmbHistoryProductCategory.value;
                displayPriceHistoryByProduct();
            }
        );
    }

    if (btnHistoryHelp) {
        btnHistoryHelp.addEventListener(
            "click",
            () => {
                const help =
                    document.getElementById(
                        "historyHelp"
                    );
                if (!help) {
                    return;
                }
                help.hidden =
                    !help.hidden;
            }
        );
    }

    if (btnCloseHistoryHelp) {
        btnCloseHistoryHelp.addEventListener(
            "click",
            () => {
                const help =
                    document.getElementById(
                        "historyHelp"
                    );
                if (help) {
                    help.hidden = true;
                }
            }
        );
    }

    if (btnCloseHistoryHelpBottom) {
        btnCloseHistoryHelpBottom.addEventListener(
            "click",
            () => {
                const help =
                    document.getElementById(
                        "historyHelp"
                    );
                if (help) {
                    help.hidden = true;
                }
            }
        );
    }

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

    if (btnBackCheck) {
        btnBackCheck.addEventListener(
            "click",
            openHome
        );
    }

    if (btnCreateOuting) {
        btnCreateOuting.addEventListener(
            "click",
            openCreateOuting
        );
    }

    /*
     お出かけタイプ変更
    */

    if (cmbOutingType) {
        cmbOutingType.addEventListener(
            "change",
            updateOutingDateArea
        );
    }

    /*
     お出かけ一覧
     表示切替
    */

    if (btnOutingUpcoming) {
        btnOutingUpcoming.addEventListener(
            "click",
            () => {
                changeOutingListView(
                    "upcoming"
                );
            }
        );
    }

    if (btnOutingRoutine) {
        btnOutingRoutine.addEventListener(
            "click",
            () => {
                changeOutingListView(
                    "routine"
                );
            }
        );
    }

    if (btnOutingPast) {
        btnOutingPast.addEventListener(
            "click",
            () => {
                changeOutingListView(
                    "past"
                );
            }
        );
    }

    /*
     持ち物を追加
    */

    if (btnAddOutingItem) {
        btnAddOutingItem.addEventListener(
            "click",
            addOutingDraftItem
        );
    }

    /*
     お出かけを保存
    */

    if (btnSaveOuting) {
        btnSaveOuting.addEventListener(
            "click",
            saveCurrentOuting
        );
    }

    if (btnBackOutingCreate) {
        btnBackOutingCreate.addEventListener(
            "click",
            openCheck
        );
    }

    if (btnBackOutingCheck) {
        btnBackOutingCheck.addEventListener(
            "click",
            openCheck
        );
    }

    if (btnBackOutingPastDetail) {
        btnBackOutingPastDetail.addEventListener(
            "click",
            () => {
                outingListViewMode =
                    "past";
                openCheck();
            }
        );
    }

    /*
     お出かけ終了
    */

    if (btnCompleteOuting) {
        btnCompleteOuting.addEventListener(
            "click",
            completeCurrentOuting
        );
    }

    /*
     お出かけチェック
     状態切替
    */

    if (btnOutingPending) {
        btnOutingPending.addEventListener(
            "click",
            () => {
                changeOutingView(
                    "pending"
                );
            }
        );
    }

    if (btnOutingReady) {
        btnOutingReady.addEventListener(
            "click",
            () => {
                changeOutingView(
                    "ready"
                );
            }
        );
    }

    if (btnOutingHold) {
        btnOutingHold.addEventListener(
            "click",
            () => {
                changeOutingView(
                    "hold"
                );
            }
        );
    }

    if (btnOutingAdd) {
        btnOutingAdd.addEventListener(
            "click",
            () => {
                changeOutingView(
                    "add"
                );
            }
        );
    }

    btnSettings.addEventListener("click", openSettings);
    if (btnHomeFromProduct) {
        btnHomeFromProduct.addEventListener("click", openHome);
    }
    btnSaveProduct.addEventListener("click", saveProduct);

    if (btnProductTaxCalc) {
        btnProductTaxCalc.addEventListener(
            "click",
            () => {
                const panel =
                    document.getElementById(
                        "productTaxCalc"
                    );
                if (panel) {
                    panel.hidden =
                        !panel.hidden;
                }
            }
        );
    }

    if (btnUseProductTaxPrice) {

        btnUseProductTaxPrice.addEventListener(

            "click",

            () => {

                const basePrice =
                    document.getElementById(
                        "txtProductTaxExcluded"
                    );

                const priceType =
                    document.getElementById(
                        "cmbProductPriceType"
                    );

                const taxRate =
                    document.getElementById(
                        "cmbProductTaxRate"
                    );

                const discountType =
                    document.getElementById(
                        "cmbProductDiscountType"
                    );

                const discountValue =
                    document.getElementById(
                        "txtProductDiscountValue"
                    );

                const result =
                    document.getElementById(
                        "productTaxResult"
                    );

                const priceInput =
                    document.getElementById(
                        "txtPrice"
                    );


                const calculation =
                    calculateFinalPrice(

                        basePrice.value,

                        priceType.value,

                        taxRate.value,

                        discountType.value,

                        discountValue.value

                    );


                if (!calculation) {

                    result.textContent =
                        "入力内容を確認してください。";

                    return;

                }


                result.textContent =
                    "最終価格：" +
                    calculation.finalPrice +
                    "円";


                priceInput.value =
                    calculation.finalPrice;


                /*
                 履歴保存用に保持
                */

                productPriceCalculation =
                    calculation;

            }

        );

    }


    if (btnCloseProductTaxCalc) {
        btnCloseProductTaxCalc.addEventListener(
            "click",
            () => {
                const panel =
                    document.getElementById(
                        "productTaxCalc"
                    );
                if (panel) {
                    panel.hidden = true;
                }
            }
        );
    }

    /*
     購入予定 商品詳細
     価格計算を開く
    */

    if (btnShoppingTaxCalc) {

        btnShoppingTaxCalc.addEventListener(
            "click",
            () => {

                const panel =
                    document.getElementById(
                        "shoppingTaxCalc"
                    );

                if (panel) {

                    panel.hidden =
                        !panel.hidden;

                }

            }
        );

    }


    /*
     購入予定 商品詳細
     計算した価格を使用
    */

    if (btnUseShoppingTaxPrice) {

        btnUseShoppingTaxPrice.addEventListener(
            "click",
            () => {

                const basePrice =
                    document.getElementById(
                        "txtShoppingStorePriceTaxExcluded"
                    );

                const priceType =
                    document.getElementById(
                        "cmbShoppingPriceType"
                    );

                const taxRate =
                    document.getElementById(
                        "cmbShoppingTaxRate"
                    );

                const discountType =
                    document.getElementById(
                        "cmbShoppingDiscountType"
                    );

                const discountValue =
                    document.getElementById(
                        "txtShoppingDiscountValue"
                    );

                const result =
                    document.getElementById(
                        "shoppingTaxResult"
                    );

                const taxExcludedInput =
                    document.getElementById(
                        "txtShoppingStorePriceTaxExcluded"
                    );

                const taxIncludedInput =
                    document.getElementById(
                        "txtShoppingStorePriceTaxIncluded"
                    );


                const calculation =
                    calculateFinalPrice(
                        basePrice.value,
                        priceType.value,
                        taxRate.value,
                        discountType.value,
                        discountValue.value
                    );


                if (!calculation) {

                    result.textContent =
                        "入力内容を確認してください。";

                    return;

                }


                result.textContent =
                    "最終価格：" +
                    calculation.finalPrice +
                    "円";


                taxIncludedInput.value =
                    calculation.finalPrice;


                if (
                    priceType.value ===
                    "taxExcluded"
                ) {

                    taxExcludedInput.value =
                        basePrice.value;

                }

            }
        );

    }


    /*
     購入予定 商品詳細
     価格計算を閉じる
    */

    if (btnCloseShoppingTaxCalc) {

        btnCloseShoppingTaxCalc.addEventListener(
            "click",
            () => {

                const panel =
                    document.getElementById(
                        "shoppingTaxCalc"
                    );

                if (panel) {

                    panel.hidden =
                        true;

                }

            }
        );

    }

    if (btnPurchaseTaxCalc) {
        btnPurchaseTaxCalc.addEventListener(
            "click",
            () => {
                const panel =
                    document.getElementById(
                        "purchaseTaxCalc"
                    );
                if (panel) {
                    panel.hidden =
                        !panel.hidden;
                }
            }
        );
    }


    if (btnUsePurchaseTaxPrice) {

        btnUsePurchaseTaxPrice.addEventListener(

            "click",

            () => {

                const basePrice =
                    document.getElementById(
                        "txtPurchaseTaxExcluded"
                    );

                const taxRate =
                    document.getElementById(
                        "cmbPurchaseTaxRate"
                    );

                const result =
                    document.getElementById(
                        "purchaseTaxResult"
                    );

                const priceInput =
                    document.getElementById(
                        "txtPriceRecordPrice"
                    );


                const calculation =
                    calculateFinalPrice(

                        basePrice.value,

                        "taxExcluded",

                        taxRate.value,

                        "none",

                        0

                    );


                if (!calculation) {

                    result.textContent =
                        "入力内容を確認してください。";

                    return;

                }


                result.textContent =
                    "税込価格：" +
                    calculation.finalPrice +
                    "円";


                priceInput.value =
                    calculation.finalPrice;


                /*
                 履歴保存用に保持
                */

                purchasePriceCalculation =
                    calculation;

            }

        );

    }


    if (btnClosePurchaseTaxCalc) {
        btnClosePurchaseTaxCalc.addEventListener(
            "click",
            () => {
                const panel =
                    document.getElementById(
                        "purchaseTaxCalc"
                    );
                if (panel) {
                    panel.hidden = true;
                }
            }
        );
    }

    /*
     今回の購入
     JANコードをカメラで読み取る
    */

    if (btnScanPriceRecordJan) {

        btnScanPriceRecordJan.addEventListener(

            "click",

            () => {

                barcodeReadMode =
                    "priceRecordJan";


                /*
                 今回の購入画面を閉じる
                */

                const priceRecordScreen =
                    document.getElementById(
                        "priceRecordScreen"
                    );

                if (priceRecordScreen) {

                    priceRecordScreen.hidden =
                        true;

                }


                /*
                 コード読取画面を表示
                */

                const codeScreen =
                    document.getElementById(
                        "codeScreen"
                    );

                if (codeScreen) {

                    codeScreen.hidden =
                        false;

                }


                readCode();

            }

        );

    }

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

    /*
     登録済み商品の
     ジャンル絞り込み候補を更新
    */

    displayProductFilterCategories();

    /*
     登録済み商品を表示
    */

    displayProducts();

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


    /*
     購入予定画面を開いた時は
     「購入前」を表示
    */

    shoppingViewMode =
        "pending";


    shoppingProductFilter =
        "all";


    displayShoppingCategoryTabs();

    displayShoppingProductOptions();


    updateShoppingViewButtons();

    updateShoppingCounts();

    displayShoppingItemsByCurrentView();


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

    hideAllScreens();


    /*
     保存済みお出かけを表示
    */

    displayOutings();


    const checkScreen =
        document.getElementById(
            "checkScreen"
        );


    if (checkScreen) {

        checkScreen.hidden =
            false;

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

function openCreateOuting() {

    /*
     新規作成なので
     作成途中データをリセット
    */

    outingDraftItems =
        [];


    const nameInput =
        document.getElementById(
            "txtOutingName"
        );

    const itemInput =
        document.getElementById(
            "txtOutingItemName"
        );

    const typeSelect =
        document.getElementById(
            "cmbOutingType"
        );

    const dateInput =
        document.getElementById(
            "txtOutingDate"
        );

    const message =
        document.getElementById(
            "outingCreateMessage"
        );


    if (nameInput) {

        nameInput.value =
            "";

    }


    if (itemInput) {

        itemInput.value =
            "";

    }

    if (typeSelect) {

        typeSelect.value =
            "scheduled";

    }


    if (dateInput) {

        dateInput.value =
            "";

    }


    updateOutingDateArea();

    if (message) {

        message.textContent =
            "";

    }


    displayOutingDraftItems();


    hideAllScreens();


    const outingCreateScreen =
        document.getElementById(
            "outingCreateScreen"
        );


    if (outingCreateScreen) {

        outingCreateScreen.hidden =
            false;

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

/* ==========================================
   お出かけ作成
   日付欄切替
   ========================================== */

function updateOutingDateArea() {

    const typeSelect =
        document.getElementById(
            "cmbOutingType"
        );

    const dateArea =
        document.getElementById(
            "outingDateArea"
        );


    if (
        !typeSelect ||
        !dateArea
    ) {

        return;

    }


    /*
     1回のお出かけだけ
     日付を表示
    */

    dateArea.hidden =
        typeSelect.value ===
        "routine";

}

/* ==========================================
   お出かけ作成
   持ち物追加
   ========================================== */

function addOutingDraftItem() {

    const itemInput =
        document.getElementById(
            "txtOutingItemName"
        );

    const message =
        document.getElementById(
            "outingCreateMessage"
        );


    if (!itemInput) {

        return;

    }


    const itemName =
        itemInput.value.trim();


    /*
     未入力
    */

    if (itemName === "") {

        if (message) {

            message.textContent =
                "持っていく物を入力してください。";

        }

        itemInput.focus();

        return;

    }


    /*
     同じ持ち物の重複防止
    */

    const duplicate =
        outingDraftItems.some(

            item =>
                item.name ===
                itemName

        );


    if (duplicate) {

        if (message) {

            message.textContent =
                "同じ持ち物がすでに追加されています。";

        }

        itemInput.focus();

        return;

    }


    /*
     作成中リストへ追加
    */

    outingDraftItems.push({

        id:
            "outing-item-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 7),

        name:
            itemName

    });


    /*
     入力欄を空にする
    */

    itemInput.value =
        "";


    if (message) {

        message.textContent =
            "持ち物を追加しました。";

    }


    displayOutingDraftItems();


    itemInput.focus();

}

/* ==========================================
   お出かけ
   保存データ読込
   ========================================== */

function loadOutings() {

    const saved =
        localStorage.getItem(
            "outings"
        );


    if (!saved) {

        outings =
            [];

        return;

    }


    try {

        const parsed =
            JSON.parse(
                saved
            );


        outings =
            Array.isArray(parsed)
                ? parsed
                : [];


        /*
         古いお出かけデータへの対応
        
         statusがない場合は
         「予定」として扱う
        */

        for (const outing of outings) {

            if (!outing.status) {

                outing.status =
                    "upcoming";

            }


            /*
             typeがない旧データも
             1回のお出かけとして扱う
            */

            if (!outing.type) {

                outing.type =
                    "scheduled";

            }


            /*
             itemsがない場合の安全対策
            */

            if (
                !Array.isArray(
                    outing.items
                )
            ) {

                outing.items =
                    [];

            }


            /*
             古い持ち物にも
             statusを追加
            */

            for (
                const item of
                outing.items
            ) {

                if (!item.status) {

                    item.status =
                        "pending";

                }

            }

        }


        /*
         変換した旧データを
         新しい形式で保存
        */

        saveOutings();

    } catch (error) {

        console.error(
            "お出かけデータの読込に失敗しました。",
            error
        );

        outings =
            [];

    }

}

/* ==========================================
   お出かけ
   保存
   ========================================== */

function saveOutings() {

    localStorage.setItem(

        "outings",

        JSON.stringify(
            outings
        )

    );

}

/* ==========================================
   お出かけ作成
   持ち物一覧表示
   ========================================== */

function displayOutingDraftItems() {

    const list =
        document.getElementById(
            "outingItemList"
        );


    if (!list) {

        return;

    }


    list.innerHTML =
        "";


    /*
     まだ持ち物がない
    */

    if (
        outingDraftItems.length === 0
    ) {

        list.innerHTML = `

            <p class="check-empty-message">

                まだ持ち物は登録されていません。

            </p>

        `;

        return;

    }


    /*
     持ち物を表示
    */

    for (
        const item of
        outingDraftItems
    ) {

        const row =
            document.createElement(
                "div"
            );

        row.className =
            "outing-draft-item";


        row.innerHTML = `

            <span class="outing-draft-item-name">

                ${item.name}

            </span>


            <button
                type="button"
                class="outing-draft-delete-button"
                onclick="deleteOutingDraftItem('${item.id}')">

                🗑 削除

            </button>

        `;


        list.appendChild(
            row
        );

    }

}

/* ==========================================
   お出かけ作成
   持ち物削除
   ========================================== */

function deleteOutingDraftItem(
    itemId
) {

    outingDraftItems =
        outingDraftItems.filter(

            item =>
                item.id !==
                itemId

        );


    displayOutingDraftItems();

}

/* ==========================================
   お出かけ
   新規保存
   ========================================== */

function saveCurrentOuting() {

    const nameInput =
        document.getElementById(
            "txtOutingName"
        );

    const typeSelect =
        document.getElementById(
            "cmbOutingType"
        );

    const dateInput =
        document.getElementById(
            "txtOutingDate"
        );

    const message =
        document.getElementById(
            "outingCreateMessage"
        );


    if (!nameInput) {

        return;

    }


    const outingName =
        nameInput.value.trim();

    const outingType =
        typeSelect
            ? typeSelect.value
            : "scheduled";


    const outingDate =
        dateInput
            ? dateInput.value
            : "";

    /*
     お出かけ名チェック
    */

    if (outingName === "") {

        if (message) {

            message.textContent =
                "お出かけ名を入力してください。";

        }

        nameInput.focus();

        return;

    }

    /*
     1回のお出かけは
     日付必須
    */

    if (
        outingType ===
        "scheduled" &&
        outingDate ===
        ""
    ) {

        if (message) {

            message.textContent =
                "お出かけ日を選択してください。";

        }

        if (dateInput) {

            dateInput.focus();

        }

        return;

    }

    /*
     持ち物チェック
    */

    if (
        outingDraftItems.length === 0
    ) {

        if (message) {

            message.textContent =
                "持っていく物を1つ以上追加してください。";

        }

        return;

    }


    /*
     同名チェック
    */

    const duplicate =
        outings.some(

            outing =>
                outing.name ===
                outingName

        );


    if (duplicate) {

        if (message) {

            message.textContent =
                "同じ名前のお出かけがすでに登録されています。";

        }

        nameInput.focus();

        return;

    }


    const now =
        new Date().toISOString();


    outings.push({

        id:
            "outing-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 7),

        name:
            outingName,


        /*
         scheduled = 1回のお出かけ
         routine   = 繰り返し
        */

        type:
            outingType,


        /*
         1回のお出かけだけ
         日付を保存
        */

        date:
            outingType ===
                "scheduled"
                ? outingDate
                : null,


        /*
         1回のお出かけは予定から開始
        
         繰り返しはroutineとして管理
        */

        status:
            outingType ===
                "scheduled"
                ? "upcoming"
                : "routine",


        items:
            outingDraftItems.map(

                item => ({

                    id:
                        item.id,

                    name:
                        item.name

                })

            ),

        createdAt:
            now,

        updatedAt:
            now

    });


    saveOutings();


    /*
     作成途中データをリセット
    */

    outingDraftItems =
        [];


    if (message) {

        message.textContent =
            "";

    }


    openCheck();

}

/* ==========================================
   お出かけ一覧
   表示切替
   ========================================== */

function changeOutingListView(
    viewMode
) {

    outingListViewMode =
        viewMode;


    updateOutingListTabs();

    displayOutings();

}

/* ==========================================
   お出かけ一覧
   タブ表示更新
   ========================================== */

function updateOutingListTabs() {

    const buttons = {

        upcoming:
            document.getElementById(
                "btnOutingUpcoming"
            ),

        routine:
            document.getElementById(
                "btnOutingRoutine"
            ),

        past:
            document.getElementById(
                "btnOutingPast"
            )

    };


    for (
        const [mode, button] of
        Object.entries(buttons)
    ) {

        if (!button) {

            continue;

        }


        button.classList.toggle(

            "active",

            outingListViewMode ===
            mode

        );

    }

}

/* ==========================================
   お出かけ一覧
   件数更新
   ========================================== */

function updateOutingListCounts() {

    const upcomingCount =
        outings.filter(

            outing =>
                outing.status ===
                "upcoming"

        ).length;


    const routineCount =
        outings.filter(

            outing =>
                outing.status ===
                "routine"

        ).length;


    const pastCount =
        outings.filter(

            outing =>
                outing.status ===
                "completed"

        ).length;


    const upcomingElement =
        document.getElementById(
            "outingUpcomingCount"
        );

    const routineElement =
        document.getElementById(
            "outingRoutineCount"
        );

    const pastElement =
        document.getElementById(
            "outingPastCount"
        );


    if (upcomingElement) {

        upcomingElement.textContent =
            upcomingCount;

    }


    if (routineElement) {

        routineElement.textContent =
            routineCount;

    }


    if (pastElement) {

        pastElement.textContent =
            pastCount;

    }

}

/* ==========================================
   お出かけ
   一覧表示
   ========================================== */

function displayOutings() {

    const list =
        document.getElementById(
            "outingList"
        );


    if (!list) {

        return;

    }


    list.innerHTML =
        "";


    /*
     予定・いつも使う・過去
     件数と選択状態を更新
    */

    updateOutingListCounts();

    updateOutingListTabs();


    /*
     現在のタブに対応する
     お出かけ状態を決める
    */

    let targetStatus =
        outingListViewMode;


    if (
        outingListViewMode ===
        "past"
    ) {

        targetStatus =
            "completed";

    }


    const filteredOutings =
        outings.filter(

            outing =>
                outing.status ===
                targetStatus

        );


    if (
        filteredOutings.length === 0
    ) {

        list.innerHTML = `

        <p class="check-empty-message">

            まだ登録されていません。

        </p>

    `;

        return;

    }


    /*
     過去タブだけ
     年月別表示
    */

    if (
        outingListViewMode ===
        "past"
    ) {

        displayPastOutingsByMonth(
            filteredOutings,
            list
        );

        return;

    }


    for (
        const outing of
        filteredOutings
    ) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "outing-card";


        /*
         予定のお出かけだけ
         日付を表示
        */

        let outingDateHtml =
            "";


        if (
            outing.status ===
            "upcoming" &&
            outing.date
        ) {

            const outingDate =
                new Date(
                    outing.date +
                    "T00:00:00"
                );


            if (
                !Number.isNaN(
                    outingDate.getTime()
                )
            ) {

                const dateText =

                    String(
                        outingDate.getMonth() + 1
                    ).padStart(
                        2,
                        "0"
                    ) +

                    "/" +

                    String(
                        outingDate.getDate()
                    ).padStart(
                        2,
                        "0"
                    );


                outingDateHtml = `

            <span class="outing-card-date">

                ${dateText}

            </span>

        `;

            }

        }


        card.innerHTML = `

            <button
                type="button"
                class="outing-card-button"
                onclick="openOutingCheck('${outing.id}')">

                ${outingDateHtml}

                <span class="outing-card-name">

                    ${outing.name}

                </span>

                <span class="outing-card-count">

                    ${outing.items.length}項目

                </span>

            </button>

        `;


        list.appendChild(
            card
        );

    }

}

/* ==========================================
   過去のお出かけ
   年月別表示
   ========================================== */

function displayPastOutingsByMonth(
    pastOutings,
    list
) {

    const monthlyOutings = {};


    /*
     終了日時ごとに年月を作る
    */

    for (
        const outing of
        pastOutings
    ) {

        const baseDate =
            outing.completedAt ||
            outing.date ||
            outing.updatedAt ||
            outing.createdAt;


        const date =
            new Date(
                baseDate
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            continue;

        }


        const monthKey =

            date.getFullYear() +

            "-" +

            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        if (
            !monthlyOutings[
            monthKey
            ]
        ) {

            monthlyOutings[
                monthKey
            ] = [];

        }


        monthlyOutings[
            monthKey
        ].push(
            outing
        );

    }


    /*
     新しい年月から表示
    */

    const monthKeys =
        Object.keys(
            monthlyOutings
        )
            .sort()
            .reverse();


    monthKeys.forEach(

        (
            monthKey,
            monthIndex
        ) => {

            const [
                year,
                month
            ] =
                monthKey.split(
                    "-"
                );


            const outingsForMonth =
                monthlyOutings[
                monthKey
                ];


            /*
             最新月だけ開く
            */

            const isOpen =
                monthIndex === 0;


            const section =
                document.createElement(
                    "section"
                );


            section.className =
                "outing-past-month";


            section.innerHTML = `

                <button
                    type="button"
                    class="outing-past-month-header"
                    aria-expanded="${isOpen}"
                    onclick="toggleOutingPastMonth(this)">

                    <span class="outing-past-month-arrow">

                        ${isOpen ? "▼" : "▶"}

                    </span>

                    <span>

                        ${Number(year)}年
                        ${Number(month)}月

                    </span>

                    <span>

                        ${outingsForMonth.length}件

                    </span>

                </button>


                <div
                    class="outing-past-month-content"
                    ${isOpen ? "" : "hidden"}>

                </div>

            `;


            const content =
                section.querySelector(
                    ".outing-past-month-content"
                );


            for (
                const outing of
                outingsForMonth
            ) {

                const date =
                    new Date(

                        outing.completedAt ||
                        outing.date ||
                        outing.updatedAt ||
                        outing.createdAt

                    );


                const dateText =

                    String(
                        date.getMonth() + 1
                    ).padStart(
                        2,
                        "0"
                    ) +

                    "/" +

                    String(
                        date.getDate()
                    ).padStart(
                        2,
                        "0"
                    );


                const card =
                    document.createElement(
                        "button"
                    );


                card.type =
                    "button";


                card.className =
                    "outing-past-card";


                card.innerHTML = `

                    <span class="outing-past-date">

                        ${dateText}

                    </span>

                    <strong>

                        ${outing.name}

                    </strong>

                    <span>

                        ${outing.items.length}項目

                    </span>

                `;


                card.addEventListener(

                    "click",

                    () => {

                        openPastOutingDetail(
                            outing.id
                        );

                    }

                );


                content.appendChild(
                    card
                );

            }


            list.appendChild(
                section
            );

        }

    );

}

/* ==========================================
   過去のお出かけ
   年月開閉
   ========================================== */

function toggleOutingPastMonth(
    button
) {

    const section =
        button.closest(
            ".outing-past-month"
        );


    if (!section) {

        return;

    }


    const content =
        section.querySelector(
            ".outing-past-month-content"
        );

    const arrow =
        button.querySelector(
            ".outing-past-month-arrow"
        );


    if (
        !content ||
        !arrow
    ) {

        return;

    }


    const willOpen =
        content.hidden;


    content.hidden =
        !willOpen;


    button.setAttribute(

        "aria-expanded",

        String(
            willOpen
        )

    );


    arrow.textContent =
        willOpen
            ? "▼"
            : "▶";

}

/* ==========================================
   過去のお出かけ
   詳細表示
   ========================================== */

function openPastOutingDetail(
    outingId
) {

    const outing =
        outings.find(

            outing =>
                outing.id ===
                outingId

        );


    if (!outing) {

        return;

    }


    hideAllScreens();


    const screen =
        document.getElementById(
            "outingPastDetailScreen"
        );

    const title =
        document.getElementById(
            "outingPastDetailTitle"
        );

    const dateElement =
        document.getElementById(
            "outingPastDetailDate"
        );

    const itemsElement =
        document.getElementById(
            "outingPastDetailItems"
        );


    if (title) {

        title.textContent =
            "🎒 " +
            outing.name;

    }


    /*
     日付表示
    */

    if (dateElement) {

        const baseDate =
            outing.date ||
            outing.completedAt;


        if (baseDate) {

            const date =
                new Date(
                    baseDate
                );


            dateElement.textContent =

                date.getFullYear() +

                "/" +

                String(
                    date.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                ) +

                "/" +

                String(
                    date.getDate()
                ).padStart(
                    2,
                    "0"
                );

        } else {

            dateElement.textContent =
                "日付：記録なし";

        }

    }


    /*
     持ち物表示
    */

    if (itemsElement) {

        itemsElement.innerHTML =
            "";


        if (
            outing.items.length === 0
        ) {

            itemsElement.innerHTML = `

                <p class="check-empty-message">

                    持ち物の記録はありません。

                </p>

            `;

        } else {

            for (
                const item of
                outing.items
            ) {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "outing-past-detail-item";


                let statusText =
                    "準備前";


                if (
                    item.status ===
                    "ready"
                ) {

                    statusText =
                        "準備済";

                } else if (
                    item.status ===
                    "hold"
                ) {

                    statusText =
                        "保留";

                }


                row.innerHTML = `

                    <span>

                        ${item.name}

                    </span>

                    <span>

                        ${statusText}

                    </span>

                `;


                itemsElement.appendChild(
                    row
                );

            }

        }

    }


    if (screen) {

        screen.hidden =
            false;

    }


    window.scrollTo({

        top: 0,

        behavior:
            "smooth"

    });

}

/* ==========================================
   お出かけ
   チェック画面を開く
   ========================================== */

function openOutingCheck(
    outingId
) {

    const outing =
        outings.find(

            outing =>
                outing.id ===
                outingId

        );


    if (!outing) {

        return;

    }


    /*
     現在開いている
     お出かけを記憶
    */

    currentOutingId =
        outingId;


    /*
     最初は準備前
    */

    outingViewMode =
        "pending";


    /*
     古いデータにも
     statusを付ける
    */

    for (
        const item of
        outing.items
    ) {

        if (!item.status) {

            item.status =
                "pending";

        }

    }


    hideAllScreens();


    const screen =
        document.getElementById(
            "outingCheckScreen"
        );

    const title =
        document.getElementById(
            "outingCheckTitle"
        );

    const dateElement =
        document.getElementById(
            "outingCheckDate"
        );

    if (title) {

        title.textContent =
            "🎒 " +
            outing.name;

    }

    /*
     予定のお出かけの日付表示
    */

    if (dateElement) {

        if (
            outing.status ===
            "upcoming" &&
            outing.date
        ) {

            const outingDate =
                new Date(
                    outing.date +
                    "T00:00:00"
                );


            if (
                !Number.isNaN(
                    outingDate.getTime()
                )
            ) {

                dateElement.textContent =

                    outingDate.getFullYear() +

                    "/" +

                    String(
                        outingDate.getMonth() + 1
                    ).padStart(
                        2,
                        "0"
                    ) +

                    "/" +

                    String(
                        outingDate.getDate()
                    ).padStart(
                        2,
                        "0"
                    );

                dateElement.hidden =
                    false;

            }

        } else {

            dateElement.textContent =
                "";

            dateElement.hidden =
                true;

        }

    }

    /*
     お出かけ終了エリア

     予定のお出かけだけ表示する
     いつも使う・過去では非表示
    */

    const completeArea =
        document.getElementById(
            "outingCompleteArea"
        );


    if (completeArea) {

        completeArea.hidden =

            outing.status !==
            "upcoming" ||

            outingViewMode ===
            "add";

    }

    if (screen) {

        screen.hidden =
            false;

    }


    updateOutingCounts();

    updateOutingViewButtons();

    displayOutingItemsByCurrentView();


    window.scrollTo({

        top: 0,

        behavior:
            "smooth"

    });

}

/* ==========================================
   お出かけ
   表示切替
   ========================================== */

function changeOutingView(
    viewMode
) {

    outingViewMode =
        viewMode;


    updateOutingViewButtons();


    /*
     ＋追加画面では
     お出かけ終了を非表示
    */

    const outing =
        outings.find(

            outing =>
                outing.id ===
                currentOutingId

        );


    const completeArea =
        document.getElementById(
            "outingCompleteArea"
        );


    if (
        outing &&
        completeArea
    ) {

        completeArea.hidden =

            outing.status !==
            "upcoming" ||

            outingViewMode ===
            "add";

    }


    displayOutingItemsByCurrentView();

}

/* ==========================================
   お出かけ
   表示ボタン更新
   ========================================== */

function updateOutingViewButtons() {

    const buttons = {

        pending:
            document.getElementById(
                "btnOutingPending"
            ),

        ready:
            document.getElementById(
                "btnOutingReady"
            ),

        hold:
            document.getElementById(
                "btnOutingHold"
            ),

        add:
            document.getElementById(
                "btnOutingAdd"
            )

    };


    for (
        const [mode, button] of
        Object.entries(buttons)
    ) {

        if (!button) {

            continue;

        }


        button.classList.toggle(

            "active",

            outingViewMode ===
            mode

        );

    }

}

/* ==========================================
   お出かけ
   件数更新
   ========================================== */

function updateOutingCounts() {

    const outing =
        outings.find(

            outing =>
                outing.id ===
                currentOutingId

        );


    if (!outing) {

        return;

    }


    const pendingCount =
        outing.items.filter(

            item =>
                item.status ===
                "pending"

        ).length;


    const readyCount =
        outing.items.filter(

            item =>
                item.status ===
                "ready"

        ).length;


    const holdCount =
        outing.items.filter(

            item =>
                item.status ===
                "hold"

        ).length;


    const pendingElement =
        document.getElementById(
            "outingPendingCount"
        );

    const readyElement =
        document.getElementById(
            "outingReadyCount"
        );

    const holdElement =
        document.getElementById(
            "outingHoldCount"
        );


    if (pendingElement) {

        pendingElement.textContent =
            pendingCount;

    }


    if (readyElement) {

        readyElement.textContent =
            readyCount;

    }


    if (holdElement) {

        holdElement.textContent =
            holdCount;

    }

}

/* ==========================================
   お出かけ
   現在の状態の商品表示
   ========================================== */

function displayOutingItemsByCurrentView() {

    const list =
        document.getElementById(
            "outingCheckItemList"
        );


    if (!list) {

        return;

    }


    list.innerHTML =
        "";


    const outing =
        outings.find(

            outing =>
                outing.id ===
                currentOutingId

        );


    if (!outing) {

        return;

    }


    /*
     ＋追加
    */

    if (
        outingViewMode ===
        "add"
    ) {

        list.innerHTML = `

        <div class="outing-add-item-area">

            <label for="txtOutingAddItemName">

                持っていく物

            </label>


            <input
                type="text"
                id="txtOutingAddItemName"
                placeholder="例：飲み物">


            <button
                type="button"
                id="btnAddItemToCurrentOuting"
                class="btn-main">

                ＋ 持ち物を追加

            </button>


            <p
                id="outingAddItemMessage"
                class="shopping-detail-guide">
            </p>

        </div>

    `;


        const addButton =
            document.getElementById(
                "btnAddItemToCurrentOuting"
            );


        if (addButton) {

            addButton.addEventListener(

                "click",

                addItemToCurrentOuting

            );

        }


        return;

    }


    const filteredItems =
        outing.items.filter(

            item =>
                item.status ===
                outingViewMode

        );


    if (
        filteredItems.length === 0
    ) {

        list.innerHTML = `

            <p class="check-empty-message">

                この状態の持ち物はありません。

            </p>

        `;

        return;

    }


    for (
        const item of
        filteredItems
    ) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "outing-check-card";


        let actionButtonsHtml =
            "";

        /*
         購入して準備済になった持ち物の表示
        */

        const shoppingReadyMark =
            item.readySource === "shopping"
                ? "🛒 "
                : "";

        const shoppingReadyText =
            item.readySource === "shopping"
                ? `
                    <span class="outing-ready-source">
                        購入して準備済
                    </span>
                  `
                : "";

        /*
         準備前
        */

        if (
            outingViewMode ===
            "pending"
        ) {

            actionButtonsHtml = `

        <button
            type="button"
            class="outing-item-ready-button"
            onclick="changeOutingItemStatus('${item.id}', 'ready')">

            ✓ 準備済にする

        </button>


        <button
            type="button"
            class="outing-item-shopping-button"
            onclick="addOutingItemToShopping('${item.id}')">

            🛒 購入予定に追加

        </button>


        <button
            type="button"
            class="outing-item-hold-button"
            onclick="changeOutingItemStatus('${item.id}', 'hold')">

            一旦保留

        </button>

    `;

        }


        /*
         準備済
        */

        else if (
            outingViewMode ===
            "ready"
        ) {

            actionButtonsHtml = `

        <button
            type="button"
            class="outing-item-pending-button"
            onclick="changeOutingItemStatus('${item.id}', 'pending')">

            準備前に戻す

        </button>


        <button
            type="button"
            class="outing-item-hold-button"
            onclick="changeOutingItemStatus('${item.id}', 'hold')">

            一旦保留

        </button>

    `;

        }


        /*
         保留
        */

        else if (
            outingViewMode ===
            "hold"
        ) {

            actionButtonsHtml = `

        <button
            type="button"
            class="outing-item-pending-button"
            onclick="changeOutingItemStatus('${item.id}', 'pending')">

            準備前に戻す

        </button>


        <button
            type="button"
            class="outing-item-ready-button"
            onclick="changeOutingItemStatus('${item.id}', 'ready')">

            ✓ 準備済にする

        </button>

    `;

        }


        card.innerHTML = `

        <strong class="outing-check-item-name">

            ${shoppingReadyMark}${item.name}

        </strong>

        ${shoppingReadyText}


        <div class="outing-check-item-buttons">

        ${actionButtonsHtml}

    </div>

`;


        list.appendChild(
            card
        );

    }

}

/* ==========================================
   お出かけ
   現在のお出かけへ持ち物追加
   ========================================== */

function addItemToCurrentOuting() {

    if (!currentOutingId) {

        return;

    }


    const outing =
        outings.find(

            outing =>
                outing.id ===
                currentOutingId

        );


    if (!outing) {

        return;

    }


    const input =
        document.getElementById(
            "txtOutingAddItemName"
        );

    const message =
        document.getElementById(
            "outingAddItemMessage"
        );


    if (!input) {

        return;

    }


    const itemName =
        input.value.trim();


    /*
     未入力
    */

    if (itemName === "") {

        if (message) {

            message.textContent =
                "持っていく物を入力してください。";

        }

        input.focus();

        return;

    }


    /*
     同じお出かけ内で
     持ち物重複チェック
    */

    const duplicate =
        outing.items.some(

            item =>
                item.name ===
                itemName

        );


    if (duplicate) {

        if (message) {

            message.textContent =
                "同じ持ち物がすでに登録されています。";

        }

        input.focus();

        return;

    }


    const now =
        new Date().toISOString();


    outing.items.push({

        id:
            "outing-item-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 7),

        name:
            itemName,

        status:
            "pending",

        createdAt:
            now,

        updatedAt:
            now

    });


    outing.updatedAt =
        now;


    /*
     保存
    */

    saveOutings();


    /*
     準備前へ戻す
    */

    outingViewMode =
        "pending";


    /*
     件数・タブ・一覧を更新
    */

    updateOutingCounts();

    updateOutingViewButtons();

    displayOutingItemsByCurrentView();

}

/* ==========================================
   お出かけ
   持ち物の状態変更
   ========================================== */

function changeOutingItemStatus(
    itemId,
    newStatus
) {

    if (!currentOutingId) {

        return;

    }


    const outing =
        outings.find(

            outing =>
                outing.id ===
                currentOutingId

        );


    if (!outing) {

        return;

    }


    const item =
        outing.items.find(

            item =>
                item.id ===
                itemId

        );


    if (!item) {

        return;

    }


    /*
     状態変更
    */

    item.status =
        newStatus;

    /*
     手動で状態を変更した場合は
     購入由来の準備済情報を解除
    */

    item.readySource =
        null;

    item.updatedAt =
        new Date().toISOString();


    outing.updatedAt =
        new Date().toISOString();


    /*
     localStorageへ保存
    */

    saveOutings();


    /*
     準備前・準備済・保留の
     件数をその場で更新
    */

    updateOutingCounts();


    /*
     上部タブの選択状態を更新
    */

    updateOutingViewButtons();


    /*
     現在表示している一覧を再表示
    */

    displayOutingItemsByCurrentView();

}

/* ==========================================
   お出かけ
   持ち物を購入予定へ追加
   ========================================== */

function addOutingItemToShopping(
    itemId
) {

    if (!currentOutingId) {

        return;

    }


    const outing =
        outings.find(

            outing =>
                outing.id ===
                currentOutingId

        );


    if (!outing) {

        return;

    }


    const outingItem =
        outing.items.find(

            item =>
                item.id ===
                itemId

        );


    if (!outingItem) {

        return;

    }


    /*
     すでにこの持ち物から
     購入予定へ追加済みか確認
    */

    const alreadyLinked =
        shoppingItems.find(

            shoppingItem =>

                Array.isArray(
                    shoppingItem.outingLinks
                ) &&

                shoppingItem.outingLinks.some(

                    link =>

                        link.outingId ===
                        outing.id &&

                        link.outingItemId ===
                        outingItem.id

                )

        );


    if (alreadyLinked) {

        alert(
            "この持ち物はすでに購入予定に追加されています。"
        );

        return;

    }


    /*
     商品登録に同じ名前の商品があれば
     登録済み商品として使用
    */

    const registeredProduct =
        products.find(

            product =>

                product.active !== false &&

                product.name.trim() ===
                outingItem.name.trim()

        );


    /*
     同じ商品がすでに購入予定にあるか
     確認
    */

    let shoppingItem =
        null;


    if (registeredProduct) {

        shoppingItem =
            shoppingItems.find(

                item =>
                    item.productId ===
                    registeredProduct.id

            );

    } else {

        shoppingItem =
            shoppingItems.find(

                item =>

                    !item.productId &&

                    (
                        item.productName ||
                        ""
                    ).trim() ===
                    outingItem.name.trim()

            );

    }


    const now =
        new Date().toISOString();


    /*
     すでに購入予定にある場合
     お出かけとの関連だけ追加
    */

    if (shoppingItem) {

        if (
            !Array.isArray(
                shoppingItem.outingLinks
            )
        ) {

            shoppingItem.outingLinks =
                [];

        }


        shoppingItem.outingLinks.push({

            outingId:
                outing.id,

            outingItemId:
                outingItem.id

        });


        /*
         購入前へ戻す
        */

        shoppingItem.status =
            "pending";

        shoppingItem.holdStartedAt =
            null;

        shoppingItem.updatedAt =
            now;

    } else {

        /*
         新しく購入予定へ追加
        */

        shoppingItem = {

            id:
                "shopping-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .slice(2, 8),

            productId:
                registeredProduct
                    ? registeredProduct.id
                    : null,

            productName:
                registeredProduct
                    ? undefined
                    : outingItem.name,

            quantity:
                1,

            needsRegistration:
                registeredProduct
                    ? false
                    : true,

            status:
                "pending",

            holdStartedAt:
                null,

            outingLinks: [

                {

                    outingId:
                        outing.id,

                    outingItemId:
                        outingItem.id

                }

            ],

            createdAt:
                now,

            updatedAt:
                now

        };


        shoppingItems.push(
            shoppingItem
        );

    }


    /*
     購入予定保存
    */

    saveShoppingItems();


    /*
     お出かけ側にも
     購入予定IDを記録
    */

    outingItem.shoppingItemId =
        shoppingItem.id;

    outingItem.updatedAt =
        now;

    outing.updatedAt =
        now;


    saveOutings();


    alert(

        "「" +
        outingItem.name +
        "」を購入予定に追加しました。"

    );

}

/* ==========================================
   お出かけ
   購入完了した持ち物を準備済へ
   ========================================== */

function completeOutingItemsFromShopping(
    shoppingItem
) {

    if (
        !shoppingItem ||
        !Array.isArray(
            shoppingItem.outingLinks
        )
    ) {

        return;

    }


    let changed =
        false;


    for (
        const link of
        shoppingItem.outingLinks
    ) {

        const outing =
            outings.find(

                outing =>
                    outing.id ===
                    link.outingId

            );


        if (!outing) {

            continue;

        }


        const outingItem =
            outing.items.find(

                item =>
                    item.id ===
                    link.outingItemId

            );


        if (!outingItem) {

            continue;

        }


        /*
         購入完了
         → 準備済
        */

        outingItem.status =
            "ready";

        /*
         準備済になった理由
         shopping = 購入して準備済
        */

        outingItem.readySource =
            "shopping";

        outingItem.updatedAt =
            new Date().toISOString();

        /*
         購入予定との関連を解除
        */

        outingItem.shoppingItemId =
            null;


        outing.updatedAt =
            new Date().toISOString();


        changed =
            true;

    }


    if (changed) {

        saveOutings();

    }

}

/* ==========================================
   お出かけ
   終了して過去へ移動
   ========================================== */

function completeCurrentOuting() {

    if (!currentOutingId) {

        return;

    }


    const outing =
        outings.find(

            outing =>
                outing.id ===
                currentOutingId

        );


    if (!outing) {

        return;

    }


    /*
     「いつも使う」は
     過去へ移動させない
    */

    if (
        outing.status ===
        "routine"
    ) {

        return;

    }


    /*
     すでに終了している場合も
     何もしない
    */

    if (
        outing.status ===
        "completed"
    ) {

        return;

    }


    const confirmed =
        confirm(

            "このお出かけを終了しますか？\n\n" +

            "「" +
            outing.name +
            "」\n\n" +

            "終了すると「過去」へ移動します。"

        );


    if (!confirmed) {

        return;

    }


    /*
     過去へ移動
    */

    outing.status =
        "completed";


    /*
     終了日時も保存
    */

    outing.completedAt =
        new Date().toISOString();


    outing.updatedAt =
        new Date().toISOString();


    saveOutings();


    /*
     開いているお出かけを解除
    */

    currentOutingId =
        null;


    /*
     過去タブへ自動で切り替える
    */

    outingListViewMode =
        "past";


    openCheck();

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

        /*
         JAN重複チェック
        */


        /*
         登録済み商品に
         同じJANがあるか確認
        */

        const existingProduct =
            products.find(

                product =>

                    product.active &&

                    janCode !== "" &&

                    (
                        product.janCode === janCode ||
                        product.jan === janCode
                    )

            );


        if (existingProduct) {

            const message =
                document.getElementById(
                    "productMessage"
                );

            if (message) {

                message.textContent =
                    "この商品はすでに登録されています。新しく登録する必要はありません。";

            }

            alert(
                "この商品はすでに登録されています。\n\n" +
                "商品名：" +
                existingProduct.name +
                "\n\n" +
                "同じ商品は新しく登録できません。"
            );

            return;

        }


        /*
         削除済み商品に
         同じJANがあるか確認
        */

        const deletedProduct =
            products.find(

                product =>

                    !product.active &&

                    janCode !== "" &&

                    (
                        product.janCode === janCode ||
                        product.jan === janCode
                    )

            );


        if (deletedProduct) {

            const restoreConfirmed =
                confirm(

                    "この商品は削除済みアイテムにあります。\n\n" +
                    "商品名：" +
                    deletedProduct.name +
                    "\n\n" +
                    "新しく登録せず、復元しますか？"

                );


            if (!restoreConfirmed) {

                const message =
                    document.getElementById(
                        "productMessage"
                    );

                if (message) {

                    message.textContent =
                        "商品の登録を中止しました。";

                }

                return;

            }


            /*
             削除済み商品を復元
            */

            restoreProduct(
                deletedProduct.id
            );


            /*
             復元した商品の判断画面へ
            */

            openRegisteredJanInfo(

                deletedProduct.id,

                "product"

            );

            return;

        }


        product = {

            id: createProductId(),

            name: productName,

            janCode: janCode,

            categoryId: categoryId,

            volume: volume,

            unit: unit,

            favorite:
                false,

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

                1,

                "",

                "",

                productPriceCalculation

            );

        }


        /*
         商品登録の価格計算情報をリセット
        */

        productPriceCalculation =
            null;

    } else {

        const oldProduct =
            products.find(

                p =>
                    p.id ===
                    editingProductId

            );


        if (!oldProduct) {

            return;

        }


        /*
         更新する前に
         変更前の価格・購入先と比較する
        */

        const priceChanged =
            Number(oldProduct.price) !==
            Number(price);

        const storeChanged =
            oldProduct.storeId !==
            storeId;


        /*
         新しい商品データを作る
        */

        product = {

            ...oldProduct,

            name:
                productName,

            janCode:
                janCode,

            categoryId:
                categoryId,

            volume:
                volume,

            unit:
                unit,

            price:
                price,

            storeId:
                storeId,

            updatedAt:
                new Date().toISOString()

        };


        /*
         商品データを更新
        */

        updateProduct(
            product
        );


        /*
         商品登録から価格・購入先を変更した場合

         履歴がある
         → 最新履歴を更新

         履歴がない
         → 新しい履歴を1件作成
        */

        if (
            price !== "" &&
            storeId !== "" &&
            (
                priceChanged ||
                storeChanged
            )
        ) {

            const latestHistory =
                getLatestPriceHistory(
                    product.id
                );


            /*
             すでに購入履歴がある場合
             最新履歴を更新する
            */

            if (latestHistory) {

                const updateData = {

                    storeId:
                        storeId,

                    price:
                        price

                };


                /*
                 価格計算を使用した場合
                 税抜価格・税率なども更新
                */

                if (productPriceCalculation) {

                    updateData.originalPrice =
                        productPriceCalculation.originalPrice;

                    updateData.priceType =
                        productPriceCalculation.priceType;

                    updateData.taxRate =
                        productPriceCalculation.taxRate;

                    updateData.discountType =
                        productPriceCalculation.discountType;

                    updateData.discountValue =
                        productPriceCalculation.discountValue;

                }


                updatePriceHistory(

                    latestHistory.id,

                    updateData

                );

            }

        }


        /*
         商品登録の価格計算情報をリセット
        */

        productPriceCalculation =
            null;


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
   登録済み商品 ジャンル絞り込み
   ========================================== */

function displayProductFilterCategories() {

    const select =
        document.getElementById(
            "cmbProductFilterCategory"
        );

    if (!select) {

        return;

    }

    const currentValue =
        productFilterCategoryId;

    select.innerHTML = `

        <option value="">
            ジャンル：すべて
        </option>

    `;

    for (const category of categories) {

        if (!category.active) {

            continue;

        }

        const option =
            document.createElement(
                "option"
            );

        option.value =
            category.id;

        option.textContent =
            "ジャンル：" +
            category.name;

        select.appendChild(
            option
        );

    }

    select.value =
        currentValue;

}

/* ==========================================
   よく使う商品 ON / OFF
   ========================================== */

function toggleFavoriteProduct(
    productId
) {

    const product =
        products.find(

            product =>
                product.id ===
                productId

        );


    if (!product) {

        return;

    }


    /*
     true ⇔ false
    */

    product.favorite =
        product.favorite === true
            ? false
            : true;


    product.updatedAt =
        new Date().toISOString();


    /*
     商品データを保存
    */

    saveProducts();


    /*
     商品登録一覧を更新
    */

    displayProducts();


    /*
     履歴・価格比較の商品ごとも
     表示中なら更新
    */

    if (
        typeof displayPriceHistoryByProduct ===
        "function"
    ) {

        displayPriceHistoryByProduct();

    }


    /*
     購入予定で
     「よく使う」を表示中なら更新
    */

    if (
        typeof shoppingProductFilter !==
        "undefined" &&
        shoppingProductFilter ===
        "favorite"
    ) {

        displayShoppingProductOptions();

    }

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


    /* ==========================================
       削除済み商品 件数更新
       ========================================== */

    const btnDeletedProducts =
        document.getElementById(
            "btnDeletedProducts"
        );

    const deletedProductCount =
        products.filter(

            product =>
                !product.active

        ).length;

    if (btnDeletedProducts) {

        btnDeletedProducts.textContent =
            "🗑 削除済みアイテム（" +
            deletedProductCount +
            "）";

    }


    productList.innerHTML = "";

    /*
     有効な商品だけを取得し、
     登録日の新しい順へ並べる
    */

    const activeProducts = products

        .filter(

            product => {

                if (!product.active) {

                    return false;

                }

                if (
                    productFilterCategoryId !== "" &&
                    product.categoryId !==
                    productFilterCategoryId
                ) {

                    return false;

                }

                return true;

            }

        )

        .sort((productA, productB) => {

            return new Date(productB.createdAt) -
                new Date(productA.createdAt);

        });

    const productFilterCount =
        document.getElementById(
            "productFilterCount"
        );

    if (productFilterCount) {

        productFilterCount.textContent =
            activeProducts.length +
            "件";

    }

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
                        class="favorite-product-button ${product.favorite === true ? "active" : ""}"
                        onclick="toggleFavoriteProduct('${product.id}')">

                        ${product.favorite === true
                    ? "⭐ よく使う"
                    : "☆ よく使う"}

                    </button>


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

    /*
     ホームから開く場合は
     必ず通常のバーコード読取
    */

    barcodeReadMode =
        "normal";


    document.getElementById(
        "homeScreen"
    ).hidden =
        true;


    document.getElementById(
        "codeScreen"
    ).hidden =
        false;


    readCode();

}

function backHomeFromCode() {

    /*
     カメラを停止
    */

    if (
        typeof stopBarcodeReader ===
        "function"
    ) {

        stopBarcodeReader();

    }


    /*
     通常読取へ戻す
    */

    barcodeReadMode =
        "normal";


    document.getElementById(
        "codeScreen"
    ).hidden =
        true;


    document.getElementById(
        "homeScreen"
    ).hidden =
        false;

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
            "← 📦 商品登録へ";

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
            "← 📦 商品登録へ";

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

                <button onclick="permanentlyDeleteProduct('${product.id}')">
                    🗑 完全削除
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
   商品を完全削除
   ========================================== */

function permanentlyDeleteProduct(productId) {

    const product =
        products.find(

            product =>
                product.id === productId

        );

    if (!product) {

        return;

    }


    const confirmed =
        confirm(

            "「" +
            product.name +
            "」を完全に削除しますか？\n\n" +

            "この操作は元に戻せません。"

        );


    if (!confirmed) {

        return;

    }


    const productIndex =
        products.findIndex(

            product =>
                product.id === productId

        );

    if (productIndex === -1) {

        console.error(
            "完全削除する商品が見つかりません。"
        );

        return;

    }


    /*
     商品を配列から完全削除
    */

    products.splice(
        productIndex,
        1
    );


    /*
     localStorageへ保存
    */

    saveProducts();


    /*
     通常の商品一覧更新
    */

    displayProducts();


    /*
     削除済み商品一覧更新
    */

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
