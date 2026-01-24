import "server-only";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const serviceAccount = require("../service-account.json");

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin initialized successfully with service-account.json");
    } catch (error) {
        console.error("Firebase admin initialization error", error);
    }
}

export const adminAuth = admin.auth();
