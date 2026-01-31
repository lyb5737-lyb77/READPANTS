
import * as admin from "firebase-admin";

async function main() {
    try {
        console.log("Initializing Admin SDK...");
        // Path relative to where script is executed (from web root usually)
        // If we run `npx ts-node scripts/reset-password.ts` from `web/` folder
        const serviceAccount = require("../service-account.json");

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }

        const email = "lyb77@bit.kr";
        const newPassword = "111111";

        console.log(`Looking up user by email: ${email}`);
        const user = await admin.auth().getUserByEmail(email);
        console.log(`Found user: ${user.uid} (${user.email})`);

        console.log(`Updating password...`);
        await admin.auth().updateUser(user.uid, {
            password: newPassword
        });

        console.log(`Successfully updated password for ${email} to ${newPassword}`);
        process.exit(0);
    } catch (error) {
        console.error("Error updating password:", error);
        process.exit(1);
    }
}

main();
