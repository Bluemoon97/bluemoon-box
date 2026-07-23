/* ==========================================
   ZXing
   ========================================== */

let barcodeReader = null;

/* ==========================================
   カメラ開始
   ========================================== */

async function startBarcodeReader() {

    barcodeReader = new ZXing.BrowserMultiFormatReader();

    const video = document.getElementById("cameraVideo");

    const devices = await barcodeReader.listVideoInputDevices();

    let deviceId = devices[0].deviceId;

    const backCamera = devices.find(device =>

        device.label.toLowerCase().includes("back") ||

        device.label.toLowerCase().includes("rear")

    );

    if (backCamera) {

        deviceId = backCamera.deviceId;

    }

    barcodeReader.decodeFromVideoDevice(

        deviceId,

        video,

        barcodeResult

    );

}

/* ==========================================
   バーコード取得
   ========================================== */

function barcodeResult(result, err) {

    if (!result) {

        return;

    }

    const janCode = result.text;

    console.log("JAN:", janCode);

    document.getElementById("scanStatus").textContent =
        "読取成功";

    barcodeSuccess(janCode);

    stopBarcodeReader();

}

/* ==========================================
   カメラ停止
   ========================================== */

function stopBarcodeReader() {

    if (barcodeReader) {

        barcodeReader.reset();

    }

}

/* ==========================================
   読取成功
   ========================================== */

async function barcodeSuccess(janCode) {

    const product = await searchProductByJan(janCode);

    if (product === null) {

        alert("商品が見つかりませんでした。");

        return;

    }

    document.getElementById("codeScreen").hidden = true;

    document.getElementById("productScreen").hidden = false;

    setProductInfo(product);
}

