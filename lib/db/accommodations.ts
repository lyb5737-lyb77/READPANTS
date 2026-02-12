import { db, storage } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, Timestamp, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Accommodation, RoomType } from "@/types/accommodation";

const COLLECTION_NAME = "accommodations";

export async function getAccommodations(): Promise<Accommodation[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const accommodations: Accommodation[] = [];
    querySnapshot.forEach((doc) => {
        accommodations.push({ id: doc.id, ...doc.data() } as Accommodation);
    });
    return accommodations;
}

export async function getAccommodation(id: string): Promise<Accommodation | null> {
    if (!id) return null;
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Accommodation;
    } else {
        return null;
    }
}

export async function createAccommodation(data: Omit<Accommodation, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        createdAt: now,
        updatedAt: now,
    });
    return docRef.id;
}

export async function updateAccommodation(id: string, data: Partial<Omit<Accommodation, "id" | "createdAt" | "updatedAt">>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
    });
}

export async function deleteAccommodation(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
}

// Helper to upload images
export async function uploadAccommodationImage(file: File): Promise<string> {
    const storageRef = ref(storage, `accommodations/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}
