"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/lib/store/auth-store";
import { createQuote, VEHICLE_TYPES, VehicleType } from "@/lib/db/quotes";
import { getCourses } from "@/lib/db/courses";
import { ArrowLeft, Loader2 } from "lucide-react";

// Mock Data for Accommodations (Since we don't have DB for it yet)
const ACCOMMODATIONS = {
    'Thailand': {
        'Pattaya': [
            "시암 베이쇼어 리조트",
            "케이프 다라 리조트",
            "그랜드 팔라조 호텔",
            "호텔 앰버 파타야",
            "기타 (직접 입력)"
        ]
    },
    'Vietnam': {
        'Haiphong': [
            "펄 리버 호텔",
            "빈펄 리조트",
            "소노 벨 하이퐁",
            "기타 (직접 입력)"
        ]
    }
};

function NewQuotePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialRegion = searchParams.get('region') || 'Pattaya';
    const { user } = useAuthStore();

    const [loading, setLoading] = useState(false);

    // Form States
    const [country, setCountry] = useState(initialRegion === 'Haiphong' ? 'Vietnam' : 'Thailand');
    const [region, setRegion] = useState(initialRegion);

    // Data Loading
    const [availableCourses, setAvailableCourses] = useState<any[]>([]);

    // Inputs
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [selectedAccommodation, setSelectedAccommodation] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('sedan');
    const [content, setContent] = useState("");

    useEffect(() => {
        // Update country when region changes
        if (region === 'Haiphong') setCountry('Vietnam');
        else if (region === 'Pattaya') setCountry('Thailand');

        const fetchCourses = async () => {
            try {
                const allCourses = await getCourses();
                const filtered = allCourses.filter(c => c.region === region || c.country === country);
                setAvailableCourses(filtered.length > 0 ? filtered : allCourses);
            } catch (e) {
                console.error(e);
            }
        };
        fetchCourses();
    }, [region, country]);

    const handleCourseToggle = (courseName: string) => {
        if (selectedCourses.includes(courseName)) {
            setSelectedCourses(selectedCourses.filter(c => c !== courseName));
        } else {
            setSelectedCourses([...selectedCourses, courseName]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert("로그인이 필요합니다.");
            router.push("/login?redirect=/quotes/new");
            return;
        }

        if (selectedCourses.length === 0) {
            alert("골프장을 최소 1개 이상 선택해주세요.");
            return;
        }

        if (!content.trim()) {
            alert("세부 일정을 입력해주세요.");
            return;
        }

        setLoading(true);

        try {
            await createQuote({
                userId: user.uid,
                authorName: user.displayName || user.email?.split('@')[0] || "익명",
                country,
                region,
                golfCourses: selectedCourses,
                accommodation: selectedAccommodation,
                vehicleType: selectedVehicle,
                content
            });

            alert("견적 요청이 등록되었습니다. 관리자 확인 후 답변 드리겠습니다.");
            router.push("/quotes");
        } catch (error) {
            console.error("Failed to create quote:", error);
            alert("견적 요청 등록에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to safe access accommodations
    const currentAccommodations = ACCOMMODATIONS[country as keyof typeof ACCOMMODATIONS]?.[region as keyof typeof ACCOMMODATIONS['Thailand']] || [];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container max-w-2xl px-4">
                <div className="mb-6 flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 text-gray-500">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        돌아가기
                    </Button>
                    <h1 className="text-xl font-bold ml-auto">{region} 여행 견적 요청</h1>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* 1. Golf Courses */}
                        <div className="space-y-4">
                            <label className="text-base font-bold text-gray-900 block">
                                희망 골프장 선택 (중복 가능) <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {availableCourses.map((course) => (
                                    <div
                                        key={course.id}
                                        onClick={() => handleCourseToggle(course.name)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${selectedCourses.includes(course.name)
                                            ? "border-red-600 bg-red-50 text-red-700 ring-1 ring-red-600"
                                            : "border-gray-200 hover:bg-gray-50 text-gray-700"
                                            }`}
                                    >
                                        <span className="text-sm font-medium">{course.name}</span>
                                        {selectedCourses.includes(course.name) && (
                                            <div className="w-2 h-2 rounded-full bg-red-600" />
                                        )}
                                    </div>
                                ))}
                                {availableCourses.length === 0 && (
                                    <p className="text-sm text-gray-500 col-span-2">등록된 골프장 정보가 없습니다.</p>
                                )}
                            </div>
                        </div>

                        {/* 2. Accommodation */}
                        <div className="space-y-2">
                            <label className="text-base font-bold text-gray-900 block">
                                희망 숙소 <span className="text-red-500">*</span>
                            </label>
                            <Select value={selectedAccommodation} onValueChange={setSelectedAccommodation}>
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="숙소를 선택해주세요" />
                                </SelectTrigger>
                                <SelectContent>
                                    {currentAccommodations.map((acc, idx) => (
                                        <SelectItem key={idx} value={acc}>{acc}</SelectItem>
                                    ))}
                                    <SelectItem value="not_needed">숙소 필요 없음 (직접 예약)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 3. Vehicle */}
                        <div className="space-y-2">
                            <label className="text-base font-bold text-gray-900 block">
                                희망 차량 <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {VEHICLE_TYPES.map((v) => (
                                    <button
                                        key={v.value}
                                        type="button"
                                        onClick={() => setSelectedVehicle(v.value)}
                                        className={`py-3 px-2 rounded-xl text-sm font-medium border transition-all ${selectedVehicle === v.value
                                            ? "border-gray-900 bg-gray-900 text-white shadow-md"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600"
                                            }`}
                                    >
                                        {v.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 4. Details */}
                        <div className="space-y-2">
                            <label className="text-base font-bold text-gray-900 block">
                                세부 일정 및 요청사항 <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                placeholder="여행 날짜, 인원, 티오프 희망 시간 등 상세한 일정을 적어주세요."
                                className="min-h-[150px] resize-none text-base"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>

                        {/* Submit */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full h-14 text-lg font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        등록 중...
                                    </>
                                ) : (
                                    "견적 요청하기"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function NewQuotePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-red-600" /></div>}>
            <NewQuotePageContent />
        </Suspense>
    );
}
