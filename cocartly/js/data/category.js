/* ==========================================
   カテゴリー一覧
   ========================================== */

const categories = [];

/* ==========================================
   最終カテゴリー番号
   ========================================== */

let lastCategoryNumber = 0;

/* ==========================================
   カテゴリーID作成
   ========================================== */

function createCategoryId() {

    lastCategoryNumber++;

    return "CT" + String(lastCategoryNumber).padStart(6, "0");

}

/* ==========================================
   商品ジャンルオブジェクト作成
   ========================================== */

function createCategory(name) {

    return {

        id: createCategoryId(),

        name: String(name).trim(),

        createdAt: new Date().toISOString(),

        updatedAt: new Date().toISOString(),

        active: true

    };

}

/* ==========================================
   カテゴリー検索
   ========================================== */

function findCategoryByName(name) {

    return categories.find(category => category.name === name);

}

/* ==========================================
   カテゴリー追加
   ========================================== */

function addCategory(name) {

    if (findCategoryByName(name)) {

        console.log("登録済みカテゴリーです。");

        return;

    }

    const category = createCategory(name);

    categories.push(category);

    saveCategories();

    console.log(categories);

}

/* ==========================================
   カテゴリー保存 saveCategories()
   ========================================== */

function saveCategories() {

    localStorage.setItem(

        "shoppingSupport_categories",

        JSON.stringify(categories)

    );

}

/* ==========================================
   カテゴリー読込
   ========================================== */

function loadCategories() {

    const data = localStorage.getItem(

        "shoppingSupport_categories"

    );

    if (!data) {

        return;

    }

    categories.length = 0;

    categories.push(...JSON.parse(data));

    if (categories.length > 0) {

        lastCategoryNumber = Math.max(

            ...categories.map(category =>
                Number(category.id.replace("CT", ""))
            )

        );

    }

}

/* ==========================================
   標準商品ジャンル作成
   ========================================== */

function createDefaultCategories() {

    const defaultCategoryNames = [

        "食品",

        "飲料",

        "お菓子",

        "お酒",

        "日用品",

        "洗剤・衛生用品",

        "医薬品",

        "化粧品・美容",

        "衣料品",

        "ベビー用品",

        "ペット用品",

        "文具・雑貨",

        "家電・電池",

        "その他"

    ];

    for (const categoryName of defaultCategoryNames) {

        /*
         同じ名前の商品ジャンルが
         既に存在するか確認
        */

        const existingCategory = categories.find(

            category =>

                category.name === categoryName

        );

        /*
         既に存在する場合は追加しない
        */

        if (existingCategory) {

            continue;

        }

        /*
         存在しない標準ジャンルだけ追加
        */

        addCategory(categoryName);

    }

}

/* ==========================================
   商品ジャンル一覧表示
   ========================================== */

function displayCategoryList() {

    const categoryList =
        document.getElementById("categoryList");

    if (!categoryList) {

        return;

    }

    categoryList.innerHTML = "";

    for (const category of categories) {

        if (!category.active) {

            continue;

        }

        const defaultCategory =
            isDefaultCategory(category.name);

        categoryList.innerHTML += `

        <div class="master-card">

            <div class="category-master-info">

                <strong>
                    ${category.name}
                </strong>

                <small>
                    ${defaultCategory
                        ? "アプリ標準"
                        : "ユーザー追加"}
                </small>

            </div>

            <div class="master-buttons">

                ${defaultCategory

                    ?

                    `
                    <span class="master-protected">
                        変更不可
                    </span>
                    `

                    :

                    `
                    <button
                        onclick="editCategory('${category.id}')">

                        ✏ 編集

                    </button>

                    <button
                        onclick="deleteCategoryData('${category.id}')">

                        🗑 削除

                    </button>
                    `

                }

            </div>

        </div>

        `;

    }

}

/* ==========================================
   商品ジャンル選択欄表示
   ========================================== */

function displayCategorySelect() {

    const cmbCategory =
        document.getElementById("cmbCategory");

    if (!cmbCategory) {

        return;

    }

    cmbCategory.innerHTML =
        '<option value="">商品ジャンルを選択してください</option>';

    for (const category of categories) {

        if (!category.active) {

            continue;

        }

        const option =
            document.createElement("option");

        option.value =
            category.id;

        option.textContent =
            category.name;

        cmbCategory.appendChild(option);

    }

}

/* ==========================================
   カテゴリー名取得
   ========================================== */

function getCategoryName(categoryId) {

    const category = categories.find(

        category => category.id === categoryId

    );

    if (!category) {

        return "";

    }

    return category.name;

}

/* ==========================================
   商品ジャンル登録・更新
   ========================================== */

function saveCategory() {

    const txtCategoryName =
        document.getElementById("txtCategoryName");

    if (!txtCategoryName) {

        return;

    }

    const categoryName =
        txtCategoryName.value.trim();

    if (categoryName === "") {

        alert(
            "商品ジャンル名を入力してください。"
        );

        txtCategoryName.focus();

        return;

    }

    /*
     同じ名前の商品ジャンルが存在するか確認
    */

    const duplicateCategory =
        categories.find(

            category =>

                category.active &&

                category.name.toLowerCase() ===
                    categoryName.toLowerCase() &&

                category.id !== editingCategoryId

        );

    if (duplicateCategory) {

        alert(
            "同じ商品ジャンルが既に登録されています。"
        );

        return;

    }

    /*
     新規登録
    */

    if (editingCategoryId === null) {

        addCategory(categoryName);

    /*
     名前の更新
    */

    } else {

        const category =
            categories.find(

                category =>
                    category.id === editingCategoryId

            );

        if (!category) {

            alert(
                "編集する商品ジャンルが見つかりません。"
            );

            editingCategoryId = null;

            return;

        }

        if (isDefaultCategory(category.name)) {

            alert(
                "標準の商品ジャンルは変更できません。"
            );

            editingCategoryId = null;

            return;

        }

        category.name =
            categoryName;

        category.updatedAt =
            new Date().toISOString();

        saveCategories();

        editingCategoryId = null;

    }

    txtCategoryName.value = "";

    displayCategoryList();

    displayCategorySelect();

}

/* ==========================================
   商品ジャンル編集
   ========================================== */

function editCategory(categoryId) {

    const category =
        categories.find(

            category =>
                category.id === categoryId

        );

    if (!category) {

        return;

    }

    if (isDefaultCategory(category.name)) {

        alert(
            "標準の商品ジャンルは変更できません。"
        );

        return;

    }

    editingCategoryId =
        category.id;

    const txtCategoryName =
        document.getElementById("txtCategoryName");

    txtCategoryName.value =
        category.name;

    txtCategoryName.focus();

}

/* ==========================================
   商品ジャンル削除
   ========================================== */

function deleteCategoryData(categoryId) {

    const category =
        categories.find(

            category =>
                category.id === categoryId

        );

    if (!category) {

        return;

    }

    if (isDefaultCategory(category.name)) {

        alert(
            "標準の商品ジャンルは削除できません。"
        );

        return;

    }

    const usedByProduct =
        products.some(

            product =>

                product.active &&

                product.categoryId === categoryId

        );

    if (usedByProduct) {

        const confirmed =
            confirm(
                "この商品ジャンルは登録済み商品で使用されています。\n\n" +
                "選択候補から削除しますか？\n" +
                "登録済み商品のデータは残ります。"
            );

        if (!confirmed) {

            return;

        }

    } else {

        const confirmed =
            confirm(
                "この商品ジャンルを削除しますか？"
            );

        if (!confirmed) {

            return;

        }

    }

    category.active = false;

    category.updatedAt =
        new Date().toISOString();

    saveCategories();

    if (editingCategoryId === categoryId) {

        editingCategoryId = null;

        document.getElementById(
            "txtCategoryName"
        ).value = "";

    }

    displayCategoryList();

    displayCategorySelect();

}

