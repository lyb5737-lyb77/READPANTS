"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Star, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { createReview } from "@/lib/db/reviews";
import { getCourses } from "@/lib/db/courses";
import { Course } from "@/lib/courses-data";

export default function WriteReviewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const country = searchParams.get('country') || 'Thailand';
    const region = searchParams.get('region') || 'Pattaya';

    const { user, userProfile } = useAuthStore();
    const [rating, setRating] = useState(5);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [courseId, setCourseId] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        if (!user) {
            router.push("/login");
            return;
        }

        // Fetch courses and filter by region
        const fetchCourses = async () => {
            try {
                const fetchedCourses = await getCourses();
                // Filter courses by selected region
                const filteredCourses = fetchedCourses.filter(
                    (course) => course.country === country && course.region === region
                );
                setCourses(filteredCourses);
            } catch (err) {
                console.error("Failed to fetch courses:", err);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, [user, router, country, region]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!user || !userProfile) {
            setError("로그인이 필요합니다.");
            setLoading(false);
            return;
        }

        if (!courseId) {
            setError("골프장을 선택해주세요.");
            setLoading(false);
            return;
        }

        try {
            const selectedCourse = courses.find(c => c.id === courseId);
            if (!selectedCourse) {
                throw new Error("Invalid course selected");
            }

            await createReview({
                userId: user.uid,
                userName: userProfile.nickname,
                userLevel: userProfile.level,
                courseId,
                courseName: selectedCourse.name,
                rating,
                content,
                likes: 0,
                createdAt: new Date().toISOString()
            });

            alert("후기가 등록되었습니다!");
            router.push("/reviews");
        } catch (err) {
            console.error("Failed to create review:", err);
            setError("후기 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return null; // Redirecting...
    }

    return (
        <div className="container py-12 px-4 md:px-6 max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-2xl border shadow-lg">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">후기 작성하기</h1>
                <p className="text-gray-600 mb-8">
                    빨간바지 솔로 골프를 이용하신 경험을 공유해주세요.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Course Selection */}
                    <div className="space-y-2">
                        <label htmlFor="course" className="text-sm font-medium text-gray-700">
                            이용하신 골프장 *
                        </label>
                        {loadingCourses ? (
                            <div className="w-full px-3 py-2 border rounded-md text-gray-500">
                                골프장 목록 불러오는 중...
                            </div>
                        ) : (
                            <select
                                id="course"
                                required
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                            >
                                <option value="">골프장을 선택해주세요</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Rating */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            별점 *
                        </label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-8 w-8 ${star <= (hoveredRating || rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                            }`}
                                    />
                                </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-600">
                                {rating === 5 ? "★ 최고예요!" : rating === 4 ? "좋아요" : rating === 3 ? "보통이에요" : rating === 2 ? "별로예요" : "최악이에요"}
                            </span>
                        </div>
                    </div>

                    {/* Review Content */}
                    <div className="space-y-2">
                        <label htmlFor="content" className="text-sm font-medium text-gray-700">
                            이용 후기 *
                        </label>
                        <textarea
                            id="content"
                            required
                            rows={8}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                            placeholder="골프장 시설, 서비스, 조인 경험 등 자유롭게 작성해주세요."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            minLength={10}
                        />
                        <p className="text-xs text-gray-500">최소 10자 이상 입력해주세요.</p>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
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
                            disabled={loading || loadingCourses}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "등록하기"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
