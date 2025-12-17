// FitLog - Theme Store with Persistence
import { create } from 'zustand';
import { darkColors, lightColors } from '../theme/colors';

export type ThemeMode = 'light' | 'dark';

// Use a union type for compatibility
type ThemeColors = typeof darkColors | typeof lightColors;

interface ThemeState {
    mode: ThemeMode;
    colors: ThemeColors;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    mode: 'dark',
    colors: darkColors as ThemeColors,

    toggleTheme: () => {
        const currentMode = get().mode;
        const newMode = currentMode === 'dark' ? 'light' : 'dark';
        const newColors = newMode === 'dark' ? darkColors : lightColors;

        set({
            mode: newMode,
            colors: newColors as ThemeColors,
        });
    },

    setTheme: (mode) => {
        const newColors = mode === 'dark' ? darkColors : lightColors;
        set({
            mode,
            colors: newColors as ThemeColors,
        });
    },
}));

// Selector hooks for optimized re-renders
export const useColors = () => useThemeStore((state) => state.colors);
export const useThemeMode = () => useThemeStore((state) => state.mode);
export const useToggleTheme = () => useThemeStore((state) => state.toggleTheme);
