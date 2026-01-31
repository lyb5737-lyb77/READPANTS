
import { db, storage } from "@/lib/firebase";
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
    where,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export interface Banner {
    id: string;
    title: string;
    imageUrl: string;
    linkUrl: string;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const COLLECTION_NAME = "banners";

export async function getBanners(onlyActive = true): Promise<Banner[]> {
    try {
        let q = query(collection(db, COLLECTION_NAME), orderBy("order", "asc"));

        if (onlyActive) {
            q = query(q, where("isActive", "==", true));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
            } as Banner;
        });
    } catch (error) {
        console.error("Error fetching banners:", error);
        return [];
    }
}

export async function getBanner(id: string): Promise<Banner | null> {
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
            } as Banner;
        }
        return null;
    } catch (error) {
        console.error("Error fetching banner:", error);
        return null;
    }
}

export async function createBanner(banner: Omit<Banner, "id" | "createdAt" | "updatedAt">, imageFile?: File): Promise<string> {
    try {
        let imageUrl = banner.imageUrl;

        if (imageFile) {
            const storageRef = ref(storage, `banners/${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...banner,
            imageUrl,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return docRef.id;
    } catch (error) {
        console.error("Error creating banner:", error);
        throw error;
    }
}

export async function updateBanner(id: string, updates: Partial<Omit<Banner, "id" | "createdAt" | "updatedAt">>, imageFile?: File): Promise<void> {
    try {
        let imageUrl = updates.imageUrl;

        if (imageFile) {
            const storageRef = ref(storage, `banners/${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        const updateData: any = {
            ...updates,
            updatedAt: serverTimestamp(),
        };

        if (imageUrl) {
            updateData.imageUrl = imageUrl;
        }

        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error("Error updating banner:", error);
        throw error;
    }
}

export async function deleteBanner(id: string, imageUrl?: string): Promise<void> {
    try {
        // Delete image from storage if exists
        if (imageUrl) {
            try {
                // Extract path from URL or use stored path if available
                // Simplest way often is to store storage path, but here we try to delete simply
                const imageRef = ref(storage, imageUrl);
                await deleteObject(imageRef);
            } catch (e) {
                console.warn("Error deleting banner image:", e);
            }
        }

        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting banner:", error);
        throw error;
    }
}
