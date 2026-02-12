
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
    where,
    serverTimestamp,
    DocumentData,
    Query
} from "firebase/firestore";

export interface HotelRoom {
    id: string;
    hotelName: string; // e.g. "Sunflower Hotel"
    name: string; // e.g. "Standard King", "Deluxe Twin"
    description: string;
    price: number; // Base price per night
    currency: string; // e.g. "USD", "KRW", "VND"
    capacity: number;
    images?: string[];

    createdAt: string;
    updatedAt: string;
}

const COLLECTION_NAME = "hotel_rooms";

export async function getHotelRooms(hotelName: string = "Sunflower Hotel"): Promise<HotelRoom[]> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("hotelName", "==", hotelName),
            orderBy("price", "asc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
            } as HotelRoom;
        });
    } catch (error) {
        console.error("Error fetching hotel rooms:", error);
        return [];
    }
}

export async function getHotelRoom(id: string): Promise<HotelRoom | null> {
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
            } as HotelRoom;
        }
        return null;
    } catch (error) {
        console.error("Error fetching hotel room:", error);
        return null;
    }
}

export async function createHotelRoom(room: Omit<HotelRoom, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...room,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return docRef.id;
    } catch (error) {
        console.error("Error creating hotel room:", error);
        throw error;
    }
}

export async function updateHotelRoom(id: string, room: Partial<Omit<HotelRoom, "id" | "createdAt" | "updatedAt">>): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...room,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating hotel room:", error);
        throw error;
    }
}

export async function deleteHotelRoom(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
        console.error("Error deleting hotel room:", error);
        throw error;
    }
}
