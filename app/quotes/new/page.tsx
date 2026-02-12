"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import QuoteRequestForm from "@/components/quotes/QuoteRequestForm";

function NewQuotePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // region param is less relevant now as the form handles airport selection, but good for context if needed.
    const region = searchParams.get('region') || '';

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container max-w-3xl px-4">
                <div className="mb-6 flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 text-gray-500">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        돌아가기
                    </Button>
                    <h1 className="text-xl font-bold ml-auto">
                        {region ? `${region} 여행 ` : ""}견적 요청
                    </h1>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
                    <QuoteRequestForm />
                </div>
            </div>
        </div>
    );
}

export default function NewQuotePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-red-600" /></div>}>
            <NewQuotePageContent />
        </Suspense>
    );
}
