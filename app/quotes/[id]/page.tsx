"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { getQuote, Quote, replyQuote } from "@/lib/db/quotes";
import { getAccommodation } from "@/lib/db/accommodations"; // Added import
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User, CheckCircle2, DollarSign, Calendar, Plane, Users, Home, Flag } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { ko } from "date-fns/locale";

export default function QuoteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, userProfile } = useAuthStore();
    const [quote, setQuote] = useState<Quote | null>(null);
    const [accommodationName, setAccommodationName] = useState<string>("로딩 중..."); // Added state
    const [loading, setLoading] = useState(true);

    // Admin Reply State
    const [replyContent, setReplyContent] = useState("");
    const [price, setPrice] = useState<number | string>("");
    const [replyLoading, setReplyLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Added state

    useEffect(() => {
        const fetchQuoteDetails = async () => {
            if (!params.id) return;
            try {
                const data = await getQuote(params.id as string);
                setQuote(data);

                if (data) {
                    if (data.accommodationType === 'direct') {
                        setAccommodationName("직접 예약");
                    } else {
                        const acc = await getAccommodation(data.accommodationType);
                        setAccommodationName(acc ? acc.name : "알 수 없는 숙소");
                    }

                    // Set initial editing state: true if not replied/completed, false otherwise
                    setIsEditing(data.status !== 'replied' && data.status !== 'completed' && data.status !== 'payment_pending');
                }

                if (data?.adminComment) {
                    setReplyContent(data.adminComment.content);
                    setPrice(data.adminComment.price || "");
                }

                // If there's a totalAmount field, use it as default price if not set in adminComment
                if (data?.totalAmount && (!data.adminComment || !data.adminComment.price)) {
                    setPrice(data.totalAmount);
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
                    <User className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">비공개 게시물입니다</h2>
                <p className="text-gray-500">작성자와 관리자만 확인할 수 있습니다.</p>
                <Button onClick={() => router.push("/quotes")}>목록으로 돌아가기</Button>
            </div>
        );
    }

    const handleAdminReply = async () => {
        if (!replyContent.trim()) {
            toast.warning("답변 내용을 입력해주세요.");
            return;
        }

        setReplyLoading(true);
        try {
            const numericPrice = Number(price) || 0;
            await replyQuote(quote.id, replyContent, numericPrice);

            setQuote(prev => prev ? ({
                ...prev,
                status: 'replied',
                totalAmount: numericPrice,
                adminComment: {
                    content: replyContent,
                    price: numericPrice,
                    repliedAt: new Date().toISOString()
                }
            }) : null);

            toast.success("답변이 등록되었습니다.");
            router.push("/admin/quotes");
        } catch (e) {
            console.error(e);
            toast.error("오류가 발생했습니다.");
        } finally {
            setReplyLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container max-w-4xl px-4">
                <div className="mb-6 flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/quotes")} className="-ml-2 text-gray-500">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        목록으로
                    </Button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-900 text-white p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-medium mb-3 backdrop-blur-sm">
                                    {quote.country} / {quote.region}
                                </span>
                                <h1 className="text-2xl font-bold mb-2">여행 견적 요청서</h1>
                                <div className="flex items-center gap-3 text-gray-400 text-sm">
                                    <div className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        {quote.authorName} ({quote.userPhone})
                                    </div>
                                    <span>•</span>
                                    <span>{formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true, locale: ko })}</span>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div>
                                {quote.status === 'replied' || quote.status === 'completed' || quote.status === 'payment_pending' ? (
                                    <div className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        답변 완료
                                    </div>
                                ) : (
                                    <div className="bg-white/10 text-white px-4 py-2 rounded-xl font-medium text-sm border border-white/20 text-center">
                                        답변 대기중
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 md:p-8 space-y-8">
                        {/* 1. Basic Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Dates */}
                            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-500 shrink-0">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 mb-1">여행 일정</h4>
                                    <p className="font-bold text-gray-900">
                                        {quote.startDate && format(new Date(quote.startDate), "yyyy.MM.dd")} ~ {quote.endDate && format(new Date(quote.endDate), "yyyy.MM.dd")}
                                    </p>
                                    <span className="text-sm text-gray-500">{quote.nights}박 {quote.days}일</span>
                                </div>
                            </div>

                            {/* Pax */}
                            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-500 shrink-0">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 mb-1">인원</h4>
                                    <p className="font-bold text-gray-900">
                                        총 {Number(quote.numberOfMen) + Number(quote.numberOfWomen)}명
                                    </p>
                                    <span className="text-sm text-gray-500">남 {quote.numberOfMen}명, 여 {quote.numberOfWomen}명</span>
                                </div>
                            </div>

                            {/* Airport & Pickup */}
                            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-500 shrink-0">
                                    <Plane className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 mb-1">공항 및 픽업</h4>
                                    <p className="font-bold text-gray-900">
                                        {quote.arrivalAirport === 'HAN' ? '하노이 (노이바이)' : '하이퐁 (깟비)'}
                                    </p>
                                    <span className="text-sm text-gray-500">
                                        {quote.pickupService === 'none' && '픽업 없음'}
                                        {quote.pickupService === 'pickup' && '픽업만 요청'}
                                        {quote.pickupService === 'sending' && '샌딩만 요청'}
                                        {quote.pickupService === 'roundtrip' && '왕복 요청'}
                                    </span>
                                </div>
                            </div>

                            {/* Accommodation */}
                            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-500 shrink-0">
                                    <Home className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 mb-1">숙소</h4>
                                    <p className="font-bold text-gray-900">
                                        {accommodationName}
                                    </p>
                                    {quote.roomType ? (
                                        <span className="text-sm text-gray-500">{quote.roomType}</span>
                                    ) : (
                                        <span className="text-sm text-gray-400">객실 정보 없음</span>
                                    )}
                                </div>
                            </div>

                            {/* Golf & Payment */}
                            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl md:col-span-2">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-500 shrink-0">
                                    <Flag className="w-5 h-5" />
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-500 mb-1">골프 라운딩</h4>
                                        <p className="font-bold text-gray-900">{quote.golfRounds}회</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-500 mb-1">결제 방식</h4>
                                        <p className="font-bold text-gray-900">
                                            {quote.paymentMethod === 'onsite' ? '체크인 시 결제' : '온라인 전액 결제'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Full Itinerary */}
                        <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-red-600 pl-3">추가 요청사항</h4>
                            <div className="prose prose-gray max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed bg-white p-4 border rounded-xl">
                                {quote.content || "추가 요청사항이 없습니다."}
                            </div>
                        </div>

                        {/* Divider */}
                        <hr className="border-gray-100" />

                        {/* Admin Answer Section */}
                        {(isAdmin || quote.status === 'replied' || quote.status === 'completed' || quote.status === 'payment_pending') && (
                            <div className="bg-red-50/50 p-6 md:p-8 rounded-2xl border border-red-100">
                                <div className="flex items-center gap-2 mb-6">
                                    <DollarSign className="w-6 h-6 text-red-600" />
                                    <h3 className="text-xl font-bold text-gray-900">견적서 (관리자 답변)</h3>
                                </div>

                                {isAdmin && isEditing ? (
                                    /* Admin Edit Mode */
                                    <div className="space-y-4">
                                        <div className="flex justify-end mb-2">
                                            {/* Cancel Editing Button (only if already replied) */}
                                            {(quote.status === 'replied' || quote.status === 'completed' || quote.status === 'payment_pending') && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setIsEditing(false)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    취소
                                                </Button>
                                            )}
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-red-100 mb-4">
                                            <label className="text-sm font-bold text-gray-700 mb-2 block">총 견적 금액</label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={price}
                                                    onChange={(e) => setPrice(e.target.value)}
                                                    className="pl-8 font-bold text-2xl h-14 text-red-600"
                                                />
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₩</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                * 금액을 입력하고 답변을 등록하면 사용자에게 결제 버튼이 노출됩니다.
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 mb-2 block">답변 상세 내용</label>
                                            <Textarea
                                                placeholder="상세 견적 내용 및 안내사항을 입력해주세요."
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                className="min-h-[200px] bg-white text-base leading-relaxed"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                onClick={handleAdminReply}
                                                disabled={replyLoading}
                                                className="bg-red-600 hover:bg-red-700 h-12 px-6 text-lg"
                                            >
                                                {replyLoading ? "등록 중..." : "답변 및 견적서 발송"}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    /* User View Mode (Visible to Admin when not editing) */
                                    <div className="space-y-6 relative">
                                        {isAdmin && (
                                            <div className="absolute top-0 right-0 z-10">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setIsEditing(true)}
                                                    className="bg-white hover:bg-gray-50"
                                                >
                                                    수정하기
                                                </Button>
                                            </div>
                                        )}

                                        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="text-center md:text-left">
                                                <p className="text-sm text-gray-500 font-medium mb-1">총 견적 금액</p>
                                                <div className="text-4xl font-extrabold text-red-600">
                                                    {Number(quote.adminComment?.price || 0).toLocaleString()}
                                                    <span className="text-2xl font-bold ml-1 text-gray-600">원</span>
                                                </div>
                                            </div>
                                            <Button
                                                className="h-14 px-8 text-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg animate-pulse"
                                                onClick={() => toast.info("결제 기능은 현재 준비 중입니다.")}
                                            >
                                                결제하기
                                            </Button>
                                        </div>

                                        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed bg-white p-6 rounded-xl border border-gray-100">
                                            {quote.adminComment?.content}
                                        </div>

                                        <div className="flex justify-between items-center text-sm text-gray-500 pt-2 border-t border-red-100/50">
                                            <span>담당자: 빨간바지 투어</span>
                                            <span>답변일: {formatDistanceToNow(new Date(quote.adminComment?.repliedAt || ""), { addSuffix: true, locale: ko })}</span>
                                        </div>
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
