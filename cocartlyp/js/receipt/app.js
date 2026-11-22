"use strict";

const CocartlyReceipt = (() => {
    const models = {ja: "jpn", en: "eng", ko: "kor", "zh-CN": "chi_sim", "zh-TW": "chi_tra", fr: "fra"};
    const modelNames = ["日本語", "English", "한국어", "简体中文", "繁體中文", "Français"];
    const byId = id => document.getElementById(id);
    const asset = name => new URL("js/lib/receipt-ocr/" + name, document.baseURI).href;
    const rows = [];
    let session, generation = 0;
    let ocrScript;

    function label(key) {
        const language = cocartlyReceiptLabels[getCocartlyLanguage()] || cocartlyReceiptLabels.ja;
        return language[cocartlyReceiptKeys.indexOf(key)];
    }

    function element(tag, text, className) {
        const node = document.createElement(tag);
        if (text) node.textContent = text;
        if (className) node.className = className;
        return node;
    }

    function field(key, input) {
        const node = element("label");
        node.append(element("span", label(key)), input);
        return node;
    }

    function option(value, text) {
        const item = element("option", text);
        item.value = value;
        return item;
    }

    function button(key, action) {
        const control = element("button", label(key), "receipt-action");
        control.type = "button";
        control.addEventListener("click", action);
        return control;
    }

    function status(key) {
        byId("receiptStatus").textContent = key ? label(key) : "";
    }

    function permitted() {
        return canOpenCocartlyOutingCheck() && !CocartlyOwnerStorage.isWriteBlocked();
    }

    function isCurrent(token) {
        return token && token === session && permitted() &&
            CocartlyOwnerStorage.isCurrent(token.owner) && byId("receiptScreen")?.hidden === false;
    }

    function refresh() {
        const entry = byId("btnReceipt");
        if (!entry) return;
        entry.hidden = !permitted();
        entry.querySelector(".home-code-label").textContent = label("title");
        if (session && !isCurrent(session)) {
            clear();
            if (!byId("receiptScreen").hidden) openHome();
        }
    }

    function clear() {
        session = null;
        generation++;
        rows.length = 0;
        byId("receiptRows")?.replaceChildren();
        for (const id of ["receiptText", "receiptImage"]) {
            const input = byId(id);
            if (input) input.value = "";
        }
    }

    function populateStores(hint) {
        const select = byId("receiptStore");
        const current = select.value;
        const options = stores.filter(store => store.active !== false);
        const normalized = CocartlyReceiptModels.normalize(hint);
        const exact = normalized ? options.filter(store => CocartlyReceiptModels.normalize(store.name) === normalized) : [];
        select.replaceChildren(option("", label("chooseStore")), ...options.map(store => option(store.id, getStoreDisplayName(store.id))));
        select.value = current && options.some(store => store.id === current) ? current : exact.length === 1 ? exact[0].id : "";
    }

    function open() {
        if (!permitted()) return;
        clear();
        hideAllScreens();
        byId("receiptScreen").hidden = false;
        session = {owner: CocartlyOwnerStorage.snapshot()};
        for (const item of byId("receiptScreen").querySelectorAll("[data-receipt]")) {
            item.textContent = label(item.dataset.receipt);
        }
        byId("receiptBack").textContent = t("code.backHome");
        const language = byId("receiptLanguage");
        language.replaceChildren(...Object.keys(models).map((key, index) => option(key, modelNames[index])));
        language.value = Object.hasOwn(models, getCocartlyLanguage()) ? getCocartlyLanguage() : "ja";
        byId("receiptDate").value = "";
        byId("receiptStore").value = "";
        populateStores();
        status();
        render();
        window.scrollTo(0, 0);
    }

    function loadOcr() {
        if (window.Tesseract) return Promise.resolve(window.Tesseract);
        if (!ocrScript) {
            ocrScript = new Promise((resolve, reject) => {
                const script = element("script");
                script.src = asset("tesseract.min.js");
                script.onload = () => resolve(window.Tesseract);
                script.onerror = reject;
                document.head.append(script);
            }).catch(error => {
                ocrScript = null;
                throw error;
            });
        }
        return ocrScript;
    }

    async function readImage(input) {
        const file = input.files?.[0], own = session;
        input.value = "";
        if (!file || !isCurrent(own)) return;
        if (!file.type.startsWith("image/") || file.size > 15 * 1024 * 1024) return status("readError");
        const run = ++generation;
        const lang = models[byId("receiptLanguage").value] || "jpn";
        let worker, timer, stopped = false;
        status("reading");
        try {
            const engine = await loadOcr();
            if (!isCurrent(own) || run !== generation) return;
            const work = async () => {
                worker = await engine.createWorker(lang, 1, {
                    workerPath: asset("worker.min.js"),
                    corePath: asset("tesseract-core-lstm.wasm.js"),
                    langPath: "https://cdn.jsdelivr.net/npm/@tesseract.js-data/" + lang + "@1.0.0/4.0.0_best_int",
                    workerBlobURL: false
                });
                if (stopped || !isCurrent(own) || run !== generation) {
                    await worker.terminate();
                    worker = null;
                    return;
                }
                return worker.recognize(file);
            };
            const result = await Promise.race([work(), new Promise((_, reject) => {
                timer = setTimeout(() => reject(new Error("OCR timeout")), 60000);
            })]);
            if (!result || !isCurrent(own) || run !== generation) return;
            byId("receiptText").value = result.data.text;
            parse();
        } catch {
            if (isCurrent(own) && run === generation) status("readError");
        } finally {
            stopped = true;
            clearTimeout(timer);
            if (worker) await worker.terminate().catch(() => {});
        }
    }

    function parse() {
        if (!isCurrent(session)) return;
        const parsed = CocartlyReceiptModels.parse(byId("receiptText").value.slice(0, 20000));
        if (parsed.date) byId("receiptDate").value = parsed.date;
        populateStores(parsed.lines[0]);
        rows.splice(0, rows.length, ...parsed.rows.map(row => draft(row)));
        render();
        status(rows.length ? "" : "empty");
    }

    function draft(item = {}) {
        return {printed: item.name || "", name: item.name || "", quantity: item.quantity || "1",
            unitPrice: item.unitPrice || "", hint: item.hint, search: item.name || "", selection: "", code: "",
            include: false, remember: false};
    }

    function add() {
        if (!isCurrent(session) || rows.length >= 80) return;
        rows.push(draft());
        render();
        status();
    }

    function changeStore() {
        for (const row of rows) {
            row.include = false;
            row.remember = false;
        }
        render();
    }

    function choices(row) {
        const storeId = byId("receiptStore").value;
        const matched = CocartlyReceiptModels.candidates(products, row.search, row.printed, storeId);
        const selected = products.find(product => product.id === row.selection && product.active !== false);
        const barcodeMatches = row.barcodeMatches || [];
        return [...new Map([...barcodeMatches, ...(selected ? [selected] : []), ...matched].map(product => [product.id, product])).values()];
    }

    function productName(product) {
        return [product.name, [product.volume, product.unit].filter(Boolean).join(" "), product.storeId ? getStoreDisplayName(product.storeId) : ""].filter(Boolean).join(" · ");
    }

    function render() {
        byId("receiptRows").replaceChildren(...rows.map(row => {
            const card = element("article", "", "receipt-card");
            if (row.printed) card.append(element("h3", row.printed));
            if (row.hint) card.append(element("p", row.hint, "receipt-hint"));
            const select = element("select");
            select.setAttribute("aria-label", label("existing"));
            const updateOptions = () => {
                select.replaceChildren(option("", label("chooseProduct")),
                    ...choices(row).map(product => option(product.id, productName(product))), option("new", label("new")));
                select.value = row.selection;
            };
            updateOptions();
            select.addEventListener("change", () => { row.selection = select.value; });
            const search = element("input");
            search.type = "search";
            search.value = row.search;
            search.addEventListener("input", () => {
                row.search = search.value;
                updateOptions();
            });

            const name = element("input");
            name.value = row.name;
            name.maxLength = 160;
            name.addEventListener("input", () => { row.name = name.value; });
            const number = element("input");
            number.type = "text";
            number.inputMode = "numeric";
            number.value = row.code;
            number.addEventListener("input", () => { row.code = number.value; row.barcodeMatches = []; });
            const photo = element("input");
            photo.type = "file";
            photo.accept = "image/*";
            photo.addEventListener("change", () => readBarcodeImage(row, photo));
            const barcodeDetails = element("details");
            barcodeDetails.append(element("summary", label("barcode")), field("barcodeImage", photo), field("number", number),
                button("barcode", () => matchBarcode(row, number.value)));
            const quantity = decimal(row, "quantity", "1");
            const price = decimal(row, "unitPrice", "0");
            const fields = element("div", "", "receipt-numbers");
            fields.append(field("quantity", quantity), field("unitPrice", price));
            card.append(field("search", search), select, field("name", name), barcodeDetails, fields, check(row, "remember"), check(row, "include"));
            return card;
        }));
        byId("receiptSave").disabled = !rows.length;
    }

    function decimal(row, key, min) {
        const input = element("input");
        input.type = "number";
        input.min = min;
        input.step = key === "quantity" ? "1" : "0.01";
        input.inputMode = key === "quantity" ? "numeric" : "decimal";
        input.value = row[key];
        input.addEventListener("input", () => { row[key] = input.value; });
        return input;
    }

    function check(row, key) {
        const input = element("input");
        input.type = "checkbox";
        input.checked = row[key];
        input.addEventListener("change", () => { row[key] = input.checked; });
        const item = field(key, input);
        item.className = "receipt-check";
        return item;
    }

    function matchBarcode(row, value) {
        if (!isCurrent(session) || !rows.includes(row)) return;
        const code = CocartlyReceiptModels.barcode(value);
        if (!code) return status("invalid");
        const matches = products.filter(product => product.active !== false &&
            CocartlyReceiptModels.barcode(product.janCode || product.jan) === code);
        row.code = value;
        row.barcodeMatches = matches;
        row.selection = matches.length === 1 ? matches[0].id : "";
        row.include = false;
        render();
        status(matches.length > 1 ? "ambiguous" : matches.length === 0 ? "notFound" : "");
    }

    async function readBarcodeImage(row, input) {
        const own = session, image = input.files?.[0];
        input.value = "";
        if (!image || !isCurrent(own)) return;
        if (!image.type.startsWith("image/") || image.size > 15 * 1024 * 1024) return status("readError");
        const url = URL.createObjectURL(image);
        let reader;
        try {
            const formats = new Map([[ZXing.DecodeHintType.POSSIBLE_FORMATS, [
                ZXing.BarcodeFormat.EAN_13, ZXing.BarcodeFormat.EAN_8, ZXing.BarcodeFormat.UPC_A, ZXing.BarcodeFormat.UPC_E
            ]]]);
            reader = new ZXing.BrowserMultiFormatReader(formats);
            const result = await reader.decodeFromImageUrl(url);
            if (isCurrent(own)) matchBarcode(row, result.getText());
        } catch {
            if (isCurrent(own)) status("readError");
        } finally {
            reader?.reset();
            URL.revokeObjectURL(url);
        }
    }

    function save() {
        if (!isCurrent(session)) return;
        const store = findStore(byId("receiptStore").value);
        const date = purchaseDateTimestamp(byId("receiptDate").value);
        const chosen = rows.filter(row => row.include);
        const valid = row => row.quantity !== "" && Number.isSafeInteger(Number(row.quantity)) && Number(row.quantity) > 0 &&
            row.unitPrice !== "" && Number.isFinite(Number(row.unitPrice)) && Number(row.unitPrice) >= 0 &&
            (row.selection === "new" ? row.name.trim() !== "" && (!row.code || CocartlyReceiptModels.barcode(row.code)) :
                products.some(product => product.id === row.selection && product.active !== false));
        if (!store || store.active === false || !date || !chosen.length || !chosen.every(valid)) return status("invalid");
        try {
            runCocartlyDataOperation(() => {
                for (const row of chosen) {
                    let product = products.find(item => item.id === row.selection);
                    if (row.selection === "new") {
                        const code = CocartlyReceiptModels.barcode(row.code);
                        if (code && products.some(item => item.active !== false &&
                            CocartlyReceiptModels.barcode(item.janCode || item.jan) === code)) throw new Error("Existing product barcode");
                        product = createProduct({name: row.name.trim(), storeId: store.id,
                            janCode: row.code.normalize("NFKC").replace(/[^0-9]/g, ""), shared: false,
                            categoryId: "", makerId: "", volume: "", unit: ""});
                        product.purchasedAt = date;
                        product.price = String(Number(row.unitPrice));
                        addProduct(product);
                    }
                    const alias = CocartlyReceiptModels.normalize(row.printed);
                    if (row.remember && alias) {
                        const old = Array.isArray(product.receiptAliases) ? product.receiptAliases : [];
                        const aliases = old.filter(entry => entry?.storeId !== store.id || entry.label !== alias);
                        product = {...product, receiptAliases: [{storeId: store.id, label: alias}, ...aliases].slice(0, 20)};
                        if (!updateProduct(product)) throw new Error("Could not remember product");
                    }
                    if (!addPriceHistory(product.id, store.id, Number(row.unitPrice), Number(row.quantity), "", "", null, date)) {
                        throw new Error("Could not record purchase");
                    }
                }
            });
        } catch {
            return status("saveError");
        }
        // Drop saved drafts so a second tap cannot write the same rows again.
        for (let index = rows.length - 1; index >= 0; index--) {
            if (rows[index].include) rows.splice(index, 1);
        }
        byId("receiptText").value = "";
        generation++;
        render();
        status("saved");
    }

    function back() { clear(); openHome(); }
    window.addEventListener("cocartly-auth-owner-changing", clear);
    return {open, refresh, back, readImage, parse, add, changeStore, save};
})();
