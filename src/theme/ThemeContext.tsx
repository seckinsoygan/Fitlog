// FitLog - Theme Context for Dynamic Theme Switching
import React, { createContext, useContext, ReactNode } from 'react';
import { useThemeStore } from '../store/themeStore';

// Create a context that will force re-renders when theme changes
const ThemeContext = createContext<ReturnType<typeof useThemeStore> | null>(null);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const themeStore = useThemeStore();

    return (
        <ThemeContext.Provider value={themeStore}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook to use theme in components
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        // Fallback to direct store access if not in provider
        return useThemeStore();
    }
    return context;
};
