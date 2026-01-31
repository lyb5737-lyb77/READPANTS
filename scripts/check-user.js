
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

        const email = "lyb77@bit.kr";
        console.log(`Looking up user by email: ${email}`);
        const user = await admin.auth().getUserByEmail(email);
        console.log(`User Found: ${user.uid}`);
        console.log("Providers:", JSON.stringify(user.providerData, null, 2));
        console.log("Disabled:", user.disabled);
        console.log("Email Verified:", user.emailVerified);

        process.exit(0);
    } catch (error) {
        console.error("Error fetching user:", error);
        process.exit(1);
    }
}

main();
