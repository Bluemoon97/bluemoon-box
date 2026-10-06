/* ==========================================
   商品検索API
   Version 1
   ========================================== */

/* ==========================================
   商品検索API
   ========================================== */

async function searchProductByJan(janCode) {

    console.log("JAN検索:", janCode);

    /*
     ① 自分の商品マスターを検索
    */

    const registeredProduct = products.find(

        product =>

            product.active &&

            (
                product.janCode === janCode ||

                product.jan === janCode
            )

    );

    if (registeredProduct) {

        console.log(
            "登録済み商品を使用",
            registeredProduct
        );

        return {

            ...registeredProduct,

            searchSource: "local"

        };

    }

    /*
     ② Cocartly API検索
    */

    const product =
        await searchProductFromApi(
            janCode
        );

    if (!product) {

        return null;

    }

    return {

        ...product,

        searchSource: "api"

    };

}

/* ==========================================
   API検索
   ========================================== */

async function searchProductFromApi(janCode) {

    /* API接続 */

    const useApi = true;

    if (!useApi) {

        return {

            jan: janCode,

            name: "テスト商品",

            maker: "テストメーカー",

            category: "テストカテゴリー",

            volume: "450",

            unit: "mL"

        };

    }

    const response = await fetch(

        "https://world.openfoodfacts.org/api/v2/product/" +

        janCode +

        ".json"

    );

    const data = await response.json();

    if (!data.product) {

        return null;

    }

    /* ==========================================
   内容量分解
   ========================================== */

    let volume = "";
    let unit = "";

    if (data.product.quantity) {

        const match = data.product.quantity.match(
            /^([\d\.]+)\s*([a-zA-Zぁ-んァ-ヶ一-龠]+)$/
        );

        if (match) {

            volume = match[1];

            unit = match[2];

        }

    }

    /* ==========================================
   メーカーID取得
   ========================================== */

    const makerId = getMakerId(

        data.product.brands || ""

    );

    return {

        jan: janCode,

        name: data.product.product_name || "",

        makerId: makerId,

        category: data.product.categories || "",

        volume: volume,

        unit: unit

    };

}
