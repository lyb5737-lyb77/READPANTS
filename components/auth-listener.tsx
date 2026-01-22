"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store/auth-store";
import { getUser } from "@/lib/db/users";

export function AuthListener() {
    const { setUser, setUserProfile, setLoading } = useAuthStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                try {
                    const profile = await getUser(user.uid);
                    setUserProfile(profile);
                } catch (error) {
                    console.error("Failed to fetch user profile:", error);
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [setUser, setUserProfile, setLoading]);

    return null;
}
