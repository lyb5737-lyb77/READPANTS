"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getReviews, likeReview, Review } from "@/lib/db/reviews";
import { format } from "date-fns";

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const fetchedReviews = await getReviews();
                setReviews(fetchedReviews);
            } catch (err) {
                console.error("Failed to fetch reviews:", err);
                setError("후기를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const handleLike = async (reviewId: string) => {
        try {
            await likeReview(reviewId);
            // Update local state
            setReviews(reviews.map(r =>
                r.id === reviewId ? { ...r, likes: r.likes + 1 } : r
            ));
        } catch (err) {
            console.error("Failed to like review:", err);
        }
    };

    return (
        <div className="container py-12 px-4 md:px-6 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                        생생 이용 후기
                    </h1>
                    <p className="text-gray-600">
                        빨간바지 솔로 골프를 통해 다녀오신 분들의 솔직한 이야기를 들어보세요.
                    </p>
                </div>
                <Link href="/reviews/write">
                    <Button className="bg-gray-900 hover:bg-gray-800">
                        후기 작성하기
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <p className="text-gray-500">후기를 불러오는 중...</p>
                </div>
            ) : error ? (
                <div className="text-center py-20">
                    <p className="text-red-600">{error}</p>
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500">아직 등록된 후기가 없습니다.</p>
                    <p className="text-gray-400 text-sm mt-2">첫 번째 후기를 작성해보세요!</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-2xl border hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">{review.userName}</span>
                                            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border">{review.userLevel}</span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {review.courseName} • {format(new Date(review.createdAt), 'yyyy.MM.dd')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-gray-200"}`} />
                                    ))}
                                </div>
                            </div>

                            <p className="text-gray-700 leading-relaxed mb-4">
                                {review.content}
                            </p>

                            <div className="flex items-center text-sm text-gray-500">
                                <button
                                    onClick={() => handleLike(review.id)}
                                    className="flex items-center gap-1 hover:text-red-600 transition-colors"
                                >
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>도움이 돼요 {review.likes}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
