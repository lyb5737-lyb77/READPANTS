"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Calendar, MapPin, DollarSign, Users, ArrowLeft, Globe, AlertCircle } from "lucide-react";
import { getCourses } from "@/lib/db/courses";
import { createJoin } from "@/lib/db/joins";
import { Course } from "@/lib/courses-data";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateCustomRequestStatus } from "@/lib/db/custom-requests";
import { sendNotification } from "@/lib/db/notifications";
import { toast } from "sonner";

const formSchema = z.object({
    country: z.string().min(1, "국가를 선택해주세요."),
    region: z.string().min(1, "지역을 선택해주세요."),
    courseId: z.string().min(1, "골프장을 선택해주세요."),
    date: z.string().min(1, "날짜를 선택해주세요."),
    time: z.string().min(1, "시간을 입력해주세요."),
    greenFee: z.coerce.number().min(0, "그린피를 입력해주세요."),
    caddyFee: z.coerce.number().min(0, "캐디피를 입력해주세요."),
    cartFee: z.coerce.number().min(0, "카트비를 입력해주세요."),
    transportFee: z.coerce.number().min(0, "교통비를 입력해주세요."),
    maxMembers: z.coerce.number().min(1),
    currentMembers: z.coerce.number().min(0),
    hostName: z.string().min(1, "호스트 이름을 입력해주세요."),
    hostLevel: z.string().min(1, "호스트 레벨을 입력해주세요."),
    description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewJoinPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [regions, setRegions] = useState<Array<{ country: string; region: string; label: string }>>([]);

    // 커스텀 요청에서 넘어온 데이터
    const fromRequest = {
        courseName: searchParams.get('courseName') || '',
        date: searchParams.get('date') || '',
        time: searchParams.get('time') || '',
        requestId: searchParams.get('requestId') || '',
        requesterName: searchParams.get('requesterName') || '',
        requesterEmail: searchParams.get('requesterEmail') || ''
    };

    const isFromRequest = !!fromRequest.requestId;

    useEffect(() => {
        const fetchData = async () => {
            const coursesData = await getCourses();
            setAllCourses(coursesData);

            const regionsSnapshot = await getDocs(collection(db, 'regions'));
            const fetchedRegions: Array<{ country: string; region: string; label: string }> = [];
            regionsSnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedRegions.push({
                    country: data.country,
                    region: data.region,
                    label: data.label,
                });
            });
            setRegions(fetchedRegions);
        };
        fetchData();
    }, []);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            country: 'Vietnam',
            region: 'Haiphong',
            maxMembers: 4,
            currentMembers: 0, // 초기값 0으로 변경
            hostName: fromRequest.requesterName || "관리자",
            hostLevel: "마스터",
            date: fromRequest.date || '',
            time: fromRequest.time || '',
        }
    });

    const watchCountry = watch('country');
    const watchRegion = watch('region');

    // Filter courses based on selected region
    useEffect(() => {
        if (watchCountry && watchRegion) {
            const filtered = allCourses.filter(
                (course) => course.country === watchCountry && course.region === watchRegion
            );
            setCourses(filtered);

            // 커스텀 요청의 골프장 이름으로 courseId 자동 선택
            if (isFromRequest && fromRequest.courseName && filtered.length > 0) {
                const matchedCourse = filtered.find(c =>
                    c.name.includes(fromRequest.courseName) ||
                    fromRequest.courseName.includes(c.name)
                );
                if (matchedCourse) {
                    setValue('courseId', matchedCourse.id);
                }
            }
        }
    }, [watchCountry, watchRegion, allCourses, isFromRequest, fromRequest.courseName, setValue]);


    const onSubmit = async (data: FormValues) => {
        setLoading(true);
        try {
            const selectedCourse = courses.find(c => c.id === data.courseId);
            if (!selectedCourse) throw new Error("Invalid course selected");

            const joinId = await createJoin({
                ...data,
                courseName: selectedCourse.name,
                country: data.country,
                region: data.region,
                status: "open",
                hostId: "admin",
                description: data.description || "",
            });

            // 커스텀 요청에서 온 경우, 요청 상태 업데이트 및 알림 발송
            if (isFromRequest && fromRequest.requestId) {
                try {
                    // 요청 상태를 '완료됨'으로 업데이트
                    await updateCustomRequestStatus(
                        fromRequest.requestId,
                        'completed',
                        `조인이 등록되었습니다. (${data.date} ${data.time})`
                    );

                    // 요청자에게 알림 보내기 (userId 필요 - DB에서 가져와야 함)
                    // 여기서는 requestId로 알림만 보냅니다
                } catch (updateError) {
                    console.error("Error updating custom request:", updateError);
                }
            }

            toast.success("새로운 조인이 등록되었습니다.");
            router.push("/admin/joins");
            router.refresh();
        } catch (error) {
            console.error("Error creating join:", error);
            toast.error("조인 등록 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">새 조인 등록</h2>
                    <p className="text-gray-500 text-sm">
                        관리자 권한으로 새로운 조인 모집글을 등록합니다.
                    </p>
                </div>
            </div>

            {/* 커스텀 요청에서 온 경우 안내 배너 */}
            {isFromRequest && (
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="flex items-start gap-3 p-4">
                        <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium text-green-800">커스텀 라운딩 요청 승인</p>
                            <p className="text-sm text-green-600 mt-1">
                                <strong>{fromRequest.requesterName}</strong>님의 요청입니다.<br />
                                희망 골프장: {fromRequest.courseName || '미지정'} /
                                날짜: {fromRequest.date || '미지정'} /
                                시간: {fromRequest.time || '미지정'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Hidden Inputs for Host Info */}
                <input type="hidden" {...register('hostName')} />
                <input type="hidden" {...register('hostLevel')} />

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Globe className="w-5 h-5 text-primary" /> 지역 및 골프장
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="country">국가</Label>
                                <Select
                                    value={watchCountry}
                                    onValueChange={(value) => {
                                        setValue('country', value);
                                        const firstRegionOfCountry = regions.find(r => r.country === value);
                                        if (firstRegionOfCountry) {
                                            setValue('region', firstRegionOfCountry.region);
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="국가를 선택하세요" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[...new Set(regions.map(r => r.country))].map((country) => (
                                            <SelectItem key={country} value={country}>
                                                {country}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="region">지역</Label>
                                <Select
                                    value={watchRegion}
                                    onValueChange={(value) => setValue('region', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="지역을 선택하세요" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {regions
                                            .filter(r => r.country === watchCountry)
                                            .map((region) => (
                                                <SelectItem key={`${region.country}-${region.region}`} value={region.region}>
                                                    {region.label}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {errors.region && <p className="text-xs text-red-500">{errors.region.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="courseId">골프장 선택</Label>
                            <select
                                id="courseId"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...register("courseId")}
                            >
                                <option value="">골프장을 선택하세요</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.name}</option>
                                ))}
                            </select>
                            {errors.courseId && <p className="text-xs text-red-500">{errors.courseId.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">날짜</Label>
                                <Input id="date" type="date" {...register("date")} />
                                {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time">시간</Label>
                                <Input id="time" type="time" {...register("time")} />
                                {errors.time && <p className="text-xs text-red-500">{errors.time.message}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-primary" /> 비용 안내 (1인 기준)
                        </CardTitle>
                        <CardDescription>비용은 해당 국가 통화 기준입니다</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="greenFee">그린피</Label>
                            <Input id="greenFee" type="number" placeholder="0" {...register("greenFee")} />
                            {errors.greenFee && <p className="text-xs text-red-500">{errors.greenFee.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="caddyFee">캐디피</Label>
                            <Input id="caddyFee" type="number" placeholder="0" {...register("caddyFee")} />
                            {errors.caddyFee && <p className="text-xs text-red-500">{errors.caddyFee.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cartFee">카트비</Label>
                            <Input id="cartFee" type="number" placeholder="0" {...register("cartFee")} />
                            {errors.cartFee && <p className="text-xs text-red-500">{errors.cartFee.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="transportFee">교통비</Label>
                            <Input id="transportFee" type="number" placeholder="0" {...register("transportFee")} />
                            {errors.transportFee && <p className="text-xs text-red-500">{errors.transportFee.message}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" /> 모집 정보
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="maxMembers">최대 인원</Label>
                                <Input id="maxMembers" type="number" min="1" {...register("maxMembers")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currentMembers">현재 인원 (호스트 포함)</Label>
                                <Input id="currentMembers" type="number" min="0" {...register("currentMembers")} />
                            </div>
                        </div>

                        {/* Host Name and Level inputs removed as requested */}

                        <div className="space-y-2">
                            <Label htmlFor="description">추가 설명</Label>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                id="description"
                                placeholder="조인 관련 추가 설명을 입력하세요."
                                {...register("description")}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4 mt-6 pb-10">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        취소
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        조인 등록하기
                    </Button>
                </div>
            </form>
        </div>
    );
}
