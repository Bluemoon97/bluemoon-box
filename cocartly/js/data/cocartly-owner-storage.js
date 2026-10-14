
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
        "cocartly-cloud-sync-meta"
    ]);

    // null は認証未確定。guest とは異なる。
    let owner = null;
    let epoch = 0;

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
        return localStorage.getItem(ownerKey(key));
    }

    function setItem(key, value) {
        localStorage.setItem(
            ownerKey(key),
            String(value)
        );
    }

    function removeItem(key) {
        localStorage.removeItem(ownerKey(key));
    }

    global.CocartlyOwnerStorage = Object.freeze({
        setOwner,
        lock,
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
