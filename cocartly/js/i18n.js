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
 翻訳データ
 ==========================================
*/

const COCARTLY_TRANSLATIONS = {

    ja: {

        "common.start":
            "はじめる",

        "common.cancel":
            "キャンセル",

        "common.save":
            "保存",

        "common.close":
            "閉じる",

        "setup.welcome":
            "Cocartlyへようこそ",

        "setup.countryGuide":
            "普段買い物する国・地域を選んでください。"

    },


    en: {

        "common.start":
            "Get Started",

        "common.cancel":
            "Cancel",

        "common.save":
            "Save",

        "common.close":
            "Close",

        "setup.welcome":
            "Welcome to Cocartly",

        "setup.countryGuide":
            "Choose the country or region where you usually shop."

    },


    ko: {

        "common.start":
            "시작하기",

        "common.cancel":
            "취소",

        "common.save":
            "저장",

        "common.close":
            "닫기",

        "setup.welcome":
            "Cocartly에 오신 것을 환영합니다",

        "setup.countryGuide":
            "평소 쇼핑하는 국가 또는 지역을 선택하세요."

    },


    "zh-CN": {

        "common.start":
            "开始",

        "common.cancel":
            "取消",

        "common.save":
            "保存",

        "common.close":
            "关闭",

        "setup.welcome":
            "欢迎使用 Cocartly",

        "setup.countryGuide":
            "请选择您平时购物的国家或地区。"

    },


    "zh-TW": {

        "common.start":
            "開始",

        "common.cancel":
            "取消",

        "common.save":
            "儲存",

        "common.close":
            "關閉",

        "setup.welcome":
            "歡迎使用 Cocartly",

        "setup.countryGuide":
            "請選擇您平常購物的國家或地區。"

    },


    fr: {

        "common.start":
            "Commencer",

        "common.cancel":
            "Annuler",

        "common.save":
            "Enregistrer",

        "common.close":
            "Fermer",

        "setup.welcome":
            "Bienvenue sur Cocartly",

        "setup.countryGuide":
            "Choisissez le pays ou la région où vous faites habituellement vos achats."

    }

};


/*
 ==========================================
 現在の表示言語
 ==========================================
*/

let cocartlyCurrentLanguage =
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

        return;

    }


    cocartlyCurrentLanguage =
        normalizedLanguage;

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
