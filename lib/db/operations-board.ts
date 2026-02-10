import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    arrayUnion
} from "firebase/firestore";
import { OperationsPost } from "@/types/operations-board";

const COLLECTION_NAME = "operations_posts";

export async function getOperationsPosts(): Promise<OperationsPost[]> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
            } as OperationsPost;
        });
    } catch (error) {
        console.error("Error fetching operations posts:", error);
        return [];
    }
}

export async function getOperationsPost(id: string): Promise<OperationsPost | null> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
            } as OperationsPost;
        }
        return null;
    } catch (error) {
        console.error("Error fetching operations post:", error);
        return null;
    }
}

export async function createOperationsPost(
    post: Omit<OperationsPost, "id" | "createdAt" | "updatedAt" | "readBy">
): Promise<string> {
    try {
        // Filter out undefined values as Firestore doesn't allow them
        const postData: Record<string, any> = {
            title: post.title,
            content: post.content,
            authorId: post.authorId,
            authorName: post.authorName,
            readBy: [post.authorId], // Author automatically reads their own post
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        // Only add optional fields if they're defined and not empty
        if (post.authorProfileUrl) {
            postData.authorProfileUrl = post.authorProfileUrl;
        }
        if (post.targetAdmins && post.targetAdmins.length > 0) {
            postData.targetAdmins = post.targetAdmins;
        }
        if (post.images && post.images.length > 0) {
            postData.images = post.images;
        }

        const docRef = await addDoc(collection(db, COLLECTION_NAME), postData);
        return docRef.id;
    } catch (error) {
        console.error("Error creating operations post:", error);
        throw error;
    }
}

export async function updateOperationsPost(
    id: string,
    post: Partial<Omit<OperationsPost, "id" | "createdAt" | "updatedAt" | "readBy">>
): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...post,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error updating operations post:", error);
        throw error;
    }
}

export async function deleteOperationsPost(id: string): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting operations post:", error);
        throw error;
    }
}

export async function markAsRead(postId: string, userId: string): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, postId);
        await updateDoc(docRef, {
            readBy: arrayUnion(userId)
        });
    } catch (error) {
        console.error("Error marking post as read:", error);
        throw error;
    }
}
