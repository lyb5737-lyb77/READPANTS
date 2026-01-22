
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    runTransaction,
    serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

export interface RankLevel {
    level: number;
    name: string;
    threshold: number;
}

export interface PointRules {
    post: number;
    comment: number;
}

export interface RankingSettings {
    rankLevels: RankLevel[];
    pointRules: PointRules;
}

// Default settings
export const DEFAULT_RANK_LEVELS: RankLevel[] = [
    { level: 1, name: "새싹", threshold: 0 },
    { level: 2, name: "잔디", threshold: 50 },
    { level: 3, name: "나무", threshold: 150 },
    { level: 4, name: "숲", threshold: 300 },
    { level: 5, name: "동산", threshold: 500 },
    { level: 6, name: "태산", threshold: 1000 },
    { level: 7, name: "구름", threshold: 2000 },
    { level: 8, name: "하늘", threshold: 4000 },
    { level: 9, name: "우주", threshold: 7000 },
    { level: 10, name: "신", threshold: 10000 },
];

export const DEFAULT_POINT_RULES: PointRules = {
    post: 10,
    comment: 2,
};

const SETTINGS_DOC_PATH = "settings/community";

// Get ranking settings (or defaults if not set)
export const getRankingSettings = async (): Promise<RankingSettings> => {
    try {
        const docRef = doc(db, SETTINGS_DOC_PATH);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as RankingSettings;
            // Merge with defaults to ensure structure
            return {
                rankLevels: data.rankLevels || DEFAULT_RANK_LEVELS,
                pointRules: data.pointRules || DEFAULT_POINT_RULES
            };
        } else {
            return {
                rankLevels: DEFAULT_RANK_LEVELS,
                pointRules: DEFAULT_POINT_RULES
            };
        }
    } catch (error) {
        console.error("Error fetching ranking settings:", error);
        return {
            rankLevels: DEFAULT_RANK_LEVELS,
            pointRules: DEFAULT_POINT_RULES
        };
    }
};

// Update ranking settings
export const updateRankingSettings = async (settings: RankingSettings) => {
    try {
        const docRef = doc(db, SETTINGS_DOC_PATH);
        await setDoc(docRef, settings, { merge: true });
    } catch (error) {
        console.error("Error updating ranking settings:", error);
        throw error;
    }
};

// Initialize user ranking data (helper for sign up)
export const formatUserRankingData = () => {
    return {
        communityScore: 0,
        communityRank: DEFAULT_RANK_LEVELS[0].name
    };
};

// Add points to user and check for rank upgrade
export const addPoints = async (userId: string, actionType: 'post' | 'comment') => {
    try {
        await runTransaction(db, async (transaction) => {
            // 1. Get Settings
            const settingsDoc = await transaction.get(doc(db, SETTINGS_DOC_PATH));
            let settings: RankingSettings = {
                rankLevels: DEFAULT_RANK_LEVELS,
                pointRules: DEFAULT_POINT_RULES
            };
            if (settingsDoc.exists()) {
                const data = settingsDoc.data() as Partial<RankingSettings>;
                if (data.rankLevels) settings.rankLevels = data.rankLevels;
                if (data.pointRules) settings.pointRules = data.pointRules;
            }

            // 2. Get User
            const userRef = doc(db, "users", userId);
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) throw "User does not exist!";

            const userData = userDoc.data();
            const currentScore = userData.communityScore || 0;
            const pointsToAdd = actionType === 'post' ? settings.pointRules.post : settings.pointRules.comment;
            const newScore = currentScore + pointsToAdd;

            // 3. Determine New Rank
            // Sort levels by threshold descending to find the highest matching level
            const sortedLevels = [...settings.rankLevels].sort((a, b) => b.threshold - a.threshold);
            const newRankLevel = sortedLevels.find(l => newScore >= l.threshold) || settings.rankLevels[0];
            const newRank = newRankLevel.name;

            // 4. Update User
            transaction.update(userRef, {
                communityScore: newScore,
                communityRank: newRank,
                // Optional: Store history or notification trigger here
            });

            console.log(`Added ${pointsToAdd} points to user ${userId}. New Score: ${newScore}, Rank: ${newRank}`);
        });
    } catch (error) {
        console.error("Error adding community points:", error);
        // Don't throw error to prevent blocking the main action (post/comment creation)
    }
};
