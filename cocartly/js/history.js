/* ==========================================
   現在価格を記録中の商品ID
   ========================================== */

let recordingProductId = null;

let editingPriceHistoryId = null;

/* ==========================================
   購入履歴表示モード
   ========================================== */

let historyViewMode = "date";

/* ==========================================
   購入履歴画面表示
   ========================================== */

function displayPriceHistory() {

    updateHistoryViewButtons();

    if (historyViewMode === "product") {

        displayPriceHistoryByProduct();

    } else {

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
                "h3"
            );

        monthTitle.className =
            "history-month-title";

        monthTitle.textContent =

            "▼ " +

            Number(year) +

            "年" +

            Number(month) +

            "月（" +

            monthlyHistory[
                monthKey
            ].length +

            "件）";

        monthGroup.appendChild(
            monthTitle
        );

        for (
            const history of
            monthlyHistory[monthKey]
        ) {

            const card =
                createHistoryCard(
                    history
                );

            monthGroup.appendChild(
                card
            );

        }

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

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "history-card";

    card.innerHTML = `

        <div class="history-card-header">

            <strong>
                ${productName}
            </strong>

            <span class="history-price">
                ¥${history.price}
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

    const productIds = [

        ...new Set(

            histories.map(

                history =>
                    history.productId

            )

        )

    ];

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

                <div class="history-summary-grid">

                    <div>
                        <small>前回</small>
                        <strong>
                            ¥${latestPrice}
                        </strong>
                    </div>

                    <div>
                        <small>最安</small>
                        <strong>
                            ¥${lowestPrice}
                        </strong>
                    </div>

                    <div>
                        <small>平均</small>
                        <strong>
                            ¥${averagePrice}
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

        previousPrice.textContent =
            "前回価格：¥" +
            latestHistory.price;

    } else {

        previousPrice.textContent =
            "前回価格：記録なし";

    }

    /*
     購入先選択肢
    */

    displayPriceRecordStores();

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

function displayPriceRecordStores() {

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

    let history;

    /*
     編集中の場合
    */

    if (editingPriceHistoryId !== null) {

        history =
            updatePriceHistory(

                editingPriceHistoryId,

                {

                    storeId: storeId,

                    price: price,

                    quantity:
                        quantity || 1

                }

            );

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

                quantity || 1

            );

    }

    if (!history) {

        message.textContent =
            "購入価格を記録できませんでした。";

        return;

    }

    recordingProductId =
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

    changeScreen(
        "今回価格記録"
    );

    document.getElementById(
        "priceRecordProductName"
    ).textContent =
        product.name;

    displayPriceRecordStores();

    document.getElementById(
        "cmbPriceRecordStore"
    ).value =
        history.storeId;

    document.getElementById(
        "txtPriceRecordPrice"
    ).value =
        history.price;

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

