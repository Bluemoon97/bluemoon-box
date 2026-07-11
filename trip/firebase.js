// Firebase SDK
import {
    getFirestore,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

// Firebase設定
const firebaseConfig = {
    apiKey: "AIzaSyBuJvNL120BXsXIo7F4y-pBgiZaU-5Up6M",
    authDomain: "travelitinerary-be946.firebaseapp.com",
    projectId: "travelitinerary-be946",
    storageBucket: "travelitinerary-be946.firebasestorage.app",
    messagingSenderId: "948778605342",
    appId: "1:948778605342:web:98591b4da38a4762a0470f"
};

// 初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = getFirestore(app);

// 現在のページ名
const page = location.pathname.split("/").pop();

// ----------------------
// login.html
// ----------------------
if (page === "login.html") {

    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const message = document.getElementById("message");

    onAuthStateChanged(auth, (user) => {
        if (user) {
            location.href = "index.html";
        }
    });

    registerBtn.addEventListener("click", async () => {

        message.textContent = "";

        try {

            await createUserWithEmailAndPassword(
                auth,
                email.value,
                password.value
            );

        } catch (e) {

            message.textContent = e.message;

        }

    });

    loginBtn.addEventListener("click", async () => {

        message.textContent = "";

        try {

            await signInWithEmailAndPassword(
                auth,
                email.value,
                password.value
            );

        } catch (e) {

            message.textContent = e.message;

        }

    });

}

// ----------------------
// index.html
// ----------------------
if (page === "index.html" || page === "") {

    onAuthStateChanged(auth, (user) => {

        if (!user) {

            location.href = "login.html";

        }

    });

}

// ログアウト用
window.firebaseSignOut = () => signOut(auth);

window.saveTravelDataToFirebase = async function (data) {

    const user = auth.currentUser;

    if (!user) {
        alert("ログインしてください");
        return;
    }

    try {

        await setDoc(
            doc(db, "groups", "family001"),
            {
                travelData_day1: JSON.stringify(data)
            },
            { merge: true }
        );

        alert("Firebaseへ保存しました");

    } catch (e) {

        console.error(e);
        alert("保存に失敗しました");

    }

};   // ← ここで saveTravelDataToFirebase は終わり


window.loadTravelDataFromFirebase = async function () {

    const user = auth.currentUser;

    if (!user) return null;

    try {

        const snap = await getDoc(
            doc(db, "groups", "family001")
        );

        if (!snap.exists()) return null;

        const json = snap.data().travelData_day1;

        if (!json) return null;

        return JSON.parse(json);

    } catch (e) {

        console.error(e);
        return null;

    }

};