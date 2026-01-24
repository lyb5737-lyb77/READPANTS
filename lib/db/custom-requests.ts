import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    query,
    orderBy,
    getDocs,
    updateDoc,
    doc,
    serverTimestamp,
    where
} from "firebase/firestore";
import { CustomRequest } from "@/types/custom-features";

const COLLECTION_NAME = "custom_requests";

export async function createCustomRequest(userId: string, data: Omit<CustomRequest, 'id' | 'userId' | 'status' | 'createdAt'>) {
    try {
        await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            userId,
            status: 'pending',
            createdAt: new Date().toISOString(),
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error creating custom request:", error);
        throw error;
    }
}

export async function getCustomRequests() {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomRequest));
    } catch (error) {
        console.error("Error fetching custom requests:", error);
        return [];
    }
}

export async function updateCustomRequestStatus(requestId: string, status: 'replied' | 'completed', replyMessage?: string) {
    try {
        const docRef = doc(db, COLLECTION_NAME, requestId);
        const updateData: any = { status };
        if (replyMessage) {
            updateData.replyMessage = replyMessage;
        }
        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error("Error updating custom request status:", error);
        throw error;
    }
}
