import { Badge } from "@/components/ui/badge";
import { getUserLevel } from "@/lib/constants/user-levels";
import { Sprout, Leaf, User, Award, Medal, Trophy, Crown, Star, Sparkles, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserLevelBadgeProps {
    levelName: string;
    className?: string;
    showIcon?: boolean;
}

export function UserLevelBadge({ levelName, className, showIcon = true }: UserLevelBadgeProps) {
    const level = getUserLevel(levelName);

    const getLevelConfig = (id: number) => {
        switch (id) {
            case 1: return { icon: Sprout, color: "bg-green-100 text-green-700 border-green-200" };
            case 2: return { icon: Leaf, color: "bg-lime-100 text-lime-700 border-lime-200" };
            case 3: return { icon: User, color: "bg-gray-100 text-gray-700 border-gray-200" };
            case 4: return { icon: Medal, color: "bg-orange-100 text-orange-700 border-orange-200" }; // Bronze-ish
            case 5: return { icon: Medal, color: "bg-slate-100 text-slate-700 border-slate-200" }; // Silver-ish
            case 6: return { icon: Medal, color: "bg-yellow-100 text-yellow-700 border-yellow-200" }; // Gold-ish
            case 7: return { icon: Trophy, color: "bg-cyan-100 text-cyan-700 border-cyan-200" };
            case 8: return { icon: Crown, color: "bg-purple-100 text-purple-700 border-purple-200" };
            case 9: return { icon: Gem, color: "bg-pink-100 text-pink-700 border-pink-200" };
            case 10: return { icon: Sparkles, color: "bg-indigo-100 text-indigo-700 border-indigo-200" };
            default: return { icon: User, color: "bg-gray-100 text-gray-700 border-gray-200" };
        }
    };

    const config = getLevelConfig(level.id);
    const Icon = config.icon;

    return (
        <Badge variant="outline" className={cn("gap-1.5 py-1", config.color, className)}>
            {showIcon && <Icon className="w-3.5 h-3.5" />}
            {level.name}
        </Badge>
    );
}
