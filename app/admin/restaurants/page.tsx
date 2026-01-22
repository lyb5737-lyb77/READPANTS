'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function RestaurantsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">식당 관리</h2>
                    <p className="text-muted-foreground">
                        등록된 식당 목록을 조회하고 관리합니다.
                    </p>
                </div>
                <Button className="gap-2 bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4" />
                    식당 등록
                </Button>
            </div>

            <div className="text-center py-20 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">준비 중인 기능입니다.</p>
            </div>
        </div>
    );
}
