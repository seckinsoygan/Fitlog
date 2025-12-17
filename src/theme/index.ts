// FitLog - Theme Exports
export { colors, darkColors, lightColors, type ThemeColors, type ColorKey } from './colors';
export { typography } from './typography';
export { spacing, layout } from './spacing';
export { ThemeProvider, useTheme } from './ThemeContext';

import { colors as defaultColors } from './colors';
import { typography } from './typography';
import { spacing, layout } from './spacing';

// Combined theme object (for default usage)
export const theme = {
    colors: defaultColors,
    typography,
    spacing,
    layout,
} as const;
