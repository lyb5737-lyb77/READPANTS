"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Search,
    PenLine,
    SlidersHorizontal,
    Loader2
} from "lucide-react";
import { getReviews, Review, REVIEW_CATEGORIES, ReviewCategory } from "@/lib/db/reviews";
import { ReviewCard } from "@/components/reviews/review-card";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/store/auth-store";

function ReviewsPageContent() {
    const searchParams = useSearchParams();
    const country = searchParams.get('country') || 'Thailand';
    const region = searchParams.get('region') || 'Pattaya';
    const { user } = useAuthStore();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState<ReviewCategory | 'all'>('all');
    const [sortOption, setSortOption] = useState<'latest' | 'rating' | 'likes'>('latest');
    const [searchQuery, setSearchQuery] = useState("");

    const pageTitle = `${region === 'Pattaya' ? '파타야' : region === 'Haiphong' ? '하이퐁' : region} 탐방 후기`;

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                // Fetch all reviews for this region first, then filter/sort client-side 
                // for snappier UI interaction as requested ("sensible and sophisticated")
                const data = await getReviews({ country, region });
                setReviews(data);
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
        // Reset filters when region changes
        setSelectedCategory('all');
        setSearchQuery("");
    }, [country, region]);

    // Computed reviews based on filters
    const filteredReviews = useMemo(() => {
        let result = [...reviews];

        // 1. Category Filter
        if (selectedCategory !== 'all') {
            result = result.filter(r => r.category === selectedCategory);
        }

        // 2. Search Filter (Business Name)
        if (searchQuery.trim()) {
            const term = searchQuery.toLowerCase();
            result = result.filter(r => r.businessName.toLowerCase().includes(term));
        }

        // 3. Sorting
        result.sort((a, b) => {
            if (sortOption === 'rating') {
                return b.rating - a.rating; // Descending
            } else if (sortOption === 'likes') {
                return (b.likeCount || 0) - (a.likeCount || 0); // Descending
            } else {
                // Latest
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

        return result;
    }, [reviews, selectedCategory, searchQuery, sortOption]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Section */}
            <div className="bg-white border-b sticky top-20 z-40 shadow-sm">
                <div className="container py-6 px-4 md:px-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                                {pageTitle}
                            </h1>
                            <p className="text-gray-500 mt-1 text-sm">
                                생생한 현지 정보를 공유하고 검증된 곳만 골라가세요!
                            </p>
                        </div>

                        <Link href={`/reviews/write?country=${country}&region=${region}`}>
                            <Button className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all">
                                <PenLine className="w-4 h-4 mr-2" />
                                후기 작성하기
                            </Button>
                        </Link>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Categories (Horizontal Scroll on mobile) */}
                        <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 no-scrollbar flex-1">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === 'all'
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                전체
                            </button>
                            {REVIEW_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.value
                                        ? 'bg-gray-900 text-white shadow-md'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Search & Sort */}
                        <div className="flex items-center gap-2 md:w-auto w-full">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="업체명 검색..."
                                    className="pl-9 h-10 rounded-full bg-gray-100 border-transparent focus:bg-white transition-colors"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={sortOption} onValueChange={(v: any) => setSortOption(v)}>
                                <SelectTrigger className="w-[110px] h-10 rounded-full border-gray-200">
                                    <SelectValue placeholder="정렬" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="latest">최신순</SelectItem>
                                    <SelectItem value="rating">별점순</SelectItem>
                                    <SelectItem value="likes">좋아요순</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Grid */}
            <div className="container px-4 md:px-6 py-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin h-12 w-12 text-red-600" />
                    </div>
                ) : filteredReviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredReviews.map((review) => (
                                <motion.div
                                    key={review.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ReviewCard review={review} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 mx-auto max-w-2xl">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <SlidersHorizontal className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">아직 등록된 리뷰가 없습니다</h3>
                        <p className="text-gray-500 mb-6">첫 번째 리뷰를 작성하고 다른 골퍼들에게 도움을 주세요!</p>
                        <Link href={`/reviews/write?country=${country}&region=${region}`}>
                            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                                첫 리뷰 작성하기
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ReviewsPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-red-600" /></div>}>
            <ReviewsPageContent />
        </Suspense>
    );
}
