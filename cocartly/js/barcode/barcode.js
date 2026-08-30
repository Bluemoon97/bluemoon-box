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

            /*
             背面カメラを優先
            */

            facingMode: {
                ideal: "environment"
            },


            /*
             読取速度と画質のバランスを優先
    
             Full HDを常時要求せず、
             HDを基本にして端末負荷を抑える
            */

            width: {
                ideal: 1280
            },

            height: {
                ideal: 720
            },


            /*
             30fpsを希望
             非対応端末では利用可能な値へ調整される
            */

            frameRate: {
                ideal: 30,
                max: 30
            }

        }

    };

    try {

        /*
         商品バーコードで使用する形式に限定

         EAN-13 / EAN-8
         → 日本・韓国・中国・台湾など

         UPC-A / UPC-E
         → アメリカなど
        */

        const hints =
            new Map();

        hints.set(

            ZXing.DecodeHintType.POSSIBLE_FORMATS,

            [
                ZXing.BarcodeFormat.EAN_13,
                ZXing.BarcodeFormat.EAN_8,
                ZXing.BarcodeFormat.UPC_A,
                ZXing.BarcodeFormat.UPC_E
            ]

        );


        /*
         海外の商品バーコードにも対応した設定で
         ZXingを開始
        */

        barcodeReader =
            new ZXing.BrowserMultiFormatReader(
                hints
            );

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
        "商品コード確認：",
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
     同じ商品コードを2回確認してから確定
    */

    if (sameJanCount < 2) {

        return;

    }

    /*
     これ以降の重複実行を防ぐ
    */

    scanCompleted = true;

    console.log("商品コード確定：", janCode);

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

    /*
     今回の購入画面から
     商品コード読取を開いた場合
    */

    if (
        barcodeReadMode ===
        "priceRecordJan"
    ) {

        /*
         読み取った商品コードを入力欄へ反映
        */

        const janInput =
            document.getElementById(
                "txtPriceRecordJanCode"
            );

        if (janInput) {

            janInput.value =
                janCode;

        }


        /*
         コード読取画面を閉じる
        */

        const codeScreen =
            document.getElementById(
                "codeScreen"
            );

        if (codeScreen) {

            codeScreen.hidden =
                true;

        }


        /*
         今回の購入画面へ戻る
        */

        const priceRecordScreen =
            document.getElementById(
                "priceRecordScreen"
            );

        if (priceRecordScreen) {

            priceRecordScreen.hidden =
                false;

        }


        /*
         読取成功表示を戻す
        */

        const scanSuccess =
            document.getElementById(
                "scanSuccess"
            );

        if (scanSuccess) {

            scanSuccess.hidden =
                true;

        }


        /*
         通常読取へ戻しておく
        */

        barcodeReadMode =
            "normal";


        /*
         商品コード入力欄が見える位置へ
        */

        if (janInput) {

            janInput.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "center"

            });

        }


        return;

    }

    /*
     購入予定＋追加から
     商品コード読取を開いた場合
    */

    if (
        barcodeReadMode ===
        "shoppingAddJan"
    ) {

        /*
         読み取った商品コードを
         購入予定＋追加の商品コード欄へ反映
        */

        const janInput =
            document.getElementById(
                "txtShoppingJanCode"
            );

        if (janInput) {

            janInput.value =
                janCode;

        }


        /*
         コード読取画面を閉じる
        */

        const codeScreen =
            document.getElementById(
                "codeScreen"
            );

        if (codeScreen) {

            codeScreen.hidden =
                true;

        }


        /*
         購入予定画面へ戻る
        */

        const shoppingScreen =
            document.getElementById(
                "shoppingScreen"
            );

        if (shoppingScreen) {

            shoppingScreen.hidden =
                false;

        }


        /*
         ＋追加画面を表示
        */

        changeShoppingView(
            "add"
        );


        /*
         読取成功表示を消す
        */

        const scanSuccess =
            document.getElementById(
                "scanSuccess"
            );

        if (scanSuccess) {

            scanSuccess.hidden =
                true;

        }


        /*
         通常のバーコード読取へ戻す
        */

        barcodeReadMode =
            "normal";


        /*
         商品コード入力欄が見える位置へ移動
        */

        if (janInput) {

            janInput.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "center"

            });

        }


        return;

    }

    /*
     お出かけ＋追加から
     商品コード読取を開いた場合
    */

    if (
        barcodeReadMode ===
        "outingAddJan"
    ) {

        /*
         商品コードから
         登録済み商品を探す
        */

        const product =
            products.find(

                product =>

                    product.active !== false &&

                    (
                        product.janCode ===
                        janCode ||

                        product.jan ===
                        janCode
                    )

            );


        /*
 コード読取画面を閉じる
*/

        const codeScreen =
            document.getElementById(
                "codeScreen"
            );


        if (codeScreen) {

            codeScreen.hidden =
                true;

        }


        /*
         未登録商品の場合
        
         ＋追加画面へ戻さず
         そのまま商品登録へ進む
        */

        if (!product) {

            /*
             商品登録後は
             お出かけの商品選択へ戻る
            */

            productRegistrationReturnMode =
                "outingAdd";


            /*
             読取成功表示を消す
            */

            const scanSuccess =
                document.getElementById(
                    "scanSuccess"
                );


            if (scanSuccess) {

                scanSuccess.hidden =
                    true;

            }


            /*
             通常読取へ戻しておく
            */

            barcodeReadMode =
                "normal";


            alert(

                "この商品はまだ登録されていません。\n\n" +

                "商品コード：" +
                janCode +

                "\n\n商品登録画面へ進みます。"

            );


            /*
             商品コードを保持したまま
             商品登録画面へ
            */

            openManualProductRegistration(
                janCode
            );


            return;

        }


        /*
         登録済み商品の場合だけ
         お出かけチェック画面へ戻る
        */

        const outingCheckScreen =
            document.getElementById(
                "outingCheckScreen"
            );


        if (outingCheckScreen) {

            outingCheckScreen.hidden =
                false;

        }


        /*
         商品選択画面を再表示
        */

        changeOutingView(
            "add"
        );


        /*
         商品ジャンル・商品選択欄・
         メッセージを取得
        */

        const categorySelect =
            document.getElementById(
                "cmbOutingProductCategory"
            );


        const message =
            document.getElementById(
                "outingAddProductMessage"
            );


        /*
         登録済み商品が見つかった場合
        */

        if (product) {

            /*
             読み取った商品のジャンルを
             自動選択
            */

            if (
                categorySelect &&
                product.categoryId
            ) {

                categorySelect.value =
                    product.categoryId;

            }


            /*
             選択したジャンルの商品だけに
             プルダウンを作り直す
            */

            displayOutingProductOptions();


            /*
             読み取った商品を
             自動選択
            */

            const productSelect =
                document.getElementById(
                    "cmbOutingAddProduct"
                );


            if (productSelect) {

                productSelect.value =
                    product.id;

            }


            if (message) {

                message.textContent =
                    "商品コードから「" +
                    product.name +
                    "」を選択しました。";

            }

        }


        /*
         読取成功表示を消す
        */

        const scanSuccess =
            document.getElementById(
                "scanSuccess"
            );


        if (scanSuccess) {

            scanSuccess.hidden =
                true;

        }


        /*
         通常読取へ戻しておく
        */

        barcodeReadMode =
            "normal";


        /*
         商品選択欄が見える位置へ
        */

        const selectedProductElement =
            document.getElementById(
                "cmbOutingAddProduct"
            );


        if (selectedProductElement) {

            selectedProductElement.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "center"

            });

        }


        return;

    }

    /*
     ここから下は
     今までの通常の商品検索
    */

    const scanStatus =
        document.getElementById(
            "scanStatus"
        );

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
                "商品コード：" + janCode + "\n\n" +
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
                product.id,
                "code"
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
            "商品コード：" + janCode + "\n\n" +
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
   商品コード手入力
   ========================================== */

async function openJanInput() {

    const input =
        prompt(
            "商品バーコードを入力してください。\n\n" +
            "8桁・12桁・13桁の数字を入力します。"
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
            "商品コードを入力してください。"
        );

        return;

    }


    /*
     数字以外
    */

    if (!/^\d+$/.test(janCode)) {

        alert(
            "商品コードは数字だけで入力してください。"
        );

        return;

    }


    /*
     EAN-8 / UPC-A / EAN-13
    */

    if (
        janCode.length !== 8 &&
        janCode.length !== 12 &&
        janCode.length !== 13
    ) {

        alert(
            "商品バーコードは8桁・12桁・13桁で入力してください。"
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
                "商品コードを確認しました。\n\n" +
                "商品コード：" +
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
                product.id,
                "code"
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
            "商品コード手入力検索エラー：",
            error
        );

        alert(
            "商品情報を取得できませんでした。\n\n" +
            "商品コード：" +
            janCode +
            "\n\n" +
            "商品登録画面を開きます。"
        );

        openManualProductRegistration(
            janCode
        );

    }

}

