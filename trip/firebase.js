// Firebase SDK
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

// 画面部品
const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const message = document.getElementById("message");

// ログイン済みならindex.htmlへ
onAuthStateChanged(auth, (user) => {
if (user) {
location.href = "index.html";
}
});

// 新規登録
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

// ログイン
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

// 後でindex.htmlから使います
window.firebaseAuth = auth;
window.firebaseSignOut = () => signOut(auth);