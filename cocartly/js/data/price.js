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
   国・地域から通貨コードを取得
   ========================================== */

function getCurrencyByCountry(
    country = "JP"
) {

    const currencies = {

        JP: "JPY",

        US: "USD",

        CA: "CAD",

        AU: "AUD",

        KR: "KRW",

        CN: "CNY",

        TW: "TWD"

    };

    return currencies[country] || "JPY";

}

/* ==========================================
   通貨付き価格表示
   ========================================== */

function formatCurrencyPrice(
    price,
    currency = "JPY"
) {

    if (
        price === null ||
        price === undefined ||
        !Number.isFinite(
            Number(price)
        )
    ) {

        return "-";

    }


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
            currency
        ] || "¥";


    const numericPrice =
        Number(price);


    /*
     JPY / KRW は整数表示
    */

    if (
        currency === "JPY" ||
        currency === "KRW"
    ) {

        return (
            currencySymbol +
            Math.round(
                numericPrice
            )
        );

    }


    /*
     その他の通貨は
     小数点以下2桁表示
    */

    return (
        currencySymbol +
        numericPrice.toFixed(2)
    );

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
    memo = "",
    priceCalculation = null
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


    /*
     購入先の国・地域から
     通貨を取得して履歴へ保存
    */

    const store =
        findStore(storeId);

    const country =
        store
            ? store.country || "JP"
            : "JP";

    history.currency =
        getCurrencyByCountry(
            country
        );


    /*
     価格計算を使用した場合だけ
     計算内容も履歴へ保存
    */

    if (priceCalculation) {

        history.originalPrice =
            priceCalculation.originalPrice;

        history.priceType =
            priceCalculation.priceType;

        history.taxRate =
            priceCalculation.taxRate;

        history.discountType =
            priceCalculation.discountType;

        history.discountValue =
            priceCalculation.discountValue;

    }


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


/* ==========================================
   購入履歴ID検索
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

    /*
     価格を変更する場合
    */

    if (changes.price !== undefined) {

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

    /*
     数量を変更する場合
    */

    if (changes.quantity !== undefined) {

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

    /*
     購入先を変更する場合
    */

    if (changes.storeId !== undefined) {

        history.storeId =
            changes.storeId;


        /*
         購入先の国から
         通貨も更新
        */

        const store =
            findStore(
                changes.storeId
            );

        const country =
            store
                ? store.country || "JP"
                : "JP";

        history.currency =
            getCurrencyByCountry(
                country
            );

    }

    /*
     購入日を変更する場合
    */

    if (changes.purchasedAt !== undefined) {

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

    /*
     割引情報を変更する場合
    */

    if (changes.discountType !== undefined) {

        history.discountType =
            String(changes.discountType);

    }

    /*
     価格計算情報を変更する場合
    */

    if (
        changes.originalPrice !== undefined
    ) {

        history.originalPrice =
            Number(
                changes.originalPrice
            );

    }


    if (
        changes.priceType !== undefined
    ) {

        history.priceType =
            String(
                changes.priceType
            );

    }


    if (
        changes.taxRate !== undefined
    ) {

        history.taxRate =
            changes.taxRate === null
                ? null
                : Number(
                    changes.taxRate
                );

    }


    if (
        changes.discountValue !== undefined
    ) {

        history.discountValue =
            Number(
                changes.discountValue
            );

    }

    /*
     メモを変更する場合
    */

    if (changes.memo !== undefined) {

        history.memo =
            String(changes.memo);

    }

    /*
     古い履歴などで
     currency がない場合は
     購入先から補完
    */

    if (!history.currency) {

        const store =
            history.storeId
                ? findStore(
                    history.storeId
                )
                : null;

        const country =
            store
                ? store.country || "JP"
                : "JP";

        history.currency =
            getCurrencyByCountry(
                country
            );

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

        console.error(
            "削除する購入履歴が見つかりません。"
        );

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

        console.error(
            "復元する購入履歴が見つかりません。"
        );

        return false;

    }

    history.active = true;

    history.updatedAt =
        new Date().toISOString();

    savePriceHistory();

    return true;

}

/* ==========================================
   購入履歴を完全削除
   ========================================== */

function permanentlyDeletePriceHistory(
    historyId
) {

    const historyIndex =
        priceHistory.findIndex(

            history =>
                history.id === historyId

        );

    if (historyIndex === -1) {

        console.error(
            "完全削除する購入履歴が見つかりません。"
        );

        return false;

    }

    /*
     配列から完全削除
    */

    priceHistory.splice(
        historyIndex,
        1
    );

    /*
     localStorageへ保存
    */

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
                history.active !== false

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

    if (!productId) {

        return [];

    }

    return getActivePriceHistory()
        .filter(

            history =>
                history.productId === productId

        );

}

/* ==========================================
   購入先別購入履歴取得
   ========================================== */

function getStorePriceHistory(storeId) {

    if (!storeId) {

        return [];

    }

    return getActivePriceHistory()
        .filter(

            history =>
                history.storeId === storeId

        );

}

/* ==========================================
   商品・購入先別購入履歴取得
   ========================================== */

function getProductStorePriceHistory(
    productId,
    storeId
) {

    if (!productId || !storeId) {

        return [];

    }

    return getActivePriceHistory()
        .filter(

            history =>

                history.productId === productId &&

                history.storeId === storeId

        );

}

/* ==========================================
   削除済み購入履歴取得
   ========================================== */

function getDeletedPriceHistory() {

    return priceHistory

        .filter(

            history =>
                history.active === false

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
   商品の前回購入履歴取得
   ========================================== */

function getLatestPriceHistory(productId) {

    const histories =
        getProductPriceHistory(productId);

    if (histories.length === 0) {

        return null;

    }

    return histories[0];

}

/* ==========================================
   商品の前回価格取得
   ========================================== */

function getLatestPrice(productId) {

    const latestHistory =
        getLatestPriceHistory(productId);

    if (!latestHistory) {

        return null;

    }

    return latestHistory.price;

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

            history =>
                history.price

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

            history =>
                history.price

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

    const totalPrice =
        histories.reduce(

            (total, history) =>

                total + history.price,

            0

        );

    return Number(

        (
            totalPrice /
            histories.length
        ).toFixed(2)

    );

}

/* ==========================================
   商品の購入回数取得
   ========================================== */

function getPurchaseCount(productId) {

    return getProductPriceHistory(
        productId
    ).length;

}

/* ==========================================
   商品の最安値履歴取得
   ========================================== */

function getLowestPriceHistory(productId) {

    const histories =
        getProductPriceHistory(productId);

    if (histories.length === 0) {

        return null;

    }

    return histories.reduce(

        (lowestHistory, history) => {

            if (
                history.price <
                lowestHistory.price
            ) {

                return history;

            }

            return lowestHistory;

        }

    );

}

/* ==========================================
   商品の最高値履歴取得
   ========================================== */

function getHighestPriceHistory(productId) {

    const histories =
        getProductPriceHistory(productId);

    if (histories.length === 0) {

        return null;

    }

    return histories.reduce(

        (highestHistory, history) => {

            if (
                history.price >
                highestHistory.price
            ) {

                return history;

            }

            return highestHistory;

        }

    );

}

/* ==========================================
   商品・購入先別の前回購入履歴取得
   ========================================== */

function getLatestStorePriceHistory(
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

    return histories[0];

}

/* ==========================================
   商品・購入先別の前回価格取得
   ========================================== */

function getLatestStorePrice(
    productId,
    storeId
) {

    const latestHistory =
        getLatestStorePriceHistory(
            productId,
            storeId
        );

    if (!latestHistory) {

        return null;

    }

    return latestHistory.price;

}

/* ==========================================
   商品・購入先別の最安値取得
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

            history =>
                history.price

        )

    );

}

/* ==========================================
   商品・購入先別の最高値取得
   ========================================== */

function getStoreHighestPrice(
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

    return Math.max(

        ...histories.map(

            history =>
                history.price

        )

    );

}

/* ==========================================
   商品・購入先別の平均価格取得
   ========================================== */

function getStoreAveragePrice(
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

    const totalPrice =
        histories.reduce(

            (total, history) =>

                total + history.price,

            0

        );

    return Number(

        (
            totalPrice /
            histories.length
        ).toFixed(1)

    );

}

/* ==========================================
   商品・購入先別の購入回数取得
   ========================================== */

function getStorePurchaseCount(
    productId,
    storeId
) {

    return getProductStorePriceHistory(

        productId,

        storeId

    ).length;

}

/* ==========================================
   商品・購入先別の最安値履歴取得
   ========================================== */

function getStoreLowestPriceHistory(
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

    return histories.reduce(

        (lowestHistory, history) => {

            if (
                history.price <
                lowestHistory.price
            ) {

                return history;

            }

            return lowestHistory;

        }

    );

}

/* ==========================================
   商品・購入先別の最高値履歴取得
   ========================================== */

function getStoreHighestPriceHistory(
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

    return histories.reduce(

        (highestHistory, history) => {

            if (
                history.price >
                highestHistory.price
            ) {

                return history;

            }

            return highestHistory;

        }

    );

}

/* ==========================================
   商品の購入先ID一覧取得
   ========================================== */

function getProductStoreIds(productId) {

    const histories =
        getProductPriceHistory(productId);

    const storeIds =
        histories

            .map(
                history =>
                    history.storeId
            )

            .filter(
                storeId =>
                    storeId
            );

    return [
        ...new Set(storeIds)
    ];

}

/* ==========================================
   商品の購入先別価格比較一覧取得
   ========================================== */

function getProductStoreComparison(productId) {

    const storeIds =
        getProductStoreIds(productId);

    const comparisons = [];

    for (const storeId of storeIds) {

        const latestHistory =
            getLatestStorePriceHistory(
                productId,
                storeId
            );

        if (!latestHistory) {

            continue;

        }

        comparisons.push({

            storeId: storeId,

            latestPrice:
                latestHistory.price,

            latestPurchasedAt:
                latestHistory.purchasedAt,

            lowestPrice:
                getStoreLowestPrice(
                    productId,
                    storeId
                ),

            highestPrice:
                getStoreHighestPrice(
                    productId,
                    storeId
                ),

            averagePrice:
                getStoreAveragePrice(
                    productId,
                    storeId
                ),

            purchaseCount:
                getStorePurchaseCount(
                    productId,
                    storeId
                )

        });

    }

    /*
     前回価格が安い購入先から順に並べる
    */

    comparisons.sort(

        (comparisonA, comparisonB) =>

            comparisonA.latestPrice -
            comparisonB.latestPrice

    );

    return comparisons;

}

/* ==========================================
   比較用価格チェック
   ========================================== */

function normalizeComparisonPrice(price) {

    const numericPrice =
        Number(price);

    if (
        !Number.isFinite(numericPrice) ||
        numericPrice < 0
    ) {

        return null;

    }

    return numericPrice;

}

/* ==========================================
   前回価格との差額取得
   ========================================== */

function getDifferenceFromLatestPrice(
    productId,
    currentPrice
) {

    const numericPrice =
        normalizeComparisonPrice(
            currentPrice
        );

    if (numericPrice === null) {

        return null;

    }

    const latestPrice =
        getLatestPrice(productId);

    if (latestPrice === null) {

        return null;

    }

    return Number(

        (
            numericPrice -
            latestPrice
        ).toFixed(1)

    );

}

/* ==========================================
   平均価格との差額取得
   ========================================== */

function getDifferenceFromAveragePrice(
    productId,
    currentPrice
) {

    const numericPrice =
        normalizeComparisonPrice(
            currentPrice
        );

    if (numericPrice === null) {

        return null;

    }

    const averagePrice =
        getAveragePrice(productId);

    if (averagePrice === null) {

        return null;

    }

    return Number(

        (
            numericPrice -
            averagePrice
        ).toFixed(1)

    );

}

/* ==========================================
   最安値との差額取得
   ========================================== */

function getDifferenceFromLowestPrice(
    productId,
    currentPrice
) {

    const numericPrice =
        normalizeComparisonPrice(
            currentPrice
        );

    if (numericPrice === null) {

        return null;

    }

    const lowestPrice =
        getLowestPrice(productId);

    if (lowestPrice === null) {

        return null;

    }

    return Number(

        (
            numericPrice -
            lowestPrice
        ).toFixed(1)

    );

}

/* ==========================================
   最高値との差額取得
   ========================================== */

function getDifferenceFromHighestPrice(
    productId,
    currentPrice
) {

    const numericPrice =
        normalizeComparisonPrice(
            currentPrice
        );

    if (numericPrice === null) {

        return null;

    }

    const highestPrice =
        getHighestPrice(productId);

    if (highestPrice === null) {

        return null;

    }

    return Number(

        (
            numericPrice -
            highestPrice
        ).toFixed(1)

    );

}

/* ==========================================
   価格差表示文作成
   ========================================== */

function formatPriceDifference(
    difference,
    comparisonLabel
) {

    if (
        difference === null ||
        difference === undefined
    ) {

        return "比較データがありません。";

    }

    if (difference > 0) {

        return (
            comparisonLabel +
            "より" +
            difference +
            "円高い"
        );

    }

    if (difference < 0) {

        return (
            comparisonLabel +
            "より" +
            Math.abs(difference) +
            "円安い"
        );

    }

    return (
        comparisonLabel +
        "と同じ価格"
    );

}

/* ==========================================
   今回価格の状態判定
   ========================================== */

function getPriceStatus(
    productId,
    currentPrice
) {

    const numericPrice =
        normalizeComparisonPrice(
            currentPrice
        );

    if (numericPrice === null) {

        return {

            code: "invalid",

            label: "価格未入力",

            message:
                "価格を正しく入力してください。"

        };

    }

    const histories =
        getProductPriceHistory(productId);

    /*
     過去履歴がない場合
    */

    if (histories.length === 0) {

        return {

            code: "first",

            label: "初回記録",

            message:
                "この商品は初めての価格記録です。"

        };

    }

    const lowestPrice =
        getLowestPrice(productId);

    const highestPrice =
        getHighestPrice(productId);

    const averagePrice =
        getAveragePrice(productId);

    /*
     過去最安値より安い
    */

    if (numericPrice < lowestPrice) {

        return {

            code: "new-lowest",

            label: "新しい最安値",

            message:
                "過去の最安値より" +
                Number(
                    (
                        lowestPrice -
                        numericPrice
                    ).toFixed(1)
                ) +
                "円安いです。"

        };

    }

    /*
     過去最安値と同じ
    */

    if (numericPrice === lowestPrice) {

        return {

            code: "lowest",

            label: "過去最安値",

            message:
                "過去の最安値と同じ価格です。"

        };

    }

    /*
     過去最高値より高い
    */

    if (numericPrice > highestPrice) {

        return {

            code: "new-highest",

            label: "過去最高値超え",

            message:
                "過去の最高値より" +
                Number(
                    (
                        numericPrice -
                        highestPrice
                    ).toFixed(1)
                ) +
                "円高いです。"

        };

    }

    /*
     平均価格との差を割合で判定
    */

    const differenceRate =

        averagePrice === 0

            ? 0

            :

            (
                numericPrice -
                averagePrice
            ) /
            averagePrice;

    if (differenceRate <= -0.05) {

        return {

            code: "low",

            label: "安め",

            message:
                "平均価格より安めです。"

        };

    }

    if (differenceRate >= 0.05) {

        return {

            code: "high",

            label: "高め",

            message:
                "平均価格より高めです。"

        };

    }

    return {

        code: "average",

        label: "平均的",

        message:
            "過去の平均に近い価格です。"

    };

}

/* ==========================================
   今回価格の比較情報取得
   ========================================== */

function getPriceComparisonSummary(
    productId,
    currentPrice
) {

    const numericPrice =
        normalizeComparisonPrice(
            currentPrice
        );

    if (numericPrice === null) {

        return null;

    }

    return {

        currentPrice:
            numericPrice,

        latestPrice:
            getLatestPrice(productId),

        lowestPrice:
            getLowestPrice(productId),

        highestPrice:
            getHighestPrice(productId),

        averagePrice:
            getAveragePrice(productId),

        purchaseCount:
            getPurchaseCount(productId),

        differenceFromLatest:
            getDifferenceFromLatestPrice(
                productId,
                numericPrice
            ),

        differenceFromAverage:
            getDifferenceFromAveragePrice(
                productId,
                numericPrice
            ),

        differenceFromLowest:
            getDifferenceFromLowestPrice(
                productId,
                numericPrice
            ),

        differenceFromHighest:
            getDifferenceFromHighestPrice(
                productId,
                numericPrice
            ),

        status:
            getPriceStatus(
                productId,
                numericPrice
            )

    };

}

