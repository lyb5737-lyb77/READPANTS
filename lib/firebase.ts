import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCTF0J6KQltV_0N8T5-b4U3648Zxqtl41A",
    authDomain: "redpants-3d409.firebaseapp.com",
    projectId: "redpants-3d409",
    storageBucket: "redpants-3d409.firebasestorage.app",
    messagingSenderId: "650233336252",
    appId: "1:650233336252:web:a5d4a928aa388cdf0c9bb9",
    measurementId: "G-BV9WD4Q2NX"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics;
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, auth, db, storage, analytics };
