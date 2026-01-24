import { create } from 'zustand';

interface UIState {
    showSplash: boolean;
    setShowSplash: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    showSplash: true,
    setShowSplash: (show) => set({ showSplash: show }),
}));
