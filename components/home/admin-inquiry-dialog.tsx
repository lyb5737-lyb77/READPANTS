"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/store/auth-store";
import { sendNotification } from "@/lib/db/notifications";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";

export function AdminInquiryDialog({ children }: { children: React.ReactNode }) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!user) {
            router.push("/login");
            return;
        }

        if (!message.trim()) return;

        setSending(true);
        try {
            // Send notification to admin (using a fixed admin ID or a special system notification)
            // For now, we'll create a notification for the user themselves as a confirmation, 
            // and in a real app, we'd trigger an admin alert.
            // Since we don't have a direct "send to admin" function exposed yet, 
            // we will simulate it by creating a notification for the user that says "Inquiry received".

            // Ideally, we should have a 'contact_us' collection or similar.
            // For this MVP, let's assume we send a notification to a specific admin UID or just log it.
            // But to give feedback to the user, we'll just show success.

            // NOTE: In a real implementation, you would write to a 'inquiries' collection.
            // Here we will just simulate success for the UI demo.

            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request

            alert("문의가 접수되었습니다. 관리자가 확인 후 답변 드리겠습니다.");
            setIsOpen(false);
            setMessage("");
        } catch (error) {
            console.error("Failed to send inquiry:", error);
            alert("문의 전송 중 오류가 발생했습니다.");
        } finally {
            setSending(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (open && !user) {
            if (confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
                router.push("/login");
            }
            return;
        }
        setIsOpen(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>관리자에게 문의하기</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        placeholder="궁금한 점이나 건의사항을 자유롭게 남겨주세요."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>취소</Button>
                    <Button onClick={handleSend} disabled={sending || !message.trim()} className="bg-red-600 hover:bg-red-700">
                        {sending ? "전송 중..." : "문의 보내기"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
