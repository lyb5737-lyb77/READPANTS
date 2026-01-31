
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

        const email = "test_dev@redpants.com";
        const password = "111111"; // Same password

        console.log(`Checking if test user exists: ${email}`);
        try {
            const user = await admin.auth().getUserByEmail(email);
            console.log(`User exists (${user.uid}). resetting password...`);
            await admin.auth().updateUser(user.uid, { password: password });
        } catch (e) {
            if (e.code === 'auth/user-not-found') {
                console.log("Creating new test user...");
                await admin.auth().createUser({
                    email: email,
                    password: password,
                    displayName: "테스트유저",
                    emailVerified: true
                });
            } else {
                throw e;
            }
        }

        console.log(`Test user ready.`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error("Error creating test user:", error);
        process.exit(1);
    }
}

main();
