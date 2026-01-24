import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, getCountFromServer, query, orderBy, limit } from "firebase/firestore";

const COLLECTION_NAME = "users";

export interface UserProfile {
    uid: string;
    email: string;
    nickname: string;
    phone?: string; // 휴대폰번호 (선택)
    gender?: 'male' | 'female' | 'other'; // 성별 (선택)
    level: string; // '브론즈', '실버', '골드', '다이아'
    role: 'user' | 'admin';
    avgScore: number;
    activityPoints?: number; // 활동 포인트 (선택, 기본값 0)
    createdAt: string;
}

export async function getUsers(): Promise<UserProfile[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
        users.push(doc.data() as UserProfile);
    });
    return users;
}

export async function getUser(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    } else {
        return null;
    }
}

export async function createUser(uid: string, data: Omit<UserProfile, "uid">): Promise<void> {
    await setDoc(doc(db, COLLECTION_NAME, uid), { uid, ...data });
}

export async function updateUser(uid: string, data: Partial<UserProfile>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    await updateDoc(docRef, data);
}

export async function getUsersCount(): Promise<number> {
    const coll = collection(db, COLLECTION_NAME);
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
}

export async function getRecentUsers(limitCount: number = 5): Promise<UserProfile[]> {
    const q = query(
        collection(db, COLLECTION_NAME),
        orderBy("createdAt", "desc"),
        limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
        users.push(doc.data() as UserProfile);
    });
    return users;
}
