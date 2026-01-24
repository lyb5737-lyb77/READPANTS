import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    updateDoc,
    doc,
    serverTimestamp,
    limit,
    onSnapshot
} from "firebase/firestore";
import { Notification } from "@/types/custom-features";

const COLLECTION_NAME = "notifications";

export async function sendNotification(userId: string, message: string, type: 'notice' | 'reply' = 'notice', relatedId?: string) {
    try {
        await addDoc(collection(db, COLLECTION_NAME), {
            userId,
            message,
            isRead: false,
            type,
            relatedId: relatedId || null,
            createdAt: new Date().toISOString(),
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error sending notification:", error);
        throw error;
    }
}

export async function getUserNotifications(userId: string) {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
            limit(50)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
}

export async function markNotificationAsRead(notificationId: string) {
    try {
        const docRef = doc(db, COLLECTION_NAME, notificationId);
        await updateDoc(docRef, { isRead: true });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
}

export function subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void, onError?: (error: any) => void) {
    const q = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(20)
    );

    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        callback(notifications);
    }, (error) => {
        if (onError) onError(error);
        else console.error("Snapshot error:", error);
    });
}
