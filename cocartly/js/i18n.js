/*
 ==========================================
 Cocartly
 多言語化 基盤
 ==========================================
*/


/*
 対応言語
*/

const COCARTLY_LANGUAGES = [
    "ja",
    "en",
    "ko",
    "zh-CN",
    "zh-TW",
    "fr"
];


/*
 対応していない言語の場合に使用する言語
*/

const COCARTLY_FALLBACK_LANGUAGE =
    "en";

/*
 表示言語の保存キー
*/

const COCARTLY_LANGUAGE_STORAGE_KEY =
    "cocartly-language";

/*
 初回設定完了フラグの保存キー
*/

const COCARTLY_SETUP_COMPLETED_STORAGE_KEY =
    "cocartly-setup-completed";

/*
 普段買い物する国・地域の保存キー
*/

const COCARTLY_BASE_COUNTRY_STORAGE_KEY =
    "cocartly-base-country";

/*
 ブラウザの言語を
 Cocartly用の言語コードへ変換
*/

function normalizeCocartlyLanguage(
    language
) {

    const lang =
        String(
            language || ""
        )
            .trim()
            .toLowerCase();


    /*
     日本語
    */

    if (
        lang === "ja" ||
        lang.startsWith("ja-")
    ) {

        return "ja";

    }


    /*
     韓国語
    */

    if (
        lang === "ko" ||
        lang.startsWith("ko-")
    ) {

        return "ko";

    }


    /*
     台湾華語・繁体字中国語
    */

    if (
        lang === "zh-tw" ||
        lang === "zh-hk" ||
        lang === "zh-mo" ||
        lang.startsWith("zh-hant")
    ) {

        return "zh-TW";

    }


    /*
     中国語・簡体字中国語
    */

    if (
        lang === "zh" ||
        lang === "zh-cn" ||
        lang === "zh-sg" ||
        lang.startsWith("zh-hans")
    ) {

        return "zh-CN";

    }


    /*
     フランス語
    */

    if (
        lang === "fr" ||
        lang.startsWith("fr-")
    ) {

        return "fr";

    }


    /*
     英語
     US / UK / AU などは
     すべて共通の en として扱う
    */

    if (
        lang === "en" ||
        lang.startsWith("en-")
    ) {

        return "en";

    }


    /*
     未対応言語
    */

    return COCARTLY_FALLBACK_LANGUAGE;

}


/*
 端末・ブラウザから
 Cocartlyの初期表示言語を取得
*/

function detectCocartlyLanguage() {

    const browserLanguages =
        Array.isArray(
            navigator.languages
        ) &&
            navigator.languages.length > 0
            ? navigator.languages
            : [
                navigator.language
            ];


    for (
        const browserLanguage
        of browserLanguages
    ) {

        const normalizedLanguage =
            normalizeCocartlyLanguage(
                browserLanguage
            );


        /*
         対応言語なら使用
        */

        if (
            COCARTLY_LANGUAGES.includes(
                normalizedLanguage
            )
        ) {

            /*
             未対応言語が英語へ
             フォールバックしただけか確認
            */

            const original =
                String(
                    browserLanguage || ""
                )
                    .toLowerCase();


            const isActuallySupported =
                original.startsWith("ja") ||
                original.startsWith("en") ||
                original.startsWith("ko") ||
                original.startsWith("zh") ||
                original.startsWith("fr");


            if (
                isActuallySupported
            ) {

                return normalizedLanguage;

            }

        }

    }


    return COCARTLY_FALLBACK_LANGUAGE;

}

/*
 ==========================================
 保存済み表示言語を取得
 ==========================================
*/

function loadCocartlyLanguage() {

    const savedLanguage =
        localStorage.getItem(
            COCARTLY_LANGUAGE_STORAGE_KEY
        );


    /*
     保存されていない場合
    */

    if (!savedLanguage) {

        return null;

    }


    const normalizedLanguage =
        normalizeCocartlyLanguage(
            savedLanguage
        );


    /*
     Cocartly対応言語の場合のみ使用
    */

    if (
        COCARTLY_LANGUAGES.includes(
            normalizedLanguage
        )
    ) {

        return normalizedLanguage;

    }


    return null;

}

/*
 ==========================================
 普段買い物する国・地域を読み込む
 ==========================================
*/

function loadCocartlyBaseCountry() {

    const savedCountry =
        localStorage.getItem(
            COCARTLY_BASE_COUNTRY_STORAGE_KEY
        );

    if (!savedCountry) {
        return null;
    }

    const supportedCountries = [
        "JP",
        "US",
        "CA",
        "AU",
        "KR",
        "CN",
        "TW",
        "OTHER"
    ];

    if (
        supportedCountries.includes(
            savedCountry
        )
    ) {
        return savedCountry;
    }

    return null;

}

/*
 ==========================================
 普段買い物する国・地域を取得
 保存されていない場合は日本
 ==========================================
*/

function getCocartlyBaseCountry() {

    return (
        loadCocartlyBaseCountry() ||
        "JP"
    );

}

/*
 ==========================================
 普段買い物する国・地域を保存
 ==========================================
*/

function setCocartlyBaseCountry(
    country
) {

    const supportedCountries = [
        "JP",
        "US",
        "CA",
        "AU",
        "KR",
        "CN",
        "TW",
        "OTHER"
    ];

    if (
        !supportedCountries.includes(
            country
        )
    ) {
        return;
    }

    localStorage.setItem(
        COCARTLY_BASE_COUNTRY_STORAGE_KEY,
        country
    );

}

/*
 ==========================================
 初回設定が完了しているか確認
 ==========================================
*/

function isCocartlySetupCompleted() {

    return (
        localStorage.getItem(
            COCARTLY_SETUP_COMPLETED_STORAGE_KEY
        ) === "true"
    );

}

/*
 ==========================================
 初回設定を完了として保存
 ==========================================
*/

function completeCocartlySetup() {

    localStorage.setItem(
        COCARTLY_SETUP_COMPLETED_STORAGE_KEY,
        "true"
    );

}

/*
 ==========================================
 初回設定状態をリセット
 ※ 開発・動作確認用
 ==========================================
*/

function resetCocartlySetup() {

    localStorage.removeItem(
        COCARTLY_SETUP_COMPLETED_STORAGE_KEY
    );

}

/*
 ==========================================
 翻訳データ
 ==========================================
*/

const COCARTLY_TRANSLATIONS = {

    ja: {
        "common.start": "はじめる",
        "common.cancel": "キャンセル",
        "common.save": "保存",
        "common.close": "閉じる",

        "home.catch": "買い物を、もっとスマートに。",
        "home.code": "コード読取",
        "home.product": "商品登録",
        "home.shopping": "購入予定",
        "home.history": "履歴・価格比較",
        "home.outing": "お出かけチェック",
        "home.notice": "お知らせ",
        "home.settings": "設定",

        "notice.backHome": "← 🏠 ホームへ",
        "notice.title": "✉️ お知らせ",
        "notice.development.title":
            "Cocartlyを開発中です",
        "notice.development.text":
            "Cocartlyのホーム画面や各機能を、より使いやすくするために改善しています。",

        "product.title": "商品登録",
        "product.backHome": "← 🏠 ホームへ",
        "product.help": "使い方",

        "product.name": "商品名",
        "product.namePlaceholder": "例：シャンプー",

        "product.code": "商品コード",
        "product.codePlaceholder":
            "バーコード読取時に自動入力",
        "product.codeGuide":
            "※ バーコードがある商品は「コード読取」から登録してください。",

        "product.category": "商品ジャンル",
        "product.categoryManage": "⚙ 商品ジャンル管理",

        "category.default.food": "食品",
        "category.default.drink": "飲料",
        "category.default.snack": "お菓子",
        "category.default.alcohol": "お酒",
        "category.default.daily": "日用品",
        "category.default.hygiene": "洗剤・衛生用品",
        "category.default.medicine": "医薬品",
        "category.default.beauty": "化粧品・美容",
        "category.default.clothing": "衣料品",
        "category.default.baby": "ベビー用品",
        "category.default.pet": "ペット用品",
        "category.default.stationery": "文具・雑貨",
        "category.default.electronics": "家電・電池",
        "category.default.other": "その他",

        "product.country": "国・地域",

        "product.store": "購入先",
        "product.storeManage": "🏬 購入先管理",

        "product.volume": "内容量",
        "product.volumeExample": "入力例",
        "product.volumePlaceholder": "例：400",

        "product.volumeExampleTitle":
            "内容量・単位の入力例",
        "product.volumeExampleEgg":
            "🥚 たまご Lサイズ10個",
        "product.volumeExampleEggDetail":
            "内容量：10 ／ 単位：個",
        "product.volumeExampleMilk":
            "🥛 牛乳1000mL",
        "product.volumeExampleMilkDetail":
            "内容量：1000 ／ 単位：mL",
        "product.volumeExampleRice":
            "🍚 お米5kg",
        "product.volumeExampleRiceDetail":
            "内容量：5 ／ 単位：kg",
        "product.volumeExampleBread":
            "🍞 食パン6枚切",
        "product.volumeExampleBreadDetail":
            "内容量：6 ／ 単位：枚",

        "product.unit": "単位",
        "product.select": "選択してください",

        "product.unit.each": "個",
        "product.unit.sheet": "枚",
        "product.unit.bottle": "本",
        "product.unit.bag": "袋",
        "product.unit.box": "箱",
        "product.unit.pack": "パック",
        "product.unit.roll": "ロール",

        "product.price": "価格（税込）",
        "product.priceCalc": "価格計算",
        "product.pricePlaceholder": "例：298",

        "product.shareTitle":
            "Cocartlyの商品マスターへ共有",
        "product.shareDescription":
            "商品名・商品コード・商品ジャンルなどを共有します。価格や購入先は共有されません。",
        "product.shareThanks":
            "商品情報の充実にご協力いただき、ありがとうございます。",

        "product.save": "保存",
        "product.cancelEdit": "✕ 編集をキャンセル",
        "product.deletedItems": "🗑 削除済みアイテム",
        "product.registered": "登録済み商品",
        "product.allCategories": "ジャンル：すべて",

        "product.validation.volumeNeedsUnit":
            "内容量を入力した場合は、単位も選択してください。",
        "product.validation.unitNeedsVolume":
            "単位を選択した場合は、内容量も入力してください。",
        "product.validation.nameRequired":
            "商品名を入力してください。",
        "product.validation.categoryRequired":
            "商品ジャンルを選択してください。",
        "product.validation.storeRequired":
            "購入先を選択してください。",
        "product.validation.priceInvalid":
            "価格は0円以上で入力してください。",

        "product.message.saved":
            "✓ 保存しました",
        "product.message.savedOffline":
            "✓ 端末に保存しました。オンラインになったら同期できます",
        "product.message.editCancelled":
            "商品の編集をキャンセルしました。",

        /*
         商品登録
         使い方
        */

        "product.help.title":
            "商品登録について",

        "product.help.featureTitle":
            "この機能でできること",

        "product.help.feature1":
            "商品名・商品コード・商品ジャンル・購入先・内容量などの商品情報を登録できます。",

        "product.help.feature2":
            "バーコードがある商品はコード読取から登録すると、次回以降に同じバーコードを読み取った時、登録済み商品として自動で判定されます。",

        "product.help.feature3":
            "購入先や価格を記録すると、「履歴・価格比較」で過去の価格を確認できます。",

        "product.help.feature4":
            "登録済みの商品は、前回価格・最安価格・平均価格や過去の購入先を確認してから購入を記録できます。",

        "product.help.usefulTitle":
            "こんな時に便利です",

        "product.help.useful1":
            "「いつも買う商品を登録しておきたい」",

        "product.help.useful2":
            "「この商品は前回いくらだった？」",

        "product.help.useful3":
            "「どのお店で安く買えた？」",

        "product.help.useful4":
            "という時に役立ちます。",

        "product.help.howToTitle":
            "使い方",

        "product.help.step1":
            "バーコードがある商品は、ホームの「コード読取」からバーコードを読み取ります。",

        "product.help.step2":
            "初めての商品は、商品名・商品ジャンル・購入先・内容量などを確認して保存します。",

        "product.help.step3":
            "野菜・惣菜・量り売り商品など、バーコードがない商品はホームの「＋商品登録」から登録します。",

        "product.help.step4":
            "登録済みの商品をもう一度購入する時は、バーコードを読み取るか、登録済み商品の「価格を確認・購入する」を選びます。",

        "product.help.step5":
            "前回価格・最安価格・平均価格や、過去の購入先・価格を確認します。",

        "product.help.step6":
            "購入する場合は「購入する（価格を記録）」を選び、購入先・今回価格・数量を入力して記録します。",

        "product.help.step7":
            "今回購入しない場合は「今回は見送る」を選びます。",

        "product.help.step8":
            "記録した購入内容は、「履歴・価格比較」へ自動的に反映されます。",

        "product.help.close":
            "閉じる",


        /*
         商品登録
         価格計算
        */

        "product.tax.displayPrice":
            "表示価格",

        "product.tax.priceType":
            "表示価格の種類",

        "product.tax.taxIncluded":
            "税込",

        "product.tax.taxExcluded":
            "税抜",

        "product.tax.taxRate":
            "税率",

        "product.tax.customTaxRate":
            "税率（％）",

        "product.tax.jpGuide":
            "日本の税率を選択してください。",

        "product.tax.overseasGuide":
            "地域や商品の種類に応じた税率を入力してください。",

        "product.tax.rounding":
            "端数処理",

        "product.tax.round":
            "四捨五入",

        "product.tax.floor":
            "切り捨て",

        "product.tax.ceil":
            "切り上げ",

        "product.tax.discount":
            "値引き額・割引率",

        "product.tax.discountNone":
            "値引きなし",

        "product.tax.discountPercent":
            "％OFF",

        "product.tax.discountAmountLabel":
            "{currency}引き",

        "product.tax.discountAmount":
            "円引き",

        "product.tax.discountValue":
            "値引き値",

        "product.tax.finalPrice":
            "最終価格：{price}",

        "product.tax.usePrice":
            "この価格を使用",

        "product.tax.close":
            "閉じる",

        "product.tax.examplePrefix":
            "例：",

        "product.tax.discountValuePlaceholder":
            "例：20",

        "product.tax.inputError":
            "入力内容を確認してください。",

        /*
         商品登録
         登録済み商品一覧
        */

        "product.list.title":
            "登録済み商品",

        "product.list.allCategories":
            "ジャンル：すべて",

        "product.list.categoryPrefix":
            "ジャンル：",

        "product.list.count":
            "{count}件",

        "product.list.countOne":
            "{count}件",

        "product.list.empty":
            "登録済みの商品はありません。",

        "product.list.month":
            "{year}年{month}月",

        "product.list.code":
            "商品コード",

        "product.list.category":
            "商品ジャンル",

        "product.list.store":
            "購入先",

        "product.list.volume":
            "内容量",

        "product.list.price":
            "価格",

        "product.list.registeredDate":
            "登録日",

        "product.list.favorite":
            "よく使う",

        "product.list.checkPrice":
            "価格を確認・購入する",

        "product.list.edit":
            "✏ 編集",

        "product.list.delete":
            "🗑 削除",


        /*
         商品登録
         削除済み商品
        */

        "product.deleted.title":
            "削除済みアイテム",

        "product.deleted.button":
            "🗑 削除済みアイテム（{count}）",

        "product.deleted.back":
            "← 📦 商品登録へ",

        "product.deleted.restore":
            "♻ 復元",

        "product.deleted.permanentDelete":
            "🗑 完全削除",


        /*
         商品登録
         編集・削除・復元
        */

        "product.message.editMode":
            "編集モードです。保存すると商品情報を更新します。",

        "product.message.registrationCancelled":
            "商品の登録を中止しました。",

        "product.message.alreadyRegistered":
            "この商品はすでに登録されています。新しく登録する必要はありません。",

        "product.confirm.alreadyRegistered":
            "この商品はすでに登録されています。\n\n商品名：{name}\n\n同じ商品は新しく登録できません。",

        "product.confirm.delete":
            "削除しますか？",

        "product.confirm.deletedFound":
            "この商品は削除済みアイテムにあります。\n\n商品名：{name}\n\n新しく登録せず、復元しますか？",

        "product.confirm.permanentDelete":
            "「{name}」を完全に削除しますか？\n\nこの操作は元に戻せません。",

        "product.registered.backHistory":
            "← 📊 履歴・価格比較へ",

        "product.registered.backProduct":
            "← 📦 商品登録へ",

        "product.registered.notFound":
            "登録済みの商品情報が見つかりません。",

        "product.registered.code":
            "商品コード：{code}",

        "product.registered.noCode":
            "商品コードなし",

        "product.registered.noRecord":
            "記録なし",

        "product.registered.noHistory":
            "価格履歴はまだありません。",

        "product.registered.title":
            "登録済み商品",

        "product.registered.latest":
            "前回",

        "product.registered.lowest":
            "最安",

        "product.registered.average":
            "平均",

        "product.registered.historyTitle":
            "🏬 過去の購入先・価格",

        "product.registered.buy":
            "🛒 購入する（価格を記録）",

        "product.registered.skip":
            "今回は見送る",

        "shopping.title":
            "🛒 購入予定",

        "shopping.backHome":
            "← 🏠 ホームへ",

        "shopping.help":
            "使い方",

        "shopping.help.title":
            "購入予定について",

        "shopping.help.featureTitle":
            "この機能でできること",

        "shopping.help.feature1":
            "これから購入する商品をリストに追加して、買い物中に確認できます。",

        "shopping.help.feature2":
            "商品は「購入前」「購入済」「保留」に分けて管理できます。",

        "shopping.help.feature3":
            "登録済みの商品だけでなく、まだ商品登録していない商品も購入予定に追加できます。",

        "shopping.help.feature4":
            "商品詳細では、前回価格・最安価格・平均価格を確認しながら、今日のお店の販売状況や価格も記録できます。",

        "shopping.help.usefulTitle":
            "こんな時に便利です",

        "shopping.help.useful1":
            "「今日買うものを忘れたくない」",

        "shopping.help.useful2":
            "「買った商品と、まだ買っていない商品を確認したい」",

        "shopping.help.useful3":
            "「前回より安いか確認してから買いたい」",

        "shopping.help.useful4":
            "「品切れだった商品を一旦保留にしたい」",

        "shopping.help.howToTitle":
            "使い方",

        "shopping.help.step1":
            "「＋追加」を押して、購入したい商品を購入予定に追加します。",

        "shopping.help.step2":
            "登録済みの商品から選ぶか、新しい商品名を入力して追加できます。必要に応じて商品コードや予定数量も入力します。",

        "shopping.help.step3":
            "「購入前」から商品を選ぶと、商品の詳細を確認できます。",

        "shopping.help.step4":
            "購入履歴がある商品は、前回価格・最安価格・平均価格を確認できます。",

        "shopping.help.step5":
            "お店で確認した販売状況や価格は、「今日の店頭情報を記録」から残すことができます。",

        "shopping.help.step6":
            "商品を購入したら「✓ 購入した」を押します。",

        "shopping.help.step7":
            "今回購入しない商品は「一旦保留」にできます。保留した商品は「購入前に戻す」こともできます。",

        "shopping.help.step8":
            "不要になった商品は「購入予定から削除」で購入予定だけを削除できます。商品登録や過去の購入履歴は削除されません。",

        "shopping.help.step9":
            "買い物が終わったら「買い物終了」を押します。",

        "shopping.help.close":
            "閉じる",

        "shopping.pending":
            "購入前",

        "shopping.purchased":
            "購入済",

        "shopping.hold":
            "保留",

        "shopping.addTab":
            "＋追加",

        "shopping.remaining":
            "残り",

        "shopping.itemUnit":
            "商品",

        "shopping.remainingSummary":
            "残り {count} 商品",

        "shopping.remainingSummaryOne":
            "残り {count} 商品",

        "shopping.add.title":
            "購入予定に追加",

        "shopping.favorite":
            "⭐ よく使う",

        "shopping.all":
            "すべて",

        "shopping.registeredProduct":
            "登録済み商品",

        "shopping.selectProduct":
            "商品を選択してください",

        "shopping.or":
            "または",

        "shopping.productName":
            "商品名",

        "shopping.productNamePlaceholder":
            "例：キャベツ",

        "shopping.code":
            "商品コード（分かる場合）",

        "shopping.codePlaceholder":
            "分からない場合は空欄でOK",

        "shopping.scanCode":
            "📷 商品コードを読み取る",

        "shopping.codeGuide":
            "手入力またはカメラで読み取れます。",

        "shopping.quantity":
            "予定数量",

        "shopping.add":
            "＋ 購入予定に追加",

        "shopping.finish":
            "買い物終了",

        "shopping.empty.pending":
            "購入予定の商品はありません。",

        "shopping.empty.purchased":
            "購入済みの商品はありません。",

        "shopping.empty.hold":
            "保留中の商品はありません。",

        "shopping.empty.favorite":
            "よく使う商品はまだありません",

        "shopping.empty.category":
            "このジャンルの商品はありません",

        "shopping.validation.selectOrName":
            "登録済み商品を選ぶか、商品名を入力してください。",

        "shopping.validation.quantity":
            "数量は1以上で入力してください。",

        "shopping.validation.duplicateCode":
            "この商品コードの商品はすでに登録されています。",

        "shopping.validation.duplicateCodeDetail":
            "この商品コードの商品はすでに登録されています。\n\n商品名：{name}\n\n登録済み商品から追加してください。",

        "shopping.message.added":
            "購入予定に追加しました。",

        "shopping.message.unregisteredAdded":
            "未登録商品を購入予定に追加しました。",

        "shopping.productNameUnset":
            "商品名未設定",

        "shopping.previousPurchaseNone":
            "前回購入：記録なし",

        "shopping.previousPurchase":
            "前回購入：{store}",

        "shopping.quantityDisplay":
            "数量 {quantity}",

        "shopping.finish.noPurchased":
            "購入済みの商品がありません。",

        "shopping.finish.pendingWarning":
            "まだ購入前の商品が {count}商品あります。\n\n買い忘れはありませんか？\n\nこのまま買い物を終了しますか？",

        "shopping.finish.pendingWarningOne":
            "まだ購入前の商品が {count}商品あります。\n\n買い忘れはありませんか？\n\nこのまま買い物を終了しますか？",

        "shopping.finish.itemCount":
            "{count}商品",

        "shopping.finish.itemCountOne":
            "{count}商品",

        "shopping.finish.confirm":
            "買い物を終了します。\n\n購入済み：{purchasedText}\n購入前：{pendingText}\n保留：{holdText}\n\n購入済みの商品を確定しますか？",

        "shopping.finish.missingInfo":
            "購入履歴へ保存するための店頭情報が不足しています。\n\n次の商品で、「販売あり」と税込価格を記録してください。\n\n・{names}",

        "shopping.finish.completed":
            "買い物を終了しました。\n\n購入履歴へ保存：{historyText}\n新しく商品登録：{registeredText}",

        /* ==========================================
           購入予定 商品詳細
           ========================================== */

        "shopping.detail.back":
            "🛒 ← 購入予定へ",

        "shopping.detail.title":
            "商品詳細",

        "shopping.detail.unregistered":
            "未登録の商品です",

        "shopping.detail.quantity":
            "購入予定数量：",

        "shopping.detail.code":
            "商品コード",

        "shopping.detail.codePlaceholder":
            "分からない場合は空欄でOK",

        "shopping.detail.saveCode":
            "商品コードを保存",

        "shopping.detail.codeSaved":
            "商品コードを保存しました。",

        "shopping.detail.codeSavedEmpty":
            "商品コードを空欄で保存しました。",

        "shopping.detail.latest":
            "前回",

        "shopping.detail.lowest":
            "最安",

        "shopping.detail.average":
            "平均",

        "shopping.detail.taxIncludedShort":
            "税込",

        "shopping.detail.noHistory":
            "購入履歴はまだありません",

        "shopping.detail.previousStoreNone":
            "前回購入：記録なし",

        "shopping.detail.previousStore":
            "前回購入：{store}",


        /* ==========================================
           今日の店頭情報
           ========================================== */

        "shopping.store.title":
            "今日の店頭情報",

        "shopping.store.store":
            "販売店",

        "shopping.store.previous":
            "前回購入した店舗",

        "shopping.store.recent":
            "最近確認した店舗",

        "shopping.store.search":
            "🔍 その他の店舗を探す",

        "shopping.store.country":
            "国・地域",

        "shopping.store.allCountries":
            "すべての国・地域",

        "shopping.store.region":
            "都道府県・地域",

        "shopping.store.allRegions":
            "すべての地域",

        "shopping.store.name":
            "店舗名",

        "shopping.store.searchPlaceholder":
            "例：京橋、ライフ、Target",

        "shopping.store.allStores":
            "すべての販売店",

        "shopping.store.select":
            "販売店を選択してください",

        "shopping.store.availability":
            "販売状況",

        "shopping.store.available":
            "○ 販売あり",

        "shopping.store.soldout":
            "△ 品切れ中",

        "shopping.store.notavailable":
            "× 取扱なし",

        "shopping.store.unknown":
            "？ 未確認",

        "shopping.store.taxExcluded":
            "税抜価格",

        "shopping.store.taxExcludedShort":
            "税抜",

        "shopping.store.taxIncluded":
            "税込価格",

        "shopping.store.taxIncludedKnown":
            "分かる場合",

        "shopping.store.examplePrefix":
            "例：",

        "shopping.store.priceCalc":
            "価格計算",

        "shopping.store.priceType":
            "表示価格の種類",

        "shopping.store.priceTypeExcluded":
            "税抜",

        "shopping.store.priceTypeIncluded":
            "税込",

        "shopping.store.taxRate":
            "消費税率",

        "shopping.store.customTaxRate":
            "税率（％）",

        "shopping.store.rounding":
            "端数処理",

        "shopping.store.round":
            "四捨五入",

        "shopping.store.floor":
            "切り捨て",

        "shopping.store.ceil":
            "切り上げ",

        "shopping.store.discount":
            "値引き",

        "shopping.store.discountNone":
            "値引きなし",

        "shopping.store.discountPercent":
            "％OFF",

        "shopping.store.discountAmount":
            "円引き",

        "shopping.store.discountValue":
            "値引き額・割引率",

        "shopping.store.usePrice":
            "この価格を使う",

        "shopping.store.close":
            "閉じる",

        "shopping.store.save":
            "今日の店頭情報を記録",

        "shopping.store.saved":
            "店頭情報を記録しました。",

        "shopping.store.noChecks":
            "店頭確認の記録はありません。",

        "shopping.store.cheapest":
            "★ 最安",

        "shopping.store.checked":
            "確認：{date}",

        "shopping.store.noResults":
            "該当する店舗がありません。",

        "shopping.store.tooMany":
            "候補が多いため10件まで表示しています。さらに条件を絞ってください。",

        "shopping.detail.purchased":
            "✓ 購入した",

        "shopping.detail.hold":
            "一旦保留",

        "shopping.detail.holdMessage":
            "保留に移動しました。\n\n14日後に完全削除されます。",

        "shopping.detail.returnPending":
            "購入前に戻す",

        "shopping.detail.delete":
            "🗑 購入予定から削除",

        "shopping.detail.deleteGuide":
            "商品登録や過去の購入履歴は削除されません。",

        "shopping.detail.deleteConfirm":
            "この商品を購入予定から削除しますか？\n\n商品登録や過去の購入履歴は削除されません。",

        /* ==========================================
           今回の購入
           ========================================== */

        "purchase.backProduct":
            "← 商品へ戻る",

        "purchase.backHistory":
            "← 履歴・価格比較へ戻る",

        "purchase.backPurchase":
            "← 今回の購入へ",

        "purchase.backPurchaseScan":
            "🛒 今回の購入へ",

        "purchase.title":
            "🛒 今回の購入",

        "purchase.productName":
            "商品名",

        "purchase.previousPrice":
            "前回価格",

        "purchase.noRecord":
            "記録なし",

        "purchase.code":
            "商品コード",

        "purchase.codePlaceholder":
            "分からない場合は空欄でOK",

        "purchase.scanCode":
            "📷 商品コードを読み取る",

        "purchase.codeGuide":
            "カメラで読み取るか、帰宅後に入力・変更できます。",

        "purchase.store":
            "購入先",

        "purchase.previousStore":
            "前回購入した店舗",

        "purchase.recentStores":
            "最近使った店舗",

        "purchase.searchStore":
            "🔍 その他の店舗を探す",

        "purchase.country":
            "国・地域",

        "purchase.allCountries":
            "すべての国・地域",

        "purchase.region":
            "都道府県・地域",

        "purchase.allRegions":
            "すべての地域",

        "purchase.storeName":
            "店舗名",

        "purchase.storeSearchPlaceholder":
            "例：京橋、ライフ、Target",

        "purchase.allStores":
            "すべての購入先",

        "purchase.selectStore":
            "購入先を選択してください",

        "purchase.manageStores":
            "🏬 購入先管理",

        "purchase.currentPrice":
            "今回価格（税込）",

        "purchase.priceCalc":
            "価格計算",

        "purchase.taxExcluded":
            "税抜価格",

        "purchase.taxRate":
            "税率",

        "purchase.customTaxRate":
            "税率（％）",

        "purchase.rounding":
            "端数処理",

        "purchase.round":
            "四捨五入",

        "purchase.floor":
            "切り捨て",

        "purchase.ceil":
            "切り上げ",

        "purchase.discount":
            "値引き",

        "purchase.discountNone":
            "値引きなし",

        "purchase.discountPercent":
            "％OFF",

        "purchase.discountAmount":
            "{currency}引き",

        "purchase.discountValue":
            "値引き額・割引率",

        "purchase.taxIncludedResult":
            "税込価格：-",

        "purchase.usePrice":
            "この価格を使用",

        "purchase.close":
            "閉じる",

        "purchase.quantity":
            "購入数量",

        "purchase.save":
            "購入を記録",

        "purchase.taxGuide.jp":
            "日本の税率を選択してください。",

        "purchase.taxGuide.other":
            "地域や商品の種類に応じた税率を入力してください。",

        "purchase.validation.store":
            "購入先を選択してください。",

        "purchase.validation.price":
            "今回価格を入力してください。",

        "purchase.validation.duplicateCode":
            "この商品コードは別の商品ですでに登録されています。",

        "purchase.error.save":
            "購入を記録できませんでした。",

        /* ==========================================
           履歴・価格比較
           ========================================== */

        "history.backHome":
            "← 🏠 ホームへ",

        "history.title":
            "📊 履歴・価格比較",

        "history.help":
            "使い方",

        "history.help.title":
            "履歴・価格比較について",

        "history.help.featureTitle":
            "この機能でできること",

        "history.help.feature1":
            "購入した商品の履歴を、購入順または商品ごとに確認できます。",

        "history.help.feature2":
            "前回価格・最安価格・平均価格や、過去の購入先・価格を確認できます。",

        "history.help.feature3":
            "過去の価格と比べながら、今回購入するかどうかを判断する時にも利用できます。",

        "history.help.usefulTitle":
            "こんな時に便利です",

        "history.help.useful1":
            "「前回はいくらだった？」",

        "history.help.useful2":
            "「どのお店で安く買えた？」",

        "history.help.useful3":
            "「以前より価格が上がっている？」",

        "history.help.useful4":
            "「今の価格なら買った方がいい？」",

        "history.help.howToTitle":
            "使い方",

        "history.help.step1":
            "「購入順」では、購入した順番で履歴を確認できます。",

        "history.help.step2":
            "「商品ごと」では、同じ商品の購入履歴をまとめて確認できます。商品ジャンルで絞り込むこともできます。",

        "history.help.step3":
            "気になる商品の「価格を確認・購入する」を押します。",

        "history.help.step4":
            "前回価格・最安価格・平均価格や、過去の購入先・価格を確認します。",

        "history.help.step5":
            "購入する場合は、今回の購入内容を入力して記録します。",

        "history.help.step6":
            "今回購入しない場合は「今回は見送る」を選びます。",

        "history.help.step7":
            "購入を記録すると、新しい価格が「履歴・価格比較」へ自動的に追加されます。",

        "history.help.managementTitle":
            "履歴の管理",

        "history.help.management1":
            "間違って記録した履歴は編集できます。",

        "history.help.management2":
            "削除した履歴は「削除済み履歴」から確認・復元できます。",

        "history.help.management3":
            "「完全削除」した履歴は元に戻せません。内容を確認してから削除してください。",

        "history.help.close":
            "閉じる",

        "history.byDate":
            "🕒 購入順",

        "history.byProduct":
            "📦 商品ごと",

        "history.deleted":
            "🗑 削除済み履歴",

        "history.categoryAll":
            "ジャンル：すべて",

        "history.category":
            "ジャンル：{name}",

        "history.productCount":
            "{count}商品",

        "history.month":
            "{year}年 {month}月（{count}件）",

        "history.productMissing":
            "商品情報なし",

        "history.quantity":
            "購入数量：",

        "history.viewPurchase":
            "価格を確認・購入する",

        "history.edit":
            "✏ 編集",

        "history.delete":
            "🗑 削除",

        "history.favorite":
            "⭐ よく使う",

        "history.notFavorite":
            "☆ よく使う",

        "history.latest":
            "前回",

        "history.lowest":
            "最安",

        "history.average":
            "平均",

        "history.purchaseCount":
            "購入回数",

        "history.times":
            "{count}回",

        "history.open":
            "▶ 履歴を見る",

        "history.close":
            "▼ 履歴を閉じる",

        "history.displayPrice":
            "表示価格：",

        "history.taxExcluded":
            "税抜",

        "history.taxIncluded":
            "税込",

        "history.taxExcludedPrice":
            "税抜価格：",

        "history.taxRate":
            "税率：",

        "history.rounding":
            "端数処理：",

        "history.round":
            "四捨五入",

        "history.floor":
            "切り捨て",

        "history.ceil":
            "切り上げ",

        "history.discountPercent":
            "🏷 {value}％OFF",

        "history.discountAmount":
            "🏷 {price}引き",

        "history.empty.title":
            "購入履歴はまだありません。",

        "history.empty.text":
            "商品の購入価格を記録すると、ここに履歴が表示されます。",

        "history.delete.notFound":
            "削除する購入履歴が見つかりません。",

        "history.delete.confirm":
            "この購入履歴を削除しますか？",

        "history.delete.failed":
            "購入履歴を削除できませんでした。",

        "history.edit.notFound":
            "編集する購入履歴が見つかりません。",

        "history.product.notFound":
            "商品情報が見つかりません。",

        "history.editing":
            "購入履歴を編集中",

        "history.deleted.back":
            "← 通常の履歴へ戻る",

        "history.deleted.empty":
            "削除済みの購入履歴はありません。",

        "history.deleted.restore":
            "↩ 復元",

        "history.deleted.permanentDelete":
            "🗑 完全削除",

        "history.deleted.restoreFailed":
            "購入履歴を復元できませんでした。",

        "history.deleted.confirmPermanent":
            "この購入履歴を完全に削除しますか？\n\nこの操作は元に戻せません。",

        "history.deleted.permanentDeleteFailed":
            "購入履歴を完全削除できませんでした。",

        "settings.title": "設定",
        "settings.backHome": "← 🏠 ホームへ",

        "settings.basic": "基本設定",
        "settings.language": "🌐 表示言語",
        "settings.baseCountry": "🌍 普段買い物する国・地域",

        "settings.management": "管理",

        "settings.category.title": "商品ジャンル管理",
        "settings.category.guide":
            "商品登録で使うジャンルを追加・編集します。",

        /*
         商品ジャンル管理
        */

        "category.title":
            "商品ジャンル管理",

        "category.name":
            "商品ジャンル名",

        "category.namePlaceholder":
            "例：食品、飲料、日用品",

        "category.save":
            "＋ 保存",

        "category.backSettings":
            "← ⚙️ 設定へ",

        "category.backProduct":
            "← 商品登録へ",

        "category.list.default":
            "アプリ標準",

        "category.list.user":
            "ユーザー追加",

        "category.list.protected":
            "変更不可",

        "category.list.edit":
            "✏ 編集",

        "category.list.delete":
            "🗑 削除",

        "category.validation.nameRequired":
            "商品ジャンル名を入力してください。",

        "category.validation.duplicate":
            "同じ商品ジャンルが既に登録されています。",

        "category.message.editNotFound":
            "編集する商品ジャンルが見つかりません。",

        "category.default.editBlocked":
            "標準の商品ジャンルは変更できません。",

        "category.default.deleteBlocked":
            "標準の商品ジャンルは削除できません。",

        "category.confirm.deleteUsed":
            "この商品ジャンルは登録済み商品で使用されています。\n\n選択候補から削除しますか？\n登録済み商品のデータは残ります。",

        "category.confirm.delete":
            "この商品ジャンルを削除しますか？",

        "settings.store.title": "購入先管理",
        "settings.store.guide":
            "スーパーやドラッグストアなどの購入先を追加・編集します。",

        /*
         購入先管理
        */

        "store.title":
            "🏬 購入先管理",

        "store.country":
            "国・地域",

        "store.type":
            "購入先の種類",

        "store.select":
            "選択してください",

        "store.type.supermarket":
            "スーパー",

        "store.type.convenience":
            "コンビニ・売店",

        "store.type.drugstore":
            "ドラッグストア",

        "store.type.discount":
            "ディスカウントストア",

        "store.type.warehouse-club":
            "会員制倉庫店",

        "store.type.fixed-price":
            "100円・均一価格店",

        "store.type.home-center":
            "ホームセンター",

        "store.type.department-mall":
            "百貨店・ショッピングモール",

        "store.type.clothing":
            "衣料品店",

        "store.type.electronics":
            "家電量販店",

        "store.type.gas-station":
            "ガソリンスタンド併設店",

        "store.type.specialty":
            "専門店",

        "store.type.online":
            "通販・オンライン",

        "store.type.subscription":
            "定期購入",

        "store.type.vending":
            "自動販売機",

        "store.type.other":
            "その他",

        "store.region":
            "都道府県・州など",

        "store.city":
            "市区町村",

        "store.name":
            "購入先名",

        "store.save":
            "＋ 保存",

        "store.registered":
            "登録済み購入先",

        "store.placeholder.JP.store":
            "例：イオン〇〇店",

        "store.placeholder.JP.region":
            "例：東京都",

        "store.placeholder.JP.city":
            "例：港区",

        "store.placeholder.US.store":
            "例：Costco Los Angeles",

        "store.placeholder.US.region":
            "例：California",

        "store.placeholder.US.city":
            "例：Los Angeles",

        "store.placeholder.CA.store":
            "例：Costco Toronto",

        "store.placeholder.CA.region":
            "例：Ontario",

        "store.placeholder.CA.city":
            "例：Toronto",

        "store.placeholder.AU.store":
            "例：Woolworths Sydney",

        "store.placeholder.AU.region":
            "例：New South Wales",

        "store.placeholder.AU.city":
            "例：Sydney",

        "store.placeholder.KR.store":
            "例：이마트 서울점",

        "store.placeholder.KR.region":
            "例：서울특별시",

        "store.placeholder.KR.city":
            "例：강남구",

        "store.placeholder.CN.store":
            "例：沃尔玛上海店",

        "store.placeholder.CN.region":
            "例：上海市",

        "store.placeholder.CN.city":
            "例：浦东新区",

        "store.placeholder.TW.store":
            "例：家樂福台北店",

        "store.placeholder.TW.region":
            "例：臺北市",

        "store.placeholder.TW.city":
            "例：中正區",

        "store.placeholder.OTHER.store":
            "例：Store Name",

        "store.placeholder.OTHER.region":
            "例：State / Province",

        "store.placeholder.OTHER.city":
            "例：City",

        "store.default.jp.aeon.name":
            "イオンスタイル品川シーサイド",
        "store.default.jp.aeon.region":
            "東京都",
        "store.default.jp.aeon.city":
            "品川区",

        "store.default.jp.life.name":
            "ライフ セントラルスクエア恵比寿ガーデンプレイス店",
        "store.default.jp.life.region":
            "東京都",
        "store.default.jp.life.city":
            "渋谷区",

        "store.default.jp.mandai.name":
            "万代 渋川店",
        "store.default.jp.mandai.region":
            "大阪府",
        "store.default.jp.mandai.city":
            "東大阪市",

        "store.default.jp.gyomu.name":
            "業務スーパー 新宿大久保店",
        "store.default.jp.gyomu.region":
            "東京都",
        "store.default.jp.gyomu.city":
            "新宿区",

        "store.default.jp.coop.name":
            "コープみらい コープ戸山店",
        "store.default.jp.coop.region":
            "東京都",
        "store.default.jp.coop.city":
            "新宿区",

        "store.default.jp.lopia.name":
            "ロピア 平井島忠ホームズ店",
        "store.default.jp.lopia.region":
            "東京都",
        "store.default.jp.lopia.city":
            "江戸川区",

        "store.default.jp.donki.name":
            "MEGAドン・キホーテ渋谷本店",
        "store.default.jp.donki.region":
            "東京都",
        "store.default.jp.donki.city":
            "渋谷区",

        "store.default.jp.costco.name":
            "コストコ 川崎倉庫店",
        "store.default.jp.costco.region":
            "神奈川県",
        "store.default.jp.costco.city":
            "川崎市",

        "store.backSettings":
            "← ⚙️ 設定へ",

        "store.backProduct":
            "← 📦 商品登録へ",

        "store.validation.typeRequired":
            "購入先の種類を選択してください。",

        "store.validation.nameRequired":
            "購入先名を入力してください。",

        "store.validation.duplicate":
            "同じ購入先が既に登録されています。",

        "store.message.saved":
            "購入先を保存しました。",

        "store.message.editNotFound":
            "編集する購入先が見つかりません。",

        "store.message.updated":
            "購入先を更新しました。",

        "store.message.editMode":
            "編集モードです。保存すると更新されます。",

        "store.default.editBlocked":
            "この購入先はCocartlyの初期店舗のため変更できません。",

        "store.default.deleteBlocked":
            "この購入先はCocartlyの初期店舗のため削除できません。",

        "store.confirm.delete":
            "この店舗を削除しますか？",

        "store.list.protected":
            "🔒 変更不可",

        "store.list.default":
            "🔒 初期店舗",

        "store.list.added":
            "🏬 追加した店舗",

        "store.list.empty":
            "登録されている購入先はありません。",

        /*
         商品登録
         簡易追加
        */

        "product.quick.makerRequired":
            "メーカー名を入力してください。",

        "product.quick.makerExisting":
            "登録済みのメーカーを選択しました。",

        "product.quick.makerAdded":
            "メーカーを追加して選択しました。",

        "product.quick.categoryRequired":
            "商品ジャンルを入力してください。",

        "product.quick.categoryExisting":
            "登録済みの商品ジャンルを選択しました。",

        "product.quick.categoryAdded":
            "商品ジャンルを追加しました。",

        "product.quick.storeTypeRequired":
            "購入先の種類を選択してください。",

        "product.quick.storeNameRequired":
            "購入先名を入力してください。",

        "product.quick.storeExisting":
            "登録済みの購入先を選択しました。",

        "product.quick.storeAdded":
            "購入先を追加して選択しました。",

        "settings.data": "データ",

        "settings.backup.title": "データをバックアップ",
        "settings.backup.guide":
            "機種変更や万一に備えてCocartlyのデータを保存します。",

        "settings.restore.title": "バックアップから復元",
        "settings.restore.guide":
            "保存したCocartlyのデータをこの端末に戻します。",

        /*
         バックアップ・復元
        */

        "backup.message.created":
            "Cocartlyのバックアップを作成しました。\n\n機種変更や万一に備えて、このファイルを大切に保存してください。",

        "backup.message.failed":
            "バックアップを作成できませんでした。",

        "restore.message.invalidFile":
            "Cocartlyの正しいバックアップファイルではありません。",

        "restore.confirm":
            "バックアップから復元します。\n\n現在のCocartlyのデータは、バックアップ時点の内容に置き換わります。\n\n復元してもよろしいですか？",

        "restore.message.completed":
            "Cocartlyのデータを復元しました。\n\n画面を再読み込みします。",

        "restore.message.readFailed":
            "バックアップファイルを読み込めませんでした。\n\nファイルが壊れているか、Cocartlyのバックアップではない可能性があります。",

        "settings.app": "アプリ",

        "settings.about.title": "Cocartlyについて",
        "settings.about.guide":
            "Cocartlyの概要や主な機能を確認します。",

        "settings.version": "🔖 バージョン",

        "settings.privacy.title": "プライバシーポリシー",
        "settings.privacy.guide":
            "Cocartlyでのデータの取り扱いについて確認します。",

        /*
         Cocartlyについて
        */

        "about.back":
            "← ⚙️ 設定へ",

        "about.title":
            "ℹ️ Cocartlyについて",

        "about.appName":
            "🛒 Cocartly",

        "about.catch":
            "買い物と持ち物の管理を、もっと分かりやすく。",

        "about.description":
            "Cocartlyは、商品の登録や購入予定、購入履歴、価格比較、お出かけ前の持ち物チェックなどをまとめて管理できる買い物サポートアプリです。",

        "about.features.title":
            "主な機能",

        "about.features.product":
            "商品の登録・管理",

        "about.features.code":
            "商品コード読み取り",

        "about.features.shopping":
            "購入予定の管理",

        "about.features.history":
            "購入履歴・価格比較",

        "about.features.outing":
            "お出かけチェック",

        "about.features.master":
            "商品ジャンル・購入先の管理",

        "about.features.backup":
            "データのバックアップ・復元",

        "about.data.title":
            "データについて",

        "about.data.description":
            "Cocartlyのデータは、この端末のブラウザに保存されます。機種変更や万一に備えて、設定から定期的にバックアップしてください。",

        /*
         プライバシーポリシー
        */

        "privacy.back":
            "← ⚙️ 設定へ",

        "privacy.title":
            "🔒 プライバシーポリシー",

        "privacy.intro":
            "Cocartlyでは、利用者のデータを適切に取り扱うことを大切にしています。このプライバシーポリシーでは、Cocartlyで取り扱う情報とその利用方法について説明します。",

        "privacy.section1.title":
            "1. 取得・保存する情報",

        "privacy.section1.text":
            "Cocartlyでは、利用者が登録した商品情報、商品コード、商品ジャンル、購入先、購入予定、購入履歴、価格情報、お出かけチェックなどのデータを取り扱います。",

        "privacy.section2.title":
            "2. 利用目的",

        "privacy.section2.text":
            "これらの情報は、商品の管理、購入予定の確認、購入履歴や価格の比較、お出かけ前の持ち物確認など、Cocartlyの各機能を提供するために利用します。",

        "privacy.section3.title":
            "3. 端末内での保存",

        "privacy.section3.text1":
            "Cocartlyで登録したデータは、原則として利用している端末のブラウザ内に保存されます。",

        "privacy.section3.text2":
            "ブラウザのデータ削除や端末の変更などにより、保存されたデータが失われる場合があります。",

        "privacy.section4.title":
            "4. 外部サービスとの通信",

        "privacy.section4.text1":
            "商品コードから商品情報を検索するなど、一部の機能では外部サービスとの通信を行う場合があります。",

        "privacy.section4.text2":
            "その際、検索に必要な商品コードなどの情報が外部サービスへ送信される場合があります。",

        "privacy.section5.title":
            "5. バックアップデータ",

        "privacy.section5.text1":
            "「データをバックアップ」を使用すると、Cocartlyに保存されているデータをJSON形式のバックアップファイルとして端末に保存できます。",

        "privacy.section5.text2":
            "バックアップファイルには商品情報、購入履歴、お出かけ情報などが含まれるため、利用者自身で適切に保管・管理してください。",

        "privacy.section6.title":
            "6. アカウント情報",

        "privacy.section6.text1":
            "現在のCocartlyにはログイン機能やユーザーアカウント機能はありません。",

        "privacy.section6.text2":
            "そのため、Cocartlyではログイン目的のメールアドレスやパスワードを登録・保存しません。",

        "privacy.section7.title":
            "7. アクセス情報",

        "privacy.section7.text":
            "CocartlyをWebサービスとして公開した場合、サービス提供に必要な通信の過程で、IPアドレス、ブラウザや端末に関する情報、アクセス日時などの情報がホスティングサービス側で処理される場合があります。",

        "privacy.section8.title":
            "8. 第三者への提供",

        "privacy.section8.text1":
            "Cocartlyでは、法令に基づく場合を除き、利用者が登録したデータを運営者が第三者へ販売することはありません。",

        "privacy.section8.text2":
            "ただし、外部サービスを利用する機能では、その機能を提供するために必要な情報が当該サービスへ送信される場合があります。",

        "privacy.section9.title":
            "9. プライバシーポリシーの変更",

        "privacy.section9.text":
            "Cocartlyの機能追加、サービス内容の変更、利用する外部サービスの変更などに伴い、このプライバシーポリシーを変更する場合があります。",

        "privacy.section10.title":
            "10. お問い合わせ",

        "privacy.section10.text":
            "お問い合わせ方法については、Cocartlyの正式公開時に案内します。",

        /*
         端末・画面向き案内
        */

        "device.desktop.only":
            "cocartly はスマートフォン専用です。",

        "device.desktop.unavailable":
            "PC・タブレットではご利用いただけません。",

        "device.orientation.title":
            "スマートフォンを縦向きにしてください",

        "device.orientation.guide":
            "このアプリは縦向きでの使用に最適化されています。",

        /*
         コード読取
         残存ダイアログ
        */

        "code.backHome":
            "🏠 ホームへ",

        "code.title":
            "コード読取",

        "code.guide":
            "バーコードを枠内へ合わせてください。",

        "code.success":
            "読み取りました",

        "code.waiting":
            "読み取り待機中...",

        "code.flash":
            "🔦 ライト",

        "code.manualInput":
            "⌨ 商品コード入力",

        "code.message.flashComingSoon":
            "ライト機能は次回実装します。",

        "code.message.manualInputComingSoon":
            "商品コード番号入力は次回実装します。",

        "code.title":
            "コード読取",

        "code.guide":
            "バーコードを枠内へ合わせてください。",

        "code.status.align":
            "バーコードを枠の中央に合わせてください。",

        "code.status.checking":
            "コードを確認しています…",

        "code.status.success":
            "読取成功",

        "code.status.searching":
            "商品情報を検索しています…",

        "code.status.cameraError":
            "カメラを開始できませんでした。",

        "code.success":
            "読み取りました",

        "code.flash":
            "🔦 ライト",

        "code.flashOff":
            "🔦 ライトOFF",

        "code.manualInput":
            "⌨ 商品コード入力",

        "code.backHome":
            "🏠 ホームへ",

        "code.backShopping":
            "🛒 購入予定へ",

        "code.manual.prompt":
            "商品バーコードを入力してください。\n\n8桁・12桁・13桁の数字を入力します。",

        "code.manual.required":
            "商品コードを入力してください。",

        "code.manual.numberOnly":
            "商品コードは数字だけで入力してください。",

        "code.manual.invalidLength":
            "商品バーコードは8桁・12桁・13桁で入力してください。",

        "code.status.waiting":
            "読み取り待機中...",

        "code.status.openManual":
            "手入力の商品登録画面を開きます。",

        "code.status.openManualError":
            "商品情報を取得できなかったため、手入力画面を開きます。",

        "code.camera.notStarted":
            "カメラが起動していません。",

        "code.camera.notFound":
            "カメラを取得できませんでした。",

        "code.flash.unsupported":
            "この端末またはブラウザではライトを操作できません。",

        "code.flash.error":
            "ライトを切り替えられませんでした。",

        "code.product.notRegistered":
            "この商品はまだ登録されていません。\n\n商品コード：{code}\n\n商品登録画面へ進みます。",

        "code.product.selected":
            "商品コードから「{name}」を選択しました。",

        "code.product.apiNotFound":
            "バーコードは読み取りましたが、商品情報が登録されていませんでした。\n\n商品コード：{code}\n\n商品名などを入力して登録してください。",

        "code.product.autoFetchFailed":
            "商品情報を自動取得できませんでした。\n\n商品コード：{code}\n\n商品名などを入力して登録してください。",

        "code.product.manualRegistration":
            "商品情報を自動取得できませんでした。商品名などを入力して登録してください。",

        "code.product.codeConfirmed":
            "商品コードを確認しました。\n\n商品コード：{code}\n\n商品情報が見つからないため、商品登録画面を開きます。",

        "code.product.searchFailed":
            "商品情報を取得できませんでした。\n\n商品コード：{code}\n\n商品登録画面を開きます。",

        "setup.welcome": "Cocartlyへようこそ",
        "setup.countryGuide":
            "普段買い物する国・地域を選んでください。",

        "setup.languageLabel": "表示言語",
        "setup.countryLabel":
            "普段買い物する国・地域",

        "language.ja": "日本語",
        "language.en": "英語",
        "language.ko": "韓国語",
        "language.zh-CN": "中国語（簡体字）",
        "language.zh-TW": "中国語（繁体字）",
        "language.fr": "フランス語",

        "country.JP": "日本",
        "country.US": "アメリカ",
        "country.CA": "カナダ",
        "country.AU": "オーストラリア",
        "country.KR": "韓国",
        "country.CN": "中国",
        "country.TW": "台湾",
        "country.OTHER": "その他",

        /*
         ==========================================
         お出かけチェック
         ==========================================
        */

        "outing.title": "🎒 お出かけチェック",
        "outing.backHome": "← 🏠 ホームへ",
        "outing.help": "使い方",

        "outing.intro.title":
            "お出かけ前の忘れ物をチェック",

        "outing.intro.guide":
            "持っていく物を確認して、準備を進めましょう。購入が必要な物は「購入予定」に追加できます。",
        "outing.help.title":
            "お出かけチェックについて",
        "outing.help.whatCanDo":
            "この機能でできること",
        "outing.help.description1":
            "旅行・イベント・普段のお出かけなどで、持っていく物をリストにして確認できます。",
        "outing.help.description2":
            "持ち物を「家にある物」と「購入する物」に分けて管理できます。",
        "outing.help.description3":
            "購入が必要な物は「購入予定」に追加して、普段の買い物と一緒に管理できます。",
        "outing.help.description4":
            "よく使う持ち物リストは、次のお出かけにも利用できます。",

        "outing.help.usefulTitle":
            "こんな時に便利です",
        "outing.help.useful1":
            "「旅行の忘れ物を防ぎたい」",
        "outing.help.useful2":
            "「出かける前に必要な物を確認したい」",
        "outing.help.useful3":
            "「家にある物と、買う物を分けて管理したい」",
        "outing.help.useful4":
            "「いつも持っていく物を毎回入力したくない」",

        "outing.help.howTo":
            "使い方",
        "outing.help.step1":
            "「＋ お出かけを作る」を押して、新しいお出かけを作成します。",
        "outing.help.step2":
            "お出かけに必要な持ち物を登録します。",
        "outing.help.step3":
            "財布やタオルなど、購入せずに持っていく物は「家にある物」として管理します。",
        "outing.help.step4":
            "お出かけまでに買う物は「購入する物」として管理します。登録済みの商品を選んだり、商品コードから商品を探したりできます。",
        "outing.help.step5":
            "購入が必要な物は「購入予定」に追加できます。購入が完了すると、お出かけチェック側も準備済になります。",
        "outing.help.step6":
            "持ち物の状態に合わせて、「準備前」「準備済」「保留」を切り替えます。",
        "outing.help.step7":
            "持ち物を追加したくなった場合は、「＋追加」から途中でも追加できます。",

        "outing.help.management":
            "お出かけの管理",
        "outing.help.managementUpcoming":
            "「予定」では、これからのお出かけを確認できます。",
        "outing.help.managementRoutine":
            "「いつも使う」では、よく使うお出かけや持ち物を確認できます。",
        "outing.help.managementPast":
            "「過去」では、終了したお出かけを確認できます。",

        "outing.create":
            "＋ お出かけを作る",

        "outing.tab.upcoming":
            "予定",
        "outing.tab.routine":
            "いつも使う",
        "outing.tab.past":
            "過去",

        "outing.empty.upcoming":
            "まだ予定はありません。",
        "outing.empty.routine":
            "まだいつも使うお出かけはありません。",
        "outing.empty.past":
            "過去のお出かけはまだありません。",

        "outing.empty.default":
            "まだ登録されていません。",

        "outing.create.back":
            "← 🎒 お出かけチェックへ",
        "outing.create.title":
            "＋ お出かけを作る",
        "outing.create.question":
            "どんなお出かけですか？",
        "outing.create.guide":
            "「旅行」「野球観戦」など、分かりやすい名前を付けてください。",
        "outing.create.name":
            "お出かけ名",
        "outing.create.namePlaceholder":
            "例：野球観戦",
        "outing.create.type":
            "お出かけの種類",
        "outing.create.scheduled":
            "1回のお出かけ",
        "outing.create.routine":
            "繰り返し使う",
        "outing.create.typeGuide":
            "「旅行」「野球観戦」などは1回のお出かけ、「仕事」「学校」などは繰り返し使うがおすすめです。",
        "outing.create.date":
            "お出かけ日",
        "outing.create.item":
            "持っていく物",
        "outing.create.itemPlaceholder":
            "例：チケット",
        "outing.create.addItem":
            "＋ 持ち物を追加",
        "outing.create.noItems":
            "まだ持ち物は登録されていません。",
        "outing.create.save":
            "保存",

        "outing.message.itemRequired":
            "持っていく物を入力してください。",
        "outing.message.itemDuplicate":
            "同じ持ち物がすでに追加されています。",
        "outing.message.itemAdded":
            "持ち物を追加しました。",
        "outing.message.nameRequired":
            "お出かけ名を入力してください。",
        "outing.message.dateRequired":
            "お出かけ日を選択してください。",
        "outing.message.itemsRequired":
            "持っていく物を1つ以上追加してください。",
        "outing.message.nameDuplicate":
            "同じ名前のお出かけがすでに登録されています。",
        "outing.message.purchaseAdded":
            "購入する物に追加しました。",

        "outing.message.itemRegisteredDuplicate":
            "同じ持ち物がすでに登録されています。",

        "outing.message.purchaseRequired":
            "購入する物を入力してください。",

        "outing.message.productRequired":
            "商品を選択してください。",

        "outing.message.quantityInvalid":
            "数量は1以上で入力してください。",

        "outing.message.productNotFound":
            "商品が見つかりません。",

        "outing.message.productLinkedDuplicate":
            "この商品はすでに別の持ち物に設定されています。",

        "outing.message.productDuplicate":
            "この商品はすでに持ち物に追加されています。",

        "outing.message.registeredProductSelected":
            "登録した「{name}」を選択しました。",

        "outing.create.deleteItem":
            "🗑 削除",

        "outing.check.back":
            "← 🎒 お出かけチェックへ",
        "outing.check.title":
            "お出かけチェック",
        "outing.check.pending":
            "準備前",
        "outing.check.ready":
            "準備済",
        "outing.check.hold":
            "保留",
        "outing.check.add":
            "＋追加",
        "outing.check.complete":
            "✓ お出かけ終了",
        "outing.check.completeGuide":
            "終了すると「過去」へ移動します。",

        "outing.items.emptyStatus":
            "この状態の持ち物はありません。",

        "outing.items.home":
            "🏠 家にある物",

        "outing.items.purchase":
            "🛒 購入する物",

        "outing.items.purchased":
            "🛒 購入した物",

        "outing.items.emptyGroup":
            "この種類の持ち物はありません。",

        "outing.items.quantity":
            "数量 {quantity}",

        "outing.items.readyFromShopping":
            "購入して準備済",

        "outing.items.chooseProduct":
            "🔗 商品を選ぶ",

        "outing.items.addToShopping":
            "🛒 購入予定に追加",

        "outing.items.selectProductGuide":
            "商品を選ぶと購入予定に追加できます。",

        "outing.items.ready":
            "✓ 準備済にする",

        "outing.items.hold":
            "一旦保留",

        "outing.items.backPending":
            "準備前に戻す",

        "outing.items.delete":
            "🗑 この持ち物を削除",

        "outing.message.alreadyAddedToShopping":
            "この持ち物はすでに購入予定に追加されています。",

        "outing.confirm.deleteItem":
            "「{name}」をこのお出かけから削除しますか？",

        "outing.confirm.deleteLinkedItem":
            "\n\nこの持ち物は購入予定にも追加されています。\nお出かけとの関連だけ解除し、\n購入予定の商品は残します。",

        "outing.add.homeTitle":
            "🏠 家にある物・自由入力",
        "outing.add.item":
            "持っていく物",
        "outing.add.itemPlaceholder":
            "例：財布、タオル、飲み物",
        "outing.add.itemButton":
            "＋ 持ち物を追加",

        "outing.add.purchaseTitle":
            "🛒 購入する物",
        "outing.add.purchaseGuide":
            "商品名がまだ分からなくても、「飲み物」「充電器」などで追加できます。",
        "outing.add.purchase":
            "購入する物",
        "outing.add.purchasePlaceholder":
            "例：飲み物、充電器、電池",
        "outing.add.purchaseButton":
            "＋ 購入する物に追加",

        "outing.add.selectMethod":
            "商品を選ぶ方法",
        "outing.add.registered":
            "① 登録済み商品から選ぶ",
        "outing.add.category":
            "ジャンル",
        "outing.add.allCategories":
            "すべてのジャンル",
        "outing.add.product":
            "商品",
        "outing.add.selectProduct":
            "商品を選択してください",

        "outing.add.code":
            "② 商品コードから探す",
        "outing.add.codeGuide":
            "商品の商品コードが分かる場合は、カメラから商品を探せます。",
        "outing.add.scan":
            "📷 商品コードを読み取る",
        "outing.add.quantity":
            "数量",
        "outing.add.productButton":
            "＋ 商品を持ち物に追加",

        "outing.productSelect.back":
            "← 準備前へ戻る",
        "outing.productSelect.title":
            "🔗 商品を選ぶ",
        "outing.productSelect.guide":
            "「{name}」として購入する商品を選んでください。",

        "outing.productSelect.selectButton":
            "この商品を選ぶ",

        "outing.scan.back":
            "← お出かけチェックへ",

        "outing.past.back":
            "← 🎒 過去のお出かけへ",
        "outing.past.title":
            "過去のお出かけ",
        "outing.past.items":
            "持っていった物",
        "outing.past.yearMonth":
            "{year}年 {month}月",
        "outing.past.count":
            "{count}件",

        "outing.past.countOne":
            "{count}件",

        "outing.past.itemCount":
            "{count}項目",

        "outing.past.itemCountOne":
            "{count}項目",

        "outing.past.noDate":
            "日付：記録なし",

        "outing.past.noItems":
            "持ち物の記録はありません。",

        "outing.past.reuse":
            "🔁 このお出かけをもう一度使う",

        "outing.past.delete":
            "🗑 この過去のお出かけを削除",

        "outing.past.reuseSuffix":
            "（再利用）",

        "outing.confirm.complete":
            "このお出かけを終了しますか？\n\n「{name}」\n\n終了すると「過去」へ移動します。",

        "outing.message.copied":
            "過去のお出かけをコピーしました。日付を選んで保存してください。",

        "outing.confirm.deletePast":
            "「{name}」を過去のお出かけから削除しますか？\n\nこの操作は元に戻せません。\n\n登録済み商品や購入履歴は削除されません。",

        "outing.message.addedToShopping":
            "「{name}」を購入予定に追加しました。"
    },


    en: {
        "common.start": "Get Started",
        "common.cancel": "Cancel",
        "common.save": "Save",
        "common.close": "Close",

        "home.catch": "Shop smarter.",
        "home.code": "Scan Code",
        "home.product": "Add Product",
        "home.shopping": "Shopping List",
        "home.history": "History & Price",
        "home.outing": "Outing Checklist",
        "home.notice": "Notices",
        "home.settings": "Settings",

        "notice.backHome": "← 🏠 Home",
        "notice.title": "✉️ Notices",
        "notice.development.title":
            "Cocartly is in Development",
        "notice.development.text":
            "We are improving Cocartly's home screen and features to make them easier to use.",

        "product.title": "Add Product",
        "product.backHome": "← 🏠 Home",
        "product.help": "How to Use",

        "product.name": "Product Name",
        "product.namePlaceholder": "e.g. Shampoo",

        "product.code": "Product Code",
        "product.codePlaceholder":
            "Automatically entered when scanning a barcode",
        "product.codeGuide":
            "※ For products with a barcode, register them using Scan Code.",

        "product.category": "Product Category",
        "product.categoryManage": "⚙ Manage Categories",

        "category.default.food": "Food",
        "category.default.drink": "Beverages",
        "category.default.snack": "Snacks",
        "category.default.alcohol": "Alcohol",
        "category.default.daily": "Household",
        "category.default.hygiene": "Cleaning & Hygiene",
        "category.default.medicine": "Medicine",
        "category.default.beauty": "Beauty & Cosmetics",
        "category.default.clothing": "Clothing",
        "category.default.baby": "Baby",
        "category.default.pet": "Pet Supplies",
        "category.default.stationery": "Stationery & Goods",
        "category.default.electronics": "Electronics & Batteries",
        "category.default.other": "Other",

        "product.country": "Country / Region",

        "product.store": "Store",
        "product.storeManage": "🏬 Manage Stores",

        "product.volume": "Quantity / Volume",
        "product.volumeExample": "Examples",
        "product.volumePlaceholder": "e.g. 400",

        "product.volumeExampleTitle":
            "Quantity / Volume and Unit Examples",
        "product.volumeExampleEgg":
            "🥚 10 large eggs",
        "product.volumeExampleEggDetail":
            "Quantity / Volume: 10 / Unit: piece",
        "product.volumeExampleMilk":
            "🥛 Milk 1000 mL",
        "product.volumeExampleMilkDetail":
            "Quantity / Volume: 1000 / Unit: mL",
        "product.volumeExampleRice":
            "🍚 Rice 5 kg",
        "product.volumeExampleRiceDetail":
            "Quantity / Volume: 5 / Unit: kg",
        "product.volumeExampleBread":
            "🍞 6 slices of bread",
        "product.volumeExampleBreadDetail":
            "Quantity / Volume: 6 / Unit: slice",

        "product.unit": "Unit",
        "product.select": "Please select",

        "product.unit.each": "piece",
        "product.unit.sheet": "slice",
        "product.unit.bottle": "bottle",
        "product.unit.bag": "bag",
        "product.unit.box": "box",
        "product.unit.pack": "pack",
        "product.unit.roll": "roll",

        "product.price": "Price (Tax Included)",
        "product.priceCalc": "Price Calculator",
        "product.pricePlaceholder": "e.g. 298",

        "product.shareTitle":
            "Share with the Cocartly Product Database",
        "product.shareDescription":
            "Share the product name, product code, category, and similar information. Prices and stores are not shared.",
        "product.shareThanks":
            "Thank you for helping improve Cocartly's product information.",

        "product.save": "Save",
        "product.cancelEdit": "✕ Cancel Editing",
        "product.deletedItems": "🗑 Deleted Items",
        "product.registered": "Registered Products",
        "product.allCategories": "Category: All",

        "product.validation.volumeNeedsUnit":
            "Please select a unit when entering a quantity or volume.",
        "product.validation.unitNeedsVolume":
            "Please enter a quantity or volume when selecting a unit.",
        "product.validation.nameRequired":
            "Please enter a product name.",
        "product.validation.categoryRequired":
            "Please select a product category.",
        "product.validation.storeRequired":
            "Please select a store.",
        "product.validation.priceInvalid":
            "Please enter a price of 0 or more.",

        "product.message.saved":
            "✓ Saved",
        "product.message.savedOffline":
            "✓ Saved on this device. It can be synced when you are online.",
        "product.message.editCancelled":
            "Product editing was cancelled.",

        "settings.title": "Settings",
        "settings.backHome": "← 🏠 Home",

        "settings.basic": "Basic Settings",
        "settings.language": "🌐 Display Language",
        "settings.baseCountry": "🌍 Usual Shopping Country / Region",

        "settings.management": "Management",

        "settings.category.title": "Product Categories",
        "settings.category.guide":
            "Add or edit categories used when registering products.",

        "settings.store.title": "Stores",
        "settings.store.guide":
            "Add or edit stores such as supermarkets and drugstores.",

        "settings.data": "Data",

        "settings.backup.title": "Back Up Data",
        "settings.backup.guide":
            "Save your Cocartly data for device changes or emergencies.",

        "settings.restore.title": "Restore from Backup",
        "settings.restore.guide":
            "Restore saved Cocartly data to this device.",

        "settings.app": "App",

        "settings.about.title": "About Cocartly",
        "settings.about.guide":
            "View an overview of Cocartly and its main features.",

        "settings.version": "🔖 Version",

        "settings.privacy.title": "Privacy Policy",
        "settings.privacy.guide":
            "Learn how Cocartly handles your data.",

        "setup.welcome": "Welcome to Cocartly",
        "setup.countryGuide":
            "Choose the country or region where you usually shop.",

        "setup.languageLabel": "Display Language",
        "setup.countryLabel":
            "Country or Region Where You Usually Shop",

        "language.ja": "Japanese",
        "language.en": "English",
        "language.ko": "Korean",
        "language.zh-CN": "Chinese (Simplified)",
        "language.zh-TW": "Chinese (Traditional)",
        "language.fr": "French",

        "country.JP": "Japan",
        "country.US": "United States",
        "country.CA": "Canada",
        "country.AU": "Australia",
        "country.KR": "South Korea",
        "country.CN": "China",
        "country.TW": "Taiwan",
        "country.OTHER": "Other",

        /*
         Product Registration
         How to Use
        */

        "product.help.title":
            "About Product Registration",

        "product.help.featureTitle":
            "What You Can Do",

        "product.help.feature1":
            "Register product information such as the product name, product code, category, store, and quantity or volume.",

        "product.help.feature2":
            "For products with a barcode, register them using Scan Code. The next time you scan the same barcode, Cocartly will automatically recognize the registered product.",

        "product.help.feature3":
            "Record stores and prices to check past prices in History & Price.",

        "product.help.feature4":
            "For registered products, you can check the last price, lowest price, average price, and previous stores before recording a purchase.",

        "product.help.usefulTitle":
            "Useful When You Want To",

        "product.help.useful1":
            "“Save products you buy regularly”",

        "product.help.useful2":
            "“Check how much this product cost last time”",

        "product.help.useful3":
            "“See which store had the lowest price”",

        "product.help.useful4":
            "Cocartly can help in these situations.",

        "product.help.howToTitle":
            "How to Use",

        "product.help.step1":
            "For a product with a barcode, scan it from “Scan Code” on the Home screen.",

        "product.help.step2":
            "For a new product, check the product name, category, store, quantity or volume, and other information, then save it.",

        "product.help.step3":
            "For products without barcodes, such as vegetables, prepared foods, and items sold by weight, register them from “+ Add Product” on the Home screen.",

        "product.help.step4":
            "When buying a registered product again, scan its barcode or select “Check Price & Buy” from Registered Products.",

        "product.help.step5":
            "Check the last price, lowest price, average price, and previous stores and prices.",

        "product.help.step6":
            "To buy the product, select “Buy & Record Price”, then enter the store, current price, and quantity.",

        "product.help.step7":
            "If you are not buying it this time, select “Skip This Time”.",

        "product.help.step8":
            "Recorded purchases are automatically added to History & Price.",

        "product.help.close":
            "Close",

        /*
         Product Registration
         Price Calculator
        */

        "product.tax.displayPrice":
            "Displayed Price",

        "product.tax.priceType":
            "Price Type",

        "product.tax.taxIncluded":
            "Tax Included",

        "product.tax.taxExcluded":
            "Tax Excluded",

        "product.tax.taxRate":
            "Tax Rate",

        "product.tax.customTaxRate":
            "Tax Rate (%)",

        "product.tax.jpGuide":
            "Select the applicable tax rate in Japan.",

        "product.tax.overseasGuide":
            "Enter the tax rate for the region and product type.",

        "product.tax.rounding":
            "Rounding",

        "product.tax.round":
            "Round",

        "product.tax.floor":
            "Round Down",

        "product.tax.ceil":
            "Round Up",

        "product.tax.discount":
            "Discount",

        "product.tax.discountNone":
            "No Discount",

        "product.tax.discountPercent":
            "% OFF",

        "product.tax.discountAmountLabel":
            "{currency} OFF",

        "product.tax.discountAmount":
            "Amount Off",

        "product.tax.discountValue":
            "Discount Value",

        "product.tax.finalPrice":
            "Final Price: {price}",

        "product.tax.usePrice":
            "Use This Price",

        "product.tax.close":
            "Close",

        "product.tax.examplePrefix":
            "e.g. ",

        "product.tax.discountValuePlaceholder":
            "e.g. 20",

        "product.tax.inputError":
            "Please check your entries.",

        /*
         Registered Products
        */

        "product.list.title":
            "Registered Products",

        "product.list.allCategories":
            "Category: All",

        "product.list.categoryPrefix":
            "Category: ",

        "product.list.count":
            "{count} items",

        "product.list.countOne":
            "{count} item",

        "product.list.empty":
            "No registered products.",

        "product.list.month":
            "{month}/{year}",

        "product.list.code":
            "Product Code",

        "product.list.category":
            "Category",

        "product.list.store":
            "Store",

        "product.list.volume":
            "Quantity / Volume",

        "product.list.price":
            "Price",

        "product.list.registeredDate":
            "Registered",

        "product.list.favorite":
            "Favorite",

        "product.list.checkPrice":
            "Check Price & Buy",

        "product.list.edit":
            "✏ Edit",

        "product.list.delete":
            "🗑 Delete",

        /*
         Deleted Products
        */

        "product.deleted.title":
            "Deleted Items",

        "product.deleted.button":
            "🗑 Deleted Items ({count})",

        "product.deleted.back":
            "← 📦 Add Product",

        "product.deleted.restore":
            "♻ Restore",

        "product.deleted.permanentDelete":
            "🗑 Delete Permanently",

        "product.message.editMode":
            "Editing mode. Saving will update the product information.",

        "product.message.registrationCancelled":
            "Product registration was cancelled.",

        "product.message.alreadyRegistered":
            "This product is already registered. You do not need to register it again.",

        "product.confirm.alreadyRegistered":
            "This product is already registered.\n\nProduct: {name}\n\nThe same product cannot be registered again.",

        "product.confirm.delete":
            "Delete this product?",

        "product.confirm.deletedFound":
            "This product is in Deleted Items.\n\nProduct: {name}\n\nRestore it instead of registering it again?",

        "product.confirm.permanentDelete":
            "Permanently delete “{name}”?\n\nThis action cannot be undone.",

        "product.registered.backHistory":
            "← 📊 History & Price",

        "product.registered.backProduct":
            "← 📦 Add Product",

        "product.registered.notFound":
            "Registered product information was not found.",

        "product.registered.code":
            "Product Code: {code}",

        "product.registered.noCode":
            "No Product Code",

        "product.registered.noRecord":
            "Not Recorded",

        "product.registered.noHistory":
            "No price history yet.",

        "product.registered.title":
            "Registered Product",

        "product.registered.latest":
            "Last",

        "product.registered.lowest":
            "Lowest",

        "product.registered.average":
            "Average",

        "product.registered.historyTitle":
            "🏬 Previous Stores & Prices",

        "product.registered.buy":
            "🛒 Buy & Record Price",

        "product.registered.skip":
            "Skip This Time",

        /*
         Shopping List
        */

        "shopping.title":
            "🛒 Shopping List",

        "shopping.backHome":
            "← 🏠 Home",

        "shopping.help":
            "How to Use",

        "shopping.help.title":
            "About Shopping List",

        "shopping.help.featureTitle":
            "What You Can Do",

        "shopping.help.feature1":
            "Add products you plan to buy and check them while shopping.",

        "shopping.help.feature2":
            "Manage products as “To Buy”, “Purchased”, or “On Hold”.",

        "shopping.help.feature3":
            "You can add both registered products and products that have not yet been registered.",

        "shopping.help.feature4":
            "In Product Details, you can check the last, lowest, and average prices while also recording today's store availability and price.",

        "shopping.help.usefulTitle":
            "Useful When You Want To",

        "shopping.help.useful1":
            "“Remember everything you need to buy today”",

        "shopping.help.useful2":
            "“Check what you bought and what you still need”",

        "shopping.help.useful3":
            "“Check whether it is cheaper than last time”",

        "shopping.help.useful4":
            "“Put an out-of-stock product on hold”",

        "shopping.help.howToTitle":
            "How to Use",

        "shopping.help.step1":
            "Tap “+ Add” to add a product to your Shopping List.",

        "shopping.help.step2":
            "Select a registered product or enter a new product name. You can also enter a product code and planned quantity if needed.",

        "shopping.help.step3":
            "Select a product under “To Buy” to view its details.",

        "shopping.help.step4":
            "For products with purchase history, you can check the last, lowest, and average prices.",

        "shopping.help.step5":
            "Use “Record Today's Store Info” to save the availability and price you checked at the store.",

        "shopping.help.step6":
            "After buying a product, tap “✓ Purchased”.",

        "shopping.help.step7":
            "Products you are not buying this time can be placed “On Hold”. You can also return them to “To Buy”.",

        "shopping.help.step8":
            "Use “Remove from Shopping List” to remove only the shopping-list entry. The registered product and previous purchase history will not be deleted.",

        "shopping.help.step9":
            "When you finish shopping, tap “Finish Shopping”.",

        "shopping.help.close":
            "Close",

        "shopping.pending":
            "To Buy",

        "shopping.purchased":
            "Purchased",

        "shopping.hold":
            "On Hold",

        "shopping.addTab":
            "+ Add",

        "shopping.remaining":
            "Left",

        "shopping.itemUnit":
            "items",

        "shopping.remainingSummary":
            "Left {count} items",

        "shopping.remainingSummaryOne":
            "Left {count} item",

        "shopping.add.title":
            "Add to Shopping List",

        "shopping.favorite":
            "⭐ Favorites",

        "shopping.all":
            "All",

        "shopping.registeredProduct":
            "Registered Product",

        "shopping.selectProduct":
            "Select a product",

        "shopping.or":
            "or",

        "shopping.productName":
            "Product Name",

        "shopping.productNamePlaceholder":
            "e.g. Cabbage",

        "shopping.code":
            "Product Code (if known)",

        "shopping.codePlaceholder":
            "Leave blank if unknown",

        "shopping.scanCode":
            "📷 Scan Product Code",

        "shopping.codeGuide":
            "Enter it manually or scan it with the camera.",

        "shopping.quantity":
            "Planned Quantity",

        "shopping.add":
            "+ Add to Shopping List",

        "shopping.finish":
            "Finish Shopping",

        "shopping.empty.pending":
            "No products to buy.",

        "shopping.empty.purchased":
            "No purchased products.",

        "shopping.empty.hold":
            "No products on hold.",

        "shopping.empty.favorite":
            "No favorite products yet.",

        "shopping.empty.category":
            "No products in this category.",

        "shopping.validation.selectOrName":
            "Select a registered product or enter a product name.",

        "shopping.validation.quantity":
            "Enter a quantity of 1 or more.",

        "shopping.validation.duplicateCode":
            "A product with this product code is already registered.",

        "shopping.validation.duplicateCodeDetail":
            "A product with this product code is already registered.\n\nProduct: {name}\n\nPlease add it from Registered Products.",

        "shopping.message.added":
            "Added to the Shopping List.",

        "shopping.message.unregisteredAdded":
            "Unregistered product added to the Shopping List.",

        "shopping.productNameUnset":
            "No Product Name",

        "shopping.previousPurchaseNone":
            "No Previous Purchase",

        "shopping.previousPurchase":
            "Last Purchase: {store}",

        "shopping.quantityDisplay":
            "Quantity {quantity}",

        "shopping.finish.noPurchased":
            "No purchased products.",

        "shopping.finish.pendingWarning":
            "{count} items are still in To Buy.\n\nDid you forget anything?\n\nFinish shopping anyway?",

        "shopping.finish.pendingWarningOne":
            "{count} item is still in To Buy.\n\nDid you forget anything?\n\nFinish shopping anyway?",

        "shopping.finish.itemCount":
            "{count} items",

        "shopping.finish.itemCountOne":
            "{count} item",

        "shopping.finish.confirm":
            "Finish shopping?\n\nPurchased: {purchasedText}\nTo Buy: {pendingText}\nOn Hold: {holdText}\n\nConfirm the purchased products?",

        "shopping.finish.missingInfo":
            "Store information required to save purchase history is missing.\n\nFor the following products, record “Available” and the tax-included price.\n\n• {names}",

        "shopping.finish.completed":
            "Shopping complete.\n\nSaved to purchase history: {historyText}\nNew products registered: {registeredText}",

        /*
         Shopping List - Product Details
        */

        "shopping.detail.back":
            "🛒 ← Shopping List",

        "shopping.detail.title":
            "Product Details",

        "shopping.detail.unregistered":
            "Unregistered Product",

        "shopping.detail.quantity":
            "Planned Quantity: ",

        "shopping.detail.code":
            "Product Code",

        "shopping.detail.codePlaceholder":
            "Leave blank if unknown",

        "shopping.detail.saveCode":
            "Save Product Code",

        "shopping.detail.codeSaved":
            "Product code saved.",

        "shopping.detail.codeSavedEmpty":
            "Product code cleared.",

        "shopping.detail.latest":
            "Last",

        "shopping.detail.lowest":
            "Lowest",

        "shopping.detail.average":
            "Average",

        "shopping.detail.taxIncludedShort":
            "With Tax",

        "shopping.detail.noHistory":
            "No purchase history yet.",

        "shopping.detail.previousStoreNone":
            "No Previous Purchase",

        "shopping.detail.previousStore":
            "Last Purchase: {store}",

        /*
         Today's Store Info
        */

        "shopping.store.title":
            "Today's Store Info",

        "shopping.store.store":
            "Store",

        "shopping.store.previous":
            "Last Store",

        "shopping.store.recent":
            "Recent Stores",

        "shopping.store.search":
            "🔍 Find Other Stores",

        "shopping.store.country":
            "Country / Region",

        "shopping.store.allCountries":
            "All Countries / Regions",

        "shopping.store.region":
            "State / Region",

        "shopping.store.allRegions":
            "All Regions",

        "shopping.store.name":
            "Store Name",

        "shopping.store.searchPlaceholder":
            "e.g. Los Angeles, Walmart, Target",

        "shopping.store.allStores":
            "All Stores",

        "shopping.store.select":
            "Select a store",

        "shopping.store.availability":
            "Availability",

        "shopping.store.available":
            "○ Available",

        "shopping.store.soldout":
            "△ Sold Out",

        "shopping.store.notavailable":
            "× Not Sold",

        "shopping.store.unknown":
            "? Not Checked",

        "shopping.store.taxExcluded":
            "Price Before Tax",

        "shopping.store.taxExcludedShort":
            "Before Tax",

        "shopping.store.taxIncluded":
            "Price with Tax",

        "shopping.store.taxIncludedKnown":
            "If known",

        "shopping.store.examplePrefix":
            "e.g. ",

        "shopping.store.priceCalc":
            "Price Calculator",

        "shopping.store.priceType":
            "Price Type",

        "shopping.store.priceTypeExcluded":
            "Before Tax",

        "shopping.store.priceTypeIncluded":
            "Tax Included",

        "shopping.store.taxRate":
            "Tax Rate",

        "shopping.store.customTaxRate":
            "Tax Rate (%)",

        "shopping.store.rounding":
            "Rounding",

        "shopping.store.round":
            "Round",

        "shopping.store.floor":
            "Round Down",

        "shopping.store.ceil":
            "Round Up",

        "shopping.store.discount":
            "Discount",

        "shopping.store.discountNone":
            "No Discount",

        "shopping.store.discountPercent":
            "% OFF",

        "shopping.store.discountAmount":
            "{currency} Off",

        "shopping.store.discountValue":
            "Discount",

        "shopping.store.usePrice":
            "Use This Price",

        "shopping.store.close":
            "Close",

        "shopping.store.save":
            "Record Today's Store Info",

        "shopping.store.saved":
            "Store information saved.",

        "shopping.store.noChecks":
            "No store information recorded yet.",

        "shopping.store.cheapest":
            "★ Lowest",

        "shopping.store.checked":
            "Checked: {date}",

        "shopping.store.noResults":
            "No matching stores.",

        "shopping.store.tooMany":
            "There are too many results, so only 10 are shown. Please narrow your search.",

        "shopping.detail.purchased":
            "✓ Purchased",

        "shopping.detail.hold":
            "Put on Hold",

        "shopping.detail.holdMessage":
            "Moved to On Hold.\n\nIt will be permanently deleted after 14 days.",

        "shopping.detail.returnPending":
            "Mark as To Buy",

        "shopping.detail.delete":
            "🗑 Remove from Shopping List",

        "shopping.detail.deleteGuide":
            "The registered product and previous purchase history will not be deleted.",

        "shopping.detail.deleteConfirm":
            "Remove this product from the Shopping List?\n\nThe registered product and previous purchase history will not be deleted.",

        /*
         Purchase Details
        */

        "purchase.backProduct":
            "← Back to Product",

        "purchase.backHistory":
            "← Back to History & Price",

        "purchase.backPurchase":
            "← Back to Purchase Details",

        "purchase.backPurchaseScan":
            "🛒 Purchase Details",

        "purchase.title":
            "🛒 Purchase Details",

        "purchase.productName":
            "Product Name",

        "purchase.previousPrice":
            "Last Price",

        "purchase.noRecord":
            "Not Recorded",

        "purchase.code":
            "Product Code",

        "purchase.codePlaceholder":
            "Leave blank if unknown",

        "purchase.scanCode":
            "📷 Scan Product Code",

        "purchase.codeGuide":
            "Scan it with the camera, or enter or change it later.",

        "purchase.store":
            "Store",

        "purchase.previousStore":
            "Last Store",

        "purchase.recentStores":
            "Recent Stores",

        "purchase.searchStore":
            "🔍 Find Other Stores",

        "purchase.country":
            "Country / Region",

        "purchase.allCountries":
            "All Countries / Regions",

        "purchase.region":
            "State / Region",

        "purchase.allRegions":
            "All Regions",

        "purchase.storeName":
            "Store Name",

        "purchase.storeSearchPlaceholder":
            "e.g. Los Angeles, Walmart, Target",

        "purchase.allStores":
            "All Stores",

        "purchase.selectStore":
            "Select a store",

        "purchase.manageStores":
            "🏬 Manage Stores",

        "purchase.currentPrice":
            "Current Price (Tax Included)",

        "purchase.priceCalc":
            "Price Calculator",

        "purchase.taxExcluded":
            "Price Before Tax",

        "purchase.taxRate":
            "Tax Rate",

        "purchase.customTaxRate":
            "Tax Rate (%)",

        "purchase.rounding":
            "Rounding",

        "purchase.round":
            "Round",

        "purchase.floor":
            "Round Down",

        "purchase.ceil":
            "Round Up",

        "purchase.discount":
            "Discount",

        "purchase.discountNone":
            "No Discount",

        "purchase.discountPercent":
            "% OFF",

        "purchase.discountAmount":
            "{currency} OFF",

        "purchase.discountValue":
            "Amount Off / Discount Rate",

        "purchase.taxIncludedResult":
            "Tax-Included Price: -",

        "purchase.usePrice":
            "Use This Price",

        "purchase.close":
            "Close",

        "purchase.quantity":
            "Quantity",

        "purchase.save":
            "Record Purchase",

        "purchase.taxGuide.jp":
            "Select the applicable tax rate in Japan.",

        "purchase.taxGuide.other":
            "Enter the tax rate for the region and product type.",

        "purchase.validation.store":
            "Please select a store.",

        "purchase.validation.price":
            "Please enter the current price.",

        "purchase.validation.duplicateCode":
            "This product code is already registered to another product.",

        "purchase.error.save":
            "Could not record the purchase.",

        /*
         History & Price
        */

        "history.backHome":
            "← 🏠 Home",

        "history.title":
            "📊 History & Price",

        "history.help":
            "How to Use",

        "history.help.title":
            "About History & Price",

        "history.help.featureTitle":
            "What You Can Do",

        "history.help.feature1":
            "View purchase history by purchase date or by product.",

        "history.help.feature2":
            "Check the last, lowest, and average prices, along with previous stores and prices.",

        "history.help.feature3":
            "Compare past prices when deciding whether to buy a product now.",

        "history.help.usefulTitle":
            "Useful When You Want To",

        "history.help.useful1":
            "“Check how much it cost last time”",

        "history.help.useful2":
            "“See which store had the lowest price”",

        "history.help.useful3":
            "“Check whether the price has gone up”",

        "history.help.useful4":
            "“Decide whether to buy at the current price”",

        "history.help.howToTitle":
            "How to Use",

        "history.help.step1":
            "Under “By Purchase”, you can view purchases in chronological order.",

        "history.help.step2":
            "Under “By Product”, purchases of the same product are grouped together. You can also filter by category.",

        "history.help.step3":
            "Tap “Check Price & Buy” for the product you want to view.",

        "history.help.step4":
            "Check the last, lowest, and average prices, along with previous stores and prices.",

        "history.help.step5":
            "To buy it, enter the current purchase details and record the purchase.",

        "history.help.step6":
            "If you are not buying it this time, select “Skip This Time”.",

        "history.help.step7":
            "When a purchase is recorded, the new price is automatically added to History & Price.",

        "history.help.managementTitle":
            "Manage History",

        "history.help.management1":
            "You can edit purchase history that was recorded by mistake.",

        "history.help.management2":
            "Deleted records can be viewed and restored from Deleted History.",

        "history.help.management3":
            "Permanently deleted history cannot be restored. Check the details before deleting.",

        "history.help.close":
            "Close",

        "history.byDate":
            "🕒 By Purchase",

        "history.byProduct":
            "📦 By Product",

        "history.deleted":
            "🗑 Deleted History",

        "history.categoryAll":
            "Category: All",

        "history.category":
            "Category: {name}",

        "history.productCount":
            "{count} products",

        "history.month":
            "{month}/{year} ({count})",

        "history.productMissing":
            "Product Info Unavailable",

        "history.quantity":
            "Quantity: ",

        "history.viewPurchase":
            "Check Price & Buy",

        "history.edit":
            "✏ Edit",

        "history.delete":
            "🗑 Delete",

        "history.favorite":
            "⭐ Favorite",

        "history.notFavorite":
            "☆ Favorite",

        "history.latest":
            "Last",

        "history.lowest":
            "Lowest",

        "history.average":
            "Average",

        "history.purchaseCount":
            "Purchases",

        "history.times":
            "{count} times",

        "history.open":
            "▶ View History",

        "history.close":
            "▼ Close History",

        "history.displayPrice":
            "Displayed Price: ",

        "history.taxExcluded":
            "Before Tax",

        "history.taxIncluded":
            "Tax Included",

        "history.taxExcludedPrice":
            "Price Before Tax: ",

        "history.taxRate":
            "Tax Rate: ",

        "history.rounding":
            "Rounding: ",

        "history.round":
            "Round",

        "history.floor":
            "Round Down",

        "history.ceil":
            "Round Up",

        "history.discountPercent":
            "🏷 {value}% OFF",

        "history.discountAmount":
            "🏷 {price} OFF",

        "history.empty.title":
            "No purchase history yet.",

        "history.empty.text":
            "Recorded purchase prices will appear here.",

        "history.delete.notFound":
            "Purchase history to delete was not found.",

        "history.delete.confirm":
            "Delete this purchase history?",

        "history.delete.failed":
            "Could not delete the purchase history.",

        "history.edit.notFound":
            "Purchase history to edit was not found.",

        "history.product.notFound":
            "Product information was not found.",

        "history.editing":
            "Editing Purchase History",

        "history.deleted.back":
            "← Back to History",

        "history.deleted.empty":
            "No deleted purchase history.",

        "history.deleted.restore":
            "↩ Restore",

        "history.deleted.permanentDelete":
            "🗑 Delete Permanently",

        "history.deleted.restoreFailed":
            "Could not restore the purchase history.",

        "history.deleted.confirmPermanent":
            "Permanently delete this purchase history?\n\nThis action cannot be undone.",

        "history.deleted.permanentDeleteFailed":
            "Could not permanently delete the purchase history.",

        /*
         Product Categories
        */

        "category.title":
            "Product Categories",

        "category.name":
            "Category Name",

        "category.namePlaceholder":
            "e.g. Food, Drinks, Household",

        "category.save":
            "+ Save",

        "category.backSettings":
            "← ⚙️ Settings",

        "category.backProduct":
            "← Add Product",

        "category.list.default":
            "App Defaults",

        "category.list.user":
            "Your Categories",

        "category.list.protected":
            "Cannot Edit",

        "category.list.edit":
            "✏ Edit",

        "category.list.delete":
            "🗑 Delete",

        "category.validation.nameRequired":
            "Please enter a category name.",

        "category.validation.duplicate":
            "This category is already registered.",

        "category.message.editNotFound":
            "The category to edit was not found.",

        "category.default.editBlocked":
            "Default categories cannot be changed.",

        "category.default.deleteBlocked":
            "Default categories cannot be deleted.",

        "category.confirm.deleteUsed":
            "This category is used by registered products.\n\nRemove it from the available choices?\nThe registered product data will remain.",

        "category.confirm.delete":
            "Delete this category?",

        /*
         Store Management
        */

        "store.title":
            "🏬 Manage Stores",

        "store.country":
            "Country / Region",

        "store.type":
            "Store Type",

        "store.select":
            "Please select",

        "store.type.supermarket":
            "Supermarket",

        "store.type.convenience":
            "Convenience Store",

        "store.type.drugstore":
            "Drugstore",

        "store.type.discount":
            "Discount Store",

        "store.type.warehouse-club":
            "Warehouse Club",

        "store.type.fixed-price":
            "Fixed-Price Store",

        "store.type.home-center":
            "Home Improvement Store",

        "store.type.department-mall":
            "Department Store / Mall",

        "store.type.clothing":
            "Clothing Store",

        "store.type.electronics":
            "Electronics Store",

        "store.type.gas-station":
            "Gas Station",

        "store.type.specialty":
            "Specialty Store",

        "store.type.online":
            "Online Store",

        "store.type.subscription":
            "Subscription",

        "store.type.vending":
            "Vending Machine",

        "store.type.other":
            "Other",

        "store.region":
            "State / Province / Region",

        "store.city":
            "City",

        "store.name":
            "Store Name",

        "store.save":
            "+ Save",

        "store.registered":
            "Registered Stores",

        "store.placeholder.JP.store":
            "e.g. AEON ○○",

        "store.placeholder.JP.region":
            "e.g. Tokyo",

        "store.placeholder.JP.city":
            "e.g. Minato",

        "store.placeholder.US.store":
            "e.g. Costco Los Angeles",

        "store.placeholder.US.region":
            "e.g. California",

        "store.placeholder.US.city":
            "e.g. Los Angeles",

        "store.placeholder.CA.store":
            "e.g. Costco Toronto",

        "store.placeholder.CA.region":
            "e.g. Ontario",

        "store.placeholder.CA.city":
            "e.g. Toronto",

        "store.placeholder.AU.store":
            "e.g. Woolworths Sydney",

        "store.placeholder.AU.region":
            "e.g. New South Wales",

        "store.placeholder.AU.city":
            "e.g. Sydney",

        "store.placeholder.KR.store":
            "e.g. 이마트 서울점",

        "store.placeholder.KR.region":
            "e.g. 서울특별시",

        "store.placeholder.KR.city":
            "e.g. 강남구",

        "store.placeholder.CN.store":
            "e.g. 沃尔玛上海店",

        "store.placeholder.CN.region":
            "e.g. 上海市",

        "store.placeholder.CN.city":
            "e.g. 浦东新区",

        "store.placeholder.TW.store":
            "e.g. 家樂福台北店",

        "store.placeholder.TW.region":
            "e.g. 臺北市",

        "store.placeholder.TW.city":
            "e.g. 中正區",

        "store.placeholder.OTHER.store":
            "e.g. Store Name",

        "store.placeholder.OTHER.region":
            "e.g. State / Province",

        "store.placeholder.OTHER.city":
            "e.g. City",

        "store.default.jp.aeon.name":
            "AEON STYLE Shinagawa Seaside",
        "store.default.jp.aeon.region":
            "Tokyo",
        "store.default.jp.aeon.city":
            "Shinagawa",

        "store.default.jp.life.name":
            "Life Central Square Ebisu Garden Place",
        "store.default.jp.life.region":
            "Tokyo",
        "store.default.jp.life.city":
            "Shibuya",

        "store.default.jp.mandai.name":
            "Mandai Shibukawa",
        "store.default.jp.mandai.region":
            "Osaka",
        "store.default.jp.mandai.city":
            "Higashiosaka",

        "store.default.jp.gyomu.name":
            "Gyomu Super Shinjuku Okubo",
        "store.default.jp.gyomu.region":
            "Tokyo",
        "store.default.jp.gyomu.city":
            "Shinjuku",

        "store.default.jp.coop.name":
            "Co-op Mirai Toyama",
        "store.default.jp.coop.region":
            "Tokyo",
        "store.default.jp.coop.city":
            "Shinjuku",

        "store.default.jp.lopia.name":
            "Lopia Hirai Shimachu Homes",
        "store.default.jp.lopia.region":
            "Tokyo",
        "store.default.jp.lopia.city":
            "Edogawa",

        "store.default.jp.donki.name":
            "MEGA Don Quijote Shibuya",
        "store.default.jp.donki.region":
            "Tokyo",
        "store.default.jp.donki.city":
            "Shibuya",

        "store.default.jp.costco.name":
            "Costco Kawasaki Warehouse",
        "store.default.jp.costco.region":
            "Kanagawa",
        "store.default.jp.costco.city":
            "Kawasaki",

        "store.backSettings":
            "← ⚙️ Settings",

        "store.backProduct":
            "← 📦 Add Product",

        "store.validation.typeRequired":
            "Please select a store type.",

        "store.validation.nameRequired":
            "Please enter a store name.",

        "store.validation.duplicate":
            "This store is already registered.",

        "store.message.saved":
            "Store saved.",

        "store.message.editNotFound":
            "The store to edit was not found.",

        "store.message.updated":
            "Store updated.",

        "store.message.editMode":
            "Editing mode. Saving will update the store.",

        "store.default.editBlocked":
            "This is a default Cocartly store and cannot be changed.",

        "store.default.deleteBlocked":
            "This is a default Cocartly store and cannot be deleted.",

        "store.confirm.delete":
            "Delete this store?",

        "store.list.protected":
            "🔒 Cannot Edit",

        "store.list.default":
            "🔒 Default Stores",

        "store.list.added":
            "🏬 Your Stores",

        "store.list.empty":
            "No stores added yet.",

        /*
         Quick Add
        */

        "product.quick.makerRequired":
            "Please enter a manufacturer.",

        "product.quick.makerExisting":
            "Existing manufacturer selected.",

        "product.quick.makerAdded":
            "Manufacturer added and selected.",

        "product.quick.categoryRequired":
            "Please enter a product category.",

        "product.quick.categoryExisting":
            "Existing category selected.",

        "product.quick.categoryAdded":
            "Category added.",

        "product.quick.storeTypeRequired":
            "Please select a store type.",

        "product.quick.storeNameRequired":
            "Please enter a store name.",

        "product.quick.storeExisting":
            "Existing store selected.",

        "product.quick.storeAdded":
            "Store added and selected.",

        /*
         Backup / Restore
        */

        "backup.message.created":
            "Cocartly backup created.\n\nKeep this file in a safe place in case you change devices or need to restore your data.",

        "backup.message.failed":
            "Could not create the backup.",

        "restore.message.invalidFile":
            "This is not a valid Cocartly backup file.",

        "restore.confirm":
            "Restore from this backup?\n\nYour current Cocartly data will be replaced with the data saved in the backup.\n\nContinue?",

        "restore.message.completed":
            "Cocartly data restored.\n\nThe page will reload.",

        "restore.message.readFailed":
            "Could not read the backup file.\n\nThe file may be damaged or may not be a Cocartly backup.",

        /*
         About Cocartly
        */

        "about.back":
            "← ⚙️ Settings",

        "about.title":
            "ℹ️ About Cocartly",

        "about.appName":
            "🛒 Cocartly",

        "about.catch":
            "Make shopping and packing easier.",

        "about.description":
            "Cocartly is a shopping support app that helps you manage registered products, shopping lists, purchase history, price comparisons, and packing checklists in one place.",

        "about.features.title":
            "Main Features",

        "about.features.product":
            "Product Registration & Management",

        "about.features.code":
            "Product Code Scanning",

        "about.features.shopping":
            "Shopping List",

        "about.features.history":
            "History & Price",

        "about.features.outing":
            "Outing Checklist",

        "about.features.master":
            "Category & Store Management",

        "about.features.backup":
            "Backup & Restore",

        "about.data.title":
            "About Your Data",

        "about.data.description":
            "Cocartly data is stored in the browser on this device. Back up your data regularly from Settings in case you change devices or lose your data.",

        /*
         Privacy Policy
        */

        "privacy.back":
            "← ⚙️ Settings",

        "privacy.title":
            "🔒 Privacy Policy",

        "privacy.intro":
            "Cocartly is committed to handling user data appropriately. This Privacy Policy explains what information Cocartly handles and how it is used.",

        "privacy.section1.title":
            "1. Information Collected and Stored",

        "privacy.section1.text":
            "Cocartly handles data entered by users, including product information, product codes, product categories, stores, shopping lists, purchase history, price information, and outing checklists.",

        "privacy.section2.title":
            "2. Purpose of Use",

        "privacy.section2.text":
            "This information is used to provide Cocartly features such as product management, shopping-list management, purchase-history and price comparisons, and packing checks before outings.",

        "privacy.section3.title":
            "3. Storage on Your Device",

        "privacy.section3.text1":
            "Data registered in Cocartly is generally stored in the browser on the device you are using.",

        "privacy.section3.text2":
            "Saved data may be lost if browser data is deleted or you change devices.",

        "privacy.section4.title":
            "4. Communication with External Services",

        "privacy.section4.text1":
            "Some features may communicate with external services, such as when searching for product information using a product code.",

        "privacy.section4.text2":
            "In such cases, information required for the search, such as a product code, may be sent to the external service.",

        "privacy.section5.title":
            "5. Backup Data",

        "privacy.section5.text1":
            "Using “Back Up Data” lets you save Cocartly data on your device as a JSON backup file.",

        "privacy.section5.text2":
            "Backup files may contain product information, purchase history, and outing information. Please store and manage them appropriately.",

        "privacy.section6.title":
            "6. Account Information",

        "privacy.section6.text1":
            "Cocartly currently does not have login or user-account features.",

        "privacy.section6.text2":
            "Therefore, Cocartly does not register or store email addresses or passwords for login purposes.",

        "privacy.section7.title":
            "7. Access Information",

        "privacy.section7.text":
            "If Cocartly is provided as a web service, the hosting service may process information such as IP addresses, browser and device information, and access dates and times as part of the communications required to provide the service.",

        "privacy.section8.title":
            "8. Sharing with Third Parties",

        "privacy.section8.text1":
            "Except where required by law, the operator of Cocartly does not sell data registered by users to third parties.",

        "privacy.section8.text2":
            "However, features that use external services may send information required to provide those features to the applicable service.",

        "privacy.section9.title":
            "9. Changes to This Privacy Policy",

        "privacy.section9.text":
            "This Privacy Policy may be updated when Cocartly adds features, changes its services, or changes the external services it uses.",

        "privacy.section10.title":
            "10. Contact",

        "privacy.section10.text":
            "Contact information will be provided when Cocartly is officially released.",

        /*
         Device / Orientation
        */

        "device.desktop.only":
            "Cocartly is for smartphones only.",

        "device.desktop.unavailable":
            "Cocartly is not available on PCs or tablets.",

        "device.orientation.title":
            "Please Hold Your Phone Vertically",

        "device.orientation.guide":
            "This app is optimized for portrait orientation.",

        /*
         Scan Code
        */

        "code.backHome":
            "🏠 Home",

        "code.title":
            "Scan Code",

        "code.guide":
            "Align the barcode inside the frame.",

        "code.success":
            "Scanned",

        "code.waiting":
            "Waiting to scan...",

        "code.flash":
            "🔦 Flash",

        "code.manualInput":
            "⌨ Enter Product Code",

        "code.message.flashComingSoon":
            "Flash support is coming in a future update.",

        "code.message.manualInputComingSoon":
            "Manual product code entry is coming in a future update.",

        "code.title":
            "Scan Code",

        "code.guide":
            "Align the barcode inside the frame.",

        "code.status.align":
            "Center the barcode in the frame.",

        "code.status.checking":
            "Checking code…",

        "code.status.success":
            "Scan successful",

        "code.status.searching":
            "Searching for product information…",

        "code.status.cameraError":
            "Could not start the camera.",

        "code.success":
            "Scanned",

        "code.flash":
            "🔦 Flash",

        "code.flashOff":
            "🔦 Flash Off",

        "code.manualInput":
            "⌨ Enter Product Code",

        "code.backHome":
            "🏠 Home",

        "code.backShopping":
            "🛒 Back to Shopping List",

        "code.manual.prompt":
            "Enter the product barcode.\n\nEnter an 8-, 12-, or 13-digit number.",

        "code.manual.required":
            "Please enter a product code.",

        "code.manual.numberOnly":
            "Please enter numbers only.",

        "code.manual.invalidLength":
            "Please enter an 8-, 12-, or 13-digit product barcode.",

        "code.status.waiting":
            "Waiting to scan...",

        "code.status.openManual":
            "Opening manual product registration...",

        "code.status.openManualError":
            "Could not get product information. Opening manual entry...",

        "code.camera.notStarted":
            "The camera is not running.",

        "code.camera.notFound":
            "Could not access the camera.",

        "code.flash.unsupported":
            "Flash control is not supported on this device or browser.",

        "code.flash.error":
            "Could not change the flash setting.",

        "code.product.notRegistered":
            "This product is not registered yet.\n\nProduct Code: {code}\n\nOpening Product Registration.",

        "code.product.selected":
            "\"{name}\" selected using the product code.",

        "code.product.apiNotFound":
            "The barcode was scanned, but no product information was found.\n\nProduct Code: {code}\n\nEnter the product name and other details to register it.",

        "code.product.autoFetchFailed":
            "Could not get product information automatically.\n\nProduct Code: {code}\n\nEnter the product name and other details to register it.",

        "code.product.manualRegistration":
            "Could not get product information automatically. Enter the product name and other details to register it.",

        "code.product.codeConfirmed":
            "Product code confirmed.\n\nProduct Code: {code}\n\nNo product information was found, so Product Registration will open.",

        "code.product.searchFailed":
            "Could not get product information.\n\nProduct Code: {code}\n\nOpening Product Registration.",

        /*
         Outing Checklist
        */

        "outing.title":
            "🎒 Outing Checklist",

        "outing.backHome":
            "← 🏠 Home",

        "outing.help":
            "How to Use",

        "outing.intro.title":
            "Check What You Need Before You Go",

        "outing.intro.guide":
            "Check what you need to bring and get ready. Items you need to buy can be added to your Shopping List.",

        "outing.help.title":
            "About Outing Checklist",

        "outing.help.whatCanDo":
            "What You Can Do",

        "outing.help.description1":
            "Create checklists for things to bring on trips, events, and everyday outings.",

        "outing.help.description2":
            "Manage items separately as “Have at Home” and “Need to Buy”.",

        "outing.help.description3":
            "Items you need to buy can be added to your Shopping List and managed with your regular shopping.",

        "outing.help.description4":
            "Frequently used packing lists can be reused for future outings.",

        "outing.help.usefulTitle":
            "Useful When You Want To",

        "outing.help.useful1":
            "“Avoid forgetting things on a trip”",

        "outing.help.useful2":
            "“Check what you need before going out”",

        "outing.help.useful3":
            "“Separate things you already have from things you need to buy”",

        "outing.help.useful4":
            "“Avoid entering the same things every time”",

        "outing.help.howTo":
            "How to Use",

        "outing.help.step1":
            "Tap “+ Create Outing” to create a new outing.",

        "outing.help.step2":
            "Add the items you need for the outing.",

        "outing.help.step3":
            "Items you will bring without buying, such as your wallet or a towel, are managed under “Have at Home”.",

        "outing.help.step4":
            "Items you need to buy before the outing are managed under “Need to Buy”. You can select a registered product or find one by product code.",

        "outing.help.step5":
            "Items you need to buy can be added to your Shopping List. When the purchase is completed, the item is also marked as “Ready” in the Outing Checklist.",

        "outing.help.step6":
            "Switch items between “Not Ready”, “Ready”, and “On Hold” as needed.",

        "outing.help.step7":
            "If you need to add another item later, use “+ Add”.",

        "outing.help.management":
            "Manage Outings",

        "outing.help.managementUpcoming":
            "“Upcoming” shows your upcoming outings.",

        "outing.help.managementRoutine":
            "“Routine” shows outings and items you use regularly.",

        "outing.help.managementPast":
            "“Past” shows completed outings.",

        "outing.create":
            "+ Create Outing",

        "outing.tab.upcoming":
            "Upcoming",

        "outing.tab.routine":
            "Routine",

        "outing.tab.past":
            "Past",

        "outing.empty.upcoming":
            "No upcoming outings yet.",

        "outing.empty.routine":
            "No routine outings yet.",

        "outing.empty.past":
            "No past outings yet.",

        "outing.empty.default":
            "Nothing here yet.",

        "outing.create.back":
            "← 🎒 Outing Checklist",

        "outing.create.title":
            "+ Create Outing",

        "outing.create.question":
            "Where are you going?",

        "outing.create.guide":
            "Give it a clear name, such as “Trip” or “Baseball Game”.",

        "outing.create.name":
            "Outing Name",

        "outing.create.namePlaceholder":
            "e.g. Baseball Game",

        "outing.create.type":
            "Outing Type",

        "outing.create.scheduled":
            "One-Time",

        "outing.create.routine":
            "Recurring",

        "outing.create.typeGuide":
            "Use One-Time for outings such as trips or baseball games, and Recurring for activities such as work or school.",

        "outing.create.date":
            "Outing Date",

        "outing.create.item":
            "Item to Bring",

        "outing.create.itemPlaceholder":
            "e.g. Ticket",

        "outing.create.addItem":
            "+ Add Item",

        "outing.create.noItems":
            "No items added yet.",

        "outing.create.save":
            "Save",

        "outing.message.itemRequired":
            "Please enter an item to bring.",

        "outing.message.itemDuplicate":
            "This item has already been added.",

        "outing.message.itemAdded":
            "Item added.",

        "outing.message.nameRequired":
            "Please enter an outing name.",

        "outing.message.dateRequired":
            "Please select an outing date.",

        "outing.message.itemsRequired":
            "Please add at least one item.",

        "outing.message.nameDuplicate":
            "An outing with this name is already registered.",

        "outing.message.purchaseAdded":
            "Added to Need to Buy.",

        "outing.message.itemRegisteredDuplicate":
            "This item is already registered.",

        "outing.message.purchaseRequired":
            "Please enter an item to buy.",

        "outing.message.productRequired":
            "Please select a product.",

        "outing.message.quantityInvalid":
            "Enter a quantity of 1 or more.",

        "outing.message.productNotFound":
            "Product not found.",

        "outing.message.productLinkedDuplicate":
            "This product is already linked to another item.",

        "outing.message.productDuplicate":
            "This product has already been added as an item.",

        "outing.message.registeredProductSelected":
            "Selected registered product “{name}”.",

        "outing.create.deleteItem":
            "🗑 Delete",

        "outing.check.back":
            "← 🎒 Outing Checklist",

        "outing.check.title":
            "Outing Checklist",

        "outing.check.pending":
            "Not Ready",

        "outing.check.ready":
            "Ready",

        "outing.check.hold":
            "On Hold",

        "outing.check.add":
            "+ Add",

        "outing.check.complete":
            "✓ Finish Outing",

        "outing.check.completeGuide":
            "When finished, this outing moves to Past.",

        "outing.items.emptyStatus":
            "No items with this status.",

        "outing.items.home":
            "🏠 Have at Home",

        "outing.items.purchase":
            "🛒 Need to Buy",

        "outing.items.purchased":
            "🛒 Purchased",

        "outing.items.emptyGroup":
            "No items in this group.",

        "outing.items.quantity":
            "Quantity {quantity}",

        "outing.items.readyFromShopping":
            "Purchased & Ready",

        "outing.items.chooseProduct":
            "🔗 Select Product",

        "outing.items.addToShopping":
            "🛒 Add to Shopping List",

        "outing.items.selectProductGuide":
            "Select a product to add it to your Shopping List.",

        "outing.items.ready":
            "✓ Mark Ready",

        "outing.items.hold":
            "Put on Hold",

        "outing.items.backPending":
            "Mark as Not Ready",

        "outing.items.delete":
            "🗑 Delete This Item",

        "outing.message.alreadyAddedToShopping":
            "This item is already on your Shopping List.",

        "outing.confirm.deleteItem":
            "Remove “{name}” from this outing?",

        "outing.confirm.deleteLinkedItem":
            "\n\nThis item is also on your Shopping List.\nOnly the link to this outing will be removed.\nThe product will remain on your Shopping List.",

        "outing.add.homeTitle":
            "🏠 Have at Home / Custom Item",

        "outing.add.item":
            "Item to Bring",

        "outing.add.itemPlaceholder":
            "e.g. Wallet, Towel, Drink",

        "outing.add.itemButton":
            "+ Add Item",

        "outing.add.purchaseTitle":
            "🛒 Need to Buy",

        "outing.add.purchaseGuide":
            "You can add a general item such as “Drink” or “Charger” even if you do not know the exact product yet.",

        "outing.add.purchase":
            "Item to Buy",

        "outing.add.purchasePlaceholder":
            "e.g. Drink, Charger, Batteries",

        "outing.add.purchaseButton":
            "+ Add Item to Buy",

        "outing.add.selectMethod":
            "Choose a Product",

        "outing.add.registered":
            "① Select Registered Product",

        "outing.add.category":
            "Category",

        "outing.add.allCategories":
            "All Categories",

        "outing.add.product":
            "Product",

        "outing.add.selectProduct":
            "Select a product",

        "outing.add.code":
            "② Find by Product Code",

        "outing.add.codeGuide":
            "If you know the product code, you can use the camera to find the product.",

        "outing.add.scan":
            "📷 Scan Product Code",

        "outing.add.quantity":
            "Quantity",

        "outing.add.productButton":
            "+ Add Product to Items",

        "outing.productSelect.back":
            "← Back to Not Ready",

        "outing.productSelect.title":
            "🔗 Select Product",

        "outing.productSelect.guide":
            "Select the product you will buy for “{name}”.",

        "outing.productSelect.selectButton":
            "Select This Product",

        "outing.scan.back":
            "← Outing Checklist",

        "outing.past.back":
            "← 🎒 Past Outings",

        "outing.past.title":
            "Past Outings",

        "outing.past.items":
            "Items Brought",

        "outing.past.yearMonth":
            "{month}/{year}",

        "outing.past.count":
            "{count} outings",

        "outing.past.countOne":
            "{count} outing",

        "outing.past.itemCount":
            "{count} items",

        "outing.past.itemCountOne":
            "{count} item",

        "outing.past.noDate":
            "No Date Recorded",

        "outing.past.noItems":
            "No items recorded.",

        "outing.past.reuse":
            "🔁 Use This Outing Again",

        "outing.past.delete":
            "🗑 Delete This Past Outing",

        "outing.past.reuseSuffix":
            " (Reused)",

        "outing.confirm.complete":
            "Finish this outing?\n\n“{name}”\n\nWhen finished, it will move to Past.",

        "outing.message.copied":
            "Past outing copied. Select a date and save it.",

        "outing.confirm.deletePast":
            "Delete “{name}” from Past Outings?\n\nThis action cannot be undone.\n\nRegistered products and purchase history will not be deleted.",

        "outing.message.addedToShopping":
            "Added “{name}” to the Shopping List."
    },


    ko: {
        "common.start": "시작하기",
        "common.cancel": "취소",
        "common.save": "저장",
        "common.close": "닫기",

        "home.catch": "더 스마트하게 장보세요.",
        "home.code": "코드 스캔",
        "home.product": "상품 등록",
        "home.shopping": "장보기 목록",
        "home.history": "구매 기록 · 가격",
        "home.outing": "외출 체크리스트",
        "home.notice": "공지사항",
        "home.settings": "설정",

        "notice.backHome": "← 🏠 홈",
        "notice.title": "✉️ 공지사항",
        "notice.development.title":
            "Cocartly를 개발하고 있습니다",
        "notice.development.text":
            "Cocartly를 더 쉽고 편리하게 이용하실 수 있도록 홈 화면과 기능을 개선하고 있습니다.",

        "product.title": "상품 등록",
        "product.backHome": "← 🏠 홈",
        "product.help": "사용 방법",

        "product.name": "상품명",
        "product.namePlaceholder": "예: 샴푸",

        "product.code": "상품 코드",
        "product.codePlaceholder":
            "바코드를 스캔하면 자동으로 입력됩니다",
        "product.codeGuide":
            "※ 바코드가 있는 상품은 코드 스캔에서 등록해 주세요.",

        "product.category": "상품 카테고리",
        "product.categoryManage": "⚙ 카테고리 관리",

        "category.default.food": "식품",
        "category.default.drink": "음료",
        "category.default.snack": "과자",
        "category.default.alcohol": "주류",
        "category.default.daily": "생활용품",
        "category.default.hygiene": "청소 · 위생용품",
        "category.default.medicine": "의약품",
        "category.default.beauty": "미용 · 화장품",
        "category.default.clothing": "의류",
        "category.default.baby": "유아용품",
        "category.default.pet": "반려동물용품",
        "category.default.stationery": "문구 · 잡화",
        "category.default.electronics": "전자제품 · 건전지",
        "category.default.other": "기타",

        "product.country": "국가 / 지역",

        "product.store": "구매처",
        "product.storeManage": "🏬 구매처 관리",

        "product.volume": "수량 / 용량",
        "product.volumeExample": "입력 예",
        "product.volumePlaceholder": "예: 400",

        "product.volumeExampleTitle":
            "수량 / 용량 및 단위 입력 예",
        "product.volumeExampleEgg":
            "🥚 대란 10개",
        "product.volumeExampleEggDetail":
            "수량 / 용량: 10 / 단위: 개",
        "product.volumeExampleMilk":
            "🥛 우유 1000mL",
        "product.volumeExampleMilkDetail":
            "수량 / 용량: 1000 / 단위: mL",
        "product.volumeExampleRice":
            "🍚 쌀 5kg",
        "product.volumeExampleRiceDetail":
            "수량 / 용량: 5 / 단위: kg",
        "product.volumeExampleBread":
            "🍞 식빵 6장",
        "product.volumeExampleBreadDetail":
            "수량 / 용량: 6 / 단위: 장",

        "product.unit": "단위",
        "product.select": "선택해 주세요",

        "product.unit.each": "개",
        "product.unit.sheet": "장",
        "product.unit.bottle": "병",
        "product.unit.bag": "봉지",
        "product.unit.box": "상자",
        "product.unit.pack": "팩",
        "product.unit.roll": "롤",

        "product.price": "가격(세금 포함)",
        "product.priceCalc": "가격 계산기",
        "product.pricePlaceholder": "예: 298",

        "product.shareTitle":
            "Cocartly 상품 데이터베이스에 공유",
        "product.shareDescription":
            "상품명, 상품 코드, 카테고리 등의 정보를 공유합니다. 가격과 구매처 정보는 공유되지 않습니다.",
        "product.shareThanks":
            "Cocartly의 상품 정보 개선에 도움을 주셔서 감사합니다.",

        "product.save": "저장",
        "product.cancelEdit": "✕ 편집 취소",
        "product.deletedItems": "🗑 삭제된 항목",
        "product.registered": "등록된 상품",
        "product.allCategories": "카테고리: 전체",

        "product.validation.volumeNeedsUnit":
            "수량이나 용량을 입력한 경우 단위도 선택해 주세요.",
        "product.validation.unitNeedsVolume":
            "단위를 선택한 경우 수량이나 용량도 입력해 주세요.",
        "product.validation.nameRequired":
            "상품명을 입력해 주세요.",
        "product.validation.categoryRequired":
            "상품 카테고리를 선택해 주세요.",
        "product.validation.storeRequired":
            "구매처를 선택해 주세요.",
        "product.validation.priceInvalid":
            "가격은 0 이상으로 입력해 주세요.",

        "product.message.saved":
            "✓ 저장되었습니다",
        "product.message.savedOffline":
            "✓ 이 기기에 저장되었습니다. 온라인 상태가 되면 동기화할 수 있습니다.",
        "product.message.editCancelled":
            "상품 편집을 취소했습니다.",

        "settings.title": "설정",
        "settings.backHome": "← 🏠 홈",

        "settings.basic": "기본 설정",
        "settings.language": "🌐 표시 언어",
        "settings.baseCountry": "🌍 주로 쇼핑하는 국가 / 지역",

        "settings.management": "관리",

        "settings.category.title": "상품 카테고리",
        "settings.category.guide":
            "상품 등록에 사용하는 카테고리를 추가하거나 수정할 수 있습니다.",

        "settings.store.title": "구매처",
        "settings.store.guide":
            "슈퍼마켓이나 드럭스토어 등의 구매처를 추가하거나 수정할 수 있습니다.",

        "settings.data": "데이터",

        "settings.backup.title": "데이터 백업",
        "settings.backup.guide":
            "기기 변경이나 예상치 못한 상황에 대비해 Cocartly 데이터를 저장합니다.",

        "settings.restore.title": "백업에서 복원",
        "settings.restore.guide":
            "저장해 둔 Cocartly 데이터를 이 기기에 복원합니다.",

        "settings.app": "앱",

        "settings.about.title": "Cocartly 정보",
        "settings.about.guide":
            "Cocartly의 개요와 주요 기능을 확인할 수 있습니다.",

        "settings.version": "🔖 버전",

        "settings.privacy.title": "개인정보 처리방침",
        "settings.privacy.guide":
            "Cocartly가 데이터를 처리하는 방법을 확인할 수 있습니다.",

        "setup.welcome": "Cocartly에 오신 것을 환영합니다",
        "setup.countryGuide":
            "평소 쇼핑하는 국가 또는 지역을 선택해 주세요.",

        "setup.languageLabel": "표시 언어",
        "setup.countryLabel":
            "주로 쇼핑하는 국가 또는 지역",

        "language.ja": "일본어",
        "language.en": "영어",
        "language.ko": "한국어",
        "language.zh-CN": "중국어(간체)",
        "language.zh-TW": "중국어(번체)",
        "language.fr": "프랑스어",

        "country.JP": "일본",
        "country.US": "미국",
        "country.CA": "캐나다",
        "country.AU": "호주",
        "country.KR": "대한민국",
        "country.CN": "중국",
        "country.TW": "대만",
        "country.OTHER": "기타",

        /*
         상품 등록
         사용 방법
        */

        "product.help.title":
            "상품 등록 안내",

        "product.help.featureTitle":
            "주요 기능",

        "product.help.feature1":
            "상품명, 상품 코드, 카테고리, 구매처, 수량이나 용량 등의 상품 정보를 등록할 수 있습니다.",

        "product.help.feature2":
            "바코드가 있는 상품은 코드 스캔에서 등록할 수 있습니다. 다음에 같은 바코드를 스캔하면 Cocartly가 등록된 상품을 자동으로 인식합니다.",

        "product.help.feature3":
            "구매처와 가격을 기록하면 구매 기록 · 가격에서 지난번 가격을 확인할 수 있습니다.",

        "product.help.feature4":
            "등록된 상품은 구매하기 전에 지난번 가격, 최저 가격, 평균 가격과 지난번 구매처를 확인할 수 있습니다.",

        "product.help.usefulTitle":
            "이럴 때 유용해요",

        "product.help.useful1":
            "“자주 구매하는 상품을 저장하고 싶을 때”",

        "product.help.useful2":
            "“지난번에 이 상품을 얼마에 샀는지 확인하고 싶을 때”",

        "product.help.useful3":
            "“어느 구매처에서 가장 저렴했는지 확인하고 싶을 때”",

        "product.help.useful4":
            "“구매 전에 지난번 가격과 비교해 보고 싶을 때”",

        "product.help.howToTitle":
            "사용 방법",

        "product.help.step1":
            "바코드가 있는 상품은 홈 화면의 “코드 스캔”에서 스캔해 주세요.",

        "product.help.step2":
            "새 상품은 상품명, 카테고리, 구매처, 수량이나 용량 등의 정보를 확인한 후 저장해 주세요.",

        "product.help.step3":
            "채소, 조리 식품, 무게로 판매하는 상품처럼 바코드가 없는 상품은 홈 화면의 “+ 상품 등록”에서 등록할 수 있습니다.",

        "product.help.step4":
            "등록된 상품을 다시 구매할 때는 바코드를 스캔하거나 등록된 상품에서 “가격 확인 · 구매”를 선택해 주세요.",

        "product.help.step5":
            "지난번 가격, 최저 가격, 평균 가격과 지난번 구매처의 가격을 확인할 수 있습니다.",

        "product.help.step6":
            "상품을 구매하려면 “구매 및 가격 기록”을 선택한 후 구매처, 이번 가격, 수량을 입력해 주세요.",

        "product.help.step7":
            "이번에는 구매하지 않는 경우 “이번에는 건너뛰기”를 선택할 수 있습니다.",

        "product.help.step8":
            "기록한 구매 정보는 구매 기록 · 가격에 자동으로 추가됩니다.",

        "product.help.close":
            "닫기",

        /*
         상품 등록
         가격 계산기
        */

        "product.tax.displayPrice":
            "표시 가격",

        "product.tax.priceType":
            "가격 유형",

        "product.tax.taxIncluded":
            "세금 포함",

        "product.tax.taxExcluded":
            "세전",

        "product.tax.taxRate":
            "세율",

        "product.tax.customTaxRate":
            "세율 (%)",

        "product.tax.jpGuide":
            "일본에서 적용되는 세율을 선택해 주세요.",

        "product.tax.overseasGuide":
            "지역과 상품 종류에 맞는 세율을 입력해 주세요.",

        "product.tax.rounding":
            "끝자리 처리",

        "product.tax.round":
            "반올림",

        "product.tax.floor":
            "버림",

        "product.tax.ceil":
            "올림",

        "product.tax.discount":
            "할인",

        "product.tax.discountNone":
            "할인 없음",

        "product.tax.discountPercent":
            "% 할인",

        "product.tax.discountAmountLabel":
            "{currency} 할인",

        "product.tax.discountAmount":
            "할인 금액",

        "product.tax.discountValue":
            "할인",

        "product.tax.finalPrice":
            "최종 가격: {price}",

        "product.tax.usePrice":
            "이 가격 사용",

        "product.tax.close":
            "닫기",

        "product.tax.examplePrefix":
            "예: ",

        "product.tax.discountValuePlaceholder":
            "예: 20",

        "product.tax.inputError":
            "입력한 내용을 확인해 주세요.",

        /*
         등록된 상품
        */

        "product.list.title":
            "등록된 상품",

        "product.list.allCategories":
            "카테고리: 전체",

        "product.list.categoryPrefix":
            "카테고리: ",

        "product.list.count":
            "상품 {count}개",

        "product.list.countOne":
            "상품 {count}개",

        "product.list.empty":
            "아직 등록된 상품이 없습니다.",

        "product.list.month":
            "{year}년 {month}월",

        "product.list.code":
            "상품 코드",

        "product.list.category":
            "카테고리",

        "product.list.store":
            "구매처",

        "product.list.volume":
            "수량 / 용량",

        "product.list.price":
            "가격",

        "product.list.registeredDate":
            "등록일",

        "product.list.favorite":
            "즐겨찾기",

        "product.list.checkPrice":
            "가격 확인 · 구매",

        "product.list.edit":
            "✏ 수정",

        "product.list.delete":
            "🗑 삭제",

        /*
         삭제된 상품
        */

        "product.deleted.title":
            "삭제된 항목",

        "product.deleted.button":
            "🗑 삭제된 항목 ({count})",

        "product.deleted.back":
            "← 📦 상품 등록",

        "product.deleted.restore":
            "♻ 복원",

        "product.deleted.permanentDelete":
            "🗑 완전히 삭제",

        "product.message.editMode":
            "상품을 수정하고 있습니다. 저장하면 상품 정보가 업데이트됩니다.",

        "product.message.registrationCancelled":
            "상품 등록을 취소했습니다.",

        "product.message.alreadyRegistered":
            "이미 등록된 상품입니다. 다시 등록하지 않아도 됩니다.",

        "product.confirm.alreadyRegistered":
            "이미 등록된 상품입니다.\n\n상품: {name}\n\n같은 상품은 다시 등록할 수 없습니다.",

        "product.confirm.delete":
            "이 상품을 삭제할까요?",

        "product.confirm.deletedFound":
            "이 상품은 삭제된 항목에 있습니다.\n\n상품: {name}\n\n다시 등록하지 않고 복원할까요?",

        "product.confirm.permanentDelete":
            "이 상품을 완전히 삭제할까요?\n\n상품: “{name}”\n\n삭제한 후에는 되돌릴 수 없습니다.",

        "product.registered.backHistory":
            "← 📊 구매 기록 · 가격",

        "product.registered.backProduct":
            "← 📦 상품 등록",

        "product.registered.notFound":
            "등록된 상품 정보를 찾을 수 없습니다.",

        "product.registered.code":
            "상품 코드: {code}",

        "product.registered.noCode":
            "상품 코드 없음",

        "product.registered.noRecord":
            "기록되지 않음",

        "product.registered.noHistory":
            "아직 가격 기록이 없습니다.",

        "product.registered.title":
            "등록된 상품",

        "product.registered.latest":
            "지난번",

        "product.registered.lowest":
            "최저",

        "product.registered.average":
            "평균",

        "product.registered.historyTitle":
            "🏬 지난 구매처 · 가격",

        "product.registered.buy":
            "🛒 구매 및 가격 기록",

        "product.registered.skip":
            "이번에는 건너뛰기",

        /*
         장보기 목록
        */

        "shopping.title":
            "🛒 장보기 목록",

        "shopping.backHome":
            "← 🏠 홈",

        "shopping.help":
            "사용 방법",

        "shopping.help.title":
            "장보기 목록 안내",

        "shopping.help.featureTitle":
            "주요 기능",

        "shopping.help.feature1":
            "구매할 상품을 장보기 목록에 추가하고 관리할 수 있습니다.",

        "shopping.help.feature2":
            "상품을 구매 예정, 구매 완료, 보류 상태로 나누어 관리할 수 있습니다.",

        "shopping.help.feature3":
            "등록된 상품뿐만 아니라 아직 등록하지 않은 상품도 장보기 목록에 추가할 수 있습니다.",

        "shopping.help.feature4":
            "상품 상세에서 지난번 가격, 최저 가격, 평균 가격을 확인하면서 오늘 매장의 판매 상태와 가격도 기록할 수 있습니다.",

        "shopping.help.usefulTitle":
            "이럴 때 유용해요",

        "shopping.help.useful1":
            "“구매할 상품을 미리 정리하고 싶을 때”",

        "shopping.help.useful2":
            "“매장에서 구매한 상품과 아직 구매하지 않은 상품을 확인하고 싶을 때”",

        "shopping.help.useful3":
            "“지난번보다 저렴한지 확인한 후 구매하고 싶을 때”",

        "shopping.help.useful4":
            "“품절된 상품을 잠시 보류하고 싶을 때”",

        "shopping.help.howToTitle":
            "사용 방법",

        "shopping.help.step1":
            "“+ 장보기 목록에 추가”에서 구매할 상품을 추가할 수 있습니다.",

        "shopping.help.step2":
            "등록된 상품을 선택하거나 상품명을 직접 입력해 추가할 수 있습니다.",

        "shopping.help.step3":
            "상품을 선택하면 상품 상세에서 지난번 가격과 지난번 구매처를 확인할 수 있습니다.",

        "shopping.help.step4":
            "매장에서 상품의 판매 상태와 현재 가격을 확인한 후 오늘의 매장 정보에 기록할 수 있습니다.",

        "shopping.help.step5":
            "구매한 상품은 “구매 완료”로 변경해 주세요.",

        "shopping.help.step6":
            "장보기가 끝나면 “장보기 완료”를 선택해 주세요. 구매한 상품의 가격이 구매 기록 · 가격에 저장됩니다.",

        "shopping.help.step7":
            "이번에 구매하지 않는 상품은 “보류”로 둘 수 있습니다. 보류한 상품은 다시 “구매 예정”으로 변경할 수도 있습니다.",

        "shopping.help.step8":
            "더 이상 필요하지 않은 상품은 장보기 목록에서만 삭제할 수 있습니다. 등록된 상품과 이전 구매 기록은 삭제되지 않습니다.",

        "shopping.help.step9":
            "장보기가 끝나면 “장보기 완료”를 선택해 주세요.",

        "shopping.help.close":
            "닫기",

        "shopping.pending":
            "구매 예정",

        "shopping.purchased":
            "구매 완료",

        "shopping.hold":
            "보류",

        "shopping.addTab":
            "＋ 추가",

        "shopping.remaining":
            "남음",

        "shopping.itemUnit":
            "개",

        "shopping.remainingSummary":
            "남음 {count}개",

        "shopping.remainingSummaryOne":
            "남음 {count}개",

        "shopping.add.title":
            "장보기 목록에 추가",

        "shopping.favorite":
            "⭐ 즐겨찾기",

        "shopping.all":
            "전체",

        "shopping.registeredProduct":
            "등록된 상품",

        "shopping.selectProduct":
            "상품을 선택해 주세요",

        "shopping.or":
            "또는",

        "shopping.productName":
            "상품명",

        "shopping.productNamePlaceholder":
            "예: 양배추",

        "shopping.code":
            "상품 코드(알고 있는 경우)",

        "shopping.codePlaceholder":
            "모르는 경우 비워 두세요",

        "shopping.scanCode":
            "📷 상품 코드 스캔",

        "shopping.codeGuide":
            "직접 입력하거나 카메라로 스캔할 수 있습니다.",

        "shopping.quantity":
            "구매 예정 수량",

        "shopping.add":
            "+ 장보기 목록에 추가",

        "shopping.finish":
            "장보기 완료",

        "shopping.empty.pending":
            "구매 예정인 상품이 없습니다.",

        "shopping.empty.purchased":
            "구매 완료된 상품이 없습니다.",

        "shopping.empty.hold":
            "보류 중인 상품이 없습니다.",

        "shopping.empty.favorite":
            "아직 즐겨찾기한 상품이 없습니다.",

        "shopping.empty.category":
            "이 카테고리에 상품이 없습니다.",

        "shopping.validation.selectOrName":
            "등록된 상품을 선택하거나 상품명을 입력해 주세요.",

        "shopping.validation.quantity":
            "수량은 1 이상으로 입력해 주세요.",

        "shopping.validation.duplicateCode":
            "이 상품 코드로 등록된 상품이 이미 있습니다.",

        "shopping.validation.duplicateCodeDetail":
            "이 상품 코드로 등록된 상품이 이미 있습니다.\n\n상품: {name}\n\n등록된 상품에서 추가해 주세요.",

        "shopping.message.added":
            "장보기 목록에 추가되었습니다.",

        "shopping.message.unregisteredAdded":
            "미등록 상품이 장보기 목록에 추가되었습니다.",

        "shopping.productNameUnset":
            "상품명 없음",

        "shopping.previousPurchaseNone":
            "이전 구매 기록 없음",

        "shopping.previousPurchase":
            "지난번 구매처: {store}",

        "shopping.quantityDisplay":
            "수량 {quantity}",

        "shopping.finish.noPurchased":
            "구매 완료된 상품이 없습니다.",

        "shopping.finish.pendingWarning":
            "아직 구매 예정인 상품이 {count}개 있습니다.\n\n빠뜨린 상품은 없나요?\n\n그래도 장보기를 마칠까요?",

        "shopping.finish.pendingWarningOne":
            "아직 구매 예정인 상품이 {count}개 있습니다.\n\n빠뜨린 상품은 없나요?\n\n그래도 장보기를 마칠까요?",

        "shopping.finish.itemCount":
            "{count}개",

        "shopping.finish.itemCountOne":
            "{count}개",

        "shopping.finish.confirm":
            "장보기를 마칠까요?\n\n구매 완료: {purchasedText}\n구매 예정: {pendingText}\n보류: {holdText}\n\n구매한 상품을 확인해 주세요.",

        "shopping.finish.missingInfo":
            "구매 기록을 저장하는 데 필요한 매장 정보가 부족합니다.\n\n다음 상품의 판매 상태를 “판매 중”으로 선택하고 세금 포함 가격을 기록해 주세요.\n\n• {names}",

        "shopping.finish.completed":
            "장보기를 마쳤습니다.\n\n구매 기록에 저장: {historyText}\n새로 등록된 상품: {registeredText}",

        /*
         장보기 목록 - 상품 상세
        */

        "shopping.detail.back":
            "🛒 ← 장보기 목록",

        "shopping.detail.title":
            "상품 상세",

        "shopping.detail.unregistered":
            "미등록 상품",

        "shopping.detail.quantity":
            "구매 예정 수량: ",

        "shopping.detail.code":
            "상품 코드",

        "shopping.detail.codePlaceholder":
            "모르는 경우 비워 두세요",

        "shopping.detail.saveCode":
            "상품 코드 저장",

        "shopping.detail.codeSaved":
            "상품 코드가 저장되었습니다.",

        "shopping.detail.codeSavedEmpty":
            "상품 코드가 삭제되었습니다.",

        "shopping.detail.latest":
            "지난번",

        "shopping.detail.lowest":
            "최저",

        "shopping.detail.average":
            "평균",

        "shopping.detail.taxIncludedShort":
            "세금 포함",

        "shopping.detail.noHistory":
            "아직 구매 기록이 없습니다.",

        "shopping.detail.previousStoreNone":
            "이전 구매 기록 없음",

        "shopping.detail.previousStore":
            "지난번 구매처: {store}",

        /*
         오늘의 매장 정보
        */

        "shopping.store.title":
            "오늘의 매장 정보",

        "shopping.store.store":
            "구매처",

        "shopping.store.previous":
            "지난 구매처",

        "shopping.store.recent":
            "최근 구매처",

        "shopping.store.search":
            "🔍 다른 구매처 찾기",

        "shopping.store.country":
            "국가 / 지역",

        "shopping.store.allCountries":
            "모든 국가 / 지역",

        "shopping.store.region":
            "주 / 지역",

        "shopping.store.allRegions":
            "모든 지역",

        "shopping.store.name":
            "구매처 이름",

        "shopping.store.searchPlaceholder":
            "예: 서울, 이마트, 롯데마트",

        "shopping.store.allStores":
            "모든 구매처",

        "shopping.store.select":
            "구매처를 선택해 주세요",

        "shopping.store.availability":
            "판매 상태",

        "shopping.store.available":
            "○ 판매 중",

        "shopping.store.soldout":
            "△ 품절",

        "shopping.store.notavailable":
            "× 판매하지 않음",

        "shopping.store.unknown":
            "? 확인하지 않음",

        "shopping.store.taxExcluded":
            "세전 가격",

        "shopping.store.taxExcludedShort":
            "세전",

        "shopping.store.taxIncluded":
            "세금 포함 가격",

        "shopping.store.taxIncludedKnown":
            "알고 있는 경우",

        "shopping.store.examplePrefix":
            "예: ",

        "shopping.store.priceCalc":
            "가격 계산기",

        "shopping.store.priceType":
            "가격 유형",

        "shopping.store.priceTypeExcluded":
            "세전",

        "shopping.store.priceTypeIncluded":
            "세금 포함",

        "shopping.store.taxRate":
            "세율",

        "shopping.store.customTaxRate":
            "세율 (%)",

        "shopping.store.rounding":
            "끝자리 처리",

        "shopping.store.round":
            "반올림",

        "shopping.store.floor":
            "버림",

        "shopping.store.ceil":
            "올림",

        "shopping.store.discount":
            "할인",

        "shopping.store.discountNone":
            "할인 없음",

        "shopping.store.discountPercent":
            "% 할인",

        "shopping.store.discountAmount":
            "{currency} 할인",

        "shopping.store.discountValue":
            "할인",

        "shopping.store.usePrice":
            "이 가격 사용",

        "shopping.store.close":
            "닫기",

        "shopping.store.save":
            "오늘의 매장 정보 기록",

        "shopping.store.saved":
            "매장 정보가 저장되었습니다.",

        "shopping.store.noChecks":
            "아직 기록된 매장 정보가 없습니다.",

        "shopping.store.cheapest":
            "★ 최저",

        "shopping.store.checked":
            "확인일: {date}",

        "shopping.store.noResults":
            "조건에 맞는 구매처가 없습니다.",

        "shopping.store.tooMany":
            "검색 결과가 많아 10개만 표시됩니다. 검색 조건을 조금 더 좁혀 주세요.",

        "shopping.detail.purchased":
            "✓ 구매 완료",

        "shopping.detail.hold":
            "보류하기",

        "shopping.detail.holdMessage":
            "보류로 이동했습니다.\n\n14일이 지나면 자동으로 완전히 삭제되니 필요한 경우 그전에 확인해 주세요.",

        "shopping.detail.returnPending":
            "구매 예정으로 변경",

        "shopping.detail.delete":
            "🗑 장보기 목록에서 삭제",

        "shopping.detail.deleteGuide":
            "등록된 상품과 이전 구매 기록은 삭제되지 않습니다.",

        "shopping.detail.deleteConfirm":
            "이 상품을 장보기 목록에서 삭제할까요?\n\n등록된 상품과 이전 구매 기록은 삭제되지 않습니다.",

        /*
         구매 상세
        */

        "purchase.backProduct":
            "← 상품으로 돌아가기",

        "purchase.backHistory":
            "← 구매 기록 · 가격으로 돌아가기",

        "purchase.backPurchase":
            "← 구매 상세로 돌아가기",

        "purchase.backPurchaseScan":
            "🛒 구매 상세",

        "purchase.title":
            "🛒 구매 상세",

        "purchase.productName":
            "상품명",

        "purchase.previousPrice":
            "지난번 가격",

        "purchase.noRecord":
            "기록되지 않음",

        "purchase.code":
            "상품 코드",

        "purchase.codePlaceholder":
            "모르는 경우 비워 두세요",

        "purchase.scanCode":
            "📷 상품 코드 스캔",

        "purchase.codeGuide":
            "카메라로 스캔하거나 나중에 직접 입력 또는 변경할 수 있습니다.",

        "purchase.store":
            "구매처",

        "purchase.previousStore":
            "지난 구매처",

        "purchase.recentStores":
            "최근 구매처",

        "purchase.searchStore":
            "🔍 다른 구매처 찾기",

        "purchase.country":
            "국가 / 지역",

        "purchase.allCountries":
            "모든 국가 / 지역",

        "purchase.region":
            "주 / 지역",

        "purchase.allRegions":
            "모든 지역",

        "purchase.storeName":
            "구매처 이름",

        "purchase.storeSearchPlaceholder":
            "예: 서울, 이마트, 롯데마트",

        "purchase.allStores":
            "모든 구매처",

        "purchase.selectStore":
            "구매처를 선택해 주세요",

        "purchase.manageStores":
            "🏬 구매처 관리",

        "purchase.currentPrice":
            "이번 가격(세금 포함)",

        "purchase.priceCalc":
            "가격 계산기",

        "purchase.taxExcluded":
            "세전 가격",

        "purchase.taxRate":
            "세율",

        "purchase.customTaxRate":
            "세율 (%)",

        "purchase.rounding":
            "끝자리 처리",

        "purchase.round":
            "반올림",

        "purchase.floor":
            "버림",

        "purchase.ceil":
            "올림",

        "purchase.discount":
            "할인",

        "purchase.discountNone":
            "할인 없음",

        "purchase.discountPercent":
            "% 할인",

        "purchase.discountAmount":
            "{currency} 할인",

        "purchase.discountValue":
            "할인 금액 / 할인율",

        "purchase.taxIncludedResult":
            "세금 포함 가격: -",

        "purchase.usePrice":
            "이 가격 사용",

        "purchase.close":
            "닫기",

        "purchase.quantity":
            "수량",

        "purchase.save":
            "구매 기록",

        "purchase.taxGuide.jp":
            "일본에서 적용되는 세율을 선택해 주세요.",

        "purchase.taxGuide.other":
            "지역과 상품 종류에 맞는 세율을 입력해 주세요.",

        "purchase.validation.store":
            "구매처를 선택해 주세요.",

        "purchase.validation.price":
            "이번 가격을 입력해 주세요.",

        "purchase.validation.duplicateCode":
            "이 상품 코드는 다른 상품에 이미 등록되어 있습니다.",

        "purchase.error.save":
            "구매 정보를 기록하지 못했습니다.",

        /*
         구매 기록 · 가격
        */

        "history.backHome":
            "← 🏠 홈",

        "history.title":
            "📊 구매 기록 · 가격",

        "history.help":
            "사용 방법",

        "history.help.title":
            "구매 기록 · 가격 안내",

        "history.help.featureTitle":
            "주요 기능",

        "history.help.feature1":
            "구매 기록을 구매일 또는 상품별로 확인할 수 있습니다.",

        "history.help.feature2":
            "지난번 가격, 최저 가격, 평균 가격과 지난번 구매처의 가격을 확인할 수 있습니다.",

        "history.help.feature3":
            "지금 상품을 구매할지 결정할 때 지난 가격과 비교해 볼 수 있습니다.",

        "history.help.usefulTitle":
            "이럴 때 유용해요",

        "history.help.useful1":
            "“지난번에 얼마에 샀는지 확인하고 싶을 때”",

        "history.help.useful2":
            "“어느 구매처에서 가장 저렴했는지 확인하고 싶을 때”",

        "history.help.useful3":
            "“가격이 올랐는지 확인하고 싶을 때”",

        "history.help.useful4":
            "“현재 가격에 구매할지 결정하고 싶을 때”",

        "history.help.howToTitle":
            "사용 방법",

        "history.help.step1":
            "“구매별”에서는 구매 기록을 시간순으로 확인할 수 있습니다.",

        "history.help.step2":
            "“상품별”에서는 같은 상품의 구매 기록을 한곳에서 확인할 수 있습니다. 카테고리별로도 볼 수 있습니다.",

        "history.help.step3":
            "확인하려는 상품의 “가격 확인 · 구매”를 선택해 주세요.",

        "history.help.step4":
            "지난번 가격, 최저 가격, 평균 가격과 지난번 구매처의 가격을 확인할 수 있습니다.",

        "history.help.step5":
            "구매하려면 현재 구매 정보를 입력한 후 구매를 기록해 주세요.",

        "history.help.step6":
            "이번에는 구매하지 않는 경우 “이번에는 건너뛰기”를 선택할 수 있습니다.",

        "history.help.step7":
            "구매를 기록하면 새로운 가격이 구매 기록 · 가격에 자동으로 추가됩니다.",

        "history.help.managementTitle":
            "구매 기록 관리",

        "history.help.management1":
            "잘못 기록한 구매 기록은 수정할 수 있습니다.",

        "history.help.management2":
            "삭제한 기록은 삭제된 구매 기록에서 확인하거나 복원할 수 있습니다.",

        "history.help.management3":
            "구매 기록을 완전히 삭제하면 다시 복원할 수 없습니다. 필요한 기록인지 확인한 후 삭제해 주세요.",

        "history.help.close":
            "닫기",

        "history.byDate":
            "🕒 구매별",

        "history.byProduct":
            "📦 상품별",

        "history.deleted":
            "🗑 삭제된 구매 기록",

        "history.categoryAll":
            "카테고리: 전체",

        "history.category":
            "카테고리: {name}",

        "history.productCount":
            "상품 {count}개",

        "history.month":
            "{year}년 {month}월 ({count})",

        "history.productMissing":
            "상품 정보 없음",

        "history.quantity":
            "수량: ",

        "history.viewPurchase":
            "가격 확인 · 구매",

        "history.edit":
            "✏ 수정",

        "history.delete":
            "🗑 삭제",

        "history.favorite":
            "⭐ 즐겨찾기",

        "history.notFavorite":
            "☆ 즐겨찾기",

        "history.latest":
            "지난번",

        "history.lowest":
            "최저",

        "history.average":
            "평균",

        "history.purchaseCount":
            "구매 횟수",

        "history.times":
            "{count}회",

        "history.open":
            "▶ 기록 보기",

        "history.close":
            "▼ 기록 닫기",

        "history.displayPrice":
            "표시 가격: ",

        "history.taxExcluded":
            "세전",

        "history.taxIncluded":
            "세금 포함",

        "history.taxExcludedPrice":
            "세전 가격: ",

        "history.taxRate":
            "세율: ",

        "history.rounding":
            "끝자리 처리: ",

        "history.round":
            "반올림",

        "history.floor":
            "버림",

        "history.ceil":
            "올림",

        "history.discountPercent":
            "🏷 {value}% 할인",

        "history.discountAmount":
            "🏷 {price} 할인",

        "history.empty.title":
            "아직 구매 기록이 없습니다.",

        "history.empty.text":
            "구매 가격을 기록하면 여기에 표시됩니다.",

        "history.delete.notFound":
            "삭제할 구매 기록을 찾을 수 없습니다.",

        "history.delete.confirm":
            "이 구매 기록을 삭제할까요?",

        "history.delete.failed":
            "구매 기록을 삭제하지 못했습니다.",

        "history.edit.notFound":
            "수정할 구매 기록을 찾을 수 없습니다.",

        "history.product.notFound":
            "상품 정보를 찾을 수 없습니다.",

        "history.editing":
            "구매 기록 수정",

        "history.deleted.back":
            "← 구매 기록으로 돌아가기",

        "history.deleted.empty":
            "삭제된 구매 기록이 없습니다.",

        "history.deleted.restore":
            "↩ 복원",

        "history.deleted.permanentDelete":
            "🗑 완전히 삭제",

        "history.deleted.restoreFailed":
            "구매 기록을 복원하지 못했습니다.",

        "history.deleted.confirmPermanent":
            "이 구매 기록을 완전히 삭제할까요?\n\n삭제한 후에는 되돌릴 수 없습니다.",

        "history.deleted.permanentDeleteFailed":
            "구매 기록을 완전히 삭제하지 못했습니다.",

        /*
         상품 카테고리
        */

        "category.title":
            "상품 카테고리",

        "category.name":
            "카테고리 이름",

        "category.namePlaceholder":
            "예: 식품, 음료, 생활용품",

        "category.save":
            "+ 저장",

        "category.backSettings":
            "← ⚙️ 설정",

        "category.backProduct":
            "← 상품 등록",

        "category.list.default":
            "기본 카테고리",

        "category.list.user":
            "내 카테고리",

        "category.list.protected":
            "수정할 수 없음",

        "category.list.edit":
            "✏ 수정",

        "category.list.delete":
            "🗑 삭제",

        "category.validation.nameRequired":
            "카테고리 이름을 입력해 주세요.",

        "category.validation.duplicate":
            "이미 등록된 카테고리입니다.",

        "category.message.editNotFound":
            "수정할 카테고리를 찾을 수 없습니다.",

        "category.default.editBlocked":
            "기본 카테고리는 변경할 수 없습니다.",

        "category.default.deleteBlocked":
            "기본 카테고리는 삭제할 수 없습니다.",

        "category.confirm.deleteUsed":
            "이 카테고리는 등록된 상품에서 사용 중입니다.\n\n선택 목록에서 삭제할까요?\n등록된 상품의 데이터는 그대로 유지됩니다.",

        "category.confirm.delete":
            "이 카테고리를 삭제할까요?",

        /*
         구매처 관리
        */

        "store.title":
            "🏬 구매처 관리",

        "store.country":
            "국가 / 지역",

        "store.type":
            "구매처 유형",

        "store.select":
            "선택해 주세요",

        "store.type.supermarket":
            "슈퍼마켓",

        "store.type.convenience":
            "편의점",

        "store.type.drugstore":
            "드럭스토어",

        "store.type.discount":
            "할인점",

        "store.type.warehouse-club":
            "창고형 매장",

        "store.type.fixed-price":
            "균일가 매장",

        "store.type.home-center":
            "홈센터",

        "store.type.department-mall":
            "백화점 / 쇼핑몰",

        "store.type.clothing":
            "의류 매장",

        "store.type.electronics":
            "전자제품 매장",

        "store.type.gas-station":
            "주유소",

        "store.type.specialty":
            "전문점",

        "store.type.online":
            "온라인 쇼핑몰",

        "store.type.subscription":
            "정기 구독",

        "store.type.vending":
            "자동판매기",

        "store.type.other":
            "기타",

        "store.region":
            "주 / 도 / 지역",

        "store.city":
            "도시 / 시·군·구",

        "store.name":
            "구매처 이름",

        "store.save":
            "+ 저장",

        "store.registered":
            "등록된 구매처",

        "store.placeholder.JP.store":
            "예: 이온 ○○점",

        "store.placeholder.JP.region":
            "예: 도쿄도",

        "store.placeholder.JP.city":
            "예: 미나토구",

        "store.placeholder.US.store":
            "예: Costco Los Angeles",

        "store.placeholder.US.region":
            "예: California",

        "store.placeholder.US.city":
            "예: Los Angeles",

        "store.placeholder.CA.store":
            "예: Costco Toronto",

        "store.placeholder.CA.region":
            "예: Ontario",

        "store.placeholder.CA.city":
            "예: Toronto",

        "store.placeholder.AU.store":
            "예: Woolworths Sydney",

        "store.placeholder.AU.region":
            "예: New South Wales",

        "store.placeholder.AU.city":
            "예: Sydney",

        "store.placeholder.KR.store":
            "예: 이마트 서울점",

        "store.placeholder.KR.region":
            "예: 서울특별시",

        "store.placeholder.KR.city":
            "예: 강남구",

        "store.placeholder.CN.store":
            "예: 沃尔玛上海店",

        "store.placeholder.CN.region":
            "예: 上海市",

        "store.placeholder.CN.city":
            "예: 浦东新区",

        "store.placeholder.TW.store":
            "예: 家樂福台北店",

        "store.placeholder.TW.region":
            "예: 臺北市",

        "store.placeholder.TW.city":
            "예: 中正區",

        "store.placeholder.OTHER.store":
            "예: 구매처 이름",

        "store.placeholder.OTHER.region":
            "예: 주 / 도 / 지역",

        "store.placeholder.OTHER.city":
            "예: 도시",

        "store.default.jp.aeon.name":
            "이온 스타일 시나가와 시사이드",

        "store.default.jp.aeon.region":
            "도쿄도",

        "store.default.jp.aeon.city":
            "시나가와구",

        "store.default.jp.life.name":
            "라이프 센트럴 스퀘어 에비스 가든 플레이스",

        "store.default.jp.life.region":
            "도쿄도",

        "store.default.jp.life.city":
            "시부야구",

        "store.default.jp.mandai.name":
            "만다이 시부카와점",

        "store.default.jp.mandai.region":
            "오사카부",

        "store.default.jp.mandai.city":
            "히가시오사카시",

        "store.default.jp.gyomu.name":
            "교무 슈퍼 신주쿠 오쿠보점",

        "store.default.jp.gyomu.region":
            "도쿄도",

        "store.default.jp.gyomu.city":
            "신주쿠구",

        "store.default.jp.coop.name":
            "코프 미라이 도야마점",

        "store.default.jp.coop.region":
            "도쿄도",

        "store.default.jp.coop.city":
            "신주쿠구",

        "store.default.jp.lopia.name":
            "로피아 히라이 시마추 홈즈점",

        "store.default.jp.lopia.region":
            "도쿄도",

        "store.default.jp.lopia.city":
            "에도가와구",

        "store.default.jp.donki.name":
            "MEGA 돈키호테 시부야 본점",

        "store.default.jp.donki.region":
            "도쿄도",

        "store.default.jp.donki.city":
            "시부야구",

        "store.default.jp.costco.name":
            "코스트코 가와사키 창고점",

        "store.default.jp.costco.region":
            "가나가와현",

        "store.default.jp.costco.city":
            "가와사키시",

        "store.backSettings":
            "← ⚙️ 설정",

        "store.backProduct":
            "← 📦 상품 등록",

        "store.validation.typeRequired":
            "구매처 유형을 선택해 주세요.",

        "store.validation.nameRequired":
            "구매처 이름을 입력해 주세요.",

        "store.validation.duplicate":
            "이미 등록된 구매처입니다.",

        "store.message.saved":
            "구매처가 저장되었습니다.",

        "store.message.editNotFound":
            "수정할 구매처를 찾을 수 없습니다.",

        "store.message.updated":
            "구매처 정보가 업데이트되었습니다.",

        "store.message.editMode":
            "구매처를 수정하고 있습니다. 저장하면 구매처 정보가 업데이트됩니다.",

        "store.default.editBlocked":
            "Cocartly의 기본 구매처이므로 변경할 수 없습니다.",

        "store.default.deleteBlocked":
            "Cocartly의 기본 구매처이므로 삭제할 수 없습니다.",

        "store.confirm.delete":
            "이 구매처를 삭제할까요?",

        "store.list.protected":
            "🔒 수정할 수 없음",

        "store.list.default":
            "🔒 기본 구매처",

        "store.list.added":
            "🏬 내 구매처",

        "store.list.empty":
            "아직 추가한 구매처가 없습니다.",

        /*
         빠른 추가
        */

        "product.quick.makerRequired":
            "제조사 이름을 입력해 주세요.",

        "product.quick.makerExisting":
            "등록된 제조사를 선택했습니다.",

        "product.quick.makerAdded":
            "제조사를 추가하고 선택했습니다.",

        "product.quick.categoryRequired":
            "상품 카테고리를 입력해 주세요.",

        "product.quick.categoryExisting":
            "등록된 카테고리를 선택했습니다.",

        "product.quick.categoryAdded":
            "카테고리가 추가되었습니다.",

        "product.quick.storeTypeRequired":
            "구매처 유형을 선택해 주세요.",

        "product.quick.storeNameRequired":
            "구매처 이름을 입력해 주세요.",

        "product.quick.storeExisting":
            "등록된 구매처를 선택했습니다.",

        "product.quick.storeAdded":
            "구매처를 추가하고 선택했습니다.",

        /*
         백업 / 복원
        */

        "backup.message.created":
            "Cocartly 백업을 만들었습니다.\n\n기기 변경이나 데이터 복원에 사용할 수 있도록 이 파일을 안전한 곳에 보관해 주세요.",

        "backup.message.failed":
            "백업을 만들지 못했습니다.",

        "restore.message.invalidFile":
            "올바른 Cocartly 백업 파일이 아닙니다.",

        "restore.confirm":
            "이 백업으로 복원할까요?\n\n현재 Cocartly 데이터가 백업에 저장된 데이터로 바뀝니다.\n\n계속할까요?",

        "restore.message.completed":
            "Cocartly 데이터를 복원했습니다.\n\n화면을 다시 불러옵니다.",

        "restore.message.readFailed":
            "백업 파일을 읽지 못했습니다.\n\n파일이 손상되었거나 Cocartly 백업 파일이 아닐 수 있습니다.",

        /*
         Cocartly 정보
        */

        "about.back":
            "← ⚙️ 설정",

        "about.title":
            "ℹ️ Cocartly 정보",

        "about.appName":
            "🛒 Cocartly",

        "about.catch":
            "장보기와 외출 준비를 더 간편하게.",

        "about.description":
            "Cocartly는 상품 등록과 관리, 장보기 목록, 구매 기록, 가격 비교, 외출 준비 체크리스트를 한곳에서 관리할 수 있도록 도와주는 쇼핑 지원 앱입니다.",

        "about.features.title":
            "주요 기능",

        "about.features.product":
            "상품 등록 · 관리",

        "about.features.code":
            "상품 코드 스캔",

        "about.features.shopping":
            "장보기 목록",

        "about.features.history":
            "구매 기록 · 가격",

        "about.features.outing":
            "외출 체크리스트",

        "about.features.master":
            "카테고리 · 구매처 관리",

        "about.features.backup":
            "백업 · 복원",

        "about.data.title":
            "데이터 안내",

        "about.data.description":
            "Cocartly 데이터는 이 기기의 브라우저에 저장됩니다. 기기를 변경하거나 데이터가 사라지는 상황에 대비해 설정에서 정기적으로 백업해 주세요.",

        /*
         개인정보 처리방침
        */

        "privacy.back":
            "← ⚙️ 설정",

        "privacy.title":
            "🔒 개인정보 처리방침",

        "privacy.intro":
            "Cocartly는 사용자의 데이터를 적절하게 처리하기 위해 노력합니다. 이 개인정보 처리방침에서는 Cocartly가 어떤 정보를 처리하고 어떻게 사용하는지 안내합니다.",

        "privacy.section1.title":
            "1. 수집 및 저장하는 정보",

        "privacy.section1.text":
            "Cocartly는 상품 정보, 상품 코드, 상품 카테고리, 구매처, 장보기 목록, 구매 기록, 가격 정보, 외출 체크리스트 등 사용자가 입력한 데이터를 처리합니다.",

        "privacy.section2.title":
            "2. 이용 목적",

        "privacy.section2.text":
            "이 정보는 상품 관리, 장보기 목록 관리, 구매 기록 및 가격 비교, 외출 전 준비물 확인 등 Cocartly의 기능을 제공하는 데 사용됩니다.",

        "privacy.section3.title":
            "3. 기기에 저장되는 데이터",

        "privacy.section3.text1":
            "Cocartly에 등록한 데이터는 기본적으로 현재 사용 중인 기기의 브라우저에 저장됩니다.",

        "privacy.section3.text2":
            "브라우저 데이터를 삭제하거나 기기를 변경하면 저장된 데이터가 사라질 수 있습니다.",

        "privacy.section4.title":
            "4. 외부 서비스와의 통신",

        "privacy.section4.text1":
            "상품 코드를 이용해 상품 정보를 검색하는 경우와 같이 일부 기능에서는 외부 서비스와 통신할 수 있습니다.",

        "privacy.section4.text2":
            "이 경우 상품 코드 등 검색에 필요한 정보가 외부 서비스로 전송될 수 있습니다.",

        "privacy.section5.title":
            "5. 백업 데이터",

        "privacy.section5.text1":
            "“데이터 백업”을 사용하면 Cocartly 데이터를 JSON 형식의 백업 파일로 기기에 저장할 수 있습니다.",

        "privacy.section5.text2":
            "백업 파일에는 상품 정보, 구매 기록, 외출 정보 등이 포함될 수 있습니다. 백업 파일은 안전하게 보관하고 관리해 주세요.",

        "privacy.section6.title":
            "6. 계정 정보",

        "privacy.section6.text1":
            "현재 Cocartly에는 로그인 또는 사용자 계정 기능이 없습니다.",

        "privacy.section6.text2":
            "따라서 Cocartly는 로그인을 위한 이메일 주소나 비밀번호를 등록하거나 저장하지 않습니다.",

        "privacy.section7.title":
            "7. 접속 정보",

        "privacy.section7.text":
            "Cocartly가 웹 서비스로 제공되는 경우, 서비스 제공에 필요한 통신 과정에서 호스팅 서비스가 IP 주소, 브라우저 및 기기 정보, 접속 일시 등의 정보를 처리할 수 있습니다.",

        "privacy.section8.title":
            "8. 제3자 제공",

        "privacy.section8.text1":
            "법률에 따라 필요한 경우를 제외하고 Cocartly 운영자는 사용자가 등록한 데이터를 제3자에게 판매하지 않습니다.",

        "privacy.section8.text2":
            "다만 외부 서비스를 사용하는 기능에서는 해당 기능을 제공하는 데 필요한 정보가 관련 서비스로 전송될 수 있습니다.",

        "privacy.section9.title":
            "9. 개인정보 처리방침 변경",

        "privacy.section9.text":
            "Cocartly의 기능 추가, 서비스 변경 또는 이용하는 외부 서비스의 변경 등에 따라 이 개인정보 처리방침이 변경될 수 있습니다.",

        "privacy.section10.title":
            "10. 문의",

        "privacy.section10.text":
            "문의처는 Cocartly 정식 출시 시 안내할 예정입니다.",

        /*
         기기 / 화면 방향
        */

        "device.desktop.only":
            "Cocartly는 스마트폰 전용 앱입니다.",

        "device.desktop.unavailable":
            "PC와 태블릿에서는 Cocartly를 이용할 수 없습니다.",

        "device.orientation.title":
            "스마트폰을 세로로 사용해 주세요",

        "device.orientation.guide":
            "이 앱은 세로 화면에 최적화되어 있습니다.",

        /*
         코드 스캔
        */

        "code.backHome":
            "🏠 홈",

        "code.title":
            "코드 스캔",

        "code.guide":
            "바코드를 프레임 안에 맞춰 주세요.",

        "code.success":
            "스캔 완료",

        "code.waiting":
            "스캔을 기다리고 있습니다...",

        "code.flash":
            "🔦 플래시",

        "code.manualInput":
            "⌨ 상품 코드 입력",

        "code.message.flashComingSoon":
            "플래시 기능은 향후 업데이트에서 지원할 예정입니다.",

        "code.message.manualInputComingSoon":
            "상품 코드 직접 입력 기능은 향후 업데이트에서 지원할 예정입니다.",

        "code.status.align":
            "바코드가 프레임 가운데에 오도록 맞춰 주세요.",

        "code.status.checking":
            "코드를 확인하고 있습니다…",

        "code.status.success":
            "스캔했습니다",

        "code.status.searching":
            "상품 정보를 찾고 있습니다…",

        "code.status.cameraError":
            "카메라를 시작하지 못했습니다.",

        "code.flashOff":
            "🔦 플래시 끄기",

        "code.backShopping":
            "🛒 장보기 목록으로 돌아가기",

        "code.manual.prompt":
            "상품 바코드를 입력해 주세요.\n\n8자리, 12자리 또는 13자리 숫자를 입력해 주세요.",

        "code.manual.required":
            "상품 코드를 입력해 주세요.",

        "code.manual.numberOnly":
            "숫자만 입력해 주세요.",

        "code.manual.invalidLength":
            "8자리, 12자리 또는 13자리 상품 바코드를 입력해 주세요.",

        "code.status.waiting":
            "스캔을 기다리고 있습니다...",

        "code.status.openManual":
            "상품 등록 화면을 열고 있습니다...",

        "code.status.openManualError":
            "상품 정보를 가져오지 못했습니다. 직접 입력 화면을 엽니다...",

        "code.camera.notStarted":
            "카메라가 실행되고 있지 않습니다.",

        "code.camera.notFound":
            "카메라에 접근하지 못했습니다.",

        "code.flash.unsupported":
            "이 기기 또는 브라우저에서는 플래시를 조작할 수 없습니다.",

        "code.flash.error":
            "플래시 설정을 변경하지 못했습니다.",

        "code.product.notRegistered":
            "아직 등록되지 않은 상품입니다.\n\n상품 코드: {code}\n\n상품 등록 화면을 엽니다.",

        "code.product.selected":
            "상품 코드로 선택한 상품: “{name}”",

        "code.product.apiNotFound":
            "바코드는 스캔했지만 상품 정보를 찾지 못했습니다.\n\n상품 코드: {code}\n\n상품명과 필요한 정보를 입력해 등록해 주세요.",

        "code.product.autoFetchFailed":
            "상품 정보를 자동으로 가져오지 못했습니다.\n\n상품 코드: {code}\n\n상품명과 필요한 정보를 입력해 등록해 주세요.",

        "code.product.manualRegistration":
            "상품 정보를 자동으로 가져오지 못했습니다. 상품명과 필요한 정보를 입력해 등록해 주세요.",

        "code.product.codeConfirmed":
            "상품 코드를 확인했습니다.\n\n상품 코드: {code}\n\n상품 정보를 찾지 못해 상품 등록 화면을 엽니다.",

        "code.product.searchFailed":
            "상품 정보를 가져오지 못했습니다.\n\n상품 코드: {code}\n\n상품 등록 화면을 엽니다.",

        /*
         외출 체크리스트
        */

        "outing.title":
            "🎒 외출 체크리스트",

        "outing.backHome":
            "← 🏠 홈",

        "outing.help":
            "사용 방법",

        "outing.intro.title":
            "외출 전에 필요한 물건을 확인해 보세요",

        "outing.intro.guide":
            "가져갈 물건을 확인하고 미리 준비할 수 있습니다. 구매가 필요한 물건은 장보기 목록에 추가할 수 있습니다.",

        "outing.help.title":
            "외출 체크리스트 안내",

        "outing.help.whatCanDo":
            "주요 기능",

        "outing.help.description1":
            "여행, 행사, 일상적인 외출에 필요한 준비물 체크리스트를 만들 수 있습니다.",

        "outing.help.description2":
            "필요한 물건을 “집에 있는 물건”과 “구매할 물건”으로 나누어 관리할 수 있습니다.",

        "outing.help.description3":
            "구매가 필요한 물건은 장보기 목록에 추가해 평소 장보기와 함께 관리할 수 있습니다.",

        "outing.help.description4":
            "자주 사용하는 준비물 목록은 다음 외출에도 다시 사용할 수 있습니다.",

        "outing.help.usefulTitle":
            "이럴 때 유용해요",

        "outing.help.useful1":
            "“여행에서 물건을 빠뜨리지 않고 챙기고 싶을 때”",

        "outing.help.useful2":
            "“외출 전에 필요한 물건을 확인하고 싶을 때”",

        "outing.help.useful3":
            "“집에 있는 물건과 구매할 물건을 나누어 확인하고 싶을 때”",

        "outing.help.useful4":
            "“매번 같은 준비물을 다시 입력하지 않고 사용하고 싶을 때”",

        "outing.help.howTo":
            "사용 방법",

        "outing.help.step1":
            "“+ 외출 만들기”를 선택해 새로운 외출을 만들 수 있습니다.",

        "outing.help.step2":
            "외출에 필요한 물건을 추가해 주세요.",

        "outing.help.step3":
            "지갑이나 수건처럼 새로 구매하지 않고 가져갈 물건은 “집에 있는 물건”에서 관리할 수 있습니다.",

        "outing.help.step4":
            "외출 전에 구매해야 하는 물건은 “구매할 물건”에서 관리할 수 있습니다. 등록된 상품을 선택하거나 상품 코드로 찾을 수도 있습니다.",

        "outing.help.step5":
            "구매할 물건은 장보기 목록에 추가할 수 있습니다. 구매가 완료되면 외출 체크리스트에서도 해당 물건이 “준비 완료”로 변경됩니다.",

        "outing.help.step6":
            "필요에 따라 물건의 상태를 “준비 전”, “준비 완료”, “보류”로 변경할 수 있습니다.",

        "outing.help.step7":
            "나중에 필요한 물건이 생기면 “+ 추가”에서 더 추가할 수 있습니다.",

        "outing.help.management":
            "외출 관리",

        "outing.help.managementUpcoming":
            "“예정”에서는 앞으로의 외출을 확인할 수 있습니다.",

        "outing.help.managementRoutine":
            "“자주 쓰는 목록”에서는 자주 사용하는 외출과 준비물을 확인할 수 있습니다.",

        "outing.help.managementPast":
            "“지난 외출”에서는 완료된 외출을 확인할 수 있습니다.",

        "outing.create":
            "+ 외출 만들기",

        "outing.tab.upcoming":
            "예정",

        "outing.tab.routine":
            "자주 쓰는 목록",

        "outing.tab.past":
            "지난 외출",

        "outing.empty.upcoming":
            "아직 예정된 외출이 없습니다.",

        "outing.empty.routine":
            "아직 자주 쓰는 외출이 없습니다.",

        "outing.empty.past":
            "아직 지난 외출이 없습니다.",

        "outing.empty.default":
            "아직 표시할 내용이 없습니다.",

        "outing.create.back":
            "← 🎒 외출 체크리스트",

        "outing.create.title":
            "+ 외출 만들기",

        "outing.create.question":
            "어디로 외출하시나요?",

        "outing.create.guide":
            "“여행”이나 “야구 관람”처럼 알아보기 쉬운 이름을 입력해 주세요.",

        "outing.create.name":
            "외출 이름",

        "outing.create.namePlaceholder":
            "예: 야구 관람",

        "outing.create.type":
            "외출 유형",

        "outing.create.scheduled":
            "한 번만",

        "outing.create.routine":
            "반복",

        "outing.create.typeGuide":
            "여행이나 야구 관람처럼 한 번 예정된 외출은 “한 번만”, 출근이나 등교처럼 반복되는 외출은 “반복”을 선택해 주세요.",

        "outing.create.date":
            "외출 날짜",

        "outing.create.item":
            "가져갈 물건",

        "outing.create.itemPlaceholder":
            "예: 티켓",

        "outing.create.addItem":
            "+ 준비물 추가",

        "outing.create.noItems":
            "아직 추가한 준비물이 없습니다.",

        "outing.create.save":
            "저장",

        "outing.message.itemRequired":
            "가져갈 물건을 입력해 주세요.",

        "outing.message.itemDuplicate":
            "이미 추가된 준비물입니다.",

        "outing.message.itemAdded":
            "준비물이 추가되었습니다.",

        "outing.message.nameRequired":
            "외출 이름을 입력해 주세요.",

        "outing.message.dateRequired":
            "외출 날짜를 선택해 주세요.",

        "outing.message.itemsRequired":
            "준비물을 하나 이상 추가해 주세요.",

        "outing.message.nameDuplicate":
            "같은 이름의 외출이 이미 등록되어 있습니다.",

        "outing.message.purchaseAdded":
            "구매할 물건에 추가되었습니다.",

        "outing.message.itemRegisteredDuplicate":
            "이미 등록된 준비물입니다.",

        "outing.message.purchaseRequired":
            "구매할 물건을 입력해 주세요.",

        "outing.message.productRequired":
            "상품을 선택해 주세요.",

        "outing.message.quantityInvalid":
            "수량은 1 이상으로 입력해 주세요.",

        "outing.message.productNotFound":
            "상품을 찾을 수 없습니다.",

        "outing.message.productLinkedDuplicate":
            "이 상품은 이미 다른 준비물과 연결되어 있습니다.",

        "outing.message.productDuplicate":
            "이 상품은 이미 준비물에 추가되어 있습니다.",

        "outing.message.registeredProductSelected":
            "등록된 상품을 선택했습니다: “{name}”",

        "outing.create.deleteItem":
            "🗑 삭제",

        "outing.check.back":
            "← 🎒 외출 체크리스트",

        "outing.check.title":
            "외출 체크리스트",

        "outing.check.pending":
            "준비 전",

        "outing.check.ready":
            "준비 완료",

        "outing.check.hold":
            "보류",

        "outing.check.add":
            "+ 추가",

        "outing.check.complete":
            "✓ 외출 완료",

        "outing.check.completeGuide":
            "외출을 마치면 지난 외출로 이동합니다.",

        "outing.items.emptyStatus":
            "이 상태의 준비물이 없습니다.",

        "outing.items.home":
            "🏠 집에 있는 물건",

        "outing.items.purchase":
            "🛒 구매할 물건",

        "outing.items.purchased":
            "🛒 구매 완료",

        "outing.items.emptyGroup":
            "이 그룹에 준비물이 없습니다.",

        "outing.items.quantity":
            "수량 {quantity}",

        "outing.items.readyFromShopping":
            "구매 완료 · 준비 완료",

        "outing.items.chooseProduct":
            "🔗 상품 선택",

        "outing.items.addToShopping":
            "🛒 장보기 목록에 추가",

        "outing.items.selectProductGuide":
            "장보기 목록에 추가할 상품을 선택해 주세요.",

        "outing.items.ready":
            "✓ 준비 완료로 변경",

        "outing.items.hold":
            "보류하기",

        "outing.items.backPending":
            "준비 전으로 변경",

        "outing.items.delete":
            "🗑 이 준비물 삭제",

        "outing.message.alreadyAddedToShopping":
            "이 준비물은 이미 장보기 목록에 추가되어 있습니다.",

        "outing.confirm.deleteItem":
            "이 외출에서 다음 준비물을 삭제할까요?\n\n“{name}”",

        "outing.confirm.deleteLinkedItem":
            "\n\n이 준비물은 장보기 목록에도 추가되어 있습니다.\n이 외출과의 연결만 해제됩니다.\n장보기 목록의 상품은 그대로 유지됩니다.",

        "outing.add.homeTitle":
            "🏠 집에 있는 물건 / 직접 입력",

        "outing.add.item":
            "가져갈 물건",

        "outing.add.itemPlaceholder":
            "예: 지갑, 수건, 음료",

        "outing.add.itemButton":
            "+ 준비물 추가",

        "outing.add.purchaseTitle":
            "🛒 구매할 물건",

        "outing.add.purchaseGuide":
            "아직 정확한 상품을 정하지 않았어도 “음료”나 “충전기”처럼 필요한 물건을 먼저 추가할 수 있습니다.",

        "outing.add.purchase":
            "구매할 물건",

        "outing.add.purchasePlaceholder":
            "예: 음료, 충전기, 건전지",

        "outing.add.purchaseButton":
            "+ 구매할 물건 추가",

        "outing.add.selectMethod":
            "상품 선택",

        "outing.add.registered":
            "① 등록된 상품에서 선택",

        "outing.add.category":
            "카테고리",

        "outing.add.allCategories":
            "모든 카테고리",

        "outing.add.product":
            "상품",

        "outing.add.selectProduct":
            "상품을 선택해 주세요",

        "outing.add.code":
            "② 상품 코드로 찾기",

        "outing.add.codeGuide":
            "상품 코드를 알고 있다면 카메라로 스캔해 상품을 찾을 수 있습니다.",

        "outing.add.scan":
            "📷 상품 코드 스캔",

        "outing.add.quantity":
            "수량",

        "outing.add.productButton":
            "+ 상품을 준비물에 추가",

        "outing.productSelect.back":
            "← 준비 전으로 돌아가기",

        "outing.productSelect.title":
            "🔗 상품 선택",

        "outing.productSelect.guide":
            "“{name}”으로 구매할 상품을 선택해 주세요.",

        "outing.productSelect.selectButton":
            "이 상품 선택",

        "outing.scan.back":
            "← 외출 체크리스트",

        "outing.past.back":
            "← 🎒 지난 외출",

        "outing.past.title":
            "지난 외출",

        "outing.past.items":
            "가져간 물건",

        "outing.past.yearMonth":
            "{year}년 {month}월",

        "outing.past.count":
            "외출 {count}개",

        "outing.past.countOne":
            "외출 {count}개",

        "outing.past.itemCount":
            "준비물 {count}개",

        "outing.past.itemCountOne":
            "준비물 {count}개",

        "outing.past.noDate":
            "날짜 기록 없음",

        "outing.past.noItems":
            "기록된 준비물이 없습니다.",

        "outing.past.reuse":
            "🔁 이 외출 다시 사용",

        "outing.past.delete":
            "🗑 이 지난 외출 삭제",

        "outing.past.reuseSuffix":
            " (다시 사용)",

        "outing.confirm.complete":
            "이 외출을 마칠까요?\n\n“{name}”\n\n완료하면 지난 외출로 이동합니다.",

        "outing.message.copied":
            "지난 외출을 복사했습니다. 날짜를 선택한 후 저장해 주세요.",

        "outing.confirm.deletePast":
            "다음 외출 기록을 삭제할까요?\n\n“{name}”\n\n삭제한 후에는 되돌릴 수 없습니다.\n\n등록된 상품과 구매 기록은 삭제되지 않습니다.",

        "outing.message.addedToShopping":
            "장보기 목록에 추가했습니다: “{name}”"
    },


    "zh-CN": {
        "common.start": "开始使用",
        "common.cancel": "取消",
        "common.save": "保存",
        "common.close": "关闭",

        "home.catch": "让购物更轻松。",
        "home.code": "扫码",
        "home.product": "添加商品",
        "home.shopping": "购物清单",
        "home.history": "购买记录 · 价格",
        "home.outing": "出行清单",
        "home.notice": "公告",
        "home.settings": "设置",

        "notice.backHome": "← 🏠 首页",
        "notice.title": "✉️ 公告",
        "notice.development.title":
            "Cocartly 正在持续完善",
        "notice.development.text":
            "我们正在改进 Cocartly 的首页和各项功能，让使用更加简单、方便。",

        "product.title": "添加商品",
        "product.backHome": "← 🏠 首页",
        "product.help": "使用方法",

        "product.name": "商品名称",
        "product.namePlaceholder": "例：洗发水",

        "product.code": "商品代码",
        "product.codePlaceholder":
            "扫码时自动填写",
        "product.codeGuide":
            "※ 有条形码的商品可通过“扫码”添加。",

        "product.category": "商品分类",
        "product.categoryManage": "⚙ 管理商品分类",

        "category.default.food": "食品",
        "category.default.drink": "饮料",
        "category.default.snack": "零食",
        "category.default.alcohol": "酒类",
        "category.default.daily": "日用品",
        "category.default.hygiene": "清洁与卫生用品",
        "category.default.medicine": "药品",
        "category.default.beauty": "美妆与护理",
        "category.default.clothing": "服装",
        "category.default.baby": "母婴用品",
        "category.default.pet": "宠物用品",
        "category.default.stationery": "文具与杂货",
        "category.default.electronics": "家电与电池",
        "category.default.other": "其他",

        "product.country": "国家 / 地区",

        "product.store": "购买渠道",
        "product.storeManage": "🏬 管理购买渠道",

        "product.volume": "数量 / 容量",
        "product.volumeExample": "输入示例",
        "product.volumePlaceholder": "例：400",

        "product.volumeExampleTitle":
            "数量 / 容量与单位的输入示例",
        "product.volumeExampleEgg":
            "🥚 大号鸡蛋 10 个",
        "product.volumeExampleEggDetail":
            "数量 / 容量：10 / 单位：个",
        "product.volumeExampleMilk":
            "🥛 牛奶 1000 mL",
        "product.volumeExampleMilkDetail":
            "数量 / 容量：1000 / 单位：mL",
        "product.volumeExampleRice":
            "🍚 大米 5 kg",
        "product.volumeExampleRiceDetail":
            "数量 / 容量：5 / 单位：kg",
        "product.volumeExampleBread":
            "🍞 切片面包 6 片",
        "product.volumeExampleBreadDetail":
            "数量 / 容量：6 / 单位：片",

        "product.unit": "单位",
        "product.select": "请选择",

        "product.unit.each": "个",
        "product.unit.sheet": "片",
        "product.unit.bottle": "瓶",
        "product.unit.bag": "袋",
        "product.unit.box": "盒",
        "product.unit.pack": "包",
        "product.unit.roll": "卷",

        "product.price": "价格（含税）",
        "product.priceCalc": "价格计算",
        "product.pricePlaceholder": "例：298",

        "product.shareTitle":
            "分享到 Cocartly 商品数据库",
        "product.shareDescription":
            "可共享商品名称、商品代码、商品分类等信息。价格和购买渠道不会被共享。",
        "product.shareThanks":
            "感谢您帮助完善 Cocartly 的商品信息。",

        "product.save": "保存",
        "product.cancelEdit": "✕ 取消编辑",
        "product.deletedItems": "🗑 已删除商品",
        "product.registered": "已添加商品",
        "product.allCategories": "分类：全部",

        "product.validation.volumeNeedsUnit":
            "填写数量或容量时，也需要选择单位。",
        "product.validation.unitNeedsVolume":
            "选择单位时，也需要填写数量或容量。",
        "product.validation.nameRequired":
            "请输入商品名称。",
        "product.validation.categoryRequired":
            "请选择商品分类。",
        "product.validation.storeRequired":
            "请选择购买渠道。",
        "product.validation.priceInvalid":
            "价格需要为 0 或以上。",

        "product.message.saved":
            "✓ 已保存",
        "product.message.savedOffline":
            "✓ 已保存到此设备，联网后可以同步。",
        "product.message.editCancelled":
            "已取消商品编辑。",

        /*
         Product Registration
         How to Use
        */

        "product.help.title":
            "关于添加商品",

        "product.help.featureTitle":
            "主要功能",

        "product.help.feature1":
            "可添加商品名称、商品代码、商品分类、购买渠道、数量或容量等商品信息。",

        "product.help.feature2":
            "有条形码的商品可通过扫码添加。以后再次扫描相同条形码时，可以自动识别为已添加商品。",

        "product.help.feature3":
            "记录购买渠道和价格后，可以在“购买记录 · 价格”中查看以往价格。",

        "product.help.feature4":
            "已添加商品可以先查看上次、最低和平均价格，以及以往的购买渠道，再记录本次购买。",

        "product.help.usefulTitle":
            "这些时候很方便",

        "product.help.useful1":
            "“想提前添加经常购买的商品”",

        "product.help.useful2":
            "“想看看这个商品上次多少钱”",

        "product.help.useful3":
            "“想看看在哪个购买渠道买得更便宜”",

        "product.help.useful4":
            "遇到这些情况时，Cocartly 都能帮上忙。",

        "product.help.howToTitle":
            "使用方法",

        "product.help.step1":
            "有条形码的商品，可以从首页的“扫码”读取条形码。",

        "product.help.step2":
            "首次添加的商品，可确认商品名称、商品分类、购买渠道、数量或容量等信息后保存。",

        "product.help.step3":
            "蔬菜、熟食、称重商品等没有条形码的商品，可以从首页的“添加商品”中添加。",

        "product.help.step4":
            "再次购买已添加商品时，可以扫描条形码，或从已添加商品中选择“查看价格并购买”。",

        "product.help.step5":
            "可查看上次、最低和平均价格，以及以往的购买渠道和价格。",

        "product.help.step6":
            "购买时，可选择“购买并记录价格”，再填写购买渠道、本次价格和数量。",

        "product.help.step7":
            "这次不购买时，可以选择“本次不购买”。",

        "product.help.step8":
            "记录的购买信息会自动显示在“购买记录 · 价格”中。",

        "product.help.close":
            "关闭",

        /*
         Product Registration
         Price Calculator
        */

        "product.tax.displayPrice":
            "标价",

        "product.tax.priceType":
            "价格类型",

        "product.tax.taxIncluded":
            "含税",

        "product.tax.taxExcluded":
            "不含税",

        "product.tax.taxRate":
            "税率",

        "product.tax.customTaxRate":
            "税率（%）",

        "product.tax.jpGuide":
            "可选择日本适用的税率。",

        "product.tax.overseasGuide":
            "可根据所在地区和商品类型填写税率。",

        "product.tax.rounding":
            "取整方式",

        "product.tax.round":
            "四舍五入",

        "product.tax.floor":
            "向下取整",

        "product.tax.ceil":
            "向上取整",

        "product.tax.discount":
            "优惠金额 / 折扣率",

        "product.tax.discountNone":
            "无折扣",

        "product.tax.discountPercent":
            "% OFF",

        "product.tax.discountAmountLabel":
            "{currency} OFF",

        "product.tax.discountAmount":
            "减免金额",

        "product.tax.discountValue":
            "优惠值",

        "product.tax.finalPrice":
            "最终价格：{price}",

        "product.tax.usePrice":
            "使用此价格",

        "product.tax.close":
            "关闭",

        "product.tax.examplePrefix":
            "例：",

        "product.tax.discountValuePlaceholder":
            "例：20",

        "product.tax.inputError":
            "输入内容似乎有误，请确认后再试。",

        /*
         Registered Products
        */

        "product.list.title":
            "已添加商品",

        "product.list.allCategories":
            "分类：全部",

        "product.list.categoryPrefix":
            "分类：",

        "product.list.count":
            "{count} 件",

        "product.list.countOne":
            "{count} 件",

        "product.list.empty":
            "还没有添加商品。",

        "product.list.month":
            "{year}/{month}",

        "product.list.code":
            "商品代码",

        "product.list.category":
            "商品分类",

        "product.list.store":
            "购买渠道",

        "product.list.volume":
            "数量 / 容量",

        "product.list.price":
            "价格",

        "product.list.registeredDate":
            "添加日期",

        "product.list.favorite":
            "常用",

        "product.list.checkPrice":
            "查看价格并购买",

        "product.list.edit":
            "✏ 编辑",

        "product.list.delete":
            "🗑 删除",

        /*
         Deleted Products
        */

        "product.deleted.title":
            "已删除商品",

        "product.deleted.button":
            "🗑 已删除商品（{count}）",

        "product.deleted.back":
            "← 📦 添加商品",

        "product.deleted.restore":
            "♻ 恢复",

        "product.deleted.permanentDelete":
            "🗑 永久删除",

        /*
         Edit / Delete / Restore
        */

        "product.message.editMode":
            "正在编辑商品，保存后会更新商品信息。",

        "product.message.registrationCancelled":
            "已取消添加商品。",

        "product.message.alreadyRegistered":
            "这个商品已经添加过了，无需再次添加。",

        "product.confirm.alreadyRegistered":
            "这个商品已经添加过了。\n\n商品名称：{name}\n\n无需再次添加相同商品。",

        "product.confirm.delete":
            "要删除这个商品吗？",

        "product.confirm.deletedFound":
            "这个商品在已删除商品中。\n\n商品名称：{name}\n\n是否恢复这个商品，而不是重新添加？",

        "product.confirm.permanentDelete":
            "要永久删除这个商品吗？\n\n商品：“{name}”\n\n删除后将无法恢复。",

        "product.registered.backHistory":
            "← 📊 购买记录 · 价格",

        "product.registered.backProduct":
            "← 📦 添加商品",

        "product.registered.notFound":
            "未找到已添加商品的信息。",

        "product.registered.code":
            "商品代码：{code}",

        "product.registered.noCode":
            "无商品代码",

        "product.registered.noRecord":
            "暂无记录",

        "product.registered.noHistory":
            "还没有价格记录。",

        "product.registered.title":
            "已添加商品",

        "product.registered.latest":
            "上次",

        "product.registered.lowest":
            "最低",

        "product.registered.average":
            "平均",

        "product.registered.historyTitle":
            "🏬 以往购买渠道与价格",

        "product.registered.buy":
            "🛒 购买并记录价格",

        "product.registered.skip":
            "本次不购买",

        /*
         Shopping List
        */

        "shopping.title":
            "🛒 购物清单",

        "shopping.backHome":
            "← 🏠 首页",

        "shopping.help":
            "使用方法",

        "shopping.help.title":
            "关于购物清单",

        "shopping.help.featureTitle":
            "主要功能",

        "shopping.help.feature1":
            "可将准备购买的商品加入购物清单，并在购物时逐一确认。",

        "shopping.help.feature2":
            "商品可按“待购买”“已购买”和“暂缓”三种状态管理。",

        "shopping.help.feature3":
            "已添加商品和尚未添加的商品都可以加入购物清单。",

        "shopping.help.feature4":
            "在商品详情中，可查看上次、最低和平均价格，也可以记录今天在门店确认到的库存和价格。",

        "shopping.help.usefulTitle":
            "这些时候很方便",

        "shopping.help.useful1":
            "“不想忘记今天要买的东西”",

        "shopping.help.useful2":
            "“想确认哪些已经买了，哪些还没买”",

        "shopping.help.useful3":
            "“想比较上次价格后再决定是否购买”",

        "shopping.help.useful4":
            "“想暂时保留缺货或这次不买的商品”",

        "shopping.help.howToTitle":
            "使用方法",

        "shopping.help.step1":
            "通过“+ 添加”可以将准备购买的商品加入购物清单。",

        "shopping.help.step2":
            "可以从已添加商品中选择，也可以输入新的商品名称。需要时还可以填写商品代码和计划购买数量。",

        "shopping.help.step3":
            "从“待购买”中选择商品后，可以查看商品详情。",

        "shopping.help.step4":
            "有购买记录的商品，可以查看上次、最低和平均价格。",

        "shopping.help.step5":
            "在门店确认到的销售状态和价格，可以记录在“今日门店信息”中。",

        "shopping.help.step6":
            "购买商品后，可以将其设为“已购买”。",

        "shopping.help.step7":
            "这次暂不购买的商品可以设为“暂缓”，之后也可以重新设为“待购买”。",

        "shopping.help.step8":
            "不再需要的商品可以从购物清单中移除。已添加商品和以往的购买记录不会被删除。",

        "shopping.help.step9":
            "购物完成后，可以选择“结束购物”确认本次购买内容。",

        "shopping.help.close":
            "关闭",

        "shopping.pending":
            "待购买",

        "shopping.purchased":
            "已购买",

        "shopping.hold":
            "暂缓",

        "shopping.addTab":
            "+ 添加",

        "shopping.remaining":
            "剩余",

        "shopping.itemUnit":
            "件",

        "shopping.remainingSummary":
            "剩余 {count} 件",

        "shopping.remainingSummaryOne":
            "剩余 {count} 件",

        "shopping.add.title":
            "添加到购物清单",

        "shopping.favorite":
            "⭐ 常用",

        "shopping.all":
            "全部",

        "shopping.registeredProduct":
            "已添加商品",

        "shopping.selectProduct":
            "请选择商品",

        "shopping.or":
            "或者",

        "shopping.productName":
            "商品名称",

        "shopping.productNamePlaceholder":
            "例：卷心菜",

        "shopping.code":
            "商品代码（如已知）",

        "shopping.codePlaceholder":
            "不知道时可留空",

        "shopping.scanCode":
            "📷 扫描商品代码",

        "shopping.codeGuide":
            "可手动输入，也可以使用相机扫描。",

        "shopping.quantity":
            "计划购买数量",

        "shopping.add":
            "+ 添加到购物清单",

        "shopping.finish":
            "结束购物",

        "shopping.empty.pending":
            "还没有待购买的商品。",

        "shopping.empty.purchased":
            "还没有已购买的商品。",

        "shopping.empty.hold":
            "还没有暂缓的商品。",

        "shopping.empty.favorite":
            "还没有常用商品。",

        "shopping.empty.category":
            "这个分类下还没有商品。",

        "shopping.validation.selectOrName":
            "请选择已添加商品，或输入商品名称。",

        "shopping.validation.quantity":
            "数量需要为 1 或以上。",

        "shopping.validation.duplicateCode":
            "这个商品代码对应的商品已经添加过了。",

        "shopping.validation.duplicateCodeDetail":
            "这个商品代码对应的商品已经添加过了。\n\n商品名称：{name}\n\n可从已添加商品中选择。",

        "shopping.message.added":
            "已添加到购物清单。",

        "shopping.message.unregisteredAdded":
            "未添加过的商品已加入购物清单。",

        "shopping.productNameUnset":
            "未设置商品名称",

        "shopping.previousPurchaseNone":
            "暂无上次购买记录",

        "shopping.previousPurchase":
            "上次购买：{store}",

        "shopping.quantityDisplay":
            "数量：{quantity}",

        "shopping.finish.noPurchased":
            "还没有已购买的商品。",

        "shopping.finish.pendingWarning":
            "还有 {count} 件商品处于“待购买”。\n\n有没有忘记购买的商品？\n\n仍要结束购物吗？",

        "shopping.finish.pendingWarningOne":
            "还有 {count} 件商品处于“待购买”。\n\n有没有忘记购买的商品？\n\n仍要结束购物吗？",

        "shopping.finish.itemCount":
            "{count} 件",

        "shopping.finish.itemCountOne":
            "{count} 件",

        "shopping.finish.confirm":
            "要结束购物吗？\n\n已购买：{purchasedText}\n待购买：{pendingText}\n暂缓：{holdText}\n\n是否确认这些已购买商品？",

        "shopping.finish.missingInfo":
            "保存购买记录所需的门店信息还不完整。\n\n以下商品需要记录“有货”和含税价格。\n\n• {names}",

        "shopping.finish.completed":
            "本次购物已完成。\n\n已保存到购买记录：{historyText}\n新添加商品：{registeredText}",

        /*
         Shopping List - Product Details
        */

        "shopping.detail.back":
            "🛒 ← 返回购物清单",

        "shopping.detail.title":
            "商品详情",

        "shopping.detail.unregistered":
            "未添加商品",

        "shopping.detail.quantity":
            "计划购买数量：",

        "shopping.detail.code":
            "商品代码",

        "shopping.detail.codePlaceholder":
            "不知道时可留空",

        "shopping.detail.saveCode":
            "保存商品代码",

        "shopping.detail.codeSaved":
            "商品代码已保存。",

        "shopping.detail.codeSavedEmpty":
            "商品代码已清除。",

        "shopping.detail.latest":
            "上次",

        "shopping.detail.lowest":
            "最低",

        "shopping.detail.average":
            "平均",

        "shopping.detail.taxIncludedShort":
            "含税",

        "shopping.detail.noHistory":
            "还没有购买记录。",

        "shopping.detail.previousStoreNone":
            "暂无上次购买记录",

        "shopping.detail.previousStore":
            "上次购买渠道：{store}",

        /*
         Today's Store Info
        */

        "shopping.store.title":
            "今日门店信息",

        "shopping.store.store":
            "门店",

        "shopping.store.previous":
            "上次购买门店",

        "shopping.store.recent":
            "最近使用的门店",

        "shopping.store.search":
            "🔍 查找其他门店",

        "shopping.store.country":
            "国家 / 地区",

        "shopping.store.allCountries":
            "所有国家 / 地区",

        "shopping.store.region":
            "省 / 地区",

        "shopping.store.allRegions":
            "所有地区",

        "shopping.store.name":
            "门店名称",

        "shopping.store.searchPlaceholder":
            "例：京桥、永旺、沃尔玛",

        "shopping.store.allStores":
            "所有门店",

        "shopping.store.select":
            "请选择门店",

        "shopping.store.availability":
            "销售状态",

        "shopping.store.available":
            "○ 有货",

        "shopping.store.soldout":
            "△ 售罄",

        "shopping.store.notavailable":
            "× 不销售",

        "shopping.store.unknown":
            "? 未确认",

        "shopping.store.taxExcluded":
            "不含税价格",

        "shopping.store.taxExcludedShort":
            "不含税",

        "shopping.store.taxIncluded":
            "含税价格",

        "shopping.store.taxIncludedKnown":
            "如已知",

        "shopping.store.examplePrefix":
            "例：",

        "shopping.store.priceCalc":
            "价格计算",

        "shopping.store.priceType":
            "价格类型",

        "shopping.store.priceTypeExcluded":
            "不含税",

        "shopping.store.priceTypeIncluded":
            "含税",

        "shopping.store.taxRate":
            "税率",

        "shopping.store.customTaxRate":
            "税率（%）",

        "shopping.store.rounding":
            "取整方式",

        "shopping.store.round":
            "四舍五入",

        "shopping.store.floor":
            "向下取整",

        "shopping.store.ceil":
            "向上取整",

        "shopping.store.discount":
            "折扣",

        "shopping.store.discountNone":
            "无折扣",

        "shopping.store.discountPercent":
            "% OFF",

        "shopping.store.discountAmount":
            "{currency} OFF",

        "shopping.store.discountValue":
            "折扣",

        "shopping.store.usePrice":
            "使用此价格",

        "shopping.store.close":
            "关闭",

        "shopping.store.save":
            "记录今日门店信息",

        "shopping.store.saved":
            "门店信息已保存。",

        "shopping.store.noChecks":
            "还没有记录门店信息。",

        "shopping.store.cheapest":
            "★ 最低",

        "shopping.store.checked":
            "确认日期：{date}",

        "shopping.store.noResults":
            "没有找到符合条件的门店。",

        "shopping.store.tooMany":
            "搜索结果较多，目前显示前 10 条。缩小范围后会更容易查找。",

        "shopping.detail.purchased":
            "✓ 已购买",

        "shopping.detail.hold":
            "暂缓购买",

        "shopping.detail.holdMessage":
            "已移至“暂缓”。\n\n14 天后将自动永久删除，如仍需要，可在此之前进行确认。",

        "shopping.detail.returnPending":
            "设为待购买",

        "shopping.detail.delete":
            "🗑 从购物清单移除",

        "shopping.detail.deleteGuide":
            "已添加商品和以往的购买记录不会被删除。",

        "shopping.detail.deleteConfirm":
            "要从购物清单中移除这个商品吗？\n\n已添加商品和以往的购买记录不会被删除。",

        /*
         Purchase Details
        */

        "purchase.backProduct":
            "← 返回商品",

        "purchase.backHistory":
            "← 返回购买记录 · 价格",

        "purchase.backPurchase":
            "← 返回购买详情",

        "purchase.backPurchaseScan":
            "🛒 购买详情",

        "purchase.title":
            "🛒 购买详情",

        "purchase.productName":
            "商品名称",

        "purchase.previousPrice":
            "上次价格",

        "purchase.noRecord":
            "暂无记录",

        "purchase.code":
            "商品代码",

        "purchase.codePlaceholder":
            "不知道时可留空",

        "purchase.scanCode":
            "📷 扫描商品代码",

        "purchase.codeGuide":
            "可使用相机扫描，也可以稍后填写或修改。",

        "purchase.store":
            "购买渠道",

        "purchase.previousStore":
            "上次购买渠道",

        "purchase.recentStores":
            "最近使用的购买渠道",

        "purchase.searchStore":
            "🔍 查找其他购买渠道",

        "purchase.country":
            "国家 / 地区",

        "purchase.allCountries":
            "所有国家 / 地区",

        "purchase.region":
            "省 / 地区",

        "purchase.allRegions":
            "所有地区",

        "purchase.storeName":
            "购买渠道名称",

        "purchase.storeSearchPlaceholder":
            "例：京桥、永旺、沃尔玛",

        "purchase.allStores":
            "所有购买渠道",

        "purchase.selectStore":
            "请选择购买渠道",

        "purchase.manageStores":
            "🏬 管理购买渠道",

        "purchase.currentPrice":
            "本次价格（含税）",

        "purchase.priceCalc":
            "价格计算",

        "purchase.taxExcluded":
            "不含税价格",

        "purchase.taxRate":
            "税率",

        "purchase.customTaxRate":
            "税率（%）",

        "purchase.rounding":
            "取整方式",

        "purchase.round":
            "四舍五入",

        "purchase.floor":
            "向下取整",

        "purchase.ceil":
            "向上取整",

        "purchase.discount":
            "折扣",

        "purchase.discountNone":
            "无折扣",

        "purchase.discountPercent":
            "% OFF",

        "purchase.discountAmount":
            "{currency} OFF",

        "purchase.discountValue":
            "优惠金额 / 折扣率",

        "purchase.taxIncludedResult":
            "含税价格：-",

        "purchase.usePrice":
            "使用此价格",

        "purchase.close":
            "关闭",

        "purchase.quantity":
            "数量",

        "purchase.save":
            "记录购买",

        "purchase.taxGuide.jp":
            "可选择日本适用的税率。",

        "purchase.taxGuide.other":
            "可根据所在地区和商品类型填写税率。",

        "purchase.validation.store":
            "请选择购买渠道。",

        "purchase.validation.price":
            "请输入本次价格。",

        "purchase.validation.duplicateCode":
            "此商品代码已用于其他已添加商品。",

        "purchase.error.save":
            "未能记录本次购买。",

        /*
         History & Price
        */

        "history.backHome":
            "← 🏠 首页",

        "history.title":
            "📊 购买记录 · 价格",

        "history.help":
            "使用方法",

        "history.help.title":
            "关于购买记录 · 价格",

        "history.help.featureTitle":
            "主要功能",

        "history.help.feature1":
            "可按购买日期或商品查看购买记录。",

        "history.help.feature2":
            "可查看上次、最低和平均价格，以及以往的购买渠道和价格。",

        "history.help.feature3":
            "准备购买商品时，可参考以往价格进行比较。",

        "history.help.usefulTitle":
            "这些时候很方便",

        "history.help.useful1":
            "“想看看上次买了多少钱”",

        "history.help.useful2":
            "“想看看哪个购买渠道价格最低”",

        "history.help.useful3":
            "“想确认价格有没有上涨”",

        "history.help.useful4":
            "“想参考以往价格决定这次是否购买”",

        "history.help.howToTitle":
            "使用方法",

        "history.help.step1":
            "在“按购买记录”中，可按时间顺序查看购买记录。",

        "history.help.step2":
            "在“按商品”中，同一商品的购买记录会集中显示，也可以按分类筛选。",

        "history.help.step3":
            "选择商品的“查看价格并购买”后，可查看详细信息。",

        "history.help.step4":
            "可查看上次、最低和平均价格，以及以往的购买渠道和价格。",

        "history.help.step5":
            "购买时，可填写本次购买信息并记录购买。",

        "history.help.step6":
            "这次不购买时，可选择“本次不购买”。",

        "history.help.step7":
            "记录购买后，新价格会自动添加到“购买记录 · 价格”。",

        "history.help.managementTitle":
            "管理购买记录",

        "history.help.management1":
            "误记的购买记录可以编辑。",

        "history.help.management2":
            "已删除的记录可在“已删除记录”中查看并恢复。",

        "history.help.management3":
            "永久删除的购买记录无法恢复，删除前可先确认记录内容。",

        "history.help.close":
            "关闭",

        "history.byDate":
            "🕒 按购买记录",

        "history.byProduct":
            "📦 按商品",

        "history.deleted":
            "🗑 已删除记录",

        "history.categoryAll":
            "分类：全部",

        "history.category":
            "分类：{name}",

        "history.productCount":
            "{count} 件商品",

        "history.month":
            "{year}/{month}（{count}）",

        "history.productMissing":
            "商品信息不可用",

        "history.quantity":
            "数量：",

        "history.viewPurchase":
            "查看价格并购买",

        "history.edit":
            "✏ 编辑",

        "history.delete":
            "🗑 删除",

        "history.favorite":
            "⭐ 常用",

        "history.notFavorite":
            "☆ 常用",

        "history.latest":
            "上次",

        "history.lowest":
            "最低",

        "history.average":
            "平均",

        "history.purchaseCount":
            "购买次数",

        "history.times":
            "{count} 次",

        "history.open":
            "▶ 查看记录",

        "history.close":
            "▼ 收起记录",

        "history.displayPrice":
            "标价：",

        "history.taxExcluded":
            "不含税",

        "history.taxIncluded":
            "含税",

        "history.taxExcludedPrice":
            "不含税价格：",

        "history.taxRate":
            "税率：",

        "history.rounding":
            "取整方式：",

        "history.round":
            "四舍五入",

        "history.floor":
            "向下取整",

        "history.ceil":
            "向上取整",

        "history.discountPercent":
            "🏷 优惠 {value}%",

        "history.discountAmount":
            "🏷 优惠 {price}",

        "history.empty.title":
            "还没有购买记录。",

        "history.empty.text":
            "记录购买后，价格会显示在这里。",

        "history.delete.notFound":
            "未找到要删除的购买记录。",

        "history.delete.confirm":
            "要删除这条购买记录吗？",

        "history.delete.failed":
            "未能删除这条购买记录。",

        "history.edit.notFound":
            "未找到要编辑的购买记录。",

        "history.product.notFound":
            "未找到商品信息。",

        "history.editing":
            "正在编辑购买记录",

        "history.deleted.back":
            "← 返回购买记录",

        "history.deleted.empty":
            "没有已删除的购买记录。",

        "history.deleted.restore":
            "↩ 恢复",

        "history.deleted.permanentDelete":
            "🗑 永久删除",

        "history.deleted.restoreFailed":
            "未能恢复这条购买记录。",

        "history.deleted.confirmPermanent":
            "要永久删除这条购买记录吗？\n\n删除后将无法恢复。",

        "history.deleted.permanentDeleteFailed":
            "未能永久删除这条购买记录。",

        /*
         Settings
        */

        "settings.title":
            "设置",

        "settings.backHome":
            "← 🏠 首页",

        "settings.basic":
            "基本设置",

        "settings.language":
            "🌐 显示语言",

        "settings.baseCountry":
            "🌍 常用购物国家 / 地区",

        "settings.management":
            "管理",

        "settings.category.title":
            "商品分类",

        "settings.category.guide":
            "可添加或编辑添加商品时使用的分类。",

        /*
         Product Categories
        */

        "category.title":
            "商品分类",

        "category.name":
            "分类名称",

        "category.namePlaceholder":
            "例：食品、饮料、日用品",

        "category.save":
            "+ 保存",

        "category.backSettings":
            "← ⚙️ 设置",

        "category.backProduct":
            "← 添加商品",

        "category.list.default":
            "应用默认分类",

        "category.list.user":
            "我的分类",

        "category.list.protected":
            "不可编辑",

        "category.list.edit":
            "✏ 编辑",

        "category.list.delete":
            "🗑 删除",

        "category.validation.nameRequired":
            "请输入分类名称。",

        "category.validation.duplicate":
            "这个分类已经存在。",

        "category.message.editNotFound":
            "未找到要编辑的分类。",

        "category.default.editBlocked":
            "应用默认分类无法修改。",

        "category.default.deleteBlocked":
            "应用默认分类无法删除。",

        "category.confirm.deleteUsed":
            "这个分类正在被已添加商品使用。\n\n要从可选分类中移除吗？\n已添加商品的数据会保留。",

        "category.confirm.delete":
            "要删除这个分类吗？",

        "settings.store.title":
            "购买渠道",

        "settings.store.guide":
            "可添加或编辑超市、药妆店、网店等购买渠道。",

        /*
         Store Management
        */

        "store.title":
            "🏬 管理购买渠道",

        "store.country":
            "国家 / 地区",

        "store.type":
            "渠道类型",

        "store.select":
            "请选择",

        "store.type.supermarket":
            "超市",

        "store.type.convenience":
            "便利店",

        "store.type.drugstore":
            "药妆店",

        "store.type.discount":
            "折扣店",

        "store.type.warehouse-club":
            "仓储会员店",

        "store.type.fixed-price":
            "固定价商店",

        "store.type.home-center":
            "家居建材店",

        "store.type.department-mall":
            "百货商场 / 购物中心",

        "store.type.clothing":
            "服装店",

        "store.type.electronics":
            "家电卖场",

        "store.type.gas-station":
            "加油站",

        "store.type.specialty":
            "专卖店",

        "store.type.online":
            "网上商店",

        "store.type.subscription":
            "订阅服务",

        "store.type.vending":
            "自动售货机",

        "store.type.other":
            "其他",

        "store.region":
            "省 / 州 / 地区",

        "store.city":
            "城市",

        "store.name":
            "购买渠道名称",

        "store.save":
            "+ 保存",

        "store.registered":
            "已添加的购买渠道",

        "store.placeholder.JP.store":
            "例：AEON ○○店",

        "store.placeholder.JP.region":
            "例：东京都",

        "store.placeholder.JP.city":
            "例：港区",

        "store.placeholder.US.store":
            "例：Costco Los Angeles",

        "store.placeholder.US.region":
            "例：California",

        "store.placeholder.US.city":
            "例：Los Angeles",

        "store.placeholder.CA.store":
            "例：Costco Toronto",

        "store.placeholder.CA.region":
            "例：Ontario",

        "store.placeholder.CA.city":
            "例：Toronto",

        "store.placeholder.AU.store":
            "例：Woolworths Sydney",

        "store.placeholder.AU.region":
            "例：New South Wales",

        "store.placeholder.AU.city":
            "例：Sydney",

        "store.placeholder.KR.store":
            "例：이마트 서울점",

        "store.placeholder.KR.region":
            "例：서울특별시",

        "store.placeholder.KR.city":
            "例：강남구",

        "store.placeholder.CN.store":
            "例：沃尔玛上海店",

        "store.placeholder.CN.region":
            "例：上海市",

        "store.placeholder.CN.city":
            "例：浦东新区",

        "store.placeholder.TW.store":
            "例：家樂福台北店",

        "store.placeholder.TW.region":
            "例：臺北市",

        "store.placeholder.TW.city":
            "例：中正區",

        "store.placeholder.OTHER.store":
            "例：购买渠道名称",

        "store.placeholder.OTHER.region":
            "例：州 / 省 / 地区",

        "store.placeholder.OTHER.city":
            "例：城市",

        "store.default.jp.aeon.name":
            "AEON STYLE 品川海滨店",

        "store.default.jp.aeon.region":
            "东京都",

        "store.default.jp.aeon.city":
            "品川区",

        "store.default.jp.life.name":
            "Life Central Square 惠比寿花园广场店",

        "store.default.jp.life.region":
            "东京都",

        "store.default.jp.life.city":
            "涩谷区",

        "store.default.jp.mandai.name":
            "Mandai 涩川店",

        "store.default.jp.mandai.region":
            "大阪府",

        "store.default.jp.mandai.city":
            "东大阪市",

        "store.default.jp.gyomu.name":
            "Gyomu Super 新宿大久保店",

        "store.default.jp.gyomu.region":
            "东京都",

        "store.default.jp.gyomu.city":
            "新宿区",

        "store.default.jp.coop.name":
            "Co-op Mirai 户山店",

        "store.default.jp.coop.region":
            "东京都",

        "store.default.jp.coop.city":
            "新宿区",

        "store.default.jp.lopia.name":
            "Lopia 平井岛忠Homes店",

        "store.default.jp.lopia.region":
            "东京都",

        "store.default.jp.lopia.city":
            "江户川区",

        "store.default.jp.donki.name":
            "MEGA Don Quijote 涩谷本店",

        "store.default.jp.donki.region":
            "东京都",

        "store.default.jp.donki.city":
            "涩谷区",

        "store.default.jp.costco.name":
            "Costco 川崎仓库店",

        "store.default.jp.costco.region":
            "神奈川县",

        "store.default.jp.costco.city":
            "川崎市",

        "store.backSettings":
            "← ⚙️ 设置",

        "store.backProduct":
            "← 📦 添加商品",

        "store.validation.typeRequired":
            "请选择渠道类型。",

        "store.validation.nameRequired":
            "请输入购买渠道名称。",

        "store.validation.duplicate":
            "这个购买渠道已经添加过了。",

        "store.message.saved":
            "购买渠道已保存。",

        "store.message.editNotFound":
            "未找到要编辑的购买渠道。",

        "store.message.updated":
            "购买渠道已更新。",

        "store.message.editMode":
            "正在编辑购买渠道，保存后会更新当前信息。",

        "store.default.editBlocked":
            "这是 Cocartly 默认提供的购买渠道，无法修改。",

        "store.default.deleteBlocked":
            "这是 Cocartly 默认提供的购买渠道，无法删除。",

        "store.confirm.delete":
            "要删除这个购买渠道吗？",

        "store.list.protected":
            "🔒 不可编辑",

        "store.list.default":
            "🔒 默认购买渠道",

        "store.list.added":
            "🏬 我的购买渠道",

        "store.list.empty":
            "还没有添加购买渠道。",

        /*
         Quick Add
        */

        "product.quick.makerRequired":
            "请输入制造商名称。",

        "product.quick.makerExisting":
            "已选择现有制造商。",

        "product.quick.makerAdded":
            "已添加并选择新的制造商。",

        "product.quick.categoryRequired":
            "请输入商品分类名称。",

        "product.quick.categoryExisting":
            "已选择现有商品分类。",

        "product.quick.categoryAdded":
            "商品分类已添加。",

        "product.quick.storeTypeRequired":
            "请选择渠道类型。",

        "product.quick.storeNameRequired":
            "请输入购买渠道名称。",

        "product.quick.storeExisting":
            "已选择现有购买渠道。",

        "product.quick.storeAdded":
            "已添加并选择新的购买渠道。",

        /*
         Data / Backup / Restore
        */

        "settings.data":
            "数据",

        "settings.backup.title":
            "备份数据",

        "settings.backup.guide":
            "可保存 Cocartly 数据，以便更换设备或需要恢复时使用。",

        "settings.restore.title":
            "从备份恢复",

        "settings.restore.guide":
            "可将已备份的 Cocartly 数据恢复到此设备。",

        "backup.message.created":
            "Cocartly 备份已创建。\n\n建议妥善保存此文件，以便更换设备或需要恢复数据时使用。",

        "backup.message.failed":
            "未能创建备份。",

        "restore.message.invalidFile":
            "这个文件不是有效的 Cocartly 备份文件。",

        "restore.confirm":
            "要使用这个备份恢复数据吗？\n\n当前的 Cocartly 数据将被备份中保存的数据替换。\n\n是否继续？",

        "restore.message.completed":
            "Cocartly 数据已恢复。\n\n页面将重新加载。",

        "restore.message.readFailed":
            "未能读取备份文件。\n\n文件可能已损坏，或不是 Cocartly 的备份文件。",

        /*
         App
        */

        "settings.app":
            "应用",

        "settings.about.title":
            "关于 Cocartly",

        "settings.about.guide":
            "可查看 Cocartly 的简介和主要功能。",

        "settings.version":
            "🔖 版本",

        "settings.privacy.title":
            "隐私政策",

        "settings.privacy.guide":
            "可查看 Cocartly 如何处理数据。",

        /*
         About Cocartly
        */

        "about.back":
            "← ⚙️ 设置",

        "about.title":
            "ℹ️ 关于 Cocartly",

        "about.appName":
            "🛒 Cocartly",

        "about.catch":
            "让购物和出行准备更轻松。",

        "about.description":
            "Cocartly 是一款购物辅助应用，可集中管理已添加商品、购物清单、购买记录、价格比较和出行准备清单。",

        "about.features.title":
            "主要功能",

        "about.features.product":
            "添加与管理商品",

        "about.features.code":
            "扫描商品代码",

        "about.features.shopping":
            "购物清单",

        "about.features.history":
            "购买记录 · 价格",

        "about.features.outing":
            "出行清单",

        "about.features.master":
            "商品分类与购买渠道管理",

        "about.features.backup":
            "备份与恢复",

        "about.data.title":
            "关于您的数据",

        "about.data.description":
            "Cocartly 的数据保存在当前设备的浏览器中。为方便更换设备或在数据丢失时进行恢复，建议定期在“设置”中备份数据。",

        /*
         Privacy Policy
        */

        "privacy.back":
            "← ⚙️ 设置",

        "privacy.title":
            "🔒 隐私政策",

        "privacy.intro":
            "Cocartly 重视并妥善处理用户数据。本隐私政策说明 Cocartly 会处理哪些信息，以及这些信息的使用方式。",

        "privacy.section1.title":
            "1. 收集和保存的信息",

        "privacy.section1.text":
            "Cocartly 会处理用户输入的数据，包括商品信息、商品代码、商品分类、购买渠道、购物清单、购买记录、价格信息和出行清单。",

        "privacy.section2.title":
            "2. 使用目的",

        "privacy.section2.text":
            "这些信息用于提供 Cocartly 的各项功能，包括商品管理、购物清单管理、购买记录与价格比较，以及出行前的准备确认。",

        "privacy.section3.title":
            "3. 设备上的数据保存",

        "privacy.section3.text1":
            "在 Cocartly 中添加或记录的数据通常保存在当前使用设备的浏览器中。",

        "privacy.section3.text2":
            "如果浏览器数据被删除或更换设备，已保存的数据可能会丢失。",

        "privacy.section4.title":
            "4. 与外部服务的通信",

        "privacy.section4.text1":
            "部分功能可能会与外部服务通信，例如使用商品代码搜索商品信息时。",

        "privacy.section4.text2":
            "在这种情况下，商品代码等搜索所需的信息可能会发送至相应的外部服务。",

        "privacy.section5.title":
            "5. 备份数据",

        "privacy.section5.text1":
            "使用“备份数据”功能，可以将 Cocartly 数据以 JSON 备份文件的形式保存在设备上。",

        "privacy.section5.text2":
            "备份文件中可能包含商品信息、购买记录和出行信息等数据，建议妥善保存和管理。",

        "privacy.section6.title":
            "6. 账户信息",

        "privacy.section6.text1":
            "Cocartly 目前不提供登录或用户账户功能。",

        "privacy.section6.text2":
            "因此，Cocartly 不会为了登录而登记或保存电子邮箱地址、密码等信息。",

        "privacy.section7.title":
            "7. 访问信息",

        "privacy.section7.text":
            "如果 Cocartly 以 Web 服务形式提供，托管服务可能会在提供服务所需的通信过程中处理 IP 地址、浏览器和设备信息、访问日期和时间等信息。",

        "privacy.section8.title":
            "8. 向第三方提供信息",

        "privacy.section8.text1":
            "除法律法规要求的情况外，Cocartly 的运营方不会将用户登记的数据出售给第三方。",

        "privacy.section8.text2":
            "但在使用外部服务的功能中，为提供相应功能所需的信息可能会发送至相关外部服务。",

        "privacy.section9.title":
            "9. 隐私政策的变更",

        "privacy.section9.text":
            "当 Cocartly 增加功能、变更服务内容或调整所使用的外部服务时，本隐私政策可能会相应更新。",

        "privacy.section10.title":
            "10. 联系方式",

        "privacy.section10.text":
            "Cocartly 正式发布时将提供联系方式。",

        /*
         Device / Orientation
        */

        "device.desktop.only":
            "Cocartly 仅支持智能手机。",

        "device.desktop.unavailable":
            "Cocartly 暂不支持电脑和平板设备。",

        "device.orientation.title":
            "竖屏使用体验更佳",

        "device.orientation.guide":
            "Cocartly 已针对手机竖屏显示进行优化。",

        /*
         Scan Code
        */

        "code.backHome":
            "🏠 首页",

        "code.title":
            "扫码",

        "code.guide":
            "将条形码对准框内即可扫描。",

        "code.success":
            "已扫描",

        "code.waiting":
            "等待扫描…",

        "code.flash":
            "🔦 闪光灯",

        "code.manualInput":
            "⌨ 输入商品代码",

        "code.message.flashComingSoon":
            "闪光灯功能将在今后的更新中提供。",

        "code.message.manualInputComingSoon":
            "手动输入商品代码的功能将在今后的更新中提供。",

        "code.status.align":
            "将条形码对准框中央即可扫描。",

        "code.status.checking":
            "正在确认商品代码…",

        "code.status.success":
            "扫描成功",

        "code.status.searching":
            "正在查找商品信息…",

        "code.status.cameraError":
            "未能启动相机。",

        "code.flashOff":
            "🔦 关闭闪光灯",

        "code.backShopping":
            "🛒 返回购物清单",

        "code.manual.prompt":
            "可输入商品条形码。\n\n支持 8 位、12 位或 13 位数字。",

        "code.manual.required":
            "请输入商品代码。",

        "code.manual.numberOnly":
            "商品代码仅支持数字。",

        "code.manual.invalidLength":
            "商品条形码需要为 8 位、12 位或 13 位数字。",

        "code.status.waiting":
            "等待扫描…",

        "code.status.openManual":
            "正在打开手动添加商品页面…",

        "code.status.openManualError":
            "未能获取商品信息，正在打开手动输入页面…",

        "code.camera.notStarted":
            "相机尚未启动。",

        "code.camera.notFound":
            "未能访问相机。",

        "code.flash.unsupported":
            "当前设备或浏览器不支持闪光灯控制。",

        "code.flash.error":
            "未能更改闪光灯设置。",

        "code.product.notRegistered":
            "这个商品还没有添加。\n\n商品代码：{code}\n\n接下来将打开添加商品页面。",

        "code.product.selected":
            "已通过商品代码选择“{name}”。",

        "code.product.apiNotFound":
            "条形码已成功扫描，但没有找到商品信息。\n\n商品代码：{code}\n\n可填写商品名称等信息后添加商品。",

        "code.product.autoFetchFailed":
            "未能自动获取商品信息。\n\n商品代码：{code}\n\n可填写商品名称等信息后添加商品。",

        "code.product.manualRegistration":
            "未能自动获取商品信息，可填写商品名称等信息后添加商品。",

        "code.product.codeConfirmed":
            "商品代码已确认。\n\n商品代码：{code}\n\n由于没有找到商品信息，接下来将打开添加商品页面。",

        "code.product.searchFailed":
            "未能获取商品信息。\n\n商品代码：{code}\n\n接下来将打开添加商品页面。",

        /*
         Initial Setup
        */

        "setup.welcome":
            "欢迎使用 Cocartly",

        "setup.countryGuide":
            "请选择平时购物所在的国家或地区。",

        "setup.languageLabel":
            "显示语言",

        "setup.countryLabel":
            "常用购物国家 / 地区",

        "language.ja":
            "日语",

        "language.en":
            "英语",

        "language.ko":
            "韩语",

        "language.zh-CN":
            "简体中文",

        "language.zh-TW":
            "繁体中文",

        "language.fr":
            "法语",

        "country.JP":
            "日本",

        "country.US":
            "美国",

        "country.CA":
            "加拿大",

        "country.AU":
            "澳大利亚",

        "country.KR":
            "韩国",

        "country.CN":
            "中国",

        "country.TW":
            "中国台湾",

        "country.OTHER":
            "其他",

        /*
         Outing Checklist
        */

        "outing.title":
            "🎒 出行清单",

        "outing.backHome":
            "← 🏠 首页",

        "outing.help":
            "使用方法",

        "outing.intro.title":
            "出门前确认需要准备的物品",

        "outing.intro.guide":
            "可确认需要携带的物品并做好准备。需要购买的物品也可以加入购物清单。",

        "outing.help.title":
            "关于出行清单",

        "outing.help.whatCanDo":
            "主要功能",

        "outing.help.description1":
            "可为旅行、活动和日常出行创建随身物品清单。",

        "outing.help.description2":
            "可将物品分为“家中已有”和“需要购买”进行管理。",

        "outing.help.description3":
            "需要购买的物品可以加入购物清单，与平时的购物一起管理。",

        "outing.help.description4":
            "经常使用的准备清单可以在今后的出行中重复使用。",

        "outing.help.usefulTitle":
            "这些时候很方便",

        "outing.help.useful1":
            "“不想在旅行时忘带东西”",

        "outing.help.useful2":
            "“想在出门前确认需要准备什么”",

        "outing.help.useful3":
            "“想把已有的物品和需要购买的物品分开管理”",

        "outing.help.useful4":
            "“不想每次都重新输入相同的物品”",

        "outing.help.howTo":
            "使用方法",

        "outing.help.step1":
            "通过“+ 新建出行”可以创建新的出行清单。",

        "outing.help.step2":
            "可添加这次出行需要准备的物品。",

        "outing.help.step3":
            "钱包、毛巾等无需购买、直接携带的物品，可放在“家中已有”中管理。",

        "outing.help.step4":
            "出行前需要购买的物品，可放在“需要购买”中管理。可以选择已添加商品，也可以通过商品代码查找。",

        "outing.help.step5":
            "需要购买的物品可以加入购物清单。购买完成后，出行清单中的对应物品也会自动变为“已准备”。",

        "outing.help.step6":
            "可根据需要在“未准备”“已准备”和“暂缓”之间切换物品状态。",

        "outing.help.step7":
            "之后需要增加物品时，也可以通过“+ 添加”继续添加。",

        "outing.help.management":
            "管理出行",

        "outing.help.managementUpcoming":
            "“计划”中会显示接下来的出行。",

        "outing.help.managementRoutine":
            "“常用”中会显示经常使用的出行和物品。",

        "outing.help.managementPast":
            "“过去”中会显示已经结束的出行。",

        "outing.create":
            "+ 新建出行",

        "outing.tab.upcoming":
            "计划",

        "outing.tab.routine":
            "常用",

        "outing.tab.past":
            "过去",

        "outing.empty.upcoming":
            "还没有计划中的出行。",

        "outing.empty.routine":
            "还没有常用出行。",

        "outing.empty.past":
            "还没有过去的出行。",

        "outing.empty.default":
            "这里还没有内容。",

        "outing.create.back":
            "← 🎒 出行清单",

        "outing.create.title":
            "+ 新建出行",

        "outing.create.question":
            "这次要去哪里？",

        "outing.create.guide":
            "可以取一个容易辨认的名称，例如“旅行”或“棒球比赛”。",

        "outing.create.name":
            "出行名称",

        "outing.create.namePlaceholder":
            "例：棒球比赛",

        "outing.create.type":
            "出行类型",

        "outing.create.scheduled":
            "单次",

        "outing.create.routine":
            "定期",

        "outing.create.typeGuide":
            "旅行、棒球比赛等可选择“单次”，上班、上学等经常重复的出行可选择“定期”。",

        "outing.create.date":
            "出行日期",

        "outing.create.item":
            "携带物品",

        "outing.create.itemPlaceholder":
            "例：门票",

        "outing.create.addItem":
            "+ 添加物品",

        "outing.create.noItems":
            "还没有添加物品。",

        "outing.create.save":
            "保存",

        "outing.message.itemRequired":
            "请输入需要携带的物品。",

        "outing.message.itemDuplicate":
            "这个物品已经添加过了。",

        "outing.message.itemAdded":
            "物品已添加。",

        "outing.message.nameRequired":
            "请输入出行名称。",

        "outing.message.dateRequired":
            "请选择出行日期。",

        "outing.message.itemsRequired":
            "请至少添加一件物品。",

        "outing.message.nameDuplicate":
            "已经有同名的出行了。",

        "outing.message.purchaseAdded":
            "已添加到“需要购买”。",

        "outing.message.itemRegisteredDuplicate":
            "这个物品已经添加过了。",

        "outing.message.purchaseRequired":
            "请输入需要购买的物品。",

        "outing.message.productRequired":
            "请选择商品。",

        "outing.message.quantityInvalid":
            "数量需要为 1 或以上。",

        "outing.message.productNotFound":
            "未找到商品。",

        "outing.message.productLinkedDuplicate":
            "这个商品已经关联到其他物品。",

        "outing.message.productDuplicate":
            "这个商品已经作为物品添加过了。",

        "outing.message.registeredProductSelected":
            "已选择已添加商品：“{name}”",

        "outing.create.deleteItem":
            "🗑 删除",

        "outing.check.back":
            "← 🎒 出行清单",

        "outing.check.title":
            "出行清单",

        "outing.check.pending":
            "未准备",

        "outing.check.ready":
            "已准备",

        "outing.check.hold":
            "暂缓",

        "outing.check.add":
            "+ 添加",

        "outing.check.complete":
            "✓ 完成出行",

        "outing.check.completeGuide":
            "完成后，这次出行会移至“过去”。",

        "outing.items.emptyStatus":
            "这个状态下还没有物品。",

        "outing.items.home":
            "🏠 家中已有",

        "outing.items.purchase":
            "🛒 需要购买",

        "outing.items.purchased":
            "🛒 已购买",

        "outing.items.emptyGroup":
            "这一组还没有物品。",

        "outing.items.quantity":
            "数量：{quantity}",

        "outing.items.readyFromShopping":
            "已购买 · 已准备",

        "outing.items.chooseProduct":
            "🔗 选择商品",

        "outing.items.addToShopping":
            "🛒 添加到购物清单",

        "outing.items.selectProductGuide":
            "选择商品后，可以将其添加到购物清单。",

        "outing.items.ready":
            "✓ 设为已准备",

        "outing.items.hold":
            "设为暂缓",

        "outing.items.backPending":
            "设为未准备",

        "outing.items.delete":
            "🗑 删除此物品",

        "outing.message.alreadyAddedToShopping":
            "这个物品已经在购物清单中。",

        "outing.confirm.deleteItem":
            "要从这次出行中删除以下物品吗？\n\n“{name}”",

        "outing.confirm.deleteLinkedItem":
            "\n\n这个物品也在购物清单中。\n这里只会解除与这次出行的关联，购物清单中的商品会保留。",

        "outing.add.homeTitle":
            "🏠 家中已有 / 自定义物品",

        "outing.add.item":
            "携带物品",

        "outing.add.itemPlaceholder":
            "例：钱包、毛巾、饮料",

        "outing.add.itemButton":
            "+ 添加物品",

        "outing.add.purchaseTitle":
            "🛒 需要购买",

        "outing.add.purchaseGuide":
            "即使还没有确定具体商品，也可以先添加“饮料”“充电器”等需要购买的物品。",

        "outing.add.purchase":
            "需要购买的物品",

        "outing.add.purchasePlaceholder":
            "例：饮料、充电器、电池",

        "outing.add.purchaseButton":
            "+ 添加待购物品",

        "outing.add.selectMethod":
            "选择商品",

        "outing.add.registered":
            "① 选择已添加商品",

        "outing.add.category":
            "商品分类",

        "outing.add.allCategories":
            "全部分类",

        "outing.add.product":
            "商品",

        "outing.add.selectProduct":
            "请选择商品",

        "outing.add.code":
            "② 通过商品代码查找",

        "outing.add.codeGuide":
            "知道商品代码时，可以使用相机查找商品。",

        "outing.add.scan":
            "📷 扫描商品代码",

        "outing.add.quantity":
            "数量",

        "outing.add.productButton":
            "+ 将商品添加到物品",

        "outing.productSelect.back":
            "← 返回未准备",

        "outing.productSelect.title":
            "🔗 选择商品",

        "outing.productSelect.guide":
            "为“{name}”选择准备购买的商品。",

        "outing.productSelect.selectButton":
            "选择此商品",

        "outing.scan.back":
            "← 出行清单",

        "outing.past.back":
            "← 🎒 过去的出行",

        "outing.past.title":
            "过去的出行",

        "outing.past.items":
            "携带物品",

        "outing.past.yearMonth":
            "{year}/{month}",

        "outing.past.count":
            "{count} 次出行",

        "outing.past.countOne":
            "{count} 次出行",

        "outing.past.itemCount":
            "{count} 件物品",

        "outing.past.itemCountOne":
            "{count} 件物品",

        "outing.past.noDate":
            "未记录日期",

        "outing.past.noItems":
            "没有记录物品。",

        "outing.past.reuse":
            "🔁 再次使用这次出行",

        "outing.past.delete":
            "🗑 删除这条过去的出行",

        "outing.past.reuseSuffix":
            "（再次使用）",

        "outing.confirm.complete":
            "要完成这次出行吗？\n\n“{name}”\n\n完成后会移至“过去”。",

        "outing.message.copied":
            "已复制过去的出行。选择日期并保存后即可再次使用。",

        "outing.confirm.deletePast":
            "要从“过去”中删除以下出行吗？\n\n“{name}”\n\n删除后将无法恢复。\n\n已添加商品和购买记录不会被删除。",

        "outing.message.addedToShopping":
            "已将“{name}”添加到购物清单。"
    },


    "zh-TW": {
        "common.start": "開始使用",
        "common.cancel": "取消",
        "common.save": "儲存",
        "common.close": "關閉",

        "home.catch": "讓購物與外出準備更輕鬆。",
        "home.code": "掃碼",
        "home.product": "新增商品",
        "home.shopping": "購物清單",
        "home.history": "購買紀錄 · 價格",
        "home.outing": "外出清單",
        "home.notice": "公告",
        "home.settings": "設定",

        "notice.backHome": "← 🏠 首頁",
        "notice.title": "✉️ 公告",
        "notice.development.title":
            "Cocartly 持續開發中",
        "notice.development.text":
            "我們正在持續改善 Cocartly 的首頁與各項功能，讓操作更簡單、更好用。",

        "product.title": "新增商品",
        "product.backHome": "← 🏠 首頁",
        "product.help": "使用方法",

        "product.name": "商品名稱",
        "product.namePlaceholder": "例：洗髮精",

        "product.code": "商品代碼",
        "product.codePlaceholder":
            "掃描條碼時會自動輸入",
        "product.codeGuide":
            "※ 有條碼的商品可使用「掃碼」新增。",

        "product.category": "商品分類",
        "product.categoryManage": "⚙ 管理商品分類",

        "category.default.food": "食品",
        "category.default.drink": "飲料",
        "category.default.snack": "零食",
        "category.default.alcohol": "酒類",
        "category.default.daily": "日用品",
        "category.default.hygiene": "清潔與衛生用品",
        "category.default.medicine": "藥品",
        "category.default.beauty": "美妝與保養",
        "category.default.clothing": "服飾",
        "category.default.baby": "嬰幼兒用品",
        "category.default.pet": "寵物用品",
        "category.default.stationery": "文具與雜貨",
        "category.default.electronics": "家電與電池",
        "category.default.other": "其他",

        "product.country": "國家 / 地區",

        "product.store": "購買通路",
        "product.storeManage": "🏬 管理購買通路",

        "product.volume": "數量 / 容量",
        "product.volumeExample": "輸入範例",
        "product.volumePlaceholder": "例：400",

        "product.volumeExampleTitle":
            "數量 / 容量與單位輸入範例",
        "product.volumeExampleEgg":
            "🥚 L 號雞蛋 10 顆",
        "product.volumeExampleEggDetail":
            "數量 / 容量：10 / 單位：個",
        "product.volumeExampleMilk":
            "🥛 牛奶 1000 mL",
        "product.volumeExampleMilkDetail":
            "數量 / 容量：1000 / 單位：mL",
        "product.volumeExampleRice":
            "🍚 白米 5 kg",
        "product.volumeExampleRiceDetail":
            "數量 / 容量：5 / 單位：kg",
        "product.volumeExampleBread":
            "🍞 吐司 6 片",
        "product.volumeExampleBreadDetail":
            "數量 / 容量：6 / 單位：片",

        "product.unit": "單位",
        "product.select": "請選擇",

        "product.unit.each": "個",
        "product.unit.sheet": "片",
        "product.unit.bottle": "瓶",
        "product.unit.bag": "袋",
        "product.unit.box": "盒",
        "product.unit.pack": "包",
        "product.unit.roll": "捲",

        "product.price": "價格（含稅）",
        "product.priceCalc": "價格計算",
        "product.pricePlaceholder": "例：298",

        "product.shareTitle":
            "分享到 Cocartly 商品資料庫",
        "product.shareDescription":
            "可分享商品名稱、商品代碼、商品分類等資訊。價格與購買通路不會被分享。",
        "product.shareThanks":
            "感謝您協助完善 Cocartly 的商品資訊。",

        "product.save": "儲存",
        "product.cancelEdit": "✕ 取消編輯",
        "product.deletedItems": "🗑 已刪除商品",
        "product.registered": "已新增商品",
        "product.allCategories": "分類：全部",

        "product.validation.volumeNeedsUnit":
            "輸入數量或容量時，也需要選擇單位。",
        "product.validation.unitNeedsVolume":
            "選擇單位時，也需要輸入數量或容量。",
        "product.validation.nameRequired":
            "請輸入商品名稱。",
        "product.validation.categoryRequired":
            "請選擇商品分類。",
        "product.validation.storeRequired":
            "請選擇購買通路。",
        "product.validation.priceInvalid":
            "價格需為 0 以上。",

        "product.message.saved":
            "✓ 已儲存",
        "product.message.savedOffline":
            "✓ 已儲存在此裝置。連上網路後即可同步。",
        "product.message.editCancelled":
            "已取消編輯商品。",

        "settings.title": "設定",
        "settings.backHome": "← 🏠 首頁",

        "settings.basic": "基本設定",
        "settings.language": "🌐 顯示語言",
        "settings.baseCountry": "🌍 常用購物國家 / 地區",

        "settings.management": "管理",

        "settings.category.title": "商品分類",
        "settings.category.guide":
            "新增或編輯商品時使用的分類。",

        "settings.store.title": "購買通路",
        "settings.store.guide":
            "新增或編輯超級市場、藥妝店等購買通路。",

        "settings.data": "資料",

        "settings.backup.title": "備份資料",
        "settings.backup.guide":
            "備份 Cocartly 資料，以便更換裝置或需要還原時使用。",

        "settings.restore.title": "從備份還原",
        "settings.restore.guide":
            "將備份中的 Cocartly 資料還原到此裝置。",

        "settings.app": "App",

        "settings.about.title": "關於 Cocartly",
        "settings.about.guide":
            "查看 Cocartly 的簡介與主要功能。",

        "settings.version": "🔖 版本",

        "settings.privacy.title": "隱私權政策",
        "settings.privacy.guide":
            "了解 Cocartly 如何處理您的資料。",

        "setup.welcome": "歡迎使用 Cocartly",
        "setup.countryGuide":
            "請選擇平常購物所在的國家或地區。",

        "setup.languageLabel": "顯示語言",
        "setup.countryLabel":
            "常用購物國家 / 地區",

        "language.ja": "日文",
        "language.en": "英文",
        "language.ko": "韓文",
        "language.zh-CN": "簡體中文",
        "language.zh-TW": "繁體中文",
        "language.fr": "法文",

        "country.JP": "日本",
        "country.US": "美國",
        "country.CA": "加拿大",
        "country.AU": "澳洲",
        "country.KR": "韓國",
        "country.CN": "中國",
        "country.TW": "台灣",
        "country.OTHER": "其他",

        "product.help.title":
            "關於新增商品",

        "product.help.featureTitle":
            "主要功能",

        "product.help.feature1":
            "可新增商品名稱、商品代碼、商品分類、購買通路、數量或容量等商品資訊。",

        "product.help.feature2":
            "有條碼的商品可使用「掃碼」新增。下次掃描相同條碼時，Cocartly 會自動辨識已新增的商品。",

        "product.help.feature3":
            "記錄購買通路與價格後，可在「購買紀錄 · 價格」查看過去的價格。",

        "product.help.feature4":
            "已新增的商品在記錄購買前，可先查看上次價格、最低價格、平均價格與過去的購買通路。",

        "product.help.usefulTitle":
            "適合這些情況",

        "product.help.useful1":
            "「想把經常購買的商品存起來」",

        "product.help.useful2":
            "「查看這項商品上次買多少錢」",

        "product.help.useful3":
            "「查看哪個購買通路的價格最低」",

        "product.help.useful4":
            "遇到這些情況時，Cocartly 都能幫上忙。",

        "product.help.howToTitle":
            "使用方法",

        "product.help.step1":
            "有條碼的商品可從首頁的「掃碼」進行掃描。",

        "product.help.step2":
            "新增商品時，可確認商品名稱、商品分類、購買通路、數量或容量等資訊後再儲存。",

        "product.help.step3":
            "蔬菜、熟食、秤重商品等沒有條碼的商品，可從首頁的「＋ 新增商品」新增。",

        "product.help.step4":
            "再次購買已新增的商品時，可掃描條碼，或從「已新增商品」選擇「查看價格並購買」。",

        "product.help.step5":
            "可先查看上次價格、最低價格、平均價格，以及過去的購買通路與價格。",

        "product.help.step6":
            "確定購買時，可選擇「購買並記錄價格」，再輸入購買通路、本次價格與數量。",

        "product.help.step7":
            "這次不購買時，可選擇「本次不購買」。",

        "product.help.step8":
            "記錄完成的購買內容會自動加入「購買紀錄 · 價格」。",

        "product.help.close":
            "關閉",

        "product.tax.displayPrice":
            "顯示價格",

        "product.tax.priceType":
            "價格類型",

        "product.tax.taxIncluded":
            "含稅",

        "product.tax.taxExcluded":
            "未稅",

        "product.tax.taxRate":
            "稅率",

        "product.tax.customTaxRate":
            "稅率（%）",

        "product.tax.jpGuide":
            "可選擇日本適用的稅率。",

        "product.tax.overseasGuide":
            "可依地區與商品類型輸入適用的稅率。",

        "product.tax.rounding":
            "小數處理",

        "product.tax.round":
            "四捨五入",

        "product.tax.floor":
            "無條件捨去",

        "product.tax.ceil":
            "無條件進位",

        "product.tax.discount":
            "折扣",

        "product.tax.discountNone":
            "無折扣",

        "product.tax.discountPercent":
            "% OFF",

        "product.tax.discountAmountLabel":
            "{currency} OFF",

        "product.tax.discountAmount":
            "折扣金額",

        "product.tax.discountValue":
            "折扣值",

        "product.tax.finalPrice":
            "最終價格：{price}",

        "product.tax.usePrice":
            "使用此價格",

        "product.tax.close":
            "關閉",

        "product.tax.examplePrefix":
            "例：",

        "product.tax.discountValuePlaceholder":
            "例：20",

        "product.tax.inputError":
            "輸入內容似乎有誤，請再確認一次。",

        "product.list.title":
            "已新增商品",

        "product.list.allCategories":
            "分類：全部",

        "product.list.categoryPrefix":
            "分類：",

        "product.list.count":
            "共 {count} 項",

        "product.list.countOne":
            "共 {count} 項",

        "product.list.empty":
            "目前還沒有已新增的商品。",

        "product.list.month":
            "{year}/{month}",

        "product.list.code":
            "商品代碼",

        "product.list.category":
            "分類",

        "product.list.store":
            "購買通路",

        "product.list.volume":
            "數量 / 容量",

        "product.list.price":
            "價格",

        "product.list.registeredDate":
            "新增日期",

        "product.list.favorite":
            "常用",

        "product.list.checkPrice":
            "查看價格並購買",

        "product.list.edit":
            "✏ 編輯",

        "product.list.delete":
            "🗑 刪除",

        "product.deleted.title":
            "已刪除商品",

        "product.deleted.button":
            "🗑 已刪除商品（{count}）",

        "product.deleted.back":
            "← 📦 新增商品",

        "product.deleted.restore":
            "♻ 還原",

        "product.deleted.permanentDelete":
            "🗑 永久刪除",

        "product.message.editMode":
            "目前正在編輯商品。儲存後會更新商品資訊。",

        "product.message.registrationCancelled":
            "已取消新增商品。",

        "product.message.alreadyRegistered":
            "這項商品已經新增過，不需要再次新增。",

        "product.confirm.alreadyRegistered":
            "這項商品已經新增過。\n\n商品：{name}\n\n同一項商品無法重複新增。",

        "product.confirm.delete":
            "要刪除這項商品嗎？",

        "product.confirm.deletedFound":
            "這項商品目前在「已刪除商品」中。\n\n商品：{name}\n\n要還原這項商品，而不是重新新增嗎？",

        "product.confirm.permanentDelete":
            "要永久刪除這項商品嗎？\n\n商品：{name}\n\n刪除後將無法還原。",

        "product.registered.backHistory":
            "← 📊 購買紀錄 · 價格",

        "product.registered.backProduct":
            "← 📦 新增商品",

        "product.registered.notFound":
            "找不到已新增的商品資訊。",

        "product.registered.code":
            "商品代碼：{code}",

        "product.registered.noCode":
            "無商品代碼",

        "product.registered.noRecord":
            "尚未記錄",

        "product.registered.noHistory":
            "目前還沒有價格紀錄。",

        "product.registered.title":
            "已新增商品",

        "product.registered.latest":
            "上次",

        "product.registered.lowest":
            "最低",

        "product.registered.average":
            "平均",

        "product.registered.historyTitle":
            "🏬 過去的購買通路與價格",

        "product.registered.buy":
            "🛒 購買並記錄價格",

        "product.registered.skip":
            "本次不購買",

        /*
         Shopping List
        */

        "shopping.title":
            "🛒 購物清單",

        "shopping.backHome":
            "← 🏠 首頁",

        "shopping.help":
            "使用方法",

        "shopping.help.title":
            "關於購物清單",

        "shopping.help.featureTitle":
            "主要功能",

        "shopping.help.feature1":
            "可將預計購買的商品加入清單，購物時方便逐項確認。",

        "shopping.help.feature2":
            "可將商品分為「待購買」、「已購買」或「暫緩」管理。",

        "shopping.help.feature3":
            "已新增商品和尚未新增的商品都能加入購物清單。",

        "shopping.help.feature4":
            "在商品詳情中，可查看上次、最低與平均價格，也能記錄今天在門市確認到的販售狀況與價格。",

        "shopping.help.usefulTitle":
            "適合這些情況",

        "shopping.help.useful1":
            "「不想漏掉今天要買的東西」",

        "shopping.help.useful2":
            "「想確認已經買了什麼、還有哪些沒買」",

        "shopping.help.useful3":
            "「想看看是不是比上次便宜」",

        "shopping.help.useful4":
            "「缺貨的商品想先暫緩購買」",

        "shopping.help.howToTitle":
            "使用方法",

        "shopping.help.step1":
            "可從「＋ 新增」將商品加入購物清單。",

        "shopping.help.step2":
            "可選擇已新增商品，或直接輸入新的商品名稱。需要時也能輸入商品代碼與預計數量。",

        "shopping.help.step3":
            "選擇「待購買」中的商品後，可查看商品詳情。",

        "shopping.help.step4":
            "有購買紀錄的商品，可查看上次、最低與平均價格。",

        "shopping.help.step5":
            "使用「記錄今日門市資訊」，可儲存今天在門市確認到的販售狀況與價格。",

        "shopping.help.step6":
            "商品購買完成後，可選擇「✓ 已購買」。",

        "shopping.help.step7":
            "這次不購買的商品可移至「暫緩」，之後也能再改回「待購買」。",

        "shopping.help.step8":
            "使用「從購物清單移除」只會移除購物清單中的項目，已新增商品與過去的購買紀錄都會保留。",

        "shopping.help.step9":
            "購物完成後，可選擇「結束購物」。",

        "shopping.help.close":
            "關閉",

        "shopping.pending":
            "待購買",

        "shopping.purchased":
            "已購買",

        "shopping.hold":
            "暫緩",

        "shopping.addTab":
            "＋ 新增",

        "shopping.remaining":
            "剩餘",

        "shopping.itemUnit":
            "項",

        "shopping.remainingSummary":
            "剩餘 {count} 項",

        "shopping.remainingSummaryOne":
            "剩餘 {count} 項",

        "shopping.add.title":
            "加入購物清單",

        "shopping.favorite":
            "⭐ 常用",

        "shopping.all":
            "全部",

        "shopping.registeredProduct":
            "已新增商品",

        "shopping.selectProduct":
            "選擇商品",

        "shopping.or":
            "或",

        "shopping.productName":
            "商品名稱",

        "shopping.productNamePlaceholder":
            "例：高麗菜",

        "shopping.code":
            "商品代碼（如已知）",

        "shopping.codePlaceholder":
            "不知道時可留白",

        "shopping.scanCode":
            "📷 掃描商品代碼",

        "shopping.codeGuide":
            "可手動輸入，也能使用相機掃描。",

        "shopping.quantity":
            "預計數量",

        "shopping.add":
            "＋ 加入購物清單",

        "shopping.finish":
            "結束購物",

        "shopping.empty.pending":
            "目前沒有待購買的商品。",

        "shopping.empty.purchased":
            "目前沒有已購買的商品。",

        "shopping.empty.hold":
            "目前沒有暫緩的商品。",

        "shopping.empty.favorite":
            "目前還沒有常用商品。",

        "shopping.empty.category":
            "這個分類目前沒有商品。",

        "shopping.validation.selectOrName":
            "請選擇已新增商品，或輸入商品名稱。",

        "shopping.validation.quantity":
            "數量需為 1 以上。",

        "shopping.validation.duplicateCode":
            "這個商品代碼已用於其他已新增商品。",

        "shopping.validation.duplicateCodeDetail":
            "這個商品代碼已用於其他已新增商品。\n\n商品：{name}\n\n可從「已新增商品」加入購物清單。",

        "shopping.message.added":
            "已加入購物清單。",

        "shopping.message.unregisteredAdded":
            "尚未新增的商品已加入購物清單。",

        "shopping.productNameUnset":
            "未設定商品名稱",

        "shopping.previousPurchaseNone":
            "沒有上次購買紀錄",

        "shopping.previousPurchase":
            "上次購買：{store}",

        "shopping.quantityDisplay":
            "數量 {quantity}",

        "shopping.finish.noPurchased":
            "目前沒有已購買的商品。",

        "shopping.finish.pendingWarning":
            "還有 {count} 項商品在「待購買」。\n\n可能還有商品尚未確認。\n\n仍要結束購物嗎？",

        "shopping.finish.pendingWarningOne":
            "還有 {count} 項商品在「待購買」。\n\n可能還有商品尚未確認。\n\n仍要結束購物嗎？",

        "shopping.finish.itemCount":
            "{count} 項",

        "shopping.finish.itemCountOne":
            "{count} 項",

        "shopping.finish.confirm":
            "要結束這次購物嗎？\n\n已購買：{purchasedText}\n待購買：{pendingText}\n暫緩：{holdText}\n\n確認以上購買結果嗎？",

        "shopping.finish.missingInfo":
            "部分商品缺少儲存購買紀錄所需的門市資訊。\n\n以下商品需要記錄「有販售」與含稅價格。\n\n• {names}",

        "shopping.finish.completed":
            "購物完成。\n\n已儲存至購買紀錄：{historyText}\n新增加入商品：{registeredText}",

        /*
         Shopping List - Product Details
        */

        "shopping.detail.back":
            "🛒 ← 購物清單",

        "shopping.detail.title":
            "商品詳情",

        "shopping.detail.unregistered":
            "尚未新增的商品",

        "shopping.detail.quantity":
            "預計數量：",

        "shopping.detail.code":
            "商品代碼",

        "shopping.detail.codePlaceholder":
            "不知道時可留白",

        "shopping.detail.saveCode":
            "儲存商品代碼",

        "shopping.detail.codeSaved":
            "商品代碼已儲存。",

        "shopping.detail.codeSavedEmpty":
            "商品代碼已清除。",

        "shopping.detail.latest":
            "上次",

        "shopping.detail.lowest":
            "最低",

        "shopping.detail.average":
            "平均",

        "shopping.detail.taxIncludedShort":
            "含稅",

        "shopping.detail.noHistory":
            "目前還沒有購買紀錄。",

        "shopping.detail.previousStoreNone":
            "沒有上次購買紀錄",

        "shopping.detail.previousStore":
            "上次購買：{store}",

        /*
         Today's Store Info
        */

        "shopping.store.title":
            "今日門市資訊",

        "shopping.store.store":
            "購買通路",

        "shopping.store.previous":
            "上次購買通路",

        "shopping.store.recent":
            "最近使用的購買通路",

        "shopping.store.search":
            "🔍 尋找其他購買通路",

        "shopping.store.country":
            "國家 / 地區",

        "shopping.store.allCountries":
            "所有國家 / 地區",

        "shopping.store.region":
            "州 / 地區",

        "shopping.store.allRegions":
            "所有地區",

        "shopping.store.name":
            "購買通路名稱",

        "shopping.store.searchPlaceholder":
            "例：台北、家樂福、Target",

        "shopping.store.allStores":
            "所有購買通路",

        "shopping.store.select":
            "選擇購買通路",

        "shopping.store.availability":
            "販售狀況",

        "shopping.store.available":
            "○ 有販售",

        "shopping.store.soldout":
            "△ 售完",

        "shopping.store.notavailable":
            "× 未販售",

        "shopping.store.unknown":
            "? 未確認",

        "shopping.store.taxExcluded":
            "未稅價格",

        "shopping.store.taxExcludedShort":
            "未稅",

        "shopping.store.taxIncluded":
            "含稅價格",

        "shopping.store.taxIncludedKnown":
            "如已知",

        "shopping.store.examplePrefix":
            "例：",

        "shopping.store.priceCalc":
            "價格計算",

        "shopping.store.priceType":
            "價格類型",

        "shopping.store.priceTypeExcluded":
            "未稅",

        "shopping.store.priceTypeIncluded":
            "含稅",

        "shopping.store.taxRate":
            "稅率",

        "shopping.store.customTaxRate":
            "稅率（%）",

        "shopping.store.rounding":
            "小數處理",

        "shopping.store.round":
            "四捨五入",

        "shopping.store.floor":
            "無條件捨去",

        "shopping.store.ceil":
            "無條件進位",

        "shopping.store.discount":
            "折扣",

        "shopping.store.discountNone":
            "無折扣",

        "shopping.store.discountPercent":
            "% OFF",

        "shopping.store.discountAmount":
            "{currency} OFF",

        "shopping.store.discountValue":
            "折扣",

        "shopping.store.usePrice":
            "使用此價格",

        "shopping.store.close":
            "關閉",

        "shopping.store.save":
            "記錄今日門市資訊",

        "shopping.store.saved":
            "門市資訊已儲存。",

        "shopping.store.noChecks":
            "目前還沒有門市資訊紀錄。",

        "shopping.store.cheapest":
            "★ 最低",

        "shopping.store.checked":
            "確認日期：{date}",

        "shopping.store.noResults":
            "找不到符合條件的購買通路。",

        "shopping.store.tooMany":
            "符合條件的結果較多，目前顯示前 10 筆。縮小搜尋範圍後會更容易找到。",

        "shopping.detail.purchased":
            "✓ 已購買",

        "shopping.detail.hold":
            "移至暫緩",

        "shopping.detail.holdMessage":
            "已移至「暫緩」。\n\n14 天後將永久刪除。",

        "shopping.detail.returnPending":
            "改回待購買",

        "shopping.detail.delete":
            "🗑 從購物清單移除",

        "shopping.detail.deleteGuide":
            "已新增商品與過去的購買紀錄都會保留。",

        "shopping.detail.deleteConfirm":
            "要從購物清單移除這項商品嗎？\n\n已新增商品與過去的購買紀錄都會保留。",

        /*
         Purchase Details
        */

        "purchase.backProduct":
            "← 返回商品",

        "purchase.backHistory":
            "← 返回購買紀錄 · 價格",

        "purchase.backPurchase":
            "← 返回購買詳情",

        "purchase.backPurchaseScan":
            "🛒 購買詳情",

        "purchase.title":
            "🛒 購買詳情",

        "purchase.productName":
            "商品名稱",

        "purchase.previousPrice":
            "上次價格",

        "purchase.noRecord":
            "尚未記錄",

        "purchase.code":
            "商品代碼",

        "purchase.codePlaceholder":
            "不知道時可留白",

        "purchase.scanCode":
            "📷 掃描商品代碼",

        "purchase.codeGuide":
            "可使用相機掃描，也能稍後輸入或修改。",

        "purchase.store":
            "購買通路",

        "purchase.previousStore":
            "上次購買通路",

        "purchase.recentStores":
            "最近使用的購買通路",

        "purchase.searchStore":
            "🔍 尋找其他購買通路",

        "purchase.country":
            "國家 / 地區",

        "purchase.allCountries":
            "所有國家 / 地區",

        "purchase.region":
            "州 / 地區",

        "purchase.allRegions":
            "所有地區",

        "purchase.storeName":
            "購買通路名稱",

        "purchase.storeSearchPlaceholder":
            "例：台北、家樂福、Target",

        "purchase.allStores":
            "所有購買通路",

        "purchase.selectStore":
            "選擇購買通路",

        "purchase.manageStores":
            "🏬 管理購買通路",

        "purchase.currentPrice":
            "本次價格（含稅）",

        "purchase.priceCalc":
            "價格計算",

        "purchase.taxExcluded":
            "未稅價格",

        "purchase.taxRate":
            "稅率",

        "purchase.customTaxRate":
            "稅率（%）",

        "purchase.rounding":
            "小數處理",

        "purchase.round":
            "四捨五入",

        "purchase.floor":
            "無條件捨去",

        "purchase.ceil":
            "無條件進位",

        "purchase.discount":
            "折扣",

        "purchase.discountNone":
            "無折扣",

        "purchase.discountPercent":
            "% OFF",

        "purchase.discountAmount":
            "{currency} OFF",

        "purchase.discountValue":
            "折扣金額 / 折扣率",

        "purchase.taxIncludedResult":
            "含稅價格：-",

        "purchase.usePrice":
            "使用此價格",

        "purchase.close":
            "關閉",

        "purchase.quantity":
            "數量",

        "purchase.save":
            "記錄購買",

        "purchase.taxGuide.jp":
            "可選擇日本適用的稅率。",

        "purchase.taxGuide.other":
            "可依地區與商品類型輸入適用的稅率。",

        "purchase.validation.store":
            "請選擇購買通路。",

        "purchase.validation.price":
            "請輸入本次價格。",

        "purchase.validation.duplicateCode":
            "這個商品代碼已用於其他商品。",

        "purchase.error.save":
            "未能記錄這次購買。",

        /*
         History & Price
        */

        "history.backHome":
            "← 🏠 首頁",

        "history.title":
            "📊 購買紀錄 · 價格",

        "history.help":
            "使用方法",

        "history.help.title":
            "關於購買紀錄 · 價格",

        "history.help.featureTitle":
            "主要功能",

        "history.help.feature1":
            "可依購買日期或商品查看購買紀錄。",

        "history.help.feature2":
            "可查看上次、最低與平均價格，以及過去的購買通路與價格。",

        "history.help.feature3":
            "決定現在是否購買商品時，可比較過去的價格。",

        "history.help.usefulTitle":
            "適合這些情況",

        "history.help.useful1":
            "「想知道上次買多少錢」",

        "history.help.useful2":
            "「想看看哪個購買通路的價格最低」",

        "history.help.useful3":
            "「想確認價格是不是變貴了」",

        "history.help.useful4":
            "「想參考過去價格，決定這次要不要買」",

        "history.help.howToTitle":
            "使用方法",

        "history.help.step1":
            "在「依購買時間」中，可依時間順序查看購買內容。",

        "history.help.step2":
            "在「依商品」中，相同商品的購買紀錄會整理在一起，也能依商品分類篩選。",

        "history.help.step3":
            "想查看商品價格時，可選擇「查看價格並購買」。",

        "history.help.step4":
            "可查看上次、最低與平均價格，以及過去的購買通路與價格。",

        "history.help.step5":
            "確定購買時，可輸入本次購買內容並記錄購買。",

        "history.help.step6":
            "這次不購買時，可選擇「本次不購買」。",

        "history.help.step7":
            "記錄購買後，新價格會自動加入「購買紀錄 · 價格」。",

        "history.help.managementTitle":
            "管理購買紀錄",

        "history.help.management1":
            "如果購買紀錄有誤，可以稍後編輯。",

        "history.help.management2":
            "已刪除的紀錄可從「已刪除紀錄」查看並還原。",

        "history.help.management3":
            "永久刪除的購買紀錄無法還原，刪除前可先確認內容。",

        "history.help.close":
            "關閉",

        "history.byDate":
            "🕒 依購買時間",

        "history.byProduct":
            "📦 依商品",

        "history.deleted":
            "🗑 已刪除紀錄",

        "history.categoryAll":
            "分類：全部",

        "history.category":
            "分類：{name}",

        "history.productCount":
            "{count} 項商品",

        "history.month":
            "{year}/{month}（{count}）",

        "history.productMissing":
            "無法取得商品資訊",

        "history.quantity":
            "數量：",

        "history.viewPurchase":
            "查看價格並購買",

        "history.edit":
            "✏ 編輯",

        "history.delete":
            "🗑 刪除",

        "history.favorite":
            "⭐ 常用",

        "history.notFavorite":
            "☆ 常用",

        "history.latest":
            "上次",

        "history.lowest":
            "最低",

        "history.average":
            "平均",

        "history.purchaseCount":
            "購買次數",

        "history.times":
            "{count} 次",

        "history.open":
            "▶ 查看紀錄",

        "history.close":
            "▼ 收合紀錄",

        "history.displayPrice":
            "顯示價格：",

        "history.taxExcluded":
            "未稅",

        "history.taxIncluded":
            "含稅",

        "history.taxExcludedPrice":
            "未稅價格：",

        "history.taxRate":
            "稅率：",

        "history.rounding":
            "小數處理：",

        "history.round":
            "四捨五入",

        "history.floor":
            "無條件捨去",

        "history.ceil":
            "無條件進位",

        "history.discountPercent":
            "🏷 {value}% OFF",

        "history.discountAmount":
            "🏷 {price} OFF",

        "history.empty.title":
            "目前還沒有購買紀錄。",

        "history.empty.text":
            "記錄購買後，價格會顯示在這裡。",

        "history.delete.notFound":
            "找不到要刪除的購買紀錄。",

        "history.delete.confirm":
            "要刪除這筆購買紀錄嗎？",

        "history.delete.failed":
            "未能刪除這筆購買紀錄。",

        "history.edit.notFound":
            "找不到要編輯的購買紀錄。",

        "history.product.notFound":
            "找不到商品資訊。",

        "history.editing":
            "編輯購買紀錄",

        "history.deleted.back":
            "← 返回購買紀錄",

        "history.deleted.empty":
            "目前沒有已刪除的購買紀錄。",

        "history.deleted.restore":
            "↩ 還原",

        "history.deleted.permanentDelete":
            "🗑 永久刪除",

        "history.deleted.restoreFailed":
            "未能還原這筆購買紀錄。",

        "history.deleted.confirmPermanent":
            "要永久刪除這筆購買紀錄嗎？\n\n刪除後將無法還原。",

        "history.deleted.permanentDeleteFailed":
            "未能永久刪除這筆購買紀錄。",

        /*
         Product Categories
        */

        "category.title":
            "商品分類",

        "category.name":
            "分類名稱",

        "category.namePlaceholder":
            "例：食品、飲料、日用品",

        "category.save":
            "＋ 儲存",

        "category.backSettings":
            "← ⚙️ 設定",

        "category.backProduct":
            "← 新增商品",

        "category.list.default":
            "App 預設分類",

        "category.list.user":
            "自行新增的分類",

        "category.list.protected":
            "無法編輯",

        "category.list.edit":
            "✏ 編輯",

        "category.list.delete":
            "🗑 刪除",

        "category.validation.nameRequired":
            "請輸入分類名稱。",

        "category.validation.duplicate":
            "這個商品分類已經存在。",

        "category.message.editNotFound":
            "找不到要編輯的商品分類。",

        "category.default.editBlocked":
            "Cocartly 預設的商品分類無法修改。",

        "category.default.deleteBlocked":
            "Cocartly 預設的商品分類無法刪除。",

        "category.confirm.deleteUsed":
            "這個分類目前有已新增商品正在使用。\n\n要從可選擇的分類中移除嗎？\n已新增商品中的分類資料會保留。",

        "category.confirm.delete":
            "要刪除這個商品分類嗎？",

        /*
         Store Management
        */

        "store.title":
            "🏬 管理購買通路",

        "store.country":
            "國家 / 地區",

        "store.type":
            "通路類型",

        "store.select":
            "請選擇",

        "store.type.supermarket":
            "超級市場",

        "store.type.convenience":
            "便利商店",

        "store.type.drugstore":
            "藥妝店",

        "store.type.discount":
            "折扣商店",

        "store.type.warehouse-club":
            "倉儲型賣場",

        "store.type.fixed-price":
            "均一價商店",

        "store.type.home-center":
            "居家修繕店",

        "store.type.department-mall":
            "百貨公司 / 購物中心",

        "store.type.clothing":
            "服飾店",

        "store.type.electronics":
            "家電賣場",

        "store.type.gas-station":
            "加油站",

        "store.type.specialty":
            "專門店",

        "store.type.online":
            "網路商店",

        "store.type.subscription":
            "訂閱服務",

        "store.type.vending":
            "自動販賣機",

        "store.type.other":
            "其他",

        "store.region":
            "州 / 省 / 地區",

        "store.city":
            "城市",

        "store.name":
            "購買通路名稱",

        "store.save":
            "＋ 儲存",

        "store.registered":
            "已新增購買通路",

        "store.placeholder.JP.store":
            "例：AEON ○○",

        "store.placeholder.JP.region":
            "例：東京都",

        "store.placeholder.JP.city":
            "例：港區",

        "store.placeholder.US.store":
            "例：Costco Los Angeles",

        "store.placeholder.US.region":
            "例：California",

        "store.placeholder.US.city":
            "例：Los Angeles",

        "store.placeholder.CA.store":
            "例：Costco Toronto",

        "store.placeholder.CA.region":
            "例：Ontario",

        "store.placeholder.CA.city":
            "例：Toronto",

        "store.placeholder.AU.store":
            "例：Woolworths Sydney",

        "store.placeholder.AU.region":
            "例：New South Wales",

        "store.placeholder.AU.city":
            "例：Sydney",

        "store.placeholder.KR.store":
            "例：이마트 서울점",

        "store.placeholder.KR.region":
            "例：서울특별시",

        "store.placeholder.KR.city":
            "例：강남구",

        "store.placeholder.CN.store":
            "例：沃尔玛上海店",

        "store.placeholder.CN.region":
            "例：上海市",

        "store.placeholder.CN.city":
            "例：浦东新区",

        "store.placeholder.TW.store":
            "例：家樂福台北店",

        "store.placeholder.TW.region":
            "例：臺北市",

        "store.placeholder.TW.city":
            "例：中正區",

        "store.placeholder.OTHER.store":
            "例：購買通路名稱",

        "store.placeholder.OTHER.region":
            "例：州 / 省 / 地區",

        "store.placeholder.OTHER.city":
            "例：城市",

        "store.default.jp.aeon.name":
            "AEON STYLE 品川海濱",

        "store.default.jp.aeon.region":
            "東京都",

        "store.default.jp.aeon.city":
            "品川區",

        "store.default.jp.life.name":
            "Life Central Square 惠比壽花園廣場",

        "store.default.jp.life.region":
            "東京都",

        "store.default.jp.life.city":
            "澀谷區",

        "store.default.jp.mandai.name":
            "萬代 澀川店",

        "store.default.jp.mandai.region":
            "大阪府",

        "store.default.jp.mandai.city":
            "東大阪市",

        "store.default.jp.gyomu.name":
            "業務超市 新宿大久保店",

        "store.default.jp.gyomu.region":
            "東京都",

        "store.default.jp.gyomu.city":
            "新宿區",

        "store.default.jp.coop.name":
            "Co-op Mirai 戶山店",

        "store.default.jp.coop.region":
            "東京都",

        "store.default.jp.coop.city":
            "新宿區",

        "store.default.jp.lopia.name":
            "Lopia 平井島忠 Homes 店",

        "store.default.jp.lopia.region":
            "東京都",

        "store.default.jp.lopia.city":
            "江戶川區",

        "store.default.jp.donki.name":
            "MEGA 唐吉訶德 澀谷本店",

        "store.default.jp.donki.region":
            "東京都",

        "store.default.jp.donki.city":
            "澀谷區",

        "store.default.jp.costco.name":
            "Costco 川崎倉庫店",

        "store.default.jp.costco.region":
            "神奈川縣",

        "store.default.jp.costco.city":
            "川崎市",

        "store.backSettings":
            "← ⚙️ 設定",

        "store.backProduct":
            "← 📦 新增商品",

        "store.validation.typeRequired":
            "請選擇通路類型。",

        "store.validation.nameRequired":
            "請輸入購買通路名稱。",

        "store.validation.duplicate":
            "這個購買通路已經新增過。",

        "store.message.saved":
            "購買通路已儲存。",

        "store.message.editNotFound":
            "找不到要編輯的購買通路。",

        "store.message.updated":
            "購買通路已更新。",

        "store.message.editMode":
            "目前正在編輯購買通路。儲存後會更新通路資訊。",

        "store.default.editBlocked":
            "這是 Cocartly 預設的購買通路，無法修改。",

        "store.default.deleteBlocked":
            "這是 Cocartly 預設的購買通路，無法刪除。",

        "store.confirm.delete":
            "要刪除這個購買通路嗎？",

        "store.list.protected":
            "🔒 無法編輯",

        "store.list.default":
            "🔒 預設購買通路",

        "store.list.added":
            "🏬 自行新增的購買通路",

        "store.list.empty":
            "目前還沒有自行新增的購買通路。",

        /*
         Quick Add
        */

        "product.quick.makerRequired":
            "請輸入製造商。",

        "product.quick.makerExisting":
            "已選擇現有的製造商。",

        "product.quick.makerAdded":
            "製造商已新增並選擇。",

        "product.quick.categoryRequired":
            "請輸入商品分類。",

        "product.quick.categoryExisting":
            "已選擇現有的商品分類。",

        "product.quick.categoryAdded":
            "商品分類已新增。",

        "product.quick.storeTypeRequired":
            "請選擇通路類型。",

        "product.quick.storeNameRequired":
            "請輸入購買通路名稱。",

        "product.quick.storeExisting":
            "已選擇現有的購買通路。",

        "product.quick.storeAdded":
            "購買通路已新增並選擇。",

        /*
         Backup / Restore
        */

        "backup.message.created":
            "Cocartly 備份已建立。\n\n建議將這個檔案妥善保存，以便更換裝置或需要還原資料時使用。",

        "backup.message.failed":
            "未能建立備份。",

        "restore.message.invalidFile":
            "這不是有效的 Cocartly 備份檔案。",

        "restore.confirm":
            "要使用這份備份還原資料嗎？\n\n目前的 Cocartly 資料將由備份中的資料取代。\n\n是否繼續？",

        "restore.message.completed":
            "Cocartly 資料已還原。\n\n頁面將重新載入。",

        "restore.message.readFailed":
            "未能讀取備份檔案。\n\n檔案可能已損毀，或不是 Cocartly 的備份檔案。",

        /*
         About Cocartly
        */

        "about.back":
            "← ⚙️ 設定",

        "about.title":
            "ℹ️ 關於 Cocartly",

        "about.appName":
            "🛒 Cocartly",

        "about.catch":
            "讓購物與外出準備更輕鬆。",

        "about.description":
            "Cocartly 是一款購物支援 App，可集中管理已新增商品、購物清單、購買紀錄、價格比較與外出準備清單。",

        "about.features.title":
            "主要功能",

        "about.features.product":
            "商品新增與管理",

        "about.features.code":
            "掃描商品代碼",

        "about.features.shopping":
            "購物清單",

        "about.features.history":
            "購買紀錄 · 價格",

        "about.features.outing":
            "外出清單",

        "about.features.master":
            "商品分類與購買通路管理",

        "about.features.backup":
            "備份與還原",

        "about.data.title":
            "關於您的資料",

        "about.data.description":
            "Cocartly 的資料會儲存在此裝置的瀏覽器中。為避免更換裝置或資料遺失時無法還原，建議定期從「設定」備份資料。",

        /*
         Privacy Policy
        */

        "privacy.back":
            "← ⚙️ 設定",

        "privacy.title":
            "🔒 隱私權政策",

        "privacy.intro":
            "Cocartly 重視使用者資料的妥善處理。本隱私權政策說明 Cocartly 會處理哪些資訊，以及這些資訊的使用方式。",

        "privacy.section1.title":
            "1. 蒐集與儲存的資訊",

        "privacy.section1.text":
            "Cocartly 會處理使用者輸入的資料，包括商品資訊、商品代碼、商品分類、購買通路、購物清單、購買紀錄、價格資訊與外出清單。",

        "privacy.section2.title":
            "2. 使用目的",

        "privacy.section2.text":
            "這些資訊用於提供 Cocartly 的各項功能，例如商品管理、購物清單管理、購買紀錄與價格比較，以及外出前的準備確認。",

        "privacy.section3.title":
            "3. 裝置內的資料儲存",

        "privacy.section3.text1":
            "在 Cocartly 中新增或記錄的資料，原則上會儲存在目前使用裝置的瀏覽器中。",

        "privacy.section3.text2":
            "如果刪除瀏覽器資料或更換裝置，已儲存的資料可能會遺失。",

        "privacy.section4.title":
            "4. 與外部服務的連線",

        "privacy.section4.text1":
            "部分功能可能會與外部服務連線，例如使用商品代碼搜尋商品資訊時。",

        "privacy.section4.text2":
            "在這種情況下，商品代碼等搜尋所需的資訊可能會傳送至外部服務。",

        "privacy.section5.title":
            "5. 備份資料",

        "privacy.section5.text1":
            "使用「備份資料」功能，可將 Cocartly 的資料以 JSON 備份檔案儲存在您的裝置上。",

        "privacy.section5.text2":
            "備份檔案可能包含商品資訊、購買紀錄與外出資訊，建議妥善保存與管理。",

        "privacy.section6.title":
            "6. 帳號資訊",

        "privacy.section6.text1":
            "Cocartly 目前沒有登入或使用者帳號功能。",

        "privacy.section6.text2":
            "因此，Cocartly 不會為登入用途登錄或儲存電子郵件地址與密碼。",

        "privacy.section7.title":
            "7. 存取資訊",

        "privacy.section7.text":
            "如果 Cocartly 以網路服務形式提供，託管服務可能會處理 IP 位址、瀏覽器與裝置資訊、存取日期與時間等提供服務所需的通訊資訊。",

        "privacy.section8.title":
            "8. 向第三方提供資料",

        "privacy.section8.text1":
            "除法律要求的情況外，Cocartly 的營運者不會將使用者登錄的資料出售給第三方。",

        "privacy.section8.text2":
            "但使用外部服務的功能，可能會將提供該功能所需的資訊傳送至相關服務。",

        "privacy.section9.title":
            "9. 隱私權政策的變更",

        "privacy.section9.text":
            "當 Cocartly 新增功能、變更服務內容或調整使用的外部服務時，本隱私權政策可能會隨之更新。",

        "privacy.section10.title":
            "10. 聯絡方式",

        "privacy.section10.text":
            "Cocartly 正式發布時將提供聯絡方式。",

        /*
         Device / Orientation
        */

        "device.desktop.only":
            "Cocartly 僅支援智慧型手機。",

        "device.desktop.unavailable":
            "Cocartly 目前不支援電腦與平板裝置。",

        "device.orientation.title":
            "直向使用體驗更佳",

        "device.orientation.guide":
            "此 App 已針對手機直向畫面最佳化。",

        /*
         Scan Code
        */

        "code.backHome":
            "🏠 首頁",

        "code.title":
            "掃碼",

        "code.guide":
            "將條碼對準框內即可掃描。",

        "code.success":
            "掃描完成",

        "code.waiting":
            "等待掃描…",

        "code.flash":
            "🔦 閃光燈",

        "code.manualInput":
            "⌨ 輸入商品代碼",

        "code.message.flashComingSoon":
            "閃光燈功能預計於後續更新中提供。",

        "code.message.manualInputComingSoon":
            "手動輸入商品代碼的功能預計於後續更新中提供。",

        "code.status.align":
            "將條碼對準框內即可掃描。",

        "code.status.checking":
            "正在確認商品代碼…",

        "code.status.success":
            "掃描成功",

        "code.status.searching":
            "正在搜尋商品資訊…",

        "code.status.cameraError":
            "未能啟動相機。",

        "code.flashOff":
            "🔦 關閉閃光燈",

        "code.backShopping":
            "🛒 返回購物清單",

        "code.manual.prompt":
            "請輸入商品條碼。\n\n可輸入 8、12 或 13 位數字。",

        "code.manual.required":
            "請輸入商品代碼。",

        "code.manual.numberOnly":
            "商品代碼只能輸入數字。",

        "code.manual.invalidLength":
            "商品條碼需為 8、12 或 13 位數字。",

        "code.status.waiting":
            "等待掃描…",

        "code.status.openManual":
            "正在開啟手動新增商品…",

        "code.status.openManualError":
            "未能取得商品資訊，接下來可手動新增商品。",

        "code.camera.notStarted":
            "相機目前尚未啟動。",

        "code.camera.notFound":
            "未能使用相機。",

        "code.flash.unsupported":
            "此裝置或瀏覽器不支援閃光燈控制。",

        "code.flash.error":
            "未能變更閃光燈設定。",

        "code.product.notRegistered":
            "這項商品尚未新增。\n\n商品代碼：{code}\n\n接下來將開啟新增商品頁面。",

        "code.product.selected":
            "已透過商品代碼選擇「{name}」。",

        "code.product.apiNotFound":
            "已掃描條碼，但找不到商品資訊。\n\n商品代碼：{code}\n\n可輸入商品名稱等資訊來新增商品。",

        "code.product.autoFetchFailed":
            "未能自動取得商品資訊。\n\n商品代碼：{code}\n\n可輸入商品名稱等資訊來新增商品。",

        "code.product.manualRegistration":
            "未能自動取得商品資訊，可輸入商品名稱等資訊來新增商品。",

        "code.product.codeConfirmed":
            "商品代碼已確認。\n\n商品代碼：{code}\n\n找不到商品資訊，接下來將開啟新增商品頁面。",

        "code.product.searchFailed":
            "未能取得商品資訊。\n\n商品代碼：{code}\n\n接下來將開啟新增商品頁面。",

        /*
         Outing Checklist
        */

        "outing.title":
            "🎒 外出清單",

        "outing.backHome":
            "← 🏠 首頁",

        "outing.help":
            "使用方法",

        "outing.intro.title":
            "外出前確認需要攜帶的物品",

        "outing.intro.guide":
            "可確認需要攜帶的物品並做好準備。需要購買的物品也能加入購物清單。",

        "outing.help.title":
            "關於外出清單",

        "outing.help.whatCanDo":
            "主要功能",

        "outing.help.description1":
            "可為旅行、活動與日常外出建立需要攜帶物品的清單。",

        "outing.help.description2":
            "可將物品分為「家中已有」與「需要購買」來管理。",

        "outing.help.description3":
            "需要購買的物品可加入購物清單，和一般購物一起管理。",

        "outing.help.description4":
            "常用的外出準備清單可在下次外出時再次使用。",

        "outing.help.usefulTitle":
            "適合這些情況",

        "outing.help.useful1":
            "「旅行時不想忘記帶東西」",

        "outing.help.useful2":
            "「出門前想確認需要準備什麼」",

        "outing.help.useful3":
            "「想分開管理家中已有與需要購買的物品」",

        "outing.help.useful4":
            "「不想每次都重新輸入相同物品」",

        "outing.help.howTo":
            "使用方法",

        "outing.help.step1":
            "可從「＋ 建立外出」新增外出行程。",

        "outing.help.step2":
            "可加入這次外出需要的物品。",

        "outing.help.step3":
            "錢包、毛巾等不需要購買、直接從家中攜帶的物品，可放在「家中已有」。",

        "outing.help.step4":
            "外出前需要購買的物品可放在「需要購買」，也能選擇已新增商品或使用商品代碼尋找。",

        "outing.help.step5":
            "需要購買的物品可加入購物清單。購買完成後，外出清單中的物品也會變成「已準備」。",

        "outing.help.step6":
            "可依準備情況在「未準備」、「已準備」與「暫緩」之間切換。",

        "outing.help.step7":
            "之後還有其他物品時，可使用「＋ 新增」繼續加入。",

        "outing.help.management":
            "管理外出行程",

        "outing.help.managementUpcoming":
            "「預定」會顯示接下來的外出行程。",

        "outing.help.managementRoutine":
            "「常用」會顯示平常經常使用的外出行程與物品。",

        "outing.help.managementPast":
            "「過去」會顯示已完成的外出行程。",

        "outing.create":
            "＋ 建立外出",

        "outing.tab.upcoming":
            "預定",

        "outing.tab.routine":
            "常用",

        "outing.tab.past":
            "過去",

        "outing.empty.upcoming":
            "目前還沒有預定的外出行程。",

        "outing.empty.routine":
            "目前還沒有常用的外出行程。",

        "outing.empty.past":
            "目前還沒有已完成的外出行程。",

        "outing.empty.default":
            "目前還沒有內容。",

        "outing.create.back":
            "← 🎒 外出清單",

        "outing.create.title":
            "＋ 建立外出",

        "outing.create.question":
            "這次要去哪裡？",

        "outing.create.guide":
            "可使用「旅行」、「看棒球」等容易辨識的名稱。",

        "outing.create.name":
            "外出名稱",

        "outing.create.namePlaceholder":
            "例：看棒球",

        "outing.create.type":
            "外出類型",

        "outing.create.scheduled":
            "單次",

        "outing.create.routine":
            "定期",

        "outing.create.typeGuide":
            "旅行、看棒球等可選擇「單次」，工作、上學等固定活動可選擇「定期」。",

        "outing.create.date":
            "外出日期",

        "outing.create.item":
            "攜帶物品",

        "outing.create.itemPlaceholder":
            "例：門票",

        "outing.create.addItem":
            "＋ 新增物品",

        "outing.create.noItems":
            "目前還沒有新增物品。",

        "outing.create.save":
            "儲存",

        "outing.message.itemRequired":
            "請輸入攜帶物品。",

        "outing.message.itemDuplicate":
            "這個物品已經加入。",

        "outing.message.itemAdded":
            "物品已加入。",

        "outing.message.nameRequired":
            "請輸入外出名稱。",

        "outing.message.dateRequired":
            "請選擇外出日期。",

        "outing.message.itemsRequired":
            "至少需要加入一項物品。",

        "outing.message.nameDuplicate":
            "已有相同名稱的外出行程。",

        "outing.message.purchaseAdded":
            "已加入「需要購買」。",

        "outing.message.itemRegisteredDuplicate":
            "這個物品已經加入。",

        "outing.message.purchaseRequired":
            "請輸入需要購買的物品。",

        "outing.message.productRequired":
            "請選擇商品。",

        "outing.message.quantityInvalid":
            "數量需為 1 以上。",

        "outing.message.productNotFound":
            "找不到商品。",

        "outing.message.productLinkedDuplicate":
            "這項商品已連結至其他物品。",

        "outing.message.productDuplicate":
            "這項商品已經加入物品清單。",

        "outing.message.registeredProductSelected":
            "已選擇已新增商品「{name}」。",

        "outing.create.deleteItem":
            "🗑 刪除",

        "outing.check.back":
            "← 🎒 外出清單",

        "outing.check.title":
            "外出清單",

        "outing.check.pending":
            "未準備",

        "outing.check.ready":
            "已準備",

        "outing.check.hold":
            "暫緩",

        "outing.check.add":
            "＋ 新增",

        "outing.check.complete":
            "✓ 完成外出",

        "outing.check.completeGuide":
            "完成後，這次外出會移至「過去」。",

        "outing.items.emptyStatus":
            "目前沒有這個狀態的物品。",

        "outing.items.home":
            "🏠 家中已有",

        "outing.items.purchase":
            "🛒 需要購買",

        "outing.items.purchased":
            "🛒 已購買",

        "outing.items.emptyGroup":
            "這個分類目前沒有物品。",

        "outing.items.quantity":
            "數量 {quantity}",

        "outing.items.readyFromShopping":
            "已購買・已準備",

        "outing.items.chooseProduct":
            "🔗 選擇商品",

        "outing.items.addToShopping":
            "🛒 加入購物清單",

        "outing.items.selectProductGuide":
            "選擇商品後即可加入購物清單。",

        "outing.items.ready":
            "✓ 標記為已準備",

        "outing.items.hold":
            "移至暫緩",

        "outing.items.backPending":
            "改回未準備",

        "outing.items.delete":
            "🗑 刪除這個物品",

        "outing.message.alreadyAddedToShopping":
            "這個物品已經在購物清單中。",

        "outing.confirm.deleteItem":
            "要從這次外出中刪除「{name}」嗎？",

        "outing.confirm.deleteLinkedItem":
            "\n\n這個物品也在購物清單中。\n這裡只會解除與本次外出的連結，購物清單中的商品會保留。",

        "outing.add.homeTitle":
            "🏠 家中已有 / 自訂物品",

        "outing.add.item":
            "攜帶物品",

        "outing.add.itemPlaceholder":
            "例：錢包、毛巾、飲料",

        "outing.add.itemButton":
            "＋ 新增物品",

        "outing.add.purchaseTitle":
            "🛒 需要購買",

        "outing.add.purchaseGuide":
            "即使還沒決定具體商品，也可以先加入「飲料」、「充電器」等一般物品。",

        "outing.add.purchase":
            "需要購買的物品",

        "outing.add.purchasePlaceholder":
            "例：飲料、充電器、電池",

        "outing.add.purchaseButton":
            "＋ 新增購買物品",

        "outing.add.selectMethod":
            "選擇商品",

        "outing.add.registered":
            "① 選擇已新增商品",

        "outing.add.category":
            "商品分類",

        "outing.add.allCategories":
            "所有分類",

        "outing.add.product":
            "商品",

        "outing.add.selectProduct":
            "選擇商品",

        "outing.add.code":
            "② 使用商品代碼尋找",

        "outing.add.codeGuide":
            "知道商品代碼時，可使用相機尋找商品。",

        "outing.add.scan":
            "📷 掃描商品代碼",

        "outing.add.quantity":
            "數量",

        "outing.add.productButton":
            "＋ 將商品加入物品",

        "outing.productSelect.back":
            "← 返回未準備",

        "outing.productSelect.title":
            "🔗 選擇商品",

        "outing.productSelect.guide":
            "請選擇要為「{name}」購買的商品。",

        "outing.productSelect.selectButton":
            "選擇這項商品",

        "outing.scan.back":
            "← 外出清單",

        "outing.past.back":
            "← 🎒 過去的外出",

        "outing.past.title":
            "過去的外出",

        "outing.past.items":
            "攜帶物品",

        "outing.past.yearMonth":
            "{year}/{month}",

        "outing.past.count":
            "{count} 次外出",

        "outing.past.countOne":
            "{count} 次外出",

        "outing.past.itemCount":
            "{count} 項物品",

        "outing.past.itemCountOne":
            "{count} 項物品",

        "outing.past.noDate":
            "未記錄日期",

        "outing.past.noItems":
            "沒有物品紀錄。",

        "outing.past.reuse":
            "🔁 再次使用這次外出",

        "outing.past.delete":
            "🗑 刪除這次過去的外出",

        "outing.past.reuseSuffix":
            "（再次使用）",

        "outing.confirm.complete":
            "要完成這次外出嗎？\n\n「{name}」\n\n完成後會移至「過去」。",

        "outing.message.copied":
            "已複製過去的外出。選擇日期後即可儲存。",

        "outing.confirm.deletePast":
            "要從「過去」刪除「{name}」嗎？\n\n刪除後將無法還原。\n\n已新增商品與購買紀錄都會保留。",

        "outing.message.addedToShopping":
            "已將「{name}」加入購物清單。"
    },


    fr: {
        "common.start": "Commencer",
        "common.cancel": "Annuler",
        "common.save": "Enregistrer",
        "common.close": "Fermer",

        "home.catch": "Des achats et des préparatifs plus simples.",
        "home.code": "Scanner",
        "home.product": "Ajouter un produit",
        "home.shopping": "Liste d’achats",
        "home.history": "Historique et prix",
        "home.outing": "Préparation des sorties",
        "home.notice": "Informations",
        "home.settings": "Paramètres",

        "notice.backHome": "← 🏠 Accueil",
        "notice.title": "✉️ Informations",
        "notice.development.title":
            "Cocartly est en cours de développement",
        "notice.development.text":
            "Cocartly continue de s’améliorer pour rendre l’accueil et ses différentes fonctionnalités plus simples à utiliser.",

        "product.title": "Ajouter un produit",
        "product.backHome": "← 🏠 Accueil",
        "product.help": "Mode d’emploi",

        "product.name": "Nom du produit",
        "product.namePlaceholder": "Ex. : Shampooing",

        "product.code": "Code produit",
        "product.codePlaceholder":
            "Saisi automatiquement lors du scan du code-barres",
        "product.codeGuide":
            "※ Les produits avec code-barres peuvent être enregistrés depuis « Scanner ».",

        "product.category": "Catégorie de produit",
        "product.categoryManage": "⚙ Gérer les catégories",

        "category.default.food": "Alimentation",
        "category.default.drink": "Boissons",
        "category.default.snack": "Snacks et confiseries",
        "category.default.alcohol": "Boissons alcoolisées",
        "category.default.daily": "Produits du quotidien",
        "category.default.hygiene": "Entretien et hygiène",
        "category.default.medicine": "Médicaments",
        "category.default.beauty": "Beauté et cosmétiques",
        "category.default.clothing": "Vêtements",
        "category.default.baby": "Articles pour bébé",
        "category.default.pet": "Articles pour animaux",
        "category.default.stationery": "Papeterie et articles divers",
        "category.default.electronics": "Électroménager et piles",
        "category.default.other": "Autres",

        "product.country": "Pays ou région",

        "product.store": "Lieu d’achat",
        "product.storeManage": "🏬 Gérer les lieux d’achat",

        "product.volume": "Quantité / Volume",
        "product.volumeExample": "Exemples",
        "product.volumePlaceholder": "Ex. : 400",

        "product.volumeExampleTitle":
            "Exemples de quantité / volume et d’unité",
        "product.volumeExampleEgg":
            "🥚 10 œufs calibre L",
        "product.volumeExampleEggDetail":
            "Quantité / Volume : 10 / Unité : pièce",
        "product.volumeExampleMilk":
            "🥛 Lait 1 000 mL",
        "product.volumeExampleMilkDetail":
            "Quantité / Volume : 1000 / Unité : mL",
        "product.volumeExampleRice":
            "🍚 Riz 5 kg",
        "product.volumeExampleRiceDetail":
            "Quantité / Volume : 5 / Unité : kg",
        "product.volumeExampleBread":
            "🍞 Pain de mie, 6 tranches",
        "product.volumeExampleBreadDetail":
            "Quantité / Volume : 6 / Unité : tranche",

        "product.unit": "Unité",
        "product.select": "Sélectionner",

        "product.unit.each": "pièce",
        "product.unit.sheet": "tranche",
        "product.unit.bottle": "bouteille",
        "product.unit.bag": "sachet",
        "product.unit.box": "boîte",
        "product.unit.pack": "pack",
        "product.unit.roll": "rouleau",

        "product.price": "Prix TTC",
        "product.priceCalc": "Calcul du prix",
        "product.pricePlaceholder": "Ex. : 298",

        "product.shareTitle":
            "Partager avec la base de produits Cocartly",
        "product.shareDescription":
            "Le nom, le code et la catégorie du produit peuvent être partagés. Les prix et les lieux d’achat ne sont pas partagés.",
        "product.shareThanks":
            "Merci de contribuer à améliorer les informations produits de Cocartly.",

        "product.save": "Enregistrer",
        "product.cancelEdit": "✕ Annuler la modification",
        "product.deletedItems": "🗑 Produits supprimés",
        "product.registered": "Produits enregistrés",
        "product.allCategories": "Toutes les catégories",

        "product.validation.volumeNeedsUnit":
            "Veuillez sélectionner une unité lorsqu’une quantité ou un volume est renseigné.",
        "product.validation.unitNeedsVolume":
            "Veuillez renseigner une quantité ou un volume lorsqu’une unité est sélectionnée.",
        "product.validation.nameRequired":
            "Veuillez saisir le nom du produit.",
        "product.validation.categoryRequired":
            "Veuillez sélectionner une catégorie de produit.",
        "product.validation.storeRequired":
            "Veuillez sélectionner un lieu d’achat.",
        "product.validation.priceInvalid":
            "Veuillez saisir un prix supérieur ou égal à 0.",

        "product.message.saved":
            "✓ Enregistré",
        "product.message.savedOffline":
            "✓ Enregistré sur cet appareil. La synchronisation sera possible une fois en ligne.",
        "product.message.editCancelled":
            "La modification du produit a été annulée.",

        /*
         Ajout d’un produit
         Mode d’emploi
        */

        "product.help.title":
            "À propos de l’ajout de produits",

        "product.help.featureTitle":
            "Fonctionnalités",

        "product.help.feature1":
            "Les informations d’un produit, comme son nom, son code, sa catégorie, son lieu d’achat et sa quantité ou son volume, peuvent être enregistrées.",

        "product.help.feature2":
            "Pour un produit avec code-barres, l’enregistrement peut se faire depuis « Scanner ». Lors d’un prochain scan du même code-barres, Cocartly reconnaîtra automatiquement le produit enregistré.",

        "product.help.feature3":
            "Les lieux d’achat et les prix enregistrés permettent de consulter les prix précédents dans « Historique et prix ».",

        "product.help.feature4":
            "Pour un produit enregistré, le dernier prix, le prix minimum, le prix moyen et les lieux d’achat précédents peuvent être consultés avant d’enregistrer un achat.",

        "product.help.usefulTitle":
            "Utile notamment pour",

        "product.help.useful1":
            "« Garder les produits achetés régulièrement »",

        "product.help.useful2":
            "« Retrouver le prix payé la dernière fois »",

        "product.help.useful3":
            "« Retrouver le lieu où le prix était le plus bas »",

        "product.help.useful4":
            "Cocartly peut vous aider dans ces situations.",

        "product.help.howToTitle":
            "Mode d’emploi",

        "product.help.step1":
            "Pour un produit avec code-barres, le scan peut être lancé depuis « Scanner » sur l’accueil.",

        "product.help.step2":
            "Pour un nouveau produit, les informations comme le nom, la catégorie, le lieu d’achat et la quantité ou le volume peuvent être vérifiées avant l’enregistrement.",

        "product.help.step3":
            "Les produits sans code-barres, comme les légumes, les plats préparés ou les produits vendus au poids, peuvent être enregistrés depuis « Ajouter un produit » sur l’accueil.",

        "product.help.step4":
            "Pour acheter à nouveau un produit enregistré, son code-barres peut être scanné ou l’option « Voir le prix et acheter » peut être sélectionnée depuis « Produits enregistrés ».",

        "product.help.step5":
            "Le dernier prix, le prix minimum, le prix moyen ainsi que les lieux d’achat et les prix précédents peuvent être consultés.",

        "product.help.step6":
            "Pour enregistrer un achat, « Acheter et enregistrer le prix » permet de renseigner le lieu d’achat, le prix actuel et la quantité.",

        "product.help.step7":
            "Si le produit n’est pas acheté cette fois, l’option « Pas cette fois » permet de ne pas enregistrer d’achat.",

        "product.help.step8":
            "Les achats enregistrés sont automatiquement ajoutés à « Historique et prix ».",

        "product.help.close":
            "Fermer",

        /*
         Ajout d’un produit
         Calcul du prix
        */

        "product.tax.displayPrice":
            "Prix affiché",

        "product.tax.priceType":
            "Type de prix",

        "product.tax.taxIncluded":
            "TTC",

        "product.tax.taxExcluded":
            "HT",

        "product.tax.taxRate":
            "Taux de taxe",

        "product.tax.customTaxRate":
            "Taux de taxe (%)",

        "product.tax.jpGuide":
            "Sélection du taux de taxe applicable au Japon.",

        "product.tax.overseasGuide":
            "Le taux de taxe peut être renseigné selon la région et le type de produit.",

        "product.tax.rounding":
            "Arrondi",

        "product.tax.round":
            "Arrondir au plus proche",

        "product.tax.floor":
            "Arrondir à l’inférieur",

        "product.tax.ceil":
            "Arrondir au supérieur",

        "product.tax.discount":
            "Réduction",

        "product.tax.discountNone":
            "Aucune réduction",

        "product.tax.discountPercent":
            "% de réduction",

        "product.tax.discountAmountLabel":
            "Réduction de {currency}",

        "product.tax.discountAmount":
            "Réduction en montant",

        "product.tax.discountValue":
            "Valeur de la réduction",

        "product.tax.finalPrice":
            "Prix final : {price}",

        "product.tax.usePrice":
            "Utiliser ce prix",

        "product.tax.close":
            "Fermer",

        "product.tax.examplePrefix":
            "Ex. :",

        "product.tax.discountValuePlaceholder":
            "Ex. : 20",

        "product.tax.inputError":
            "Certaines informations saisies sont à vérifier.",

        /*
         Ajout d’un produit
         Produits enregistrés
        */

        "product.list.title":
            "Produits enregistrés",

        "product.list.allCategories":
            "Toutes les catégories",

        "product.list.categoryPrefix":
            "Catégorie :",

        "product.list.count":
            "Produits : {count}",

        "product.list.countOne":
            "Produits : {count}",

        "product.list.empty":
            "Aucun produit enregistré pour le moment.",

        "product.list.month":
            "{month}/{year}",

        "product.list.code":
            "Code produit",

        "product.list.category":
            "Catégorie de produit",

        "product.list.store":
            "Lieu d’achat",

        "product.list.volume":
            "Quantité / Volume",

        "product.list.price":
            "Prix",

        "product.list.registeredDate":
            "Date d’enregistrement",

        "product.list.favorite":
            "Favori",

        "product.list.checkPrice":
            "Voir le prix et acheter",

        "product.list.edit":
            "✏ Modifier",

        "product.list.delete":
            "🗑 Supprimer",

        /*
         Ajout d’un produit
         Produits supprimés
        */

        "product.deleted.title":
            "Produits supprimés",

        "product.deleted.button":
            "🗑 Produits supprimés ({count})",

        "product.deleted.back":
            "← 📦 Ajouter un produit",

        "product.deleted.restore":
            "♻ Restaurer",

        "product.deleted.permanentDelete":
            "🗑 Supprimer définitivement",

        /*
         Ajout d’un produit
         Modification, suppression et restauration
        */

        "product.message.editMode":
            "Modification du produit. Les informations seront mises à jour lors de l’enregistrement.",

        "product.message.registrationCancelled":
            "L’ajout du produit a été annulé.",

        "product.message.alreadyRegistered":
            "Ce produit est déjà enregistré. Il n’est pas nécessaire de l’enregistrer à nouveau.",

        "product.confirm.alreadyRegistered":
            "Ce produit est déjà enregistré.\n\nProduit : {name}\n\nLe même produit ne peut pas être enregistré à nouveau.",

        "product.confirm.delete":
            "Supprimer ce produit ?",

        "product.confirm.deletedFound":
            "Ce produit se trouve dans les produits supprimés.\n\nProduit : {name}\n\nLe restaurer au lieu de l’enregistrer à nouveau ?",

        "product.confirm.permanentDelete":
            "Supprimer définitivement « {name} » ?\n\nCette action est irréversible.",

        "product.registered.backHistory":
            "← 📊 Historique et prix",

        "product.registered.backProduct":
            "← 📦 Ajouter un produit",

        "product.registered.notFound":
            "Les informations du produit enregistré sont introuvables.",

        "product.registered.code":
            "Code produit : {code}",

        "product.registered.noCode":
            "Aucun code produit",

        "product.registered.noRecord":
            "Non renseigné",

        "product.registered.noHistory":
            "Aucun historique de prix pour le moment.",

        "product.registered.title":
            "Produit enregistré",

        "product.registered.latest":
            "Dernier prix",

        "product.registered.lowest":
            "Prix minimum",

        "product.registered.average":
            "Prix moyen",

        "product.registered.historyTitle":
            "🏬 Lieux d’achat et prix précédents",

        "product.registered.buy":
            "🛒 Acheter et enregistrer le prix",

        "product.registered.skip":
            "Pas cette fois",

        /*
         Liste d’achats
        */

        "shopping.title":
            "🛒 Liste d’achats",

        "shopping.backHome":
            "← 🏠 Accueil",

        "shopping.help":
            "Mode d’emploi",

        "shopping.help.title":
            "À propos de la liste d’achats",

        "shopping.help.featureTitle":
            "Fonctionnalités",

        "shopping.help.feature1":
            "Les produits à acheter peuvent être ajoutés à une liste et vérifiés pendant les achats.",

        "shopping.help.feature2":
            "Les produits peuvent être classés dans « À acheter », « Achetés » ou « En attente ».",

        "shopping.help.feature3":
            "Les produits enregistrés comme ceux qui ne le sont pas encore peuvent être ajoutés à la liste d’achats.",

        "shopping.help.feature4":
            "Dans les détails d’un produit, le dernier prix, le prix minimum et le prix moyen peuvent être consultés, ainsi que la disponibilité et le prix constatés aujourd’hui en magasin.",

        "shopping.help.usefulTitle":
            "Utile notamment pour",

        "shopping.help.useful1":
            "« Ne rien oublier pendant les achats »",

        "shopping.help.useful2":
            "« Voir ce qui a déjà été acheté et ce qu’il reste à acheter »",

        "shopping.help.useful3":
            "« Comparer le prix avec celui du dernier achat »",

        "shopping.help.useful4":
            "« Mettre en attente un produit en rupture de stock »",

        "shopping.help.howToTitle":
            "Mode d’emploi",

        "shopping.help.step1":
            "« + Ajouter » permet d’ajouter un produit à la liste d’achats.",

        "shopping.help.step2":
            "Un produit enregistré peut être sélectionné, ou un nouveau nom de produit peut être saisi. Le code produit et la quantité prévue peuvent également être renseignés si nécessaire.",

        "shopping.help.step3":
            "Les détails d’un produit sont accessibles depuis « À acheter ».",

        "shopping.help.step4":
            "Pour les produits ayant un historique d’achat, le dernier prix, le prix minimum et le prix moyen peuvent être consultés.",

        "shopping.help.step5":
            "« Enregistrer les infos du jour » permet de conserver la disponibilité et le prix constatés en magasin.",

        "shopping.help.step6":
            "Après l’achat d’un produit, « ✓ Acheté » permet de le marquer comme acheté.",

        "shopping.help.step7":
            "Un produit qui ne sera pas acheté cette fois peut être placé « En attente », puis remis dans « À acheter » si nécessaire.",

        "shopping.help.step8":
            "« Retirer de la liste d’achats » retire uniquement l’élément de la liste. Le produit enregistré et son historique d’achat restent conservés.",

        "shopping.help.step9":
            "Une fois les achats terminés, « Terminer les achats » permet de les finaliser.",

        "shopping.help.close":
            "Fermer",

        "shopping.pending":
            "À acheter",

        "shopping.purchased":
            "Achetés",

        "shopping.hold":
            "En attente",

        "shopping.addTab":
            "+ Ajouter",

        "shopping.remaining":
            "Restants",

        "shopping.itemUnit":
            "articles",

        "shopping.remainingSummary":
            "{count} articles restants",

        "shopping.remainingSummaryOne":
            "{count} article restant",

        "shopping.add.title":
            "Ajouter à la liste d’achats",

        "shopping.favorite":
            "⭐ Favoris",

        "shopping.all":
            "Tous",

        "shopping.registeredProduct":
            "Produit enregistré",

        "shopping.selectProduct":
            "Sélectionner un produit",

        "shopping.or":
            "ou",

        "shopping.productName":
            "Nom du produit",

        "shopping.productNamePlaceholder":
            "Ex. : Chou",

        "shopping.code":
            "Code produit (si connu)",

        "shopping.codePlaceholder":
            "Facultatif si inconnu",

        "shopping.scanCode":
            "📷 Scanner le code produit",

        "shopping.codeGuide":
            "Saisie manuelle ou scan avec l’appareil photo.",

        "shopping.quantity":
            "Quantité prévue",

        "shopping.add":
            "+ Ajouter à la liste d’achats",

        "shopping.finish":
            "Terminer les achats",

        "shopping.empty.pending":
            "Aucun produit à acheter.",

        "shopping.empty.purchased":
            "Aucun produit acheté.",

        "shopping.empty.hold":
            "Aucun produit en attente.",

        "shopping.empty.favorite":
            "Aucun produit favori pour le moment.",

        "shopping.empty.category":
            "Aucun produit dans cette catégorie.",

        "shopping.validation.selectOrName":
            "Veuillez sélectionner un produit enregistré ou saisir un nom de produit.",

        "shopping.validation.quantity":
            "Veuillez saisir une quantité d’au moins 1.",

        "shopping.validation.duplicateCode":
            "Un produit avec ce code est déjà enregistré.",

        "shopping.validation.duplicateCodeDetail":
            "Un produit avec ce code est déjà enregistré.\n\nProduit : {name}\n\nVous pouvez l’ajouter depuis « Produits enregistrés ».",

        "shopping.message.added":
            "Ajouté à la liste d’achats.",

        "shopping.message.unregisteredAdded":
            "Produit non enregistré ajouté à la liste d’achats.",

        "shopping.productNameUnset":
            "Nom du produit non renseigné",

        "shopping.previousPurchaseNone":
            "Aucun achat précédent",

        "shopping.previousPurchase":
            "Dernier achat : {store}",

        "shopping.quantityDisplay":
            "Quantité : {quantity}",

        "shopping.finish.noPurchased":
            "Aucun produit acheté.",

        "shopping.finish.pendingWarning":
            "Il reste des articles dans « À acheter » : {count}.\n\nAucun oubli ?\n\nTerminer les achats quand même ?",

        "shopping.finish.pendingWarningOne":
            "Il reste des articles dans « À acheter » : {count}.\n\nAucun oubli ?\n\nTerminer les achats quand même ?",

        "shopping.finish.itemCount":
            "{count}",

        "shopping.finish.itemCountOne":
            "{count}",

        "shopping.finish.confirm":
            "Terminer les achats ?\n\nAchetés : {purchasedText}\nÀ acheter : {pendingText}\nEn attente : {holdText}\n\nConfirmer les produits achetés ?",

        "shopping.finish.missingInfo":
            "Il manque des informations nécessaires à l’enregistrement de l’historique des achats.\n\nPour les produits suivants, la disponibilité « Disponible » et le prix TTC doivent être renseignés.\n\n• {names}",

        "shopping.finish.completed":
            "Achats terminés.\n\nAjoutés à l’historique : {historyText}\nNouveaux produits enregistrés : {registeredText}",

        /*
         Détails du produit de la liste d’achats
        */

        "shopping.detail.back":
            "🛒 ← Liste d’achats",

        "shopping.detail.title":
            "Détails du produit",

        "shopping.detail.unregistered":
            "Produit non enregistré",

        "shopping.detail.quantity":
            "Quantité prévue :",

        "shopping.detail.code":
            "Code produit",

        "shopping.detail.codePlaceholder":
            "Facultatif si inconnu",

        "shopping.detail.saveCode":
            "Enregistrer le code produit",

        "shopping.detail.codeSaved":
            "Code produit enregistré.",

        "shopping.detail.codeSavedEmpty":
            "Code produit enregistré comme non renseigné.",

        "shopping.detail.latest":
            "Dernier prix",

        "shopping.detail.lowest":
            "Prix minimum",

        "shopping.detail.average":
            "Prix moyen",

        "shopping.detail.taxIncludedShort":
            "TTC",

        "shopping.detail.noHistory":
            "Aucun historique d’achat pour le moment.",

        "shopping.detail.previousStoreNone":
            "Aucun achat précédent",

        "shopping.detail.previousStore":
            "Dernier achat : {store}",

        /*
         Informations du jour en magasin
        */

        "shopping.store.title":
            "Infos du jour en magasin",

        "shopping.store.store":
            "Magasin",

        "shopping.store.previous":
            "Magasin du dernier achat",

        "shopping.store.recent":
            "Magasins récemment consultés",

        "shopping.store.search":
            "🔍 Rechercher un autre magasin",

        "shopping.store.country":
            "Pays ou région",

        "shopping.store.allCountries":
            "Tous les pays et régions",

        "shopping.store.region":
            "Région",

        "shopping.store.allRegions":
            "Toutes les régions",

        "shopping.store.name":
            "Nom du magasin",

        "shopping.store.searchPlaceholder":
            "Ex. : Paris, supermarché, boutique en ligne",

        "shopping.store.allStores":
            "Tous les magasins",

        "shopping.store.select":
            "Sélectionner un magasin",

        "shopping.store.availability":
            "Disponibilité",

        "shopping.store.available":
            "○ Disponible",

        "shopping.store.soldout":
            "△ En rupture de stock",

        "shopping.store.notavailable":
            "× Non disponible",

        "shopping.store.unknown":
            "? Non vérifié",

        "shopping.store.taxExcluded":
            "Prix HT",

        "shopping.store.taxExcludedShort":
            "HT",

        "shopping.store.taxIncluded":
            "Prix TTC",

        "shopping.store.taxIncludedKnown":
            "Si connu",

        "shopping.store.examplePrefix":
            "Ex. :",

        "shopping.store.priceCalc":
            "Calcul du prix",

        "shopping.store.priceType":
            "Type de prix",

        "shopping.store.priceTypeExcluded":
            "HT",

        "shopping.store.priceTypeIncluded":
            "TTC",

        "shopping.store.taxRate":
            "Taux de taxe",

        "shopping.store.customTaxRate":
            "Taux de taxe (%)",

        "shopping.store.rounding":
            "Arrondi",

        "shopping.store.round":
            "Arrondir au plus proche",

        "shopping.store.floor":
            "Arrondir à l’inférieur",

        "shopping.store.ceil":
            "Arrondir au supérieur",

        "shopping.store.discount":
            "Réduction",

        "shopping.store.discountNone":
            "Aucune réduction",

        "shopping.store.discountPercent":
            "% de réduction",

        "shopping.store.discountAmount":
            "Réduction en montant",

        "shopping.store.discountValue":
            "Valeur de la réduction",

        "shopping.store.usePrice":
            "Utiliser ce prix",

        "shopping.store.close":
            "Fermer",

        "shopping.store.save":
            "Enregistrer les infos du jour",

        "shopping.store.saved":
            "Informations du jour enregistrées.",

        "shopping.store.noChecks":
            "Aucune information relevée en magasin.",

        "shopping.store.cheapest":
            "★ Prix minimum",

        "shopping.store.checked":
            "Vérifié : {date}",

        "shopping.store.noResults":
            "Aucun magasin correspondant.",

        "shopping.store.tooMany":
            "Seuls les 10 premiers résultats sont affichés. Des critères plus précis permettent de réduire la liste.",

        "shopping.detail.purchased":
            "✓ Acheté",

        "shopping.detail.hold":
            "Mettre en attente",

        "shopping.detail.holdMessage":
            "Produit placé en attente.\n\nIl sera supprimé définitivement après 14 jours.",

        "shopping.detail.returnPending":
            "Remettre dans « À acheter »",

        "shopping.detail.delete":
            "🗑 Retirer de la liste d’achats",

        "shopping.detail.deleteGuide":
            "Le produit enregistré et son historique d’achat restent conservés.",

        "shopping.detail.deleteConfirm":
            "Retirer ce produit de la liste d’achats ?\n\nLe produit enregistré et son historique d’achat restent conservés.",

        /*
         Achat en cours
        */

        "purchase.backProduct":
            "← Retour au produit",

        "purchase.backHistory":
            "← Historique et prix",

        "purchase.backPurchase":
            "← Achat en cours",

        "purchase.backPurchaseScan":
            "🛒 Achat en cours",

        "purchase.title":
            "🛒 Achat en cours",

        "purchase.productName":
            "Nom du produit",

        "purchase.previousPrice":
            "Dernier prix",

        "purchase.noRecord":
            "Non renseigné",

        "purchase.code":
            "Code produit",

        "purchase.codePlaceholder":
            "Facultatif si inconnu",

        "purchase.scanCode":
            "📷 Scanner le code produit",

        "purchase.codeGuide":
            "Le code peut être scanné avec l’appareil photo ou renseigné et modifié plus tard.",

        "purchase.store":
            "Lieu d’achat",

        "purchase.previousStore":
            "Lieu du dernier achat",

        "purchase.recentStores":
            "Lieux d’achat récents",

        "purchase.searchStore":
            "🔍 Rechercher un autre lieu d’achat",

        "purchase.country":
            "Pays ou région",

        "purchase.allCountries":
            "Tous les pays et régions",

        "purchase.region":
            "Région",

        "purchase.allRegions":
            "Toutes les régions",

        "purchase.storeName":
            "Nom du lieu d’achat",

        "purchase.storeSearchPlaceholder":
            "Ex. : Paris, supermarché, boutique en ligne",

        "purchase.allStores":
            "Tous les lieux d’achat",

        "purchase.selectStore":
            "Sélectionner un lieu d’achat",

        "purchase.manageStores":
            "🏬 Gérer les lieux d’achat",

        "purchase.currentPrice":
            "Prix actuel TTC",

        "purchase.priceCalc":
            "Calcul du prix",

        "purchase.taxExcluded":
            "Prix HT",

        "purchase.taxRate":
            "Taux de taxe",

        "purchase.customTaxRate":
            "Taux de taxe (%)",

        "purchase.rounding":
            "Arrondi",

        "purchase.round":
            "Arrondir au plus proche",

        "purchase.floor":
            "Arrondir à l’inférieur",

        "purchase.ceil":
            "Arrondir au supérieur",

        "purchase.discount":
            "Réduction",

        "purchase.discountNone":
            "Aucune réduction",

        "purchase.discountPercent":
            "% de réduction",

        "purchase.discountAmount":
            "Réduction de {currency}",

        "purchase.discountValue":
            "Valeur de la réduction",

        "purchase.taxIncludedResult":
            "Prix TTC : -",

        "purchase.usePrice":
            "Utiliser ce prix",

        "purchase.close":
            "Fermer",

        "purchase.quantity":
            "Quantité achetée",

        "purchase.save":
            "Enregistrer l’achat",

        "purchase.taxGuide.jp":
            "Sélection du taux de taxe applicable au Japon.",

        "purchase.taxGuide.other":
            "Le taux de taxe peut être renseigné selon la région et le type de produit.",

        "purchase.validation.store":
            "Veuillez sélectionner un lieu d’achat.",

        "purchase.validation.price":
            "Veuillez saisir le prix actuel.",

        "purchase.validation.duplicateCode":
            "Ce code produit est déjà enregistré pour un autre produit.",

        "purchase.error.save":
            "L’achat n’a pas pu être enregistré.",

        /*
         Historique et prix
        */

        "history.backHome":
            "← 🏠 Accueil",

        "history.title":
            "📊 Historique et prix",

        "history.help":
            "Mode d’emploi",

        "history.help.title":
            "À propos de l’historique et des prix",

        "history.help.featureTitle":
            "Fonctionnalités",

        "history.help.feature1":
            "L’historique des produits achetés peut être consulté par ordre d’achat ou par produit.",

        "history.help.feature2":
            "Le dernier prix, le prix minimum, le prix moyen ainsi que les lieux d’achat et les prix précédents peuvent être consultés.",

        "history.help.feature3":
            "Les prix précédents peuvent également servir de repère avant de décider d’enregistrer un nouvel achat.",

        "history.help.usefulTitle":
            "Utile notamment pour",

        "history.help.useful1":
            "« Retrouver le prix du dernier achat »",

        "history.help.useful2":
            "« Retrouver le lieu où le prix était le plus bas »",

        "history.help.useful3":
            "« Voir si le prix a augmenté depuis un achat précédent »",

        "history.help.useful4":
            "« Comparer le prix actuel avec les prix précédents »",

        "history.help.howToTitle":
            "Mode d’emploi",

        "history.help.step1":
            "Dans « Par ordre d’achat », les achats sont affichés dans l’ordre chronologique.",

        "history.help.step2":
            "Dans « Par produit », les achats d’un même produit sont regroupés. Un filtre par catégorie est également disponible.",

        "history.help.step3":
            "« Voir le prix et acheter » permet d’ouvrir le produit concerné.",

        "history.help.step4":
            "Le dernier prix, le prix minimum, le prix moyen ainsi que les lieux d’achat et les prix précédents peuvent être consultés.",

        "history.help.step5":
            "Pour enregistrer un nouvel achat, les informations de l’achat en cours peuvent être renseignées puis enregistrées.",

        "history.help.step6":
            "Si le produit n’est pas acheté cette fois, l’option « Pas cette fois » permet de ne pas enregistrer d’achat.",

        "history.help.step7":
            "Lorsqu’un achat est enregistré, son nouveau prix est automatiquement ajouté à « Historique et prix ».",

        "history.help.managementTitle":
            "Gestion de l’historique",

        "history.help.management1":
            "Un achat enregistré par erreur peut être modifié.",

        "history.help.management2":
            "Les achats supprimés peuvent être consultés et restaurés depuis « Historique supprimé ».",

        "history.help.management3":
            "Une suppression définitive est irréversible. Une confirmation est affichée avant la suppression.",

        "history.help.close":
            "Fermer",

        "history.byDate":
            "🕒 Par ordre d’achat",

        "history.byProduct":
            "📦 Par produit",

        "history.deleted":
            "🗑 Historique supprimé",

        "history.categoryAll":
            "Toutes les catégories",

        "history.category":
            "Catégorie : {name}",

        "history.productCount":
            "Produits : {count}",

        "history.month":
            "{month}/{year} ({count})",

        "history.productMissing":
            "Informations du produit indisponibles",

        "history.quantity":
            "Quantité achetée :",

        "history.viewPurchase":
            "Voir le prix et acheter",

        "history.edit":
            "✏ Modifier",

        "history.delete":
            "🗑 Supprimer",

        "history.favorite":
            "⭐ Favori",

        "history.notFavorite":
            "☆ Favori",

        "history.latest":
            "Dernier prix",

        "history.lowest":
            "Prix minimum",

        "history.average":
            "Prix moyen",

        "history.purchaseCount":
            "Nombre d’achats",

        "history.times":
            "{count} fois",

        "history.open":
            "▶ Voir l’historique",

        "history.close":
            "▼ Masquer l’historique",

        "history.displayPrice":
            "Prix affiché :",

        "history.taxExcluded":
            "HT",

        "history.taxIncluded":
            "TTC",

        "history.taxExcludedPrice":
            "Prix HT :",

        "history.taxRate":
            "Taux de taxe :",

        "history.rounding":
            "Arrondi :",

        "history.round":
            "Au plus proche",

        "history.floor":
            "À l’inférieur",

        "history.ceil":
            "Au supérieur",

        "history.discountPercent":
            "🏷 Réduction de {value} %",

        "history.discountAmount":
            "🏷 Réduction de {price}",

        "history.empty.title":
            "Aucun historique d’achat pour le moment.",

        "history.empty.text":
            "Les prix des achats enregistrés apparaîtront ici.",

        "history.delete.notFound":
            "L’historique d’achat à supprimer est introuvable.",

        "history.delete.confirm":
            "Supprimer cet historique d’achat ?",

        "history.delete.failed":
            "L’historique d’achat n’a pas pu être supprimé.",

        "history.edit.notFound":
            "L’historique d’achat à modifier est introuvable.",

        "history.product.notFound":
            "Les informations du produit sont introuvables.",

        "history.editing":
            "Modification de l’historique d’achat",

        "history.deleted.back":
            "← Retour à l’historique",

        "history.deleted.empty":
            "Aucun historique d’achat supprimé.",

        "history.deleted.restore":
            "↩ Restaurer",

        "history.deleted.permanentDelete":
            "🗑 Supprimer définitivement",

        "history.deleted.restoreFailed":
            "L’historique d’achat n’a pas pu être restauré.",

        "history.deleted.confirmPermanent":
            "Supprimer définitivement cet historique d’achat ?\n\nCette action est irréversible.",

        "history.deleted.permanentDeleteFailed":
            "L’historique d’achat n’a pas pu être supprimé définitivement.",

        /*
         Paramètres
        */

        "settings.title":
            "Paramètres",

        "settings.backHome":
            "← 🏠 Accueil",

        "settings.basic":
            "Paramètres de base",

        "settings.language":
            "🌐 Langue d’affichage",

        "settings.baseCountry":
            "🌍 Pays ou région d’achat habituel",

        "settings.management":
            "Gestion",

        "settings.category.title":
            "Catégories de produits",

        "settings.category.guide":
            "Catégories utilisées lors de l’ajout ou de la modification des produits.",

        /*
         Gestion des catégories
        */

        "category.title":
            "Catégories de produits",

        "category.name":
            "Nom de la catégorie",

        "category.namePlaceholder":
            "Ex. : Alimentation, Boissons, Maison",

        "category.save":
            "+ Enregistrer",

        "category.backSettings":
            "← ⚙️ Paramètres",

        "category.backProduct":
            "← Ajouter un produit",

        "category.list.default":
            "Catégories par défaut",

        "category.list.user":
            "Catégories ajoutées",

        "category.list.protected":
            "Non modifiable",

        "category.list.edit":
            "✏ Modifier",

        "category.list.delete":
            "🗑 Supprimer",

        "category.validation.nameRequired":
            "Veuillez saisir un nom de catégorie.",

        "category.validation.duplicate":
            "Cette catégorie est déjà enregistrée.",

        "category.message.editNotFound":
            "La catégorie à modifier est introuvable.",

        "category.default.editBlocked":
            "Les catégories par défaut ne peuvent pas être modifiées.",

        "category.default.deleteBlocked":
            "Les catégories par défaut ne peuvent pas être supprimées.",

        "category.confirm.deleteUsed":
            "Cette catégorie est utilisée par des produits enregistrés.\n\nLa supprimer des choix disponibles ?\nLes données des produits enregistrés resteront conservées.",

        "category.confirm.delete":
            "Supprimer cette catégorie ?",

        "settings.store.title":
            "Lieux d’achat",

        "settings.store.guide":
            "Lieux d’achat utilisés pour les produits, comme les magasins, les boutiques en ligne ou les abonnements.",

        /*
         Gestion des lieux d’achat
        */

        "store.title":
            "🏬 Lieux d’achat",

        "store.country":
            "Pays ou région",

        "store.type":
            "Type de lieu d’achat",

        "store.select":
            "Sélectionner",

        "store.type.supermarket":
            "Supermarché",

        "store.type.convenience":
            "Supérette / Kiosque",

        "store.type.drugstore":
            "Pharmacie / Parapharmacie",

        "store.type.discount":
            "Magasin discount",

        "store.type.warehouse-club":
            "Magasin-entrepôt sur adhésion",

        "store.type.fixed-price":
            "Magasin à prix fixe",

        "store.type.home-center":
            "Magasin de bricolage",

        "store.type.department-mall":
            "Grand magasin / Centre commercial",

        "store.type.clothing":
            "Magasin de vêtements",

        "store.type.electronics":
            "Magasin d’électronique",

        "store.type.gas-station":
            "Boutique de station-service",

        "store.type.specialty":
            "Magasin spécialisé",

        "store.type.online":
            "Boutique en ligne",

        "store.type.subscription":
            "Abonnement",

        "store.type.vending":
            "Distributeur automatique",

        "store.type.other":
            "Autre",

        "store.region":
            "Région / État / Province",

        "store.city":
            "Ville",

        "store.name":
            "Nom du lieu d’achat",

        "store.save":
            "+ Enregistrer",

        "store.registered":
            "Lieux d’achat enregistrés",

        /*
         Exemples selon le pays
        */

        "store.placeholder.JP.store":
            "Ex. : イオン〇〇店",

        "store.placeholder.JP.region":
            "Ex. : 東京都",

        "store.placeholder.JP.city":
            "Ex. : 港区",

        "store.placeholder.US.store":
            "Ex. : Costco Los Angeles",

        "store.placeholder.US.region":
            "Ex. : California",

        "store.placeholder.US.city":
            "Ex. : Los Angeles",

        "store.placeholder.CA.store":
            "Ex. : Costco Toronto",

        "store.placeholder.CA.region":
            "Ex. : Ontario",

        "store.placeholder.CA.city":
            "Ex. : Toronto",

        "store.placeholder.AU.store":
            "Ex. : Woolworths Sydney",

        "store.placeholder.AU.region":
            "Ex. : New South Wales",

        "store.placeholder.AU.city":
            "Ex. : Sydney",

        "store.placeholder.KR.store":
            "Ex. : 이마트 서울점",

        "store.placeholder.KR.region":
            "Ex. : 서울특별시",

        "store.placeholder.KR.city":
            "Ex. : 강남구",

        "store.placeholder.CN.store":
            "Ex. : 沃尔玛上海店",

        "store.placeholder.CN.region":
            "Ex. : 上海市",

        "store.placeholder.CN.city":
            "Ex. : 浦东新区",

        "store.placeholder.TW.store":
            "Ex. : 家樂福台北店",

        "store.placeholder.TW.region":
            "Ex. : 臺北市",

        "store.placeholder.TW.city":
            "Ex. : 中正區",

        "store.placeholder.OTHER.store":
            "Ex. : Nom du magasin",

        "store.placeholder.OTHER.region":
            "Ex. : Région / État / Province",

        "store.placeholder.OTHER.city":
            "Ex. : Ville",

        /*
         Lieux d’achat par défaut au Japon
        */

        "store.default.jp.aeon.name":
            "イオンスタイル品川シーサイド",

        "store.default.jp.aeon.region":
            "東京都",

        "store.default.jp.aeon.city":
            "品川区",

        "store.default.jp.life.name":
            "ライフ セントラルスクエア恵比寿ガーデンプレイス店",

        "store.default.jp.life.region":
            "東京都",

        "store.default.jp.life.city":
            "渋谷区",

        "store.default.jp.mandai.name":
            "万代 渋川店",

        "store.default.jp.mandai.region":
            "大阪府",

        "store.default.jp.mandai.city":
            "東大阪市",

        "store.default.jp.gyomu.name":
            "業務スーパー 新宿大久保店",

        "store.default.jp.gyomu.region":
            "東京都",

        "store.default.jp.gyomu.city":
            "新宿区",

        "store.default.jp.coop.name":
            "コープみらい コープ戸山店",

        "store.default.jp.coop.region":
            "東京都",

        "store.default.jp.coop.city":
            "新宿区",

        "store.default.jp.lopia.name":
            "ロピア 平井島忠ホームズ店",

        "store.default.jp.lopia.region":
            "東京都",

        "store.default.jp.lopia.city":
            "江戸川区",

        "store.default.jp.donki.name":
            "MEGAドン・キホーテ渋谷本店",

        "store.default.jp.donki.region":
            "東京都",

        "store.default.jp.donki.city":
            "渋谷区",

        "store.default.jp.costco.name":
            "コストコ 川崎倉庫店",

        "store.default.jp.costco.region":
            "神奈川県",

        "store.default.jp.costco.city":
            "川崎市",

        "store.backSettings":
            "← ⚙️ Paramètres",

        "store.backProduct":
            "← 📦 Ajouter un produit",

        "store.validation.typeRequired":
            "Veuillez sélectionner un type de lieu d’achat.",

        "store.validation.nameRequired":
            "Veuillez saisir le nom du lieu d’achat.",

        "store.validation.duplicate":
            "Ce lieu d’achat est déjà enregistré.",

        "store.message.saved":
            "Lieu d’achat enregistré.",

        "store.message.editNotFound":
            "Le lieu d’achat à modifier est introuvable.",

        "store.message.updated":
            "Lieu d’achat mis à jour.",

        "store.message.editMode":
            "Modification du lieu d’achat. Les informations seront mises à jour lors de l’enregistrement.",

        "store.default.editBlocked":
            "Ce lieu d’achat fait partie des lieux par défaut de Cocartly et ne peut pas être modifié.",

        "store.default.deleteBlocked":
            "Ce lieu d’achat fait partie des lieux par défaut de Cocartly et ne peut pas être supprimé.",

        "store.confirm.delete":
            "Supprimer ce lieu d’achat ?",

        "store.list.protected":
            "🔒 Non modifiable",

        "store.list.default":
            "🔒 Lieux par défaut",

        "store.list.added":
            "🏬 Lieux ajoutés",

        "store.list.empty":
            "Aucun lieu d’achat enregistré.",

        /*
         Ajout rapide
        */

        "product.quick.makerRequired":
            "Veuillez saisir le nom du fabricant.",

        "product.quick.makerExisting":
            "Fabricant enregistré sélectionné.",

        "product.quick.makerAdded":
            "Fabricant ajouté et sélectionné.",

        "product.quick.categoryRequired":
            "Veuillez saisir une catégorie de produit.",

        "product.quick.categoryExisting":
            "Catégorie enregistrée sélectionnée.",

        "product.quick.categoryAdded":
            "Catégorie ajoutée.",

        "product.quick.storeTypeRequired":
            "Veuillez sélectionner un type de lieu d’achat.",

        "product.quick.storeNameRequired":
            "Veuillez saisir le nom du lieu d’achat.",

        "product.quick.storeExisting":
            "Lieu d’achat enregistré sélectionné.",

        "product.quick.storeAdded":
            "Lieu d’achat ajouté et sélectionné.",

        /*
         Données
        */

        "settings.data":
            "Données",

        "settings.backup.title":
            "Sauvegarder les données",

        "settings.backup.guide":
            "Une sauvegarde permet de conserver les données Cocartly en cas de changement d’appareil ou d’imprévu.",

        "settings.restore.title":
            "Restaurer une sauvegarde",

        "settings.restore.guide":
            "Les données Cocartly enregistrées dans une sauvegarde peuvent être restaurées sur cet appareil.",

        /*
         Sauvegarde et restauration
        */

        "backup.message.created":
            "Sauvegarde Cocartly créée.\n\nIl est recommandé de conserver ce fichier dans un endroit sûr en cas de changement d’appareil ou de besoin de restauration.",

        "backup.message.failed":
            "La sauvegarde n’a pas pu être créée.",

        "restore.message.invalidFile":
            "Ce fichier n’est pas une sauvegarde Cocartly valide.",

        "restore.confirm":
            "Restaurer cette sauvegarde ?\n\nLes données Cocartly actuelles seront remplacées par celles enregistrées dans la sauvegarde.\n\nContinuer la restauration ?",

        "restore.message.completed":
            "Les données Cocartly ont été restaurées.\n\nL’écran va être rechargé.",

        "restore.message.readFailed":
            "Le fichier de sauvegarde n’a pas pu être lu.\n\nIl est peut-être endommagé ou ne correspond pas à une sauvegarde Cocartly.",

        /*
         Application
        */

        "settings.app":
            "Application",

        "settings.about.title":
            "À propos de Cocartly",

        "settings.about.guide":
            "Présentation de Cocartly et de ses principales fonctionnalités.",

        "settings.version":
            "🔖 Version",

        "settings.privacy.title":
            "Politique de confidentialité",

        "settings.privacy.guide":
            "Informations sur la manière dont Cocartly traite vos données.",

        /*
         À propos de Cocartly
        */

        "about.back":
            "← ⚙️ Paramètres",

        "about.title":
            "ℹ️ À propos de Cocartly",

        "about.appName":
            "🛒 Cocartly",

        "about.catch":
            "Des achats et des préparatifs plus simples.",

        "about.description":
            "Cocartly est une application d’aide aux achats qui permet de gérer au même endroit les produits enregistrés, la liste d’achats, l’historique des achats, la comparaison des prix et la préparation des sorties.",

        "about.features.title":
            "Principales fonctionnalités",

        "about.features.product":
            "Ajout et gestion des produits",

        "about.features.code":
            "Scan des codes produit",

        "about.features.shopping":
            "Gestion de la liste d’achats",

        "about.features.history":
            "Historique des achats et prix",

        "about.features.outing":
            "Préparation des sorties",

        "about.features.master":
            "Gestion des catégories et des lieux d’achat",

        "about.features.backup":
            "Sauvegarde et restauration des données",

        "about.data.title":
            "À propos des données",

        "about.data.description":
            "Les données Cocartly sont enregistrées dans le navigateur de cet appareil. Une sauvegarde régulière depuis les paramètres permet de les conserver en cas de changement d’appareil ou d’imprévu.",

        /*
         Politique de confidentialité
        */

        "privacy.back":
            "← ⚙️ Paramètres",

        "privacy.title":
            "🔒 Politique de confidentialité",

        "privacy.intro":
            "Cocartly accorde de l’importance au traitement approprié des données de ses utilisateurs. Cette politique de confidentialité explique les informations traitées par Cocartly et la manière dont elles sont utilisées.",

        "privacy.section1.title":
            "1. Informations collectées et enregistrées",

        "privacy.section1.text":
            "Cocartly traite les données enregistrées par l’utilisateur, notamment les informations sur les produits, les codes produit, les catégories, les lieux d’achat, la liste d’achats, l’historique des achats, les informations de prix et la préparation des sorties.",

        "privacy.section2.title":
            "2. Finalités d’utilisation",

        "privacy.section2.text":
            "Ces informations sont utilisées pour fournir les différentes fonctionnalités de Cocartly, notamment la gestion des produits, la consultation de la liste d’achats, l’historique des achats, la comparaison des prix et la vérification des affaires à préparer avant une sortie.",

        "privacy.section3.title":
            "3. Enregistrement sur l’appareil",

        "privacy.section3.text1":
            "Les données enregistrées dans Cocartly sont, en principe, conservées dans le navigateur de l’appareil utilisé.",

        "privacy.section3.text2":
            "Les données enregistrées peuvent être perdues en cas de suppression des données du navigateur ou de changement d’appareil.",

        "privacy.section4.title":
            "4. Communication avec des services externes",

        "privacy.section4.text1":
            "Certaines fonctionnalités, comme la recherche d’informations à partir d’un code produit, peuvent communiquer avec des services externes.",

        "privacy.section4.text2":
            "Dans ce cas, les informations nécessaires à la recherche, comme le code produit, peuvent être transmises au service externe concerné.",

        "privacy.section5.title":
            "5. Données de sauvegarde",

        "privacy.section5.text1":
            "La fonction « Sauvegarder les données » permet d’enregistrer les données conservées dans Cocartly sur l’appareil sous la forme d’un fichier de sauvegarde au format JSON.",

        "privacy.section5.text2":
            "Le fichier de sauvegarde contient notamment des informations sur les produits, l’historique des achats et les sorties. Il est donc recommandé de le conserver et de le gérer avec précaution.",

        "privacy.section6.title":
            "6. Informations de compte",

        "privacy.section6.text1":
            "Cocartly ne dispose actuellement d’aucune fonction de connexion ni de compte utilisateur.",

        "privacy.section6.text2":
            "Cocartly n’enregistre donc pas d’adresse e-mail ni de mot de passe à des fins de connexion.",

        "privacy.section7.title":
            "7. Informations d’accès",

        "privacy.section7.text":
            "Lorsque Cocartly est proposé en tant que service Web, certaines informations telles que l’adresse IP, les informations relatives au navigateur ou à l’appareil et la date et l’heure d’accès peuvent être traitées par le service d’hébergement dans le cadre des communications nécessaires au fonctionnement du service.",

        "privacy.section8.title":
            "8. Transmission à des tiers",

        "privacy.section8.text1":
            "Sauf obligation légale, l’exploitant de Cocartly ne vend pas à des tiers les données enregistrées par les utilisateurs.",

        "privacy.section8.text2":
            "Toutefois, lorsqu’une fonctionnalité utilise un service externe, les informations nécessaires à son fonctionnement peuvent être transmises à ce service.",

        "privacy.section9.title":
            "9. Modification de la politique de confidentialité",

        "privacy.section9.text":
            "Cette politique de confidentialité peut être modifiée en fonction de l’ajout de fonctionnalités à Cocartly, de changements apportés au service ou des services externes utilisés.",

        "privacy.section10.title":
            "10. Nous contacter",

        "privacy.section10.text":
            "Les modalités de contact seront indiquées lors du lancement officiel de Cocartly.",

        /*
         Appareil et orientation de l’écran
        */

        "device.desktop.only":
            "Cocartly est conçu pour les smartphones.",

        "device.desktop.unavailable":
            "Cocartly n’est pas disponible sur PC ou tablette.",

        "device.orientation.title":
            "Utilisation en mode portrait",

        "device.orientation.guide":
            "Cette application est optimisée pour une utilisation du smartphone en mode portrait.",

        /*
         Scanner un code
        */

        "code.backHome":
            "🏠 Accueil",

        "code.title":
            "Scanner un code",

        "code.guide":
            "Placez le code-barres dans le cadre.",

        "code.success":
            "Code lu",

        "code.waiting":
            "En attente du scan...",

        "code.flash":
            "🔦 Lampe",

        "code.manualInput":
            "⌨ Saisir le code produit",

        "code.message.flashComingSoon":
            "La fonction de lampe sera disponible prochainement.",

        "code.message.manualInputComingSoon":
            "La saisie du code produit sera disponible prochainement.",

        "code.status.align":
            "Centrez le code-barres dans le cadre.",

        "code.status.checking":
            "Vérification du code…",

        "code.status.success":
            "Code lu",

        "code.status.searching":
            "Recherche des informations du produit…",

        "code.status.cameraError":
            "La caméra n’a pas pu être démarrée.",

        "code.flashOff":
            "🔦 Lampe OFF",

        "code.backShopping":
            "🛒 Liste d’achats",

        "code.manual.prompt":
            "Saisissez le code-barres du produit.\n\nLe code doit comporter 8, 12 ou 13 chiffres.",

        "code.manual.required":
            "Veuillez saisir un code produit.",

        "code.manual.numberOnly":
            "Le code produit doit contenir uniquement des chiffres.",

        "code.manual.invalidLength":
            "Le code-barres du produit doit comporter 8, 12 ou 13 chiffres.",

        "code.status.waiting":
            "En attente du scan...",

        "code.status.openManual":
            "Ouverture de l’écran d’ajout manuel du produit.",

        "code.status.openManualError":
            "Les informations du produit n’ont pas pu être récupérées. L’écran d’ajout manuel va s’ouvrir.",

        "code.camera.notStarted":
            "La caméra n’est pas démarrée.",

        "code.camera.notFound":
            "Aucune caméra n’a pu être détectée.",

        "code.flash.unsupported":
            "La lampe ne peut pas être contrôlée sur cet appareil ou ce navigateur.",

        "code.flash.error":
            "La lampe n’a pas pu être activée ou désactivée.",

        "code.product.notRegistered":
            "Ce produit n’est pas encore enregistré.\n\nCode produit : {code}\n\nL’écran d’ajout du produit va s’ouvrir.",

        "code.product.selected":
            "« {name} » a été sélectionné à partir du code produit.",

        "code.product.apiNotFound":
            "Le code-barres a été lu, mais aucune information sur le produit n’a été trouvée.\n\nCode produit : {code}\n\nLe nom du produit et les autres informations peuvent être renseignés avant l’enregistrement.",

        "code.product.autoFetchFailed":
            "Les informations du produit n’ont pas pu être récupérées automatiquement.\n\nCode produit : {code}\n\nLe nom du produit et les autres informations peuvent être renseignés avant l’enregistrement.",

        "code.product.manualRegistration":
            "Les informations du produit n’ont pas pu être récupérées automatiquement. Le nom du produit et les autres informations peuvent être renseignés avant l’enregistrement.",

        "code.product.codeConfirmed":
            "Code produit vérifié.\n\nCode produit : {code}\n\nAucune information sur le produit n’a été trouvée. L’écran d’ajout du produit va s’ouvrir.",

        "code.product.searchFailed":
            "Les informations du produit n’ont pas pu être récupérées.\n\nCode produit : {code}\n\nL’écran d’ajout du produit va s’ouvrir.",

        /*
         Configuration initiale
        */

        "setup.welcome":
            "Bienvenue sur Cocartly",

        "setup.countryGuide":
            "Pays ou région où vous faites habituellement vos achats.",

        "setup.languageLabel":
            "Langue d’affichage",

        "setup.countryLabel":
            "Pays ou région où vous faites habituellement vos achats",

        "language.ja":
            "Japonais",

        "language.en":
            "Anglais",

        "language.ko":
            "Coréen",

        "language.zh-CN":
            "Chinois simplifié",

        "language.zh-TW":
            "Chinois traditionnel",

        "language.fr":
            "Français",

        "country.JP":
            "Japon",

        "country.US":
            "États-Unis",

        "country.CA":
            "Canada",

        "country.AU":
            "Australie",

        "country.KR":
            "Corée du Sud",

        "country.CN":
            "Chine",

        "country.TW":
            "Taïwan",

        "country.OTHER":
            "Autre",

        /*
         ==========================================
         Préparation des sorties
         ==========================================
        */

        "outing.title":
            "🎒 Préparation des sorties",

        "outing.backHome":
            "← 🏠 Accueil",

        "outing.help":
            "Mode d’emploi",

        "outing.intro.title":
            "Préparer ses affaires avant une sortie",

        "outing.intro.guide":
            "Les affaires à emporter peuvent être vérifiées au fur et à mesure de la préparation. Celles à acheter peuvent être ajoutées à la « Liste d’achats ».",

        "outing.help.title":
            "À propos de la préparation des sorties",

        "outing.help.whatCanDo":
            "Fonctionnalités",

        "outing.help.description1":
            "Pour un voyage, un événement ou une sortie du quotidien, les affaires à emporter peuvent être regroupées dans une liste et vérifiées avant le départ.",

        "outing.help.description2":
            "Les affaires peuvent être réparties entre « Déjà à la maison » et « À acheter ».",

        "outing.help.description3":
            "Les articles à acheter peuvent être ajoutés à la « Liste d’achats » et gérés avec les achats habituels.",

        "outing.help.description4":
            "Les listes d’affaires utilisées régulièrement peuvent être réutilisées pour de prochaines sorties.",

        "outing.help.usefulTitle":
            "Utile notamment pour",

        "outing.help.useful1":
            "« Éviter les oublis avant un voyage »",

        "outing.help.useful2":
            "« Vérifier ce qu’il faut emporter avant de sortir »",

        "outing.help.useful3":
            "« Séparer ce qui est déjà à la maison de ce qu’il faut acheter »",

        "outing.help.useful4":
            "« Éviter de saisir à nouveau les affaires emportées régulièrement »",

        "outing.help.howTo":
            "Mode d’emploi",

        "outing.help.step1":
            "« + Nouvelle sortie » permet de créer une nouvelle sortie.",

        "outing.help.step2":
            "Les affaires nécessaires à la sortie peuvent ensuite être ajoutées.",

        "outing.help.step3":
            "Les affaires déjà disponibles, comme un portefeuille ou une serviette, sont gérées dans « Déjà à la maison ».",

        "outing.help.step4":
            "Les articles à acheter avant la sortie sont gérés dans « À acheter ». Un produit enregistré peut être sélectionné ou recherché à partir de son code produit.",

        "outing.help.step5":
            "Les articles nécessaires peuvent être ajoutés à la « Liste d’achats ». Une fois l’achat effectué, leur préparation est également marquée comme terminée dans la sortie.",

        "outing.help.step6":
            "Les affaires sont classées dans « À préparer », « Préparés » ou « En attente » selon leur état.",

        "outing.help.step7":
            "Des affaires peuvent être ajoutées à tout moment avec « + Ajouter ».",

        "outing.help.management":
            "Gestion des sorties",

        "outing.help.managementUpcoming":
            "« À venir » permet de consulter les prochaines sorties.",

        "outing.help.managementRoutine":
            "« Habituelles » permet de retrouver les sorties et les affaires utilisées régulièrement.",

        "outing.help.managementPast":
            "« Passées » permet de consulter les sorties terminées.",

        "outing.create":
            "+ Nouvelle sortie",

        "outing.tab.upcoming":
            "À venir",

        "outing.tab.routine":
            "Habituelles",

        "outing.tab.past":
            "Passées",

        "outing.empty.upcoming":
            "Aucune sortie prévue pour le moment.",

        "outing.empty.routine":
            "Aucune sortie habituelle pour le moment.",

        "outing.empty.past":
            "Aucune sortie terminée pour le moment.",

        "outing.empty.default":
            "Aucun élément enregistré pour le moment.",

        /*
         Création d’une sortie
        */

        "outing.create.back":
            "← 🎒 Préparation des sorties",

        "outing.create.title":
            "+ Nouvelle sortie",

        "outing.create.question":
            "Quelle sortie préparez-vous ?",

        "outing.create.guide":
            "Un nom simple permet de retrouver facilement la sortie, par exemple « Voyage » ou « Match de football ».",

        "outing.create.name":
            "Nom de la sortie",

        "outing.create.namePlaceholder":
            "Ex. : Match de football",

        "outing.create.type":
            "Type de sortie",

        "outing.create.scheduled":
            "Ponctuelle",

        "outing.create.routine":
            "Récurrente",

        "outing.create.typeGuide":
            "Une sortie comme un voyage ou un match peut être ponctuelle. Une sortie liée au travail ou aux études peut être récurrente.",

        "outing.create.date":
            "Date de la sortie",

        "outing.create.item":
            "Affaire à emporter",

        "outing.create.itemPlaceholder":
            "Ex. : Billet",

        "outing.create.addItem":
            "+ Ajouter une affaire",

        "outing.create.noItems":
            "Aucune affaire ajoutée pour le moment.",

        "outing.create.save":
            "Enregistrer",

        /*
         Messages de création
        */

        "outing.message.itemRequired":
            "Veuillez saisir une affaire à emporter.",

        "outing.message.itemDuplicate":
            "Cette affaire a déjà été ajoutée.",

        "outing.message.itemAdded":
            "Affaire ajoutée.",

        "outing.message.nameRequired":
            "Veuillez saisir un nom pour la sortie.",

        "outing.message.dateRequired":
            "Veuillez sélectionner la date de la sortie.",

        "outing.message.itemsRequired":
            "Veuillez ajouter au moins une affaire à emporter.",

        "outing.message.nameDuplicate":
            "Une sortie portant ce nom est déjà enregistrée.",

        "outing.message.purchaseAdded":
            "Ajouté aux articles à acheter.",

        "outing.message.itemRegisteredDuplicate":
            "Cette affaire est déjà enregistrée.",

        "outing.message.purchaseRequired":
            "Veuillez saisir un article à acheter.",

        "outing.message.productRequired":
            "Veuillez sélectionner un produit.",

        "outing.message.quantityInvalid":
            "Veuillez saisir une quantité d’au moins 1.",

        "outing.message.productNotFound":
            "Le produit est introuvable.",

        "outing.message.productLinkedDuplicate":
            "Ce produit est déjà associé à une autre affaire.",

        "outing.message.productDuplicate":
            "Ce produit a déjà été ajouté aux affaires.",

        "outing.message.registeredProductSelected":
            "Le produit enregistré « {name} » a été sélectionné.",

        "outing.create.deleteItem":
            "🗑 Supprimer",

        /*
         Vérification de la préparation
        */

        "outing.check.back":
            "← 🎒 Préparation des sorties",

        "outing.check.title":
            "Préparation de la sortie",

        "outing.check.pending":
            "À préparer",

        "outing.check.ready":
            "Préparés",

        "outing.check.hold":
            "En attente",

        "outing.check.add":
            "+ Ajouter",

        "outing.check.complete":
            "✓ Terminer la sortie",

        "outing.check.completeGuide":
            "Une fois terminée, cette sortie sera déplacée dans « Passées ».",

        "outing.items.emptyStatus":
            "Aucune affaire dans cet état.",

        "outing.items.home":
            "🏠 Déjà à la maison",

        "outing.items.purchase":
            "🛒 À acheter",

        "outing.items.purchased":
            "🛒 Achetés",

        "outing.items.emptyGroup":
            "Aucune affaire dans cette catégorie.",

        "outing.items.quantity":
            "Quantité : {quantity}",

        "outing.items.readyFromShopping":
            "Acheté · Préparé",

        "outing.items.chooseProduct":
            "🔗 Choisir un produit",

        "outing.items.addToShopping":
            "🛒 Ajouter à la liste d’achats",

        "outing.items.selectProductGuide":
            "Une fois le produit sélectionné, il peut être ajouté à la liste d’achats.",

        "outing.items.ready":
            "✓ Marquer comme préparé",

        "outing.items.hold":
            "Mettre en attente",

        "outing.items.backPending":
            "Remettre à préparer",

        "outing.items.delete":
            "🗑 Supprimer cette affaire",

        "outing.message.alreadyAddedToShopping":
            "Cette affaire est déjà ajoutée à la liste d’achats.",

        "outing.confirm.deleteItem":
            "Supprimer « {name} » de cette sortie ?",

        "outing.confirm.deleteLinkedItem":
            "\n\nCette affaire est également ajoutée à la liste d’achats.\nSeul le lien avec cette sortie sera supprimé.\nLe produit restera dans la liste d’achats.",

        /*
         Ajout d’affaires
        */

        "outing.add.homeTitle":
            "🏠 Déjà à la maison · Saisie libre",

        "outing.add.item":
            "Affaire à emporter",

        "outing.add.itemPlaceholder":
            "Ex. : portefeuille, serviette, boisson",

        "outing.add.itemButton":
            "+ Ajouter une affaire",

        "outing.add.purchaseTitle":
            "🛒 À acheter",

        "outing.add.purchaseGuide":
            "Même si le produit précis n’est pas encore connu, une description comme « boisson » ou « chargeur » peut être utilisée.",

        "outing.add.purchase":
            "Article à acheter",

        "outing.add.purchasePlaceholder":
            "Ex. : boisson, chargeur, piles",

        "outing.add.purchaseButton":
            "+ Ajouter aux articles à acheter",

        "outing.add.selectMethod":
            "Méthode de sélection du produit",

        "outing.add.registered":
            "① Choisir parmi les produits enregistrés",

        "outing.add.category":
            "Catégorie",

        "outing.add.allCategories":
            "Toutes les catégories",

        "outing.add.product":
            "Produit",

        "outing.add.selectProduct":
            "Sélectionner un produit",

        "outing.add.code":
            "② Rechercher par code produit",

        "outing.add.codeGuide":
            "Si le code produit est disponible, le produit peut être recherché avec l’appareil photo.",

        "outing.add.scan":
            "📷 Scanner le code produit",

        "outing.add.quantity":
            "Quantité",

        "outing.add.productButton":
            "+ Ajouter le produit aux affaires",

        /*
         Sélection d’un produit
        */

        "outing.productSelect.back":
            "← À préparer",

        "outing.productSelect.title":
            "🔗 Choisir un produit",

        "outing.productSelect.guide":
            "Sélectionnez le produit à acheter pour « {name} ».",

        "outing.productSelect.selectButton":
            "Choisir ce produit",

        "outing.scan.back":
            "← Préparation des sorties",

        /*
         Sorties passées
        */

        "outing.past.back":
            "← 🎒 Sorties passées",

        "outing.past.title":
            "Sorties passées",

        "outing.past.items":
            "Affaires emportées",

        "outing.past.yearMonth":
            "{month}/{year}",

        "outing.past.count":
            "Sorties : {count}",

        "outing.past.countOne":
            "Sorties : {count}",

        "outing.past.itemCount":
            "Affaires : {count}",

        "outing.past.itemCountOne":
            "Affaires : {count}",

        "outing.past.noDate":
            "Date : non renseignée",

        "outing.past.noItems":
            "Aucune affaire enregistrée.",

        "outing.past.reuse":
            "🔁 Réutiliser cette sortie",

        "outing.past.delete":
            "🗑 Supprimer cette sortie passée",

        "outing.past.reuseSuffix":
            " (réutilisée)",

        "outing.confirm.complete":
            "Terminer cette sortie ?\n\n« {name} »\n\nUne fois terminée, elle sera déplacée dans « Passées ».",

        "outing.message.copied":
            "La sortie passée a été copiée. Une date peut maintenant être sélectionnée avant l’enregistrement.",

        "outing.confirm.deletePast":
            "Supprimer « {name} » des sorties passées ?\n\nCette action est irréversible.\n\nLes produits enregistrés et l’historique des achats ne seront pas supprimés.",

        "outing.message.addedToShopping":
            "« {name} » a été ajouté à la liste d’achats."
    }

};


/*
 ==========================================
 現在の表示言語
 ==========================================
*/

let cocartlyCurrentLanguage =
    loadCocartlyLanguage() ||
    detectCocartlyLanguage();


/*
 現在の表示言語を取得
*/

function getCocartlyLanguage() {

    return cocartlyCurrentLanguage;

}


/*
 表示言語を変更
*/

function setCocartlyLanguage(
    language
) {

    const normalizedLanguage =
        normalizeCocartlyLanguage(
            language
        );


    if (
        !COCARTLY_LANGUAGES.includes(
            normalizedLanguage
        )
    ) {

        cocartlyCurrentLanguage =
            COCARTLY_FALLBACK_LANGUAGE;


        localStorage.setItem(
            COCARTLY_LANGUAGE_STORAGE_KEY,
            COCARTLY_FALLBACK_LANGUAGE
        );


        return;

    }


    cocartlyCurrentLanguage =
        normalizedLanguage;


    /*
     選択した表示言語を保存
    */

    localStorage.setItem(
        COCARTLY_LANGUAGE_STORAGE_KEY,
        normalizedLanguage
    );

}


/*
 ==========================================
 翻訳文字列を取得
 ==========================================
*/

function t(
    key
) {

    const currentTranslations =
        COCARTLY_TRANSLATIONS[
        cocartlyCurrentLanguage
        ] || {};


    /*
     現在の言語に翻訳があれば返す
    */

    if (
        Object.prototype.hasOwnProperty.call(
            currentTranslations,
            key
        )
    ) {

        return currentTranslations[
            key
        ];

    }


    /*
     翻訳が見つからなければ
     英語へフォールバック
    */

    const fallbackTranslations =
        COCARTLY_TRANSLATIONS[
        COCARTLY_FALLBACK_LANGUAGE
        ] || {};


    if (
        Object.prototype.hasOwnProperty.call(
            fallbackTranslations,
            key
        )
    ) {

        return fallbackTranslations[
            key
        ];

    }


    /*
     それでも見つからない場合は
     キー名をそのまま返す
    */

    return key;

}
