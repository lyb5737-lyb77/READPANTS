"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRegionStore } from "@/lib/store/region-store";
import { createCustomRequest } from "@/lib/db/custom-requests";
import { getJoins } from "@/lib/db/joins";
import { getCourses } from "@/lib/db/courses";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isToday } from "date-fns";
import { ko } from "date-fns/locale";

interface JoinData {
    id: string;
    courseName: string;
    date: string;
    time: string;
    currentMembers: number;
    maxMembers: number;
    status: string;
    country: string;
    region: string;
}

interface CourseOption {
    id: string;
    name: string;
}

export function JoinCalendar() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { selectedRegion } = useRegionStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [joins, setJoins] = useState<JoinData[]>([]);
    const [courses, setCourses] = useState<CourseOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [formData, setFormData] = useState({
        courseName: "",
        date: "",
        time: "",
        people: "",
        memo: ""
    });

    // Check if mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Fetch joins for current month using existing getJoins function
    useEffect(() => {
        const fetchJoinsData = async () => {
            setLoading(true);
            try {
                const monthStart = format(startOfMonth(currentDate), "yyyy-MM-dd");
                const monthEnd = format(endOfMonth(currentDate), "yyyy-MM-dd");

                // console.log("[JoinCalendar] Fetching joins:", {
                //     country: selectedRegion.country,
                //     region: selectedRegion.region,
                //     monthStart,
                //     monthEnd
                // });

                // Use existing getJoins function
                const allJoins = await getJoins();

                // console.log("[JoinCalendar] All joins fetched:", allJoins.length);

                // Filter by region and date range on client side
                const filteredJoins = allJoins
                    .filter(join =>
                        join.country === selectedRegion.country &&
                        join.region === selectedRegion.region &&
                        join.date >= monthStart &&
                        join.date <= monthEnd
                    )
                    .map(join => ({
                        id: join.id,
                        courseName: join.courseName || "",
                        date: join.date,
                        time: join.time || "",
                        currentMembers: join.currentMembers || 0,
                        maxMembers: join.maxMembers || 4,
                        status: join.status || "open",
                        country: join.country,
                        region: join.region,
                    }));

                // console.log("[JoinCalendar] Filtered joins:", filteredJoins.length, filteredJoins);

                setJoins(filteredJoins);
            } catch (error) {
                console.error("[JoinCalendar] Failed to fetch joins:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJoinsData();
    }, [currentDate, selectedRegion]);

    // Fetch courses for dialog using existing getCourses function
    useEffect(() => {
        const fetchCoursesData = async () => {
            try {
                const allCourses = await getCourses();
                const filteredCourses = allCourses
                    .filter(course =>
                        course.country === selectedRegion.country &&
                        course.region === selectedRegion.region
                    )
                    .map(course => ({ id: course.id, name: course.name }));
                setCourses(filteredCourses);
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            }
        };
        fetchCoursesData();
    }, [selectedRegion]);

    // Handle custom request submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            router.push("/login");
            return;
        }

        setSubmitLoading(true);
        try {
            await createCustomRequest(user.uid, {
                ...formData,
                userEmail: user.email || "",
                userName: user.displayName || ""
            });
            setIsDialogOpen(false);
            setFormData({ courseName: "", date: "", time: "", people: "", memo: "" });
            alert("요청이 성공적으로 접수되었습니다!");
        } catch (error) {
            console.error("Failed to submit request:", error);
            alert("요청 접수 중 오류가 발생했습니다.");
        } finally {
            setSubmitLoading(false);
        }
    };

    // Get joins for a specific date
    const getJoinsForDate = (date: Date): JoinData[] => {
        const dateStr = format(date, "yyyy-MM-dd");
        return joins.filter(join => join.date === dateStr);
    };

    // Render calendar days
    const renderDays = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const currentDay = day;
                const dayJoins = getJoinsForDate(currentDay);
                const isCurrentMonth = isSameMonth(currentDay, monthStart);

                days.push(
                    <div
                        key={day.toString()}
                        className={`min-h-[100px] md:min-h-[120px] p-1 md:p-2 border-b border-r border-pink-100 transition-colors ${isCurrentMonth ? "bg-white" : "bg-gray-50/50"
                            } ${isToday(currentDay) ? "bg-pink-50" : ""} ${dayJoins.length > 0 ? "cursor-pointer hover:bg-pink-50/50" : ""
                            }`}
                        onClick={() => dayJoins.length > 0 && router.push(`/join/schedule/${format(currentDay, "yyyy-MM-dd")}?country=${selectedRegion.country}&region=${selectedRegion.region}`)}
                    >
                        <div className={`text-xs md:text-sm font-medium mb-1 ${isCurrentMonth ? "text-gray-700" : "text-gray-400"
                            } ${isToday(currentDay) ? "text-pink-600 font-bold" : ""}`}>
                            {format(currentDay, "d")}
                        </div>
                        <div className="space-y-1">
                            {dayJoins.slice(0, 3).map((join) => (
                                <div
                                    key={join.id}
                                    className={`text-[10px] md:text-xs px-1.5 py-0.5 rounded-md truncate ${join.currentMembers >= join.maxMembers
                                        ? "bg-gray-100 text-gray-500"
                                        : "bg-green-100 text-green-700"
                                        }`}
                                >
                                    <span className="mr-1">⛳</span>
                                    <span className="hidden md:inline">{join.courseName.length > 6 ? join.courseName.slice(0, 6) + "..." : join.courseName}</span>
                                    <span className="md:hidden">{join.courseName.length > 4 ? join.courseName.slice(0, 4) + ".." : join.courseName}</span>
                                </div>
                            ))}
                            {dayJoins.length > 3 && (
                                <div className="text-[10px] text-pink-500 font-medium">
                                    +{dayJoins.length - 3}개
                                </div>
                            )}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toString()} className="grid grid-cols-7">
                    {days}
                </div>
            );
            days = [];
        }
        return rows;
    };

    // Render mobile weekly view
    const renderWeeklyView = () => {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const days = [];

        for (let i = 0; i < 7; i++) {
            const day = addDays(weekStart, i);
            const dayJoins = getJoinsForDate(day);

            days.push(
                <div
                    key={day.toString()}
                    className={`flex flex-col items-center p-2 rounded-xl transition-colors ${isToday(day) ? "bg-pink-100" : "bg-white"
                        } ${dayJoins.length > 0 ? "cursor-pointer" : ""}`}
                    onClick={() => dayJoins.length > 0 && router.push(`/join/schedule/${format(day, "yyyy-MM-dd")}?country=${selectedRegion.country}&region=${selectedRegion.region}`)}
                >
                    <span className="text-xs text-gray-500">{format(day, "EEE", { locale: ko })}</span>
                    <span className={`text-lg font-bold ${isToday(day) ? "text-pink-600" : "text-gray-800"}`}>
                        {format(day, "d")}
                    </span>
                    {dayJoins.length > 0 && (
                        <div className="flex mt-1 gap-0.5">
                            {dayJoins.slice(0, 3).map((_, idx) => (
                                <div key={idx} className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // Get all joins for the week
        const weekJoins = joins.filter(join => {
            const joinDate = new Date(join.date);
            return joinDate >= weekStart && joinDate < addDays(weekStart, 7);
        });

        return (
            <div className="space-y-4">
                {/* Week navigation */}
                <div className="flex items-center justify-between mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentDate(addDays(currentDate, -7))}
                        className="text-pink-600 hover:bg-pink-50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-semibold text-gray-700">
                        {format(weekStart, "M월 d일", { locale: ko })} ~ {format(addDays(weekStart, 6), "M월 d일", { locale: ko })}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentDate(addDays(currentDate, 7))}
                        className="text-pink-600 hover:bg-pink-50"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Week days */}
                <div className="grid grid-cols-7 gap-1 bg-gradient-to-r from-pink-50 to-purple-50 p-2 rounded-2xl">
                    {days}
                </div>

                {/* Week joins list */}
                <div className="space-y-2 mt-4">
                    {weekJoins.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            이번 주 조인 일정이 없습니다
                        </div>
                    ) : (
                        weekJoins.map((join) => (
                            <Link
                                key={join.id}
                                href={`/join/${join.id}?country=${selectedRegion.country}&region=${selectedRegion.region}`}
                                className="flex items-center justify-between p-3 bg-white rounded-xl border border-pink-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">⛳</div>
                                    <div>
                                        <div className="font-semibold text-gray-800">{join.courseName}</div>
                                        <div className="text-xs text-gray-500">
                                            {format(new Date(join.date), "M월 d일 (EEE)", { locale: ko })} {join.time}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-700">
                                        {join.currentMembers}/{join.maxMembers}명
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${join.currentMembers >= join.maxMembers
                                        ? "bg-gray-100 text-gray-500"
                                        : "bg-green-100 text-green-600"
                                        }`}>
                                        {join.currentMembers >= join.maxMembers ? "마감" : "모집중"}
                                    </span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <section className="relative pt-16 pb-12 md:pt-20 md:pb-20 overflow-hidden bg-gradient-to-b from-red-50 via-pink-50/50 to-purple-50/30">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-50 animate-pulse" />
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-50" />

            <div className="container px-4 md:px-6 relative z-10">
                {/* Hero Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-600 mb-4">
                        <span className="flex h-2 w-2 rounded-full bg-red-600 mr-2 animate-pulse"></span>
                        지금 가장 핫한 동남아 골프 조인
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight mb-4">
                        혼자라도 괜찮아, <br className="hidden sm:inline" />
                        <span className="text-primary">빨간바지</span>와 함께라면!
                    </h1>
                    <p className="max-w-[700px] mx-auto text-base md:text-lg text-gray-600 mb-8">
                        설레는 해외 라운딩, 낯선 곳에서의 특별한 만남. <br className="hidden sm:inline" />
                        검증된 매너 골퍼들과 함께 안전하고 즐거운 여행을 떠나보세요.
                    </p>
                </div>

                {/* Calendar Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                            🗓️ <span className="text-pink-600">조인</span> 스케줄
                        </h2>
                        <p className="text-sm md:text-base text-gray-600">
                            원하는 날짜의 조인을 확인하세요
                        </p>
                    </div>

                    {/* Custom Request Button */}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-full px-6 shadow-lg shadow-pink-200/50">
                                <Sparkles className="h-4 w-4 mr-2" />
                                커스텀 조인 요청
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>✨ 커스텀 라운딩 요청</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="courseName">희망 골프장</Label>
                                    <Select
                                        value={formData.courseName}
                                        onValueChange={(value) => setFormData({ ...formData, courseName: value })}
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
                                    <Button type="submit" disabled={submitLoading} className="bg-gradient-to-r from-pink-400 to-purple-400">
                                        {submitLoading ? "제출 중..." : "신청하기"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Calendar Container */}
                <div className="bg-white rounded-3xl shadow-xl shadow-pink-100/50 overflow-hidden border border-pink-100">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
                        </div>
                    ) : isMobile ? (
                        <div className="p-4">
                            {renderWeeklyView()}
                        </div>
                    ) : (
                        <>
                            {/* Month navigation */}
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-100/50 to-purple-100/50 border-b border-pink-100">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                                    className="text-pink-600 hover:bg-pink-50"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <h3 className="text-lg font-bold text-gray-800">
                                    {format(currentDate, "yyyy년 M월", { locale: ko })}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                                    className="text-pink-600 hover:bg-pink-50"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Day headers */}
                            <div className="grid grid-cols-7 bg-pink-50/50 border-b border-pink-100">
                                {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
                                    <div
                                        key={day}
                                        className={`text-center py-3 text-sm font-semibold ${idx === 0 ? "text-red-400" : idx === 6 ? "text-blue-400" : "text-gray-600"
                                            }`}
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div className="border-l border-pink-100">
                                {renderDays()}
                            </div>
                        </>
                    )}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                        <span>모집중</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                        <span>마감</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
