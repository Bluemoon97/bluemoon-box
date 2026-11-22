/* Development-only onboarding for the server-designated test account. */
"use strict";

const CocartlyPremiumDeviceTest = (() => {
    const translations = {
        ja: ["Premium実機テスト", "このアカウントはテスト対象です。無料体験を開始できます。", "無料体験中です。この端末を登録してください。", "Premiumが有効です。この端末でお出かけチェックを試せます。", "無料体験を開始", "この端末を登録", "状態・同期を再確認", "確認中…", "処理に失敗しました。通信やログイン状態を確認してください。"],
        en: ["Premium device test", "This test account can start a free trial.", "Trial active. Register this device.", "Premium is active. You can test outings on this device.", "Start free trial", "Register this device", "Recheck status and sync", "Checking…", "Could not complete this action. Check your connection and sign-in."],
        ko: ["Premium 실제 기기 테스트", "이 테스트 계정은 무료 체험을 시작할 수 있습니다.", "무료 체험 중입니다. 이 기기를 등록하세요.", "Premium이 활성화되었습니다. 이 기기에서 외출 체크를 테스트할 수 있습니다.", "무료 체험 시작", "이 기기 등록", "상태와 동기화 확인", "확인 중…", "실패했습니다. 연결과 로그인 상태를 확인하세요."],
        "zh-CN": ["Premium 真机测试", "此测试账号可以开始免费试用。", "试用已开启，请注册此设备。", "Premium 已启用，可以在此设备测试出行清单。", "开始免费试用", "注册此设备", "重新检查状态和同步", "检查中…", "操作失败，请检查连接和登录状态。"],
        "zh-TW": ["Premium 實機測試", "此測試帳號可以開始免費試用。", "試用已啟用，請註冊此裝置。", "Premium 已啟用，可以在此裝置測試出遊清單。", "開始免費試用", "註冊此裝置", "重新確認狀態和同步", "確認中…", "操作失敗，請檢查連線和登入狀態。"],
        fr: ["Test Premium sur appareil", "Ce compte de test peut démarrer un essai gratuit.", "Essai actif. Enregistrez cet appareil.", "Premium est actif. Vous pouvez tester les sorties sur cet appareil.", "Démarrer l’essai gratuit", "Enregistrer cet appareil", "Vérifier l’état et la synchronisation", "Vérification…", "Échec de l’opération. Vérifiez la connexion et votre session."]
    };

    let operation = null;
    let failed = false;
    let deviceClient = null;

    function selected(status) {
        return status?.release === "test-only" && status.cloud_gate_enforced === true &&
            status.user_id === getCocartlyCloudUserId() &&
            CocartlyOwnerStorage.getOwner() === "user:" + status.user_id;
    }

    function render() {
        const panel = document.getElementById("premiumDeviceTestPanel");
        if (!panel) return;
        const state = cocartlyOutingStatus;
        panel.hidden = !selected(state);
        if (panel.hidden) return;

        const copy = translations[getCocartlyLanguage()] || translations.ja;
        const active = canOpenCocartlyOutingCheck();
        const trial = document.getElementById("premiumDeviceStartTrial");
        const device = document.getElementById("premiumDeviceRegister");
        const refresh = document.getElementById("premiumDeviceRefresh");
        document.getElementById("premiumDeviceTestTitle").textContent = copy[0];
        document.getElementById("premiumDeviceTestStatus").textContent =
            copy[operation ? 7 : failed ? 8 : active ? 3 : state.eligible ? 2 : 1];
        trial.textContent = copy[4];
        device.textContent = copy[5];
        refresh.textContent = copy[6];
        trial.hidden = state.eligible === true;
        device.hidden = state.eligible !== true || active;
        trial.disabled = device.disabled = refresh.disabled = Boolean(operation);
    }

    async function prepareCloud(owner) {
        const legacy = getCocartlySupabase();
        if (typeof legacy?.rpc !== "function") return true;
        const state = await refreshCocartlyOutingAccess();
        if (!CocartlyOwnerStorage.isCurrent(owner)) return false;
        if (state && (!state.cloud_gate_enforced || canOpenCocartlyOutingCheck())) return true;
        // A restricted account must never interpret RLS-filtered empty reads as a successful restore.
        if (cocartlyProductUiReady && document.getElementById("app")?.inert) hydrateCocartlyOwnerView("offline");
        return false;
    }

    function cloudClient() {
        if (cocartlyOutingStatus?.cloud_gate_enforced === false ||
            (!cocartlyOutingStatus && typeof getCocartlySupabase()?.rpc !== "function")) {
            return getCocartlySupabase();
        }
        if (!canOpenCocartlyOutingCheck()) throw new Error("Premium device access unavailable");
        const owner = CocartlyOwnerStorage.snapshot();
        const userId = getCocartlyCloudUserId();
        const device = CocartlyOwnerStorage.getItem(COCARTLY_OUTING_DEVICE_KEY);
        if (!/^[0-9a-f]{64}$/.test(device || "")) throw new Error("Premium device missing");
        if (deviceClient?.device === device && CocartlyOwnerStorage.isCurrent(deviceClient.owner)) {
            return deviceClient.client;
        }
        const client = window.supabase.createClient(COCARTLY_SUPABASE_URL, COCARTLY_SUPABASE_PUBLISHABLE_KEY, {
            accessToken: async () => {
                const session = getCocartlyCloudSession();
                if (!CocartlyOwnerStorage.isCurrent(owner) || session?.user?.id !== userId ||
                    !canOpenCocartlyOutingCheck() || !session.access_token) throw new Error("Premium session changed");
                return session.access_token;
            },
            global: {headers: {"x-cocartly-device-token": device}}
        });
        deviceClient = {owner, device, client};
        return client;
    }

    async function run(action) {
        if (operation || !selected(cocartlyOutingStatus) ||
            !["trial", "device", "refresh"].includes(action)) return;
        const current = {owner: CocartlyOwnerStorage.snapshot()};
        operation = current;
        failed = false;
        render();

        let timer;
        try {
            const state = await refreshCocartlyOutingAccess();
            if (operation !== current || !selected(state)) return;
            const client = getCocartlySupabase();
            let request;
            if (action === "trial" && state.eligible === false) {
                request = client.rpc("cocartly_premium_start_trial");
            } else if (action === "device" && state.eligible === true && state.device_ok === false) {
                const previous = CocartlyOwnerStorage.getItem(COCARTLY_OUTING_DEVICE_KEY);
                const device = /^[0-9a-f]{64}$/.test(previous || "") ? previous :
                    Array.from(crypto.getRandomValues(new Uint8Array(32)), value => value.toString(16).padStart(2, "0")).join("");
                // Keep the same token for a retry if the server succeeds but the response is lost.
                CocartlyOwnerStorage.setItem(COCARTLY_OUTING_DEVICE_KEY, device);
                request = client.rpc("cocartly_premium_register_device", {p_new_token: device, p_old_token: previous || null});
            }
            if (request) {
                const {error} = await Promise.race([request, new Promise((_, reject) => {
                    timer = window.setTimeout(() => reject(new Error("Premium action timed out")), 8000);
                })]);
                if (error) throw error;
            }
            if (!CocartlyOwnerStorage.isCurrent(current.owner)) return;
            if (!selected(await refreshCocartlyOutingAccess())) throw new Error("Premium test status unavailable");
            if (canOpenCocartlyOutingCheck()) await restoreAndMergeCocartlyCloud();
        } catch (_) {
            if (operation === current) failed = true;
        } finally {
            window.clearTimeout(timer);
            if (operation === current) {
                operation = null;
                render();
            }
        }
    }

    window.addEventListener("cocartly-auth-owner-changing", () => {
        operation = null;
        failed = false;
        deviceClient = null;
        render();
    });
    return Object.freeze({run, render, prepareCloud, cloudClient});
})();
