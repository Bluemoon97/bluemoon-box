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

        "product.country": "国・地域",

        "product.store": "購入先",
        "product.storeManage": "🏬 購入先管理",

        "product.volume": "内容量",
        "product.volumeExample": "入力例",
        "product.volumePlaceholder": "例：400",

        "product.unit": "単位",
        "product.select": "選択してください",

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

        "settings.title": "設定",
        "settings.backHome": "← 🏠 ホームへ",

        "settings.basic": "基本設定",
        "settings.language": "🌐 表示言語",
        "settings.baseCountry": "🌍 普段買い物する国・地域",

        "settings.management": "管理",

        "settings.category.title": "商品ジャンル管理",
        "settings.category.guide":
            "商品登録で使うジャンルを追加・編集します。",

        "settings.store.title": "購入先管理",
        "settings.store.guide":
            "スーパーやドラッグストアなどの購入先を追加・編集します。",

        "settings.data": "データ",

        "settings.backup.title": "データをバックアップ",
        "settings.backup.guide":
            "機種変更や万一に備えてCocartlyのデータを保存します。",

        "settings.restore.title": "バックアップから復元",
        "settings.restore.guide":
            "保存したCocartlyのデータをこの端末に戻します。",

        "settings.app": "アプリ",

        "settings.about.title": "Cocartlyについて",
        "settings.about.guide":
            "Cocartlyの概要や主な機能を確認します。",

        "settings.version": "🔖 バージョン",

        "settings.privacy.title": "プライバシーポリシー",
        "settings.privacy.guide":
            "Cocartlyでのデータの取り扱いについて確認します。",

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
        "country.OTHER": "その他"
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

        "product.country": "Country / Region",

        "product.store": "Store",
        "product.storeManage": "🏬 Manage Stores",

        "product.volume": "Quantity / Volume",
        "product.volumeExample": "Examples",
        "product.volumePlaceholder": "e.g. 400",

        "product.unit": "Unit",
        "product.select": "Please select",

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
        "country.OTHER": "Other"
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

        "product.unit": "단위",
        "product.select": "선택해 주세요",

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

        "product.unit": "单位",
        "product.select": "请选择",

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

        "product.unit": "單位",
        "product.select": "請選擇",

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

        "product.unit": "Unité",
        "product.select": "Sélectionnez",

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
