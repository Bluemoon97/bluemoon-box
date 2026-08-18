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

 shoppingAddJan
 → 購入予定＋追加のJAN入力

 outingAddJan
 → お出かけ＋追加の商品選択
*/

let barcodeReadMode =
    "normal";
    