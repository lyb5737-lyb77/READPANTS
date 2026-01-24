"use server";

import { adminAuth } from "@/lib/firebase-admin";

export async function updateUserPassword(uid: string, newPassword: string) {
    try {
        await adminAuth.updateUser(uid, {
            password: newPassword,
        });
        return { success: true };
    } catch (error: any) {
        console.error("Error updating password:", error);
        return { success: false, error: error.message };
    }
}
