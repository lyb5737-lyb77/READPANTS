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
import { getAccommodations } from "@/lib/db/accommodations";
import { Accommodation } from "@/types/accommodation";
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

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
    const [availableAccommodations, setAvailableAccommodations] = useState<Accommodation[]>([]);

    // Inputs
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [selectedAccommodationId, setSelectedAccommodationId] = useState("");
    const [selectedAccommodationName, setSelectedAccommodationName] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('sedan');
    const [content, setContent] = useState("");

    useEffect(() => {
        // Update country when region changes
        if (region === 'Haiphong') setCountry('Vietnam');
        else if (region === 'Pattaya') setCountry('Thailand');

        const fetchData = async () => {
            try {
                // Fetch Courses
                const allCourses = await getCourses();
                const filteredCourses = allCourses.filter(c => c.region === region || c.country === country);
                setAvailableCourses(filteredCourses.length > 0 ? filteredCourses : allCourses);

                // Fetch Accommodations
                const allAccommodations = await getAccommodations();
                const filteredAccommodations = allAccommodations.filter(a => a.region === region || a.country === country);
                setAvailableAccommodations(filteredAccommodations);

            } catch (e) {
                console.error(e);
            }
        };
        fetchData();
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
            toast.error("로그인이 필요합니다.");
            router.push("/login?redirect=/quotes/new");
            return;
        }

        if (selectedCourses.length === 0) {
            toast.warning("골프장을 최소 1개 이상 선택해주세요.");
            return;
        }

        if (!content.trim()) {
            toast.warning("세부 일정을 입력해주세요.");
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
                accommodation: selectedAccommodationName || "숙소 필요 없음 (직접 예약)",
                accommodationId: selectedAccommodationId !== "not_needed" ? selectedAccommodationId : undefined,
                vehicleType: selectedVehicle,
                content
            });

            toast.success("견적 요청이 등록되었습니다. 관리자 확인 후 답변 드리겠습니다.");
            router.push("/quotes");
        } catch (error) {
            console.error("Failed to create quote:", error);
            toast.error("견적 요청 등록에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

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
                            <div className="flex gap-2">
                                <Select
                                    value={selectedAccommodationId}
                                    onValueChange={(value) => {
                                        setSelectedAccommodationId(value);
                                        if (value === "not_needed") {
                                            setSelectedAccommodationName("숙소 필요 없음 (직접 예약)");
                                        } else {
                                            const selected = availableAccommodations.find(a => a.id === value);
                                            setSelectedAccommodationName(selected ? selected.name : "");
                                        }
                                    }}
                                >
                                    <SelectTrigger className="h-12 text-base flex-1">
                                        <SelectValue placeholder="숙소를 선택해주세요" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="not_needed">숙소 필요 없음 (직접 예약)</SelectItem>
                                        {availableAccommodations.map((acc) => (
                                            <SelectItem key={acc.id} value={acc.id}>
                                                {acc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {selectedAccommodationId && selectedAccommodationId !== "not_needed" && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-12 w-12 shrink-0 border-gray-200"
                                        onClick={() => window.open(`/accommodations/${selectedAccommodationId}`, '_blank')}
                                        title="숙소 상세 보기"
                                    >
                                        <ExternalLink className="w-5 h-5 text-gray-600" />
                                    </Button>
                                )}
                            </div>
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
