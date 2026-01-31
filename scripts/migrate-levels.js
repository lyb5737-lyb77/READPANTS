
const admin = require("firebase-admin");
const path = require("path");

// CONSTANTS (Mirrored from lib/constants/levels.ts because TS import in JS script is hard without build)
const COMMUNITY_LEVELS = [
    { level: 1, threshold: 0 },
    { level: 2, threshold: 100 },
    { level: 3, threshold: 300 },
    { level: 4, threshold: 600 },
    { level: 5, threshold: 1000 },
    { level: 6, threshold: 2000 },
    { level: 7, threshold: 4000 },
    { level: 8, threshold: 7000 },
    { level: 9, threshold: 10000 },
    { level: 10, threshold: 20000 },
];

const GOLF_SKILL_LEVELS = [
    { level: 1, threshold: 121 },
    { level: 2, threshold: 111 },
    { level: 3, threshold: 101 },
    { level: 4, threshold: 91 },
    { level: 5, threshold: 86 },
    { level: 6, threshold: 81 },
    { level: 7, threshold: 76 },
    { level: 8, threshold: 73 },
    { level: 9, threshold: 71 },
    { level: 10, threshold: 0 },
];

function calculateCommunityLevel(points = 0) {
    for (let i = COMMUNITY_LEVELS.length - 1; i >= 0; i--) {
        if (points >= COMMUNITY_LEVELS[i].threshold) {
            return COMMUNITY_LEVELS[i].level;
        }
    }
    return 1;
}

function calculateGolfSkillLevel(avgScore) {
    if (!avgScore || avgScore <= 0) return 1;
    if (avgScore <= 70) return 10;

    // Updated Logic: Iterate from worst (121) to best (71)
    for (let i = 0; i < GOLF_SKILL_LEVELS.length - 1; i++) {
        if (GOLF_SKILL_LEVELS[i].threshold > 0 && avgScore >= GOLF_SKILL_LEVELS[i].threshold) {
            return GOLF_SKILL_LEVELS[i].level;
        }
    }
    return 10; // Should be covered
}

async function main() {
    try {
        const serviceAccountPath = path.join(__dirname, "../service-account.json");
        const serviceAccount = require(serviceAccountPath);

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }

        const db = admin.firestore();
        const usersSnapshot = await db.collection("users").get();

        console.log(`Found ${usersSnapshot.size} users. Starting migration...`);

        let updatedCount = 0;
        const batchSize = 100; // Do updates in chunks? Or one by one for simplicity. One by one is fine for small scale.

        let batch = db.batch();
        let ops = 0;

        for (const doc of usersSnapshot.docs) {
            const data = doc.data();
            const points = data.activityPoints || 0;
            const score = data.avgScore || 0;

            const newCommLevel = calculateCommunityLevel(points);
            const newGolfLevel = calculateGolfSkillLevel(score);

            const updates = {};
            if (data.communityLevel !== newCommLevel) {
                updates.communityLevel = newCommLevel;
            }
            if (data.golfSkillLevel !== newGolfLevel) {
                updates.golfSkillLevel = newGolfLevel;
            }

            // Ensure defaults if missing
            if (data.activityPoints === undefined) updates.activityPoints = 0;
            // avgScore is tricky, if missing keep missing/0? defaulting to 0 is fine if logical.

            if (Object.keys(updates).length > 0) {
                console.log(`Updating ${data.email} (${data.nickname}): Comm ${data.communityLevel}->${newCommLevel}, Golf ${data.golfSkillLevel}->${newGolfLevel} (Score: ${score})`);
                batch.update(doc.ref, updates);
                ops++;
                updatedCount++;
            }

            if (ops >= 400) {
                await batch.commit();
                batch = db.batch();
                ops = 0;
            }
        }

        if (ops > 0) {
            await batch.commit();
        }

        console.log(`Migration complete. Updated ${updatedCount} users.`);
        process.exit(0);

    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

main();
