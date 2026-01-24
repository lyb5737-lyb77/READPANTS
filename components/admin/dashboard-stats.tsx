"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, MapPin, TrendingUp, Loader2 } from "lucide-react";
import { getUsersCount } from "@/lib/db/users";
import { getActiveJoinsCount } from "@/lib/db/joins";
import { getCoursesCount } from "@/lib/db/courses";

export function DashboardStats() {
    const [stats, setStats] = useState({
        users: 0,
        activeJoins: 0,
        courses: 0,
        revenue: 0 // Placeholder for now
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [users, activeJoins, courses] = await Promise.all([
                    getUsersCount(),
                    getActiveJoinsCount(),
                    getCoursesCount()
                ]);
                setStats({ users, activeJoins, courses, revenue: 12450 });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">총 회원수</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.users.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">전체 등록 회원</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">활성 조인</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.activeJoins.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">현재 모집 중</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">등록 골프장</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.courses.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">전체 등록 골프장</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">이번 달 매출</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">지난달 대비 +8% (예시)</p>
                </CardContent>
            </Card>
        </div>
    );
}
