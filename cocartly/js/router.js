/* ==========================================
   Shopping Support
   Version 0.1.0

   router.js

   画面切替管理

   このファイルは
   アプリ内の画面切替だけを担当する。

   ========================================== */

"use strict";

/* ==========================================
   画面切替
   ========================================== */

function changeScreen(screenName) {

    const screens =
        document.querySelectorAll(
            "#app > section"
        );

    /*
     一度すべての画面を非表示
    */

    for (const screen of screens) {

        screen.hidden = true;

    }

    /*
     指定された画面を表示
    */

    switch (screenName) {

        case "ホーム":

            document.getElementById(
                "homeScreen"
            ).hidden = false;

            break;

        case "商品登録":

            document.getElementById(
                "productScreen"
            ).hidden = false;

            break;

        case "履歴・価格比較":

            document.getElementById(
                "historyScreen"
            ).hidden = false;

            break;

        case "今回価格記録":

            document.getElementById(
                "priceRecordScreen"
            ).hidden = false;

            break;

        default:

            document.getElementById(
                "homeScreen"
            ).hidden = false;

            console.warn(
                screenName +
                "画面はまだ未実装です。"
            );

            break;

    }

}