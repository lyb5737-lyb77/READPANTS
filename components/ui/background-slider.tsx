"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const images = [
    "/images/golf-backgrounds/sunset-green.jpg",
    "/images/golf-backgrounds/tropical-course.jpg",
    "/images/golf-backgrounds/mountain-green.jpg",
    "/images/golf-backgrounds/premium-green.jpg",
];

export function BackgroundSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 8000); // 8초마다 전환

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <Image
                        src={images[currentIndex]}
                        alt="Golf Background"
                        fill
                        className="object-cover object-center"
                        style={{ objectPosition: 'center 40%' }}
                        priority={currentIndex === 0}
                        quality={75}
                        unoptimized
                    />
                </motion.div>
            </AnimatePresence>

            {/* 어두운 오버레이 - 텍스트 가독성 확보 */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>
    );
}
