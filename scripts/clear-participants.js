// 조인 신청 현황(joinParticipants) 컬렉션 초기화 스크립트
const fs = require('fs');
const path = require('path');

// .env.local 파일 수동 로드
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
        process.env[key.trim()] = valueParts.join('=').trim();
    }
});

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

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

async function clearJoinParticipants() {
    console.log('joinParticipants 컬렉션 초기화 시작...');

    const snapshot = await getDocs(collection(db, 'joinParticipants'));

    if (snapshot.empty) {
        console.log('삭제할 문서가 없습니다.');
        return;
    }

    console.log(`${snapshot.size}개의 문서를 삭제합니다...`);

    for (const docSnapshot of snapshot.docs) {
        await deleteDoc(doc(db, 'joinParticipants', docSnapshot.id));
        console.log(`  삭제: ${docSnapshot.id}`);
    }

    console.log('초기화 완료!');
}

clearJoinParticipants()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('오류 발생:', error);
        process.exit(1);
    });
