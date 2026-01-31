"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getBanners, Banner } from "@/lib/db/banners";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";

export function BannerCarousel() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const data = await getBanners(true); // Fetch active banners
                setBanners(data);
            } catch (error) {
                console.error("Failed to fetch banners:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    // Auto-advance logic
    useEffect(() => {
        if (loading || banners.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000); // Wait 5 seconds

        return () => clearInterval(interval);
    }, [banners.length, loading]);

    if (loading || banners.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full overflow-hidden bg-transparent py-2">

            {/* Gradient masks */}
            <div className="absolute left-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-r from-white/90 to-transparent z-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-l from-white/90 to-transparent z-20 pointer-events-none" />

            <div className="flex justify-center items-center">
                <div className="relative w-full max-w-[1200px] flex items-center justify-center overflow-hidden py-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="absolute"
                        >
                            <Link
                                href={banners[currentIndex].linkUrl}
                                target="_blank"
                                className="block relative group"
                            >
                                <div className="relative w-[340px] h-[113px] md:w-[720px] md:h-[240px] rounded-2xl overflow-hidden shadow-lg border border-red-50 bg-white hover:shadow-xl hover:border-red-200 transition-all duration-300">
                                    <Image
                                        src={banners[currentIndex].imageUrl}
                                        alt={banners[currentIndex].title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 340px, 720px"
                                        priority
                                    />
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                </div>
                            </Link>
                        </motion.div>
                    </AnimatePresence>
                    {/* Placeholder to maintain height for absolute positioned elements */}
                    <div className="w-[340px] h-[113px] md:w-[720px] md:h-[240px] invisible" />
                </div>
            </div>

            {/* Indicators */}
            <div className="flex justify-center gap-2 mt-2">
                {banners.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-red-500 w-6" : "bg-gray-300 hover:bg-gray-400"
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
