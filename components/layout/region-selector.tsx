"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRegionStore } from "@/lib/store/region-store";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

import Image from "next/image";

interface RegionData {
    id: string;
    country: string;
    region: string;
    label: string;
    isActive: boolean;
    flagUrl: string;
}

// 국기 URL 매핑
const FLAG_URLS: Record<string, string> = {
    "Thailand": "https://flagcdn.com/w40/th.png",
    "Vietnam": "https://flagcdn.com/w40/vn.png",
};

// 기본 지역 (Firebase 로드 실패 시 fallback)
const DEFAULT_REGIONS: RegionData[] = [
    { id: "thailand-pattaya", country: "Thailand", region: "Pattaya", label: "태국 파타야", flagUrl: "https://flagcdn.com/w40/th.png", isActive: true },
    { id: "vietnam-haiphong", country: "Vietnam", region: "Haiphong", label: "베트남 하이퐁", flagUrl: "https://flagcdn.com/w40/vn.png", isActive: true },
];

export function RegionSelector() {
    const { selectedRegion, setSelectedRegion } = useRegionStore();
    const [open, setOpen] = useState(false);
    const [regions, setRegions] = useState<RegionData[]>(DEFAULT_REGIONS);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Firebase에서 지역 목록 가져오기
    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "regions"));
                if (!querySnapshot.empty) {
                    const fetchedRegions: RegionData[] = [];
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        fetchedRegions.push({
                            id: doc.id,
                            country: data.country,
                            region: data.region,
                            label: data.label,
                            isActive: data.isActive !== false,
                            flagUrl: FLAG_URLS[data.country] || "https://flagcdn.com/w40/un.png",
                        });
                    });

                    // Sort regions: Vietnam Haiphong -> Thailand Pattaya -> Vietnam Danang
                    const sortOrder = [
                        "Vietnam-Haiphong",
                        "Thailand-Pattaya",
                        "Vietnam-Danang"
                    ];

                    fetchedRegions.sort((a, b) => {
                        const keyA = `${a.country}-${a.region}`;
                        const keyB = `${b.country}-${b.region}`;
                        const indexA = sortOrder.indexOf(keyA);
                        const indexB = sortOrder.indexOf(keyB);

                        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                        if (indexA !== -1) return -1;
                        if (indexB !== -1) return 1;
                        return 0; // Keep original order for others
                    });

                    setRegions(fetchedRegions);
                }
            } catch (error) {
                console.error("Failed to fetch regions:", error);
                // 실패 시 기본 지역 사용
            } finally {
                setLoading(false);
            }
        };
        fetchRegions();
    }, []);

    // Sync store with URL params
    useEffect(() => {
        const country = searchParams.get("country");
        const region = searchParams.get("region");

        if (country && region) {
            setSelectedRegion({ country, region });
        } else {
            // Default to Vietnam Haiphong if no params (e.g. root visit)
            setSelectedRegion({ country: "Vietnam", region: "Haiphong" });
        }
    }, [searchParams, setSelectedRegion]);

    const currentRegion = regions.find(
        (r) => r.country === selectedRegion.country && r.region === selectedRegion.region
    ) || regions.find(r => r.isActive) || regions[0];

    const handleSelectRegion = (country: string, region: string, isActive: boolean) => {
        // 비활성 지역은 선택 불가
        if (!isActive) return;

        setSelectedRegion({ country, region });
        setOpen(false);

        // Update URL params smoothly
        const params = new URLSearchParams(searchParams.toString());
        params.set('country', country);
        params.set('region', region);

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1.5 px-3 gap-1.5 hover:bg-gray-100"
                >
                    <div className="relative w-6 h-4 overflow-hidden rounded-sm shadow-sm">
                        <Image
                            src={currentRegion?.flagUrl || "https://flagcdn.com/w40/un.png"}
                            alt={currentRegion?.country || "Region"}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="text-sm font-medium">{currentRegion?.label || "지역 선택"}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>지역 선택</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                    {loading ? (
                        <div className="text-center py-4 text-gray-500">로딩 중...</div>
                    ) : (
                        regions.map((region) => (
                            <Button
                                key={`${region.country}-${region.region}`}
                                variant={
                                    selectedRegion.country === region.country &&
                                        selectedRegion.region === region.region
                                        ? "default"
                                        : "outline"
                                }
                                className={`w-full justify-start text-left h-auto py-3 ${!region.isActive
                                    ? 'opacity-50 cursor-not-allowed bg-gray-100 hover:bg-gray-100'
                                    : ''
                                    }`}
                                onClick={() => handleSelectRegion(region.country, region.region, region.isActive)}
                                disabled={!region.isActive}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className="relative w-8 h-5 overflow-hidden rounded-sm shadow-sm shrink-0">
                                        <Image
                                            src={region.flagUrl}
                                            alt={region.country}
                                            fill
                                            className={`object-cover ${!region.isActive ? 'grayscale' : ''}`}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold ${!region.isActive ? 'text-gray-400' : ''}`}>
                                                {region.label}
                                            </span>
                                            {!region.isActive && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">
                                                    준비중
                                                </span>
                                            )}
                                        </div>
                                        <div className={`text-xs ${!region.isActive ? 'text-gray-400' : 'opacity-70'}`}>
                                            {region.country} · {region.region}
                                        </div>
                                    </div>
                                </div>
                            </Button>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

