"use client";

import { useEffect, useState } from "react";
import { getCustomRequests, updateCustomRequestStatus } from "@/lib/db/custom-requests";
import { sendNotification } from "@/lib/db/notifications";
import { CustomRequest } from "@/types/custom-features";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { MessageSquare, CheckCircle, Clock, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<CustomRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [replying, setReplying] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        const data = await getCustomRequests();
        setRequests(data);
        setLoading(false);
    };

    const handleReply = async () => {
        if (!selectedRequest || !replyMessage.trim()) return;

        setReplying(true);
        try {
            // 1. Send notification to user
            await sendNotification(
                selectedRequest.userId,
                `[커스텀 라운딩 요청 답변] ${replyMessage}`,
                'reply',
                selectedRequest.id
            );

            // 2. Update request status
            await updateCustomRequestStatus(selectedRequest.id, 'replied', replyMessage);

            // 3. Refresh list
            await fetchRequests();
            setSelectedRequest(null);
            setReplyMessage("");
            toast.success("답변이 전송되었습니다.");
        } catch (error) {
            console.error("Failed to reply:", error);
            toast.error("답변 전송 중 오류가 발생했습니다.");
        } finally {
            setReplying(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">대기중</Badge>;
            case 'replied':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">답변완료</Badge>;
            case 'completed':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">완료됨</Badge>;
            default:
                return <Badge variant="outline">알 수 없음</Badge>;
        }
    };

    if (loading) {
        return <div className="p-8 text-center">로딩 중...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">커스텀 라운딩 요청 관리</h2>
            </div>

            <div className="grid gap-4">
                {requests.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border text-gray-500">
                        요청 내역이 없습니다.
                    </div>
                ) : (
                    requests.map((request) => (
                        <Card key={request.id} className="overflow-hidden">
                            <CardHeader className="bg-gray-50/50 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(request.status)}
                                        <span className="text-sm text-gray-500">
                                            {format(new Date(request.createdAt), "yyyy.MM.dd HH:mm", { locale: ko })}
                                        </span>
                                    </div>
                                    {request.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => setSelectedRequest(request)}>
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                답변하기
                                            </Button>
                                            <Link
                                                href={`/admin/joins/new?courseName=${encodeURIComponent(request.courseName)}&date=${encodeURIComponent(request.date)}&time=${encodeURIComponent(request.time)}&requestId=${request.id}&requesterName=${encodeURIComponent(request.userName)}&requesterEmail=${encodeURIComponent(request.userEmail)}`}
                                            >
                                                <Button size="sm" variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                                                    <CheckSquare className="w-4 h-4 mr-2" />
                                                    조인승인
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                                <CardTitle className="text-lg mt-2 flex items-center gap-2">
                                    {request.courseName}
                                    <span className="text-sm font-normal text-gray-500">
                                        ({request.date} {request.time} / {request.people})
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-1">요청자 정보</h4>
                                        <p className="text-sm">{request.userName} ({request.userEmail})</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-1">추가 요청 사항</h4>
                                        <p className="text-sm whitespace-pre-wrap">{request.memo || "-"}</p>
                                    </div>
                                </div>
                                {request.replyMessage && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                                        <h4 className="text-sm font-medium text-gray-900 mb-1 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            보낸 답변
                                        </h4>
                                        <p className="text-sm text-gray-600">{request.replyMessage}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>답변 보내기</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                            <p className="font-medium mb-1">요청 내용 요약</p>
                            <p>{selectedRequest?.courseName} / {selectedRequest?.date} {selectedRequest?.time}</p>
                            <p className="text-gray-500 mt-1">{selectedRequest?.memo}</p>
                        </div>
                        <Textarea
                            placeholder="회원님께 보낼 답변을 입력하세요."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            rows={5}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedRequest(null)}>취소</Button>
                        <Button onClick={handleReply} disabled={replying || !replyMessage.trim()} className="bg-red-600 hover:bg-red-700">
                            {replying ? "전송 중..." : "답변 전송"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
