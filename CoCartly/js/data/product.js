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

   return {

      id: createProductId(),

      name: data.name,

      makerId: data.makerId,

      categoryId: data.categoryId,

      janCode: data.janCode,

      volume: data.volume,

      unit: data.unit,

      createdAt: new Date().toISOString(),

      active: true

   };

}

/* ==========================================
   商品保存
   ========================================== */

function saveProducts() {

    localStorage.setItem(

        "shoppingSupportProducts",

        JSON.stringify(products)

    );

}

/* ==========================================
   商品読込
   ========================================== */

function loadProducts() {

    const data = localStorage.getItem(

        "shoppingSupportProducts"

    );

    if (data === null) {

        return;

    }

    const list = JSON.parse(data);

    products.length = 0;

    products.push(...list);

    if (products.length > 0) {

        const lastId = products[products.length - 1].id;

        lastProductNumber = Number(lastId.replace("PR", ""));

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

