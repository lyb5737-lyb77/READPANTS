"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getYoutubeChannels, deleteYoutubeChannel, YouTubeChannel } from "@/lib/db/youtube";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

export default function AdminYoutubePage() {
    const [rankings, setRankings] = useState<YouTubeChannel[]>([]);
    const [recommends, setRecommends] = useState<YouTubeChannel[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [rData, recData] = await Promise.all([
                getYoutubeChannels('ranking'),
                getYoutubeChannels('recommend')
            ]);
            setRankings(rData);
            setRecommends(recData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        try {
            await deleteYoutubeChannel(id);
            loadData();
            toast.success("삭제되었습니다.");
        } catch (e) {
            console.error(e);
            toast.error("삭제 실패");
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">유튜브 채널 관리</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={async () => {
                        if (confirm("정말 초기화하시겠습니까? 기존 데이터가 모두 삭제되고 초기 데이터로 복구됩니다.")) {
                            try {
                                setLoading(true);
                                const { resetYoutubeData } = await import("@/lib/db/youtube");
                                await resetYoutubeData();
                                await resetYoutubeData();
                                await loadData();
                                toast.success("초기화되었습니다.");
                            } catch (e) {
                                console.error(e);
                                toast.error("초기화 실패");
                            } finally {
                                setLoading(false);
                            }
                        }
                    }}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        데이터 초기화
                    </Button>
                    <Link href="/admin/youtube/new">
                        <Button className="bg-red-600 hover:bg-red-700">
                            <Plus className="w-4 h-4 mr-2" />
                            채널 등록
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="space-y-12">
                {/* Rankings */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-2 h-8 bg-yellow-500 rounded-full" />
                        랭킹 채널 (TOP 10)
                    </h2>
                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3 w-20">순위</th>
                                    <th className="px-6 py-3">채널명</th>
                                    <th className="px-6 py-3">URL</th>
                                    <th className="px-6 py-3 text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rankings.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-bold">{item.rank}위</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {item.thumbnailUrl && <img src={item.thumbnailUrl} className="w-8 h-8 rounded-full bg-gray-100" />}
                                                <div>
                                                    <div className="font-bold">{item.title}</div>
                                                    <div className="text-xs text-gray-500">{item.channelName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]">
                                            <a href={item.url} target="_blank" className="hover:underline">{item.url}</a>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/youtube/${item.id}`}>
                                                    <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Recommendations */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-2 h-8 bg-blue-500 rounded-full" />
                        추천 채널
                    </h2>
                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">채널명</th>
                                    <th className="px-6 py-3">설명</th>
                                    <th className="px-6 py-3 text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recommends.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-bold">{item.title}</td>
                                        <td className="px-6 py-4 text-gray-500">{item.description}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/youtube/${item.id}`}>
                                                    <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {recommends.length === 0 && (
                                    <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">데이터가 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
