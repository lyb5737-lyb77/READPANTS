
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

    // Dates
    startDate: string | Date; // Timestamp or ISO string
    endDate: string | Date;
    nights: number;
    days: number;

    // Transport & Pax
    arrivalAirport: string; // 하노이 / 하이퐁
    pickupService: 'none' | 'pickup' | 'sending' | 'roundtrip'; // 필요없음 / 픽업 / 샌딩 / 왕복(혹시 몰라 추가) -> UI에서 선택 
    numberOfMen: number;
    numberOfWomen: number;
    totalPeople: number;

    // Accommodation
    // Accommodation
    accommodationType: string; // 'direct' or accommodation.id (e.g. 'sunflower')
    roomType?: string; // Room type name if applicable

    // Golf
    golfRounds: number; // 0 ~ N 회

    // Payment
    paymentMethod: 'onsite' | 'online'; // 체크인시 결제 / 온라인 전액 결제

    // Content (User extra request)
    content: string;

    status: 'pending' | 'replied' | 'payment_pending' | 'completed'; // 결제대기 상태 추가

    adminComment?: {
        content: string;
        price?: number;
        repliedAt: string;
    };

    totalAmount?: number; // 최종 견적 금액

    userPhone: string; // 연락처

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

        const updateData: any = {
            status: 'replied',
            adminComment: {
                content: comment,
                price: price,
                repliedAt: new Date().toISOString()
            },
            updatedAt: serverTimestamp()
        };

        if (price !== undefined) {
            updateData.totalAmount = price;
            // If price is set, maybe we can move to payment? But usually user needs to confirm.
            // For now, let's keep it 'replied' or maybe 'payment_pending' if admin sets the final price.
            // Let's stick to 'replied' and let the user see the price and then proceed to payment action if we implement that flow.
            // However, user request says: "답변완료가되면 총금액을 결제할수있는 버튼이 나타남".
        }

        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error("Error replying to quote:", error);
        throw error;
    }
}

export async function updateQuoteStatus(id: string, status: Quote['status']): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            status: status,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating quote status:", error);
        throw error;
    }
}
