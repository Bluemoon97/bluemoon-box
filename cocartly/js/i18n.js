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

        "shopping.finish.confirm":
            "買い物を終了します。\n\n購入済み：{purchased}商品\n購入前：{pending}商品\n保留：{hold}商品\n\n購入済みの商品を確定しますか？",

        "shopping.finish.missingInfo":
            "購入履歴へ保存するための店頭情報が不足しています。\n\n次の商品で、「販売あり」と税込価格を記録してください。\n\n・{names}",

        "shopping.finish.completed":
            "買い物を終了しました。\n\n購入履歴へ保存：{historyCount}商品\n新しく商品登録：{registeredCount}商品",

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
        "outing.past.itemCount":
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
        "home.history": "History & Price Compare",
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
            "Record stores and prices to check past prices in History & Price Compare.",

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
            "Recorded purchases are automatically added to History & Price Compare.",

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
            "← 📊 History & Price Compare",

        "product.registered.backProduct":
            "← 📦 Add Product",

        "product.registered.notFound":
            "Registered product information was not found.",

        "product.registered.code":
            "Product Code: {code}",

        "product.registered.noCode":
            "No Product Code",

        "product.registered.noRecord":
            "No Record",

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
            "Added to Shopping List.",

        "shopping.message.unregisteredAdded":
            "Unregistered product added to Shopping List.",

        "shopping.productNameUnset":
            "Product Name Not Set",

        "shopping.previousPurchaseNone":
            "Last Purchase: No Record",

        "shopping.previousPurchase":
            "Last Purchase: {store}",

        "shopping.quantityDisplay":
            "Quantity {quantity}",

        "shopping.finish.noPurchased":
            "No purchased products.",

        "shopping.finish.pendingWarning":
            "{count} items are still in To Buy.\n\nDid you forget anything?\n\nFinish shopping anyway?",

        "shopping.finish.confirm":
            "Finish shopping.\n\nPurchased: {purchased} items\nTo Buy: {pending} items\nOn Hold: {hold} items\n\nConfirm the purchased products?",

        "shopping.finish.missingInfo":
            "Store information required to save purchase history is missing.\n\nFor the following products, record “Available” and the tax-included price.\n\n• {names}",

        "shopping.finish.completed":
            "Shopping completed.\n\nSaved to purchase history: {historyCount} items\nNew products registered: {registeredCount} items",

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
            "Product code saved as blank.",

        "shopping.detail.latest":
            "Last",

        "shopping.detail.lowest":
            "Lowest",

        "shopping.detail.average":
            "Average",

        "shopping.detail.taxIncludedShort":
            "Tax Incl.",

        "shopping.detail.noHistory":
            "No purchase history yet.",

        "shopping.detail.previousStoreNone":
            "Last Purchase: No Record",

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
            "e.g. Kyobashi, Life, Target",

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
            "Price incl. Tax",

        "shopping.store.taxIncludedKnown":
            "If known",

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
            "Store information recorded.",

        "shopping.store.noChecks":
            "No store checks recorded.",

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
            "Back to To Buy",

        "shopping.detail.delete":
            "🗑 Remove from Shopping List",

        "shopping.detail.deleteGuide":
            "The registered product and previous purchase history will not be deleted.",

        "shopping.detail.deleteConfirm":
            "Remove this product from the Shopping List?\n\nThe registered product and previous purchase history will not be deleted.",

        /*
         Current Purchase
        */

        "purchase.backProduct":
            "← Back to Product",

        "purchase.backHistory":
            "← Back to History & Price Compare",

        "purchase.backPurchase":
            "← Back to Current Purchase",

        "purchase.backPurchaseScan":
            "🛒 Current Purchase",

        "purchase.title":
            "🛒 Current Purchase",

        "purchase.productName":
            "Product Name",

        "purchase.previousPrice":
            "Last Price",

        "purchase.noRecord":
            "No Record",

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
            "e.g. Kyobashi, Life, Target",

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
         History & Price Compare
        */

        "history.backHome":
            "← 🏠 Home",

        "history.title":
            "📊 History & Price Compare",

        "history.help":
            "How to Use",

        "history.help.title":
            "About History & Price Compare",

        "history.help.featureTitle":
            "What You Can Do",

        "history.help.feature1":
            "View purchase history by purchase date or by product.",

        "history.help.feature2":
            "Check the last price, lowest price, average price, and previous stores and prices.",

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
            "Under “By Purchase”, you can view history in purchase order.",

        "history.help.step2":
            "Under “By Product”, purchases of the same product are grouped together. You can also filter by category.",

        "history.help.step3":
            "Tap “Check Price & Buy” for the product you want to view.",

        "history.help.step4":
            "Check the last price, lowest price, average price, and previous stores and prices.",

        "history.help.step5":
            "To buy it, enter the current purchase details and record the purchase.",

        "history.help.step6":
            "If you are not buying it this time, select “Skip This Time”.",

        "history.help.step7":
            "When a purchase is recorded, the new price is automatically added to History & Price Compare.",

        "history.help.managementTitle":
            "Manage History",

        "history.help.management1":
            "You can edit purchase history recorded by mistake.",

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
            "Product Info Missing",

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
            "Added by You",

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
            "Gas Station Store",

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
            "🏬 Added Stores",

        "store.list.empty":
            "No registered stores.",

        /*
         Quick Add
        */

        "product.quick.makerRequired":
            "Please enter a manufacturer.",

        "product.quick.makerExisting":
            "Registered manufacturer selected.",

        "product.quick.makerAdded":
            "Manufacturer added and selected.",

        "product.quick.categoryRequired":
            "Please enter a product category.",

        "product.quick.categoryExisting":
            "Registered category selected.",

        "product.quick.categoryAdded":
            "Category added.",

        "product.quick.storeTypeRequired":
            "Please select a store type.",

        "product.quick.storeNameRequired":
            "Please enter a store name.",

        "product.quick.storeExisting":
            "Registered store selected.",

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
            "Purchase History & Price Compare",

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
            "Could not switch the flash.",

        "code.product.notRegistered":
            "This product is not registered yet.\n\nProduct Code: {code}\n\nOpening Product Registration.",

        "code.product.selected":
            "Selected \"{name}\" from the product code.",

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
            "Items you need to buy can be added to your Shopping List. When the purchase is completed, the item is also marked Ready in the Outing Checklist.",

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
            "Nothing registered yet.",

        "outing.create.back":
            "← 🎒 Outing Checklist",

        "outing.create.title":
            "+ Create Outing",

        "outing.create.question":
            "Where are you going?",

        "outing.create.guide":
            "Give it an easy-to-understand name, such as “Trip” or “Baseball Game”.",

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
            "Back to Not Ready",

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

        "outing.past.itemCount":
            "{count} items",

        "outing.past.noDate":
            "Date: No Record",

        "outing.past.noItems":
            "No item records.",

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

        "home.catch": "쇼핑을 더 스마트하게.",
        "home.code": "코드 스캔",
        "home.product": "상품 등록",
        "home.shopping": "구매 예정",
        "home.history": "구매 내역·가격 비교",
        "home.outing": "외출 체크",
        "home.notice": "알림",
        "home.settings": "설정",

        "product.title": "상품 등록",
        "product.backHome": "← 🏠 홈으로",
        "product.help": "사용 방법",

        "product.name": "상품명",
        "product.namePlaceholder": "예: 샴푸",

        "product.code": "상품 코드",
        "product.codePlaceholder":
            "바코드 스캔 시 자동 입력",
        "product.codeGuide":
            "※ 바코드가 있는 상품은 코드 스캔에서 등록해 주세요.",

        "product.category": "상품 카테고리",
        "product.categoryManage": "⚙ 상품 카테고리 관리",

        "product.country": "국가·지역",

        "product.store": "구매처",
        "product.storeManage": "🏬 구매처 관리",

        "product.volume": "내용량",
        "product.volumeExample": "입력 예",
        "product.volumePlaceholder": "예: 400",

        "product.volumeExampleTitle":
            "내용량·단위 입력 예",
        "product.volumeExampleEgg":
            "🥚 대란 10개",
        "product.volumeExampleEggDetail":
            "내용량: 10 / 단위: 개",
        "product.volumeExampleMilk":
            "🥛 우유 1000mL",
        "product.volumeExampleMilkDetail":
            "내용량: 1000 / 단위: mL",
        "product.volumeExampleRice":
            "🍚 쌀 5kg",
        "product.volumeExampleRiceDetail":
            "내용량: 5 / 단위: kg",
        "product.volumeExampleBread":
            "🍞 식빵 6장",
        "product.volumeExampleBreadDetail":
            "내용량: 6 / 단위: 장",

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
        "product.priceCalc": "가격 계산",
        "product.pricePlaceholder": "예: 298",

        "product.shareTitle":
            "Cocartly 상품 데이터베이스에 공유",
        "product.shareDescription":
            "상품명, 상품 코드, 카테고리 등을 공유합니다. 가격과 구매처는 공유되지 않습니다.",
        "product.shareThanks":
            "상품 정보 개선에 협조해 주셔서 감사합니다.",

        "product.save": "저장",
        "product.cancelEdit": "✕ 편집 취소",
        "product.deletedItems": "🗑 삭제된 항목",
        "product.registered": "등록된 상품",
        "product.allCategories": "카테고리: 전체",

        "product.validation.volumeNeedsUnit":
            "내용량을 입력한 경우 단위도 선택해 주세요.",
        "product.validation.unitNeedsVolume":
            "단위를 선택한 경우 내용량도 입력해 주세요.",
        "product.validation.nameRequired":
            "상품명을 입력해 주세요.",
        "product.validation.categoryRequired":
            "상품 카테고리를 선택해 주세요.",
        "product.validation.storeRequired":
            "구매처를 선택해 주세요.",
        "product.validation.priceInvalid":
            "가격은 0 이상으로 입력해 주세요.",

        "product.message.saved":
            "✓ 저장했습니다",
        "product.message.savedOffline":
            "✓ 기기에 저장했습니다. 온라인 상태가 되면 동기화할 수 있습니다.",
        "product.message.editCancelled":
            "상품 편집을 취소했습니다.",

        "settings.title": "설정",
        "settings.backHome": "← 🏠 홈으로",

        "settings.basic": "기본 설정",
        "settings.language": "🌐 표시 언어",
        "settings.baseCountry": "🌍 주로 쇼핑하는 국가·지역",

        "settings.management": "관리",

        "settings.category.title": "상품 카테고리 관리",
        "settings.category.guide":
            "상품 등록에 사용하는 카테고리를 추가하거나 수정합니다.",

        "settings.store.title": "구매처 관리",
        "settings.store.guide":
            "슈퍼마켓이나 드럭스토어 등의 구매처를 추가하거나 수정합니다.",

        "settings.data": "데이터",

        "settings.backup.title": "데이터 백업",
        "settings.backup.guide":
            "기기 변경이나 만일의 상황에 대비해 Cocartly 데이터를 저장합니다.",

        "settings.restore.title": "백업에서 복원",
        "settings.restore.guide":
            "저장한 Cocartly 데이터를 이 기기에 복원합니다.",

        "settings.app": "앱",

        "settings.about.title": "Cocartly 정보",
        "settings.about.guide":
            "Cocartly의 개요와 주요 기능을 확인합니다.",

        "settings.version": "🔖 버전",

        "settings.privacy.title": "개인정보 처리방침",
        "settings.privacy.guide":
            "Cocartly의 데이터 처리 방법을 확인합니다.",

        "setup.welcome": "Cocartly에 오신 것을 환영합니다",
        "setup.countryGuide":
            "평소 쇼핑하는 국가 또는 지역을 선택하세요.",

        "setup.languageLabel": "표시 언어",
        "setup.countryLabel":
            "평소 쇼핑하는 국가 또는 지역",

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
        "country.OTHER": "기타"
    },


    "zh-CN": {
        "common.start": "开始",
        "common.cancel": "取消",
        "common.save": "保存",
        "common.close": "关闭",

        "home.catch": "让购物更智能。",
        "home.code": "扫描条码",
        "home.product": "添加商品",
        "home.shopping": "购物计划",
        "home.history": "购买记录与价格比较",
        "home.outing": "出行清单",
        "home.notice": "通知",
        "home.settings": "设置",

        "product.title": "添加商品",
        "product.backHome": "← 🏠 返回主页",
        "product.help": "使用方法",

        "product.name": "商品名称",
        "product.namePlaceholder": "例：洗发水",

        "product.code": "商品代码",
        "product.codePlaceholder":
            "扫描条码时自动输入",
        "product.codeGuide":
            "※ 有条码的商品请通过“扫描条码”进行登记。",

        "product.category": "商品分类",
        "product.categoryManage": "⚙ 商品分类管理",

        "product.country": "国家或地区",

        "product.store": "购买地点",
        "product.storeManage": "🏬 购买地点管理",

        "product.volume": "净含量",
        "product.volumeExample": "输入示例",
        "product.volumePlaceholder": "例：400",

        "product.volumeExampleTitle":
            "净含量和单位输入示例",
        "product.volumeExampleEgg":
            "🥚 大号鸡蛋10个",
        "product.volumeExampleEggDetail":
            "净含量：10 / 单位：个",
        "product.volumeExampleMilk":
            "🥛 牛奶1000mL",
        "product.volumeExampleMilkDetail":
            "净含量：1000 / 单位：mL",
        "product.volumeExampleRice":
            "🍚 大米5kg",
        "product.volumeExampleRiceDetail":
            "净含量：5 / 单位：kg",
        "product.volumeExampleBread":
            "🍞 切片面包6片",
        "product.volumeExampleBreadDetail":
            "净含量：6 / 单位：片",

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
            "共享商品名称、商品代码、商品分类等信息。价格和购买地点不会被共享。",
        "product.shareThanks":
            "感谢您帮助完善 Cocartly 的商品信息。",

        "product.save": "保存",
        "product.cancelEdit": "✕ 取消编辑",
        "product.deletedItems": "🗑 已删除商品",
        "product.registered": "已登记商品",
        "product.allCategories": "分类：全部",

        "product.validation.volumeNeedsUnit":
            "填写净含量时，请同时选择单位。",
        "product.validation.unitNeedsVolume":
            "选择单位时，请同时填写净含量。",
        "product.validation.nameRequired":
            "请输入商品名称。",
        "product.validation.categoryRequired":
            "请选择商品分类。",
        "product.validation.storeRequired":
            "请选择购买地点。",
        "product.validation.priceInvalid":
            "请输入大于或等于0的价格。",

        "product.message.saved":
            "✓ 已保存",
        "product.message.savedOffline":
            "✓ 已保存到此设备。联网后可以同步。",
        "product.message.editCancelled":
            "已取消商品编辑。",

        "settings.title": "设置",
        "settings.backHome": "← 🏠 返回主页",

        "settings.basic": "基本设置",
        "settings.language": "🌐 显示语言",
        "settings.baseCountry": "🌍 常购物的国家或地区",

        "settings.management": "管理",

        "settings.category.title": "商品分类管理",
        "settings.category.guide":
            "添加或编辑商品登记时使用的分类。",

        "settings.store.title": "购买地点管理",
        "settings.store.guide":
            "添加或编辑超市、药妆店等购买地点。",

        "settings.data": "数据",

        "settings.backup.title": "备份数据",
        "settings.backup.guide":
            "为更换设备或意外情况保存 Cocartly 数据。",

        "settings.restore.title": "从备份恢复",
        "settings.restore.guide":
            "将已保存的 Cocartly 数据恢复到此设备。",

        "settings.app": "应用",

        "settings.about.title": "关于 Cocartly",
        "settings.about.guide":
            "查看 Cocartly 的概要和主要功能。",

        "settings.version": "🔖 版本",

        "settings.privacy.title": "隐私政策",
        "settings.privacy.guide":
            "查看 Cocartly 如何处理您的数据。",

        "setup.welcome": "欢迎使用 Cocartly",
        "setup.countryGuide":
            "请选择您平时购物的国家或地区。",

        "setup.languageLabel": "显示语言",
        "setup.countryLabel":
            "平时购物的国家或地区",

        "language.ja": "日语",
        "language.en": "英语",
        "language.ko": "韩语",
        "language.zh-CN": "简体中文",
        "language.zh-TW": "繁体中文",
        "language.fr": "法语",

        "country.JP": "日本",
        "country.US": "美国",
        "country.CA": "加拿大",
        "country.AU": "澳大利亚",
        "country.KR": "韩国",
        "country.CN": "中国",
        "country.TW": "台湾",
        "country.OTHER": "其他"
    },


    "zh-TW": {
        "common.start": "開始",
        "common.cancel": "取消",
        "common.save": "儲存",
        "common.close": "關閉",

        "home.catch": "讓購物更聰明。",
        "home.code": "掃描條碼",
        "home.product": "新增商品",
        "home.shopping": "購物計畫",
        "home.history": "購買紀錄與價格比較",
        "home.outing": "外出清單",
        "home.notice": "通知",
        "home.settings": "設定",

        "product.title": "新增商品",
        "product.backHome": "← 🏠 返回首頁",
        "product.help": "使用方法",

        "product.name": "商品名稱",
        "product.namePlaceholder": "例：洗髮精",

        "product.code": "商品代碼",
        "product.codePlaceholder":
            "掃描條碼時自動輸入",
        "product.codeGuide":
            "※ 有條碼的商品請透過「掃描條碼」進行登錄。",

        "product.category": "商品分類",
        "product.categoryManage": "⚙ 商品分類管理",

        "product.country": "國家或地區",

        "product.store": "購買地點",
        "product.storeManage": "🏬 購買地點管理",

        "product.volume": "內容量",
        "product.volumeExample": "輸入範例",
        "product.volumePlaceholder": "例：400",

        "product.volumeExampleTitle":
            "內容量與單位輸入範例",
        "product.volumeExampleEgg":
            "🥚 L尺寸雞蛋10個",
        "product.volumeExampleEggDetail":
            "內容量：10 / 單位：個",
        "product.volumeExampleMilk":
            "🥛 牛奶1000mL",
        "product.volumeExampleMilkDetail":
            "內容量：1000 / 單位：mL",
        "product.volumeExampleRice":
            "🍚 白米5kg",
        "product.volumeExampleRiceDetail":
            "內容量：5 / 單位：kg",
        "product.volumeExampleBread":
            "🍞 吐司6片",
        "product.volumeExampleBreadDetail":
            "內容量：6 / 單位：片",

        "product.unit": "單位",
        "product.select": "請選擇",

        "product.unit.each": "個",
        "product.unit.sheet": "片",
        "product.unit.bottle": "瓶",
        "product.unit.bag": "袋",
        "product.unit.box": "盒",
        "product.unit.pack": "包",
        "product.unit.roll": "卷",

        "product.price": "價格（含稅）",
        "product.priceCalc": "價格計算",
        "product.pricePlaceholder": "例：298",

        "product.shareTitle":
            "分享到 Cocartly 商品資料庫",
        "product.shareDescription":
            "分享商品名稱、商品代碼、商品分類等資訊。價格與購買地點不會被分享。",
        "product.shareThanks":
            "感謝您協助完善 Cocartly 的商品資訊。",

        "product.save": "儲存",
        "product.cancelEdit": "✕ 取消編輯",
        "product.deletedItems": "🗑 已刪除商品",
        "product.registered": "已登錄商品",
        "product.allCategories": "分類：全部",

        "product.validation.volumeNeedsUnit":
            "輸入內容量時，請同時選擇單位。",
        "product.validation.unitNeedsVolume":
            "選擇單位時，請同時輸入內容量。",
        "product.validation.nameRequired":
            "請輸入商品名稱。",
        "product.validation.categoryRequired":
            "請選擇商品分類。",
        "product.validation.storeRequired":
            "請選擇購買地點。",
        "product.validation.priceInvalid":
            "請輸入大於或等於0的價格。",

        "product.message.saved":
            "✓ 已儲存",
        "product.message.savedOffline":
            "✓ 已儲存到此裝置。連線後即可同步。",
        "product.message.editCancelled":
            "已取消商品編輯。",

        "settings.title": "設定",
        "settings.backHome": "← 🏠 返回首頁",

        "settings.basic": "基本設定",
        "settings.language": "🌐 顯示語言",
        "settings.baseCountry": "🌍 平常購物的國家或地區",

        "settings.management": "管理",

        "settings.category.title": "商品分類管理",
        "settings.category.guide":
            "新增或編輯商品登錄時使用的分類。",

        "settings.store.title": "購買地點管理",
        "settings.store.guide":
            "新增或編輯超市、藥妝店等購買地點。",

        "settings.data": "資料",

        "settings.backup.title": "備份資料",
        "settings.backup.guide":
            "為更換裝置或意外情況儲存 Cocartly 資料。",

        "settings.restore.title": "從備份還原",
        "settings.restore.guide":
            "將已儲存的 Cocartly 資料還原到此裝置。",

        "settings.app": "應用程式",

        "settings.about.title": "關於 Cocartly",
        "settings.about.guide":
            "查看 Cocartly 的概要與主要功能。",

        "settings.version": "🔖 版本",

        "settings.privacy.title": "隱私權政策",
        "settings.privacy.guide":
            "查看 Cocartly 如何處理您的資料。",

        "setup.welcome": "歡迎使用 Cocartly",
        "setup.countryGuide":
            "請選擇您平常購物的國家或地區。",

        "setup.languageLabel": "顯示語言",
        "setup.countryLabel":
            "平常購物的國家或地區",

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
        "country.OTHER": "其他"
    },


    fr: {
        "common.start": "Commencer",
        "common.cancel": "Annuler",
        "common.save": "Enregistrer",
        "common.close": "Fermer",

        "home.catch": "Faites vos achats plus intelligemment.",
        "home.code": "Scanner",
        "home.product": "Ajouter un produit",
        "home.shopping": "Achats prévus",
        "home.history": "Historique et prix",
        "home.outing": "Liste de sortie",
        "home.notice": "Notifications",
        "home.settings": "Paramètres",

        "product.title": "Ajouter un produit",
        "product.backHome": "← 🏠 Accueil",
        "product.help": "Mode d’emploi",

        "product.name": "Nom du produit",
        "product.namePlaceholder": "Ex. : Shampooing",

        "product.code": "Code produit",
        "product.codePlaceholder":
            "Saisi automatiquement lors du scan du code-barres",
        "product.codeGuide":
            "※ Pour un produit avec code-barres, utilisez Scanner.",

        "product.category": "Catégorie de produit",
        "product.categoryManage": "⚙ Gérer les catégories",

        "product.country": "Pays ou région",

        "product.store": "Point de vente",
        "product.storeManage": "🏬 Gérer les points de vente",

        "product.volume": "Quantité / Volume",
        "product.volumeExample": "Exemples",
        "product.volumePlaceholder": "Ex. : 400",

        "product.volumeExampleTitle":
            "Exemples de quantité / volume et d’unité",
        "product.volumeExampleEgg":
            "🥚 10 œufs taille L",
        "product.volumeExampleEggDetail":
            "Quantité / Volume : 10 / Unité : pièce",
        "product.volumeExampleMilk":
            "🥛 Lait 1000 mL",
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
        "product.select": "Sélectionnez",

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
            "Partagez le nom, le code et la catégorie du produit. Les prix et les points de vente ne sont pas partagés.",
        "product.shareThanks":
            "Merci de contribuer à améliorer les informations produits de Cocartly.",

        "product.save": "Enregistrer",
        "product.cancelEdit": "✕ Annuler la modification",
        "product.deletedItems": "🗑 Éléments supprimés",
        "product.registered": "Produits enregistrés",
        "product.allCategories": "Catégorie : toutes",

        "product.validation.volumeNeedsUnit":
            "Veuillez sélectionner une unité lorsque vous saisissez une quantité ou un volume.",
        "product.validation.unitNeedsVolume":
            "Veuillez saisir une quantité ou un volume lorsque vous sélectionnez une unité.",
        "product.validation.nameRequired":
            "Veuillez saisir le nom du produit.",
        "product.validation.categoryRequired":
            "Veuillez sélectionner une catégorie de produit.",
        "product.validation.storeRequired":
            "Veuillez sélectionner un point de vente.",
        "product.validation.priceInvalid":
            "Veuillez saisir un prix supérieur ou égal à 0.",

        "product.message.saved":
            "✓ Enregistré",
        "product.message.savedOffline":
            "✓ Enregistré sur cet appareil. La synchronisation sera possible une fois en ligne.",
        "product.message.editCancelled":
            "La modification du produit a été annulée.",

        "settings.title": "Paramètres",
        "settings.backHome": "← 🏠 Accueil",

        "settings.basic": "Paramètres de base",
        "settings.language": "🌐 Langue d’affichage",
        "settings.baseCountry": "🌍 Pays ou région d’achat habituel",

        "settings.management": "Gestion",

        "settings.category.title": "Catégories de produits",
        "settings.category.guide":
            "Ajoutez ou modifiez les catégories utilisées pour les produits.",

        "settings.store.title": "Points de vente",
        "settings.store.guide":
            "Ajoutez ou modifiez les supermarchés, pharmacies et autres magasins.",

        "settings.data": "Données",

        "settings.backup.title": "Sauvegarder les données",
        "settings.backup.guide":
            "Enregistrez vos données Cocartly en cas de changement d’appareil.",

        "settings.restore.title": "Restaurer une sauvegarde",
        "settings.restore.guide":
            "Restaurez les données Cocartly sauvegardées sur cet appareil.",

        "settings.app": "Application",

        "settings.about.title": "À propos de Cocartly",
        "settings.about.guide":
            "Découvrez Cocartly et ses principales fonctionnalités.",

        "settings.version": "🔖 Version",

        "settings.privacy.title": "Politique de confidentialité",
        "settings.privacy.guide":
            "Découvrez comment Cocartly traite vos données.",

        "setup.welcome": "Bienvenue sur Cocartly",
        "setup.countryGuide":
            "Choisissez le pays ou la région où vous faites habituellement vos achats.",

        "setup.languageLabel": "Langue d’affichage",
        "setup.countryLabel":
            "Pays ou région où vous faites habituellement vos achats",

        "language.ja": "Japonais",
        "language.en": "Anglais",
        "language.ko": "Coréen",
        "language.zh-CN": "Chinois simplifié",
        "language.zh-TW": "Chinois traditionnel",
        "language.fr": "Français",

        "country.JP": "Japon",
        "country.US": "États-Unis",
        "country.CA": "Canada",
        "country.AU": "Australie",
        "country.KR": "Corée du Sud",
        "country.CN": "Chine",
        "country.TW": "Taïwan",
        "country.OTHER": "Autre"
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
