import { db } from "@/lib/firebase";
import { collection, doc, getDoc, setDoc, updateDoc, increment, deleteDoc, query, orderBy, limit, getDocs, where } from "firebase/firestore";

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

/**
 * Get recent participants (join requests)
 */
export async function getRecentParticipants(limitCount: number = 5): Promise<JoinParticipant[]> {
    const q = query(
        collection(db, PARTICIPANTS_COLLECTION),
        orderBy("appliedAt", "desc"),
        limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const participants: JoinParticipant[] = [];
    querySnapshot.forEach((doc) => {
        participants.push(doc.data() as JoinParticipant);
    });
    return participants;
}

/**
 * Get all participants for a join
 */
export async function getJoinParticipants(joinId: string): Promise<JoinParticipant[]> {
    const q = query(
        collection(db, PARTICIPANTS_COLLECTION),
        where("joinId", "==", joinId),
        where("joinId", "==", joinId)
        // orderBy("appliedAt", "desc") // Requires index, temporarily disabled
    );

    const querySnapshot = await getDocs(q);
    const participants: JoinParticipant[] = [];
    querySnapshot.forEach((doc) => {
        participants.push(doc.data() as JoinParticipant);
    });

    // Sort in memory (client-side) to avoid composite index requirement
    return participants.sort((a, b) =>
        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
    );
}

/**
 * Update participant status
 */
export async function updateParticipantStatus(joinId: string, userId: string, status: 'approved' | 'rejected'): Promise<void> {
    const participantId = `${joinId}_${userId}`;
    const participantRef = doc(db, PARTICIPANTS_COLLECTION, participantId);

    // Get current status to handle member count updates correctly
    const snap = await getDoc(participantRef);
    if (!snap.exists()) return;

    const currentStatus = snap.data().status;

    // Update status
    await updateDoc(participantRef, { status });

    // Handle member count updates
    if (status === 'approved' && currentStatus !== 'approved') {
        await incrementJoinMembers(joinId);
    } else if (status === 'rejected' && currentStatus === 'approved') {
        await decrementJoinMembers(joinId);
    }
}
