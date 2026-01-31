import React from 'react';
import { COMMUNITY_LEVELS, GOLF_SKILL_LEVELS, LevelInfo } from '@/lib/constants/levels';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface LevelBadgeProps {
    type: 'community' | 'golf';
    level: number;
    showLabel?: boolean;
    showIcon?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function LevelBadge({
    type,
    level,
    showLabel = true,
    showIcon = true,
    className,
    size = 'sm'
}: LevelBadgeProps) {
    const levels = type === 'community' ? COMMUNITY_LEVELS : GOLF_SKILL_LEVELS;
    // level is 1-based, array is 0-based. But we stored level as number in object.
    const levelInfo = levels.find(l => l.level === level) || levels[0];

    // Style differentiation based on level roughly
    // Community: Stone(gray) -> Red Pants(Red/Gold)
    // Golf: Seed(green) -> GOAT(Gold)

    const getBadgeStyle = () => {
        if (type === 'community') {
            if (level === 10) return "bg-red-600 text-white border-yellow-400 border-2"; // Red Pants
            if (level === 9) return "bg-purple-600 text-white"; // Grand Master
            if (level >= 7) return "bg-blue-500 text-white"; // Diamond+
            if (level >= 5) return "bg-yellow-500 text-white"; // Gold+
            if (level >= 3) return "bg-orange-700 text-white"; // Bronze+
            return "bg-slate-200 text-slate-700"; // Low levels
        } else {
            // Golf
            if (level === 10) return "bg-yellow-400 text-black border-yellow-600 border"; // GOAT
            if (level >= 8) return "bg-slate-800 text-white"; // Master+
            if (level >= 6) return "bg-sky-500 text-white"; // Pro+
            if (level >= 4) return "bg-green-600 text-white"; // Amateur+
            return "bg-green-100 text-green-800"; // Low levels
        }
    };

    const sizeClasses = {
        sm: "text-xs px-1.5 py-0.5",
        md: "text-sm px-2.5 py-0.5",
        lg: "text-base px-3 py-1",
    };

    return (
        <Badge
            variant="outline"
            className={cn(getBadgeStyle(), sizeClasses[size], "gap-1 font-normal", className)}
        >
            {showIcon && <span>{levelInfo.icon}</span>}
            {showLabel && <span>{levelInfo.name.ko}</span>}
        </Badge>
    );
}
