// 임시 스크립트: Firestore의 조인 데이터 확인
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkJoins() {
    const joinsSnapshot = await getDocs(collection(db, 'joins'));

    console.log('\n=== FIRESTORE JOINS DATA ===\n');
    joinsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`ID: ${doc.id}`);
        console.log(`  Course: ${data.courseName}`);
        console.log(`  Country: "${data.country}" (type: ${typeof data.country})`);
        console.log(`  Region: "${data.region}" (type: ${typeof data.region})`);
        console.log(`  Date: ${data.date}`);
        console.log('---');
    });

    process.exit(0);
}

checkJoins().catch(console.error);
