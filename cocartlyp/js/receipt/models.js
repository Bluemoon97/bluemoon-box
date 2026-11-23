"use strict";

const CocartlyReceiptModels = (() => {
    function normalize(value) {
        return String(value ?? "").normalize("NFKC").toLowerCase()
            .replace(/[ァ-ヶ]/g, char => String.fromCharCode(char.charCodeAt(0) - 0x60))
            .replace(/[^\p{L}\p{N}]/gu, "");
    }

    function dateFromText(text) {
        const match = text.match(/\b(20\d{2})\s*(?:[年/.\-])\s*(\d{1,2})\s*(?:[月/.\-])\s*(\d{1,2})/);
        if (!match) {
            const numeric = text.match(/^\s*(\d{1,2})[/.](\d{1,2})[/.](20\d{2})(?=\s|$)/m);
            if (!numeric) return "";
            const [, first, second, year] = numeric;
            if ((Number(first) > 12) === (Number(second) > 12)) return "";
            const [month, day] = Number(first) > 12 ? [second, first] : [first, second];
            const iso = year + "-" + month.padStart(2, "0") + "-" + day.padStart(2, "0");
            return purchaseDateTimestamp(iso) ? iso : "";
        }
        const day = [match[1], match[2].padStart(2, "0"), match[3].padStart(2, "0")].join("-");
        if (!purchaseDateTimestamp(day)) return "";

        // Japanese receipts sometimes include the weekday, which can expose a misread month or day.
        const afterDate = text.slice(match.index + match[0].length);
        const weekday = afterDate.match(/^日[^\S\r\n]*\(([日月火水木金土])(?:曜(?:日)?)?\)/)?.[1];
        if (weekday && "日月火水木金土"[new Date(day + "T00:00:00Z").getUTCDay()] !== weekday) return "";
        return day;
    }

    const totalLine = /^(?:[★*#※:・【\[(\s]*)(?:合\s*計(?:金額)?|お買上金額|お支払(?:い)?(?:額|金額)|grand total|total(?:\s+(?:ttc|due))?|합계|총액|總計|总计|소계|小计|合计|实付|實付|sous[ -]total)\s*(?:[】\])]\s*)?(?=[:¥$€₩\d]|(?:NT|US|CA?|AU?)\$|$)/i;
    const nonItemLine = /(?:小\s*計|外\s*税|内\s*税|消\s*費\s*税|軽減税|税対象|対象額|標準税率|税率|税抜合計|税込対象|お預|お釣|釣銭|現金|値引|割引|カード|ポイント|領収|レシート|領収書|登録番号|取引番号|伝票|レジ|担当|電話|会員|お買上点数|お買い上げ|ありがとうございます|subtotal|tva\b|\b(?:tax|discount|change|payment|cash|card|receipt|register|transaction|points|tel|vat)\b|세금|找零|稅額|税额)/i;
    const paymentLine = /^(?:PayPay|JPQR|決済番号|会員番号|payment\s+(?:id|ref(?:erence)?))(?=\s|[:#]|$)/i;
    const localizedAdjustment = /^(?:부가세|优惠|優惠|折扣|割引|値引|remise)(?=\s|[:¥$€₩\d-]|$)/i;
    const money = String.raw`(?:(?:NT|US|CA?|AU?)\$|[¥$€₩])?\s*(\d+(?:[.,]\d{1,3})*)`;
    const suffix = String.raw`\s*(?:円|元|원|€)?\s*(税込|税抜)?\s*[※*]?\s*`;
    const quantityFirst = new RegExp(String.raw`^(.*?)\s*(\d{1,3})\s*(?:個|点|本|pcs?)?\s*[x×*]\s*@?\s*${money}${suffix}$`, "i");
    const priceFirst = new RegExp(String.raw`^(.*?)\s*@?\s*${money}\s*@?\s*(?:[x×*]\s*)?(\d{1,3})\s*(?:個|点|本|pcs?)${suffix}$`, "i");
    const itemPrice = new RegExp(String.raw`^(.+?)\s+${money}${suffix}$`);

    function nameLike(text) {
        return (text.match(/\p{L}/gu) || []).length >= 2 &&
            !/^(?:[A-Z]\d{4,}|\d|〒)/i.test(text) &&
            !/\d{2,4}[-:]\d{2,4}[-:]\d{2,4}|\d{1,2}:\d{2}|\d+[.-]?\d*\s*%|@/.test(text);
    }

    const printedDate = /\b20\d{2}\s*[年/.\-]\s*\d{1,2}\s*[月/.\-]\s*\d{1,2}/;
    const posLine = /\bPOS\s*[:#]\s*\d+\s*$/i;
    const terminalLine = /^店\s*\d[\d\s]*[^\p{L}\p{N}]*(?:レジ|レツ)\s*\d/i;
    const subtotalLine = /^[（(【\[]?\s*小\s*計\s*[）)】\]]?\s*(\d{1,3})\s*点\s*[¥]?\s*(\d+)\s*(?:円)?$/;
    const taxBaseLine = /^外\s*税\s*対\s*象\s*[（(]?\s*\d{1,2}\s*(?:[%め])\s*[）)]?\s*[¥]?\s*(\d+)\s*(?:円)?$/;
    const countedLine = /^\s*\d{1,9}\s*[@]?\s*[x×*]\s*(\d{1,3})\s*個(?:\s*\d{1,9})?\s*$/i;
    const printedYenDetail = /^(\d{1,9})\s*@\s*[x×]\s*(\d{1,3})\s*個\s*¥\s*(\d{1,12})$/i;
    const barcodeLine = /^(\d{13})(?:\s*\(\d{1,8}\))?$/;
    const incompleteBarcodeLine = /^(\d{12})(?:\s*\(\d{1,8}\))?$/;
    const countPrefix = /^\d{1,9}\s*@?\s*[x×]\s*[1-9]\d{0,2}\s*個/i;

    // Produce a review candidate only when independent printed fields agree.
    function recoverOneItem(details, summary) {
        const counts = details.map(line => line.match(countedLine)).filter(Boolean);
        const codes = details.map(line => line.match(barcodeLine)?.[1]).filter(code => barcode(code));
        const subtotals = summary.map(line => line.match(subtotalLine)).filter(Boolean);
        const taxBases = summary.map(line => line.match(taxBaseLine)).filter(Boolean);
        if (counts.length !== 1 || codes.length !== 1 || subtotals.length !== 1 || taxBases.length !== 1) return null;
        const quantity = Number(counts[0][1]);
        const total = Number(subtotals[0][2]);
        if (quantity < 1 || quantity !== Number(subtotals[0][1]) || total <= 0 ||
            !Number.isSafeInteger(total) || total !== Number(taxBases[0][1]) || total % quantity !== 0) return null;
        return {name: "", quantity: String(quantity), hint: quantity + " × " + total / quantity,
            unitPrice: "", code: codes[0]};
    }

    const damagedYenSuffix = /\s+[\\#y]\s*(\d{1,6})$/i;

    function normalizeJapaneseOcrLine(line) {
        // Keep these repairs confined to receipt-shaped price fields.
        return line.replace(/^(?:[A-Z]{1,3}|[A-Z]、|ヾ|届)\s+(?=\d{6}(?:※|\s+#s!))/i, "")
            .replace(/^[A-Z]{1,3}\s+(?=外\s*(?:8|10)\s)/i, "")
            .replace(/^\s*[ぁ-ゖァ-ヶ一-龯][^\d\r\n]{0,6}\s+"(?=[1-9]\d{0,2}個\s*[x×])/i, "(")
            .replace(/^(?:いい|[A-Z]{1,3})\s+(?=[1-9]\d{0,2}(?:個|コ)\s*[x×]\s*単\d)/i, "")
            .replace(/^[ぁ-ゖ]\s+(?=[1-9]\d{0,2}個\s*[x×]\s*\d+\)$)/i, "(")
            .replace(/(個\s*[x×]\s*)(\d+\))$/i, "$1@$2")
            .replace(damagedYenSuffix, " ¥$1");
    }

    function parse(text) {
        const clean = String(text).normalize("NFKC");
        const lines = clean.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        const rows = [];
        let pending = "";
        let previous = null;
        const details = [];
        const summary = [];
        let inSummary = false;
        // The first dated header lines are store/address metadata, not item candidates.
        const dateIndex = lines.findIndex(line => printedDate.test(line));
        const firstDetail = lines.findIndex(line => /[¥$€₩@]|\d\s*(?:個|点|本)\s*[x×*]/i.test(line) &&
            !nonItemLine.test(line) && !totalLine.test(line) && !printedDate.test(line));
        const start = dateIndex >= 0 && (firstDetail < 0 || dateIndex < firstDetail) ? dateIndex + 1 : 0;
        const japaneseText = /[ぁ-ゖァ-ヶ]/.test(clean);
        const receiptLines = lines.slice(start, 250);
        const detailLines = japaneseText ? receiptLines.map(normalizeJapaneseOcrLine) : receiptLines;
        const hasExternalTaxPrefix = detailLines.some(line => /^外\s*(?:8|10)\s/.test(line));
        for (const [index, line] of detailLines.entries()) {
            if (totalLine.test(line) || paymentLine.test(line) || /^[（(【\[]?\s*(?:小\s*計|外\s*税(?:額|対象)?|内\s*税(?:額)?|消\s*費\s*税(?:額)?|subtotal\b)/i.test(line)) {
                inSummary = true;
            }
            if (inSummary) {
                summary.push(line);
                continue;
            }
            const damagedReference = japaneseText &&
                (/^[A-Z]{1,3}\s+0\d{5,}\s+\d{6,}$/.test(line) ||
                    /^(?:[A-Z]{1,3}\s+)?(?:\|\s+)?(?:レシート|ウェト)\s*No\s*:\s*\d+$/i.test(line));
            if (damagedReference || printedDate.test(line) || terminalLine.test(line) || posLine.test(line) || localizedAdjustment.test(line) || nonItemLine.test(line)) {
                pending = "";
                previous = null;
                continue;
            }
            details.push(line);

            if (barcodeLine.test(line)) {
                const code = line.match(barcodeLine)[1];
                if (previous && !previous.code && barcode(code)) previous.code = code;
                previous = null;
                pending = "";
                continue;
            }

            const continuation = line.match(/^\(?\s*([1-9]\d{0,2})\s*(?:個|コ)\s*[x×]\s*(?:@|単)\s*(\d+)\s*(?:¥\s*(\d+))?\)?$/i);
            if (continuation && (/^\(/.test(line) || /単/.test(line))) {
                const [, quantity, amount, total] = continuation;
                const productTotal = Number(quantity) * Number(amount);
                if (previous && !pending && ["", "1"].includes(previous.quantity) && Number(previous.hint) === productTotal && !total) {
                    Object.assign(previous, {quantity, hint: quantity + " × " + amount, unitPrice: ""});
                } else if (pending && total && Number(total) === productTotal) {
                    previous = {name: pending, quantity, hint: quantity + " × " + amount, unitPrice: ""};
                    rows.push(previous);
                } else if (previous && !pending && !total) {
                    Object.assign(previous, {quantity: "", unitPrice: ""});
                    previous = null;
                } else {
                    previous = null;
                }
                pending = "";
                continue;
            }
            if (japaneseText && /^[A-Z]{1,3}\s+外[8B]/i.test(receiptLines[index]) && !/¥\d+$/.test(line)) {
                pending = "";
                previous = null;
                continue;
            }
            const nameLine = hasExternalTaxPrefix && /¥\d+$/.test(line)
                ? line.replace(/^8\s+(?=\p{L})/u, "") : line;
            const itemText = nameLine.replace(/^外\s*(?:8|10)\s+(?=\p{L})/u, "")
                .replace(/^\d{6}(?:※\s*|\s+#s!\s*)(?=\p{L})/iu, "")
                .replace(/\s+特\s+(?=¥)/, " ");

            const printedDetail = line.match(printedYenDetail);
            if (printedDetail) {
                const [, amount, quantity, lineTotal] = printedDetail;
                if (pending && Number(amount) > 0 && Number(quantity) > 0 &&
                    Number(amount) * Number(quantity) === Number(lineTotal)) {
                    previous = {name: pending, quantity, hint: quantity + " × " + amount, unitPrice: ""};
                    const code = receiptLines[index + 1]?.match(barcodeLine)?.[1];
                    if (barcode(code)) previous.code = code;
                    rows.push(previous);
                } else {
                    previous = null;
                }
                pending = "";
                continue;
            }

            const damagedPriceFirst = japaneseText && /^\d{1,6}[A-Z]\s*[x×]\s*_?\s*[1-9]\d{0,2}\s*個\s*¥\d{1,6}$/i.test(line);
            if (pending && damagedPriceFirst) {
                rows.push({name: pending, quantity: "", unitPrice: ""});
                pending = "";
                previous = null;
                continue;
            }

            const forward = line.match(quantityFirst);
            const reverse = !forward && /[@x×*]/i.test(line) ? line.match(priceFirst) : null;
            if (forward || reverse) {
                const [, printed, quantity, amount, tax] = forward ||
                    [null, reverse[1], reverse[3], reverse[2], reverse[4]];
                const name = printed.trim();
                const fields = {quantity, hint: quantity + " × " + amount,
                    unitPrice: tax === "税込" && /^\d+$/.test(amount) ? amount : ""};
                if (Number(quantity) === 0) {
                    pending = "";
                    previous = null;
                    continue;
                }
                if (nameLike(name) || (!name && pending)) {
                    previous = {name: name || pending, ...fields};
                    rows.push(previous);
                } else if (!name && previous) {
                    const lineAmount = /^\d+$/.test(previous.hint) ? Number(previous.hint) : null;
                    if (lineAmount !== null && /^\d+$/.test(amount) && lineAmount === Number(quantity) * Number(amount)) {
                        Object.assign(previous, fields);
                    } else {
                        Object.assign(previous, {quantity: "", unitPrice: ""});
                        previous = null;
                    }
                } else {
                    previous = null;
                }
                pending = "";
                continue;
            }

            // Receipt identifiers can follow a damaged label with no currency marker.
            if (/\s\d{13,14}$/.test(line)) {
                pending = "";
                previous = null;
                continue;
            }
            const item = itemText.match(itemPrice);
            if (item && !/[¥$€₩]/.test(item[1]) && nameLike(item[1])) {
                const uncertainQuantity = japaneseText && damagedYenSuffix.test(receiptLines[index]);
                previous = {name: item[1], quantity: uncertainQuantity ? "" : "1", hint: item[2],
                    unitPrice: item[3] === "税込" && /^\d+$/.test(item[2]) ? item[2] : ""};
                rows.push(previous);
                pending = "";
                continue;
            }

            // A standalone name is used only when followed by a quantity × price line.
            pending = nameLike(itemText) ? itemText : "";
            previous = null;
        }
        if (!rows.length) {
            const recovered = recoverOneItem(details, summary) || recoverCodeForReview(lines, details);
            if (recovered) rows.push(recovered);
        }
        return {date: dateFromText(clean), lines, rows: rows.slice(0, 80)};
    }

    function singlePrintedCode(text) {
        const lines = String(text).slice(0, 20000).normalize("NFKC").split(/\r?\n/);
        const codes = new Set(lines.map(line => line.trim().match(barcodeLine)?.[1]).filter(Boolean));
        return codes.size === 1 ? codes.values().next().value : "";
    }

    function recoverCodeForReview(lines, details) {
        const code = singlePrintedCode(lines.join("\n"));
        if (!barcode(code)) return null;
        const codeIndex = lines.findIndex(line => line.match(barcodeLine)?.[1] === code);
        if (codeIndex < 1 || lines.filter(line => line.match(barcodeLine)?.[1] === code).length !== 1 ||
            !details.includes(lines[codeIndex])) return null;

        // The nearby quantity line supports treating this number as an item code.
        const beforeCode = lines[codeIndex - 1];
        if (countedLine.test(beforeCode) || printedYenDetail.test(beforeCode) ||
            !countPrefix.test(beforeCode)) return null;
        return {name: "", quantity: "", unitPrice: "", code};
    }

    function codeForCorroboration(text) {
        const lines = String(text).slice(0, 20000).normalize("NFKC").split(/\r?\n/)
            .map(line => line.trim()).filter(Boolean);
        const fields = lines.map((line, index) => {
            const complete = line.match(barcodeLine)?.[1];
            if (complete) return complete;
            return countPrefix.test(lines[index - 1] || "") ? line.match(incompleteBarcodeLine)?.[1] : "";
        }).filter(Boolean);
        return fields.length === 1 ? fields[0] : "";
    }

    function corroborateCode(primary, supplemental) {
        const observed = codeForCorroboration(primary);
        const code = singlePrintedCode(supplemental);
        if (!observed || !barcode(code)) return "";
        if (observed.length === 12) {
            return !barcode(observed) && code.slice(1) === observed ? code : "";
        }
        if (observed === code) return code;
        if (barcode(observed)) return "";
        const differences = [...observed].filter((digit, index) => digit !== code[index]);
        return differences.length === 1 ? code : "";
    }

    function receiptCurrencyAllows(text, currency) {
        const symbols = {US$: ["USD"], C$: ["CAD"], CA$: ["CAD"], A$: ["AUD"], AU$: ["AUD"],
            NT$: ["TWD"], "$": ["USD", "CAD", "AUD", "TWD"], "¥": ["JPY", "CNY"], "₩": ["KRW"], "€": ["EUR"]};
        const raw = String(text).slice(0, 20000).normalize("NFKC");
        const matches = raw.matchAll(/(?:(NT\$|US\$|CA?\$|AU?\$|[$¥₩€])\s*\d|\d[\t ]*(€|円|元|원)(?!\p{L}))/giu);
        for (const match of matches) {
            const token = (match[1] || match[2]).toUpperCase();
            const allowed = symbols[token] || {円: ["JPY"], 元: ["CNY"], 원: ["KRW"]}[token];
            if (!allowed.includes(currency)) return false;
        }
        return true;
    }

    function positionedYen(blocks) {
        return (blocks || []).flatMap(block => block.paragraphs.flatMap(paragraph => paragraph.lines))
            .flatMap(line => line.words.flatMap(({text, bbox}) => {
                const amount = text.trim().normalize("NFKC").match(/^[—-]?[¥\\#y](\d{1,3}(?:,\d{3})+|\d+)[)\-]?$/i);
                return amount && bbox ? [{value: Number(amount[1].replaceAll(",", "")), ...bbox}] : [];
            }));
    }

    function amountReviewTargets(parsed, blocks, width, height) {
        if (!Number.isFinite(width) || !Number.isFinite(height)) return [];
        const subtotalLine = parsed.lines.find(line => /^小\s*計/.test(line));
        const subtotalValue = subtotalLine?.match(/(\d{1,3}(?:,\d{3})+|\d+)\s*[。.)]?$/)?.[1];
        if (!subtotalValue) return [];
        const subtotal = Number(subtotalValue.replaceAll(",", ""));
        const amounts = positionedYen(blocks);
        if (amounts.length < 3 || amounts.length > 200) return [];
        const tolerance = width * 0.019;
        const clusters = amounts.map(a => amounts.filter(b => Math.abs(a.x1 - b.x1) <= tolerance));
        const column = clusters.sort((a,b) => b.length-a.length)[0];
        if (clusters.some(other => other.length === column.length && !other.some(row => column.includes(row)))) return [];
        column.sort((a,b) => a.y0-b.y0);
        const possible = column.flatMap((row,index) => row.value === subtotal &&
            column.slice(0,index).reduce((sum,item)=>sum+item.value,0) === subtotal ? [index] : []);
        const details = possible.length === 1 ? column.slice(0,possible[0]) : column;
        const originals = parsed.rows.map(row => {
            const match = row.hint?.match(/^(?:(\d+) × )?(\d+)$/);
            return match ? Number(match[1] || 1) * Number(match[2]) : null;
        });
        const knownTotal = originals.reduce((sum,amount)=>sum+(amount||0),0);
        const remaining = subtotal-knownTotal;
        const geometricalLines = (blocks || []).flatMap(block=>block.paragraphs.flatMap(paragraph=>paragraph.lines))
            .filter(line => line.bbox && Number.isFinite(line.bbox.y0) &&
                Number.isFinite(line.bbox.y1) && line.bbox.y1>line.bbox.y0);
        const centerOfLine = line => (line.bbox.y0+line.bbox.y1)/2;
        const sizeLines = geometricalLines.filter(line => {
                const text = line.words.map(word=>word.text).join(" ").normalize("NFKC");
                return /[ぁ-ゖァ-ヶ]/u.test(text) && /\d\s*(?:ml|l|kg|g|cm|mm)\b/i.test(text) &&
                    !/[x×]\s*(?:@|単|\d)/i.test(text) && line.bbox;
            });
        return originals.slice(0,-1).flatMap((before,index) => {
            const after = originals[index+1];
            if (!before || !after || before === after || originals.filter(v=>v===before).length !== 1 ||
                originals.filter(v=>v===after).length !== 1) return [];
            const first = details.flatMap((row,i)=>row.value===before?[i]:[]);
            const last = details.flatMap((row,i)=>row.value===after?[i]:[]);
            if (first.length!==1 || last.length!==1) return [];
            const previous = details[first[0]];
            const next = details[last[0]];
            let candidate;
            if (possible.length===1 && last[0]-first[0]===2) {
                candidate = details[first[0]+1];
            } else if (possible.length===0 && remaining>0 && last[0]-first[0]===1) {
                const inGap = line => centerOfLine(line)>previous.y1 && centerOfLine(line)<next.y0;
                const likely = sizeLines.filter(inGap);
                if (likely.length===1) {
                    const line = likely[0];
                    const center = centerOfLine(line);
                    const others = geometricalLines.filter(other => other!==line && inGap(other)).map(centerOfLine);
                    if (others.some(other=>Math.abs(other-center)<(line.bbox.y1-line.bbox.y0)/4)) return [];
                    const y0 = Math.max(previous.y1,line.bbox.y0,...others.filter(other=>other<center).map(other=>(other+center)/2));
                    const y1 = Math.min(next.y0,line.bbox.y1,...others.filter(other=>other>center).map(other=>(other+center)/2));
                    candidate = {y0,y1,x1:(previous.x1+next.x1)/2,maxValue:remaining};
                }
            }
            if (!candidate || candidate.y1<=candidate.y0) return [];
            const top = Math.max(0,details[first[0]].y0-12);
            const right = Math.min(width,candidate.x1+10);
            const bottom = Math.min(height,details[last[0]].y1+12);
            const left = Math.max(0,Math.floor(right-width*0.277));
            const rectangle = {left,top,width:right-left,height:bottom-top};
            return [{afterIndex:index, candidate, tolerance, rectangle}];
        }).slice(0,2);
    }

    function amountAtReviewTarget(blocks, target) {
        const expected = target.candidate;
        const hits = positionedYen(blocks).filter(row => {
            const center = (row.y0+row.y1)/2;
            return center >= expected.y0 && center <= expected.y1 && Math.abs(row.x1-expected.x1)<=target.tolerance;
        });
        if (hits.length!==1) return null;
        const value=hits[0].value;
        if (!Number.isSafeInteger(value) || value<=0) return null;
        return (expected.value===undefined ? value<=expected.maxValue : value===expected.value) ? value : null;
    }

    function storeOptions(stores, lines) {
        const header = [];
        const fragments = [];
        for (const line of lines.slice(0, 12)) {
            if (printedDate.test(line) || /(?:[¥$€₩]\s*\d|\d\s*円)/.test(line)) break;
            header.push(normalize(line));
            fragments.push(...line.split(/\s+/).map(normalize));
        }
        const phrases = new Set(header);
        for (let index = 1; index < header.length; index++) {
            phrases.add(header[index - 1] + header[index]);
        }
        const namedStores = stores.map(store => ({store, name: normalize(store.name)}));
        const exact = namedStores.filter(({name}) => name && phrases.has(name));
        const nearby = namedStores.filter(({name}) => [...header, ...fragments].some(part => part.length >= 3 && name.includes(part)));
        const order = [...new Set([...exact, ...nearby, ...namedStores])].map(({store}) => store);
        return {order, selectedId: exact.length === 1 ? exact[0].store.id : ""};
    }

    function score(query, name) {
        if (!query || !name) return 0;
        if (query === name) return 30;
        if (query.length > 2 && (name.includes(query) || (name.length > 2 && query.includes(name)))) return 20;
        const pairs = new Set();
        for (let index = 1; index < query.length; index++) pairs.add(query.slice(index - 1, index + 1));
        const overlap = [...pairs].filter(pair => name.includes(pair)).length;
        return overlap >= 2 ? overlap / Math.max(1, pairs.size) * 10 : 0;
    }

    function candidates(items, query, printed, storeId) {
        const search = normalize(query), alias = normalize(printed);
        return items.filter(item => item.active !== false).map(item => {
            const nameScore = score(search, normalize(item.name));
            const remembered = query === printed && alias && Array.isArray(item.receiptAliases) &&
                item.receiptAliases.some(match => match?.storeId === storeId && match?.label === alias);
            return {item, rank: nameScore + (remembered ? 100 : 0)};
        }).filter(row => row.rank > 0).sort((a, b) =>
            b.rank - a.rank || Number(b.item.storeId === storeId && !!storeId) - Number(a.item.storeId === storeId && !!storeId)
        ).slice(0, 8).map(row => row.item);
    }

    function substringDistance(name, text) {
        let previous = Array(text.length + 1).fill(0);
        for (let i = 1; i <= name.length; i++) {
            const current = [i];
            for (let j = 1; j <= text.length; j++) {
                current.push(Math.min(previous[j] + 1, current[j - 1] + 1,
                    previous[j - 1] + Number(name[i - 1] !== text[j - 1])));
            }
            previous = current;
        }
        return Math.min(...previous);
    }

    function pairs(text) {
        return new Set(Array.from({length: Math.max(0, text.length - 1)}, (_, index) =>
            text.slice(index, index + 2)));
    }

    function suggestedProduct(printed, items) {
        const query = normalize(printed);
        if (query.length > 160 || !/[ぁ-ゖァ-ヶ一-龯]/.test(query)) return null;
        const observedPairs = pairs(query);
        const ranked = items.filter(item => item.active !== false)
            .map(item => ({item, name: normalize(item.name)}))
            .filter(row => row.name.length >= 5 && row.name.length <= 160)
            .map(({item, name}) => {
                const matching = [...pairs(name)].filter(pair => observedPairs.has(pair)).length;
                return {item, name, matching};
            })
            .filter(row => row.matching >= 2)
            .map(({item, name, matching}) => ({
                item, matching, distance: substringDistance(name, query), length: name.length
            }))
            .sort((a, b) => a.distance - b.distance || b.matching - a.matching);
        const [best, rival] = ranked;
        if (!best || best.distance > 2 || best.distance / best.length > .25 || best.matching < 3) return null;
        if (rival && (rival.distance === best.distance ||
            (rival.distance - best.distance === 1 && best.matching - rival.matching < 2))) return null;
        return best.item;
    }

    function barcode(value) {
        const digits = String(value ?? "").normalize("NFKC").replace(/[ -]/g, "");
        if (!/^\d{8}$|^\d{12,14}$/.test(digits)) return "";
        const sum = [...digits.slice(0, -1)].reverse().reduce((total, digit, index) => total + Number(digit) * (index % 2 ? 1 : 3), 0);
        return (10 - sum % 10) % 10 === Number(digits.at(-1)) ? digits.padStart(14, "0") : "";
    }

    return {normalize, amountReviewTargets, amountAtReviewTarget, receiptCurrencyAllows, storeOptions, parse, candidates, suggestedProduct, barcode, codeForCorroboration, corroborateCode};
})();
