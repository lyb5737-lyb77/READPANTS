
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
    limit,
    startAfter,
    DocumentData,
    Query
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export type ReviewCategory = 'restaurant' | 'accommodation' | 'massage' | 'golf' | 'driving_range' | 'other';

export const REVIEW_CATEGORIES: { value: ReviewCategory; label: string }[] = [
    { value: 'restaurant', label: '맛집' },
    { value: 'accommodation', label: '숙소' },
    { value: 'massage', label: '마사지' },
    { value: 'golf', label: '골프장' },
    { value: 'driving_range', label: '연습장' },
    { value: 'other', label: '기타' },
];

export interface Review {
    id: string;
    country: string;
    region: string;
    category: ReviewCategory;
    businessName: string;
    rating: number; // 1-5
    content: string;
    images: string[];
    isMyMoney: boolean; // 내돈내산

    author: {
        uid: string;
        name: string;
        photoURL?: string;
    };

    likeCount: number;
    likes: string[]; // User UIDs

    createdAt: string;
    updatedAt: string;
}

const COLLECTION_NAME = "reviews";

export interface GetReviewsOptions {
    country?: string;
    region?: string;
    category?: ReviewCategory;
    sortBy?: 'latest' | 'rating' | 'likes';
    searchQuery?: string;
}

export async function getReviews(options: GetReviewsOptions = {}): Promise<Review[]> {
    try {
        let q: Query<DocumentData> = collection(db, COLLECTION_NAME);

        // Basic Filters
        if (options.country) {
            q = query(q, where("country", "==", options.country));
        }
        if (options.region) {
            q = query(q, where("region", "==", options.region));
        }
        if (options.category) {
            q = query(q, where("category", "==", options.category));
        }

        // Search (Client-side filtering for simplicity for now, or simple name check if needed)
        // Firestore doesn't support full-text search natively without extensions like Algolia.
        // We will fetch and filter in client or use a basic startAt for exact matches if feasible.
        // For this implementation, we'll fetch then filter/sort client side for 'searchQuery' 
        // OR rely on exact match if we index businessName. 
        // Given "Search by business name", let's assume client-side filtering 
        // on a reasonable subset or simple exact/prefix match if possible.
        // For now, let's just apply sorting.

        // Sorting
        // Note: Firestore requires composite indexes for multiple where + orderBy fields.
        if (options.sortBy === 'rating') {
            q = query(q, orderBy("rating", "desc"));
        } else if (options.sortBy === 'likes') {
            q = query(q, orderBy("likeCount", "desc"));
        } else {
            q = query(q, orderBy("createdAt", "desc")); // Default latest
        }

        const snapshot = await getDocs(q);
        let reviews = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
            } as Review;
        });

        // Client-side filtering for search query (Business Name)
        if (options.searchQuery) {
            const term = options.searchQuery.toLowerCase();
            reviews = reviews.filter(r => r.businessName.toLowerCase().includes(term));
        }

        return reviews;
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }
}

export async function createReview(review: Omit<Review, "id" | "createdAt" | "updatedAt" | "likes" | "likeCount">, imageFiles: File[]): Promise<string> {
    try {
        const imageUrls: string[] = [];

        // Upload images
        for (const file of imageFiles) {
            const storageRef = ref(storage, `reviews/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);
            imageUrls.push(url);
        }

        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...review,
            images: imageUrls,
            likes: [],
            likeCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return docRef.id;
    } catch (error) {
        console.error("Error creating review:", error);
        throw error;
    }
}

export async function toggleLikeReview(reviewId: string, userId: string): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, reviewId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return;

        const data = docSnap.data();
        const likes = (data.likes as string[]) || [];

        let newLikes: string[];
        if (likes.includes(userId)) {
            newLikes = likes.filter(id => id !== userId);
        } else {
            newLikes = [...likes, userId];
        }

        await updateDoc(docRef, {
            likes: newLikes,
            likeCount: newLikes.length
        });
    } catch (error) {
        console.error("Error toggling like:", error);
        throw error;
    }
}
