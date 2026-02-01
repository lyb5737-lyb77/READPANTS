"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getBanners, Banner } from "@/lib/db/banners";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause } from "lucide-react";

export function BannerCarousel() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const data = await getBanners(true);
                setBanners(data);
            } catch (error) {
                console.error("Failed to fetch banners:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    // 5초 자동 슬라이드 (마우스 호버 시 정지)
    useEffect(() => {
        if (loading || banners.length <= 1 || isPaused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [banners.length, loading, isPaused]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    if (loading || banners.length === 0) {
        return null;
    }

    const prevIndex = (currentIndex - 1 + banners.length) % banners.length;
    const nextIndex = (currentIndex + 1) % banners.length;

    return (
        <div
            className="relative w-full overflow-hidden bg-gray-50 py-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* 마우스 호버 시 일시정지 표시 */}
            {isPaused && banners.length > 1 && (
                <div className="absolute top-2 right-4 z-30 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    <Pause className="w-3 h-3" />
                    일시정지
                </div>
            )}

            <div className="flex justify-center items-center gap-2 md:gap-6">

                {/* 이전 배너 썸네일 (PC) */}
                {banners.length > 1 && (
                    <button
                        onClick={prevSlide}
                        className="hidden md:flex items-center gap-2 group"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105 border-2 border-gray-200 group-hover:border-red-400 shadow-sm">
                            <Image
                                src={banners[prevIndex].imageUrl}
                                alt={banners[prevIndex].title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </button>
                )}

                {/* 현재 배너 (메인) */}
                <div className="relative w-full max-w-[1200px] flex items-center justify-center overflow-hidden">
                    {/* 모바일 이전 버튼 */}
                    {banners.length > 1 && (
                        <button
                            onClick={prevSlide}
                            className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow-md transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="w-full flex justify-center"
                        >
                            <Link
                                href={banners[currentIndex].linkUrl || "#"}
                                target={banners[currentIndex].linkUrl ? "_blank" : undefined}
                                className="block relative group"
                            >
                                <div className="relative w-[340px] h-[113px] md:w-[900px] md:h-[300px] rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white hover:shadow-xl transition-all duration-300">
                                    <Image
                                        src={banners[currentIndex].imageUrl}
                                        alt={banners[currentIndex].title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 340px, 900px"
                                        priority
                                    />
                                </div>
                            </Link>
                        </motion.div>
                    </AnimatePresence>

                    {/* 모바일 다음 버튼 */}
                    {banners.length > 1 && (
                        <button
                            onClick={nextSlide}
                            className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow-md transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* 다음 배너 썸네일 (PC) */}
                {banners.length > 1 && (
                    <button
                        onClick={nextSlide}
                        className="hidden md:flex items-center gap-2 group"
                    >
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105 border-2 border-gray-200 group-hover:border-red-400 shadow-sm">
                            <Image
                                src={banners[nextIndex].imageUrl}
                                alt={banners[nextIndex].title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                )}
            </div>

            {/* 인디케이터 (점) */}
            {banners.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {banners.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => goToSlide(idx)}
                            className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex
                                ? "w-8 bg-red-500"
                                : "w-2 bg-gray-300 hover:bg-gray-400"
                                }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
