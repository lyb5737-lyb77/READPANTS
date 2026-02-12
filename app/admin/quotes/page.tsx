"use client";

import { useEffect, useState } from "react";
import { getQuotes, Quote } from "@/lib/db/quotes";
import { getAccommodations } from "@/lib/db/accommodations"; // Added import
import { Accommodation } from "@/types/accommodation"; // Added import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Circle, Calculator } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useRouter } from "next/navigation";

export default function AdminQuotesPage() {
    const router = useRouter();
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [accommodations, setAccommodations] = useState<Accommodation[]>([]); // Added state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [quotesData, accommodationsData] = await Promise.all([
                    getQuotes(),
                    getAccommodations()
                ]);
                setQuotes(quotesData);
                setAccommodations(accommodationsData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">대기중</Badge>;
            case 'replied':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">답변완료</Badge>;
            case 'payment_pending':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">결제대기</Badge>;
            case 'completed':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">완료됨</Badge>;
            default:
                return <Badge variant="outline">알 수 없음</Badge>;
        }
    };

    const getAccommodationName = (id: string) => {
        if (id === 'direct') return '숙소 직접 예약';
        const acc = accommodations.find(a => a.id === id);
        return acc ? acc.name : '알 수 없는 숙소';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">여행 견적 관리</h2>
                    <p className="text-gray-500">접수된 여행 견적 요청을 확인하고 답변을 관리합니다.</p>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 w-[100px] text-center">상태</th>
                                    <th className="px-6 py-4">요청 내용</th>
                                    <th className="px-6 py-4 w-[120px] text-center">지역</th>
                                    <th className="px-6 py-4 w-[150px] text-center">요청자</th>
                                    <th className="px-6 py-4 w-[150px] text-center">여행 일정</th>
                                    <th className="px-6 py-4 w-[120px] text-center">접수일</th>
                                    <th className="px-6 py-4 w-[100px] text-center">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center">
                                            <Loader2 className="animate-spin h-8 w-8 mx-auto text-red-600" />
                                        </td>
                                    </tr>
                                ) : quotes.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center text-gray-500">
                                            접수된 견적 요청이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    quotes.map((quote) => (
                                        <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-center">
                                                {getStatusBadge(quote.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 line-clamp-1">
                                                    {quote.country} {quote.region} - {quote.nights}박 {quote.days}일
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                    {getAccommodationName(quote.accommodationType)} {quote.roomType ? `(${quote.roomType})` : ''} / 골프 {quote.golfRounds}회
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-600">
                                                {quote.region}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="font-medium">{quote.authorName}</div>
                                                <div className="text-xs text-gray-400">{quote.userPhone}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-600">
                                                {quote.startDate ? format(new Date(quote.startDate), "yyyy.MM.dd") : "-"}
                                                <br />
                                                <span className="text-xs text-gray-400">
                                                    (총 {Number(quote.numberOfMen) + Number(quote.numberOfWomen)}명)
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-500">
                                                {format(new Date(quote.createdAt), "yyyy.MM.dd")}
                                                <br />
                                                {format(new Date(quote.createdAt), "HH:mm")}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => router.push(`/quotes/${quote.id}`)}
                                                >
                                                    상세보기
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
