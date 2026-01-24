"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/store/auth-store";
import { createCustomRequest } from "@/lib/db/custom-requests";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, Users, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Course } from "@/lib/courses-data";

interface CustomRequestCardProps {
    courses?: Course[];
}

export function CustomRequestCard({ courses = [] }: CustomRequestCardProps) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        courseName: "",
        date: "",
        time: "",
        people: "",
        memo: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            router.push("/login");
            return;
        }

        setLoading(true);
        try {
            await createCustomRequest(user.uid, {
                ...formData,
                userEmail: user.email || "",
                userName: user.displayName || ""
            });
            setIsOpen(false);
            setFormData({ courseName: "", date: "", time: "", people: "", memo: "" });
            alert("요청이 성공적으로 접수되었습니다. 관리자가 확인 후 알림을 보내드립니다.");
        } catch (error) {
            console.error("Failed to submit request:", error);
            alert("요청 접수 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer relative flex flex-col h-full">
                    {/* Image Section */}
                    <div className="relative h-48 w-full overflow-hidden shrink-0">
                        <Image
                            src="/images/custom-rounding.png"
                            alt="Custom Rounding"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                        <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
                            회원 맞춤 요청
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                            <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">
                                원하는 라운딩이<br />없으신가요?
                            </h3>
                            <p className="text-white/90 text-sm font-medium drop-shadow-sm">
                                나만의 라운딩을 요청해보세요
                            </p>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 bg-white flex flex-col flex-1">
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-3 text-red-500" />
                                <span>원하는 골프장 선택</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <CalendarIcon className="w-4 h-4 mr-3 text-red-500" />
                                <span>원하는 날짜 지정</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Users className="w-4 h-4 mr-3 text-red-500" />
                                <span>인원 및 조인 구성</span>
                            </div>
                        </div>

                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors shadow-md mt-auto">
                            요청하기
                        </Button>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>커스텀 라운딩 요청</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="courseName">희망 골프장</Label>
                        <Select
                            value={formData.courseName}
                            onValueChange={(value) => setFormData({ ...formData, courseName: value })}
                            required
                        >
                            <SelectTrigger id="courseName">
                                <SelectValue placeholder="골프장을 선택해주세요" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.name}>
                                        {course.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="date">희망 날짜</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="time">희망 티업 시간</Label>
                        <Select
                            value={formData.time}
                            onValueChange={(value) => setFormData({ ...formData, time: value })}
                            required
                        >
                            <SelectTrigger id="time">
                                <SelectValue placeholder="시간을 선택해주세요" />
                            </SelectTrigger>
                            <SelectContent>
                                {["07:00", "08:00", "09:00", "10:00", "11:00", "12:00"].map((time) => (
                                    <SelectItem key={time} value={time}>
                                        {time}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="people">희망 인원</Label>
                        <Input
                            id="people"
                            placeholder="예: 4명 (본인 포함)"
                            value={formData.people}
                            onChange={(e) => setFormData({ ...formData, people: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="memo">추가 요청 사항</Label>
                        <Textarea
                            id="memo"
                            placeholder="원하는 시간대나 기타 요청사항을 적어주세요."
                            value={formData.memo}
                            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
                            {loading ? "제출 중..." : "신청하기"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
