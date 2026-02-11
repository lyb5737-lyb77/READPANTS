import Link from "next/link";
import Image from "next/image";
import { getJoins } from "@/lib/db/joins";
import { getCourse, getCourses } from "@/lib/db/courses";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CustomRequestCard } from "@/components/home/custom-request-card";
import { formatPrice } from "@/lib/constants/currencies";

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RecentJoins({
    country = 'Vietnam',
    region = 'Haiphong',
}: {
    country?: string;
    region?: string;
}) {
    let joinsWithCourse: any[] = [];

    try {
        const allJoins = await getJoins(undefined, 100);

        const filteredJoins = allJoins.filter((join) => {
            return join.country === country && join.region === region;
        }).slice(0, 7);

        joinsWithCourse = await Promise.all(
            filteredJoins.map(async (join) => {
                try {
                    const course = await getCourse(join.courseId);
                    const dDay = Math.ceil((new Date(join.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return { ...join, course, dDay };
                } catch (e) {
                    console.error(`Failed to fetch course for join ${join.id}`, e);
                    const dDay = Math.ceil((new Date(join.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return { ...join, course: null, dDay };
                }
            })
        );
    } catch (error) {
        console.error("Failed to fetch recent joins:", error);
        return null;
    }

    if (joinsWithCourse.length === 0) {
        return null;
    }

    let courses: any[] = [];
    try {
        courses = await getCourses();
    } catch (error) {
        console.error("Failed to fetch courses:", error);
    }

    return (
        <section className="py-20 bg-gray-50">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                        마감 임박 <span className="text-red-600">골프 조인</span>
                    </h2>
                    <p className="text-lg text-gray-600">
                        지금 바로 참여 가능한 인기 라운딩을 확인하세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <CustomRequestCard courses={courses} />
                    {joinsWithCourse.map((join) => (
                        <div key={join.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                            {/* Image Section */}
                            <div className="relative h-48 w-full bg-gray-200 overflow-hidden shrink-0">
                                {join.course?.images && join.course.images.length > 0 ? (
                                    <Image
                                        src={join.course.images[0]}
                                        alt={join.course.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
                                        <span className="text-sm">이미지 없음</span>
                                    </div>
                                )}
                                <div className={`absolute top-4 right-4 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm ${join.dDay < 0 ? "bg-gray-800/90 text-white" : "bg-white/90 text-red-600"}`}>
                                    {join.dDay < 0 ? "마감" : join.dDay === 0 ? "D-Day" : `D-${join.dDay}`}
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-6 flex flex-col flex-1">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1">
                                        {join.course?.name || "골프장 정보 없음"}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        <span className="line-clamp-1">{join.course?.address?.split(" ").slice(0, 2).join(" ") || "위치 정보 없음"}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-gray-600">
                                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                            {format(new Date(join.date), "M월 d일 (EEE)", { locale: ko })}
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                            {join.time}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-gray-600">
                                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                                            {join.currentMembers}/{join.maxMembers}명
                                        </div>
                                        <div className="font-bold text-red-600">
                                            {formatPrice(join.greenFee, country)}~
                                        </div>
                                    </div>
                                </div>

                                <Link href={`/join/${join.id}?country=${country}&region=${region}`} className="block mt-auto">
                                    <Button className="w-full bg-gray-900 hover:bg-red-600 transition-colors">
                                        참여하기
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link href={`/join?country=${country}&region=${region}`}>
                        <Button variant="outline" size="lg" className="rounded-full px-8">
                            더 많은 조인 보기
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
