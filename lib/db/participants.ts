import { db } from "@/lib/firebase";
import { collection, doc, getDoc, setDoc, updateDoc, increment, deleteDoc } from "firebase/firestore";

const PARTICIPANTS_COLLECTION = "joinParticipants";

export interface JoinParticipant {
    joinId: string;
    userId: string;
    userName: string;
    userEmail: string;
    appliedAt: string;
    status: "pending" | "approved" | "rejected";
}

/**
 * Add a participant to a join
 */
export async function addParticipant(participant: JoinParticipant): Promise<void> {
    const participantId = `${participant.joinId}_${participant.userId}`;
    await setDoc(doc(db, PARTICIPANTS_COLLECTION, participantId), participant);
}

/**
 * Check if user has already applied to a join
 */
export async function hasUserApplied(joinId: string, userId: string): Promise<boolean> {
    const participantId = `${joinId}_${userId}`;
    const docRef = doc(db, PARTICIPANTS_COLLECTION, participantId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
}

/**
 * Remove a participant from a join
 */
export async function removeParticipant(joinId: string, userId: string): Promise<void> {
    const participantId = `${joinId}_${userId}`;
    await deleteDoc(doc(db, PARTICIPANTS_COLLECTION, participantId));
}

/**
 * Update join's current member count
 */
export async function incrementJoinMembers(joinId: string): Promise<void> {
    const joinRef = doc(db, "joins", joinId);
    await updateDoc(joinRef, {
        currentMembers: increment(1)
    });
}

/**
 * Decrease join's current member count
 */
export async function decrementJoinMembers(joinId: string): Promise<void> {
    const joinRef = doc(db, "joins", joinId);
    await updateDoc(joinRef, {
        currentMembers: increment(-1)
    });
}
