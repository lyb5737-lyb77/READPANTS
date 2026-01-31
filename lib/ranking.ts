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
import { COMMUNITY_LEVELS } from "./constants/levels";

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

// Default settings adapted from COMMUNITY_LEVELS
export const DEFAULT_RANK_LEVELS: RankLevel[] = COMMUNITY_LEVELS.map(l => ({
    level: l.level,
    name: l.name.ko,
    threshold: l.threshold
}));

export const DEFAULT_POINT_RULES: PointRules = {
    post: 10,
    comment: 2,
};

// Initialize User Ranking Data
export const formatUserRankingData = () => {
    return {
        activityPoints: 0,
        communityLevel: 1,
    };
};

const SETTINGS_DOC_PATH = "settings/community";

// Get ranking settings
export const getRankingSettings = async (): Promise<RankingSettings> => {
    try {
        const docRef = doc(db, SETTINGS_DOC_PATH);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as RankingSettings;
            return {
                // If DB has custom levels, use them, otherwise default to Code Constants for structure
                // Ideally, we prefer Code Constants for Levels to ensure consistency with Badges
                rankLevels: DEFAULT_RANK_LEVELS, // Force use of code constants for levels
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

// Add points to user and update level
export const addPoints = async (userId: string, actionType: 'post' | 'comment') => {
    try {
        await runTransaction(db, async (transaction) => {
            // 1. Get Settings (for Point Rules only)
            const settingsDoc = await transaction.get(doc(db, SETTINGS_DOC_PATH));
            let pointRules = DEFAULT_POINT_RULES;

            if (settingsDoc.exists()) {
                const data = settingsDoc.data() as Partial<RankingSettings>;
                if (data.pointRules) pointRules = data.pointRules;
            }

            // 2. Get User
            const userRef = doc(db, "users", userId);
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) throw "User does not exist!";

            const userData = userDoc.data();
            const currentPoints = userData.activityPoints || 0;
            const pointsToAdd = actionType === 'post' ? pointRules.post : pointRules.comment;
            const newPoints = currentPoints + pointsToAdd;

            // 3. Determine New Rank using Code Constants (to match Badges)
            // Use COMMUNITY_LEVELS imported from constants
            // Sort desc (highest threshold first)
            const sortedLevels = [...COMMUNITY_LEVELS].sort((a, b) => b.threshold - a.threshold);
            const newLevelInfo = sortedLevels.find(l => newPoints >= l.threshold) || COMMUNITY_LEVELS[0];

            // 4. Update User
            transaction.update(userRef, {
                activityPoints: newPoints,
                communityLevel: newLevelInfo.level,
                // Legacy support if needed, but we try to move away
                // communityScore: newPoints, 
                // communityRank: newLevelInfo.name.ko 
            });

            console.log(`Added ${pointsToAdd} points to user ${userId}. New Points: ${newPoints}, Level: ${newLevelInfo.level} (${newLevelInfo.name.ko})`);
        });
    } catch (error) {
        console.error("Error adding community points:", error);
    }
};
