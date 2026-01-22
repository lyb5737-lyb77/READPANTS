import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, limit } from "firebase/firestore";

const COLLECTION_NAME = "reviews";

export interface Review {
    id: string;
    userId: string;
    userName: string;
    userLevel: string;
    courseId: string;
    courseName: string;
    rating: number;
    content: string;
    likes: number;
    createdAt: string;
}

export async function getReviews(limitCount?: number): Promise<Review[]> {
    const reviewsRef = collection(db, COLLECTION_NAME);
    let q = query(reviewsRef, orderBy("createdAt", "desc"));

    if (limitCount) {
        q = query(q, limit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];
    querySnapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() } as Review);
    });
    return reviews;
}

export async function getReview(id: string): Promise<Review | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Review;
    } else {
        return null;
    }
}

export async function createReview(data: Omit<Review, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
    return docRef.id;
}

export async function updateReview(id: string, data: Partial<Review>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
}

export async function deleteReview(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
}

export async function likeReview(id: string): Promise<void> {
    const review = await getReview(id);
    if (review) {
        await updateReview(id, { likes: review.likes + 1 });
    }
}
