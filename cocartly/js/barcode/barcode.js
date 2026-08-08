/* ==========================================
   ZXing
   ========================================== */

let barcodeReader = null;

/* ==========================================
   バーコード読取状態
   ========================================== */

let lastDetectedJan = "";

let sameJanCount = 0;

let scanCompleted = false;

let lastDetectedTime = 0;

const scanSuccess =
    document.getElementById("scanSuccess");

if (scanSuccess) {

    scanSuccess.hidden = true;

}

/* ==========================================
   カメラ開始
   ========================================== */

async function startBarcodeReader() {

    const video =
        document.getElementById("cameraVideo");

    const scanStatus =
        document.getElementById("scanStatus");

    if (!video) {

        console.error(
            "cameraVideoが見つかりません。"
        );

        return;

    }

    /*
     読取状態を初期化
    */

    lastDetectedJan = "";

    sameJanCount = 0;

    scanCompleted = false;

    lastDetectedTime = 0;

    if (scanStatus) {

        scanStatus.textContent =
            "バーコードを枠の中央に合わせてください。";

    }

    video.setAttribute(
        "playsinline",
        "true"
    );

    video.setAttribute(
        "muted",
        "true"
    );

    video.autoplay = true;

    /*
     背面カメラと高めの解像度を希望する
     非対応端末では利用可能な設定へ自動調整される
    */

    const constraints = {

        audio: false,

        video: {

            facingMode: {
                ideal: "environment"
            },

            width: {
                ideal: 1920
            },

            height: {
                ideal: 1080
            },

            frameRate: {
                ideal: 30,
                max: 30
            }

        }

    };

    try {

        barcodeReader =
            new ZXing.BrowserMultiFormatReader();

        barcodeReader.decodeFromConstraints(

            constraints,

            video,

            barcodeResult

        );

        /*
         カメラ映像開始後に
         オートフォーカスとズームを試す
        */

        setupCameraOptimization(video);

    } catch (error) {

        console.error(
            "カメラ開始エラー：",
            error
        );

        if (scanStatus) {

            scanStatus.textContent =
                "カメラを開始できませんでした。";

        }

    }

}

/* ==========================================
   カメラ画質・ピント・ズーム調整
   ========================================== */

async function setupCameraOptimization(video) {

    let videoTrack = null;

    /*
     ZXingがカメラ映像をvideoへ設定するまで待つ
    */

    for (let count = 0; count < 30; count++) {

        const stream = video.srcObject;

        if (stream) {

            const tracks = stream.getVideoTracks();

            if (tracks.length > 0) {

                videoTrack = tracks[0];

                break;

            }

        }

        await new Promise(resolve => {

            setTimeout(resolve, 100);

        });

    }

    if (!videoTrack) {

        console.log(
            "カメラトラックを取得できませんでした。"
        );

        return;

    }

    if (
        typeof videoTrack.getCapabilities !== "function" ||
        typeof videoTrack.applyConstraints !== "function"
    ) {

        console.log(
            "この端末では詳細なカメラ調整を利用できません。"
        );

        return;

    }

    const capabilities =
        videoTrack.getCapabilities();

    console.log(
        "カメラ機能：",
        capabilities
    );

    const advancedSettings = {};

    /*
     対応端末では連続オートフォーカスを使用
    */

    if (
        Array.isArray(capabilities.focusMode) &&
        capabilities.focusMode.includes("continuous")
    ) {

        advancedSettings.focusMode =
            "continuous";

    }

    /*
     小さいバーコード向けに少しだけズームする
     最大ズームの25％程度に抑える
    */

    if (
        capabilities.zoom &&
        typeof capabilities.zoom.min === "number" &&
        typeof capabilities.zoom.max === "number"
    ) {

        const minimumZoom =
            capabilities.zoom.min;

        const maximumZoom =
            capabilities.zoom.max;

        const preferredZoom =
            Math.min(

                maximumZoom,

                Math.max(

                    minimumZoom,

                    minimumZoom +
                    (maximumZoom - minimumZoom) * 0.25

                )

            );

        advancedSettings.zoom =
            Number(preferredZoom.toFixed(1));

    }

    if (Object.keys(advancedSettings).length === 0) {

        console.log(
            "利用可能なピント・ズーム設定がありません。"
        );

        return;

    }

    try {

        await videoTrack.applyConstraints({

            advanced: [
                advancedSettings
            ]

        });

        console.log(
            "カメラ最適化を適用：",
            advancedSettings
        );

    } catch (error) {

        /*
         非対応端末では標準カメラ設定のまま続行
        */

        console.log(
            "カメラ最適化を適用できませんでした。",
            error
        );

    }

}

/* ==========================================
   バーコード取得
   ========================================== */

function barcodeResult(result, err) {

    if (scanCompleted) {

        return;

    }

    if (!result) {

        return;

    }

    const scanStatus =
        document.getElementById("scanStatus");

    /*
     空白や改行を除去して文字列に統一
    */

    const janCode =
        String(result.text).trim();

    /*
     JAN・EAN・UPCでよく使われる桁数だけ受け付ける
     JAN-8  ：8桁
     UPC-A  ：12桁
     JAN-13 ：13桁
     GTIN-14：14桁
    */

    const isValidCode =
        /^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(
            janCode
        );

    if (!isValidCode) {

        console.log(
            "対象外のコードを無視：",
            janCode
        );

        return;

    }

    const now = Date.now();

    /*
     前回の読取から1.5秒以上経過した場合は
     確認回数をリセット
    */

    if (now - lastDetectedTime > 1500) {

        lastDetectedJan = "";

        sameJanCount = 0;

    }

    lastDetectedTime = now;

    /*
     同じコードを連続で読んだ回数を数える
    */

    if (janCode === lastDetectedJan) {

        sameJanCount++;

    } else {

        lastDetectedJan = janCode;

        sameJanCount = 1;

    }

    console.log(
        "JAN確認：",
        janCode,
        "回数：",
        sameJanCount
    );

    if (scanStatus) {

        scanStatus.textContent =
            sameJanCount === 1
                ? "コードを確認しています…"
                : "読取成功";

    }

    /*
     同じJANを2回確認してから確定
    */

    if (sameJanCount < 2) {

        return;

    }

    /*
     これ以降の重複実行を防ぐ
    */

    scanCompleted = true;

    console.log("JAN確定：", janCode);

    /*
     対応端末では短く振動する
     iPhoneなど非対応端末では何も起きない
    */

    if ("vibrate" in navigator) {

        navigator.vibrate(120);

    }

    /*
     緑色の読取成功表示
    */

    const scanSuccess =
        document.getElementById("scanSuccess");

    if (scanSuccess) {

        scanSuccess.hidden = false;

    }

    stopBarcodeReader();

    /*
     成功表示を少し見せてから商品検索へ進む
    */

    setTimeout(() => {

        barcodeSuccess(janCode);

    }, 350);

}

/* ==========================================
   カメラ停止
   ========================================== */

function stopBarcodeReader() {

    if (barcodeReader) {

        try {

            barcodeReader.reset();

        } catch (error) {

            console.warn(
                "カメラ停止時の警告：",
                error
            );

        }

        barcodeReader = null;

    }

}

/* ==========================================
   API未登録商品の手入力画面を開く
   ========================================== */

function openManualProductRegistration(janCode) {

    const codeScreen =
        document.getElementById("codeScreen");

    const productScreen =
        document.getElementById("productScreen");

    const txtJanCode =
        document.getElementById("txtJanCode");

    const txtProductName =
        document.getElementById("txtProductName");

    const txtVolume =
        document.getElementById("txtVolume");

    const txtPrice =
        document.getElementById("txtPrice");

    const cmbMaker =
        document.getElementById("cmbMaker");

    const cmbCategory =
        document.getElementById("cmbCategory");

    const cmbUnit =
        document.getElementById("cmbUnit");

    const cmbStore =
        document.getElementById("cmbStore");

    const productMessage =
        document.getElementById("productMessage");

    if (!codeScreen || !productScreen) {

        console.error(
            "codeScreenまたはproductScreenが見つかりません。"
        );

        return false;

    }

    stopBarcodeReader();

    codeScreen.hidden = true;

    productScreen.hidden = false;

    if (txtProductName) {

        txtProductName.value = "";

    }

    if (txtJanCode) {

        txtJanCode.value = janCode;

    } else {

        console.error(
            "txtJanCodeが見つかりません。"
        );

    }

    if (txtVolume) {

        txtVolume.value = "";

    }

    if (txtPrice) {

        txtPrice.value = "";

    }

    if (cmbMaker && cmbMaker.options.length > 0) {

        cmbMaker.selectedIndex = 0;

    }

    if (cmbCategory && cmbCategory.options.length > 0) {

        cmbCategory.selectedIndex = 0;

    }

    if (cmbUnit && cmbUnit.options.length > 0) {

        cmbUnit.selectedIndex = 0;

    }

    if (cmbStore && cmbStore.options.length > 0) {

        cmbStore.selectedIndex = 0;

    }

    if (productMessage) {

        productMessage.textContent =
            "商品情報を自動取得できませんでした。" +
            "商品名などを入力して登録してください。";

    }

    if (txtProductName) {

        setTimeout(() => {

            txtProductName.focus();

        }, 100);

    }

    return true;

}

/* ==========================================
   読取成功・商品検索
   ========================================== */

async function barcodeSuccess(janCode) {

    const scanStatus =
        document.getElementById("scanStatus");

    if (scanStatus) {

        scanStatus.textContent =
            "商品情報を検索しています…";

    }

    try {

        const product =
            await searchProductByJan(janCode);

        if (product === null) {

            const scanSuccess =
                document.getElementById("scanSuccess");

            if (scanSuccess) {

                scanSuccess.hidden = true;

            }

            if (scanStatus) {

                scanStatus.textContent =
                    "手入力の商品登録画面を開きます。";

            }

            alert(
                "バーコードは読み取りましたが、" +
                "商品情報が登録されていませんでした。\n\n" +
                "JAN：" + janCode + "\n\n" +
                "商品名などを入力して登録してください。"
            );

            openManualProductRegistration(janCode);

            return;

        }

        /*
         登録済み商品だった場合
        */

        if (product.searchSource === "local") {

            openRegisteredJanInfo(
                product.id
            );

            return;

        }


        /*
         APIで見つかった新しい商品
        */

        document.getElementById("codeScreen").hidden =
            true;

        document.getElementById("productScreen").hidden =
            false;

        setProductInfo(product);

    } catch (error) {

        console.error(
            "商品検索エラー：",
            error
        );

        const scanSuccess =
            document.getElementById("scanSuccess");

        if (scanSuccess) {

            scanSuccess.hidden = true;

        }

        if (scanStatus) {

            scanStatus.textContent =
                "商品情報を取得できなかったため、手入力画面を開きます。";

        }

        alert(
            "商品情報を自動取得できませんでした。\n\n" +
            "JAN：" + janCode + "\n\n" +
            "商品名などを入力して登録してください。"
        );

        openManualProductRegistration(janCode);

    }

}

/* ==========================================
   カメラライト ON / OFF
   ========================================== */

let flashEnabled = false;

async function toggleFlash() {

    const btnFlash =
        document.getElementById(
            "btnFlash"
        );

    const video =
        document.querySelector(
            "#codeScreen video"
        );

    if (
        !video ||
        !video.srcObject
    ) {

        alert(
            "カメラが起動していません。"
        );

        return;

    }

    const tracks =
        video.srcObject.getVideoTracks();

    if (
        !tracks ||
        tracks.length === 0
    ) {

        alert(
            "カメラを取得できませんでした。"
        );

        return;

    }

    const track =
        tracks[0];

    const capabilities =
        typeof track.getCapabilities ===
        "function"

            ? track.getCapabilities()

            : {};


    /*
     ライト非対応端末
    */

    if (!capabilities.torch) {

        alert(
            "この端末またはブラウザではライトを操作できません。"
        );

        return;

    }


    try {

        flashEnabled =
            !flashEnabled;

        await track.applyConstraints({

            advanced: [

                {
                    torch:
                        flashEnabled
                }

            ]

        });


        if (btnFlash) {

            btnFlash.textContent =
                flashEnabled

                    ? "🔦 ライトOFF"

                    : "🔦 ライト";

        }

    } catch (error) {

        console.error(
            "ライト切替エラー：",
            error
        );

        flashEnabled =
            false;

        alert(
            "ライトを切り替えられませんでした。"
        );

    }

}

/* ==========================================
   JANコード手入力
   ========================================== */

async function openJanInput() {

    const input =
        prompt(
            "JANコードを入力してください。\n\n" +
            "8桁または13桁の数字を入力します。"
        );

    /*
     キャンセル
    */

    if (input === null) {

        return;

    }


    const janCode =
        input.trim();


    /*
     空欄
    */

    if (janCode === "") {

        alert(
            "JANコードを入力してください。"
        );

        return;

    }


    /*
     数字以外
    */

    if (!/^\d+$/.test(janCode)) {

        alert(
            "JANコードは数字だけで入力してください。"
        );

        return;

    }


    /*
     JAN-8 / JAN-13
    */

    if (
        janCode.length !== 8 &&
        janCode.length !== 13
    ) {

        alert(
            "JANコードは8桁または13桁で入力してください。"
        );

        return;

    }


    /*
     商品検索開始
    */

    try {

        const product =
            await searchProductByJan(
                janCode
            );


        /*
         商品情報が見つからない
        */

        if (product === null) {

            alert(
                "JANコードを確認しました。\n\n" +
                "JAN：" +
                janCode +
                "\n\n" +
                "商品情報が見つからないため、" +
                "商品登録画面を開きます。"
            );

            openManualProductRegistration(
                janCode
            );

            return;

        }


        /*
         自分の商品マスターに登録済み
        */

        if (
            product.searchSource ===
            "local"
        ) {

            openRegisteredJanInfo(
                product.id
            );

            return;

        }


        /*
         APIで商品が見つかった
        */

        document.getElementById(
            "codeScreen"
        ).hidden = true;

        document.getElementById(
            "productScreen"
        ).hidden = false;

        setProductInfo(
            product
        );


    } catch (error) {

        console.error(
            "JAN手入力検索エラー：",
            error
        );

        alert(
            "商品情報を取得できませんでした。\n\n" +
            "JAN：" +
            janCode +
            "\n\n" +
            "商品登録画面を開きます。"
        );

        openManualProductRegistration(
            janCode
        );

    }

}

