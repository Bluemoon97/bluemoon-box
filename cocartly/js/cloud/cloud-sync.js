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


let cocartlyCloudSyncTimer = null;

let cocartlyCloudSyncRunning = false;

let cocartlyCloudRestoreRunning = false;

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
            localStorage.getItem(
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

        console.warn(
            "Cocartly Cloud meta load:",
            error
        );


        return {
            records: {},
            settings: {}
        };

    }

}


function saveCocartlyCloudMeta(
    meta
) {

    localStorage.setItem(
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

    return Boolean(
        getCocartlyCloudUserId()
    );

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


    const parsed =
        safeParseCocartlyCloudJson(
            localStorage.getItem(
                config.storageKey
            ),
            []
        );


    return normalizeCocartlyCloudArray(
        parsed
    );

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


    localStorage.setItem(
        config.storageKey,
        JSON.stringify(
            normalizeCocartlyCloudArray(
                records
            )
        )
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


    return localStorage.getItem(
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


    localStorage.setItem(
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
        return [];
    }


    const {
        data,
        error
    } =
        await client
            .from(
                COCARTLY_CLOUD_DATA_TABLE
            )
            .select(
                "domain,record_id,data,is_deleted,client_updated_at,server_updated_at,created_at"
            )
            .eq(
                "domain",
                domain
            );


    if (error) {
        throw error;
    }


    return Array.isArray(data)
        ? data
        : [];

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
        return [];
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
            );


    if (error) {
        throw error;
    }


    return Array.isArray(data)
        ? data
        : [];

}


/*
 ==========================================
 Domain同期
 ==========================================
*/

async function syncCocartlyDomain(
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

async function syncCocartlyCloud() {

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


        for (
            const domain
            of domains
        ) {

            await syncCocartlyDomain(
                domain
            );


            /*
             成功したdomainだけ
             dirtyから削除する。

             途中で失敗した場合、
             未同期domainは残る。
            */

            cocartlyCloudDirtyDomains.delete(
                domain
            );

        }


        for (
            const settingKey
            of settings
        ) {

            await syncCocartlySetting(
                settingKey
            );


            cocartlyCloudDirtySettings.delete(
                settingKey
            );

        }


        syncSucceeded = true;

    }
    catch (error) {

        /*
         localStorageは変更しない。

         dirty状態も残るため、
         後で安全に再送できる。
        */

        scheduleCocartlyCloudRetry();

        throw error;

    }
    finally {

        cocartlyCloudSyncRunning =
            false;

    }


    if (syncSucceeded) {

        clearCocartlyCloudRetry();

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

async function restoreAndMergeCocartlyCloud() {

    if (
        cocartlyCloudRestoreRunning
    ) {
        return;
    }


    if (
        !navigator.onLine ||
        !canUseCocartlyPrivateCloud()
    ) {
        return;
    }


    cocartlyCloudRestoreRunning =
        true;


    try {

        const meta =
            loadCocartlyCloudMeta();


        /*
         Data domains
        */

        for (
            const domain
            of Object.keys(
                COCARTLY_CLOUD_DOMAINS
            )
        ) {

            const localRecords =
                readCocartlyLocalDomain(
                    domain
                );


            const cloudRows =
                await fetchCocartlyCloudDomain(
                    domain
                );


            const mergedRecords =
                mergeCocartlyDomainRecords(
                    localRecords,
                    cloudRows
                );


            /*
             localStorage.clear() は
             絶対に行わない。
            */

            writeCocartlyLocalDomain(
                domain,
                mergedRecords
            );


            const domainMeta = {};


            mergedRecords.forEach(
                record => {

                    const id =
                        getCocartlyRecordId(
                            record
                        );


                    if (id) {

                        domainMeta[
                            id
                        ] = true;

                    }

                }
            );


            meta.records[
                domain
            ] =
                domainMeta;

        }


        /*
         Settings
        */

        const cloudSettings =
            await fetchCocartlyCloudSettings();


        for (
            const row
            of cloudSettings
        ) {

            if (
                !Object.prototype.hasOwnProperty.call(
                    COCARTLY_CLOUD_SETTINGS,
                    row.setting_key
                )
            ) {
                continue;
            }


            const localValue =
                readCocartlyLocalSetting(
                    row.setting_key
                );


            /*
             新端末など、
             localに設定がなければ
             Cloudを復元。

             既存端末のlocal設定は
             初回mergeでは優先。
            */

            if (
                localValue === null ||
                localValue === undefined
            ) {

                writeCocartlyLocalSetting(
                    row.setting_key,
                    row.value
                );

            }


            meta.settings[
                row.setting_key
            ] = true;

        }


        saveCocartlyCloudMeta(
            meta
        );


        /*
         Merge後は全domainをdirtyにして
         Cloudへ不足分を補完する。
        */

        Object.keys(
            COCARTLY_CLOUD_DOMAINS
        ).forEach(
            domain => {

                cocartlyCloudDirtyDomains.add(
                    domain
                );

            }
        );


        Object.keys(
            COCARTLY_CLOUD_SETTINGS
        ).forEach(
            settingKey => {

                cocartlyCloudDirtySettings.add(
                    settingKey
                );

            }
        );


        cocartlyCloudInitialMergeCompleted =
            true;

    }
    finally {

        cocartlyCloudRestoreRunning =
            false;

    }


    /*
     restore終了後に同期
    */

    await syncCocartlyCloud();

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

async function initializeCocartlyCloud() {

    if (cocartlyCloudInitialized) {
        return;
    }


    cocartlyCloudInitialized =
        true;


    if (
        !isCocartlyCloudConfigured()
    ) {
        return;
    }


    await initializeCocartlyAuth();


    if (
        canUseCocartlyPrivateCloud() &&
        !cocartlyCloudInitialMergeCompleted
    ) {

        await restoreAndMergeCocartlyCloud();

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