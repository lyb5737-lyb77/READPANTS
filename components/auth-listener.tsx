"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store/auth-store";
import { getUser, createUser } from "@/lib/db/users";
import { calculateCommunityLevel, calculateGolfSkillLevel } from "@/lib/constants/levels";

export function AuthListener() {
    const { setUser, setUserProfile, setLoading } = useAuthStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                try {
                    let profile = await getUser(user.uid);

                    // If profile doesn't exist (e.g. first Google Login), create it
                    if (!profile) {
                        const newProfile = {
                            email: user.email || "",
                            nickname: user.displayName || user.email?.split('@')[0] || "User",
                            // Legacy
                            level: '브론즈',
                            role: 'user' as const,

                            // New Level System
                            activityPoints: 0,
                            communityLevel: 1, // Stone
                            avgScore: 0,
                            golfSkillLevel: 1, // Seed (default since 0Avg)

                            phone: "", // 필수지만 구글 로그인 직후엔 없음 -> ProfileGuard에서 처리
                            marketingConsents: { sms: false, email: false, kakao: false },
                            createdAt: new Date().toISOString(),
                            // phone: user.phoneNumber // Try to get phone if available (usually null for Google)
                        };
                        await createUser(user.uid, newProfile);
                        profile = { uid: user.uid, ...newProfile };
                        console.log("Created new user profile for Google login");
                    }

                    setUserProfile(profile);
                } catch (error) {
                    console.error("Failed to fetch or create user profile:", error);
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
