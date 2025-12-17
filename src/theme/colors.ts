// FitLog - Cyberpunk Sport Color Palette

// Light theme colors
export const lightColors = {
    // Backgrounds
    background: '#F4F4F5',        // Zinc-100 - Ana arka plan
    surface: '#FFFFFF',           // White - Kartlar ve yüzeyler
    surfaceLight: '#FAFAFA',      // Zinc-50 - Hover states

    // Primary - Neon Volt (Aksiyon butonları ve aktif setler)
    primary: '#84CC16',           // Lime-500 (daha koyu yeşil açık tema için)
    primaryDark: '#65A30D',
    primaryMuted: 'rgba(132, 204, 22, 0.15)',

    // Secondary
    secondary: '#E4E4E7',         // Zinc-200 - İkincil butonlar
    secondaryLight: '#D4D4D8',    // Zinc-300

    // Status Colors
    success: '#22C55E',           // Green-500
    error: '#EF4444',             // Red-500
    warning: '#F59E0B',           // Amber-500
    info: '#3B82F6',              // Blue-500

    // Text
    textPrimary: '#18181B',       // Zinc-900
    textSecondary: '#52525B',     // Zinc-600
    textMuted: '#A1A1AA',         // Zinc-400
    textOnPrimary: '#FFFFFF',     // White text on primary

    // Borders
    border: '#E4E4E7',            // Zinc-200
    borderLight: '#D4D4D8',       // Zinc-300

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.4)',

    // Gradients
    gradientPrimary: ['#84CC16', '#65A30D'],
    gradientDark: ['#FAFAFA', '#F4F4F5'],
} as const;

// Dark theme colors (Cyberpunk Sport)
export const darkColors = {
    // Backgrounds
    background: '#09090B',        // Rich Black - Ana arka plan
    surface: '#18181B',           // Zinc-900 - Kartlar ve yüzeyler
    surfaceLight: '#27272A',      // Zinc-800 - Hover states

    // Primary - Neon Volt (Aksiyon butonları ve aktif setler)
    primary: '#D4FF00',
    primaryDark: '#B8E600',
    primaryMuted: 'rgba(212, 255, 0, 0.2)',

    // Secondary
    secondary: '#3F3F46',         // Zinc-700 - İkincil butonlar
    secondaryLight: '#52525B',    // Zinc-600

    // Status Colors
    success: '#22C55E',           // Green-500
    error: '#EF4444',             // Red-500
    warning: '#F59E0B',           // Amber-500
    info: '#3B82F6',              // Blue-500

    // Text
    textPrimary: '#FAFAFA',       // White
    textSecondary: '#A1A1AA',     // Gray-400
    textMuted: '#71717A',         // Zinc-500
    textOnPrimary: '#09090B',     // Dark text on primary color

    // Borders
    border: '#27272A',            // Zinc-800
    borderLight: '#3F3F46',       // Zinc-700

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.6)',

    // Gradients
    gradientPrimary: ['#D4FF00', '#9EFF00'],
    gradientDark: ['#18181B', '#09090B'],
} as const;

export type ThemeColors = typeof darkColors;
export type ColorKey = keyof ThemeColors;

// Default to dark theme
export const colors = darkColors;
