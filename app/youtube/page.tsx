"use client";

import { useEffect, useState } from "react";
import {
    getYoutubeChannels,
    seedInitialYoutubeData,
    YouTubeChannel
} from "@/lib/db/youtube";
import { Button } from "@/components/ui/button";
import { Youtube, Trophy, ThumbsUp, ArrowRight, PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function YoutubePage() {
    const [rankingChannels, setRankingChannels] = useState<YouTubeChannel[]>([]);
    const [recommendChannels, setRecommendChannels] = useState<YouTubeChannel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initData = async () => {
            setLoading(true);
            try {
                // Seed data if empty (Client side check for demo/mvp convenience)
                // In production, this should be a script or admin action.
                await seedInitialYoutubeData();

                const [rankings, recommends] = await Promise.all([
                    getYoutubeChannels('ranking'),
                    getYoutubeChannels('recommend')
                ]);
                setRankingChannels(rankings);
                setRecommendChannels(recommends);
            } catch (error) {
                console.error("Failed to load youtube channels:", error);
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* 1. Hero Section: Red Pants TV */}
            <section className="relative w-full h-[400px] md:h-[500px] bg-black overflow-hidden flex items-center justify-center text-center px-4">
                {/* Background Overlay (Replace with Red Pants Video/Image later) */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 to-black/90 z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30" />

                <div className="relative z-20 max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Comming Soon
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase">
                        <span className="text-red-600">REDPANTS</span> TV <br />
                        <span className="text-2xl md:text-4xl font-light opacity-90 block mt-2">OFFICIAL CHANNEL</span>
                    </h1>

                    <p className="text-gray-300 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                        필드 위 잊지 못할 순간들, 생생한 골프 투어 영상.<br />
                        빨간바지 공식 유튜브 채널이 곧 오픈됩니다.
                    </p>

                    <Button className="h-12 px-8 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-xl shadow-red-900/20 transition-all hover:scale-105">
                        <Youtube className="w-5 h-5 mr-2" />
                        채널 미리보기
                    </Button>
                </div>
            </section>

            <div className="container max-w-7xl px-4 py-8 md:py-12 space-y-12">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Top 10 Rankings (Vertical List) */}
                    <section className="lg:col-span-7">
                        <div className="flex items-center gap-3 mb-6">
                            <Trophy className="w-8 h-8 text-yellow-500" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">TOP 10 랭킹</h2>
                                <p className="text-sm text-gray-500">대한민국 골프 유튜브 인기 순위</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {loading ? (
                                <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" /></div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {rankingChannels.map((channel) => (
                                        <Link
                                            href={channel.url}
                                            target="_blank"
                                            key={channel.id}
                                            className="flex items-center gap-4 p-4 hover:bg-red-50/50 transition-colors group"
                                        >
                                            {/* Rank */}
                                            <div className={`
                                                flex-shrink-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg font-black text-lg md:text-xl
                                                ${channel.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                                                    channel.rank === 2 ? 'bg-gray-100 text-gray-600' :
                                                        channel.rank === 3 ? 'bg-orange-100 text-orange-600' : 'bg-white text-gray-400'}
                                            `}>
                                                {channel.rank}
                                            </div>

                                            {/* Profile Image (Small) */}
                                            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                                                {channel.thumbnailUrl ? (
                                                    <img src={channel.thumbnailUrl} alt={channel.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                        <Youtube className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate group-hover:text-red-700 transition-colors text-base md:text-lg">
                                                    {channel.title}
                                                </h3>
                                                <div className="flex items-center text-sm text-gray-500 gap-2 truncate">
                                                    <span className="font-medium">{channel.channelName}</span>
                                                    <span className="text-gray-300">|</span>
                                                    <span>구독자 {channel.subscriberCount || '-'}</span>
                                                </div>
                                                {channel.description && (
                                                    <p className="text-xs text-gray-400 truncate mt-1">{channel.description}</p>
                                                )}
                                            </div>

                                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-red-500 transform group-hover:translate-x-1 transition-all" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Right Column: Recommended Data (Vertical Compact List or Grid) */}
                    <section className="lg:col-span-5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-1.5 bg-red-100 rounded-lg">
                                <ThumbsUp className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">추천 채널</h2>
                                <p className="text-sm text-gray-500">에디터가 엄선한 꿀팁 채널</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {recommendChannels.length > 0 ? (
                                recommendChannels.map((channel) => (
                                    <Link
                                        href={channel.url}
                                        target="_blank"
                                        key={channel.id}
                                        className="block p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-red-100 transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border">
                                                {channel.thumbnailUrl ? (
                                                    <img src={channel.thumbnailUrl} alt={channel.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Youtube className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-red-700">{channel.title}</h3>
                                                <p className="text-xs text-gray-500 mb-1">{channel.channelName}</p>
                                                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                                    {channel.description || "추천 채널입니다."}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed text-gray-500 text-sm">
                                    추천 채널이 없습니다.
                                </div>
                            )}
                        </div>
                    </section>
                </div>

            </div>
        </div>
    );
}
