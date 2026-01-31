"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/store/auth-store";
import { createReview, REVIEW_CATEGORIES, ReviewCategory } from "@/lib/db/reviews";
import { ArrowLeft, Loader2, Star, Upload, X, CheckCircle2, Utensils, Hotel, Sparkles, Map, Flag, CircleDot } from "lucide-react";

// Local icon mapping
const CATEGORY_ICONS: Record<ReviewCategory, React.ReactNode> = {
    'restaurant': <Utensils className="w-4 h-4" />,
    'accommodation': <Hotel className="w-4 h-4" />,
    'massage': <Sparkles className="w-4 h-4" />,
    'golf': <Map className="w-4 h-4" />,
    'driving_range': <Flag className="w-4 h-4" />,
    'other': <CircleDot className="w-4 h-4" />
};

function WriteReviewPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const country = searchParams.get('country') || 'Thailand';
    const region = searchParams.get('region') || 'Pattaya';
    const { user } = useAuthStore();

    const [loading, setLoading] = useState(false);

    // Form
    const [businessName, setBusinessName] = useState("");
    const [category, setCategory] = useState<ReviewCategory>('restaurant');
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState("");
    const [isMyMoney, setIsMyMoney] = useState(true);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Image Handling
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const totalFiles = images.length + newFiles.length;

            if (totalFiles > 5) {
                alert("사진은 최대 5장까지 업로드 가능합니다.");
                return;
            }

            setImages([...images, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setImagePreviews([...imagePreviews, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...imagePreviews];
        URL.revokeObjectURL(newPreviews[index]); // Free memory
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (!businessName.trim() || !content.trim()) {
            alert("상호명과 후기 내용은 필수 입력 사항입니다.");
            return;
        }

        setLoading(true);

        try {
            // Note: createReview handles image uploading internally
            await createReview({
                country,
                region,
                category,
                businessName,
                rating,
                content,
                isMyMoney,
                images: [], // Placeholder, will be populated by createReview return? No, signature says Omit images?
                // Wait, the interface says Omit<Review, ... "images" ...> IS NOT OMITTED in the signature?
                // Let's check the view_file output again.
                // export async function createReview(review: Omit<Review, "id" | "createdAt" | "updatedAt" | "likes" | "likeCount">, imageFiles: File[])
                // So 'images' IS required in the first arg?
                // The implementation: const docRef = await addDoc(..., { ...review, images: imageUrls ... })
                // It spreads 'review' then overwrites 'images'.
                // So I can pass empty array for images in the first arg.

                author: {
                    uid: user.uid,
                    name: user.displayName || user.email?.split('@')[0] || "익명",
                    photoURL: user.photoURL || undefined
                },
            }, images);

            alert("후기가 성공적으로 등록되었습니다!");
            router.push(`/reviews?country=${country}&region=${region}`);
        } catch (error) {
            console.error("Failed to submit review:", error);
            alert("후기 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container max-w-2xl px-4">
                <div className="mb-6 flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 text-gray-500">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        돌아가기
                    </Button>
                    <h1 className="text-xl font-bold ml-auto">{region} 탐방 후기 작성</h1>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Rating */}
                        <div className="flex flex-col items-center justify-center space-y-2 py-4">
                            <span className="text-lg font-bold text-gray-900">이 장소, 어떠셨나요?</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-10 h-10 ${star <= rating
                                                ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                                                : "fill-gray-100 text-gray-300"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="text-sm font-medium text-gray-500">
                                {rating === 5 ? "최고였어요! 😍" :
                                    rating === 4 ? "좋았어요 😊" :
                                        rating === 3 ? "보통이에요 🙂" :
                                            rating === 2 ? "아쉬워요 😕" : "별로였어요 😞"}
                            </span>
                        </div>

                        {/* Category */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-900 block">카테고리</label>
                            <div className="flex flex-wrap gap-2">
                                {REVIEW_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setCategory(cat.value)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${category === cat.value
                                            ? "bg-gray-900 text-white border-gray-900 shadow-md"
                                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                            }`}
                                    >
                                        <span className="mr-1.5">{CATEGORY_ICONS[cat.value]}</span>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900 block">
                                상호명 <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="예: 뭄아러이, 헐리우드"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                className="h-12 text-base bg-gray-50 border-transparent focus:bg-white transition-all"
                            />
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900 block">
                                후기 내용 <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                placeholder="방문 후기를 자세히 적어주세요. 맛, 서비스, 분위기 등 자세할수록 좋아요!"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="min-h-[200px] resize-none text-base bg-gray-50 border-transparent focus:bg-white transition-all p-4"
                            />
                        </div>

                        {/* Images */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-900 block">
                                사진 첨부 (최대 5장)
                            </label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {imagePreviews.map((url, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border group">
                                        <Image
                                            src={url}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {images.length < 5 && (
                                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50 cursor-pointer transition-all gap-2">
                                        <Upload className="w-6 h-6" />
                                        <span className="text-xs font-medium">사진 추가</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* My Money Check */}
                        <div
                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${isMyMoney ? "bg-red-50 border-red-200" : "bg-white border-gray-200"
                                }`}
                            onClick={() => setIsMyMoney(!isMyMoney)}
                        >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${isMyMoney ? "bg-red-600 border-red-600 text-white" : "bg-white border-gray-300"
                                }`}>
                                {isMyMoney && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            <div>
                                <h4 className={`font-bold ${isMyMoney ? "text-red-800" : "text-gray-700"}`}>내돈내산 인증</h4>
                                <p className="text-xs text-gray-500">직접 결제하고 이용한 후기입니다.</p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full h-14 text-lg font-bold bg-gray-900 hover:bg-black text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:bg-gray-300"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        등록 중...
                                    </>
                                ) : (
                                    "후기 등록하기"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function WriteReviewPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-red-600" /></div>}>
            <WriteReviewPageContent />
        </Suspense>
    );
}
