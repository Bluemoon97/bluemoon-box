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

        console.error("cameraVideoが見つかりません。");

        return;

    }

    /* 読取状態を初期化 */

    lastDetectedJan = "";

    sameJanCount = 0;

    scanCompleted = false;

    lastDetectedTime = 0;

    if (scanStatus) {

        scanStatus.textContent =
            "バーコードを枠の中央に合わせてください。";

    }

    /* iPhoneで全画面動画になるのを防ぐ */

    video.setAttribute("playsinline", "true");

    video.setAttribute("muted", "true");

    video.autoplay = true;

    try {

        barcodeReader =
            new ZXing.BrowserMultiFormatReader();

        const devices =
            await barcodeReader.listVideoInputDevices();

        if (!devices || devices.length === 0) {

            if (scanStatus) {

                scanStatus.textContent =
                    "使用できるカメラが見つかりません。";

            }

            return;

        }

        /*
         最後のカメラを使用します。
         現在のiPhoneでリアカメラになっている設定を維持します。
        */

        const deviceId =
            devices[devices.length - 1].deviceId;

        console.log(
            "使用するカメラ =",
            deviceId
        );

        barcodeReader.decodeFromVideoDevice(

            deviceId,

            video,

            barcodeResult

        );

        setupCameraFocus(video);

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
   カメラのピント・露出調整
   ========================================== */

async function setupCameraFocus(video) {

    /*
     ZXingがvideo.srcObjectへカメラ映像を設定するまで待つ
    */

    let videoTrack = null;

    for (let count = 0; count < 20; count++) {

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
            "この端末はカメラの詳細設定に対応していません。"
        );

        return;

    }

    const capabilities =
        videoTrack.getCapabilities();

    console.log(
        "カメラ対応機能：",
        capabilities
    );

    const advancedSettings = {};

    /*
     連続オートフォーカス
    */

    if (
        Array.isArray(capabilities.focusMode) &&
        capabilities.focusMode.includes("continuous")
    ) {

        advancedSettings.focusMode =
            "continuous";

    }

    /*
     連続露出調整
    */

    if (
        Array.isArray(capabilities.exposureMode) &&
        capabilities.exposureMode.includes("continuous")
    ) {

        advancedSettings.exposureMode =
            "continuous";

    }

    /*
     連続ホワイトバランス
    */

    if (
        Array.isArray(capabilities.whiteBalanceMode) &&
        capabilities.whiteBalanceMode.includes("continuous")
    ) {

        advancedSettings.whiteBalanceMode =
            "continuous";

    }

    if (Object.keys(advancedSettings).length > 0) {

        try {

            await videoTrack.applyConstraints({

                advanced: [
                    advancedSettings
                ]

            });

            console.log(
                "カメラ自動調整を有効にしました。",
                advancedSettings
            );

        } catch (error) {

            console.log(
                "カメラ自動調整は利用できませんでした。",
                error
            );

        }

    }

    /*
     映像をタップした位置へのフォーカスを試す
     非対応端末では何も起こらず、通常のAFを維持する
    */

    video.onclick = async event => {

        if (!videoTrack) {

            return;

        }

        const rect =
            video.getBoundingClientRect();

        const pointX =
            (event.clientX - rect.left) /
            rect.width;

        const pointY =
            (event.clientY - rect.top) /
            rect.height;

        try {

            await videoTrack.applyConstraints({

                advanced: [

                    {

                        pointsOfInterest: [

                            {
                                x: pointX,
                                y: pointY
                            }

                        ],

                        focusMode: "single-shot"

                    }

                ]

            });

            console.log(
                "タップ位置へピント調整：",
                pointX,
                pointY
            );

            /*
             1秒後に連続オートフォーカスへ戻す
            */

            setTimeout(async () => {

                try {

                    await videoTrack.applyConstraints({

                        advanced: [

                            {
                                focusMode: "continuous"
                            }

                        ]

                    });

                } catch (error) {

                    // 非対応の場合は何もしない

                }

            }, 1000);

        } catch (error) {

            console.log(
                "タップフォーカス非対応端末です。"
            );

            /*
             タップされたことが分かるように、
             通常の連続オートフォーカスを再指定
            */

            try {

                await videoTrack.applyConstraints({

                    advanced: [

                        {
                            focusMode: "continuous"
                        }

                    ]

                });

            } catch (focusError) {

                // 非対応なら端末標準のAFを使用

            }

        }

    };

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

