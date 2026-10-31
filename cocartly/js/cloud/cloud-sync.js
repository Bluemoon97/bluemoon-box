/*
 ==========================================
 Cocartly
 Private Cloud Sync
 ==========================================

 方針

 localStorage
     ↓
 Cocartly本体

 Supabase
     ↓
 Premium個人クラウド

 Cloud失敗時も
 localStorageは壊さない。

 shoppingSessionは同期しない。
 ==========================================
*/


const COCARTLY_CLOUD_DATA_TABLE =
    "cocartly_private_data";


const COCARTLY_CLOUD_SETTINGS_TABLE =
    "cocartly_private_settings";


/*
 ==========================================
 同期対象
 ==========================================
*/

const COCARTLY_CLOUD_DOMAINS = {

    products: {
        storageKey:
            "shoppingSupportProducts"
    },

    makers: {
        storageKey:
            "shoppingSupport_makers"
    },

    categories: {
        storageKey:
            "shoppingSupport_categories"
    },

    stores: {
        storageKey:
            "shoppingSupportStores"
    },

    priceHistory: {
        storageKey:
            "shoppingSupportPriceHistory"
    },

    shoppingItems: {
        storageKey:
            "cocartlyShoppingItems"
    },

    storeChecks: {
        storageKey:
            "cocartlyStoreChecks"
    },

    outings: {
        storageKey:
            "outings"
    }

};


/*
 ==========================================
 同期対象設定
 ==========================================
*/

const COCARTLY_CLOUD_SETTINGS = {

    language: {
        storageKey:
            "cocartly-language"
    },

    baseCountry: {
        storageKey:
            "cocartly-base-country"
    }

};


/*
 ==========================================
 同期状態
 ==========================================
*/

const cocartlyCloudDirtyDomains =
    new Set();


const cocartlyCloudDirtySettings =
    new Set();

// 同期処理中に新しい変更が発生したかを管理する
const cocartlyCloudDomainRevisions =
    new Map();

const cocartlyCloudSettingRevisions =
    new Map();

let cocartlyCloudSyncTimer = null;

let cocartlyCloudSyncRunning = false;

let cocartlyCloudRestoreRunning = false;

// 復元と同期は同じ直列キューを通す。失敗しても後続の要求を止めない。
let cocartlyCloudQueue = Promise.resolve();
let cocartlyQueuedRestore = null;

function enqueueCocartlyCloud(task) {
    const token = CocartlyOwnerStorage.snapshot();
    const result = cocartlyCloudQueue.then(async () => {
        if (!CocartlyOwnerStorage.isCurrent(token)) return;
        if (!canUseCocartlyPrivateCloud() || !navigator.onLine) return;
        return task(token);
    });
    cocartlyCloudQueue = result.catch(() => {});
    return result;
}

function restoreAndMergeCocartlyCloud() {
    const token = CocartlyOwnerStorage.snapshot();
    if (cocartlyQueuedRestore && CocartlyOwnerStorage.isCurrent(cocartlyQueuedRestore.token)) {
        return cocartlyQueuedRestore.promise;
    }
    const promise = enqueueCocartlyCloud(async current => {
        try {
            await runCocartlyCloudRestore();
            if (CocartlyOwnerStorage.isCurrent(current) && cocartlyCloudInitialMergeCompleted) {
                await runCocartlyCloudSync();
            }
        } catch (error) {
            if (CocartlyOwnerStorage.isCurrent(current)) scheduleCocartlyCloudRetry();
            throw error;
        }
    });
    const entry = {token, promise};
    cocartlyQueuedRestore = entry;
    promise.finally(() => {
        if (cocartlyQueuedRestore === entry) cocartlyQueuedRestore = null;
    }).catch(() => {});
    return promise;
}

function syncCocartlyCloud() {
    if (!cocartlyCloudInitialMergeCompleted) return restoreAndMergeCocartlyCloud();
    return enqueueCocartlyCloud(async token => {
        if (!cocartlyCloudInitialMergeCompleted) await runCocartlyCloudRestore();
        if (CocartlyOwnerStorage.isCurrent(token) && cocartlyCloudInitialMergeCompleted) {
            await runCocartlyCloudSync();
        }
    });
}

let cocartlyCloudInitialized = false;

let cocartlyCloudInitialMergeCompleted =
    false;



/*
 ==========================================
 Cloud同期 Retry

 通信エラーなどで同期できなかった場合、
 localStorageはそのまま保持し、
 dirty状態も消さずに再試行する。

 無限に短時間で通信し続けないよう、
 段階的に待ち時間を長くする。
 ==========================================
*/

const COCARTLY_CLOUD_RETRY_DELAYS = [
    5000,
    15000,
    30000,
    60000
];

let cocartlyCloudRetryTimer = null;

let cocartlyCloudRetryCount = 0;


function clearCocartlyCloudRetry() {

    if (cocartlyCloudRetryTimer) {

        clearTimeout(
            cocartlyCloudRetryTimer
        );

        cocartlyCloudRetryTimer = null;

    }

    cocartlyCloudRetryCount = 0;

}


function scheduleCocartlyCloudRetry() {

    if (
        cocartlyCloudRetryTimer ||
        !navigator.onLine ||
        !canUseCocartlyPrivateCloud()
    ) {
        return;
    }


    const delayIndex =
        Math.min(
            cocartlyCloudRetryCount,
            COCARTLY_CLOUD_RETRY_DELAYS.length - 1
        );


    const delay =
        COCARTLY_CLOUD_RETRY_DELAYS[
        delayIndex
        ];


    cocartlyCloudRetryCount += 1;


    cocartlyCloudRetryTimer =
        window.setTimeout(
            () => {

                cocartlyCloudRetryTimer = null;

                syncCocartlyCloud()
                    .catch(
                        error => {

                            console.error(
                                "Cocartly Cloud retry:",
                                error
                            );

                        }
                    );

            },
            delay
        );

}

/*
 ==========================================
 Sync metadata

 Cocartly本体データとは分離して保存
 ==========================================
*/

const COCARTLY_CLOUD_META_KEY =
    "cocartly-cloud-sync-meta";


function loadCocartlyCloudMeta() {

    try {

        const raw =
            CocartlyOwnerStorage.getItem(
                COCARTLY_CLOUD_META_KEY
            );


        if (!raw) {

            return {
                records: {},
                settings: {}
            };

        }


        const parsed =
            JSON.parse(raw);


        if (!parsed || typeof parsed !== "object" ||
            !parsed.records || typeof parsed.records !== "object" || Array.isArray(parsed.records) ||
            !parsed.settings || typeof parsed.settings !== "object" || Array.isArray(parsed.settings)) {
            throw new Error("Invalid Cocartly sync metadata");
        }
        return {
            records:
                parsed &&
                    parsed.records &&
                    typeof parsed.records === "object"
                    ? parsed.records
                    : {},

            settings:
                parsed &&
                    parsed.settings &&
                    typeof parsed.settings === "object"
                    ? parsed.settings
                    : {}
        };

    }
    catch (error) {
        throw new Error("Cocartly sync metadata could not be read", {cause: error});
    }

}


function saveCocartlyCloudMeta(
    meta
) {

    CocartlyOwnerStorage.setItem(
        COCARTLY_CLOUD_META_KEY,
        JSON.stringify(meta)
    );

}


/*
 ==========================================
 User確認
 ==========================================
*/

function getCocartlyCloudUserId() {

    const user =
        typeof getCocartlyCloudUser ===
            "function"
            ? getCocartlyCloudUser()
            : null;


    return user && user.id
        ? user.id
        : null;

}


/*
 ==========================================
 Premium判定

 ④ではAccountとPlanを分離するため、
 Premium課金判定はまだ実装しない。

 現段階ではログイン済みAccountを
 Cloud利用可能状態として扱う。

 ⑤でこの関数だけをPlan判定へ接続する。
 ==========================================
*/

function canUseCocartlyPrivateCloud() {

    const id = getCocartlyCloudUserId();
    return Boolean(id && window.CocartlyOwnerStorage?.getOwner() === "user:" + id);

}


/*
 ==========================================
 JSON Utility
 ==========================================
*/

function safeParseCocartlyCloudJson(
    raw,
    fallback
) {

    try {

        if (
            raw === null ||
            raw === undefined ||
            raw === ""
        ) {
            return fallback;
        }


        return JSON.parse(raw);

    }
    catch (error) {

        console.warn(
            "Cocartly Cloud JSON parse:",
            error
        );


        return fallback;

    }

}


function normalizeCocartlyCloudArray(
    value
) {

    return Array.isArray(value)
        ? value
        : [];

}


/*
 ==========================================
 Timestamp
 ==========================================
*/

function getCocartlyRecordTimestamp(
    record
) {

    if (
        !record ||
        typeof record !== "object"
    ) {
        return 0;
    }


    const candidates = [
        record.updatedAt,
        record.updated_at,
        record.checkedAt,
        record.purchasedAt,
        record.createdAt,
        record.created_at
    ];


    for (
        const candidate
        of candidates
    ) {

        if (!candidate) {
            continue;
        }


        const timestamp =
            Date.parse(candidate);


        if (
            Number.isFinite(timestamp)
        ) {
            return timestamp;
        }

    }


    return 0;

}


/*
 ==========================================
 Record ID
 ==========================================
*/

function getCocartlyRecordId(
    record
) {

    if (
        !record ||
        typeof record !== "object"
    ) {
        return null;
    }


    const id =
        record.id !== undefined &&
            record.id !== null
            ? String(record.id)
            : "";


    return id || null;

}


/*
 ==========================================
 Domain local data
 ==========================================
*/

function readCocartlyLocalDomain(
    domain
) {

    const config =
        COCARTLY_CLOUD_DOMAINS[
        domain
        ];

    if (!config) {
        return [];
    }

    const raw =
        CocartlyOwnerStorage.getItem(
            config.storageKey
        );

    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Invalid local domain: " + domain);
    return parsed;
}


function writeCocartlyLocalDomain(
    domain,
    records
) {

    const config =
        COCARTLY_CLOUD_DOMAINS[
        domain
        ];

    if (!config) {
        return;
    }

    const serialized = JSON.stringify(
        normalizeCocartlyCloudArray(records)
    );

    CocartlyOwnerStorage.setItem(
        config.storageKey,
        serialized
    );

}


/*
 ==========================================
 Settings
 ==========================================
*/

function readCocartlyLocalSetting(
    settingKey
) {

    const config =
        COCARTLY_CLOUD_SETTINGS[
        settingKey
        ];


    if (!config) {
        return null;
    }


    return CocartlyOwnerStorage.getItem(
        config.storageKey
    );

}


function writeCocartlyLocalSetting(
    settingKey,
    value
) {

    const config =
        COCARTLY_CLOUD_SETTINGS[
        settingKey
        ];


    if (!config) {
        return;
    }


    if (
        value === null ||
        value === undefined
    ) {
        return;
    }


    CocartlyOwnerStorage.setItem(
        config.storageKey,
        String(value)
    );

}


/*
 ==========================================
 既存saveXXXから呼ばれる入口
 ==========================================
*/

function notifyCocartlyDataChanged(
    domain
) {

    if (
        !Object.prototype.hasOwnProperty.call(
            COCARTLY_CLOUD_DOMAINS,
            domain
        )
    ) {
        return;
    }

    cocartlyCloudDirtyDomains.add(
        domain
    );

    cocartlyCloudDomainRevisions.set(
        domain,
        (cocartlyCloudDomainRevisions.get(domain) || 0) + 1
    );

    scheduleCocartlyCloudSync();

}


/*
 ==========================================
 設定変更通知
 ==========================================
*/

function notifyCocartlySettingChanged(
    settingKey
) {

    if (
        !Object.prototype.hasOwnProperty.call(
            COCARTLY_CLOUD_SETTINGS,
            settingKey
        )
    ) {
        return;
    }

    cocartlyCloudDirtySettings.add(
        settingKey
    );

    cocartlyCloudSettingRevisions.set(
        settingKey,
        (cocartlyCloudSettingRevisions.get(settingKey) || 0) + 1
    );

    scheduleCocartlyCloudSync();

}


/*
 ==========================================
 Debounce
 ==========================================
*/

function scheduleCocartlyCloudSync() {

    if (
        cocartlyCloudRestoreRunning
    ) {
        return;
    }


    if (cocartlyCloudSyncTimer) {

        clearTimeout(
            cocartlyCloudSyncTimer
        );

    }


    cocartlyCloudSyncTimer =
        window.setTimeout(
            () => {

                cocartlyCloudSyncTimer =
                    null;


                syncCocartlyCloud()
                    .catch(
                        error => {

                            console.error(
                                "Cocartly Cloud sync:",
                                error
                            );

                        }
                    );

            },
            1000
        );

}


/*
 ==========================================
 Cloud records取得
 ==========================================
*/

async function fetchCocartlyCloudDomain(
    domain
) {

    const client =
        getCocartlySupabase();


    const userId =
        getCocartlyCloudUserId();


    if (
        !client ||
        !userId
    ) {
        throw new Error("Cocartly cloud is unavailable");
    }


    const token = CocartlyOwnerStorage.snapshot();
    const rows = [];
    for (let offset = 0; ; offset += 500) {
        if (!CocartlyOwnerStorage.isCurrent(token)) throw new Error("Cocartly owner changed");
        const {data, error} = await client.from(COCARTLY_CLOUD_DATA_TABLE)
            .select("domain,record_id,data,is_deleted,client_updated_at,server_updated_at,created_at")
            .eq("domain", domain).eq("user_id", userId)
            .order("record_id").range(offset, offset + 499);
        if (error) throw error;
        if (!Array.isArray(data)) throw new Error("Invalid cloud domain response");
        rows.push(...data);
        if (data.length < 500) break;
    }
    return rows;
}


/*
 ==========================================
 Cloud settings取得
 ==========================================
*/

async function fetchCocartlyCloudSettings() {

    const client =
        getCocartlySupabase();


    const userId =
        getCocartlyCloudUserId();


    if (
        !client ||
        !userId
    ) {
        throw new Error("Cocartly cloud is unavailable");
    }


    const {
        data,
        error
    } =
        await client
            .from(
                COCARTLY_CLOUD_SETTINGS_TABLE
            )
            .select(
                "setting_key,value,client_updated_at,server_updated_at,created_at"
            )
            .eq(
                "user_id",
                userId
            );


    if (error) {
        throw error;
    }


    if (!Array.isArray(data)) throw new Error("Invalid cloud settings response");
    return data;
}


/*
 ==========================================
 Domain同期
 ==========================================
*/

async function syncCocartlyDomain(
    domain
) {

    // 同期開始時のアカウントを記録
    const uploadOwnerToken =
        window.CocartlyOwnerStorage?.snapshot();

    if (
        !window.CocartlyOwnerStorage?.isCurrent(
            uploadOwnerToken
        )
    ) {
        return;
    }


    const client =
        getCocartlySupabase();


    const userId =
        getCocartlyCloudUserId();


    if (
        !client ||
        !userId
    ) {
        return;
    }


    const localRecords =
        readCocartlyLocalDomain(
            domain
        );


    const cloudRows =
        await fetchCocartlyCloudDomain(
            domain
        );


    // 通信中にアカウントが変わっていないか確認
    if (
        !window.CocartlyOwnerStorage.isCurrent(
            uploadOwnerToken
        )
    ) {
        return;
    }


    const cloudById =
        new Map();


    cloudRows.forEach(
        row => {

            cloudById.set(
                String(
                    row.record_id
                ),
                row
            );

        }
    );


    const localIds =
        new Set();


    const meta =
        loadCocartlyCloudMeta();


    if (!meta.records[domain]) {
        meta.records[domain] = {};
    }


    const upsertRows = [];


    for (
        const record
        of localRecords
    ) {

        const recordId =
            getCocartlyRecordId(
                record
            );


        if (!recordId) {

            console.warn(
                "Cocartly Cloud: record without id",
                domain,
                record
            );

            continue;

        }


        localIds.add(
            recordId
        );


        const localTimestamp =
            getCocartlyRecordTimestamp(
                record
            );


        const cloudRow =
            cloudById.get(
                recordId
            );


        /*
         Cloudにない
        */

        if (!cloudRow) {

            upsertRows.push({
                user_id:
                    userId,

                domain:
                    domain,

                record_id:
                    recordId,

                data:
                    record,

                is_deleted:
                    false,

                client_updated_at:
                    localTimestamp
                        ? new Date(
                            localTimestamp
                        ).toISOString()
                        : new Date().toISOString()
            });


            continue;

        }


        /*
         Cloud削除状態
        */

        if (
            cloudRow.is_deleted === true
        ) {

            const cloudTimestamp =
                Date.parse(
                    cloudRow.server_updated_at ||
                    cloudRow.client_updated_at ||
                    0
                ) || 0;


            if (
                localTimestamp >
                cloudTimestamp
            ) {

                /*
                 削除後に明確に更新された
                 ローカルRecordなら復活可能
                */

                upsertRows.push({
                    user_id:
                        userId,

                    domain:
                        domain,

                    record_id:
                        recordId,

                    data:
                        record,

                    is_deleted:
                        false,

                    client_updated_at:
                        new Date(
                            localTimestamp
                        ).toISOString()
                });

            }


            continue;

        }


        const cloudClientTimestamp =
            Date.parse(
                cloudRow.client_updated_at ||
                0
            ) || 0;


        /*
         localが新しい
        */

        if (
            localTimestamp >
            cloudClientTimestamp
        ) {

            upsertRows.push({
                user_id:
                    userId,

                domain:
                    domain,

                record_id:
                    recordId,

                data:
                    record,

                is_deleted:
                    false,

                client_updated_at:
                    new Date(
                        localTimestamp
                    ).toISOString()
            });

        }

    }


    /*
     一度同期済みだったRecordが
     localから消えている場合だけ
     Tombstoneを作る。

     初回空端末を削除とは判断しない。
    */

    const deleteRows = [];


    Object.keys(
        meta.records[domain]
    ).forEach(
        recordId => {

            if (
                localIds.has(
                    recordId
                )
            ) {
                return;
            }


            const cloudRow =
                cloudById.get(
                    recordId
                );


            if (
                !cloudRow ||
                cloudRow.is_deleted === true
            ) {
                return;
            }


            deleteRows.push({
                user_id:
                    userId,

                domain:
                    domain,

                record_id:
                    recordId,

                data:
                    cloudRow.data || {},

                is_deleted:
                    true,

                client_updated_at:
                    new Date().toISOString()
            });

        }
    );


    const rowsToSave = [
        ...upsertRows,
        ...deleteRows
    ];


    if (
        rowsToSave.length > 0
    ) {

        // 通信中に別アカウントへ切り替わっていないか確認
        if (
            !window.CocartlyOwnerStorage.isCurrent(
                uploadOwnerToken
            )
        ) {
            return;
        }

        const {
            error
        } =
            await client
                .from(
                    COCARTLY_CLOUD_DATA_TABLE
                )
                .upsert(
                    rowsToSave,
                    {
                        onConflict:
                            "user_id,domain,record_id"
                    }
                );


        if (error) {
            throw error;
        }

    }


    /*
     現在のlocal IDを
     同期済みとして記録
    */

    // アカウント切り替え後に前の同期結果を記録しない
    if (
        !window.CocartlyOwnerStorage.isCurrent(
            uploadOwnerToken
        )
    ) {
        return;
    }

    const nextDomainMeta = {};


    localIds.forEach(
        recordId => {

            nextDomainMeta[
                recordId
            ] = true;

        }
    );


    meta.records[
        domain
    ] =
        nextDomainMeta;


    saveCocartlyCloudMeta(
        meta
    );

}


/*
 ==========================================
 Setting同期
 ==========================================
*/

async function syncCocartlySetting(
    settingKey
) {

    const uploadOwnerToken =
        window.CocartlyOwnerStorage?.snapshot();

    if (
        !window.CocartlyOwnerStorage?.isCurrent(
            uploadOwnerToken
        )
    ) {
        return;
    }

    const client =
        getCocartlySupabase();

    const userId =
        getCocartlyCloudUserId();

    if (
        !client ||
        !userId
    ) {
        return;
    }

    const value =
        readCocartlyLocalSetting(
            settingKey
        );

    if (
        value === null ||
        value === undefined
    ) {
        return;
    }

    // 保存直前に所有者を再確認
    if (
        !window.CocartlyOwnerStorage.isCurrent(
            uploadOwnerToken
        )
    ) {
        return;
    }

    const {
        error
    } =
        await client
            .from(
                COCARTLY_CLOUD_SETTINGS_TABLE
            )
            .upsert(
                {
                    user_id:
                        userId,

                    setting_key:
                        settingKey,

                    value:
                        value,

                    client_updated_at:
                        new Date().toISOString()
                },
                {
                    onConflict:
                        "user_id,setting_key"
                }
            );

    if (error) {
        throw error;
    }

    // 古いアカウントの同期結果を記録しない
    if (
        !window.CocartlyOwnerStorage.isCurrent(
            uploadOwnerToken
        )
    ) {
        return;
    }

    const meta =
        loadCocartlyCloudMeta();

    meta.settings[
        settingKey
    ] = true;

    saveCocartlyCloudMeta(
        meta
    );

}


/*
 ==========================================
 Dirty同期
 ==========================================
*/

async function runCocartlyCloudSync() {

    if (
        cocartlyCloudSyncRunning ||
        cocartlyCloudRestoreRunning
    ) {
        return;
    }

    if (!navigator.onLine) {

        scheduleCocartlyCloudRetry();

        return;
    }

    if (!canUseCocartlyPrivateCloud()) {

        clearCocartlyCloudRetry();

        return;
    }

    const syncOwnerToken =
        window.CocartlyOwnerStorage?.snapshot();

    if (
        !window.CocartlyOwnerStorage?.isCurrent(
            syncOwnerToken
        )
    ) {
        return;
    }

    CocartlyOwnerStorage.validateLocalData();
    cocartlyCloudSyncRunning = true;

    let syncSucceeded = false;

    try {

        const domains =
            Array.from(
                cocartlyCloudDirtyDomains
            );

        const settings =
            Array.from(
                cocartlyCloudDirtySettings
            );

        // 同期開始時点の変更番号を記録
        const domainRevisions =
            new Map(cocartlyCloudDomainRevisions);

        const settingRevisions =
            new Map(cocartlyCloudSettingRevisions);

        for (
            const domain
            of domains
        ) {

            if (
                !window.CocartlyOwnerStorage.isCurrent(
                    syncOwnerToken
                )
            ) {
                return;
            }

            await syncCocartlyDomain(
                domain
            );

            // 所有者が変わったら同期完了扱いにしない
            if (
                !window.CocartlyOwnerStorage.isCurrent(
                    syncOwnerToken
                )
            ) {
                return;
            }

            // 同期中に新しい変更がなければdirtyを解除
            if (
                cocartlyCloudDomainRevisions.get(domain) ===
                domainRevisions.get(domain)
            ) {

                cocartlyCloudDirtyDomains.delete(
                    domain
                );

            }

        }

        for (
            const settingKey
            of settings
        ) {

            if (
                !window.CocartlyOwnerStorage.isCurrent(
                    syncOwnerToken
                )
            ) {
                return;
            }

            await syncCocartlySetting(
                settingKey
            );

            if (
                !window.CocartlyOwnerStorage.isCurrent(
                    syncOwnerToken
                )
            ) {
                return;
            }

            if (
                cocartlyCloudSettingRevisions.get(settingKey) ===
                settingRevisions.get(settingKey)
            ) {

                cocartlyCloudDirtySettings.delete(
                    settingKey
                );

            }

        }

        syncSucceeded = true;

    }
    catch (error) {

        scheduleCocartlyCloudRetry();

        throw error;

    }
    finally {

        cocartlyCloudSyncRunning =
            false;

    }

    if (syncSucceeded && CocartlyOwnerStorage.isCurrent(syncOwnerToken)) {
        clearCocartlyCloudRetry();
        if (cocartlyCloudDirtyDomains.size || cocartlyCloudDirtySettings.size) {
            scheduleCocartlyCloudSync();
        }
    }

}


/*
 ==========================================
 Cloud → Local merge
 ==========================================
*/

function mergeCocartlyDomainRecords(
    localRecords,
    cloudRows
) {

    const seen = new Set();
    for (const record of localRecords) {
        const id = getCocartlyRecordId(record);
        if (!id || seen.has(id)) throw new Error("Invalid/duplicate local ID");
        seen.add(id);
    }
    seen.clear();
    for (const row of cloudRows) {
        const id = row.record_id === undefined || row.record_id === null ? "" : String(row.record_id);
        if (!id || seen.has(id)) throw new Error("Invalid/duplicate cloud ID");
        seen.add(id);
        if (row.is_deleted !== true &&
            (!row.data || Array.isArray(row.data) || getCocartlyRecordId(row.data) !== id)) {
            throw new Error("Cloud record ID does not match payload");
        }
    }

    const merged =
        new Map();


    /*
     localを先に入れる
    */

    localRecords.forEach(
        record => {

            const id =
                getCocartlyRecordId(
                    record
                );


            if (id) {

                merged.set(
                    id,
                    record
                );

            }

        }
    );


    /*
     Cloudと比較
    */

    cloudRows.forEach(
        row => {

            const id =
                String(
                    row.record_id
                );


            const localRecord =
                merged.get(
                    id
                );


            /*
             Cloud tombstone
            */

            if (
                row.is_deleted === true
            ) {

                const localTimestamp =
                    getCocartlyRecordTimestamp(
                        localRecord
                    );


                const deleteTimestamp =
                    Date.parse(
                        row.server_updated_at ||
                        row.client_updated_at ||
                        0
                    ) || 0;


                if (
                    !localRecord ||
                    localTimestamp <=
                    deleteTimestamp
                ) {

                    merged.delete(
                        id
                    );

                }


                return;

            }


            const cloudRecord =
                row.data;


            if (
                !cloudRecord ||
                typeof cloudRecord !==
                "object"
            ) {
                return;
            }


            if (!localRecord) {

                merged.set(
                    id,
                    cloudRecord
                );

                return;

            }


            const localTimestamp =
                getCocartlyRecordTimestamp(
                    localRecord
                );


            const cloudClientTimestamp =
                Date.parse(
                    row.client_updated_at ||
                    0
                ) || 0;


            /*
             Cloud側が新しい場合だけ
             Cloudを採用。

             同時刻はlocalを保持。
            */

            if (
                cloudClientTimestamp >
                localTimestamp
            ) {

                merged.set(
                    id,
                    cloudRecord
                );

            }

        }
    );


    return Array.from(
        merged.values()
    );

}


/*
 ==========================================
 Initial Restore / Merge
 ==========================================
*/

async function runCocartlyCloudRestore() {
    if (!navigator.onLine || !canUseCocartlyPrivateCloud()) return;
    const token = CocartlyOwnerStorage.snapshot();
    cocartlyCloudRestoreRunning = true;
    cocartlyCloudInitialMergeCompleted = false;
    window.dispatchEvent(new CustomEvent("cocartly-cloud-restore-start"));
    try {
        CocartlyOwnerStorage.validateLocalData();
        const fetched = {};
        // 取得に一度でも失敗したらローカルに触らない。
        for (const domain of Object.keys(COCARTLY_CLOUD_DOMAINS)) {
            fetched[domain] = await fetchCocartlyCloudDomain(domain);
            if (!CocartlyOwnerStorage.isCurrent(token)) return;
        }
        const settings = await fetchCocartlyCloudSettings();
        if (!CocartlyOwnerStorage.isCurrent(token)) return;
        // await終了後に最新ローカルを読む。通信中の保存を取りこぼさない。
        const meta = loadCocartlyCloudMeta();
        const values = {};
        for (const [domain, config] of Object.entries(COCARTLY_CLOUD_DOMAINS)) {
            const local = readCocartlyLocalDomain(domain);
            const localIds = new Set(local.map(getCocartlyRecordId));
            const previous = meta.records[domain] || {};
            // 同期済みIDのローカル完全削除は、再ログインで復活させない。
            const rows = fetched[domain].filter(row => row.is_deleted === true ||
                !Object.prototype.hasOwnProperty.call(previous, String(row.record_id)) ||
                localIds.has(String(row.record_id)));
            const merged = mergeCocartlyDomainRecords(local, rows);
            values[config.storageKey] = JSON.stringify(merged);
            meta.records[domain] = Object.fromEntries([
                ...Object.keys(previous).map(id => [id, true]),
                ...merged.map(record => [getCocartlyRecordId(record), true])
            ]);
        }
        for (const row of settings) {
            if (!Object.prototype.hasOwnProperty.call(COCARTLY_CLOUD_SETTINGS, row.setting_key)) continue;
            if (typeof row.value !== "string") throw new Error("Invalid cloud setting value");
            if (readCocartlyLocalSetting(row.setting_key) === null) {
                values[COCARTLY_CLOUD_SETTINGS[row.setting_key].storageKey] = row.value;
            }
            meta.settings[row.setting_key] = true;
        }
        values[COCARTLY_CLOUD_META_KEY] = JSON.stringify(meta);
        CocartlyOwnerStorage.applyBatch(values, token);
        if (!CocartlyOwnerStorage.isCurrent(token)) return;
        cocartlyCloudInitialMergeCompleted = true;
        Object.keys(COCARTLY_CLOUD_DOMAINS).forEach(d => cocartlyCloudDirtyDomains.add(d));
        Object.keys(COCARTLY_CLOUD_SETTINGS).forEach(k => cocartlyCloudDirtySettings.add(k));
        window.dispatchEvent(new CustomEvent("cocartly-cloud-restored", {detail: token}));
    } catch (error) {
        if (CocartlyOwnerStorage.isCurrent(token)) {
            window.dispatchEvent(new CustomEvent("cocartly-cloud-restore-failed", {detail: token}));
        }
        throw error;
    } finally {
        cocartlyCloudRestoreRunning = false;
    }
}

/*
 ==========================================
 Sign In
 ==========================================
*/

async function handleCocartlyCloudSignedIn() {

    if (
        !canUseCocartlyPrivateCloud()
    ) {
        return;
    }


    await restoreAndMergeCocartlyCloud();

}


/*
 ==========================================
 Sign Out
 ==========================================
*/

function handleCocartlyCloudSignedOut() {

    /*
     個人データはlocalStorageに残す。

     ログアウト = データ削除
     ではない。
    */

    cocartlyCloudDirtyDomains.clear();

    cocartlyCloudDirtySettings.clear();

    // 前のアカウントの変更管理情報を解除
    cocartlyCloudDomainRevisions.clear();
    cocartlyCloudSettingRevisions.clear();

    // 予約済みの同期タイマーを停止
    if (cocartlyCloudSyncTimer !== null) {

        clearTimeout(
            cocartlyCloudSyncTimer
        );

        cocartlyCloudSyncTimer = null;

    }

    /*
     ログアウト後は
     Cloud再試行も停止する。
    */

    clearCocartlyCloudRetry();

    cocartlyCloudInitialMergeCompleted =
        false;

}


/*
 ==========================================
 Cloud初期化
 ==========================================
*/

let cocartlyCloudInitPromise = null;

async function initializeCocartlyCloud() {

    if (cocartlyCloudInitPromise) {
        return cocartlyCloudInitPromise;
    }

    cocartlyCloudInitPromise = (async () => {

        if (!isCocartlyCloudConfigured()) {

            if (!window.CocartlyOwnerStorage) {
                throw new Error(
                    "Owner storage missing"
                );
            }

            window.CocartlyOwnerStorage.setOwner(
                "guest"
            );

            cocartlyCloudInitialized = true;
            return;
        }

        await initializeCocartlyAuth();

        if (
            !window.CocartlyOwnerStorage?.isReady()
        ) {
            throw new Error(
                "Owner unresolved"
            );
        }

        if (
            canUseCocartlyPrivateCloud() &&
            !cocartlyCloudInitialMergeCompleted
        ) {

            await restoreAndMergeCocartlyCloud();

        }

        cocartlyCloudInitialized = true;

    })();

    try {

        await cocartlyCloudInitPromise;

    } catch (error) {

        cocartlyCloudInitPromise = null;
        cocartlyCloudInitialized = false;

        throw error;

    }

}


/*
 ==========================================
 Online復帰
 ==========================================
*/

window.addEventListener(
    "online",
    () => {

        if (
            canUseCocartlyPrivateCloud()
        ) {

            syncCocartlyCloud()
                .catch(
                    error => {

                        console.error(
                            "Cocartly Cloud online sync:",
                            error
                        );

                    }
                );

        }

    }
);


/*
 ==========================================
 Language / Base Country監視

 既存i18n.jsの関数を壊さず、
 setter呼び出しをラップする。
 ==========================================
*/

function installCocartlySettingSyncHooks() {

    if (
        typeof setCocartlyLanguage ===
        "function" &&
        !setCocartlyLanguage
            .__cocartlyCloudWrapped
    ) {

        const originalSetLanguage =
            setCocartlyLanguage;


        const wrappedSetLanguage =
            function (
                language
            ) {

                const result =
                    originalSetLanguage(
                        language
                    );


                notifyCocartlySettingChanged(
                    "language"
                );


                return result;

            };


        wrappedSetLanguage
            .__cocartlyCloudWrapped =
            true;


        window.setCocartlyLanguage =
            wrappedSetLanguage;

    }


    if (
        typeof setCocartlyBaseCountry ===
        "function" &&
        !setCocartlyBaseCountry
            .__cocartlyCloudWrapped
    ) {

        const originalSetBaseCountry =
            setCocartlyBaseCountry;


        const wrappedSetBaseCountry =
            function (
                country
            ) {

                const result =
                    originalSetBaseCountry(
                        country
                    );


                notifyCocartlySettingChanged(
                    "baseCountry"
                );


                return result;

            };


        wrappedSetBaseCountry
            .__cocartlyCloudWrapped =
            true;


        window.setCocartlyBaseCountry =
            wrappedSetBaseCountry;

    }

}


/*
 ==========================================
 DOM ready
 ==========================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        installCocartlySettingSyncHooks();


        initializeCocartlyCloud()
            .catch(
                error => {

                    console.error(
                        "Cocartly Cloud initialization:",
                        error
                    );

                }
            );

    }
);
// 復元前・失敗後に初期データを既存クラウドより先に保存しない。
function canInitializeCocartlyDefaults() {
    return CocartlyOwnerStorage.getOwner() === "guest" || cocartlyCloudInitialMergeCompleted;
}
