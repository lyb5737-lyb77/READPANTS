"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createYoutubeChannel, YouTubeType } from "@/lib/db/youtube";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

export default function AdminYoutubeNewPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [type, setType] = useState<YouTubeType>('recommend');
    const [title, setTitle] = useState("");
    const [channelName, setChannelName] = useState("");
    const [url, setUrl] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [rank, setRank] = useState("1");
    const [desc, setDesc] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createYoutubeChannel({
                type,
                title,
                channelName,
                url,
                thumbnailUrl,
                rank: type === 'ranking' ? Number(rank) : undefined,
                description: desc,
            });
            alert("등록되었습니다.");
            router.push("/admin/youtube");
        } catch (error) {
            console.error(error);
            alert("등록 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
                <Button variant="ghost" onClick={() => router.back()} className="-ml-2"><ArrowLeft className="w-4 h-4" /></Button>
                <h1 className="text-2xl font-bold">유튜브 채널 등록</h1>
            </div>

            <div className="bg-white p-8 rounded-xl border shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="space-y-2">
                        <label className="text-sm font-bold">유형</label>
                        <Select value={type} onValueChange={(v: YouTubeType) => setType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ranking">랭킹 (Top 10)</SelectItem>
                                <SelectItem value="recommend">추천 채널</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {type === 'ranking' && (
                        <div className="space-y-2">
                            <label className="text-sm font-bold">순위</label>
                            <Input type="number" value={rank} onChange={e => setRank(e.target.value)} min={1} max={100} required />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold">채널 제목 (Title)</label>
                        <Input placeholder="예: 김국진TV_거침없는 골프" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold">채널명 (Channel Name)</label>
                        <Input placeholder="예: 김국진TV" value={channelName} onChange={e => setChannelName(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold">채널 URL</label>
                        <Input placeholder="https://www.youtube.com/..." value={url} onChange={e => setUrl(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold">썸네일 URL (선택)</label>
                        <Input placeholder="이미지 주소" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold">설명</label>
                        <Textarea placeholder="채널에 대한 간단한 설명" value={desc} onChange={e => setDesc(e.target.value)} />
                    </div>

                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                        {loading ? "등록 중..." : "등록하기"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
