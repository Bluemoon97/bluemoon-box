/* ==========================================
   コード読取
   ========================================== */

function readCode() {

    startBarcodeReader();

}

/*
 バーコード読取の使用目的

 normal
 → 通常の商品検索

 priceRecordJan
 → 今回の購入のJAN入力
*/

let barcodeReadMode =
    "normal";
    