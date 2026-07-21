/* ==========================================
   ZXing
   ========================================== */

let barcodeReader = null;

/* ==========================================
   カメラ開始
   ========================================== */

async function startBarcodeReader() {

    const cameraArea = document.getElementById("cameraArea");

    cameraArea.innerHTML =

        '<video id="cameraVideo" autoplay playsinline></video>';

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

    if (result) {

        console.log("JAN:", result.text);

        barcodeReader.reset();

    }

}

