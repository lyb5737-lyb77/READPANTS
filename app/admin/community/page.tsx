
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    getRankingSettings,
    updateRankingSettings,
    RankingSettings,
    RankLevel,
    DEFAULT_RANK_LEVELS,
    DEFAULT_POINT_RULES
} from "@/lib/ranking";
import { Loader2 } from "lucide-react";
import { LevelBadge } from "@/components/ui/level-badge";
import { toast } from "sonner";

export default function AdminCommunityPage() {
    const [settings, setSettings] = useState<RankingSettings>({
        rankLevels: DEFAULT_RANK_LEVELS,
        pointRules: DEFAULT_POINT_RULES
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            const data = await getRankingSettings();
            setSettings(data);
            setLoading(false);
        };
        loadSettings();
    }, []);

    const handlePointChange = (field: 'post' | 'comment', value: string) => {
        const numValue = parseInt(value) || 0;
        setSettings({
            ...settings,
            pointRules: { ...settings.pointRules, [field]: numValue }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateRankingSettings(settings);
            toast.success("설정이 저장되었습니다.");
        } catch (error) {
            console.error(error);
            toast.error("저장 중 오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">커뮤니티 설정</h2>
                <p className="text-muted-foreground">활동 포인트 규칙을 설정하고 등급 정보를 확인합니다.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>활동 포인트 설정</CardTitle>
                        <CardDescription>각 활동별로 부여되는 점수를 설정합니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>게시글 작성 포인트</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={settings.pointRules.post}
                                    onChange={(e) => handlePointChange('post', e.target.value)}
                                    className="max-w-[150px]"
                                />
                                <span className="text-sm text-gray-500">점</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>댓글 작성 포인트</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={settings.pointRules.comment}
                                    onChange={(e) => handlePointChange('comment', e.target.value)}
                                    className="max-w-[150px]"
                                />
                                <span className="text-sm text-gray-500">점</span>
                            </div>
                        </div>
                        <div className="col-span-2 flex justify-end">
                            <Button onClick={handleSave} disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                포인트 설정 저장
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>등급 레벨 안내</CardTitle>
                        <CardDescription>
                            현재 적용 중인 등급 체계입니다. (등급 기준 변경은 개발팀에 문의해주세요)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium">레벨</th>
                                        <th className="px-4 py-2 text-left font-medium">등급명</th>
                                        <th className="px-4 py-2 text-left font-medium">필요 포인트</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {settings.rankLevels.map((rank) => (
                                        <tr key={rank.level} className="border-t">
                                            <td className="px-4 py-2 font-medium">Lv.{rank.level}</td>
                                            <td className="px-4 py-2">
                                                <LevelBadge type="community" level={rank.level} />
                                            </td>
                                            <td className="px-4 py-2">{rank.threshold.toLocaleString()} P</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
