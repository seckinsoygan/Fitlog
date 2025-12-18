// FitLog - Language Store
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

export type Language = 'tr' | 'en';

interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
}

// Custom storage for web/native compatibility
const customStorage: StateStorage = {
    getItem: (name: string): string | null => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return localStorage.getItem(name);
            }
            return null;
        } catch { return null; }
    },
    setItem: (name: string, value: string): void => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem(name, value);
            }
        } catch { }
    },
    removeItem: (name: string): void => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.removeItem(name);
            }
        } catch { }
    },
};

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: 'tr', // Default to Turkish
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'fitlog-language',
            storage: createJSONStorage(() => customStorage),
        }
    )
);
