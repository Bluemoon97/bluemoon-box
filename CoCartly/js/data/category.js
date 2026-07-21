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
   カテゴリー作成
   ========================================== */

function createCategory(name) {

    return {

        id: createCategoryId(),

        name: name,

        createdAt: new Date().toISOString(),

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
   カテゴリー一覧表示
   ========================================== */

function displayCategoryList() {

    const categoryList =
        document.getElementById("categoryList");

    categoryList.innerHTML = "";

    for (const category of categories) {

        if (!category.active) {

            continue;

        }

        categoryList.innerHTML += `

        <div class="product-card">

            <strong>${category.name}</strong>

        </div>

        `;

    }

}

/* ==========================================
   カテゴリープルダウン表示
   ========================================== */

function displayCategorySelect() {

    const cmbCategory =
        document.getElementById("cmbCategory");

    if (!cmbCategory) {

        return;

    }

    cmbCategory.innerHTML = "";

    for (const category of categories) {

        if (!category.active) {

            continue;

        }

        cmbCategory.innerHTML += `

<option value="${category.id}">

${category.name}

</option>

`;

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
   カテゴリー保存 saveCategory()
   ========================================== */

function saveCategory() {

    const txtCategoryName =
        document.getElementById("txtCategoryName");

    const name = txtCategoryName.value.trim();

    if (name === "") {

        return;

    }

    addCategory(name);

    txtCategoryName.value = "";

    displayCategoryList();

    displayCategorySelect();

}

