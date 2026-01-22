
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    orderBy,
    Timestamp,
    deleteDoc,
    updateDoc,
    serverTimestamp,
    where,
    limit,
    startAfter,
    DocumentSnapshot
} from "firebase/firestore";
import { db } from "./firebase";

export interface Post {
    id: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string; // Display name
    authorEmail: string;
    createdAt: Date;
    updatedAt: Date;
    commentCount: number;
}

export interface Comment {
    id: string;
    postId: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: Date;
}

const POSTS_COLLECTION = "posts";

// --- Posts ---

export const createPost = async (title: string, content: string, user: { uid: string, displayName?: string | null, email?: string | null }) => {
    try {
        const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
            title,
            content,
            authorId: user.uid,
            authorName: user.displayName || user.email?.split('@')[0] || "Anonymous",
            authorEmail: user.email || "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            commentCount: 0
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating post:", error);
        throw error;
    }
};

export const getPosts = async (lastDoc?: DocumentSnapshot, pageSize: number = 20) => {
    try {
        let q = query(
            collection(db, POSTS_COLLECTION),
            orderBy("createdAt", "desc"),
            limit(pageSize)
        );

        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        const querySnapshot = await getDocs(q);
        const posts: Post[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            posts.push({
                id: doc.id,
                title: data.title,
                content: data.content,
                authorId: data.authorId,
                authorName: data.authorName,
                authorEmail: data.authorEmail,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                commentCount: data.commentCount || 0,
            });
        });

        return {
            posts,
            lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1]
        };
    } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
    }
};

export const getPost = async (id: string): Promise<Post | null> => {
    try {
        const docRef = doc(db, POSTS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                title: data.title,
                content: data.content,
                authorId: data.authorId,
                authorName: data.authorName,
                authorEmail: data.authorEmail,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                commentCount: data.commentCount || 0,
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching post:", error);
        throw error;
    }
};

export const deletePost = async (id: string) => {
    try {
        await deleteDoc(doc(db, POSTS_COLLECTION, id));
    } catch (error) {
        console.error("Error deleting post:", error);
        throw error;
    }
};

// --- Comments ---

export const getComments = async (postId: string) => {
    try {
        const q = query(
            collection(db, POSTS_COLLECTION, postId, "comments"),
            orderBy("createdAt", "asc")
        );
        const querySnapshot = await getDocs(q);
        const comments: Comment[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            comments.push({
                id: doc.id,
                postId,
                content: data.content,
                authorId: data.authorId,
                authorName: data.authorName,
                createdAt: data.createdAt?.toDate() || new Date(),
            });
        });
        return comments;
    } catch (error) {
        console.error("Error fetching comments:", error);
        throw error;
    }
};

export const addComment = async (postId: string, content: string, user: { uid: string, displayName?: string | null, email?: string | null }) => {
    try {
        // Add comment
        await addDoc(collection(db, POSTS_COLLECTION, postId, "comments"), {
            content,
            authorId: user.uid,
            authorName: user.displayName || user.email?.split('@')[0] || "Anonymous",
            createdAt: serverTimestamp()
        });

        // Update comment count on post
        const postRef = doc(db, POSTS_COLLECTION, postId);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
            const currentCount = postSnap.data().commentCount || 0;
            await updateDoc(postRef, {
                commentCount: currentCount + 1
            });
        }
    } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
    }
};
