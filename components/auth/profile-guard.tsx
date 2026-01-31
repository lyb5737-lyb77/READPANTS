"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

export function ProfileGuard() {
    const { user, userProfile, loading } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Skip check if loading, not logged in, or already on completion page (or logout/login/signup)
        if (loading || !user) return;

        const publicPaths = ['/login', '/signup', '/signup/complete', '/forgot-password'];
        if (publicPaths.some(path => pathname?.startsWith(path))) return;

        // Check if phone number is missing
        if (userProfile && (!userProfile.phone || !userProfile.avgScore)) {
            router.replace("/signup/complete");
        }
    }, [user, userProfile, loading, pathname, router]);

    return null;
}
