/* ==========================================
   現在価格を記録中の商品ID
   ========================================== */

let recordingProductId = null;

/* ==========================================
   登録済み商品コード確認中の商品
   ========================================== */

let registeredJanProductId = null;

let registeredJanReturnScreen = "code";

let priceRecordSourceScreen = "product";

let editingPriceHistoryId = null;

let priceRecordReturnScreen = "history";

/* ==========================================
   購入履歴表示モード
   ========================================== */

let historyViewMode = "date";

let historyProductCategoryId = "";

/* ==========================================
   購入履歴画面表示
   ========================================== */

function displayPriceHistory() {

    updateHistoryViewButtons();

    const productFilter =
        document.getElementById(
            "historyProductFilter"
        );


    if (historyViewMode === "product") {

        if (productFilter) {

            productFilter.hidden =
                false;

        }

        displayHistoryProductCategories();

        displayPriceHistoryByProduct();

    } else {

        if (productFilter) {

            productFilter.hidden =
                true;

        }

        displayPriceHistoryByDate();

    }

}

/* ==========================================
   購入履歴 購入順表示
   ========================================== */

function displayPriceHistoryByDate() {

    const historyList =
        document.getElementById(
            "historyList"
        );

    if (!historyList) {

        return;

    }

    historyList.innerHTML = "";

    const histories =
        getActivePriceHistory();

    if (histories.length === 0) {

        displayEmptyPriceHistory();

        return;

    }

    /*
     年月ごとに分類
    */

    const monthlyHistory = {};

    for (const history of histories) {

        const date =
            new Date(
                history.purchasedAt
            );

        const monthKey =

            date.getFullYear() +

            "-" +

            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        if (!monthlyHistory[monthKey]) {

            monthlyHistory[monthKey] = [];

        }

        monthlyHistory[monthKey].push(
            history
        );

    }

    const monthKeys =
        Object.keys(
            monthlyHistory
        ).sort().reverse();

    for (const monthKey of monthKeys) {

        const [year, month] =
            monthKey.split("-");

        const monthGroup =
            document.createElement(
                "div"
            );

        monthGroup.className =
            "history-month-group";

        const monthTitle =
            document.createElement(
                "button"
            );

        monthTitle.type =
            "button";

        monthTitle.className =
            "history-month-title";

        monthTitle.setAttribute(
            "aria-expanded",
            "true"
        );

        monthTitle.innerHTML = `

            <span class="history-month-arrow">
                ▼
            </span>

            <span>
                ${Number(year)}年
                ${Number(month)}月
                （${monthlyHistory[monthKey].length}件）
            </span>

        `;

        monthGroup.appendChild(
            monthTitle
        );

        /*
         月の履歴を入れる領域
        */

        const monthDetails =
            document.createElement(
                "div"
            );

        monthDetails.className =
            "history-month-details";

        monthGroup.appendChild(
            monthDetails
        );

        for (
            const history of
            monthlyHistory[monthKey]
        ) {

            const card =
                createHistoryCard(
                    history
                );

            monthDetails.appendChild(
                card
            );

        }

        /*
         月タイトルを押した時の開閉処理
        */

        monthTitle.addEventListener(

            "click",

            () => {

                const willOpen =
                    monthDetails.hidden;

                monthDetails.hidden =
                    !willOpen;

                const arrow =
                    monthTitle.querySelector(
                        ".history-month-arrow"
                    );

                if (arrow) {

                    arrow.textContent =
                        willOpen
                            ? "▼"
                            : "▶";

                }

                monthTitle.setAttribute(

                    "aria-expanded",

                    String(willOpen)

                );

            }

        );

        historyList.appendChild(
            monthGroup
        );

    }

}

/* ==========================================
   購入履歴カード作成
   ========================================== */

function createHistoryCard(history) {

    const product =
        products.find(

            product =>
                product.id ===
                history.productId

        );

    const productName =
        product
            ? product.name
            : "商品情報なし";

    const storeName =
        getStoreDisplayName(
            history.storeId
        );

    const date =
        new Date(
            history.purchasedAt
        );

    const dateText =

        date.getFullYear() +

        "/" +

        String(
            date.getMonth() + 1
        ).padStart(2, "0") +

        "/" +

        String(
            date.getDate()
        ).padStart(2, "0");


    /*
     履歴に保存されている
     通貨を取得
    */

    const historyCurrency =
        history.currency || "JPY";


    const currencySymbols = {

        JPY: "¥",
        USD: "$",
        CAD: "C$",
        AUD: "A$",
        KRW: "₩",
        CNY: "¥",
        TWD: "NT$"

    };


    const currencySymbol =
        currencySymbols[
        historyCurrency
        ] || "¥";


    const card =
        document.createElement(
            "div"
        );

    card.className =
        "history-card";


    /* ==========================================
       価格計算情報を履歴に表示
       ========================================== */

    let priceCalculationHtml =
        "";


    /*
     値引き情報
    */

    if (
        history.discountType === "percent" &&
        Number(history.discountValue) > 0
    ) {

        priceCalculationHtml += `

        <p class="history-discount-info">
            🏷 ${history.discountValue}％OFF
        </p>

    `;

    } else if (
        history.discountType === "yen" &&
        Number(history.discountValue) > 0
    ) {
        priceCalculationHtml += `
        <p class="history-discount-info">
            🏷 ${currencySymbol}${history.discountValue}引き
        </p>
        `;
    }


    /*
     計算前の表示価格
    */

    if (
        history.originalPrice !== undefined &&
        history.originalPrice !== null
    ) {

        const priceTypeText =
            history.priceType === "taxExcluded"
                ? "税抜"
                : "税込";

        priceCalculationHtml += `

        <p class="history-price-detail">
            表示価格：
            ${currencySymbol}${history.originalPrice}
           （${priceTypeText}）
        </p>

    `;

    }


    /*
 税抜価格を表示
*/

    if (
        history.taxExcludedPrice !== null &&
        history.taxExcludedPrice !== undefined
    ) {

        priceCalculationHtml += `

    <p class="history-price-detail">
        税抜価格：
        ${formatCurrencyPrice(
            history.taxExcludedPrice,
            historyCurrency
        )}
    </p>

`;

    }


    /*
     税抜価格だった場合は税率も表示
    */

    if (
        history.priceType === "taxExcluded" &&
        history.taxRate !== null &&
        history.taxRate !== undefined
    ) {

        priceCalculationHtml += `

    <p class="history-price-detail">
        税率：
        ${history.taxRate}％
    </p>

`;

    }


    /*
     端数処理を表示
    */

    if (
        history.roundingMode
    ) {

        const roundingModeText =

            history.roundingMode === "floor"
                ? "切り捨て"
                : history.roundingMode === "ceil"
                    ? "切り上げ"
                    : "四捨五入";


        priceCalculationHtml += `

    <p class="history-price-detail">
        端数処理：
        ${roundingModeText}
    </p>

`;

    }


    card.innerHTML = `

    <div class="history-card-header">

        <strong>
            ${productName}
        </strong>

        <span class="history-price">
            ${currencySymbol}${history.price}
        </span>

    </div>

    <p>
        🏪 ${storeName}
    </p>

    <p>
        📅 ${dateText}
    </p>

    <p>
        購入数量：
        ${history.quantity || 1}
    </p>


    ${priceCalculationHtml}


    <div class="history-product-action">

        <button
            type="button"
            class="history-product-view-button"
            onclick="openRegisteredJanInfo('${history.productId}', 'history')">

            価格を確認・購入する

        </button>

    </div>

    <div class="history-card-buttons">

        <button
            type="button"
            onclick="editPriceHistoryRecord('${history.id}')">

            ✏ 編集

        </button>

        <button
            type="button"
            onclick="deletePriceHistoryRecord('${history.id}')">

            🗑 削除

        </button>

    </div>

`;

    return card;

}

/* ==========================================
   商品ごと履歴 ジャンル絞り込み
   ========================================== */

function displayHistoryProductCategories() {

    const select =
        document.getElementById(
            "cmbHistoryProductCategory"
        );

    if (!select) {

        return;

    }

    const currentValue =
        historyProductCategoryId;

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
   購入履歴 商品ごと表示
   ========================================== */

function displayPriceHistoryByProduct() {

    const historyList =
        document.getElementById(
            "historyList"
        );

    if (!historyList) {

        return;

    }

    historyList.innerHTML = "";

    const histories =
        getActivePriceHistory();

    if (histories.length === 0) {

        displayEmptyPriceHistory();

        return;

    }

    /*
     履歴に存在する商品IDを取得
    */

    let productIds = [

        ...new Set(

            histories.map(

                history =>
                    history.productId

            )

        )

    ];


    /*
     ジャンルで商品を絞り込む
    */

    if (
        historyProductCategoryId !== ""
    ) {

        productIds =
            productIds.filter(

                productId => {

                    const product =
                        products.find(

                            product =>
                                product.id ===
                                productId

                        );

                    return (
                        product &&
                        product.categoryId ===
                        historyProductCategoryId
                    );

                }

            );

    }

    const count =
        document.getElementById(
            "historyProductFilterCount"
        );

    if (count) {

        count.textContent =
            productIds.length +
            "商品";

    }

    for (const productId of productIds) {

        const product =
            products.find(

                product =>
                    product.id ===
                    productId

            );

        if (!product) {

            continue;

        }

        const productHistories =
            getProductPriceHistory(
                productId
            );

        const latestPrice =
            getLatestPrice(
                productId
            );

        const lowestPrice =
            getLowestPrice(
                productId
            );

        const averagePrice =
            getAveragePrice(
                productId
            );

        const purchaseCount =
            getPurchaseCount(
                productId
            );


        /*
         商品履歴の通貨を取得
         最新の履歴を基準にする
        */

        const latestHistory =
            productHistories.length > 0
                ? productHistories[0]
                : null;

        const historyCurrency =
            latestHistory
                ? latestHistory.currency || "JPY"
                : "JPY";

        const currencySymbols = {

            JPY: "¥",
            USD: "$",
            CAD: "C$",
            AUD: "A$",
            KRW: "₩",
            CNY: "¥",
            TWD: "NT$"

        };

        const historyCurrencySymbol =
            currencySymbols[
            historyCurrency
            ] || "¥";


        const productGroup =
            document.createElement(
                "div"
            );

        productGroup.className =
            "history-product-group";

        productGroup.innerHTML = `

            <div class="history-product-summary">

                <h3>
                    ${product.name}
                </h3>

                <button
                    type="button"
                    class="favorite-product-button ${product.favorite === true ? "active" : ""}"
                    onclick="toggleFavoriteProduct('${product.id}')">

                    ${product.favorite === true
                ? "⭐ よく使う"
                : "☆ よく使う"}

                </button>

                <div class="history-summary-grid">

                    <div>
                        <small>前回</small>
                        <strong>
                            ${historyCurrencySymbol}${latestPrice}
                        </strong>
                    </div>

                    <div>
                        <small>最安</small>
                        <strong>
                            ${historyCurrencySymbol}${lowestPrice}
                        </strong>
                    </div>

                    <div>
                        <small>平均</small>
                        <strong>
                            ${historyCurrencySymbol}${averagePrice}
                        </strong>
                    </div>

                    <div>
                        <small>購入回数</small>
                        <strong>
                            ${purchaseCount}回
                        </strong>
                    </div>

                </div>

                <button
                    type="button"
                    class="history-detail-button"
                    onclick="toggleProductHistory(this)">

                    ▶ 履歴を見る

                </button>

            </div>

            <div
                class="history-product-details"
                hidden>

            </div>

        `;

        const details =
            productGroup.querySelector(
                ".history-product-details"
            );

        for (
            const history of
            productHistories
        ) {

            details.appendChild(

                createHistoryCard(
                    history
                )

            );

        }

        historyList.appendChild(
            productGroup
        );

    }

}

/* ==========================================
   商品別履歴 開閉
   ========================================== */

function toggleProductHistory(button) {

    const group =
        button.closest(
            ".history-product-group"
        );

    if (!group) {

        return;

    }

    const details =
        group.querySelector(
            ".history-product-details"
        );

    if (!details) {

        return;

    }

    const willOpen =
        details.hidden;

    details.hidden =
        !willOpen;

    button.textContent =
        willOpen
            ? "▼ 履歴を閉じる"
            : "▶ 履歴を見る";

}

/* ==========================================
   履歴表示モード変更
   ========================================== */

function setHistoryViewMode(mode) {

    historyViewMode =
        mode;

    displayPriceHistory();

}

/* ==========================================
   履歴表示切替ボタン更新
   ========================================== */

function updateHistoryViewButtons() {

    const btnDate =
        document.getElementById(
            "btnHistoryByDate"
        );

    const btnProduct =
        document.getElementById(
            "btnHistoryByProduct"
        );

    if (
        !btnDate ||
        !btnProduct
    ) {

        return;

    }

    btnDate.classList.toggle(

        "active",

        historyViewMode === "date"

    );

    btnProduct.classList.toggle(

        "active",

        historyViewMode === "product"

    );

}

/* ==========================================
   購入履歴なし表示
   ========================================== */

function displayEmptyPriceHistory() {

    const historyList =
        document.getElementById(
            "historyList"
        );

    if (!historyList) {

        return;

    }

    historyList.innerHTML = `

        <div class="history-empty">

            <p class="history-empty-icon">
                🧾
            </p>

            <p class="history-empty-title">
                購入履歴はまだありません。
            </p>

            <p class="history-empty-text">
                商品の購入価格を記録すると、
                ここに履歴が表示されます。
            </p>

        </div>

    `;

}

/* ==========================================
   今回価格記録画面を開く
   ========================================== */

function openPriceRecord(productId) {

    const product =
        products.find(

            product =>
                product.id === productId

        );

    if (!product) {

        console.error(
            "商品が見つかりません。"
        );

        return;

    }

    recordingProductId =
        productId;

    priceRecordReturnScreen =
        "history";

    const backButton =
        document.getElementById(
            "btnBackPriceRecord"
        );

    if (backButton) {

        backButton.textContent =
            "← 履歴・価格比較へ戻る";

    }

    changeScreen(
        "今回価格記録"
    );

    /*
     商品名表示
    */

    const productName =
        document.getElementById(
            "priceRecordProductName"
        );

    productName.textContent =
        product.name;

    /*
     商品コード
    */

    const janInput =
        document.getElementById(
            "txtPriceRecordJanCode"
        );

    if (janInput) {

        janInput.value =
            product.janCode ||
            product.jan ||
            "";

    }

    /*
     前回価格表示
    */

    const latestHistory =
        getLatestPriceHistory(
            productId
        );

    const previousPrice =
        document.getElementById(
            "priceRecordPreviousPrice"
        );

    if (latestHistory) {

        /*
         履歴に保存されている
         通貨コードを取得
         古い履歴はJPYとして扱う
        */

        const historyCurrency =
            latestHistory.currency || "JPY";

        const historyCurrencySymbols = {

            JPY: "¥",
            USD: "$",
            CAD: "C$",
            AUD: "A$",
            KRW: "₩",
            CNY: "¥",
            TWD: "NT$"

        };

        const historyCurrencySymbol =
            historyCurrencySymbols[
            historyCurrency
            ] || "¥";

        previousPrice.textContent =
            historyCurrencySymbol +
            latestHistory.price;

    } else {

        previousPrice.textContent =
            "記録なし";

    }

    /*
     商品登録時の購入先から
     国・地域を取得
    */

    const registeredStore =
        product.storeId
            ? findStore(product.storeId)
            : null;

    const productCountry =
        registeredStore
            ? registeredStore.country || "JP"
            : "JP";


    /*
     国・地域に応じて
     税率入力方法を切り替える
    */

    const cmbPurchaseTaxRate =
        document.getElementById(
            "cmbPurchaseTaxRate"
        );

    const purchaseCustomTaxArea =
        document.getElementById(
            "purchaseCustomTaxArea"
        );

    const txtPurchaseCustomTaxRate =
        document.getElementById(
            "txtPurchaseCustomTaxRate"
        );

    const purchaseTaxGuide =
        document.getElementById(
            "purchaseTaxGuide"
        );


    if (productCountry === "JP") {

        /*
         日本
         従来の税率選択を使用
        */

        if (cmbPurchaseTaxRate) {
            cmbPurchaseTaxRate.hidden =
                false;

            cmbPurchaseTaxRate.value =
                "10";
        }

        if (purchaseCustomTaxArea) {
            purchaseCustomTaxArea.hidden =
                true;
        }

        if (txtPurchaseCustomTaxRate) {
            txtPurchaseCustomTaxRate.value =
                "";
        }

        if (purchaseTaxGuide) {
            purchaseTaxGuide.textContent =
                "日本の税率を選択してください。";
        }

    } else {

        /*
         海外
         任意税率を使用
        */

        if (cmbPurchaseTaxRate) {
            cmbPurchaseTaxRate.hidden =
                true;
        }

        if (purchaseCustomTaxArea) {
            purchaseCustomTaxArea.hidden =
                false;
        }

        if (txtPurchaseCustomTaxRate) {
            txtPurchaseCustomTaxRate.value =
                "";
        }

        if (purchaseTaxGuide) {
            purchaseTaxGuide.textContent =
                "地域や商品の種類に応じた税率を入力してください。";
        }

    }


    /*
     国・地域に応じて
     通貨表示を切り替える
    */

    const currencyLabels = {

        JP: "円",
        US: "$",
        CA: "C$",
        AU: "A$",
        KR: "₩",
        CN: "¥",
        TW: "NT$"

    };

    const currencyLabel =
        currencyLabels[productCountry] || "円";


    const priceRecordCurrencyLabel =
        document.getElementById(
            "priceRecordCurrencyLabel"
        );

    if (priceRecordCurrencyLabel) {

        priceRecordCurrencyLabel.textContent =
            currencyLabel;

    }


    const purchaseTaxCurrencyLabel =
        document.getElementById(
            "purchaseTaxCurrencyLabel"
        );

    if (purchaseTaxCurrencyLabel) {

        purchaseTaxCurrencyLabel.textContent =
            currencyLabel;

    }


    /*
     今回の購入
     前回購入店・最近使った店・店舗検索・
     すべての購入先を表示
    */

    displayPriceRecordStoreOptions();


    /*
     商品登録時の購入先を初期選択
    */

    const cmbStore =
        document.getElementById(
            "cmbPriceRecordStore"
        );

    if (
        product.storeId &&
        Array.from(
            cmbStore.options
        ).some(

            option =>
                option.value ===
                product.storeId

        )
    ) {

        cmbStore.value =
            product.storeId;

    }

    /*
     商品登録時の価格を初期値として使用
    */

    const txtPrice =
        document.getElementById(
            "txtPriceRecordPrice"
        );

    txtPrice.value =
        product.price || "";

    document.getElementById(
        "txtPriceRecordQuantity"
    ).value = "1";

    document.getElementById(
        "priceRecordMessage"
    ).textContent = "";

}

/* ==========================================
   今回価格記録用 購入先表示
   ========================================== */

function displayPriceRecordStores(
    country = "JP"
) {

    const cmbStore =
        document.getElementById(
            "cmbPriceRecordStore"
        );

    if (!cmbStore) {

        return;

    }

    cmbStore.innerHTML = `

        <option value="">
            購入先を選択してください
        </option>

    `;

    for (const store of stores) {

        if (!store.active) {

            continue;

        }


        /*
         指定された国・地域の
         購入先だけ表示
        */

        const storeCountry =
            store.country || "JP";

        if (
            storeCountry !==
            country
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
            store.name;

        cmbStore.appendChild(
            option
        );

    }

}

/* ==========================================
   今回価格を購入履歴へ保存
   ========================================== */

function saveCurrentPriceRecord() {

    if (!recordingProductId) {

        return;

    }

    const cmbStore =
        document.getElementById(
            "cmbPriceRecordStore"
        );

    const txtPrice =
        document.getElementById(
            "txtPriceRecordPrice"
        );

    const txtQuantity =
        document.getElementById(
            "txtPriceRecordQuantity"
        );

    const txtJanCode =
        document.getElementById(
            "txtPriceRecordJanCode"
        );

    const message =
        document.getElementById(
            "priceRecordMessage"
        );

    const storeId =
        cmbStore.value;

    const price =
        txtPrice.value.trim();

    const quantity =
        txtQuantity.value.trim();

    const janCode =
        txtJanCode
            ? txtJanCode.value.trim()
            : "";

    if (storeId === "") {

        message.textContent =
            "購入先を選択してください。";

        cmbStore.focus();

        return;

    }

    if (price === "") {

        message.textContent =
            "今回価格を入力してください。";

        txtPrice.focus();

        return;

    }

    /*
     商品コード重複チェック
    */

    if (janCode !== "") {

        const duplicateProduct =
            products.find(

                product =>
                    product.id !==
                    recordingProductId &&

                    product.active !== false &&

                    (
                        product.janCode === janCode ||
                        product.jan === janCode
                    )

            );


        if (duplicateProduct) {

            message.textContent =
                "この商品コードは別の商品ですでに登録されています。";

            if (txtJanCode) {

                txtJanCode.focus();

            }

            return;

        }

    }

    let history;

    /*
     編集中の場合
    */

    if (editingPriceHistoryId !== null) {

        const updateData = {

            storeId:
                storeId,

            price:
                price,

            quantity:
                quantity || 1

        };


        if (purchasePriceCalculation) {

            updateData.originalPrice =
                purchasePriceCalculation.originalPrice;

            updateData.priceType =
                purchasePriceCalculation.priceType;

            updateData.taxRate =
                purchasePriceCalculation.taxRate;

            updateData.discountType =
                purchasePriceCalculation.discountType;

            updateData.discountValue =
                purchasePriceCalculation.discountValue;

        }


        history =
            updatePriceHistory(

                editingPriceHistoryId,

                updateData

            );

        /*
         履歴で変更した価格・購入先を
         商品登録側にも反映

         ※ 新しい履歴は追加しない
        */

        if (history) {

            const product =
                products.find(

                    product =>
                        product.id ===
                        history.productId

                );


            if (product) {

                product.price =
                    history.price;

                product.storeId =
                    history.storeId;

                product.updatedAt =
                    new Date().toISOString();


                /*
                 商品データだけ保存
                 updateProduct()は使わない
                */

                saveProducts();

            }

        }

        editingPriceHistoryId =
            null;

        /*
         新規購入履歴
        */

    } else {

        history =
            addPriceHistory(

                recordingProductId,

                storeId,

                price,

                quantity || 1,

                "",

                "",

                purchasePriceCalculation

            );

    }

    if (!history) {

        message.textContent =
            "購入を記録できませんでした。";

        return;

    }

    /*
     購入予定から来た場合、
     お出かけ連携用に対象商品を保持
    */

    let completedShoppingItem =
        null;


    if (
        priceRecordSourceScreen ===
        "shopping"
    ) {

        completedShoppingItem =
            shoppingItems.find(

                item =>
                    item.productId ===
                    history.productId &&

                    item.status ===
                    "pending"

            ) || null;

    }

    /*
     商品コードを商品情報へ反映
    */

    const product =
        products.find(

            product =>
                product.id ===
                history.productId

        );


    if (product) {

        product.janCode =
            janCode;

        product.updatedAt =
            new Date().toISOString();

        saveProducts();

    }

    /*
     購入予定から購入した場合、
     予定一覧から自動的に外す
    */

    if (
        priceRecordSourceScreen ===
        "shopping" &&
        typeof completePendingShoppingItem ===
        "function"
    ) {

        completePendingShoppingItem();

    }

    /*
     お出かけチェックから
     購入予定へ追加された商品なら

     関連する持ち物を
     準備済へ移す
    */

    if (
        completedShoppingItem &&
        Array.isArray(
            completedShoppingItem.outingLinks
        )
    ) {

        completeOutingItemsFromShopping(
            completedShoppingItem
        );

    }

    /*
     購入元をリセット
    */

    priceRecordSourceScreen =
        "product";

    recordingProductId =
        null;

    /*
     今回の価格計算情報をリセット
    */

    purchasePriceCalculation =
        null;

    changeScreen(
        "履歴・価格比較"
    );

    displayPriceHistory();

}

/* ==========================================
   今回価格記録画面から戻る
   ========================================== */

function backFromPriceRecord() {

    recordingProductId =
        null;

    editingPriceHistoryId =
        null;


    /*
     履歴・価格比較から来た場合
    */

    if (
        priceRecordReturnScreen ===
        "history"
    ) {

        changeScreen(
            "履歴・価格比較"
        );

        displayPriceHistory();

        return;

    }


    /*
     商品登録から来た場合
    */

    changeScreen(
        "商品登録"
    );

    displayProducts();

}

/* ==========================================
   購入履歴削除
   ========================================== */

function deletePriceHistoryRecord(
    historyId
) {

    const history =
        findPriceHistory(
            historyId
        );

    if (!history) {

        alert(
            "削除する購入履歴が見つかりません。"
        );

        return;

    }

    const confirmed =
        confirm(
            "この購入履歴を削除しますか？"
        );

    if (!confirmed) {

        return;

    }

    const deleted =
        deletePriceHistory(
            historyId
        );

    if (!deleted) {

        alert(
            "購入履歴を削除できませんでした。"
        );

        return;

    }

    displayPriceHistory();

}

/* ==========================================
   購入履歴編集開始
   ========================================== */

function editPriceHistoryRecord(
    historyId
) {

    const history =
        findPriceHistory(
            historyId
        );

    if (!history) {

        alert(
            "編集する購入履歴が見つかりません。"
        );

        return;

    }

    const product =
        products.find(

            product =>
                product.id ===
                history.productId

        );

    if (!product) {

        alert(
            "商品情報が見つかりません。"
        );

        return;

    }

    editingPriceHistoryId =
        historyId;

    recordingProductId =
        history.productId;


    /*
     履歴・価格比較から開いたことを記録
    */

    priceRecordReturnScreen =
        "history";


    /*
     戻るボタンの文字を変更
    */

    const backButton =
        document.getElementById(
            "btnBackPriceRecord"
        );

    if (backButton) {

        backButton.textContent =
            "← 履歴・価格比較へ戻る";

    }

    changeScreen(
        "今回価格記録"
    );

    document.getElementById(
        "priceRecordProductName"
    ).textContent =
        product.name;

    /*
     商品コード
    */

    const janInput =
        document.getElementById(
            "txtPriceRecordJanCode"
        );

    if (janInput) {

        janInput.value =
            product.janCode ||
            product.jan ||
            "";

    }

    /*
     編集する履歴の購入先から
     国・地域を取得
    */

    const historyStore =
        history.storeId
            ? findStore(
                history.storeId
            )
            : null;

    const historyCountry =
        historyStore
            ? historyStore.country || "JP"
            : "JP";


    /*
     国・地域に応じて
     税率入力方法を切り替える
    */

    const cmbPurchaseTaxRate =
        document.getElementById(
            "cmbPurchaseTaxRate"
        );

    const purchaseCustomTaxArea =
        document.getElementById(
            "purchaseCustomTaxArea"
        );

    const txtPurchaseCustomTaxRate =
        document.getElementById(
            "txtPurchaseCustomTaxRate"
        );

    const purchaseTaxGuide =
        document.getElementById(
            "purchaseTaxGuide"
        );


    if (historyCountry === "JP") {

        if (cmbPurchaseTaxRate) {

            cmbPurchaseTaxRate.hidden =
                false;

            cmbPurchaseTaxRate.value =
                history.taxRate !== null &&
                    history.taxRate !== undefined
                    ? String(
                        history.taxRate
                    )
                    : "10";

        }

        if (purchaseCustomTaxArea) {

            purchaseCustomTaxArea.hidden =
                true;

        }

        if (txtPurchaseCustomTaxRate) {

            txtPurchaseCustomTaxRate.value =
                "";

        }

        if (purchaseTaxGuide) {

            purchaseTaxGuide.textContent =
                "日本の税率を選択してください。";

        }

    } else {

        if (cmbPurchaseTaxRate) {

            cmbPurchaseTaxRate.hidden =
                true;

        }

        if (purchaseCustomTaxArea) {

            purchaseCustomTaxArea.hidden =
                false;

        }

        if (txtPurchaseCustomTaxRate) {

            txtPurchaseCustomTaxRate.value =
                history.taxRate !== null &&
                    history.taxRate !== undefined
                    ? String(
                        history.taxRate
                    )
                    : "";

        }

        if (purchaseTaxGuide) {

            purchaseTaxGuide.textContent =
                "地域や商品の種類に応じた税率を入力してください。";

        }

    }


    /*
     国・地域に応じて
     通貨表示を切り替える
    */

    const currencyLabels = {

        JP: "円",
        US: "$",
        CA: "C$",
        AU: "A$",
        KR: "₩",
        CN: "¥",
        TW: "NT$"

    };

    const currencyLabel =
        currencyLabels[
        historyCountry
        ] || "円";


    const priceRecordCurrencyLabel =
        document.getElementById(
            "priceRecordCurrencyLabel"
        );

    if (priceRecordCurrencyLabel) {

        priceRecordCurrencyLabel.textContent =
            currencyLabel;

    }


    const purchaseTaxCurrencyLabel =
        document.getElementById(
            "purchaseTaxCurrencyLabel"
        );

    if (purchaseTaxCurrencyLabel) {

        purchaseTaxCurrencyLabel.textContent =
            currencyLabel;

    }


    /*
     今回の購入
     統一された購入先候補を表示
    */

    displayPriceRecordStoreOptions();


    /*
     編集している履歴の
     購入先を選択
    */

    document.getElementById(
        "cmbPriceRecordStore"
    ).value =
        history.storeId;


    document.getElementById(
        "txtPriceRecordPrice"
    ).value =
        history.price;


    /*
     価格計算の税抜価格は
     前回の編集内容を残さない
    */

    const txtPurchaseTaxExcluded =
        document.getElementById(
            "txtPurchaseTaxExcluded"
        );

    if (txtPurchaseTaxExcluded) {

        txtPurchaseTaxExcluded.value =
            "";

    }


    /*
     価格計算結果も
     前回の内容を残さない
    */

    const purchaseTaxResult =
        document.getElementById(
            "purchaseTaxResult"
        );

    if (purchaseTaxResult) {

        purchaseTaxResult.textContent =
            "";

    }


    /*
     前回の商品で保持していた
     計算情報もリセット
    */

    purchasePriceCalculation =
        null;


    document.getElementById(
        "txtPriceRecordQuantity"
    ).value =
        history.quantity || 1;

    document.getElementById(
        "priceRecordPreviousPrice"
    ).textContent =
        "購入履歴を編集中";

    document.getElementById(
        "priceRecordMessage"
    ).textContent = "";

}

/* ==========================================
   削除済み購入履歴画面表示
   ========================================== */

function displayDeletedPriceHistory() {

    const historyList =
        document.getElementById(
            "historyList"
        );

    if (!historyList) {

        return;

    }

    historyList.innerHTML = "";

    const backButton =
        document.createElement(
            "button"
        );

    backButton.type =
        "button";

    backButton.className =
        "history-back-normal-button";

    backButton.textContent =
        "← 通常の履歴へ戻る";

    backButton.addEventListener(

        "click",

        showNormalPriceHistory

    );

    historyList.appendChild(
        backButton
    );

    const histories =
        getDeletedPriceHistory();

    if (histories.length === 0) {

        historyList.innerHTML = `

            <div class="history-empty">

                <p class="history-empty-icon">
                    🗑
                </p>

                <p class="history-empty-title">
                    削除済みの購入履歴はありません。
                </p>

            </div>

        `;

        return;

    }

    for (const history of histories) {

        const product =
            products.find(

                product =>
                    product.id ===
                    history.productId

            );

        const productName =
            product
                ? product.name
                : "商品情報なし";

        const storeName =
            getStoreDisplayName(
                history.storeId
            );

        const date =
            new Date(
                history.purchasedAt
            );

        const dateText =

            date.getFullYear() +

            "/" +

            String(
                date.getMonth() + 1
            ).padStart(2, "0") +

            "/" +

            String(
                date.getDate()
            ).padStart(2, "0");


        /*
         履歴に保存されている
         通貨を取得
        */

        const historyCurrency =
            history.currency || "JPY";

        const currencySymbols = {

            JPY: "¥",
            USD: "$",
            CAD: "C$",
            AUD: "A$",
            KRW: "₩",
            CNY: "¥",
            TWD: "NT$"

        };

        const historyCurrencySymbol =
            currencySymbols[
            historyCurrency
            ] || "¥";


        const card =
            document.createElement(
                "div"
            );

        card.className =
            "history-card deleted-history-card";

        card.innerHTML = `

            <div class="history-card-header">

                <strong>
                    ${productName}
                </strong>

                <span class="history-price">
                    ${historyCurrencySymbol}${history.price}
                </span>

            </div>

            <p>
                🏪 ${storeName}
            </p>

            <p>
                📅 ${dateText}
            </p>

            <div class="history-card-buttons">

                <button
                    type="button"
                    onclick="restorePriceHistoryRecord('${history.id}')">

                    ↩ 復元

                </button>

                <button
                    type="button"
                    onclick="permanentlyDeletePriceHistoryRecord('${history.id}')">

                    🗑 完全削除

                </button>

            </div>

        `;

        historyList.appendChild(
            card
        );

    }

}

/* ==========================================
   削除済み購入履歴復元
   ========================================== */

function restorePriceHistoryRecord(
    historyId
) {

    const restored =
        restorePriceHistory(
            historyId
        );

    if (!restored) {

        alert(
            "購入履歴を復元できませんでした。"
        );

        return;

    }

    displayDeletedPriceHistory();

}

/* ==========================================
   削除済み購入履歴を完全削除
   ========================================== */

function permanentlyDeletePriceHistoryRecord(
    historyId
) {

    const confirmed =
        confirm(
            "この購入履歴を完全に削除しますか？\n\n" +
            "この操作は元に戻せません。"
        );

    if (!confirmed) {

        return;

    }

    const deleted =
        permanentlyDeletePriceHistory(
            historyId
        );

    if (!deleted) {

        alert(
            "購入履歴を完全削除できませんでした。"
        );

        return;

    }

    /*
     削除済み履歴を再表示
    */

    displayDeletedPriceHistory();

}

/* ==========================================
   通常購入履歴へ戻る
   ========================================== */

function showNormalPriceHistory() {

    historyViewMode =
        "date";

    displayPriceHistory();

}

/* ==========================================
   登録済み商品確認画面を開く
   ========================================== */

function openRegisteredJanInfo(
    productId,
    returnScreen = "code"
) {

    registeredJanReturnScreen =
        returnScreen;


    /*
     戻るボタンの表示を
     開いた画面に合わせて変更
    */

    const btnCloseRegisteredJan =
        document.getElementById(
            "btnCloseRegisteredJan"
        );

    if (btnCloseRegisteredJan) {

        if (
            returnScreen === "history"
        ) {

            btnCloseRegisteredJan.textContent =
                "← 📊 履歴・価格比較へ";

        } else if (
            returnScreen === "product"
        ) {

            btnCloseRegisteredJan.textContent =
                "← 📦 商品登録へ";

        }

    }


    const product =
        products.find(

            product =>
                product.id === productId &&
                product.active

        );

    if (!product) {

        alert(
            "登録済みの商品情報が見つかりません。"
        );

        return;

    }

    registeredJanProductId =
        productId;


    /*
     他画面を非表示
    */

    hideAllScreens();

    const screen =
        document.getElementById(
            "registeredJanScreen"
        );

    if (!screen) {

        return;

    }

    screen.hidden = false;


    /*
     商品名
    */

    const productName =
        document.getElementById(
            "registeredJanProductName"
        );

    if (productName) {

        productName.textContent =
            product.name;

    }


    /*
     商品コード
    */

    const janText =
        document.getElementById(
            "registeredJanCode"
        );

    if (janText) {

        janText.textContent =
            product.janCode
                ? "商品コード：" + product.janCode
                : "商品コードなし";

    }


    /*
     価格情報
    */

    const latestPrice =
        getLatestPrice(
            productId
        );

    const lowestPrice =
        getLowestPrice(
            productId
        );

    const averagePrice =
        getAveragePrice(
            productId
        );


    /*
     最新履歴の通貨を取得
     古い履歴はJPYとして扱う
    */

    const latestHistory =
        getLatestPriceHistory(
            productId
        );

    const registeredCurrency =
        latestHistory
            ? latestHistory.currency || "JPY"
            : "JPY";


    setRegisteredJanPriceText(
        "registeredJanLatestPrice",
        latestPrice,
        registeredCurrency
    );

    setRegisteredJanPriceText(
        "registeredJanLowestPrice",
        lowestPrice,
        registeredCurrency
    );

    setRegisteredJanPriceText(
        "registeredJanAveragePrice",
        averagePrice,
        registeredCurrency
    );


    /*
     過去の購入先・価格
    */

    displayRegisteredJanHistory(
        productId
    );

}

/* ==========================================
   登録済み商品コード 価格表示
   ========================================== */

function setRegisteredJanPriceText(
    elementId,
    price,
    currency = "JPY"
) {

    const element =
        document.getElementById(
            elementId
        );

    if (!element) return;


    if (
        price === null ||
        price === undefined ||
        !Number.isFinite(
            Number(price)
        )
    ) {

        element.textContent =
            "記録なし";

        return;

    }


    element.textContent =
        formatCurrencyPrice(
            price,
            currency
        );

}

/* ==========================================
   登録済み商品コード 過去価格表示
   ========================================== */

function displayRegisteredJanHistory(
    productId
) {

    const list =
        document.getElementById(
            "registeredJanHistory"
        );

    if (!list) {

        return;

    }

    list.innerHTML = "";


    const histories =
        getProductPriceHistory(
            productId
        );

    if (histories.length === 0) {

        list.innerHTML = `

            <p class="registered-jan-empty">
                価格履歴はまだありません。
            </p>

        `;

        return;

    }


    /*
     新しい履歴から最大5件表示
    */

    const latestHistories =
        [...histories]
            .sort(

                (a, b) =>

                    new Date(
                        b.purchasedAt
                    ) -

                    new Date(
                        a.purchasedAt
                    )

            )
            .slice(0, 5);


    for (
        const history of
        latestHistories
    ) {

        const storeName =
            getStoreDisplayName(
                history.storeId
            );

        const date =
            new Date(
                history.purchasedAt
            );

        const dateText =

            (date.getMonth() + 1) +

            "/" +

            date.getDate();


        /*
         履歴に保存されている
         通貨を取得
        */

        const historyCurrency =
            history.currency || "JPY";

        const currencySymbols = {

            JPY: "¥",
            USD: "$",
            CAD: "C$",
            AUD: "A$",
            KRW: "₩",
            CNY: "¥",
            TWD: "NT$"

        };

        const historyCurrencySymbol =
            currencySymbols[
            historyCurrency
            ] || "¥";


        const row =
            document.createElement(
                "div"
            );

        row.className =
            "registered-jan-history-row";

        row.innerHTML = `

            <div>

                <strong>
                    ${storeName}
                </strong>

                <small>
                    ${dateText}
                </small>

            </div>

            <span>
                ${historyCurrencySymbol}${history.price}
            </span>

        `;

        list.appendChild(
            row
        );

    }

}

/* ==========================================
   登録済み商品コードから今回価格記録
   ========================================== */

function recordRegisteredJanPrice() {

    if (!registeredJanProductId) {

        return;

    }

    const productId =
        registeredJanProductId;


    /*
     どの画面から購入したか保存
    */

    priceRecordSourceScreen =
        registeredJanReturnScreen;


    registeredJanProductId =
        null;

    openPriceRecord(
        productId
    );

}

/* ==========================================
   登録済み商品コードから商品編集
   ========================================== */

function editRegisteredJanProduct() {

    if (!registeredJanProductId) {

        return;

    }

    const productId =
        registeredJanProductId;

    registeredJanProductId =
        null;

    editProduct(
        productId
    );

}

/* ==========================================
   登録済み商品コード確認を閉じる
   ========================================== */

function closeRegisteredJanInfo() {

    returnFromRegisteredJan();

}

/* ==========================================
   登録済み商品 今回は見送る
   ========================================== */

function skipRegisteredJanPurchase() {

    returnFromRegisteredJan();

}

/* ==========================================
   登録済み商品 元の画面へ戻る
   ========================================== */

function returnFromRegisteredJan() {

    const returnScreen =
        registeredJanReturnScreen;


    /*
     登録済み商品の情報をリセット
    */

    registeredJanProductId =
        null;

    registeredJanReturnScreen =
        "code";


    /*
     登録済み商品画面を含め
     一度すべての画面を閉じる
    */

    hideAllScreens();


    /*
     元の画面へ戻る
    */

    switch (returnScreen) {

        case "shopping":

            openShopping();
            break;


        case "history":

            openHistory();
            break;


        case "product":

            openProduct();
            break;


        case "code":

        default:

            openCode();
            break;

    }

}

