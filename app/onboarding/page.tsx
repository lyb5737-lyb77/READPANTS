'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { formatUserRankingData } from '@/lib/ranking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { updateProfile } from 'firebase/auth';

const formSchema = z.object({
    nickname: z.string().min(2, { message: "닉네임은 2글자 이상이어야 합니다." }),
    phone: z.string().regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, { message: "올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)" }),
    gender: z.enum(["male", "female"], { message: "성별을 선택해주세요." }),
    averageScore: z.string().min(1, { message: "평균 타수를 선택해주세요." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function OnboardingPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user?.displayName) {
            setValue('nickname', user.displayName);
        }
    }, [user, authLoading, router, setValue]);

    const onSubmit = async (data: FormValues) => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            // Update Auth Profile
            if (user.displayName !== data.nickname) {
                await updateProfile(user, { displayName: data.nickname });
            }

            // Save to Firestore
            // Use setDoc with merge: true to update existing doc or create new one keeping existing fields (like email)
            // Check for existing ranking data to avoid overwriting
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            const existingData = userSnap.exists() ? userSnap.data() : {};
            const rankingData = (existingData.communityScore === undefined) ? formatUserRankingData() : {};

            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                name: user.displayName || data.nickname, // Fallback
                nickname: data.nickname,
                phone: data.phone,
                gender: data.gender,
                averageScore: data.averageScore,
                role: existingData.role || "user", // Ensure role exists or keep existing
                updatedAt: new Date(),
                isProfileComplete: true,
                ...rankingData
            }, { merge: true });

            router.push('/');
        } catch (err: any) {
            console.error(err);
            setError('정보 저장 중 오류가 발생했습니다: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-primary">추가 정보 입력</CardTitle>
                    <CardDescription className="text-center">
                        원활한 골프 조인을 위해 필수 정보를 입력해주세요.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="nickname">닉네임</Label>
                            <Input
                                id="nickname"
                                placeholder="골프왕"
                                {...register("nickname")}
                            />
                            {errors.nickname && <p className="text-sm text-red-500">{errors.nickname.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">전화번호</Label>
                            <Input
                                id="phone"
                                placeholder="010-1234-5678"
                                {...register("phone")}
                            />
                            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gender">성별</Label>
                            <select
                                id="gender"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...register("gender")}
                            >
                                <option value="">성별 선택</option>
                                <option value="male">남성</option>
                                <option value="female">여성</option>
                            </select>
                            {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="averageScore">골프 평균 타수</Label>
                            <select
                                id="averageScore"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...register("averageScore")}
                            >
                                <option value="">평균 타수 선택</option>
                                <option value="single">싱글 (79타 이하)</option>
                                <option value="80s">80타대</option>
                                <option value="90s">90타대</option>
                                <option value="100s">100타대 (백돌이/백순이)</option>
                                <option value="beginner">입문/초보</option>
                            </select>
                            {errors.averageScore && <p className="text-sm text-red-500">{errors.averageScore.message}</p>}
                        </div>

                        {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded break-keep">{error}</div>}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            저장하고 시작하기
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
