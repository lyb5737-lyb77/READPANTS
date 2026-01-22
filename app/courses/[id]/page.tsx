import { getCourse } from "@/lib/db/courses";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Flag, Ruler, User, ArrowLeft } from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
    const { id } = await params;
    const course = await getCourse(id);

    if (!course) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Hero Section */}
            <div className="relative h-[50vh] w-full bg-gray-900">
                {course.images.length > 0 ? (
                    <Image
                        src={course.images[0]}
                        alt={course.name}
                        fill
                        className="object-cover opacity-60"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        이미지 없음
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
                    <div className="container mx-auto">
                        <Link
                            href="/courses"
                            className="inline-flex items-center text-sm text-gray-300 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            목록으로 돌아가기
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">{course.name}</h1>
                        <p className="text-xl text-gray-300 font-light">{course.englishName}</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Course Info Grid */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <span className="w-1 h-8 bg-red-600 mr-3 rounded-full"></span>
                                코스 정보
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-4">
                                        <Flag className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">홀 수</p>
                                        <p className="font-semibold text-gray-900">{course.holeCount || "정보 없음"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                                        <Ruler className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">전장</p>
                                        <p className="font-semibold text-gray-900">{course.length || "정보 없음"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">디자이너</p>
                                        <p className="font-semibold text-gray-900">{course.designer || "정보 없음"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-4">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">위치</p>
                                        <p className="font-semibold text-gray-900 line-clamp-1">{course.address || "정보 없음"}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Description */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <span className="w-1 h-8 bg-red-600 mr-3 rounded-full"></span>
                                골프장 소개
                            </h2>
                            <div className="prose max-w-none text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-2xl">
                                {course.address ? (
                                    <p>{course.address}</p>
                                ) : (
                                    <p>상세 설명이 준비 중입니다.</p>
                                )}
                            </div>
                        </section>

                        {/* Gallery */}
                        {course.images.length > 1 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 flex items-center">
                                    <span className="w-1 h-8 bg-red-600 mr-3 rounded-full"></span>
                                    갤러리
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {course.images.slice(1).map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                                            <Image
                                                src={img}
                                                alt={`${course.name} gallery ${idx + 1}`}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white border rounded-2xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold mb-4">라운딩 예약하기</h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                혼자라도 괜찮습니다. 검증된 동반자와 함께 즐거운 라운딩을 즐겨보세요.
                            </p>

                            <div className="space-y-3">
                                <Link href={`/join?course=${course.id}`} className="block w-full">
                                    <Button className="w-full h-12 text-lg bg-red-600 hover:bg-red-700">
                                        조인 신청하기
                                    </Button>
                                </Link>
                                <Button variant="outline" className="w-full h-12">
                                    1:1 문의하기
                                </Button>
                            </div>

                            <hr className="my-6" />

                            <div className="text-xs text-gray-400">
                                <p className="mb-2">• 예약 확정 후 카카오톡으로 알림이 발송됩니다.</p>
                                <p>• 우천 시 취소 규정은 골프장 정책을 따릅니다.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
