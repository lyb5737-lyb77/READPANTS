"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Save } from "lucide-react";

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        siteName: "빨간바지 솔로 골프",
        adminEmail: "",
        maxJoinMembers: "4",
    });

    const handleSave = () => {
        alert("설정이 저장되었습니다.");
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <SettingsIcon className="h-8 w-8" />
                    시스템 설정
                </h1>
                <p className="text-gray-600 mt-2">사이트 기본 설정을 관리합니다.</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
                <div className="space-y-6">
                    <div>
                        <Label htmlFor="siteName">사이트 이름</Label>
                        <Input
                            id="siteName"
                            value={settings.siteName}
                            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <Label htmlFor="adminEmail">관리자 이메일</Label>
                        <Input
                            id="adminEmail"
                            type="email"
                            value={settings.adminEmail}
                            onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                            className="mt-2"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div>
                        <Label htmlFor="maxMembers">조인 최대 인원</Label>
                        <Input
                            id="maxMembers"
                            type="number"
                            value={settings.maxJoinMembers}
                            onChange={(e) => setSettings({ ...settings, maxJoinMembers: e.target.value })}
                            className="mt-2"
                        />
                    </div>

                    <Button onClick={handleSave} className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        설정 저장
                    </Button>
                </div>
            </div>
        </div>
    );
}
