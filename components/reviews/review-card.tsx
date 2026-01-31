"use client";

import Image from "next/image";
import { Star, ThumbsUp, MapPin } from "lucide-react";
import { Review, REVIEW_CATEGORIES } from "@/lib/db/reviews";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface ReviewCardProps {
    review: Review;
    onClick?: () => void;
}

export function ReviewCard({ review, onClick }: ReviewCardProps) {
    const categoryLabel = REVIEW_CATEGORIES.find(c => c.value === review.category)?.label || review.category;

    return (
        <div
            className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={onClick}
        >
            {/* Image Section */}
            <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                {review.images && review.images.length > 0 ? (
                    <Image
                        src={review.images[0]}
                        alt={review.businessName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
                        <span className="text-sm">이미지 없음</span>
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                    <span className="text-xs font-bold text-gray-800">{categoryLabel}</span>
                </div>

                {/* 'My Money' Badge */}
                {review.isMyMoney && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-md shadow-sm">
                        <span className="text-[10px] font-bold">내돈내산</span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1">
                            {review.businessName}
                        </h3>
                        {/* Rating */}
                        <div className="flex items-center gap-1 mt-1">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-gray-200"}`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-bold text-gray-700 ml-1">{review.rating}.0</span>
                        </div>
                    </div>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 min-h-[40px] mb-4">
                    {review.content}
                </p>

                {/* Footer Info */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        {/* User Avatar (Fallback) */}
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                            {review.author?.photoURL ? (
                                <Image src={review.author.photoURL} alt={review.author.name} width={24} height={24} />
                            ) : (
                                <div className="text-[10px] font-bold text-gray-400">{review.author?.name?.[0]}</div>
                            )}
                        </div>
                        <span className="font-medium text-gray-700 truncate max-w-[80px]">{review.author?.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-red-500">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span className="font-medium">{review.likeCount || 0}</span>
                        </div>
                        <span>
                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: ko })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
