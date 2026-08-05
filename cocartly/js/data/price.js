/* ==========================================
   購入履歴一覧
   ========================================== */

const priceHistory = [];

/* ==========================================
   購入履歴ID作成
   ========================================== */

function createPriceHistoryId() {

    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {

        return crypto.randomUUID();

    }

    return (
        "price-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 10)
    );

}

/* ==========================================
   購入履歴作成
   ========================================== */

function createPriceHistory(
   productId,
   storeId,
   price,
   quantity = 1
) {

   return {

      id: createPriceHistoryId(),

      productId: productId,

      storeId: storeId,

      price: Number(price),

      quantity: quantity,

      discountType: "",

      memo: "",

      purchasedAt: new Date().toISOString(),

      createdAt: new Date().toISOString(),

      updatedAt: new Date().toISOString(),

      active: true

   };

}

/* ==========================================
   購入履歴追加
   ========================================== */

function addPriceHistory(
    productId,
    storeId,
    price,
    quantity = 1,
    discountType = "",
    memo = ""
) {

    if (!productId) {

        console.error(
            "商品IDが指定されていません。"
        );

        return null;

    }

    if (!storeId) {

        console.error(
            "購入先IDが指定されていません。"
        );

        return null;

    }

    const numericPrice =
        Number(price);

    if (
        !Number.isFinite(numericPrice) ||
        numericPrice < 0
    ) {

        console.error(
            "価格が正しくありません。",
            price
        );

        return null;

    }

    const numericQuantity =
        Number(quantity);

    if (
        !Number.isFinite(numericQuantity) ||
        numericQuantity <= 0
    ) {

        console.error(
            "数量が正しくありません。",
            quantity
        );

        return null;

    }

    const history =
        createPriceHistory(

            productId,

            storeId,

            numericPrice,

            numericQuantity,

            discountType,

            memo

        );

    priceHistory.push(history);

    savePriceHistory();

    return history;

}

/* ==========================================
   購入履歴保存
   ========================================== */

function savePriceHistory() {

   localStorage.setItem(

      "shoppingSupportPriceHistory",

      JSON.stringify(priceHistory)

   );

}

/* ==========================================
   購入履歴読込
   ========================================== */

function loadPriceHistory() {

    const data =
        localStorage.getItem(
            "shoppingSupportPriceHistory"
        );

    priceHistory.length = 0;

    if (!data) {

        return;

    }

    try {

        const list =
            JSON.parse(data);

        if (!Array.isArray(list)) {

            console.error(
                "購入履歴の保存形式が正しくありません。"
            );

            return;

        }

        for (const history of list) {

            if (
                !history ||
                typeof history !== "object"
            ) {

                continue;

            }

            priceHistory.push({

                ...history,

                price:
                    Number(history.price),

                quantity:
                    Number(history.quantity) || 1,

                discountType:
                    history.discountType || "",

                memo:
                    history.memo || "",

                active:
                    history.active !== false

            });

        }

    } catch (error) {

        console.error(
            "購入履歴を読み込めませんでした。",
            error
        );

    }

}

/* ==========================================
   購入履歴検索
   ========================================== */

function findPriceHistory(historyId) {

    return priceHistory.find(

        history =>
            history.id === historyId

    ) || null;

}

/* ==========================================
   購入履歴更新
   ========================================== */

function updatePriceHistory(
    historyId,
    changes
) {

    const history =
        findPriceHistory(historyId);

    if (!history) {

        console.error(
            "更新する購入履歴が見つかりません。"
        );

        return null;

    }

    if (
        changes.price !== undefined
    ) {

        const numericPrice =
            Number(changes.price);

        if (
            !Number.isFinite(numericPrice) ||
            numericPrice < 0
        ) {

            console.error(
                "価格が正しくありません。"
            );

            return null;

        }

        history.price =
            numericPrice;

    }

    if (
        changes.quantity !== undefined
    ) {

        const numericQuantity =
            Number(changes.quantity);

        if (
            !Number.isFinite(numericQuantity) ||
            numericQuantity <= 0
        ) {

            console.error(
                "数量が正しくありません。"
            );

            return null;

        }

        history.quantity =
            numericQuantity;

    }

    if (
        changes.storeId !== undefined
    ) {

        history.storeId =
            changes.storeId;

    }

    if (
        changes.purchasedAt !== undefined
    ) {

        const purchasedDate =
            new Date(changes.purchasedAt);

        if (
            Number.isNaN(
                purchasedDate.getTime()
            )
        ) {

            console.error(
                "購入日が正しくありません。"
            );

            return null;

        }

        history.purchasedAt =
            purchasedDate.toISOString();

    }

    if (
        changes.discountType !== undefined
    ) {

        history.discountType =
            String(changes.discountType);

    }

    if (
        changes.memo !== undefined
    ) {

        history.memo =
            String(changes.memo);

    }

    history.updatedAt =
        new Date().toISOString();

    savePriceHistory();

    return history;

}

/* ==========================================
   購入履歴削除
   ========================================== */

function deletePriceHistory(historyId) {

    const history =
        findPriceHistory(historyId);

    if (!history) {

        return false;

    }

    history.active = false;

    history.updatedAt =
        new Date().toISOString();

    savePriceHistory();

    return true;

}

/* ==========================================
   購入履歴復元
   ========================================== */

function restorePriceHistory(historyId) {

    const history =
        findPriceHistory(historyId);

    if (!history) {

        return false;

    }

    history.active = true;

    history.updatedAt =
        new Date().toISOString();

    savePriceHistory();

    return true;

}

/* ==========================================
   有効な購入履歴取得
   ========================================== */

function getActivePriceHistory() {

    return priceHistory

        .filter(
            history =>
                history.active
        )

        .sort(
            (historyA, historyB) =>

                new Date(
                    historyB.purchasedAt
                ) -

                new Date(
                    historyA.purchasedAt
                )
        );

}

/* ==========================================
   商品別購入履歴取得
   ========================================== */

function getProductPriceHistory(productId) {

    return getActivePriceHistory()
        .filter(

            history =>
                history.productId === productId

        );

}

/* ==========================================
   店舗別購入履歴取得
   ========================================== */

function getStorePriceHistory(storeId) {

    return getActivePriceHistory()
        .filter(

            history =>
                history.storeId === storeId

        );

}

/* ==========================================
   商品・店舗別購入履歴取得
   ========================================== */

function getProductStorePriceHistory(
    productId,
    storeId
) {

    return getActivePriceHistory()
        .filter(

            history =>

                history.productId === productId &&

                history.storeId === storeId

        );

}

/* ==========================================
   商品の前回価格取得
   ========================================== */

function getLatestPrice(productId) {

    const histories =
        getProductPriceHistory(productId);

    if (histories.length === 0) {

        return null;

    }

    return histories[0].price;

}

/* ==========================================
   商品の最安値取得
   ========================================== */

function getLowestPrice(productId) {

    const histories =
        getProductPriceHistory(productId);

    if (histories.length === 0) {

        return null;

    }

    return Math.min(

        ...histories.map(
            history => history.price
        )

    );

}

/* ==========================================
   商品の最高値取得
   ========================================== */

function getHighestPrice(productId) {

    const histories =
        getProductPriceHistory(productId);

    if (histories.length === 0) {

        return null;

    }

    return Math.max(

        ...histories.map(
            history => history.price
        )

    );

}

/* ==========================================
   商品の平均価格取得
   ========================================== */

function getAveragePrice(productId) {

    const histories =
        getProductPriceHistory(productId);

    if (histories.length === 0) {

        return null;

    }

    const total = histories.reduce(

        (sum, history) =>
            sum + history.price,

        0

    );

    return Number(

        (
            total /
            histories.length
        ).toFixed(1)

    );

}

/* ==========================================
   商品の店舗別最安値取得
   ========================================== */

function getStoreLowestPrice(
    productId,
    storeId
) {

    const histories =
        getProductStorePriceHistory(
            productId,
            storeId
        );

    if (histories.length === 0) {

        return null;

    }

    return Math.min(

        ...histories.map(
            history => history.price
        )

    );

}

