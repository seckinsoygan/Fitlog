// FitLog - Use Colors Hook
import { useThemeStore } from '../store';

/**
 * Hook to get current theme colors
 * Use this instead of importing colors directly for dynamic theme support
 */
export const useColors = () => {
    const { colors } = useThemeStore();
    return colors;
};
