"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, User, Phone, Lock, Award, ArrowLeft, Shield, Star, Camera } from "lucide-react";
import { LevelBadge } from "@/components/ui/level-badge";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";

export default function ProfilePage() {
    const { user, userProfile, loading } = useAuthStore();
    const router = useRouter();
    const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile picture state
    const [imageLoading, setImageLoading] = useState(false);

    // Phone change state
    const [newPhone, setNewPhone] = useState("");
    const [phoneLoading, setPhoneLoading] = useState(false);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            alert("로그인이 필요합니다.");
            router.push("/login");
        }
    }, [user, loading, router]);

    // 이미지 리사이즈 함수
    const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = document.createElement('img');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                let { width, height } = img;

                // 비율 유지하며 리사이즈
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Canvas toBlob failed'));
                    },
                    'image/jpeg',
                    0.8 // 80% 품질
                );
            };

            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    };

    // 프로필 이미지 업로드 핸들러
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 파일 타입 검증
        if (!file.type.startsWith('image/')) {
            alert("이미지 파일만 업로드 가능합니다.");
            return;
        }

        // 파일 크기 검증 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
            alert("파일 크기는 5MB 이하여야 합니다.");
            return;
        }

        setImageLoading(true);
        try {
            // 이미지 리사이즈 (200x200)
            const resizedBlob = await resizeImage(file, 200, 200);

            // Firebase Storage에 업로드
            const storageRef = ref(storage, `profiles/${user!.uid}/profile_${Date.now()}.jpg`);
            await uploadBytes(storageRef, resizedBlob);
            const downloadURL = await getDownloadURL(storageRef);

            // Firestore에 URL 저장
            const userRef = doc(db, "users", user!.uid);
            await updateDoc(userRef, {
                profileImageUrl: downloadURL
            });

            alert("프로필 사진이 변경되었습니다.");
            window.location.reload();
        } catch (error) {
            console.error("Image upload error:", error);
            alert("이미지 업로드 중 오류가 발생했습니다.");
        } finally {
            setImageLoading(false);
        }
    };

    const handlePhoneChange = async () => {
        if (!newPhone.trim()) {
            alert("전화번호를 입력해주세요.");
            return;
        }

        setPhoneLoading(true);
        try {
            const userRef = doc(db, "users", user!.uid);
            await updateDoc(userRef, {
                phone: newPhone.trim()
            });
            alert("전화번호가 변경되었습니다.");
            setPhoneDialogOpen(false);
            setNewPhone("");
            // Refresh the page to update userProfile
            window.location.reload();
        } catch (error) {
            console.error("Phone change error:", error);
            alert("전화번호 변경 중 오류가 발생했습니다.");
        } finally {
            setPhoneLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        if (newPassword.length < 6) {
            alert("비밀번호는 6자 이상이어야 합니다.");
            return;
        }

        setPasswordLoading(true);
        try {
            // Re-authenticate user
            const credential = EmailAuthProvider.credential(user!.email!, currentPassword);
            await reauthenticateWithCredential(auth.currentUser!, credential);

            // Update password
            await updatePassword(auth.currentUser!, newPassword);

            alert("비밀번호가 변경되었습니다.");
            setPasswordDialogOpen(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            console.error("Password change error:", error);
            if (error.code === "auth/wrong-password") {
                alert("현재 비밀번호가 올바르지 않습니다.");
            } else if (error.code === "auth/requires-recent-login") {
                alert("보안을 위해 다시 로그인해주세요.");
            } else {
                alert("비밀번호 변경 중 오류가 발생했습니다.");
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin h-8 w-8 text-red-600" />
            </div>
        );
    }

    if (!user || !userProfile) {
        return null;
    }

    // Calculate level progress
    const currentPoints = userProfile.activityPoints || 0;
    const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800];
    const currentLevel = userProfile.communityLevel || 1;
    const nextLevelPoints = levelThresholds[currentLevel] || 9999;
    const prevLevelPoints = levelThresholds[currentLevel - 1] || 0;
    const progressPercent = Math.min(100, ((currentPoints - prevLevelPoints) / (nextLevelPoints - prevLevelPoints)) * 100);

    return (
        <div className="container px-4 py-8 max-w-2xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">개인정보 설정</h1>
                    <p className="text-gray-500 text-sm">계정 정보 및 보안 설정을 관리합니다.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Profile Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            기본 정보
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Profile Picture */}
                        <div className="flex flex-col items-center pb-6 border-b">
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                                    {userProfile.profileImageUrl ? (
                                        <Image
                                            src={userProfile.profileImageUrl}
                                            alt="프로필 사진"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200">
                                            <User className="w-12 h-12 text-red-400" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={imageLoading}
                                    className="absolute bottom-0 right-0 w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 disabled:opacity-50"
                                >
                                    {imageLoading ? (
                                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                                    ) : (
                                        <Camera className="w-5 h-5 text-white" />
                                    )}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-3">
                                카메라 버튼을 클릭하여 사진 변경
                            </p>
                            <p className="text-xs text-gray-400">
                                권장: 200x200px, 최대 5MB
                            </p>
                        </div>

                        {/* Nickname (Read-only) */}
                        <div className="space-y-2">
                            <Label className="text-gray-600">닉네임</Label>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 px-4 py-3 bg-gray-100 rounded-lg text-gray-700 font-medium">
                                    {userProfile.nickname || user.displayName || "미설정"}
                                </div>
                                <span className="text-xs text-gray-400 whitespace-nowrap">변경 불가</span>
                            </div>
                        </div>

                        {/* Email (Read-only) */}
                        <div className="space-y-2">
                            <Label className="text-gray-600">이메일</Label>
                            <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-700">
                                {userProfile.email || user.email}
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <Label className="text-gray-600">전화번호</Label>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 px-4 py-3 bg-gray-50 rounded-lg text-gray-700 border">
                                    {userProfile.phone || "미등록"}
                                </div>
                                <Dialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Phone className="w-4 h-4 mr-2" />
                                            변경
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>전화번호 변경</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>새 전화번호</Label>
                                                <Input
                                                    type="tel"
                                                    placeholder="010-0000-0000"
                                                    value={newPhone}
                                                    onChange={(e) => setNewPhone(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setPhoneDialogOpen(false)}>
                                                취소
                                            </Button>
                                            <Button onClick={handlePhoneChange} disabled={phoneLoading}>
                                                {phoneLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                                                변경하기
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            보안 설정
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                            <div>
                                <p className="font-medium text-gray-900">로그인 비밀번호</p>
                                <p className="text-sm text-gray-500">정기적으로 비밀번호를 변경해주세요.</p>
                            </div>
                            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Lock className="w-4 h-4 mr-2" />
                                        변경
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>비밀번호 변경</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>현재 비밀번호</Label>
                                            <Input
                                                type="password"
                                                placeholder="현재 비밀번호 입력"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>새 비밀번호</Label>
                                            <Input
                                                type="password"
                                                placeholder="6자 이상 입력"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>새 비밀번호 확인</Label>
                                            <Input
                                                type="password"
                                                placeholder="새 비밀번호 다시 입력"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                                            취소
                                        </Button>
                                        <Button onClick={handlePasswordChange} disabled={passwordLoading}>
                                            {passwordLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                                            변경하기
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>

                {/* Community Points Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            커뮤니티 활동
                        </CardTitle>
                        <CardDescription>
                            커뮤니티 활동을 통해 포인트를 모으고 레벨을 올려보세요!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Current Level */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-amber-100">
                                    <LevelBadge type="community" level={currentLevel} size="lg" />
                                </div>
                                <div>
                                    <p className="text-sm text-amber-700">현재 등급</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        Lv.{currentLevel}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-amber-700">보유 포인트</p>
                                <p className="text-2xl font-bold text-amber-600">
                                    {currentPoints.toLocaleString()} <span className="text-base font-normal">P</span>
                                </p>
                            </div>
                        </div>

                        {/* Level Progress */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">다음 레벨까지</span>
                                <span className="font-medium text-gray-900">
                                    {currentLevel < 7
                                        ? `${(nextLevelPoints - currentPoints).toLocaleString()}P 남음`
                                        : "최고 레벨 달성!"
                                    }
                                </span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Lv.{currentLevel} ({prevLevelPoints}P)</span>
                                <span>Lv.{currentLevel + 1} ({nextLevelPoints}P)</span>
                            </div>
                        </div>

                        {/* Points Guide */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500" />
                                포인트 획득 방법
                            </p>
                            <ul className="text-sm text-gray-600 space-y-1.5">
                                <li className="flex justify-between">
                                    <span>• 조인 참여 완료</span>
                                    <span className="text-amber-600 font-medium">+50P</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>• 후기 작성</span>
                                    <span className="text-amber-600 font-medium">+30P</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>• 정보 나눔터 글 작성</span>
                                    <span className="text-amber-600 font-medium">+20P</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>• 댓글 작성</span>
                                    <span className="text-amber-600 font-medium">+5P</span>
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
