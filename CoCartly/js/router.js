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

/*
    現在は開発中なので
    画面名だけ表示する。

    将来は
    商品登録画面
    購入予定画面
    設定画面
    などへ切り替える。
*/

function changeScreen(screenName) {

    const homeScreen = document.getElementById("homeScreen");
    const productScreen = document.getElementById("productScreen");

    // 一度すべての画面を非表示にする
    homeScreen.hidden = true;
    productScreen.hidden = true;

    switch (screenName) {

        case "ホーム":

            homeScreen.hidden = false;
            break;

        case "商品登録":

            productScreen.hidden = false;
            break;

        default:

            // 未実装の画面
            homeScreen.hidden = false;

            alert(screenName + "画面（開発中）");

            break;

    }

}