"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useUIStore } from "@/lib/store/ui-store";

export function SplashScreen() {
    const { showSplash, setShowSplash } = useUIStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Only show splash on mobile/initial load? 
        // For now, show on every load but we can optimize later.
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2000); // 2 seconds splash

        return () => clearTimeout(timer);
    }, [setShowSplash]);

    if (!isMounted) return null;

    return (
        <AnimatePresence>
            {showSplash && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
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
