import { create } from 'zustand';


export interface Region {
    country: string;
    region: string;
}

interface RegionStore {
    selectedRegion: Region;
    setSelectedRegion: (region: Region) => void;
}

export const useRegionStore = create<RegionStore>((set) => ({
    selectedRegion: { country: 'Vietnam', region: 'Haiphong' },
    setSelectedRegion: (region) => set({ selectedRegion: region }),
}));
