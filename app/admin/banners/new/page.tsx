"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createBanner } from "@/lib/db/banners";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function NewBannerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!imageFile) {
            toast.error("배너 이미지를 선택해주세요.");
            return;
        }

        if (!title.trim() || !linkUrl.trim()) {
            toast.error("제목과 링크를 입력해주세요.");
            return;
        }

        setLoading(true);

        try {
            await createBanner({
                title,
                linkUrl,
                imageUrl: "", // Will be set in createBanner logic
                order: 999, // Default to end, can be reordered
                isActive,
            }, imageFile);

            toast.success("배너가 등록되었습니다.");
            router.push("/admin/banners");
        } catch (error) {
            console.error("Failed to create banner:", error);
            toast.error("배너 등록 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <div className="mb-8">
                <Button
                    variant="ghost"
                    className="mb-4 pl-0 hover:bg-transparent hover:text-red-600"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    목록으로 돌아가기
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">새 배너 등록</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">배너 이미지 *</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
                            <input
                                type="file"
                                id="banner-image"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            {previewUrl ? (
                                <div className="space-y-4">
                                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mx-auto">
                                        <Image
                                            src={previewUrl}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <label
                                        htmlFor="banner-image"
                                        className="inline-block text-sm text-red-600 hover:text-red-700 cursor-pointer"
                                    >
                                        이미지 변경하기
                                    </label>
                                </div>
                            ) : (
                                <label
                                    htmlFor="banner-image"
                                    className="flex flex-col items-center cursor-pointer py-4"
                                >
                                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-3">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <span className="text-base font-medium text-gray-900">
                                        이미지 업로드
                                    </span>
                                    <span className="text-sm text-gray-500 mt-1">
                                        클릭하여 파일을 선택하세요
                                    </span>
                                </label>
                            )}
                            <div className="mt-4 text-xs text-center text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="font-semibold mb-1 text-gray-700">📌 이미지 업로드 가이드</p>
                                <p>• 권장 사이즈: <span className="text-red-600 font-medium">1200 x 400px</span> (3:1 비율)</p>
                                <p>• 파일 형식: JPG, PNG, WEBP, GIF</p>
                                <p>• 최대 용량: 5MB 이하 권장</p>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium text-gray-700">제목 *</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="배너의 제목을 입력하세요 (관리용)"
                            required
                        />
                    </div>

                    {/* Link */}
                    <div className="space-y-2">
                        <label htmlFor="link" className="text-sm font-medium text-gray-700">링크 URL *</label>
                        <input
                            type="url"
                            id="link"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="https://..."
                            required
                        />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="active"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer">
                            즉시 노출하기
                        </label>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.back()}
                        >
                            취소
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-red-600 hover:bg-red-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    등록 중...
                                </>
                            ) : (
                                "배너 등록"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
