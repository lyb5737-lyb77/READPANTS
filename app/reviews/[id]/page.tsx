"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, ThumbsUp, MapPin, Share2, Loader2, Calendar, Trash2 } from "lucide-react";
import { Review, getReview, REVIEW_CATEGORIES, toggleLikeReview, deleteReview } from "@/lib/db/reviews";
import { isAdmin } from "@/lib/db/users";
import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";
import { useAuthStore } from "@/lib/store/auth-store";
import { toast } from "sonner";

export default function ReviewDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { user, userProfile } = useAuthStore();

    const [review, setReview] = useState<Review | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLiking, setIsLiking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchReview = async () => {
            if (!id) return;
            try {
                const data = await getReview(id);
                if (data) {
                    setReview(data);
                } else {
                    toast.error("리뷰를 찾을 수 없습니다.");
                    router.back();
                }
            } catch (error) {
                console.error("Failed to fetch review:", error);
                toast.error("리뷰를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchReview();
    }, [id, router]);

    const handleLike = async () => {
        if (!user) {
            toast.error("로그인이 필요합니다.");
            return;
        }

        if (!review || isLiking) return;

        setIsLiking(true);
        try {
            await toggleLikeReview(review.id, user.uid);
            // Optimistic update
            const isLiked = review.likes.includes(user.uid);
            setReview(prev => {
                if (!prev) return prev;
                const newLikes = isLiked 
                    ? prev.likes.filter(uid => uid !== user.uid)
                    : [...prev.likes, user.uid];
                return {
                    ...prev,
                    likes: newLikes,
                    likeCount: newLikes.length
                };
            });
        } catch (error) {
            console.error("Failed to toggle like:", error);
            toast.error("좋아요 처리에 실패했습니다.");
        } finally {
            setIsLiking(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("정말 이 후기를 삭제하시겠습니까?")) return;
        setIsDeleting(true);
        try {
            await deleteReview(id);
            toast.success("후기가 삭제되었습니다.");
            router.replace(`/reviews?country=${review?.country}&region=${review?.region}`);
        } catch (error) {
            console.error("Failed to delete review:", error);
            toast.error("후기 삭제에 실패했습니다.");
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin h-10 w-10 text-red-600" />
            </div>
        );
    }

    if (!review) return null;

    const categoryLabel = REVIEW_CATEGORIES.find(c => c.value === review.category)?.label || review.category;
    const isLiked = user ? review.likes.includes(user.uid) : false;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm">
                <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button 
                        onClick={() => router.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <div className="font-semibold text-gray-900 truncate flex-1 text-center px-4">
                        {review.businessName}
                    </div>
                    <div className="flex items-center gap-2">
                        {(user?.uid === review.author.uid || isAdmin(userProfile)) && (
                            <button 
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="p-2 -mr-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors text-gray-400"
                                title="삭제하기"
                            >
                                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                            </button>
                        )}
                        <button 
                            onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: review.businessName,
                                    text: '레드팬츠 탐방 후기를 확인해보세요!',
                                    url: window.location.href,
                                }).catch(console.error);
                            } else {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success("링크가 복사되었습니다.");
                            }
                        }}
                        className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <Share2 className="w-5 h-5 text-gray-700" />
                    </button>
                    </div>
                </div>
            </div>

            <div className="container max-w-4xl mx-auto px-0 md:px-4 py-0 md:py-8">
                <div className="bg-white md:rounded-2xl md:shadow-sm overflow-hidden">
                    {/* Image Carousel (Simplified) */}
                    {review.images && review.images.length > 0 && (
                        <div className="relative w-full aspect-video md:aspect-[21/9] bg-gray-900">
                            <Image 
                                src={review.images[0]} 
                                alt={review.businessName}
                                fill
                                className="object-cover"
                                priority
                            />
                            {/* Inner gradient for better text readability if we put text over it */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                            
                            {/* Tags on Image */}
                            <div className="absolute bottom-4 left-4 flex gap-2">
                                <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full">
                                    {categoryLabel}
                                </span>
                                {review.isMyMoney && (
                                    <span className="bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                        내돈내산
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Content Body */}
                    <div className="p-5 md:p-8">
                        {/* Title & Info */}
                        <div className="mb-6">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                {review.businessName}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center text-yellow-500 font-bold">
                                    <Star className="w-4 h-4 fill-current mr-1" />
                                    {review.rating}.0
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {review.region === 'Pattaya' ? '파타야' : review.region === 'Haiphong' ? '하이퐁' : review.region}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(review.createdAt), 'yyyy.MM.dd', { locale: ko })}
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100 my-6" />

                        {/* Author Info */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative border border-gray-200">
                                    {review.author?.photoURL ? (
                                        <Image src={review.author.photoURL} alt={review.author.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg bg-gray-50">
                                            {review.author?.name?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">{review.author?.name}</div>
                                    <div className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: ko })} 작성됨
                                    </div>
                                </div>
                            </div>
                            
                            <Button 
                                variant={isLiked ? "default" : "outline"}
                                className={`rounded-full gap-2 transition-all ${isLiked ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'text-gray-600'}`}
                                onClick={handleLike}
                                disabled={isLiking}
                            >
                                <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current text-red-600' : ''}`} />
                                <span>{review.likeCount || 0}</span>
                            </Button>
                        </div>

                        {/* Text Content */}
                        <div className="prose prose-gray max-w-none">
                            <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                                {review.content}
                            </p>
                        </div>

                        {/* Extra Images Grid */}
                        {review.images && review.images.length > 1 && (
                            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                                {review.images.slice(1).map((url, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                                        <Image 
                                            src={url} 
                                            alt={`${review.businessName} 추가 이미지 ${idx + 1}`}
                                            fill
                                            className="object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                                            sizes="(max-width: 768px) 50vw, 33vw"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
