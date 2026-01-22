import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";
import { Join } from "@/lib/joins-data";

const COLLECTION_NAME = "joins";

export async function getJoins(courseId?: string, limitCount?: number): Promise<Join[]> {
    const constraints: any[] = [orderBy("date", "asc")]; // Sort by date ascending (nearest first)

    if (courseId && courseId !== "all") {
        constraints.push(where("courseId", "==", courseId));
    }

    if (limitCount) {
        constraints.push(limit(limitCount));
    }

    const q = query(collection(db, COLLECTION_NAME), ...constraints);

    const querySnapshot = await getDocs(q);
    const joins: Join[] = [];
    querySnapshot.forEach((doc) => {
        joins.push({ id: doc.id, ...doc.data() } as Join);
    });
    return joins;
}

export async function getJoin(id: string): Promise<Join | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Join;
    } else {
        return null;
    }
}

export async function createJoin(joinData: Omit<Join, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), joinData);
    return docRef.id;
}

export async function updateJoin(id: string, data: Partial<Join>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
}

export async function deleteJoin(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
}
