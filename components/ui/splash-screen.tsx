"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useUIStore } from "@/lib/store/ui-store";

export function SplashScreen() {
    const { showSplash, setShowSplash } = useUIStore();
    const [isMounted, setIsMounted] = useState(false);
    const [forceHide, setForceHide] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Hide splash after 2 seconds
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2000);

        // Force hide after 3 seconds as a failsafe
        const failsafeTimer = setTimeout(() => {
            setForceHide(true);
        }, 3000);

        return () => {
            clearTimeout(timer);
            clearTimeout(failsafeTimer);
        };
    }, [setShowSplash]);

    // Don't render on server or if forcefully hidden
    if (!isMounted || forceHide) return null;

    return (
        <AnimatePresence>
            {showSplash && !forceHide && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    // Allow clicks to pass through during fade out
                    style={{ pointerEvents: showSplash ? 'auto' : 'none' }}
                >
                    <motion.img
                        layoutId="main-logo"
                        src="/images/logo-v2.png"
                        alt="Red Pants Logo"
                        className="relative w-48 h-48 object-contain"
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

