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

    return {

        id: createMakerId(),

        name: name,

        createdAt: new Date().toISOString(),

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

    makers.length = 0;

    makers.push(...JSON.parse(data));

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

    const cmbMaker =
        document.getElementById("cmbMaker");

    if (!cmbMaker) {

        return;

    }

    cmbMaker.innerHTML = "";

    for (const maker of makers) {

        if (!maker.active) {

            continue;

        }

        cmbMaker.innerHTML += `

<option value="${maker.id}">

${maker.name}

</option>

`;

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

    const newMaker = {

        id: createMakerId(),

        name: makerName

    };

    makers.push(newMaker);

    saveMakers();

    displayMakerList();

    updateMakerSelect();

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

