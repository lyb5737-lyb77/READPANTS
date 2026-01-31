"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { getQuote, Quote, replyQuote, VEHICLE_TYPES } from "@/lib/db/quotes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User, Info, CheckCircle2, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export default function QuoteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, userProfile } = useAuthStore();
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);

    // Admin Reply State
    const [replyContent, setReplyContent] = useState("");
    const [price, setPrice] = useState<number | string>("");
    const [replyLoading, setReplyLoading] = useState(false);

    useEffect(() => {
        const fetchQuoteDetails = async () => {
            if (!params.id) return;
            try {
                const data = await getQuote(params.id as string);
                setQuote(data);

                // Pre-fill if exists
                if (data?.adminComment) {
                    setReplyContent(data.adminComment.content);
                    setPrice(data.adminComment.price || "");
                }
            } catch (error) {
                console.error("Failed to fetch quote:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuoteDetails();
    }, [params.id]);

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" /></div>;
    if (!quote) return <div className="text-center py-20">존재하지 않는 게시물입니다.</div>;

    // Permission Check
    const isAuthor = user?.uid === quote.userId;
    const isAdmin = userProfile?.role === 'admin';

    if (!isAuthor && !isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Info className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">비공개 게시물입니다</h2>
                <p className="text-gray-500">작성자와 관리자만 확인할 수 있습니다.</p>
                <Button onClick={() => router.push("/quotes")}>목록으로 돌아가기</Button>
            </div>
        );
    }

    const vehicleLabel = VEHICLE_TYPES.find(v => v.value === quote.vehicleType)?.label || quote.vehicleType;

    const handleAdminReply = async () => {
        if (!replyContent.trim()) {
            alert("답변 내용을 입력해주세요.");
            return;
        }

        setReplyLoading(true);
        try {
            await replyQuote(quote.id, replyContent, Number(price) || 0);

            // Refresh local state roughly
            setQuote(prev => prev ? ({
                ...prev,
                status: 'replied',
                adminComment: {
                    content: replyContent,
                    price: Number(price) || 0,
                    repliedAt: new Date().toISOString()
                }
            }) : null);

            alert("답변이 등록되었습니다.");
        } catch (e) {
            console.error(e);
            alert("오류가 발생했습니다.");
        } finally {
            setReplyLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container max-w-3xl px-4">
                <div className="mb-6 flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/quotes")} className="-ml-2 text-gray-500">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        목록으로
                    </Button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-900 text-white p-6 md:p-8">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-medium mb-3 backdrop-blur-sm">
                                    {quote.country} / {quote.region}
                                </span>
                                <h1 className="text-2xl font-bold mb-2">여행 견적 요청합니다</h1>
                                <div className="flex items-center gap-3 text-gray-400 text-sm">
                                    <div className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        {quote.authorName}
                                    </div>
                                    <span>•</span>
                                    <span>{formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true, locale: ko })}</span>
                                </div>
                            </div>
                            {/* Status Badge */}
                            {quote.status === 'replied' ? (
                                <div className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    답변 완료
                                </div>
                            ) : (
                                <div className="bg-white/10 text-white px-4 py-2 rounded-xl font-medium text-sm border border-white/20">
                                    답변 대기중
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 md:p-8 space-y-8">
                        {/* Summary Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl">
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 mb-2">희망 차량</h4>
                                <p className="text-lg font-bold text-gray-900">{vehicleLabel}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 mb-2">희망 숙소</h4>
                                <p className="text-lg font-bold text-gray-900">{quote.accommodation}</p>
                            </div>
                            <div className="md:col-span-2 border-t pt-4">
                                <h4 className="text-sm font-bold text-gray-500 mb-2">희망 골프장</h4>
                                <div className="flex flex-wrap gap-2">
                                    {quote.golfCourses.length > 0 ? quote.golfCourses.map((course, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-white border rounded-lg text-sm font-medium text-gray-700">
                                            {course}
                                        </span>
                                    )) : <span className="text-gray-400">선택 안함</span>}
                                </div>
                            </div>
                        </div>

                        {/* Full Itinerary */}
                        <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-red-600 pl-3">세부 일정 및 요청사항</h4>
                            <div className="prose prose-gray max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed bg-white">
                                {quote.content}
                            </div>
                        </div>

                        {/* Divider */}
                        <hr className="border-gray-100" />

                        {/* Admin Answer Section */}
                        {(isAdmin || quote.adminComment) && (
                            <div className="bg-red-50/50 p-6 md:p-8 rounded-2xl border border-red-100">
                                <div className="flex items-center gap-2 mb-6">
                                    <DollarSign className="w-6 h-6 text-red-600" />
                                    <h3 className="text-xl font-bold text-gray-900">관리자 견적 답변</h3>
                                </div>

                                {isAdmin ? (
                                    /* Admin Edit Mode */
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 mb-1 block">예상 견적 금액 (선택)</label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={price}
                                                    onChange={(e) => setPrice(e.target.value)}
                                                    className="pl-8 font-bold text-lg"
                                                />
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₩</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 mb-1 block">답변 내용</label>
                                            <Textarea
                                                placeholder="상세 견적 내용을 입력해주세요."
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                className="min-h-[150px] bg-white"
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <Button
                                                onClick={handleAdminReply}
                                                disabled={replyLoading}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                {replyLoading ? "등록 중..." : "답변 등록/수정"}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    /* User View Mode */
                                    <div className="space-y-6">
                                        {quote.adminComment?.price ? (
                                            <div className="flex items-end gap-2 text-2xl font-bold text-red-600">
                                                <span>{quote.adminComment.price.toLocaleString()}</span>
                                                <span className="text-base font-medium text-gray-500 mb-1">원 (예상)</span>
                                            </div>
                                        ) : null}
                                        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed bg-white p-4 rounded-xl border border-red-100">
                                            {quote.adminComment?.content}
                                        </div>
                                        <p className="text-xs text-gray-400 text-right">
                                            답변일: {formatDistanceToNow(new Date(quote.adminComment?.repliedAt || ""), { addSuffix: true, locale: ko })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
