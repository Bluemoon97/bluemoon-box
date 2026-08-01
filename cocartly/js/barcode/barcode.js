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

    stopBarcodeReader();

    barcodeSuccess(janCode);

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
   読取成功
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

            /*
             バーコードの読取自体は成功しています。
             APIに商品情報が存在しない状態です。
            */

            alert(
                "バーコードは読み取りましたが、" +
                "商品情報が登録されていませんでした。\n\n" +
                "JAN：" + janCode
            );

            if (scanStatus) {

                scanStatus.textContent =
                    "商品情報が見つかりませんでした。";

            }

            /*
             次の段階で、ここから手入力の商品登録画面へ
             移動する処理を追加します。
            */

            return;

        }

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

        alert(
            "商品情報の検索中に通信エラーが発生しました。"
        );

        if (scanStatus) {

            scanStatus.textContent =
                "通信エラーが発生しました。";

        }

    }

}

