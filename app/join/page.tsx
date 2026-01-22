"use client";

import { useState, useEffect } from "react";
import { getJoins } from "@/lib/db/joins";
import { getCourses } from "@/lib/db/courses";
import { Join } from "@/lib/joins-data";
import { Course } from "@/lib/courses-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, Filter, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function JoinPage() {
    const [selectedCourse, setSelectedCourse] = useState<string>("all");
    const [joins, setJoins] = useState<Join[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [joinsData, coursesData] = await Promise.all([
                    getJoins(),
                    getCourses()
                ]);
                setJoins(joinsData);
                setCourses(coursesData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredJoins = selectedCourse === "all"
        ? joins
        : joins.filter(join => join.courseId === selectedCourse);

    return (
        <div className="container py-12 px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                        실시간 조인
                    </h1>
                    <p className="text-gray-600">
                        원하는 날짜와 골프장을 선택하여 새로운 골프 친구를 만나보세요.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 text-gray-700 font-medium min-w-fit">
                    <Filter className="h-5 w-5" />
                    <span>필터 검색</span>
                </div>
                <div className="w-full md:w-auto flex-1">
                    <select
                        className="w-full p-2 border rounded-md text-sm"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                        <option value="all">모든 골프장</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </select>
                </div>
                {/* Date picker could go here */}
            </div>

            {/* Join List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredJoins.map((join) => (
                    <div key={join.id} className="bg-white rounded-xl border hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col sm:flex-row">
                        {/* Left Status Bar */}
                        <div className={cn(
                            "w-full sm:w-2 h-2 sm:h-auto",
                            join.status === "open" ? "bg-green-500" :
                                join.status === "full" ? "bg-gray-400" : "bg-red-500"
                        )} />

                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-bold",
                                        join.status === "open" ? "bg-green-100 text-green-700" :
                                            join.status === "full" ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-700"
                                    )}>
                                        {join.status === "open" ? "모집중" :
                                            join.status === "full" ? "마감" : "종료"}
                                    </span>
                                    <span className="text-sm text-gray-500 flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        등록일: 2026.01.21
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">{join.courseName}</h3>

                                <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-red-500" />
                                        {join.date} {join.time}
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-2 text-blue-500" />
                                        {join.currentMembers} / {join.maxMembers}명
                                    </div>
                                    <div className="col-span-2 flex items-center">
                                        <span className="font-semibold mr-2">그린피:</span> {join.greenFee.toLocaleString()}바트
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                                    <span className="font-bold text-gray-900 mr-2">{join.hostName}</span>
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200">{join.hostLevel}</span>
                                    <p className="mt-1 line-clamp-1">{join.description}</p>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <Link href={`/join/${join.id}`} className="flex-1">
                                    <Button className="w-full" disabled={join.status !== "open"}>
                                        {join.status === "open" ? "참여 신청" : "모집 마감"}
                                    </Button>
                                </Link>
                                <Link href={`/courses/${join.courseId}`}>
                                    <Button variant="outline">골프장 정보</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredJoins.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed">
                    <p className="text-gray-500 text-lg">해당 조건의 조인이 없습니다.</p>
                    <Button variant="link" onClick={() => setSelectedCourse("all")}>
                        전체 목록 보기
                    </Button>
                </div>
            )}
        </div>
    );
}
