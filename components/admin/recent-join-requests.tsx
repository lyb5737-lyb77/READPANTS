"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecentParticipants, JoinParticipant } from "@/lib/db/participants";
import { getJoin } from "@/lib/db/joins";
import { Loader2, User, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface JoinParticipantWithDetails extends JoinParticipant {
    courseName?: string;
    date?: string;
}

export function RecentJoinRequests() {
    const [requests, setRequests] = useState<JoinParticipantWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const participants = await getRecentParticipants(5);

                // Fetch join details for each participant
                const requestsWithDetails = await Promise.all(
                    participants.map(async (p) => {
                        try {
                            const join = await getJoin(p.joinId);
                            return {
                                ...p,
                                courseName: join?.courseName,
                                date: join?.date
                            };
                        } catch (e) {
                            return p;
                        }
                    })
                );

                setRequests(requestsWithDetails);
            } catch (error) {
                console.error("Error fetching recent requests:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    if (loading) {
        return (
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>최근 조인 신청 현황</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-full lg:col-span-4">
            <CardHeader>
                <CardTitle>최근 조인 신청 현황</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            최근 신청 내역이 없습니다.
                        </div>
                    ) : (
                        requests.map((req) => (
                            <Link href={`/admin/joins/${req.joinId}`} key={`${req.joinId}_${req.userId}`} className="block hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-red-50 p-2 rounded-full h-fit">
                                            <User className="h-4 w-4 text-red-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-sm text-gray-900">{req.courseName || "알 수 없는 골프장"}</span>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex items-center">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {req.date}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium leading-none text-gray-700">
                                                신청자: {req.userName} <span className="text-gray-400 font-normal">({req.userEmail})</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right min-w-[80px]">
                                        <div className="text-xs text-gray-500 mb-1">
                                            {formatDistanceToNow(new Date(req.appliedAt), { addSuffix: true, locale: ko })}
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${req.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {req.status === 'approved' ? '승인됨' :
                                                req.status === 'rejected' ? '거절됨' : '대기중'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
