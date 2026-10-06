/*
 ==========================================
 Cocartly
 Cloud Authentication
 ==========================================
*/


let cocartlyCurrentSession = null;
let cocartlyAuthInitialized = false;
let cocartlyAuthSubscription = null;


/*
 ==========================================
 現在のSession
 ==========================================
*/

function getCocartlyCloudSession() {

    return cocartlyCurrentSession;

}


/*
 ==========================================
 現在のUser
 ==========================================
*/

function getCocartlyCloudUser() {

    return (
        cocartlyCurrentSession &&
        cocartlyCurrentSession.user
            ? cocartlyCurrentSession.user
            : null
    );

}


/*
 ==========================================
 ログイン状態
 ==========================================
*/

function isCocartlyCloudLoggedIn() {

    return Boolean(
        getCocartlyCloudUser()
    );

}


/*
 ==========================================
 Auth状態をUIへ通知
 ==========================================
*/

function notifyCocartlyAuthChanged(
    eventName
) {

    window.dispatchEvent(
        new CustomEvent(
            "cocartly-auth-changed",
            {
                detail: {
                    event:
                        eventName || null,

                    session:
                        cocartlyCurrentSession,

                    user:
                        getCocartlyCloudUser(),

                    loggedIn:
                        isCocartlyCloudLoggedIn()
                }
            }
        )
    );

}


/*
 ==========================================
 Auth初期化
 ==========================================
*/

async function initializeCocartlyAuth() {

    if (cocartlyAuthInitialized) {

        return {
            session:
                cocartlyCurrentSession,
            user:
                getCocartlyCloudUser()
        };

    }


    const client =
        getCocartlySupabase();


    if (!client) {

        return {
            session: null,
            user: null
        };

    }


    const {
        data,
        error
    } =
        await client.auth.getSession();


    if (error) {

        console.error(
            "Cocartly Cloud Auth:",
            error
        );

    }


    cocartlyCurrentSession =
        data && data.session
            ? data.session
            : null;


    /*
     Authイベント監視
    */

    const {
        data: listenerData
    } =
        client.auth.onAuthStateChange(
            (
                event,
                session
            ) => {

                cocartlyCurrentSession =
                    session || null;


                notifyCocartlyAuthChanged(
                    event
                );


                /*
                 SIGNED_IN時は
                 cloud-sync側へ通知

                 callback内では
                 長い非同期処理を直接awaitしない
                */

                if (
                    event === "SIGNED_IN" &&
                    typeof handleCocartlyCloudSignedIn ===
                    "function"
                ) {

                    window.setTimeout(
                        () => {

                            handleCocartlyCloudSignedIn()
                                .catch(
                                    error => {

                                        console.error(
                                            "Cocartly Cloud sign-in sync:",
                                            error
                                        );

                                    }
                                );

                        },
                        0
                    );

                }


                /*
                 SIGNED_OUT
                */

                if (
                    event === "SIGNED_OUT" &&
                    typeof handleCocartlyCloudSignedOut ===
                    "function"
                ) {

                    handleCocartlyCloudSignedOut();

                }

            }
        );


    cocartlyAuthSubscription =
        listenerData &&
        listenerData.subscription
            ? listenerData.subscription
            : null;


    cocartlyAuthInitialized = true;


    notifyCocartlyAuthChanged(
        "INITIAL_SESSION"
    );


    return {
        session:
            cocartlyCurrentSession,
        user:
            getCocartlyCloudUser()
    };

}


/*
 ==========================================
 アカウント作成
 ==========================================
*/

async function signUpCocartlyCloud(
    email,
    password
) {

    const client =
        getCocartlySupabase();


    if (!client) {
        throw new Error(
            "Cocartly Cloud is not configured."
        );
    }


    const normalizedEmail =
        String(
            email || ""
        )
            .trim()
            .toLowerCase();


    if (!normalizedEmail) {
        throw new Error(
            "Email is required."
        );
    }


    if (
        typeof password !== "string" ||
        password.length < 8
    ) {
        throw new Error(
            "Password must contain at least 8 characters."
        );
    }


    const {
        data,
        error
    } =
        await client.auth.signUp({
            email:
                normalizedEmail,

            password:
                password
        });


    if (error) {
        throw error;
    }


    return data;

}


/*
 ==========================================
 ログイン
 ==========================================
*/

async function signInCocartlyCloud(
    email,
    password
) {

    const client =
        getCocartlySupabase();


    if (!client) {
        throw new Error(
            "Cocartly Cloud is not configured."
        );
    }


    const normalizedEmail =
        String(
            email || ""
        )
            .trim()
            .toLowerCase();


    if (!normalizedEmail) {
        throw new Error(
            "Email is required."
        );
    }


    if (!password) {
        throw new Error(
            "Password is required."
        );
    }


    const {
        data,
        error
    } =
        await client.auth.signInWithPassword({
            email:
                normalizedEmail,

            password:
                password
        });


    if (error) {
        throw error;
    }


    return data;

}


/*
 ==========================================
 ログアウト
 ==========================================
*/

async function signOutCocartlyCloud() {

    const client =
        getCocartlySupabase();


    if (!client) {
        return;
    }


    const {
        error
    } =
        await client.auth.signOut();


    if (error) {
        throw error;
    }

}


/*
 ==========================================
 Password Reset Email
 ==========================================
*/

async function sendCocartlyPasswordReset(
    email
) {

    const client =
        getCocartlySupabase();


    if (!client) {
        throw new Error(
            "Cocartly Cloud is not configured."
        );
    }


    const normalizedEmail =
        String(
            email || ""
        )
            .trim()
            .toLowerCase();


    if (!normalizedEmail) {
        throw new Error(
            "Email is required."
        );
    }


    const redirectTo =
        window.location.origin +
        window.location.pathname;


    const {
        data,
        error
    } =
        await client.auth.resetPasswordForEmail(
            normalizedEmail,
            {
                redirectTo:
                    redirectTo
            }
        );


    if (error) {
        throw error;
    }


    return data;

}


/*
 ==========================================
 新しいPasswordを設定
 ==========================================
*/

async function updateCocartlyPassword(
    newPassword
) {

    const client =
        getCocartlySupabase();


    if (!client) {
        throw new Error(
            "Cocartly Cloud is not configured."
        );
    }


    if (
        typeof newPassword !== "string" ||
        newPassword.length < 8
    ) {
        throw new Error(
            "Password must contain at least 8 characters."
        );
    }


    const {
        data,
        error
    } =
        await client.auth.updateUser({
            password:
                newPassword
        });


    if (error) {
        throw error;
    }


    return data;

}


/*
 ==========================================
 Auth終了処理
 ==========================================
*/

function destroyCocartlyAuthListener() {

    if (
        cocartlyAuthSubscription &&
        typeof cocartlyAuthSubscription.unsubscribe ===
        "function"
    ) {

        cocartlyAuthSubscription.unsubscribe();

    }


    cocartlyAuthSubscription = null;
    cocartlyAuthInitialized = false;

}