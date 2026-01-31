"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRegionStore } from "@/lib/store/region-store";
import { MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import Image from "next/image";

const REGIONS = [
    { country: "Thailand", region: "Pattaya", label: "태국 파타야", flagUrl: "https://flagcdn.com/w40/th.png" },
    { country: "Vietnam", region: "Haiphong", label: "베트남 하이퐁", flagUrl: "https://flagcdn.com/w40/vn.png" },
];

export function RegionSelector() {
    const { selectedRegion, setSelectedRegion } = useRegionStore();
    const [open, setOpen] = useState(false);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Sync store with URL params
    useEffect(() => {
        const country = searchParams.get("country");
        const region = searchParams.get("region");

        if (country && region) {
            setSelectedRegion({ country, region });
        } else {
            // Default to Thailand Pattaya if no params (e.g. root visit)
            setSelectedRegion({ country: "Thailand", region: "Pattaya" });
        }
    }, [searchParams, setSelectedRegion]);

    const currentRegion = REGIONS.find(
        (r) => r.country === selectedRegion.country && r.region === selectedRegion.region
    ) || REGIONS[0];

    const handleSelectRegion = (country: string, region: string) => {
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
                            src={currentRegion.flagUrl}
                            alt={currentRegion.country}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="text-sm font-medium">{currentRegion.label}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>지역 선택</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                    {REGIONS.map((region) => (
                        <Button
                            key={`${region.country}-${region.region}`}
                            variant={
                                selectedRegion.country === region.country &&
                                    selectedRegion.region === region.region
                                    ? "default"
                                    : "outline"
                            }
                            className="w-full justify-start text-left h-auto py-3"
                            onClick={() => handleSelectRegion(region.country, region.region)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative w-8 h-5 overflow-hidden rounded-sm shadow-sm shrink-0">
                                    <Image
                                        src={region.flagUrl}
                                        alt={region.country}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <div className="font-semibold">{region.label}</div>
                                    <div className="text-xs opacity-70">
                                        {region.country} · {region.region}
                                    </div>
                                </div>
                            </div>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
