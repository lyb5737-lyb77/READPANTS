"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { updateUser } from "@/lib/db/users";
import { calculateGolfSkillLevel } from "@/lib/constants/levels";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function SignupCompletePage() {
    const { user, userProfile, loading: authLoading } = useAuthStore();
    const router = useRouter();

    const [phone, setPhone] = useState("");
    const [avgScore, setAvgScore] = useState("");
    const [marketingConsents, setMarketingConsents] = useState({
        sms: false,
        email: false,
        kakao: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    // Pre-fill if exists (though usually empty if here)
    useEffect(() => {
        if (userProfile) {
            if (userProfile.phone) setPhone(userProfile.phone);
            if (userProfile.avgScore) setAvgScore(userProfile.avgScore.toString());
            if (userProfile.marketingConsents) setMarketingConsents(userProfile.marketingConsents);
        }
    }, [userProfile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!phone) {
            setError("휴대폰 번호를 입력해주세요.");
            setLoading(false);
            return;
        }

        if (!avgScore || isNaN(Number(avgScore))) {
            setError("평균타수를 올바르게 입력해주세요.");
            setLoading(false);
            return;
        }

        try {
            if (!user) throw new Error("로그인이 필요합니다.");

            await updateUser(user.uid, {
                phone,
                marketingConsents,
                avgScore: Number(avgScore),
                golfSkillLevel: calculateGolfSkillLevel(Number(avgScore)).level
            });

            // Force reload or redirect to home
            window.location.href = "/";
        } catch (err) {
            console.error(err);
            setError("정보 저장 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div>;
    }

    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border shadow-lg">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">추가 정보 입력</h1>
                    <p className="mt-2 text-gray-600">서비스 이용을 위해 필수 정보를 입력해주세요.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-gray-700">휴대폰번호 *</label>
                        <input
                            id="phone"
                            type="tel"
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="010-1234-5678"
                            value={phone}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '').replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
                                setPhone(val);
                            }}
                            maxLength={13}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="avgScore" className="text-sm font-medium text-gray-700">평균타수 *</label>
                        <input
                            id="avgScore"
                            type="number"
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="85"
                            value={avgScore}
                            onChange={(e) => setAvgScore(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <label className="text-sm font-medium text-gray-900 block">마케팅 정보 수신 동의 (선택)</label>
                        <div className="flex gap-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={marketingConsents.sms}
                                    onChange={(e) => setMarketingConsents({ ...marketingConsents, sms: e.target.checked })}
                                    className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                                />
                                <span className="text-sm text-gray-700">문자(SMS)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={marketingConsents.kakao}
                                    onChange={(e) => setMarketingConsents({ ...marketingConsents, kakao: e.target.checked })}
                                    className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                                />
                                <span className="text-sm text-gray-700">카카오톡</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={marketingConsents.email}
                                    onChange={(e) => setMarketingConsents({ ...marketingConsents, email: e.target.checked })}
                                    className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                                />
                                <span className="text-sm text-gray-700">이메일</span>
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "저장하고 시작하기"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
