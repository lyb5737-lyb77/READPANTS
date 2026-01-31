
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

export type VehicleType = 'sedan' | 'suv' | 'van' | 'minibus' | 'bus';

export const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
    { value: 'sedan', label: '승용차 (Sedan)' },
    { value: 'suv', label: 'SUV' },
    { value: 'van', label: '밴 (Van)' },
    { value: 'minibus', label: '21인승 버스' },
    { value: 'bus', label: '대형 버스' },
];

export interface Quote {
    id: string;
    userId: string;
    authorName: string;

    country: string;
    region: string;

    golfCourses: string[]; // List of course names or IDs
    accommodation: string;
    vehicleType: VehicleType;

    content: string; // Detailed itinerary

    status: 'pending' | 'replied' | 'completed';

    adminComment?: {
        content: string;
        price?: number; // Estimated price
        repliedAt: string;
    };

    createdAt: string;
    updatedAt: string;
}

const COLLECTION_NAME = "quotes";

export async function getQuotes(userId?: string, isAdmin: boolean = false): Promise<Quote[]> {
    try {
        let q: Query<DocumentData> = collection(db, COLLECTION_NAME);

        // If not admin, maybe filter? 
        // User requirements: List is visible to everyone (Titles), but content controlled.
        // So we might fetch all and mask data in frontend, OR fetch all.
        // Let's fetch all sorted by date.

        q = query(q, orderBy("createdAt", "desc"));

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
                // If we need to mask sensitive data here for public, we could, but better to do it in UI logic check
            } as Quote;
        });
    } catch (error) {
        console.error("Error fetching quotes:", error);
        return [];
    }
}

export async function getQuote(id: string): Promise<Quote | null> {
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
            } as Quote;
        }
        return null;
    } catch (error) {
        console.error("Error fetching quote:", error);
        return null;
    }
}

export async function createQuote(quote: Omit<Quote, "id" | "createdAt" | "updatedAt" | "status">): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...quote,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return docRef.id;
    } catch (error) {
        console.error("Error creating quote:", error);
        throw error;
    }
}

export async function replyQuote(id: string, comment: string, price?: number): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            status: 'replied',
            adminComment: {
                content: comment,
                price: price,
                repliedAt: new Date().toISOString() // Or serverTimestamp if we handle type conversion
            },
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error replying to quote:", error);
        throw error;
    }
}
