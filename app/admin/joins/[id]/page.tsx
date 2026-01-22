"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Calendar, DollarSign, Users, ArrowLeft } from "lucide-react";
import { getCourses } from "@/lib/db/courses";
import { getJoin, updateJoin } from "@/lib/db/joins";
import { Course } from "@/lib/courses-data";

const formSchema = z.object({
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
    status: z.enum(["open", "closed", "full"]),
    description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditJoinPage() {
    const router = useRouter();
    const params = useParams();
    const joinId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch courses
                const coursesData = await getCourses();
                setCourses(coursesData);

                // Fetch join data
                const joinData = await getJoin(joinId);
                if (!joinData) {
                    alert("조인을 찾을 수 없습니다.");
                    router.push("/admin/joins");
                    return;
                }

                // Set form values
                setValue("courseId", joinData.courseId);
                setValue("date", joinData.date);
                setValue("time", joinData.time);
                setValue("greenFee", joinData.greenFee);
                setValue("caddyFee", joinData.caddyFee);
                setValue("cartFee", joinData.cartFee);
                setValue("transportFee", joinData.transportFee || 0);
                setValue("maxMembers", joinData.maxMembers);
                setValue("currentMembers", joinData.currentMembers);
                setValue("hostName", joinData.hostName);
                setValue("hostLevel", joinData.hostLevel);
                setValue("status", joinData.status);
                setValue("description", joinData.description || "");
            } catch (error) {
                console.error("Error fetching data:", error);
                alert("데이터를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setInitialLoading(false);
            }
        };
        fetchData();
    }, [joinId, router, setValue]);

    const onSubmit = async (data: FormValues) => {
        setLoading(true);
        try {
            const selectedCourse = courses.find(c => c.id === data.courseId);
            if (!selectedCourse) throw new Error("Invalid course selected");

            await updateJoin(joinId, {
                ...data,
                courseName: selectedCourse.name,
                description: data.description || "",
            });

            alert("조인이 수정되었습니다.");
            router.push("/admin/joins");
        } catch (error) {
            console.error("Error updating join:", error);
            alert("조인 수정 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">조인 수정</h2>
                    <p className="text-gray-500 text-sm">
                        조인 모집글을 수정합니다.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" /> 일정 및 장소
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                            <DollarSign className="w-5 h-5 text-primary" /> 비용 안내 (1인 기준, THB)
                        </CardTitle>
                        <CardDescription>모든 비용은 태국 바트(THB) 기준입니다</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="greenFee">그린피 (THB)</Label>
                            <Input id="greenFee" type="number" placeholder="0" {...register("greenFee")} />
                            {errors.greenFee && <p className="text-xs text-red-500">{errors.greenFee.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="caddyFee">캐디피 (THB)</Label>
                            <Input id="caddyFee" type="number" placeholder="0" {...register("caddyFee")} />
                            {errors.caddyFee && <p className="text-xs text-red-500">{errors.caddyFee.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cartFee">카트비 (THB)</Label>
                            <Input id="cartFee" type="number" placeholder="0" {...register("cartFee")} />
                            {errors.cartFee && <p className="text-xs text-red-500">{errors.cartFee.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="transportFee">교통비 (THB)</Label>
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
                                <Input id="currentMembers" type="number" min="1" {...register("currentMembers")} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="hostName">호스트 이름</Label>
                                <Input id="hostName" {...register("hostName")} />
                                {errors.hostName && <p className="text-xs text-red-500">{errors.hostName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hostLevel">호스트 레벨</Label>
                                <Input id="hostLevel" {...register("hostLevel")} />
                                {errors.hostLevel && <p className="text-xs text-red-500">{errors.hostLevel.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">상태</Label>
                            <select
                                id="status"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                {...register("status")}
                            >
                                <option value="open">모집중</option>
                                <option value="full">마감</option>
                                <option value="closed">종료</option>
                            </select>
                            {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
                        </div>

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
                        수정하기
                    </Button>
                </div>
            </form>
        </div>
    );
}
