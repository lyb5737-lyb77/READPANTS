"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";
import { addParticipant, hasUserApplied, incrementJoinMembers } from "@/lib/db/participants";
import { toast } from "sonner";

interface JoinActionButtonProps {
    joinId: string;
    status: "open" | "closed" | "full";
}

export function JoinActionButton({ joinId, status }: JoinActionButtonProps) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleJoinClick = async () => {
        if (!user) {
            toast.error("로그인이 필요합니다.");
            router.push("/login");
            return;
        }

        setLoading(true);
        try {
            // Check if user has already applied
            const alreadyApplied = await hasUserApplied(joinId, user.uid);
            if (alreadyApplied) {
                toast.warning("이미 참여 신청하신 조인입니다.");
                setLoading(false);
                return;
            }

            // Add participant
            await addParticipant({
                joinId,
                userId: user.uid,
                userName: user.displayName || user.email || "사용자",
                userEmail: user.email || "",
                appliedAt: new Date().toISOString(),
                status: "pending"
            });

            // Increment join members count
            await incrementJoinMembers(joinId);

            toast.success("조인 참여 신청이 완료되었습니다! 호스트의 승인을 기다려주세요.");

            // Refresh the page to show updated member count
            router.refresh();
        } catch (error) {
            console.error("Error joining:", error);
            toast.error("조인 신청 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            className="w-full h-12 text-lg bg-red-600 hover:bg-red-700"
            disabled={status !== "open" || loading}
            onClick={handleJoinClick}
        >
            {loading ? "처리 중..." : status === "open" ? "참여 신청하기" : "모집 마감"}
        </Button>
    );
}
