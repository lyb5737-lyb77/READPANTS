'use client';

import { useState, useEffect } from 'react';
import { getCourses } from '@/lib/db/courses';
import { Course } from '@/lib/courses-data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, MapPin, MoreHorizontal, Pencil, Trash, Loader2 } from 'lucide-react';

export default function GolfCourseListPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await getCourses();
                setCourses(data);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">골프장 관리</h2>
                    <p className="text-muted-foreground">
                        등록된 골프장 목록을 조회하고 관리합니다.
                    </p>
                </div>
                <Link href="/admin/resources/new">
                    <Button className="gap-2 bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4" />
                        골프장 등록
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>
            ) : courses.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">등록된 골프장이 없습니다.</p>
                    <Link href="/admin/resources/new">
                        <Button variant="outline">첫 번째 골프장 등록하기</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            {course.images && course.images.length > 0 ? (
                                <div className="aspect-video w-full bg-gray-100 relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={course.images[0]}
                                        alt={course.name}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video w-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    이미지 없음
                                </div>
                            )}
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-lg line-clamp-1">{course.name}</CardTitle>
                                <CardDescription className="line-clamp-1">{course.englishName}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-2 space-y-3">
                                <div className="flex items-center text-sm text-gray-500 gap-2">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">
                                        {course.holeCount}홀
                                    </span>
                                    {course.address && (
                                        <span className="flex items-center gap-1 line-clamp-1">
                                            <MapPin className="w-3 h-3" />
                                            {course.address.split(' ').slice(0, 2).join(' ')}...
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-2 border-t mt-2">
                                    <Link href={`/admin/resources/${course.id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full gap-1">
                                            <Pencil className="w-3 h-3" /> 수정
                                        </Button>
                                    </Link>
                                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                        <Trash className="w-3 h-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
