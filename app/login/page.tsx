"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ForgotPasswordDialog } from "@/components/auth/forgot-password-dialog";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/");
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-credential' ||
                err.code === 'auth/wrong-password' ||
                err.code === 'auth/user-not-found') {
                setError("이메일 또는 비밀번호가 올바르지 않습니다.");
            } else {
                setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요. (" + err.code + ")");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError("");
        const provider = new GoogleAuthProvider();

        try {
            // 모바일/데스크탑 모두 popup 사용 (최신 브라우저는 사용자 클릭으로 시작된 팝업 허용)
            const result = await signInWithPopup(auth, provider);

            // 사용자 프로필 존재 확인
            const userDoc = await getDoc(doc(db, 'users', result.user.uid));
            if (userDoc.exists()) {
                router.push("/");
            } else {
                // 새 사용자 - 회원가입 페이지로 리디렉션하여 추가 정보 입력
                router.push("/signup?googleUser=true");
            }
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError("로그인이 취소되었습니다.");
            } else if (err.code === 'auth/popup-blocked') {
                setError("팝업이 차단되었습니다. 팝업 차단을 해제해주세요.");
            } else {
                setError("구글 로그인 중 오류가 발생했습니다. (" + err.code + ")");
            }
            setLoading(false);
        }
    };

    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border shadow-lg">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
                    <p className="mt-2 text-gray-600">빨간바지 솔로 골프에 오신 것을 환영합니다.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">이메일</label>
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
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">비밀번호</label>
                        <input
                            id="password"
                            type="password"
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <ForgotPasswordDialog />
                    </div>

                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "로그인"}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">또는</span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    type="button"
                    className="w-full"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Google로 계속하기
                </Button>

                <div className="text-center text-sm text-gray-600">
                    계정이 없으신가요?{" "}
                    <Link href="/signup" className="font-medium text-red-600 hover:text-red-500">
                        회원가입
                    </Link>
                </div>
            </div>
        </div>
    );
}
