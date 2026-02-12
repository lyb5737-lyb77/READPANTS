"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getQuotes, Quote } from "@/lib/db/quotes";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Lock, FileText, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

function QuoteListPageContent() {
    const searchParams = useSearchParams();
    // Although quotes are usually private, we show a list to indicate activity.
    // We can filter by country/region if needed, but requirements say "Menu between Reviews and Guide".
    // I will assume global list or region based if query param exists.
    const region = searchParams.get('region') || '';
    const { user, userProfile } = useAuthStore();
    const router = useRouter();

    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuotes = async () => {
            setLoading(true);
            try {
                // Fetch all quotes. Server filters typically better, but for now client side filtering/masking.
                const data = await getQuotes();
                setQuotes(data);
            } catch (error) {
                console.error("Failed to fetch quotes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotes();
    }, []);

    const handleQuoteClick = (quote: Quote) => {
        if (!user) {
            toast.error("로그인이 필요합니다.");
            router.push("/login?redirect=/quotes");
            return;
        }

        // Check permission: Admin or Author
        const isAdmin = userProfile?.role === 'admin';
        const isAuthor = user.uid === quote.userId;

        if (isAdmin || isAuthor) {
            router.push(`/quotes/${quote.id}`);
        } else {
            toast.warning("비공개 글입니다. 작성자와 관리자만 볼 수 있습니다.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container max-w-5xl px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">여행 견적 문의</h1>
                        <p className="text-gray-500 mt-2">
                            원하시는 일정과 조건을 남겨주시면 빠르게 확인 후 견적을 드립니다. (비공개 운영)
                        </p>
                    </div>
                    <Link href={`/quotes/new?region=${region}`}>
                        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 shadow-md transition-all">
                            견적 요청하기
                        </Button>
                    </Link>
                </div>

                {/* List Board (Desktop) */}
                <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 w-[100px] text-center">상태</th>
                                    <th className="px-6 py-4 w-[120px] text-center">지역</th>
                                    <th className="px-6 py-4">제목</th>
                                    <th className="px-6 py-4 w-[120px] text-center">작성자</th>
                                    <th className="px-6 py-4 w-[120px] text-center">작성일</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                        </td>
                                    </tr>
                                ) : quotes.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-gray-500">
                                            등록된 견적 요청이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    quotes.map((quote) => {
                                        const isMyPost = user && user.uid === quote.userId;
                                        const isAdmin = userProfile?.role === 'admin';
                                        let authorName = quote.authorName;
                                        if (!isAdmin && !isMyPost && authorName.length > 1) {
                                            authorName = authorName[0] + '*'.repeat(authorName.length - 1);
                                        }

                                        return (
                                            <tr
                                                key={quote.id}
                                                onClick={() => handleQuoteClick(quote)}
                                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-6 py-4 text-center">
                                                    {quote.status === 'replied' || quote.status === 'completed' ? (
                                                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 whitespace-nowrap">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            답변완료
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 whitespace-nowrap">
                                                            <Circle className="w-3 h-3 mr-1 fill-gray-200 text-gray-400" />
                                                            대기중
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium text-gray-600">
                                                    {quote.region}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-900 line-clamp-1">
                                                            {quote.country} {quote.region} - {quote.nights}박 {quote.days}일 여행 견적 요청합니다.
                                                        </span>
                                                        <Lock className="w-3 h-3 text-gray-400 shrink-0" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-gray-600">
                                                    {authorName}
                                                </td>
                                                <td className="px-6 py-4 text-center text-gray-500">
                                                    {formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true, locale: ko })}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Cart List View */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        </div>
                    ) : quotes.length === 0 ? (
                        <div className="py-20 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                            등록된 견적 요청이 없습니다.
                        </div>
                    ) : (
                        quotes.map((quote) => {
                            const isMyPost = user && user.uid === quote.userId;
                            const isAdmin = userProfile?.role === 'admin';
                            let authorName = quote.authorName;
                            if (!isAdmin && !isMyPost && authorName.length > 1) {
                                authorName = authorName[0] + '*'.repeat(authorName.length - 1);
                            }

                            return (
                                <div
                                    key={quote.id}
                                    onClick={() => handleQuoteClick(quote)}
                                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 active:scale-[0.98] transition-all"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-2 items-center">
                                            {quote.status === 'replied' || quote.status === 'completed' ? (
                                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 whitespace-nowrap">
                                                    답변완료
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 whitespace-nowrap">
                                                    대기중
                                                </Badge>
                                            )}
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600">
                                                {quote.region}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true, locale: ko })}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-bold text-gray-900 mb-3 flex items-start gap-2">
                                        <span className="line-clamp-2">
                                            {quote.country} {quote.region} - {quote.nights}박 {quote.days}일 여행 견적 요청합니다.
                                        </span>
                                        <Lock className="w-3.5 h-3.5 text-gray-400 mt-1 shrink-0" />
                                    </h3>

                                    <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-3">
                                        <span>{authorName}</span>
                                        <div className="flex items-center text-gray-400">
                                            <span className="mr-1">상세보기</span>
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default function QuoteListPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-red-600" /></div>}>
            <QuoteListPageContent />
        </Suspense>
    );
}
