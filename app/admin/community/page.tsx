
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

    const handleRankChange = (index: number, field: keyof RankLevel, value: string | number) => {
        const newLevels = [...settings.rankLevels];
        newLevels[index] = { ...newLevels[index], [field]: value };
        setSettings({ ...settings, rankLevels: newLevels });
    };

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
            alert("설정이 저장되었습니다.");
        } catch (error) {
            console.error(error);
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">로딩 중...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">커뮤니티 설정</h2>
                <p className="text-muted-foreground">커뮤니티 등급 및 포인트 규칙을 관리합니다.</p>
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
                            <Input
                                type="number"
                                value={settings.pointRules.post}
                                onChange={(e) => handlePointChange('post', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>댓글 작성 포인트</Label>
                            <Input
                                type="number"
                                value={settings.pointRules.comment}
                                onChange={(e) => handlePointChange('comment', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>등급 레벨 설정</CardTitle>
                        <CardDescription>
                            총 {settings.rankLevels.length}단계의 등급과 각 등급 달성에 필요한 점수를 설정합니다.
                            1단계(새싹)는 0점으로 고정하는 것을 권장합니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {settings.rankLevels.map((rank, index) => (
                                <div key={index} className="flex gap-4 items-center">
                                    <div className="w-16 font-bold text-center">Lv.{rank.level}</div>
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-xs text-muted-foreground">등급명</Label>
                                        <Input
                                            value={rank.name}
                                            onChange={(e) => handleRankChange(index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-xs text-muted-foreground">필요 점수 (Threshold)</Label>
                                        <Input
                                            type="number"
                                            value={rank.threshold}
                                            onChange={(e) => handleRankChange(index, 'threshold', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving} size="lg">
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        설정 저장
                    </Button>
                </div>
            </div>
        </div>
    );
}
