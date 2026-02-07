"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { courses } from "@/lib/courses-data";
import { joins } from "@/lib/joins-data";
import { createCourse } from "@/lib/db/courses";
import { createJoin } from "@/lib/db/joins";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function MigrationPage() {
    const [status, setStatus] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleMigration = async () => {
        if (!confirm("모든 데이터를 Firestore로 업로드하시겠습니까? 기존 데이터가 덮어씌워질 수 있습니다.")) return;

        setLoading(true);
        setStatus("마이그레이션 시작...");

        try {
            // 1. Migrate Courses
            setStatus(`골프장 데이터 업로드 중... (0/${courses.length})`);
            let courseCount = 0;
            for (const course of courses) {
                await createCourse(course);
                courseCount++;
                setStatus(`골프장 데이터 업로드 중... (${courseCount}/${courses.length})`);
            }

            // 2. Migrate Joins
            setStatus(`조인 데이터 업로드 중... (0/${joins.length})`);
            let joinCount = 0;
            for (const join of joins) {
                const { id, ...joinData } = join;
                await createJoin(joinData);
                joinCount++;
                setStatus(`조인 데이터 업로드 중... (${joinCount}/${joins.length})`);
            }

            setStatus("마이그레이션 완료!");
            toast.success("모든 데이터가 성공적으로 업로드되었습니다.");
        } catch (error) {
            console.error(error);
            setStatus(`오류 발생: ${error}`);
            toast.error("데이터 마이그레이션 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">데이터 마이그레이션</h1>
            <p className="mb-8 text-gray-600">
                현재 로컬 파일(`courses-data.ts`, `joins-data.ts`)에 있는 데이터를 Firebase Firestore로 업로드합니다.
            </p>

            <div className="bg-gray-50 p-6 rounded-xl border mb-8">
                <h3 className="font-bold mb-4">대상 데이터</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>골프장: {courses.length}개</li>
                    <li>조인 모집: {joins.length}개</li>
                </ul>
            </div>

            <div className="space-y-4">
                <Button
                    onClick={handleMigration}
                    disabled={loading}
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    데이터 업로드 시작
                </Button>

                {status && (
                    <div className={`p-4 rounded-lg flex items-center gap-2 ${status.includes("오류") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                        {status.includes("오류") ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}
