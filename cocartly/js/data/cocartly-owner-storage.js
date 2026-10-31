
/*
 * Cocartly 所有者別ストレージ管理
 *
 * guest とログインユーザーの保存領域を分離する。
 * 認証状態が確定するまでは読み書きを禁止する。
 *
 * 既存の共通保存キーは自動移行・削除しない。
 */
(function (global) {
    "use strict";

    const PREFIX = "cocartly:v1:";

    const VALID_KEYS = new Set([
        "shoppingSupportProducts",
        "shoppingSupport_makers",
        "shoppingSupport_categories",
        "shoppingSupportStores",
        "shoppingSupportPriceHistory",
        "cocartlyShoppingItems",
        "cocartlyStoreChecks",
        "outings",
        "shoppingSupportShoppingSession",
        "cocartly-language",
        "cocartly-base-country",
        "cocartly-setup-completed",
        "cocartly-cloud-sync-meta",
        "cocartly-store-repair-state"
    ]);

    // null は認証未確定。guest とは異なる。
    let owner = null;
    let epoch = 0;
    let staged = null;

    function assertKey(key) {
        if (!VALID_KEYS.has(key)) {
            throw new Error(
                "Unknown Cocartly storage key: " + key
            );
        }
    }

    function assertReady() {
        if (owner === null) {
            throw new Error(
                "Cocartly owner not resolved; storage is locked"
            );
        }
    }

    function ownerKey(key) {
        assertKey(key);
        assertReady();

        return PREFIX + owner + ":" + key;
    }

    // 復元の書込み前に旧値を記録する。中断時は次の読込前に旧値へ戻す。
    const JOURNAL_KEY = "cocartly-restore-journal";
    const ARRAY_KEYS = new Set([
        "shoppingSupportProducts", "shoppingSupport_makers",
        "shoppingSupport_categories", "shoppingSupportStores",
        "shoppingSupportPriceHistory", "cocartlyShoppingItems",
        "cocartlyStoreChecks", "outings"
    ]);
    let writeBlocked = false;

    function reportStorageError(error) {
        writeBlocked = true;
        global.dispatchEvent(new CustomEvent("cocartly-storage-error"));
        return error;
    }

    function recoverBatch() {
        const journalKey = PREFIX + owner + ":" + JOURNAL_KEY;
        const raw = localStorage.getItem(journalKey);
        if (raw === null) return;
        const journal = JSON.parse(raw);
        if (journal.owner !== owner || !Array.isArray(journal.entries)) {
            throw new Error("Invalid Cocartly restore journal");
        }
        for (const entry of journal.entries) {
            assertKey(entry.key);
            if (entry.before !== null && typeof entry.before !== "string") {
                throw new Error("Invalid Cocartly restore journal entry");
            }
        }
        for (const entry of journal.entries) {
            const key = ownerKey(entry.key);
            if (entry.before === null) localStorage.removeItem(key);
            else localStorage.setItem(key, entry.before);
        }
        localStorage.removeItem(journalKey);
    }

    function validateLocalData() {
        assertReady();
        for (const key of ARRAY_KEYS) {
            const raw = getItem(key);
            if (raw === null) continue;
            const list = JSON.parse(raw);
            if (!Array.isArray(list)) throw new Error("Invalid Cocartly array: " + key);
            const ids = new Set();
            for (const row of list) {
                const id = row && typeof row === "object" && !Array.isArray(row)
                    && row.id !== undefined && row.id !== null ? String(row.id) : "";
                if (!id || ids.has(id)) throw new Error("Invalid/duplicate Cocartly ID: " + key);
                ids.add(id);
            }
        }
    }

    function applyBatch(values, token) {
        assertWritable();
        if (!isCurrent(token)) throw new Error("Cocartly owner changed");
        const entries = Object.entries(values).map(([key, after]) => {
            assertKey(key);
            if (typeof after !== "string") throw new Error("Invalid Cocartly batch value");
            return {key, before: getItem(key), after};
        }).filter(entry => entry.before !== entry.after);
        if (!entries.length) return;
        const journalKey = PREFIX + owner + ":" + JOURNAL_KEY;
        // ジャーナル保存失敗時は本体を一切変更しない。
        localStorage.setItem(journalKey, JSON.stringify({owner, entries}));
        try {
            for (const entry of entries) localStorage.setItem(ownerKey(entry.key), entry.after);
            localStorage.removeItem(journalKey);
        } catch (error) {
            try { recoverBatch(); }
            catch (rollbackError) { throw reportStorageError(rollbackError); }
            throw error;
        }
    }

    function assertWritable() {
        assertReady();
        if (writeBlocked) throw new Error("Cocartly storage is blocked; reload required");
    }

    function setOwner(next) {
        if (
            next !== "guest" &&
            !/^user:[0-9a-f-]{36}$/i.test(next)
        ) {
            throw new Error("Invalid Cocartly owner");
        }

        if (owner !== next) {
            owner = next;
            epoch += 1;
            writeBlocked = false;
            try { recoverBatch(); }
            catch (error) { throw reportStorageError(error); }
        }

        return { owner, epoch };
    }

    function lock() {
        owner = null;
        epoch += 1;
    }

    function snapshot() {
        return { owner, epoch };
    }

    function isCurrent(token) {
        return Boolean(
            token &&
            owner !== null &&
            token.owner === owner &&
            token.epoch === epoch
        );
    }

    function getItem(key) {
        const fullKey = ownerKey(key);
        if (staged && !isCurrent(staged.token)) throw new Error("Cocartly owner changed");
        if (staged && Object.prototype.hasOwnProperty.call(staged.values, key)) return staged.values[key];
        return localStorage.getItem(fullKey);
    }

    // Synchronous UI operation: stage all owner keys, then journal/commit once.
    function transaction(action) {
        assertWritable();
        if (staged) return action();
        const current = {values: {}, callbacks: [], token: snapshot()};
        staged = current;
        let result;
        try {
            result = action();
            if (result && typeof result.then === "function") throw new Error("Async data transaction is not supported");
            if (!isCurrent(current.token)) throw new Error("Cocartly owner changed");
            staged = null;
            if (Object.values(current.values).some(value => value === null)) throw new Error("Removal is not supported in a data transaction");
            applyBatch(current.values, current.token);
        } catch (error) { staged = null; throw error; }
        for (const callback of current.callbacks) {
            try { callback(); } catch (error) { console.error("Post-commit notification failed", error); }
        }
        return result;
    }
    function afterCommit(callback) {
        if (staged) staged.callbacks.push(callback);
        else callback();
    }


    function setItem(key, value) {
        assertWritable();
        if (staged) {
            if (!isCurrent(staged.token)) throw new Error("Cocartly owner changed");
            ownerKey(key); staged.values[key] = String(value); return;
        }
        try { localStorage.setItem(ownerKey(key), String(value)); }
        catch (error) { throw reportStorageError(error); }
    }

    function removeItem(key) {
        assertWritable();
        if (staged) throw new Error("Removal is not supported in a data transaction");
        try { localStorage.removeItem(ownerKey(key)); }
        catch (error) { throw reportStorageError(error); }
    }

    global.CocartlyOwnerStorage = Object.freeze({
        setOwner,
        lock,
        applyBatch,
        transaction,
        afterCommit,
        inTransaction: () => staged !== null,
        validateLocalData,
        keys: () => Array.from(VALID_KEYS),
        isWriteBlocked: () => writeBlocked,
        snapshot,
        isCurrent,
        ownerKey,
        getItem,
        setItem,
        removeItem,
        isReady: () => owner !== null,
        getOwner: () => owner
    });

})(window);
