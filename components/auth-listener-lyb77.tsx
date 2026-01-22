"use client";

import { useEffect } from "react";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "@/lib/firebase"; // Assuming firebase is initialized in lib/firebase
// import { useAuthStore } from "@/lib/store/auth-store"; // Assuming zustand store

export function AuthListener() {
    // const setUser = useAuthStore((state) => state.setUser);

    useEffect(() => {
        // Placeholder for auth state listener
        console.log("Auth listener initialized");

        // const unsubscribe = onAuthStateChanged(auth, (user) => {
        //   if (user) {
        //     // User is signed in
        //     console.log("User is signed in", user.uid);
        //   } else {
        //     // User is signed out
        //     console.log("User is signed out");
        //   }
        // });

        // return () => unsubscribe();
    }, []);

    return null;
}
