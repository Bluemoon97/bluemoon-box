/* ==========================================
   Shopping Support
   Version 0.1.0

   product.js

   商品マスター管理
   ========================================== */

"use strict";

/* ==========================================
   商品一覧
   ========================================== */

const products = [];

/* ==========================================
   最終商品番号
   ========================================== */

let lastProductNumber = 0;


/* ==========================================
   商品ID作成
   ========================================== */

function createProductId() {

   lastProductNumber++;

   return "PR" + String(lastProductNumber).padStart(6, "0");

}

/* ==========================================
   商品追加
   ========================================== */

function addProduct(product) {

   products.push(product);

   saveProducts();

   console.log(products);

}

/* ==========================================
   商品オブジェクト作成
   ========================================== */

function createProduct(data) {

   const now = new Date().toISOString();

   return {

      id: createProductId(),
      name: data.name,
      makerId: data.makerId,
      categoryId: data.categoryId,
      janCode: data.janCode,
      volume: data.volume,
      unit: data.unit,
      storeId: data.storeId,
      shared: data.shared,
      favorite:
         false,
      createdAt: now,
      updatedAt: now,
      active: true

   };

}

/* ==========================================
   商品保存
   ========================================== */

function saveProducts() {

   CocartlyOwnerStorage.setItem(

      "shoppingSupportProducts",
      JSON.stringify(products)

   );

   if (
      typeof notifyCocartlyDataChanged === "function"
   ) {
      notifyCocartlyDataChanged("products");
   }

}

/* ==========================================
   商品読込
   ========================================== */

function loadProducts() {

   // アカウント切り替え時に前の商品を残さない
   products.length = 0;
   lastProductNumber = 0;

   const data = CocartlyOwnerStorage.getItem(

      "shoppingSupportProducts"

   );

   if (data === null) {

      return;

   }

   const list = JSON.parse(data);

   if (!Array.isArray(list)) {

      return;

   }

   products.push(...list);

   if (products.length > 0) {

      lastProductNumber = Math.max(
         0,
         ...products.map(item => {

            const match =
               typeof item?.id === "string"
                  ? item.id.match(/^PR(\d+)$/)
                  : null;

            return match ? Number(match[1]) : 0;

         })
      );

   }

}

/* ==========================================
   商品検索
   ========================================== */

function findProduct(productId) {

   return products.find(

      product => product.id === productId

   );

}

/* ==========================================
   商品更新
   ========================================== */

function updateProduct(updatedProduct) {

   const index = products.findIndex(

      product => product.id === updatedProduct.id

   );

   if (index === -1) {

      return false;

   }

   updatedProduct.updatedAt = new Date().toISOString();

   products[index] = updatedProduct;

   saveProducts();

   return true;

}

/* ==========================================
   商品削除（論理削除）
   ========================================== */

function deleteProductData(productId) {

   const product = products.find(

      product => product.id === productId

   );

   if (!product) {

      return;

   }

   product.active = false;

   product.updatedAt = new Date().toISOString();

   saveProducts();

}

