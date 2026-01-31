import Link from "next/link";
import Image from "next/image";
import { getCourses } from "@/lib/db/courses";
import { Course } from "@/lib/courses-data";
import { MapPin, Flag, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CoursesPage({
    searchParams,
}: {
    searchParams: Promise<{ country?: string; region?: string }>;
}) {
    const params = await searchParams;
    const country = params.country || 'Thailand';
    const region = params.region || 'Pattaya';

    let courses: Course[] = [];
    try {
        const allCourses = await getCourses();
        // Filter by selected region
        courses = allCourses.filter(
            (course) => course.country === country && course.region === region
        );
    } catch (error) {
        console.error("Failed to fetch courses:", error);
        // In a real app, we might want to show an error message UI here
    }
    return (
        <div className="container py-12 px-4 md:px-6">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                    제휴 골프장 소개
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    빨간바지 솔로 골프가 엄선한 {region} 지역의 명문 골프장을 소개합니다.
                </p>
            </div>

            {courses.length === 0 ? (
                <div className="col-span-full text-center py-20">
                    <p className="text-xl text-gray-500">등록된 골프장이 없습니다.</p>
                    <p className="text-gray-400 mt-2">관리자 페이지에서 데이터를 업로드해주세요.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <div key={course.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden border hover:shadow-xl transition-all duration-300">
                            {/* Image Section */}
                            <div className="relative h-64 w-full bg-gray-200 overflow-hidden">
                                {course.images.length > 0 ? (
                                    <Image
                                        src={course.images[0]}
                                        alt={course.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <span className="text-sm">이미지 준비중</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            {/* Content Section */}
                            <div className="flex flex-col flex-1 p-6">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
                                        {course.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">{course.englishName}</p>
                                </div>

                                <div className="space-y-2 mb-6 flex-1">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Flag className="h-4 w-4 mr-2 text-red-500" />
                                        <span>{course.holeCount || "정보 없음"}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Ruler className="h-4 w-4 mr-2 text-blue-500" />
                                        <span>{course.length || "정보 없음"}</span>
                                    </div>
                                    <div className="flex items-start text-sm text-gray-600">
                                        <MapPin className="h-4 w-4 mr-2 text-green-500 mt-0.5 shrink-0" />
                                        <span className="line-clamp-2">{course.address || "주소 정보 없음"}</span>
                                    </div>
                                </div>

                                <Link href={`/courses/${course.id}?country=${country}&region=${region}`} className="w-full">
                                    <Button className="w-full bg-gray-900 hover:bg-red-600 transition-colors">
                                        상세 정보 보기
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
