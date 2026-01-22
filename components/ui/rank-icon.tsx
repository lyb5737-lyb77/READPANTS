
"use client";

import { cn } from "@/lib/utils";
import { DEFAULT_RANK_LEVELS } from "@/lib/ranking";

interface RankIconProps {
    rankName: string;
    className?: string;
}

export function RankIcon({ rankName, className }: RankIconProps) {
    // Find level index (1-based)
    const rank = DEFAULT_RANK_LEVELS.find((r) => r.name === rankName);
    const level = rank ? rank.level : 1; // Default to 1 if not found

    // Calculate background position
    // Assuming 10 icons in a horizontal sprite sheet
    // Each icon is 10% width
    // Position x: (level - 1) * 100% / 9  <- Wait, if using background-position percentage for sprites:
    // 0% = 1st image, 100% = last image (10th).
    // Step = 100 / (10 - 1) = 11.111...%

    // Actually, if we use object-fit/position with an img tag it might be easier to just use a div with background.
    // Let's assume the image is designed such that 10 characters are equally spaced.

    return (
        <div
            className={cn("relative inline-block overflow-hidden align-middle mr-1", className)}
            style={{
                width: '24px',
                height: '24px',
                // Optional: define specific aspect ratio if characters are not square
            }}
            title={rankName}
        >
            <div
                className="absolute top-0 left-0 h-full"
                style={{
                    backgroundImage: "url('/images/rank-characters.png')",
                    backgroundSize: "1000% 100%", // 10 icons horizontally
                    backgroundPosition: `${(level - 1) * (100 / 9)}% 0`,
                    width: "100%",
                    backgroundRepeat: "no-repeat"
                }}
            />
        </div>
    );
}
