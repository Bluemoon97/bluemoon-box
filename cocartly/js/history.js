/* ==========================================
   現在価格を記録中の商品ID
   ========================================== */

let recordingProductId = null;

/* ==========================================
   購入履歴画面
   ========================================== */

function displayPriceHistory() {

    console.log(
        "購入履歴：",
        priceHistory
    );

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

    const history =
        addPriceHistory(

            recordingProductId,

            storeId,

            price,

            quantity || 1

        );

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

    changeScreen(
        "商品登録"
    );

    displayProducts();

}

