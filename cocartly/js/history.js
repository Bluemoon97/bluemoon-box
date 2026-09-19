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
   履歴・価格比較
   表示言語更新
   ========================================== */

function updateHistoryScreenLanguage() {

    const screen =
        document.getElementById(
            "historyScreen"
        );

    if (!screen) {
        return;
    }


    const setText = (
        selector,
        key
    ) => {

        const element =
            screen.querySelector(
                selector
            );

        if (element) {

            element.textContent =
                t(key);

        }

    };


    setText(
        "#btnBackHistory",
        "history.backHome"
    );

    setText(
        ".screen-title-row h2",
        "history.title"
    );

    setText(
        "#btnHistoryHelp",
        "history.help"
    );


    const help =
        document.getElementById(
            "historyHelp"
        );

    if (help) {

        const headerTitle =
            help.querySelector(
                ".screen-help-panel-header strong"
            );

        if (headerTitle) {

            headerTitle.textContent =
                t(
                    "history.help.title"
                );

        }


        const sections =
            help.querySelectorAll(
                ".help-section"
            );


        /*
         この機能でできること
        */

        if (sections[0]) {

            const title =
                sections[0].querySelector(
                    "h3"
                );

            if (title) {

                title.textContent =
                    t(
                        "history.help.featureTitle"
                    );

            }

            const paragraphs =
                sections[0].querySelectorAll(
                    "p"
                );

            const keys = [
                "history.help.feature1",
                "history.help.feature2",
                "history.help.feature3"
            ];

            paragraphs.forEach(
                (paragraph, index) => {

                    if (keys[index]) {

                        paragraph.textContent =
                            t(
                                keys[index]
                            );

                    }

                }
            );

        }


        /*
         こんな時に便利です
        */

        if (sections[1]) {

            const title =
                sections[1].querySelector(
                    "h3"
                );

            if (title) {

                title.textContent =
                    t(
                        "history.help.usefulTitle"
                    );

            }

            const paragraphs =
                sections[1].querySelectorAll(
                    "p"
                );

            const keys = [
                "history.help.useful1",
                "history.help.useful2",
                "history.help.useful3",
                "history.help.useful4"
            ];

            paragraphs.forEach(
                (paragraph, index) => {

                    if (keys[index]) {

                        paragraph.textContent =
                            t(
                                keys[index]
                            );

                    }

                }
            );

        }


        /*
         使い方
        */

        if (sections[2]) {

            const title =
                sections[2].querySelector(
                    "h3"
                );

            if (title) {

                title.textContent =
                    t(
                        "history.help.howToTitle"
                    );

            }

            const items =
                sections[2].querySelectorAll(
                    "li"
                );

            const keys = [
                "history.help.step1",
                "history.help.step2",
                "history.help.step3",
                "history.help.step4",
                "history.help.step5",
                "history.help.step6",
                "history.help.step7"
            ];

            items.forEach(
                (item, index) => {

                    if (keys[index]) {

                        item.textContent =
                            t(
                                keys[index]
                            );

                    }

                }
            );

        }


        /*
         履歴の管理
        */

        if (sections[3]) {

            const title =
                sections[3].querySelector(
                    "h3"
                );

            if (title) {

                title.textContent =
                    t(
                        "history.help.managementTitle"
                    );

            }

            const paragraphs =
                sections[3].querySelectorAll(
                    "p"
                );

            const keys = [
                "history.help.management1",
                "history.help.management2",
                "history.help.management3"
            ];

            paragraphs.forEach(
                (paragraph, index) => {

                    if (keys[index]) {

                        paragraph.textContent =
                            t(
                                keys[index]
                            );

                    }

                }
            );

        }

    }


    setText(
        "#btnCloseHistoryHelpBottom",
        "history.help.close"
    );

    setText(
        "#btnHistoryByDate",
        "history.byDate"
    );

    setText(
        "#btnHistoryByProduct",
        "history.byProduct"
    );

    setText(
        "#btnDeletedPriceHistory",
        "history.deleted"
    );

}

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
                ${t(
            "history.month"
        )
                .replace(
                    "{year}",
                    Number(year)
                )
                .replace(
                    "{month}",
                    Number(month)
                )
                .replace(
                    "{count}",
                    monthlyHistory[
                        monthKey
                    ].length
                )}
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
            : t(
                "history.productMissing"
            );

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
            ${t(
            "history.discountPercent"
        ).replace(
            "{value}",
            history.discountValue
        )}
        </p>

    `;

    } else if (
        history.discountType === "yen" &&
        Number(history.discountValue) > 0
    ) {
        priceCalculationHtml += `
        <p class="history-discount-info">
            ${t(
            "history.discountAmount"
        ).replace(
            "{price}",
            currencySymbol +
            history.discountValue
        )}
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
                ? t(
                    "history.taxExcluded"
                )
                : t(
                    "history.taxIncluded"
                );

        priceCalculationHtml += `

        <p class="history-price-detail">
            ${t(
            "history.displayPrice"
        )}
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
        ${t(
            "history.taxExcludedPrice"
        )}
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
        ${t(
            "history.taxRate"
        )}
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
                ? t(
                    "history.floor"
                )
                : history.roundingMode === "ceil"
                    ? t(
                        "history.ceil"
                    )
                    : t(
                        "history.round"
                    );


        priceCalculationHtml += `

    <p class="history-price-detail">
        ${t(
            "history.rounding"
        )}
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
        ${t(
        "history.quantity"
    )}
        ${history.quantity || 1}
    </p>


    ${priceCalculationHtml}


    <div class="history-product-action">

        <button
            type="button"
            class="history-product-view-button"
            onclick="openRegisteredJanInfo('${history.productId}', 'history')">

            ${t(
        "history.viewPurchase"
    )}

        </button>

    </div>

    <div class="history-card-buttons">

        <button
            type="button"
            onclick="editPriceHistoryRecord('${history.id}')">

            ${t(
        "history.edit"
    )}

        </button>

        <button
            type="button"
            onclick="deletePriceHistoryRecord('${history.id}')">

            ${t(
        "history.delete"
    )}

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
            ${t(
        "history.categoryAll"
    )}
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
            t(
                "history.category"
            ).replace(
                "{name}",
                category.name
            );

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
            t(
                "history.productCount"
            ).replace(
                "{count}",
                productIds.length
            );

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
                ? t(
                    "history.favorite"
                )
                : t(
                    "history.notFavorite"
                )}

                </button>

                <div class="history-summary-grid">

                    <div>
                        <small>
                            ${t(
                    "history.latest"
                )}
                        </small>
                        <strong>
                            ${historyCurrencySymbol}${latestPrice}
                        </strong>
                    </div>

                    <div>
                        <small>
                            ${t(
                    "history.lowest"
                )}
                        </small>
                        <strong>
                            ${historyCurrencySymbol}${lowestPrice}
                        </strong>
                    </div>

                    <div>
                        <small>
                            ${t(
                    "history.average"
                )}
                        </small>
                        <strong>
                            ${historyCurrencySymbol}${averagePrice}
                        </strong>
                    </div>

                    <div>
                        <small>
                            ${t(
                    "history.purchaseCount"
                )}
                        </small>
                        <strong>
                            ${t(
                    "history.times"
                ).replace(
                    "{count}",
                    purchaseCount
                )}
                        </strong>
                    </div>

                </div>

                <button
                    type="button"
                    class="history-detail-button"
                    onclick="toggleProductHistory(this)">

                    ${t(
                    "history.open"
                )}

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
            ? t(
                "history.close"
            )
            : t(
                "history.open"
            );

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
                ${t(
        "history.empty.title"
    )}
            </p>

            <p class="history-empty-text">
                ${t(
        "history.empty.text"
    )}
            </p>

        </div>

    `;

}

/* ==========================================
   今回の購入
   表示言語更新
   ========================================== */

function updatePriceRecordScreenLanguage() {

    const screen =
        document.getElementById(
            "priceRecordScreen"
        );

    if (!screen) {
        return;
    }


    const setText = (
        selector,
        key
    ) => {

        const element =
            screen.querySelector(
                selector
            );

        if (element) {

            element.textContent =
                t(key);

        }

    };


    const setLabel = (
        forId,
        key
    ) => {

        const label =
            screen.querySelector(
                `label[for="${forId}"]`
            );

        if (label) {

            label.textContent =
                t(key);

        }

    };


    /*
     タイトル
    */

    setText(
        ".purchase-header h2",
        "purchase.title"
    );


    /*
     前回価格
    */

    const previousPriceArea =
        screen.querySelector(
            ".purchase-previous-price"
        );

    if (previousPriceArea) {

        const label =
            previousPriceArea.querySelector(
                "span"
            );

        if (label) {

            label.textContent =
                t(
                    "purchase.previousPrice"
                );

        }

    }


    /*
     商品コード
    */

    setLabel(
        "txtPriceRecordJanCode",
        "purchase.code"
    );

    const janInput =
        document.getElementById(
            "txtPriceRecordJanCode"
        );

    if (janInput) {

        janInput.placeholder =
            t(
                "purchase.codePlaceholder"
            );

    }

    setText(
        "#btnScanPriceRecordJan",
        "purchase.scanCode"
    );


    const janGuide =
        screen.querySelector(
            ".purchase-jan-guide"
        );

    if (janGuide) {

        janGuide.textContent =
            t(
                "purchase.codeGuide"
            );

    }


    /*
     購入先
    */

    const inputArea =
        screen.querySelector(
            ".purchase-input-area"
        );

    if (inputArea) {

        const firstLabel =
            inputArea.querySelector(
                "label:not([for])"
            );

        if (firstLabel) {

            firstLabel.textContent =
                t(
                    "purchase.store"
                );

        }

    }


    const previousStoreArea =
        document.getElementById(
            "priceRecordPreviousStoreQuickArea"
        );

    if (previousStoreArea) {

        const small =
            previousStoreArea.querySelector(
                "small"
            );

        if (small) {

            small.textContent =
                t(
                    "purchase.previousStore"
                );

        }

    }


    const recentStoreArea =
        document.getElementById(
            "priceRecordRecentStoresArea"
        );

    if (recentStoreArea) {

        const small =
            recentStoreArea.querySelector(
                "small"
            );

        if (small) {

            small.textContent =
                t(
                    "purchase.recentStores"
                );

        }

    }


    setText(
        "#btnTogglePriceRecordStoreSearch",
        "purchase.searchStore"
    );

    setLabel(
        "cmbPriceRecordStoreSearchCountry",
        "purchase.country"
    );


    /*
     その他の店舗を探す
     国・地域候補
    */

    const countrySelect =
        document.getElementById(
            "cmbPriceRecordStoreSearchCountry"
        );

    if (countrySelect) {

        const countryKeys = {

            JP: "country.JP",
            US: "country.US",
            CA: "country.CA",
            AU: "country.AU",
            KR: "country.KR",
            CN: "country.CN",
            TW: "country.TW",
            OTHER: "country.OTHER"

        };

        const countryFlags = {

            JP: "🇯🇵",
            US: "🇺🇸",
            CA: "🇨🇦",
            AU: "🇦🇺",
            KR: "🇰🇷",
            CN: "🇨🇳",
            TW: "🇹🇼",
            OTHER: "🌐"

        };


        for (
            const option of
            countrySelect.options
        ) {

            if (
                option.value === ""
            ) {

                option.textContent =
                    t(
                        "purchase.allCountries"
                    );

                continue;

            }


            const translationKey =
                countryKeys[
                option.value
                ];


            if (translationKey) {

                option.textContent =
                    (
                        countryFlags[
                        option.value
                        ] || ""
                    ) +
                    " " +
                    t(
                        translationKey
                    );

            }

        }

    }


    setLabel(
        "cmbPriceRecordStoreSearchRegion",
        "purchase.region"
    );

    setLabel(
        "txtPriceRecordStoreSearchName",
        "purchase.storeName"
    );


    const searchInput =
        document.getElementById(
            "txtPriceRecordStoreSearchName"
        );

    if (searchInput) {

        searchInput.placeholder =
            t(
                "purchase.storeSearchPlaceholder"
            );

    }


    setLabel(
        "cmbPriceRecordStore",
        "purchase.allStores"
    );

    setText(
        "#btnManageStoresFromPriceRecord",
        "purchase.manageStores"
    );


    /*
     今回価格
    */

    setLabel(
        "txtPriceRecordPrice",
        "purchase.currentPrice"
    );

    setText(
        "#btnPurchaseTaxCalc",
        "purchase.priceCalc"
    );

    setLabel(
        "txtPurchaseTaxExcluded",
        "purchase.taxExcluded"
    );

    setLabel(
        "cmbPurchaseTaxRate",
        "purchase.taxRate"
    );

    setLabel(
        "txtPurchaseCustomTaxRate",
        "purchase.customTaxRate"
    );

    setLabel(
        "cmbPurchaseRoundingMode",
        "purchase.rounding"
    );


    const rounding =
        document.getElementById(
            "cmbPurchaseRoundingMode"
        );

    if (rounding) {

        const roundingKeys = {

            round:
                "purchase.round",

            floor:
                "purchase.floor",

            ceil:
                "purchase.ceil"

        };

        for (
            const option of
            rounding.options
        ) {

            if (
                roundingKeys[
                option.value
                ]
            ) {

                option.textContent =
                    t(
                        roundingKeys[
                        option.value
                        ]
                    );

            }

        }

    }


    /*
     値引き
    */

    setLabel(
        "cmbPurchaseDiscountType",
        "purchase.discount"
    );

    const discountSelect =
        document.getElementById(
            "cmbPurchaseDiscountType"
        );

    if (discountSelect) {

        const noneOption =
            discountSelect.querySelector(
                'option[value="none"]'
            );

        const percentOption =
            discountSelect.querySelector(
                'option[value="percent"]'
            );

        if (noneOption) {
            noneOption.textContent =
                t(
                    "purchase.discountNone"
                );
        }

        if (percentOption) {
            percentOption.textContent =
                t(
                    "purchase.discountPercent"
                );
        }

    }

    setLabel(
        "txtPurchaseDiscountValue",
        "purchase.discountValue"
    );


    setText(
        "#btnUsePurchaseTaxPrice",
        "purchase.usePrice"
    );

    setText(
        "#btnClosePurchaseTaxCalc",
        "purchase.close"
    );

    setLabel(
        "txtPriceRecordQuantity",
        "purchase.quantity"
    );


    const saveButton =
        screen.querySelector(
            ".purchase-save-button"
        );

    if (saveButton) {

        saveButton.textContent =
            t(
                "purchase.save"
            );

    }

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

    updatePriceRecordScreenLanguage();

    priceRecordReturnScreen =
        "history";

    const backButton =
        document.getElementById(
            "btnBackPriceRecord"
        );

    if (backButton) {

        backButton.textContent =
            t(
                "purchase.backHistory"
            );

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
            t(
                "purchase.noRecord"
            );

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
                t(
                    "purchase.taxGuide.jp"
                );
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
                t(
                    "purchase.taxGuide.other"
                );
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
     値引き方法を
     国・地域の通貨に合わせる
    */

    const cmbPurchaseDiscountType =
        document.getElementById(
            "cmbPurchaseDiscountType"
        );

    if (cmbPurchaseDiscountType) {

        const amountDiscountLabels = {

            JP: "円引き",
            US: "$引き",
            CA: "C$引き",
            AU: "A$引き",
            KR: "₩引き",
            CN: "¥引き",
            TW: "NT$引き"

        };

        const amountDiscountLabel =
            amountDiscountLabels[
            productCountry
            ] || "金額引き";

        const amountDiscountOption =
            cmbPurchaseDiscountType.querySelector(
                'option[value="yen"]'
            );

        if (amountDiscountOption) {

            amountDiscountOption.textContent =
                amountDiscountLabel;

        }

        /*
         画面を開くたびに
         値引きを初期状態へ戻す
        */

        cmbPurchaseDiscountType.value =
            "none";

    }

    const txtPurchaseDiscountValue =
        document.getElementById(
            "txtPurchaseDiscountValue"
        );

    if (txtPurchaseDiscountValue) {

        txtPurchaseDiscountValue.value =
            "0";

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


    /*
     今回の購入
     購入先を変更したときに
     国・通貨・税率・値引き表示を更新
    */

    if (cmbStore) {

        cmbStore.onchange = () => {

            updatePriceRecordStoreCountrySettings();

        };

    }

}

/* ==========================================
   今回の購入
   購入先の国・通貨設定を更新
   ========================================== */

function updatePriceRecordStoreCountrySettings() {

    const cmbStore =
        document.getElementById(
            "cmbPriceRecordStore"
        );

    if (!cmbStore) {
        return;
    }


    /*
     今回選択した購入先を取得
    */

    const selectedStore =
        cmbStore.value
            ? findStore(
                cmbStore.value
            )
            : null;


    /*
     購入先が未選択の場合は
     商品登録時の購入先を使用
    */

    const product =
        products.find(
            product =>
                product.id ===
                recordingProductId
        );

    const registeredStore =
        product &&
            product.storeId
            ? findStore(
                product.storeId
            )
            : null;


    const storeCountry =
        selectedStore
            ? selectedStore.country || "JP"
            : registeredStore
                ? registeredStore.country || "JP"
                : "JP";


    /*
     通貨表示
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
        storeCountry
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
     税率入力方法
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


    if (storeCountry === "JP") {

        if (cmbPurchaseTaxRate) {

            cmbPurchaseTaxRate.hidden =
                false;

        }

        if (purchaseCustomTaxArea) {

            purchaseCustomTaxArea.hidden =
                true;

        }

        if (purchaseTaxGuide) {

            purchaseTaxGuide.textContent =
                t(
                    "purchase.taxGuide.jp"
                );

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

        if (purchaseTaxGuide) {

            purchaseTaxGuide.textContent =
                t(
                    "purchase.taxGuide.other"
                );

        }

    }


    /*
     金額値引きの表示
    */

    const cmbPurchaseDiscountType =
        document.getElementById(
            "cmbPurchaseDiscountType"
        );

    if (cmbPurchaseDiscountType) {

        const amountDiscountLabels = {

            JP: "円引き",
            US: "$引き",
            CA: "C$引き",
            AU: "A$引き",
            KR: "₩引き",
            CN: "¥引き",
            TW: "NT$引き"

        };

        const amountDiscountOption =
            cmbPurchaseDiscountType.querySelector(
                'option[value="yen"]'
            );

        if (amountDiscountOption) {

            amountDiscountOption.textContent =
                amountDiscountLabels[
                storeCountry
                ] || "金額引き";

        }

    }

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
            ${t(
        "purchase.selectStore"
    )}
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
            t(
                "purchase.validation.store"
            );

        cmbStore.focus();

        return;

    }

    if (price === "") {

        message.textContent =
            t(
                "purchase.validation.price"
            );

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
                t(
                    "purchase.validation.duplicateCode"
                );

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
            t(
                "purchase.error.save"
            );

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
            t(
                "history.delete.notFound"
            )
        );

        return;

    }

    const confirmed =
        confirm(
            t(
                "history.delete.confirm"
            )
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
            t(
                "history.delete.failed"
            )
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
            t(
                "history.edit.notFound"
            )
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
            t(
                "history.product.notFound"
            )
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
            t(
                "purchase.backHistory"
            );

    }

    updatePriceRecordScreenLanguage();

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
                t(
                    "purchase.taxGuide.jp"
                );

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
                t(
                    "purchase.taxGuide.other"
                );

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
        t(
            "history.editing"
        );

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
        t(
            "history.deleted.back"
        );

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
                    ${t(
            "history.deleted.empty"
        )}
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
                : t(
                    "history.productMissing"
                );

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

                    ${t(
            "history.deleted.restore"
        )}

                </button>

                <button
                    type="button"
                    onclick="permanentlyDeletePriceHistoryRecord('${history.id}')">

                    ${t(
            "history.deleted.permanentDelete"
        )}

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
            t(
                "history.deleted.restoreFailed"
            )
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
            t(
                "history.deleted.confirmPermanent"
            )
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
            t(
                "history.deleted.permanentDeleteFailed"
            )
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

function updateRegisteredJanScreenLanguage() {

    const screen =
        document.getElementById(
            "registeredJanScreen"
        );

    if (!screen) {

        return;

    }

    const title =
        screen.querySelector(
            "header h2"
        );

    if (title) {

        title.textContent =
            t(
                "product.registered.title"
            );

    }


    const summaryLabels =
        screen.querySelectorAll(
            ".registered-price-summary span"
        );

    if (summaryLabels[0]) {

        summaryLabels[0].textContent =
            t(
                "product.registered.latest"
            );

    }

    if (summaryLabels[1]) {

        summaryLabels[1].textContent =
            t(
                "product.registered.lowest"
            );

    }

    if (summaryLabels[2]) {

        summaryLabels[2].textContent =
            t(
                "product.registered.average"
            );

    }


    const historyTitle =
        screen.querySelector(
            "h4"
        );

    if (historyTitle) {

        historyTitle.textContent =
            t(
                "product.registered.historyTitle"
            );

    }


    const buyButton =
        document.getElementById(
            "btnRegisteredJanPrice"
        );

    if (buyButton) {

        buyButton.textContent =
            t(
                "product.registered.buy"
            );

    }


    const skipButton =
        document.getElementById(
            "btnRegisteredJanSkip"
        );

    if (skipButton) {

        skipButton.textContent =
            t(
                "product.registered.skip"
            );

    }

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
                t(
                    "product.registered.backHistory"
                );

        } else if (
            returnScreen === "product"
        ) {

            btnCloseRegisteredJan.textContent =
                t(
                    "product.registered.backProduct"
                );

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
            t(
                "product.registered.notFound"
            )
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

    updateRegisteredJanScreenLanguage();

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
                ? t(
                    "product.registered.code"
                ).replace(
                    "{code}",
                    product.janCode
                )
                : t(
                    "product.registered.noCode"
                );

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
            t(
                "product.registered.noRecord"
            );

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
                ${t(
            "product.registered.noHistory"
        )}
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

