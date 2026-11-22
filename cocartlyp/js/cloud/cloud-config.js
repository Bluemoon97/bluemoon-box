/*
 ==========================================
 Cocartly
 Cloud Configuration

 Supabase client initialization
 ==========================================
*/


/*
 ==========================================
 Supabase Project Settings
 ==========================================

 IMPORTANT

 Browser側には
 Publishable keyだけを置きます。

 Secret key
 service_role key
 Database password

 は絶対にここへ記載しません。
*/


const COCARTLY_SUPABASE_URL =
    "https://fdngrycjhwtcbemcljea.supabase.co";


const COCARTLY_SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_lvi2QPqhIhIIV8jDCplKnQ_b7hy94yk";


/*
 ==========================================
 Supabase Client
 ==========================================
*/

let cocartlySupabase = null;


/*
 ==========================================
 設定済みか確認
 ==========================================
*/

function isCocartlyCloudConfigured() {

    if (
        !COCARTLY_SUPABASE_URL ||
        !COCARTLY_SUPABASE_PUBLISHABLE_KEY
    ) {
        return false;
    }


    if (
        COCARTLY_SUPABASE_URL ===
        "YOUR_SUPABASE_PROJECT_URL"
    ) {
        return false;
    }


    if (
        COCARTLY_SUPABASE_PUBLISHABLE_KEY ===
        "YOUR_SUPABASE_PUBLISHABLE_KEY"
    ) {
        return false;
    }


    return true;

}


/*
 ==========================================
 Supabase Client 初期化
 ==========================================
*/

function initializeCocartlySupabase() {

    if (cocartlySupabase) {
        return cocartlySupabase;
    }


    if (!isCocartlyCloudConfigured()) {

        console.warn(
            "Cocartly Cloud: Supabase is not configured."
        );

        return null;

    }


    if (
        typeof window.supabase === "undefined" ||
        typeof window.supabase.createClient !== "function"
    ) {

        console.error(
            "Cocartly Cloud: supabase-js is not loaded."
        );

        return null;

    }


    cocartlySupabase =
        window.supabase.createClient(
            COCARTLY_SUPABASE_URL,
            COCARTLY_SUPABASE_PUBLISHABLE_KEY,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            }
        );


    return cocartlySupabase;

}


/*
 ==========================================
 Supabase Client取得
 ==========================================
*/

function getCocartlySupabase() {

    return (
        cocartlySupabase ||
        initializeCocartlySupabase()
    );

}