"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUser } from "@/lib/db/users";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { USER_LEVELS } from "@/lib/constants/user-levels";
import { calculateGolfSkillLevel } from "@/lib/constants/levels";

export default function SignupPage() {
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [avgScore, setAvgScore] = useState("");
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
    const [marketingConsents, setMarketingConsents] = useState({
        sms: false,
        email: false,
        kakao: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isGoogleSignup, setIsGoogleSignup] = useState(false);
    const router = useRouter();


    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("비밀번호는 6자 이상이어야 합니다.");
            setLoading(false);
            return;
        }

        if (!avgScore || isNaN(Number(avgScore))) {
            setError("평균타수를 올바르게 입력해주세요.");
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, {
                displayName: nickname
            });

            // Create user profile in Firestore
            await createUser(userCredential.user.uid, {
                email: userCredential.user.email || email,
                nickname,
                phone: phone || "",
                gender,
                level: USER_LEVELS[0].name, // Legacy
                role: 'user',

                // New System
                activityPoints: 0,
                communityLevel: 1,
                avgScore: Number(avgScore),
                golfSkillLevel: calculateGolfSkillLevel(Number(avgScore)).level,

                marketingConsents,
                createdAt: new Date().toISOString()
            });

            router.push("/");
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError("이미 사용 중인 이메일입니다.");
            } else {
                setError("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setLoading(true);
        setError("");
        const provider = new GoogleAuthProvider();

        try {
            // 모바일/데스크탑 모두 popup 사용
            const result = await signInWithPopup(auth, provider);
            // Show additional info form for Google users
            setIsGoogleSignup(true);
            setEmail(result.user.email || "");
            setNickname(result.user.displayName || "");
            setLoading(false);
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError("로그인이 취소되었습니다.");
            } else if (err.code === 'auth/popup-blocked') {
                setError("팝업이 차단되었습니다. 팝업 차단을 해제해주세요.");
            } else {
                setError("Google 로그인 중 오류가 발생했습니다. (" + err.code + ")");
            }
            setLoading(false);
        }
    };

    const handleGoogleSignupComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!avgScore || isNaN(Number(avgScore))) {
            setError("평균타수를 올바르게 입력해주세요.");
            setLoading(false);
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("User not authenticated");

            // Create user profile in Firestore
            await createUser(user.uid, {
                email: user.email || email,
                nickname,
                phone: phone || "",
                gender,
                level: USER_LEVELS[0].name, // Legacy
                role: 'user',

                // New System
                activityPoints: 0,
                communityLevel: 1,
                avgScore: Number(avgScore),
                golfSkillLevel: calculateGolfSkillLevel(Number(avgScore)).level,

                marketingConsents,
                createdAt: new Date().toISOString()
            });

            router.push("/");
        } catch (err: any) {
            console.error(err);
            setError("프로필 생성 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border shadow-lg">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
                    <p className="mt-2 text-gray-600">빨간바지 솔로 골프의 회원이 되어보세요.</p>
                </div>

                {!isGoogleSignup ? (
                    <>
                        {/* Google Signup Button */}
                        <Button
                            type="button"
                            onClick={handleGoogleSignup}
                            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
                            disabled={loading}
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google로 시작하기
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">또는</span>
                            </div>
                        </div>

                        {/* Email Signup Form */}
                        <form onSubmit={handleEmailSignup} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="nickname" className="text-sm font-medium text-gray-700">닉네임 *</label>
                                <input
                                    id="nickname"
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">이메일 *</label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-gray-700">비밀번호 *</label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">비밀번호 확인 *</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-medium text-gray-700">휴대폰번호 *</label>
                                <div className="flex gap-2">
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
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">성별 *</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="male"
                                            checked={gender === 'male'}
                                            onChange={(e) => setGender(e.target.value as 'male')}
                                            className="mr-2"
                                        />
                                        남성
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="female"
                                            checked={gender === 'female'}
                                            onChange={(e) => setGender(e.target.value as 'female')}
                                            className="mr-2"
                                        />
                                        여성
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="other"
                                            checked={gender === 'other'}
                                            onChange={(e) => setGender(e.target.value as 'other')}
                                            className="mr-2"
                                        />
                                        기타
                                    </label>
                                </div>
                            </div>

                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "가입하기"}
                            </Button>
                        </form>
                    </>
                ) : (
                    // Google signup additional info form
                    <form onSubmit={handleGoogleSignupComplete} className="space-y-4">
                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                            Google 계정으로 로그인되었습니다. 추가 정보를 입력해주세요.
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="nickname" className="text-sm font-medium text-gray-700">닉네임 *</label>
                            <input
                                id="nickname"
                                type="text"
                                required
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium text-gray-700">휴대폰번호</label>
                            <input
                                id="phone"
                                type="tel"
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="010-1234-5678"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
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
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">성별 *</label>
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="male"
                                        checked={gender === 'male'}
                                        onChange={(e) => setGender(e.target.value as 'male')}
                                        className="mr-2"
                                    />
                                    남성
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="female"
                                        checked={gender === 'female'}
                                        onChange={(e) => setGender(e.target.value as 'female')}
                                        className="mr-2"
                                    />
                                    여성
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="other"
                                        checked={gender === 'other'}
                                        onChange={(e) => setGender(e.target.value as 'other')}
                                        className="mr-2"
                                    />
                                    기타
                                </label>
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "가입 완료"}
                        </Button>
                    </form>
                )}

                <div className="text-center text-sm text-gray-600">
                    이미 계정이 있으신가요?{" "}
                    <Link href="/login" className="font-medium text-red-600 hover:text-red-500">
                        로그인
                    </Link>
                </div>
            </div>
        </div>
    );
}
