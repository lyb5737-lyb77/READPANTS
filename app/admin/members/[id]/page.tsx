"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, User, Save, ArrowLeft } from "lucide-react";

import { getUser, updateUser, UserProfile } from "@/lib/db/users";
import { USER_LEVELS } from "@/lib/constants/user-levels";

const formSchema = z.object({
    nickname: z.string().min(2, "닉네임은 2글자 이상이어야 합니다."),
    level: z.string(),
    role: z.string(),
    avgScore: z.coerce.number().min(0).max(150),
});

type FormValues = z.infer<typeof formSchema>;

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function MemberEditPage({ params }: PageProps) {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
    });

    useEffect(() => {
        params.then(async (resolvedParams) => {
            setUserId(resolvedParams.id);
            try {
                const userData = await getUser(resolvedParams.id);
                setUser(userData);
                if (userData) {
                    reset({
                        nickname: userData.nickname,
                        level: userData.level,
                        role: userData.role,
                        avgScore: userData.avgScore,
                    });
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setInitialLoading(false);
            }
        });
    }, [params, reset]);

    const onSubmit = async (data: FormValues) => {
        if (!userId) return;
        setLoading(true);
        try {
            await updateUser(userId, {
                nickname: data.nickname,
                level: data.level,
                role: data.role as 'user' | 'admin',
                avgScore: data.avgScore,
            });
            alert("회원 정보가 수정되었습니다.");
            router.push("/admin/members");
            router.refresh();
        } catch (error) {
            console.error("Error updating user:", error);
            alert("회원 정보 수정 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const [newPassword, setNewPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handlePasswordChange = async () => {
        if (!userId || !newPassword) return;
        if (!confirm("정말 비밀번호를 변경하시겠습니까?")) return;

        setPasswordLoading(true);
        try {
            const { updateUserPassword } = await import("@/app/actions/user-actions");
            const result = await updateUserPassword(userId, newPassword);

            if (result.success) {
                alert("비밀번호가 변경되었습니다.");
                setNewPassword("");
            } else {
                alert("비밀번호 변경 실패: " + result.error);
            }
        } catch (error) {
            console.error("Error changing password:", error);
            alert("비밀번호 변경 중 오류가 발생했습니다.");
        } finally {
            setPasswordLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!user) {
        return <div>존재하지 않는 회원입니다.</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">회원 정보 수정</h2>
                    <p className="text-gray-500 text-sm">
                        {user.email} 님의 정보를 수정합니다.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" /> 상세 정보
                        </CardTitle>
                        <CardDescription>
                            회원의 등급 및 권한을 신중하게 변경해주세요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="nickname">닉네임</Label>
                            <Input id="nickname" {...register("nickname")} />
                            {errors.nickname && <p className="text-xs text-red-500">{errors.nickname.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="level">회원 등급</Label>
                                <select
                                    id="level"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...register("level")}
                                >
                                    {USER_LEVELS.map((level) => (
                                        <option key={level.id} value={level.name}>
                                            {level.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="avgScore">평균 타수</Label>
                                <Input id="avgScore" type="number" {...register("avgScore")} />
                                {errors.avgScore && <p className="text-xs text-red-500">{errors.avgScore.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <Label htmlFor="role" className="text-red-600 font-bold">관리자 권한 설정</Label>
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="user"
                                            {...register("role")}
                                            className="w-4 h-4 text-red-600"
                                        />
                                        <span>일반 회원</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="admin"
                                            {...register("role")}
                                            className="w-4 h-4 text-red-600"
                                        />
                                        <span className="font-bold text-red-600">관리자</span>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    * 관리자로 설정하면 관리자 페이지의 모든 기능에 접근할 수 있습니다.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <Label htmlFor="newPassword">비밀번호 변경</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="새 비밀번호 입력 (6자 이상)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePasswordChange}
                                    disabled={passwordLoading || !newPassword || newPassword.length < 6}
                                >
                                    {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "변경"}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                                * 회원의 비밀번호를 직접 변경합니다. 변경 후 회원에게 알려주세요.
                            </p>
                        </div>

                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4 mt-6">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        취소
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        변경사항 저장
                    </Button>
                </div>
            </form>
        </div>
    );
}
