"use strict";

const CocartlyReceiptModels = (() => {
    function normalize(value) {
        return String(value ?? "").normalize("NFKC").toLowerCase()
            .replace(/[ァ-ヶ]/g, char => String.fromCharCode(char.charCodeAt(0) - 0x60))
            .replace(/[^\p{L}\p{N}]/gu, "");
    }

    function dateFromText(text) {
        const match = text.match(/\b(20\d{2})\s*(?:[年/.\-])\s*(\d{1,2})\s*(?:[月/.\-])\s*(\d{1,2})/);
        if (!match) return "";
        const day = [match[1], match[2].padStart(2, "0"), match[3].padStart(2, "0")].join("-");
        return purchaseDateTimestamp(day) ? day : "";
    }

    function parse(text) {
        const clean = String(text).normalize("NFKC");
        const lines = clean.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        const rows = [];
        for (const line of lines.slice(0, 250)) {
            if (dateFromText(line) || /(?:合計|小計|お預|お釣|釣銭|現金|消費税|内税|外税|値引|割引|税対象|軽減税|税込対象|カード|ポイント|領収|レシート|subtotal|total|change|payment|tva|tax|discount|합계|세금|총액|總計|总计|找零|稅額|税额)/i.test(line)) continue;
            const multiply = line.match(/^(.*?)\s*(\d{1,3})\s*(?:個|点|本|pcs?)?\s*[x×*]\s*@?\s*[¥￥$€₩]?\s*(\d+(?:[.,]\d{1,3})*)(?:\s+.*)?$/i);
            if (multiply) {
                const name = multiply[1].trim();
                const hint = multiply[2] + " × " + multiply[3];
                const unitPrice = /税込/.test(line) && /^\d+$/.test(multiply[3]) ? multiply[3] : "";
                if (name && /\p{L}/u.test(name)) rows.push({name, quantity: multiply[2], hint, unitPrice});
                else if (rows.length) Object.assign(rows[rows.length - 1], {quantity: multiply[2], hint, unitPrice});
                continue;
            }
            const item = line.match(/^(.+?)\s+[¥￥$€₩]?\s*(\d+(?:[.,]\d{1,3})*)\s*(?:円|税込|税抜|[※*])?$/);
            if (item && /\p{L}/u.test(item[1])) rows.push({
                name: item[1], quantity: "1", hint: item[2],
                unitPrice: /税込$/.test(line) && /^\d+$/.test(item[2]) ? item[2] : ""
            });
        }
        return {date: dateFromText(clean), lines, rows: rows.slice(0, 80)};
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
        }).filter(row => row.rank > 0).sort((a, b) => b.rank - a.rank).slice(0, 8).map(row => row.item);
    }

    function barcode(value) {
        const digits = String(value ?? "").normalize("NFKC").replace(/[ -]/g, "");
        if (!/^\d{8}$|^\d{12,14}$/.test(digits)) return "";
        const sum = [...digits.slice(0, -1)].reverse().reduce((total, digit, index) => total + Number(digit) * (index % 2 ? 1 : 3), 0);
        return (10 - sum % 10) % 10 === Number(digits.at(-1)) ? digits.padStart(14, "0") : "";
    }

    return {normalize, parse, candidates, barcode};
})();
