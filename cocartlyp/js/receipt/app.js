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

    function populateStores(lines = []) {
        const select = byId("receiptStore");
        const current = select.value;
        const options = stores.filter(store => store.active !== false);
        const {order, selectedId} = CocartlyReceiptModels.storeOptions(options, lines);
        select.replaceChildren(option("", label("chooseStore")), ...order.map(store => option(store.id, getStoreDisplayName(store.id))));
        select.value = session.storeWasChosen ? (options.some(store => store.id === current) ? current : "") : selectedId;
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

    async function prepareReceiptImage(file) {
        const url = URL.createObjectURL(file);
        try {
            const image = new Image();
            image.src = url;
            await image.decode();
            const scale = Math.min(2, 2600 / Math.max(image.naturalWidth, image.naturalHeight));
            const canvas = element("canvas");
            canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
            canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
            const context = canvas.getContext("2d");
            if (!context) return file;
            context.fillStyle = "#fff";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
            for (let index = 0; index < pixels.data.length; index += 4) {
                const gray = (pixels.data[index] * 77 + pixels.data[index + 1] * 150 +
                    pixels.data[index + 2] * 29) / 256;
                const contrast = (gray - 128) * 1.25 + 128;
                pixels.data[index] = pixels.data[index + 1] = pixels.data[index + 2] = contrast;
            }
            context.putImageData(pixels, 0, 0);
            return canvas;
        } catch (_) {
            return file;
        } finally {
            URL.revokeObjectURL(url);
        }
    }

    async function recognize(engine, language, image, isActive, timeout) {
        let worker, timer, stopped = false;
        try {
            const work = async () => {
                worker = await engine.createWorker(language, 1, {
                    workerPath: asset("worker.min.js"),
                    corePath: asset("tesseract-core-lstm.wasm.js"),
                    langPath: "https://cdn.jsdelivr.net/npm/@tesseract.js-data/" + language + "@1.0.0/4.0.0_best_int",
                    workerBlobURL: false
                });
                if (stopped) {
                    await worker.terminate().catch(() => {});
                    return;
                }
                if (!isActive()) return;
                await worker.setParameters({tessedit_pageseg_mode: engine.PSM.SINGLE_BLOCK, preserve_interword_spaces: "1"});
                if (!stopped && isActive()) return worker.recognize(image);
            };
            const result = await Promise.race([work(), new Promise((_, reject) => {
                timer = setTimeout(() => reject(new Error("OCR timeout")), timeout);
            })]);
            return result?.data.text;
        } finally {
            stopped = true;
            clearTimeout(timer);
            if (worker) await worker.terminate().catch(() => {});
        }
    }

    async function readImage(input) {
        const file = input.files?.[0], own = session;
        input.value = "";
        if (!file || !isCurrent(own)) return;
        if (!file.type.startsWith("image/") || file.size > 15 * 1024 * 1024) return status("readError");
        const run = ++generation;
        own.verifiedCode = null;
        own.parsedText = "";
        own.storeWasChosen = false;
        own.reading = true;
        const lang = models[byId("receiptLanguage").value] || "jpn";
        const textInput = byId("receiptText");
        textInput.value = "";
        byId("receiptDate").value = "";
        populateStores();
        rows.length = 0;
        render();
        const isActive = () => isCurrent(own) && run === generation;
        status("reading");
        try {
            const engine = await loadOcr();
            if (!isActive()) return;
            const image = await prepareReceiptImage(file);
            if (!isActive()) return;
            const text = await recognize(engine, lang, image, isActive, 60000);
            if (!isActive()) return;
            if (typeof text !== "string") return status("readError");
            if (textInput.value !== "") return status("empty");
            own.storeWasChosen = false;
            byId("receiptDate").value = "";
            textInput.value = text;
            const parsed = CocartlyReceiptModels.parse(text.slice(0, 20000));
            showParsed(parsed);
            if (lang !== "jpn" || parsed.rows.length || !CocartlyReceiptModels.codeForCorroboration(text)) return;

            // The second model contributes only a corroborated product code.
            status("reading");
            try {
                const supplemental = await recognize(engine, "eng", image, isActive, 12000);
                if (!isActive() || textInput.value !== text) return;
                const code = supplemental ? CocartlyReceiptModels.corroborateCode(text, supplemental) : "";
                if (code) {
                    own.verifiedCode = {text, code};
                    if (rows.length === 0) {
                        rows.push(draft({code, quantity: ""}));
                        render();
                    }
                }
            } catch {
                // Keep the Japanese readout available if the second model fails.
            } finally {
                if (isActive()) status(rows.length ? "" : "empty");
            }
        } catch {
            if (isActive()) status("readError");
        } finally {
            if (isActive()) {
                own.reading = false;
                byId("receiptSave").disabled = !rows.length;
            }
        }
    }

    function parse() {
        if (!isCurrent(session) || session.reading) return;
        const text = byId("receiptText").value;
        const parsed = CocartlyReceiptModels.parse(text.slice(0, 20000));
        const verification = session.verifiedCode;
        if (!parsed.rows.length && verification?.text === text) {
            parsed.rows.push({code: verification.code, quantity: ""});
        }
        showParsed(parsed);
    }

    function showParsed(parsed) {
        session.parsedText = byId("receiptText").value;
        if (parsed.date) byId("receiptDate").value = parsed.date;
        populateStores(parsed.lines);
        rows.splice(0, rows.length, ...parsed.rows.map(row => draft(row)));
        render();
        status(rows.length ? "" : "empty");
    }

    function draft(item = {}) {
        const code = CocartlyReceiptModels.barcode(item.code);
        const barcodeMatches = code ? products.filter(product => product.active !== false &&
            CocartlyReceiptModels.barcode(product.janCode || product.jan) === code) : [];
        return {printed: item.name || "", name: item.name || "", quantity: item.quantity ?? "1",
            unitPrice: item.unitPrice || "", hint: item.hint, search: item.name || "", selection: "", code: item.code || "", barcodeMatches,
            include: false, remember: false};
    }

    function add() {
        if (!isCurrent(session) || session.reading || rows.length >= 80) return;
        rows.push(draft());
        render();
        status();
    }

    function changeStore() {
        if (!isCurrent(session)) return;
        session.storeWasChosen = true;
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
            if (!row.printed && row.code) card.append(element("p", label("number") + ": " + row.code, "receipt-hint"));
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
        byId("receiptSave").disabled = !rows.length || !!session?.reading;
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
        if (!isCurrent(session) || session.reading) return;
        const store = findStore(byId("receiptStore").value);
        const date = purchaseDateTimestamp(byId("receiptDate").value);
        const chosen = rows.filter(row => row.include);
        const valid = row => row.quantity !== "" && Number.isSafeInteger(Number(row.quantity)) && Number(row.quantity) > 0 &&
            row.unitPrice !== "" && Number.isFinite(Number(row.unitPrice)) && Number(row.unitPrice) >= 0 &&
            (row.selection === "new" ? row.name.trim() !== "" && (!row.code || CocartlyReceiptModels.barcode(row.code)) :
                products.some(product => product.id === row.selection && product.active !== false));
        if (!store || store.active === false || !date || !chosen.length || !chosen.every(valid)) return status("invalid");
        const country = store.country || "JP";
        if (!["JP", "US", "CA", "AU", "KR", "CN", "TW"].includes(country) ||
            !CocartlyReceiptModels.receiptCurrencyAllows(session.parsedText, getCurrencyByCountry(country))) {
            return status("currencyMismatch");
        }
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
        session.verifiedCode = null;
        generation++;
        render();
        status("saved");
    }

    function back() { clear(); openHome(); }
    window.addEventListener("cocartly-auth-owner-changing", clear);
    return {open, refresh, back, readImage, parse, add, changeStore, save};
})();
