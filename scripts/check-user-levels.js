
const admin = require("firebase-admin");
const path = require("path");

async function main() {
    try {
        const serviceAccountPath = path.join(__dirname, "../service-account.json");
        const serviceAccount = require(serviceAccountPath);

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }

        const emails = ["lyb77@bit.kr", "icicu@daum.net", "test_dev@redpants.com"];
        const db = admin.firestore();

        for (const email of emails) {
            try {
                const userRecord = await admin.auth().getUserByEmail(email);
                const userDoc = await db.collection("users").doc(userRecord.uid).get();

                console.log(`\nEmail: ${email} (UID: ${userRecord.uid})`);
                if (userDoc.exists) {
                    const data = userDoc.data();
                    console.log(`DB Data:`);
                    console.log(` - role: ${data.role} (${typeof data.role})`);
                    console.log(` - communityLevel: ${data.communityLevel} (${typeof data.communityLevel})`);
                    console.log(` - activityPoints: ${data.activityPoints}`);
                } else {
                    console.log("No User Doc found in Firestore!");
                }
            } catch (e) {
                console.log(`User ${email} not found in Auth or Error: ${e.message}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
