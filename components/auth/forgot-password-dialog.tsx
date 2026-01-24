"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export function ForgotPasswordDialog() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            alert("비밀번호 재설정 이메일을 보냈습니다. 이메일을 확인해주세요.");
            setOpen(false);
            setEmail("");
        } catch (error: any) {
            console.error("Error sending password reset email:", error);
            if (error.code === "auth/user-not-found") {
                alert("가입되지 않은 이메일입니다.");
            } else {
                alert("이메일 전송 중 오류가 발생했습니다.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="link" className="px-0 font-normal text-xs text-gray-500 hover:text-red-600">
                    비밀번호를 잊으셨나요?
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>비밀번호 재설정</DialogTitle>
                    <DialogDescription>
                        가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="reset-email">이메일</Label>
                        <Input
                            id="reset-email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "이메일 보내기"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
