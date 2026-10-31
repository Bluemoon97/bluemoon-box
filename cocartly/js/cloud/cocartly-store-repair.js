/*
 * Generic, account-bound store repair importer.
 * No account IDs, product IDs or personal mappings belong in this public file.
 * Selecting a private plan is read-only. Applying requires the visible preview.
 */
(function (global) {
    "use strict";
    const STATE_KEY = "cocartly-store-repair-state";
    const KEYS = Object.freeze({products: "shoppingSupportProducts", priceHistory: "shoppingSupportPriceHistory", storeChecks: "cocartlyStoreChecks"});
    const STORE_KEY = "shoppingSupportStores";
    const COPY = {
        ja: {title: "確認済み購入先を修復", menuGuide: "本人用の修復プランを読み込み、内容を確認して適用します。", back: "設定へ戻る", guide: "本人用の修復プランを選択してください。読み込んだだけでは保存されません。", privacy: "適用すると、このアカウントの端末内データを更新し、個人クラウドへ同期します。価格・購入日・削除状態は維持します。", choose: "修復プランを選択", apply: "表示した内容を適用", ready: "内容を確認してから適用してください。未確定の店舗は変更しません。", working: "適用しています。", done: "確認済みの購入先を反映し、クラウド同期を実行しました。", pending: "端末への反映は完了しました。クラウド同期は未完了で、自動再試行の対象です。", already: "このプランは適用済み、または対象の対応は既に反映されています。変更は行いません。", products: "商品", priceHistory: "購入履歴", storeChecks: "店頭確認", stores: "購入先", newStores: "新規購入先", unchanged: "既に反映済み", deleted: "削除済み（維持）", error: "適用できませんでした。データは自動的に上書きしません。", owner: "このプランの対象アカウントでログインしてください。", changed: "プラン作成後に対象データが変わっています。最新データで確認が必要です。", online: "オンラインでクラウド復元が完了してから実行してください。", invalid: "このファイルは有効な購入先修復プランではありません。", stale: "表示後にデータが変わりました。プランを選び直してください。", backup: "修復前のデータは、このアカウントの端末内に保管します。", unknown: "未設定"},
        en: {title: "Repair confirmed stores", menuGuide: "Load your private plan, review it, then apply.", back: "Back to settings", guide: "Choose your private repair plan. Loading it does not save changes.", privacy: "Applying updates this account's local data and syncs it to its private cloud. Prices, purchase dates and deletion status are preserved.", choose: "Choose repair plan", apply: "Apply displayed changes", ready: "Review before applying. Unconfirmed stores are not changed.", working: "Applying…", done: "Confirmed store changes were applied and cloud sync completed.", pending: "Local changes are saved. Cloud sync is incomplete and can retry automatically.", already: "This plan was already applied, or the mappings are already in place. No changes made.", products: "Products", priceHistory: "Purchase history", storeChecks: "Store checks", stores: "Stores", newStores: "New stores", unchanged: "Already in place", deleted: "Deleted (preserved)", error: "Could not apply the plan. Data is not overwritten automatically.", owner: "Sign in to the account this plan belongs to.", changed: "Target data has changed since this plan was made. A fresh review is required.", online: "Go online and finish cloud restore first.", invalid: "This is not a valid store repair plan.", stale: "Data changed after the preview. Select the plan again.", backup: "Pre-repair data is kept locally for this account.", unknown: "Not set"},
        ko: {title: "확인된 구매처 복구", menuGuide: "개인 복구 계획을 불러와 확인한 후 적용합니다.", back: "설정으로", guide: "개인 복구 계획을 선택하세요. 불러오기만으로 저장하지 않습니다.", privacy: "적용하면 이 계정의 기기 데이터를 수정하고 개인 클라우드에 동기화합니다. 가격·구매일·삭제 상태는 유지합니다.", choose: "복구 계획 선택", apply: "표시된 변경 적용", ready: "확인 후 적용하세요. 미확인 구매처는 변경하지 않습니다.", working: "적용 중…", done: "구매처를 복구하고 클라우드에 동기화했습니다.", pending: "기기에 저장했습니다. 클라우드 동기화는 미완료이며 자동 재시도 대상입니다.", already: "이미 적용된 계획이거나 해당 정보가 이미 반영되어 있습니다. 변경하지 않습니다.", products: "상품", priceHistory: "구매 내역", storeChecks: "매장 확인", stores: "구매처", newStores: "새 구매처", unchanged: "이미 반영됨", deleted: "삭제됨(유지)", error: "적용하지 못했습니다. 데이터를 자동으로 덮어쓰지 않습니다.", owner: "이 계획의 대상 계정으로 로그인하세요.", changed: "계획 작성 후 대상 데이터가 바뀌었습니다. 다시 확인해야 합니다.", online: "온라인에서 클라우드 복원을 완료한 후 실행하세요.", invalid: "유효한 구매처 복구 계획이 아닙니다.", stale: "미리보기 후 데이터가 바뀌었습니다. 계획을 다시 선택하세요.", backup: "복구 전 데이터는 이 계정의 기기에 보관합니다.", unknown: "미설정"},
        "zh-CN": {title: "修复已确认的购买地点", menuGuide: "导入私人修复方案，确认后应用。", back: "返回设置", guide: "选择私人修复方案。仅加载不会保存更改。", privacy: "应用后会更新此账号的本机数据并同步至私人云端。价格、购买日期和删除状态保持不变。", choose: "选择修复方案", apply: "应用显示的更改", ready: "请先确认内容。未确认的购买地点不会更改。", working: "正在应用…", done: "已应用购买地点修复并完成云端同步。", pending: "本机更新完成。云端同步尚未完成，将自动重试。", already: "方案已应用，或对应信息已修复。不会更改。", products: "商品", priceHistory: "购买记录", storeChecks: "店内确认", stores: "购买地点", newStores: "新增购买地点", unchanged: "已反映", deleted: "已删除（保留）", error: "无法应用方案，不会自动覆盖数据。", owner: "请登录此方案所属账号。", changed: "方案生成后，目标数据已变化，需要重新确认。", online: "请联网并完成云端恢复后再执行。", invalid: "这不是有效的购买地点修复方案。", stale: "预览后数据已变化，请重新选择方案。", backup: "修复前数据将保存在此账号的本机存储中。", unknown: "未设置"},
        "zh-TW": {title: "修復已確認的購買地點", menuGuide: "匯入私人修復方案，確認後套用。", back: "返回設定", guide: "選擇私人修復方案。僅載入不會儲存變更。", privacy: "套用後會更新此帳號的本機資料並同步至私人雲端。價格、購買日期和刪除狀態保持不變。", choose: "選擇修復方案", apply: "套用顯示的變更", ready: "請先確認內容。未確認的購買地點不會變更。", working: "正在套用…", done: "已套用購買地點修復並完成雲端同步。", pending: "本機更新完成。雲端同步尚未完成，將自動重試。", already: "方案已套用，或對應資料已修復。不會變更。", products: "商品", priceHistory: "購買紀錄", storeChecks: "店內確認", stores: "購買地點", newStores: "新增購買地點", unchanged: "已反映", deleted: "已刪除（保留）", error: "無法套用方案，不會自動覆寫資料。", owner: "請登入此方案所屬帳號。", changed: "方案產生後，目標資料已變更，需要重新確認。", online: "請連線並完成雲端還原後再執行。", invalid: "這不是有效的購買地點修復方案。", stale: "預覽後資料已變更，請重新選擇方案。", backup: "修復前資料將保存在此帳號的本機儲存空間。", unknown: "未設定"},
        fr: {title: "Réparer les magasins confirmés", menuGuide: "Charger votre plan privé, le vérifier puis l'appliquer.", back: "Retour aux réglages", guide: "Choisissez votre plan privé. Le chargement seul n'enregistre rien.", privacy: "L'application modifie les données locales de ce compte et les synchronise avec son cloud privé. Prix, dates d'achat et états de suppression sont conservés.", choose: "Choisir le plan", apply: "Appliquer les changements affichés", ready: "Vérifiez avant d'appliquer. Les magasins non confirmés restent inchangés.", working: "Application…", done: "Magasins réparés et synchronisation cloud terminée.", pending: "Modifications locales enregistrées. Synchronisation cloud incomplète ; une nouvelle tentative automatique est possible.", already: "Plan déjà appliqué, ou correspondances déjà en place. Aucun changement.", products: "Produits", priceHistory: "Achats", storeChecks: "Vérifications en magasin", stores: "Magasins", newStores: "Nouveaux magasins", unchanged: "Déjà en place", deleted: "Supprimé (conservé)", error: "Impossible d'appliquer le plan. Les données ne sont pas écrasées automatiquement.", owner: "Connectez-vous au compte concerné par ce plan.", changed: "Les données ont changé depuis la création du plan. Une nouvelle vérification est nécessaire.", online: "Connectez-vous et terminez la restauration cloud avant de continuer.", invalid: "Ce fichier n'est pas un plan de réparation valide.", stale: "Données modifiées après l'aperçu. Sélectionnez à nouveau le plan.", backup: "Les données avant réparation sont conservées localement pour ce compte.", unknown: "Non défini"}
    };
    let selected = null;
    let busy = false;
    const element = id => document.getElementById(id);
    const text = key => (COPY[typeof getCocartlyLanguage === "function" ? getCocartlyLanguage() : "en"] || COPY.en)[key];
    function fail(key) { const error = new Error(text(key)); error.repairKey = key; throw error; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function stable(value) {
        if (Array.isArray(value)) return "[" + value.map(stable).join(",") + "]";
        if (value && typeof value === "object") return "{" + Object.keys(value).sort().map(k => JSON.stringify(k) + ":" + stable(value[k])).join(",") + "}";
        return JSON.stringify(value);
    }
    const equal = (a, b) => stable(a) === stable(b);
    async function digest(value) {
        const buffer = await global.crypto.subtle.digest("SHA-256", new TextEncoder().encode(stable(value)));
        return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, "0")).join("");
    }
    function requireReady(plan) {
        if (!CocartlyOwnerStorage.isReady() || !CocartlyOwnerStorage.getOwner().startsWith("user:") || plan?.targetOwner !== CocartlyOwnerStorage.getOwner()) fail("owner");
        if (!navigator.onLine || typeof cocartlyCloudInitialMergeCompleted === "undefined" || !cocartlyCloudInitialMergeCompleted || !canUseCocartlyPrivateCloud()) fail("online");
        if (CocartlyOwnerStorage.isWriteBlocked() || (typeof cocartlyUiStorageFailed !== "undefined" && cocartlyUiStorageFailed) || (typeof cocartlyUiStoreConflict !== "undefined" && cocartlyUiStoreConflict)) fail("changed");
    }
    function validate(plan) {
        if (!plan || plan.format !== "cocartly-confirmed-store-repair" || plan.version !== 1 || !/^repair-[a-z0-9-]{1,70}$/.test(plan.repairId || "") || !Array.isArray(plan.stores) || !plan.stores.length || plan.stores.length > 50 || !Array.isArray(plan.changes) || !plan.changes.length || plan.changes.length > 3000) fail("invalid");
        const keys = new Set();
        for (const store of plan.stores) {
            if (!store || !/^[a-z0-9-]{1,60}$/.test(store.key || "") || keys.has(store.key) || typeof store.name !== "string" || !store.name.trim() || store.name.length > 200 || !["JP", "US", "CA", "AU", "KR", "CN", "TW", "OTHER"].includes(store.country) || typeof store.typeId !== "string") fail("invalid");
            if (store.restoreCatalog !== undefined && typeof store.restoreCatalog !== "boolean") fail("invalid");
            keys.add(store.key);
            if (store.reuseId && (!store.expectedExisting || String(store.expectedExisting.id) !== String(store.reuseId))) fail("invalid");
        }
        const ids = new Set();
        for (const change of plan.changes) {
            const composite = change.domain + ":" + change.recordId;
            if (!Object.prototype.hasOwnProperty.call(KEYS, change.domain) || !change.expected || Array.isArray(change.expected) || !change.recordId || String(change.expected.id) !== String(change.recordId) || ids.has(composite) || !keys.has(change.storeKey)) fail("invalid");
            if (Object.keys(change).some(key => !["domain", "recordId", "expected", "storeKey", "currency"].includes(key))) fail("invalid");
            if (change.currency !== undefined && (change.domain !== "priceHistory" || !["JPY", "USD", "CAD", "AUD", "KRW", "CNY", "TWD"].includes(change.currency))) fail("invalid");
            ids.add(composite);
        }
    }
    function readArray(key) {
        const value = JSON.parse(CocartlyOwnerStorage.getItem(key) || "[]");
        if (!Array.isArray(value)) fail("changed");
        return value;
    }
    function readState() {
        const raw = CocartlyOwnerStorage.getItem(STATE_KEY);
        if (raw === null) return {version: 1, repairs: {}};
        const state = JSON.parse(raw);
        if (!state || state.version !== 1 || !state.repairs || typeof state.repairs !== "object" || Array.isArray(state.repairs)) fail("changed");
        return state;
    }
    function resolveStores(plan, stores) {
        const result = new Map();
        for (const target of plan.stores) {
            const exact = stores.filter(s => s.name === target.name && (s.country || "JP") === target.country && s.active !== false && s.isDefault !== true);
            let existing = null;
            if (target.reuseId) {
                existing = stores.find(s => String(s.id) === String(target.reuseId));
                if (!existing || !equal(existing, target.expectedExisting) || !exact.includes(existing)) fail("changed");
            } else {
                if (exact.length > 1) fail("changed");
                existing = exact[0] || null;
            }
            result.set(target.key, {target, existing});
        }
        return result;
    }
    function alreadyMatches(record, change, resolved) {
        if (!resolved.existing || record.storeId !== resolved.existing.id || (change.currency !== undefined && record.currency !== change.currency)) return false;
        const before = clone(change.expected), after = clone(record);
        for (const value of [before, after]) {
            delete value.storeId;
            delete value.updatedAt;
            if (change.currency !== undefined) delete value.currency;
        }
        return equal(before, after);
    }
    async function preview(input) {
        const plan = clone(input);
        validate(plan);
        requireReady(plan);
        const token = CocartlyOwnerStorage.snapshot();
        const planDigest = await digest(plan);
        if (!CocartlyOwnerStorage.isCurrent(token)) fail("owner");
        const state = readState();
        if (Object.prototype.hasOwnProperty.call(state.repairs, plan.repairId)) {
            if (state.repairs[plan.repairId].planDigest !== planDigest) fail("invalid");
            return {plan, planDigest, token, alreadyApplied: true, counts: {products: 0, priceHistory: 0, storeChecks: 0}, operations: [], newStoreCount: 0, satisfied: plan.changes.length, fingerprint: planDigest};
        }
        CocartlyOwnerStorage.validateLocalData();
        const stores = readArray(STORE_KEY);
        const resolved = resolveStores(plan, stores);
        const arrays = Object.fromEntries(Object.entries(KEYS).map(([domain, key]) => [domain, readArray(key)]));
        const operations = [], counts = {products: 0, priceHistory: 0, storeChecks: 0};
        let satisfied = 0;
        for (const change of plan.changes) {
            const record = arrays[change.domain].find(r => String(r.id) === String(change.recordId));
            if (!record) fail("changed");
            const target = resolved.get(change.storeKey);
            if (alreadyMatches(record, change, target)) { satisfied += 1; continue; }
            if (!equal(record, change.expected)) fail("changed");
            const oldStore = stores.find(s => s.id === record.storeId);
            const product = change.domain === "products" ? record : arrays.products.find(p => p.id === record.productId);
            operations.push({change, current: clone(record), target: clone(target.target), existingId: target.existing?.id || null, oldStoreName: oldStore?.name || "", productName: product?.name || ""});
            counts[change.domain] += 1;
        }
        const used = new Set(operations.map(o => o.change.storeKey));
        const newStoreCount = Array.from(resolved).filter(([key, value]) => (used.has(key) || value.target.restoreCatalog === true) && !value.existing).length;
        const fingerprint = await digest({planDigest, operations, resolved: Array.from(resolved, ([key, value]) => [key, value.existing || null])});
        if (!CocartlyOwnerStorage.isCurrent(token)) fail("owner");
        return {plan, planDigest, token, operations, counts, newStoreCount, satisfied, alreadyApplied: operations.length === 0 && newStoreCount === 0, fingerprint};
    }
    async function preflight(prepared) {
        const domains = ["stores", ...new Set(prepared.operations.map(o => o.change.domain))];
        for (const domain of domains) {
            const rows = await fetchCocartlyCloudDomain(domain);
            if (!CocartlyOwnerStorage.isCurrent(prepared.token)) fail("owner");
            if (domain === "stores") {
                const localStores = readArray(STORE_KEY);
                assertCocartlyStoreIdentityPairs("stores", localStores, rows);
                for (const target of prepared.plan.stores) {
                    const matchingRemote = rows.filter(row => row.is_deleted !== true && row.data?.name === target.name && (row.data?.country || "JP") === target.country && row.data.active !== false && row.data.isDefault !== true);
                    if (matchingRemote.some(row => !localStores.some(s => String(s.id) === String(row.record_id) && equal(s, row.data)))) fail("changed");
                    if (target.reuseId) {
                        const remote = rows.find(row => String(row.record_id) === String(target.reuseId));
                        if (remote && (remote.is_deleted === true || !equal(remote.data, target.expectedExisting))) fail("changed");
                    }
                }
            } else {
                for (const operation of prepared.operations.filter(o => o.change.domain === domain)) {
                    const remote = rows.find(row => String(row.record_id) === String(operation.change.recordId));
                    if (remote && (remote.is_deleted === true || !equal(remote.data, operation.current))) fail("changed");
                }
            }
        }
    }
    async function apply(plan, fingerprint) {
        if (typeof fingerprint !== "string") fail("stale");
        const result = await enqueueCocartlyCloud(async token => {
            let prepared = await preview(plan);
            if (!CocartlyOwnerStorage.isCurrent(token)) fail("owner");
            if (prepared.fingerprint !== fingerprint) fail("stale");
            if (prepared.alreadyApplied) return {alreadyApplied: true, counts: prepared.counts, newStores: 0};
            await preflight(prepared);
            prepared = await preview(plan);
            if (!CocartlyOwnerStorage.isCurrent(token)) fail("owner");
            if (prepared.fingerprint !== fingerprint) fail("stale");
            const stores = readArray(STORE_KEY), resolved = resolveStores(prepared.plan, stores);
            const now = new Date().toISOString();
            const used = new Set(prepared.operations.map(o => o.change.storeKey));
            let newStores = 0;
            for (const [key, entry] of resolved) {
                if ((!used.has(key) && entry.target.restoreCatalog !== true) || entry.existing) continue;
                if (typeof global.crypto.randomUUID !== "function") fail("invalid");
                const target = entry.target;
                const fresh = {id: "ST-" + global.crypto.randomUUID(), name: target.name, typeId: target.typeId, country: target.country, region: typeof target.region === "string" ? target.region : "", city: typeof target.city === "string" ? target.city : "", isDefault: false, createdAt: now, updatedAt: now, active: true};
                if (stores.some(s => s.id === fresh.id)) fail("changed");
                stores.push(fresh); entry.existing = fresh; newStores += 1;
            }
            const dirty = new Set(), values = {}, before = {};
            if (newStores) { before[STORE_KEY] = CocartlyOwnerStorage.getItem(STORE_KEY); values[STORE_KEY] = JSON.stringify(stores); dirty.add("stores"); }
            for (const [domain, key] of Object.entries(KEYS)) {
                const affected = prepared.operations.filter(o => o.change.domain === domain);
                if (!affected.length) continue;
                const records = readArray(key);
                before[key] = CocartlyOwnerStorage.getItem(key);
                for (const operation of affected) {
                    const record = records.find(r => String(r.id) === String(operation.change.recordId));
                    if (!equal(record, operation.current)) fail("stale");
                    record.storeId = resolved.get(operation.change.storeKey).existing.id;
                    if (operation.change.currency !== undefined) record.currency = operation.change.currency;
                    const previous = getCocartlyRecordTimestamp(record);
                    record.updatedAt = new Date(Math.max(Date.now(), previous + 1)).toISOString();
                }
                values[key] = JSON.stringify(records); dirty.add(domain);
            }
            const state = readState();
            state.repairs[prepared.plan.repairId] = {planDigest: prepared.planDigest, appliedAt: now, counts: prepared.counts, newStores, before};
            values[STATE_KEY] = JSON.stringify(state);
            if (!CocartlyOwnerStorage.isCurrent(token)) fail("owner");
            CocartlyOwnerStorage.applyBatch(values, token);
            for (const domain of dirty) notifyCocartlyDataChanged(domain);
            return {alreadyApplied: false, counts: prepared.counts, newStores};
        });
        if (!result) fail("online");
        return result;
    }
    function refreshLabels() {
        const map = {storeRepairMenuTitle: "title", storeRepairMenuGuide: "menuGuide", btnStoreRepairBack: "back", storeRepairTitle: "title", storeRepairGuide: "guide", storeRepairPrivacy: "privacy", btnStoreRepairFile: "choose", btnStoreRepairApply: "apply"};
        for (const [id, key] of Object.entries(map)) { const node = element(id); if (node) node.textContent = text(key); }
    }
    function clearSelection() {
        selected = null;
        const previewNode = element("storeRepairPreview"); if (previewNode) previewNode.replaceChildren();
        const status = element("storeRepairStatus"); if (status) status.textContent = "";
        const button = element("btnStoreRepairApply"); if (button) button.disabled = true;
    }
    function open() {
        clearSelection(); refreshLabels();
        hideAllScreens(); const screen = element("storeRepairScreen"); if (screen) screen.hidden = false;
        global.scrollTo(0, 0);
    }
    function back() { if (!busy) { clearSelection(); openSettings(); } }
    function line(parent, value) { const node = document.createElement("p"); node.textContent = value; parent.appendChild(node); }
    function render(prepared) {
        const root = element("storeRepairPreview"); if (!root) return;
        root.replaceChildren();
        line(root, text("backup"));
        line(root, text("newStores") + ": " + prepared.newStoreCount + " / " + text("unchanged") + ": " + prepared.satisfied);
        const storeGroup = document.createElement("details"), storeHeading = document.createElement("summary");
        storeHeading.textContent = text("stores") + ": " + prepared.plan.stores.length;
        storeGroup.appendChild(storeHeading);
        for (const target of prepared.plan.stores) line(storeGroup, target.name + " / " + target.country);
        root.appendChild(storeGroup);
        for (const domain of Object.keys(KEYS)) {
            const rows = prepared.operations.filter(o => o.change.domain === domain);
            const group = document.createElement("details"), heading = document.createElement("summary");
            heading.textContent = text(domain) + ": " + rows.length; group.appendChild(heading);
            for (const operation of rows) {
                const card = document.createElement("div"); card.className = "master-card";
                line(card, operation.productName || String(operation.change.recordId));
                line(card, (operation.oldStoreName || text("unknown")) + " → " + operation.target.name + " / " + operation.target.country);
                if (operation.current.price !== undefined) line(card, String(operation.current.price) + (operation.current.currency ? " " + operation.current.currency : "") + (operation.change.currency ? " → " + operation.change.currency : ""));
                if (operation.current.purchasedAt || operation.current.checkedAt) line(card, operation.current.purchasedAt || operation.current.checkedAt);
                if (operation.current.active === false) line(card, text("deleted"));
                group.appendChild(card);
            }
            root.appendChild(group);
        }
    }
    async function selectFile(file) {
        clearSelection();
        if (!file || busy) return;
        const token = CocartlyOwnerStorage.snapshot();
        try {
            if (file.size > 5 * 1024 * 1024) fail("invalid");
            const content = await file.text();
            if (!CocartlyOwnerStorage.isCurrent(token)) return;
            const prepared = await preview(JSON.parse(content));
            if (!CocartlyOwnerStorage.isCurrent(token)) return;
            selected = prepared;
            render(prepared);
            const status = element("storeRepairStatus"); if (status) status.textContent = text(prepared.alreadyApplied ? "already" : "ready");
            const button = element("btnStoreRepairApply"); if (button) button.disabled = prepared.alreadyApplied;
        } catch (error) {
            if (!CocartlyOwnerStorage.isCurrent(token)) return;
            const status = element("storeRepairStatus"); if (status) status.textContent = error.repairKey ? error.message : text("invalid");
        }
    }
    function refreshApp() {
        if (typeof cocartlyProductUiReady !== "undefined" && cocartlyProductUiReady && typeof hydrateCocartlyOwnerView === "function") hydrateCocartlyOwnerView();
        else if (typeof setCocartlySafetyState === "function") setCocartlySafetyState("ready");
    }
    async function applySelected() {
        if (!selected || busy) return;
        const prepared = selected;
        const token = prepared.token;
        if (!CocartlyOwnerStorage.isCurrent(token)) return;
        busy = true;
        const button = element("btnStoreRepairApply"); if (button) button.disabled = true;
        try {
            if (typeof setCocartlySafetyState === "function") setCocartlySafetyState("busy");
            const result = await apply(prepared.plan, prepared.fingerprint);
            clearSelection();
            if (!CocartlyOwnerStorage.isCurrent(token)) return;
            refreshApp();
            if (result.alreadyApplied) { global.alert(text("already")); return; }
            try {
                await syncCocartlyCloud();
                if (CocartlyOwnerStorage.isCurrent(token)) {
                    const finished = navigator.onLine && cocartlyCloudInitialMergeCompleted && cocartlyCloudDirtyDomains.size === 0 && !cocartlyCloudSyncRunning && !cocartlyCloudRestoreRunning;
                    global.alert(text(finished ? "done" : "pending"));
                }
            } catch (error) {
                if (CocartlyOwnerStorage.isCurrent(token)) global.alert(text("pending"));
            }
        } catch (error) {
            if (CocartlyOwnerStorage.isCurrent(token)) { refreshApp(); global.alert(error.repairKey ? error.message : text("error")); }
        } finally {
            busy = false;
            if (CocartlyOwnerStorage.isCurrent(token) && selected && button) button.disabled = selected.alreadyApplied;
        }
    }
    global.addEventListener("cocartly-auth-owner-changing", clearSelection);
    if (typeof global.updateSettingsScreenLanguage === "function") {
        const original = global.updateSettingsScreenLanguage;
        global.updateSettingsScreenLanguage = function (...args) { const result = original.apply(this, args); refreshLabels(); return result; };
    }
    global.CocartlyStoreRepair = Object.freeze({open, back, selectFile, applySelected, preview, apply, refreshLabels});
})(window);
