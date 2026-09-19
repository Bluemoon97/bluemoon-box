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


        const categoryDisplayName =
            defaultCategory &&
                typeof getCategoryDisplayName ===
                "function"

                ? getCategoryDisplayName(
                    category
                )

                : category.name;


        categoryList.innerHTML += `

        <div class="master-card">

            <div class="category-master-info">

                <strong>
                    ${categoryDisplayName}
                </strong>

                <small>
                    ${defaultCategory
                ? t("category.list.default")
                : t("category.list.user")}
                </small>

            </div>

            <div class="master-buttons">

                ${defaultCategory

                ?

                `
                    <span class="master-protected">
                        ${t("category.list.protected")}
                    </span>
                    `

                :

                `
                    <button
                        onclick="editCategory('${category.id}')">

                        ${t("category.list.edit")}

                    </button>

                    <button
                        onclick="deleteCategoryData('${category.id}')">

                        ${t("category.list.delete")}

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
        `<option value="">${t("product.select")}</option>`;

    for (const category of categories) {

        if (!category.active) {

            continue;

        }

        const option =
            document.createElement("option");

        option.value =
            category.id;

        option.textContent =
            typeof getCategoryDisplayName ===
                "function"

                ? getCategoryDisplayName(
                    category
                )

                : category.name;

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
            t("category.validation.nameRequired")
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
            t("category.validation.duplicate")
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
                t("category.message.editNotFound")
            );

            editingCategoryId = null;

            return;

        }

        if (isDefaultCategory(category.name)) {

            alert(
                t("category.default.editBlocked")
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
            t("category.default.editBlocked")
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
            t("category.default.deleteBlocked")
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
                t("category.confirm.deleteUsed")
            );

        if (!confirmed) {

            return;

        }

    } else {

        const confirmed =
            confirm(
                t("category.confirm.delete")
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

