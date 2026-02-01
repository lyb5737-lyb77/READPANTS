"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getJoins } from "@/lib/db/joins";
import { getCourses } from "@/lib/db/courses";
import { Join } from "@/lib/joins-data";
import { Course } from "@/lib/courses-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, Filter, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/constants/currencies";

function JoinPageContent() {
    const searchParams = useSearchParams();
    const country = searchParams.get('country') || 'Thailand';
    const region = searchParams.get('region') || 'Pattaya';

    const [selectedCourse, setSelectedCourse] = useState<string>("all");
    const [joins, setJoins] = useState<Join[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch relevant courses
                const allCourses = await getCourses();
                // Filter client side
                const regionCourses = allCourses.filter(c => c.country === country && c.region === region);
                setCourses(regionCourses);

                // Fetch joins
                const allJoins = await getJoins();
                // Filter joins by filtered courses
                const regionCourseIds = regionCourses.map(c => c.id);
                // Also check if join itself has country/region fields (it does)
                const regionJoins = allJoins.filter(j =>
                    (j.country === country && j.region === region) ||
                    regionCourseIds.includes(j.courseId)
                );

                setJoins(regionJoins);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [country, region]);

    const filteredJoins = selectedCourse === "all"
        ? joins
        : joins.filter(join => join.courseId === selectedCourse);

    return (
        <div className="container mx-auto px-4 py-8 pb-24">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">골프 조인</h1>
                <p className="text-gray-500 mt-1">
                    {country === 'Thailand' ? '태국' : country} {region === 'Pattaya' ? '파타야' : region} 지역의 라운딩 동반자를 찾아보세요.
                </p>
            </div>

            {/* Filters */}
            <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar mb-6">
                <Button
                    variant={selectedCourse === "all" ? "default" : "outline"}
                    onClick={() => setSelectedCourse("all")}
                    className={cn(
                        "rounded-full whitespace-nowrap",
                        selectedCourse === "all" ? "bg-gray-900 text-white hover:bg-gray-800" : "text-gray-600"
                    )}
                >
                    전체
                </Button>
                {courses.map(course => (
                    <Button
                        key={course.id}
                        variant={selectedCourse === course.id ? "default" : "outline"}
                        onClick={() => setSelectedCourse(course.id)}
                        className={cn(
                            "rounded-full whitespace-nowrap",
                            selectedCourse === course.id ? "bg-gray-900 text-white hover:bg-gray-800" : "text-gray-600"
                        )}
                    >
                        {course.name}
                    </Button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                </div>
            ) : filteredJoins.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJoins.map((join) => {
                        const course = courses.find(c => c.id === join.courseId);
                        return (
                            <Link href={`/join/${join.id}`} key={join.id} className="group">
                                <div className="bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group-hover:-translate-y-1">
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                                                {join.status === 'open' ? '모집중' : '마감'}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                등록일: 2026.01.21 {/* Mock date as createdAt missing in interface */}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-lg mb-1 group-hover:text-red-600 transition-colors">
                                            {join.courseName || course?.name}
                                        </h3>

                                        <div className="space-y-2 mt-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                {join.date} ({join.time})
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Users className="h-4 w-4 mr-2 text-gray-400" />
                                                {join.currentMembers}/{join.maxMembers}명
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <div className="w-4 mr-2 flex justify-center text-gray-400">￦</div>
                                                {join.greenFee ? formatPrice(join.greenFee, country) : '비용 문의'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-5 py-3 border-t flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                                {/* Host Avatar if available */}
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                                                    {join.hostName?.charAt(0)}
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-600">{join.hostName}</span>
                                        </div>
                                        <span className="text-xs font-medium text-red-600">자세히 보기 &rarr;</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed">
                    <p className="text-gray-500 mb-4">등록된 조인이 없습니다.</p>
                    <Link href="/join/new">
                        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                            첫 번째 조인을 등록해보세요!
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function JoinPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div>}>
            <JoinPageContent />
        </Suspense>
    );
}
