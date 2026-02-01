import { getJoin } from "@/lib/db/joins";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, DollarSign, User, ArrowLeft, CheckCircle } from "lucide-react";
import { JoinActionButton } from "@/components/join/join-action-button";
import { formatPrice, getCurrency } from "@/lib/constants/currencies";

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ country?: string; region?: string }>;
}

export default async function JoinDetailPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { country = 'Thailand' } = await searchParams;
    const currency = getCurrency(country);
    const join = await getJoin(id);

    if (!join) {
        notFound();
    }

    return (
        <div className="container py-12 px-4 md:px-6 max-w-4xl mx-auto">
            <Link
                href="/join"
                className="inline-flex items-center text-sm text-gray-500 hover:text-red-600 mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                조인 목록으로 돌아가기
            </Link>

            <div className="bg-white rounded-2xl border shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gray-900 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-red-600 rounded-full blur-3xl opacity-20" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-red-600 rounded-full text-xs font-bold">
                                {join.status === "open" ? "모집중" : "마감"}
                            </span>
                            <span className="text-gray-400 text-sm">No. {join.id}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{join.courseName}</h1>
                        <div className="flex flex-wrap items-center gap-6 text-gray-300 mt-4">
                            <div className="flex items-center">
                                <Calendar className="h-5 w-5 mr-2 text-red-500" />
                                {join.date}
                            </div>
                            <div className="flex items-center">
                                <Clock className="h-5 w-5 mr-2 text-red-500" />
                                {join.time} 티오프
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="md:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <User className="h-5 w-5 mr-2 text-red-600" />
                                호스트 정보
                            </h2>
                            <div className="flex items-center p-4 bg-gray-50 rounded-xl border">
                                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-4">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg">{join.hostName}</span>
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-200 font-medium">
                                            {join.hostLevel}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">매너 점수 4.8/5.0</p>
                                </div>
                            </div>
                            <div className="mt-4 p-4 bg-blue-50 text-blue-900 rounded-xl text-sm leading-relaxed">
                                "{join.description}"
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <DollarSign className="h-5 w-5 mr-2 text-red-600" />
                                비용 안내 (1인 기준, {currency.code})
                            </h2>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-4 border rounded-xl">
                                    <p className="text-sm text-gray-500 mb-1">그린피</p>
                                    <p className="font-bold text-lg">{formatPrice(join.greenFee, country)}</p>
                                </div>
                                <div className="p-4 border rounded-xl">
                                    <p className="text-sm text-gray-500 mb-1">캐디피</p>
                                    <p className="font-bold text-lg">{formatPrice(join.caddyFee, country)}</p>
                                </div>
                                <div className="p-4 border rounded-xl">
                                    <p className="text-sm text-gray-500 mb-1">카트비</p>
                                    <p className="font-bold text-lg">{formatPrice(join.cartFee, country)}</p>
                                </div>
                                {join.transportFee !== undefined && join.transportFee > 0 && (
                                    <div className="p-4 border rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">교통비</p>
                                        <p className="font-bold text-lg">{formatPrice(join.transportFee, country)}</p>
                                    </div>
                                )}
                            </div>
                            <p className="mt-2 text-xs text-gray-500 text-right">* 캐디팅 별도</p>
                        </section>
                    </div>

                    {/* Right Column: Action */}
                    <div className="md:col-span-1">
                        <div className="bg-gray-50 p-6 rounded-xl border h-full flex flex-col">
                            <h3 className="font-bold text-lg mb-4">참여 현황</h3>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600">현재 인원</span>
                                <span className="font-bold text-xl text-red-600">
                                    {join.currentMembers} <span className="text-gray-400 text-sm">/ {join.maxMembers}</span>
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                                <div
                                    className="bg-red-600 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${(join.currentMembers / join.maxMembers) * 100}%` }}
                                ></div>
                            </div>

                            <div className="space-y-3 mt-auto">
                                <JoinActionButton joinId={join.id} status={join.status} />
                                <Link href={`/courses/${join.courseId}`} className="block">
                                    <Button variant="outline" className="w-full">
                                        골프장 정보 보기
                                    </Button>
                                </Link>
                            </div>

                            <div className="mt-6 pt-6 border-t text-xs text-gray-500 space-y-2">
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                    <span>신청 즉시 호스트에게 알림이 전송됩니다.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                    <span>호스트 승인 후 예약이 확정됩니다.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
