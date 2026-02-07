'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar, Users, MapPin, Loader2 } from 'lucide-react';
import { getJoins } from '@/lib/db/joins';
import { getCourse } from '@/lib/db/courses';
import { Join } from '@/lib/joins-data';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

interface JoinWithCourse extends Join {
    // courseName is already in Join
}

export default function JoinCalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [joins, setJoins] = useState<JoinWithCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJoins = async () => {
            setLoading(true);
            try {
                const allJoins = await getJoins();

                // 각 조인에 골프장 이름 추가
                const joinsWithCourse = await Promise.all(
                    allJoins.map(async (join) => {
                        const course = await getCourse(join.courseId);
                        return {
                            ...join,
                            courseName: course?.name || join.courseName || '알 수 없음'
                        };
                    })
                );

                setJoins(joinsWithCourse);
            } catch (error) {
                console.error('Error fetching joins:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJoins();
    }, []);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // 달력 시작을 일요일로 맞추기 위한 빈 칸
    const startDay = monthStart.getDay();
    const emptyDays = Array(startDay).fill(null);

    // 날짜별 조인 그룹화
    const getJoinsForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return joins.filter(join => join.date === dateStr);
    };

    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-red-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Calendar className="w-8 h-8 text-red-600" />
                        조인 캘린더
                    </h2>
                    <p className="text-muted-foreground">
                        월별 조인 진행 현황을 한눈에 확인하고 조 편성을 관리합니다.
                    </p>
                </div>
            </div>

            {/* 월 네비게이션 */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={prevMonth}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={nextMonth}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                            <h3 className="text-xl font-bold ml-2">
                                {format(currentDate, 'yyyy년 M월', { locale: ko })}
                            </h3>
                        </div>
                        <Button variant="outline" size="sm" onClick={goToToday}>
                            오늘
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* 요일 헤더 */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map((day, index) => (
                            <div
                                key={day}
                                className={`text-center text-sm font-medium py-2 ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
                                    }`}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* 캘린더 그리드 */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* 빈 칸 */}
                        {emptyDays.map((_, index) => (
                            <div key={`empty-${index}`} className="min-h-[120px] bg-gray-50 rounded-lg" />
                        ))}

                        {/* 날짜 칸 */}
                        {daysInMonth.map((day) => {
                            const dayJoins = getJoinsForDate(day);
                            const dayOfWeek = day.getDay();

                            return (
                                <Link
                                    key={day.toISOString()}
                                    href={`/admin/calendar/${format(day, 'yyyy-MM-dd')}`}
                                    className="block"
                                >
                                    <div
                                        className={`min-h-[120px] p-2 rounded-lg border transition-all hover:shadow-md hover:border-red-300 cursor-pointer ${isToday(day)
                                            ? 'bg-red-50 border-red-300'
                                            : dayJoins.length > 0
                                                ? 'bg-white border-gray-200'
                                                : 'bg-gray-50 border-transparent'
                                            }`}
                                    >
                                        {/* 날짜 */}
                                        <div className={`text-sm font-medium mb-1 ${isToday(day)
                                            ? 'text-red-600'
                                            : dayOfWeek === 0
                                                ? 'text-red-500'
                                                : dayOfWeek === 6
                                                    ? 'text-blue-500'
                                                    : 'text-gray-700'
                                            }`}>
                                            {format(day, 'd')}
                                            {isToday(day) && (
                                                <span className="ml-1 text-xs bg-red-600 text-white px-1 rounded">오늘</span>
                                            )}
                                        </div>

                                        {/* 조인 정보 */}
                                        {dayJoins.length > 0 && (
                                            <div className="space-y-1">
                                                {dayJoins.slice(0, 2).map((join) => (
                                                    <div
                                                        key={join.id}
                                                        className="text-xs bg-white border rounded p-1 shadow-sm"
                                                    >
                                                        <div className="font-medium text-gray-800 truncate flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                            {join.courseName}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-gray-500">
                                                            <Users className="w-3 h-3" />
                                                            <span>{join.currentMembers || 0}/{join.maxMembers}명</span>
                                                            <span className="text-gray-300">|</span>
                                                            <span>{join.time}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {dayJoins.length > 2 && (
                                                    <div className="text-xs text-gray-500 text-center">
                                                        +{dayJoins.length - 2}개 더보기
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* 범례 */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-50 border border-red-300 rounded" />
                    <span>오늘</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-gray-200 rounded" />
                    <span>조인 있음</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-50 rounded" />
                    <span>조인 없음</span>
                </div>
            </div>
        </div>
    );
}
