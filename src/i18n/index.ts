// FitLog - Internationalization (i18n)
import { tr } from './tr';
import { en } from './en';
import { useLanguageStore, Language } from '../store/languageStore';

// Translation type based on Turkish (source of truth)
export type Translations = typeof tr;

// All available translations
const translations: Record<Language, Translations> = {
    tr,
    en,
};

// Hook to get current translations
export const useTranslation = () => {
    const language = useLanguageStore((state) => state.language);
    const setLanguage = useLanguageStore((state) => state.setLanguage);

    const t = translations[language];

    return {
        t,
        language,
        setLanguage,
        // Helper function for nested translations
        translate: (key: string): string => {
            const keys = key.split('.');
            let result: any = t;
            for (const k of keys) {
                result = result?.[k];
            }
            return result || key;
        },
    };
};

// Available languages with labels
export const availableLanguages: { code: Language; label: string; nativeLabel: string }[] = [
    { code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe' },
    { code: 'en', label: 'English', nativeLabel: 'English' },
];

// Export types
export type { Language };
export { tr, en };
