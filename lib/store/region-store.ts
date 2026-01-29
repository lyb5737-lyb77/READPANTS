import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Region {
    country: string;
    region: string;
}

interface RegionStore {
    selectedRegion: Region;
    setSelectedRegion: (region: Region) => void;
}

export const useRegionStore = create<RegionStore>()(
    persist(
        (set) => ({
            selectedRegion: { country: 'Thailand', region: 'Pattaya' },
            setSelectedRegion: (region) => set({ selectedRegion: region }),
        }),
        {
            name: 'region-storage',
        }
    )
);
