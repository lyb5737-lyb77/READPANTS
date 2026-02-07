'use client';

import { useState, useEffect } from 'react';
import { getCourses } from '@/lib/db/courses';
import { Course } from '@/lib/courses-data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, MapPin, Pencil, Trash, Loader2, Globe } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Region {
    country: string;
    region: string;
    label: string;
}

export default function GolfCourseListPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [regions, setRegions] = useState<Region[]>([]);
    const [selectedCountry, setSelectedCountry] = useState('Vietnam');
    const [selectedRegion, setSelectedRegion] = useState('Haiphong');

    // 지역 목록 가져오기
    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const regionsSnapshot = await getDocs(collection(db, 'regions'));
                const fetchedRegions: Region[] = [];
                regionsSnapshot.forEach((doc) => {
                    const data = doc.data();
                    fetchedRegions.push({
                        country: data.country,
                        region: data.region,
                        label: data.label,
                    });
                });
                setRegions(fetchedRegions);
            } catch (error) {
                console.error("Error fetching regions:", error);
            }
        };
        fetchRegions();
    }, []);

    // 골프장 목록 가져오기
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

    // 선택된 지역으로 필터링
    useEffect(() => {
        const filtered = courses.filter(
            course => course.country === selectedCountry && course.region === selectedRegion
        );
        setFilteredCourses(filtered);
    }, [courses, selectedCountry, selectedRegion]);

    // 국가별 지역 목록
    const countries = [...new Set(regions.map(r => r.country))];
    const regionsByCountry = regions.filter(r => r.country === selectedCountry);

    const handleCountryChange = (country: string) => {
        setSelectedCountry(country);
        // 국가 변경 시 첫 번째 지역 자동 선택
        const firstRegion = regions.find(r => r.country === country);
        if (firstRegion) {
            setSelectedRegion(firstRegion.region);
        }
    };

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

            {/* 지역 필터 */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">지역 선택:</span>
                        </div>
                        <Select value={selectedCountry} onValueChange={handleCountryChange}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="국가 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map(country => (
                                    <SelectItem key={country} value={country}>
                                        {country === 'Vietnam' ? '🇻🇳 베트남' :
                                            country === 'Thailand' ? '🇹🇭 태국' : country}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="지역 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {regionsByCountry.map(r => (
                                    <SelectItem key={r.region} value={r.region}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-500">
                            총 <strong className="text-red-600">{filteredCourses.length}</strong>개 골프장
                        </span>
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">
                        {selectedCountry} - {selectedRegion} 지역에 등록된 골프장이 없습니다.
                    </p>
                    <Link href="/admin/resources/new">
                        <Button variant="outline">골프장 등록하기</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCourses.map((course) => (
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
                                <div className="flex items-center text-sm text-gray-500 gap-2 flex-wrap">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                                        {course.country} · {course.region}
                                    </span>
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
