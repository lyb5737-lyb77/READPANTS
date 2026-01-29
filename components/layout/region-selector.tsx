"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
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

const REGIONS = [
    { country: "Thailand", region: "Pattaya", label: "태국 파타야" },
    { country: "Vietnam", region: "Haiphong", label: "베트남 하이퐁" },
];

export function RegionSelector() {
    const { selectedRegion, setSelectedRegion } = useRegionStore();
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const currentRegionLabel =
        REGIONS.find(
            (r) => r.country === selectedRegion.country && r.region === selectedRegion.region
        )?.label || "태국 파타야";

    const handleSelectRegion = (country: string, region: string) => {
        setSelectedRegion({ country, region });
        setOpen(false);
        // Reload current page with new region parameters
        window.location.href = `${pathname}?country=${country}&region=${region}`;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1.5 px-3 gap-1.5 hover:bg-gray-100"
                >
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">{currentRegionLabel}</span>
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
                                <MapPin className="h-5 w-5" />
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
