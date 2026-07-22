/* ==========================================
   商品検索API
   Version 1
   ========================================== */

async function searchProductByJan(janCode) {

    console.log("JAN検索:", janCode);

    return {

        jan: janCode,

        name: "テスト商品",

        maker: "テストメーカー",

        category: "テストカテゴリー",

        volume: "450",

        unit: "mL"

    };

}
