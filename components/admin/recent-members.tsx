"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecentUsers, UserProfile } from "@/lib/db/users";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export function RecentMembers() {
    const [members, setMembers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const data = await getRecentUsers(5);
                setMembers(data);
            } catch (error) {
                console.error("Error fetching recent members:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    if (loading) {
        return (
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>최근 가입 회원</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-full lg:col-span-3">
            <CardHeader>
                <CardTitle>최근 가입 회원</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {members.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            최근 가입한 회원이 없습니다.
                        </div>
                    ) : (
                        members.map((member) => (
                            <div key={member.uid} className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{member.nickname}</p>
                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                </div>
                                <div className="ml-auto font-medium text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(member.createdAt), { addSuffix: true, locale: ko })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
