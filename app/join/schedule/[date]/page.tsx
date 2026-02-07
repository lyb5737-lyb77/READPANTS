"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Clock, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getJoins } from "@/lib/db/joins";
import { getCourse } from "@/lib/db/courses";
import { formatPrice } from "@/lib/constants/currencies";
import { Join } from "@/lib/joins-data";

interface Course {
    id: string;
    name: string;
    images: string[];
    address: string;
}

export default function ScheduleDatePage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const date = params.date as string;
    const country = searchParams.get("country") || "Vietnam";
    const region = searchParams.get("region") || "Haiphong";

    const [joins, setJoins] = useState<(Join & { course?: Course })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJoins = async () => {
            setLoading(true);
            try {
                // console.log("[SchedulePage] Fetching joins for:", { date, country, region });

                // Use existing getJoins function
                const allJoins = await getJoins();

                // console.log("[SchedulePage] All joins fetched:", allJoins.length);

                // Filter by date and region on client side, sort by time
                const filteredJoins = allJoins
                    .filter((join) =>
                        join.date === date &&
                        join.country === country &&
                        join.region === region
                    )
                    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

                // console.log("[SchedulePage] Filtered joins:", filteredJoins.length);

                // Fetch course details for each join
                const joinsWithCourses = await Promise.all(
                    filteredJoins.map(async (join) => {
                        try {
                            if (join.courseId) {
                                const course = await getCourse(join.courseId);
                                if (course) {
                                    return {
                                        ...join,
                                        course: {
                                            id: course.id,
                                            name: course.name,
                                            images: course.images || [],
                                            address: course.address || "",
                                        },
                                    };
                                }
                            }
                        } catch (e) {
                            console.error(`Failed to fetch course for join ${join.id}`, e);
                        }
                        return join;
                    })
                );

                setJoins(joinsWithCourses);
            } catch (error) {
                console.error("[SchedulePage] Failed to fetch joins:", error);
            } finally {
                setLoading(false);
            }
        };

        if (date) {
            fetchJoins();
        }
    }, [date, country, region]);

    const formattedDate = date ? format(new Date(date), "yyyy년 M월 d일 (EEEE)", { locale: ko }) : "";

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-purple-50/30 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-purple-50/30">
            <div className="container px-4 md:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/?country=${country}&region=${region}`}
                        className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-4"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        캘린더로 돌아가기
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        🗓️ {formattedDate}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        총 {joins.length}개의 조인이 있습니다
                    </p>
                </div>

                {/* Joins List */}
                {joins.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl shadow-lg">
                        <div className="text-6xl mb-4">⛳</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            이 날짜에 조인이 없습니다
                        </h2>
                        <p className="text-gray-500 mb-6">
                            다른 날짜를 확인하거나 커스텀 조인을 요청해보세요!
                        </p>
                        <Link href={`/?country=${country}&region=${region}`}>
                            <Button className="bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full px-6">
                                캘린더로 돌아가기
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {joins.map((join) => (
                            <div
                                key={join.id}
                                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-pink-100"
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Image */}
                                    <div className="relative h-48 md:h-auto md:w-64 shrink-0">
                                        {join.course?.images && join.course.images.length > 0 ? (
                                            <Image
                                                src={join.course.images[0]}
                                                alt={join.course.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                                                <span className="text-4xl">⛳</span>
                                            </div>
                                        )}
                                        <div
                                            className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${join.currentMembers >= join.maxMembers
                                                ? "bg-gray-800 text-white"
                                                : "bg-green-500 text-white"
                                                }`}
                                        >
                                            {join.currentMembers >= join.maxMembers ? "마감" : "모집중"}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {join.course?.name || join.courseName}
                                        </h3>

                                        {join.course?.address && (
                                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                                <MapPin className="w-4 h-4 mr-1" />
                                                <span>{join.course.address}</span>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Clock className="w-4 h-4 mr-2 text-pink-500" />
                                                {join.time}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Users className="w-4 h-4 mr-2 text-pink-500" />
                                                {join.currentMembers}/{join.maxMembers}명
                                            </div>
                                            <div className="flex items-center text-sm font-semibold text-pink-600">
                                                {formatPrice(join.greenFee, country)}~
                                            </div>
                                        </div>

                                        <Link href={`/join/${join.id}?country=${country}&region=${region}`}>
                                            <Button
                                                className={`w-full md:w-auto rounded-full px-8 ${join.currentMembers >= join.maxMembers
                                                    ? "bg-gray-400 cursor-not-allowed"
                                                    : "bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500"
                                                    }`}
                                                disabled={join.currentMembers >= join.maxMembers}
                                            >
                                                {join.currentMembers >= join.maxMembers ? "마감되었습니다" : "상세보기 & 참여하기"}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
