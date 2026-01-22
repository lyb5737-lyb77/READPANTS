"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getCourses } from "@/lib/db/courses";
import { getJoins } from "@/lib/db/joins";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

export default function DataDiagnosticPage() {
    const [status, setStatus] = useState<string>("대기 중...");
    const [courseCount, setCourseCount] = useState<number>(0);
    const [joinCount, setJoinCount] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const checkData = async () => {
        setLoading(true);
        setError("");
        setStatus("데이터 확인 중...");

        try {
            const courses = await getCourses();
            const joins = await getJoins();

            setCourseCount(courses.length);
            setJoinCount(joins.length);
            setStatus("완료!");
        } catch (err: any) {
            setError(err.message || "알 수 없는 오류");
            setStatus("오류 발생");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkData();
    }, []);

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">데이터 진단</h1>
                <p className="text-gray-600 mt-2">Firestore 데이터베이스 연결 및 데이터 상태를 확인합니다.</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <span className="font-medium">상태:</span>
                        <span className={`font-bold ${error ? "text-red-600" : "text-green-600"}`}>
                            {status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">골프장 데이터</div>
                            <div className="text-3xl font-bold text-blue-600">{courseCount}</div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">조인 데이터</div>
                            <div className="text-3xl font-bold text-green-600">{joinCount}</div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            <div>
                                <div className="font-bold">오류:</div>
                                <div className="text-sm">{error}</div>
                            </div>
                        </div>
                    )}

                    <Button onClick={checkData} disabled={loading} className="w-full">
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        다시 확인
                    </Button>

                    <div className="p-4 bg-yellow-50 rounded-lg text-sm">
                        <div className="font-bold text-yellow-800 mb-2">참고사항:</div>
                        <ul className="list-disc list-inside space-y-1 text-yellow-700">
                            <li>데이터가 0개라면 마이그레이션 페이지에서 데이터를 업로드하세요.</li>
                            <li>오류가 발생하면 Firestore 권한 설정을 확인하세요.</li>
                            <li>권한 오류시 <code className="bg-yellow-100 px-1 rounded">firebase deploy --only firestore:rules</code> 실행이 필요합니다.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
