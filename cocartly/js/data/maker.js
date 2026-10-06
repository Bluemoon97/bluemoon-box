/* ==========================================
   メーカー一覧
   ========================================== */

const makers = [];

/* ==========================================
   最終メーカー番号
   ========================================== */

let lastMakerNumber = 0;

/* ==========================================
   メーカーID作成
   ========================================== */

function createMakerId() {

    lastMakerNumber++;

    return "MK" + String(lastMakerNumber).padStart(6, "0");

}

/* ==========================================
   メーカー作成
   ========================================== */

function createMaker(name) {

    const now = new Date().toISOString();

    return {

        id: createMakerId(),

        name: name,

        createdAt: now,

        updatedAt: now,

        active: true

    };

}

/* ==========================================
   メーカー検索
   ========================================== */

function findMakerByName(name) {

    return makers.find(maker => maker.name === name);

}

/* ==========================================
   メーカー追加
   ========================================== */

function addMaker(name) {

    if (findMakerByName(name)) {

        console.log("登録済みメーカーです。");

        return;

    }

    const maker = createMaker(name);

    makers.push(maker);

    saveMakers();

    console.log(makers);

}

/* ==========================================
   メーカー保存 saveMakers()
   ========================================== */

function saveMakers() {

    localStorage.setItem(

        "shoppingSupport_makers",

        JSON.stringify(makers)

    );

    if (
        typeof notifyCocartlyDataChanged === "function"
    ) {
        notifyCocartlyDataChanged("makers");
    }

}

/* ==========================================
   メーカー読込
   ========================================== */

function loadMakers() {

    const data = localStorage.getItem(

        "shoppingSupport_makers"

    );

    if (!data) {

        return;

    }

    const list = JSON.parse(data);
    const fallbackTime = new Date().toISOString();

    for (const maker of list) {

        if (!maker.createdAt) {
            maker.createdAt = fallbackTime;
        }

        if (!maker.updatedAt) {
            maker.updatedAt = maker.createdAt;
        }

        if (typeof maker.active !== "boolean") {
            maker.active = true;
        }

    }

    makers.length = 0;

    makers.push(...list);

    if (makers.length > 0) {

        lastMakerNumber = Math.max(

            ...makers.map(maker =>
                Number(maker.id.replace("MK", ""))
            )

        );

    }

}

/* ==========================================
   メーカー一覧表示
   ========================================== */

function displayMakerList() {

    const makerList =
        document.getElementById("makerList");

    makerList.innerHTML = "";

    for (const maker of makers) {

        if (!maker.active) {

            continue;

        }

        makerList.innerHTML += `

        <div class="product-card">

            <strong>${maker.name}</strong>

        </div>

        `;

    }

}

/* ==========================================
   メーカープルダウン表示
   ========================================== */

function displayMakerSelect() {

    console.log("displayMakerSelect 開始");

    const cmbMaker =
        document.getElementById("cmbMaker");

    if (!cmbMaker) {

        return;

    }

    cmbMaker.innerHTML = "";

    console.log("メーカー件数 =", makers.length);

    for (const maker of makers) {

        console.log("追加するメーカー", maker);


        if (maker.active === false) {

            continue;

        }

        cmbMaker.innerHTML += `

<option value="${maker.id}">

${maker.name}

</option>

`;

        console.log(cmbMaker.innerHTML);

    }

}

/* ==========================================
   メーカー名取得
   ========================================== */

function getMakerName(makerId) {

    const maker = makers.find(

        maker => maker.id === makerId

    );

    if (!maker) {

        return "";

    }

    return maker.name;

}

/* ==========================================
   メーカー保存 saveMaker()
   ========================================== */

function saveMaker() {

    const txtMakerName =
        document.getElementById("txtMakerName");

    const name = txtMakerName.value.trim();

    if (name === "") {

        return;

    }

    addMaker(name);

    txtMakerName.value = "";

    displayMakerList();

    displayMakerSelect();

}

/* ==========================================
   メーカーID取得
   ========================================== */

function getMakerId(makerName) {

    if (!makerName) {

        return "";

    }

    const maker = makers.find(

        m => m.name === makerName

    );

    if (maker) {

        return maker.id;

    }

    const newMaker = createMaker(makerName);

    makers.push(newMaker);

    saveMakers();

    displayMakerList();

    displayMakerSelect();

    return newMaker.id;

}

/* ==========================================
   メーカープルダウン更新
   ========================================== */

function updateMakerSelect() {

    const cmbMaker =
        document.getElementById("cmbMaker");

    if (!cmbMaker) {

        return;

    }

    cmbMaker.innerHTML = "";

    for (const maker of makers) {

        cmbMaker.innerHTML += `

        <option value="${maker.id}">

            ${maker.name}

        </option>

        `;

    }

}

