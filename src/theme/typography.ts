// FitLog - Typography System
import { TextStyle } from 'react-native';

export const fontFamilies = {
    heading: 'System',
    body: 'System',
    mono: 'monospace',
} as const;

export const fontSizes = {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
} as const;

export const fontWeights = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
};

export const lineHeights = {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
} as const;

// Pre-defined text styles (without colors - colors applied dynamically)
export const typography = {
    // Headings
    h1: {
        fontSize: fontSizes['2xl'],
        fontWeight: '700',
        lineHeight: fontSizes['2xl'] * lineHeights.tight,
    } as TextStyle,

    h2: {
        fontSize: fontSizes.xl,
        fontWeight: '600',
        lineHeight: fontSizes.xl * lineHeights.tight,
    } as TextStyle,

    h3: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        lineHeight: fontSizes.lg * lineHeights.normal,
    } as TextStyle,

    // Body text
    body: {
        fontSize: fontSizes.base,
        fontWeight: '400',
        lineHeight: fontSizes.base * lineHeights.normal,
    } as TextStyle,

    bodySmall: {
        fontSize: fontSizes.md,
        fontWeight: '400',
        lineHeight: fontSizes.md * lineHeights.normal,
    } as TextStyle,

    // Labels
    label: {
        fontSize: fontSizes.xs,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    } as TextStyle,

    // Data/Numbers - Monospace for tabular alignment
    data: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        fontFamily: fontFamilies.mono,
    } as TextStyle,

    dataLarge: {
        fontSize: fontSizes['2xl'],
        fontWeight: '700',
        fontFamily: fontFamilies.mono,
    } as TextStyle,

    // Button text
    button: {
        fontSize: fontSizes.base,
        fontWeight: '600',
        letterSpacing: 0.3,
    } as TextStyle,

    buttonSmall: {
        fontSize: fontSizes.md,
        fontWeight: '500',
    } as TextStyle,

    // Caption
    caption: {
        fontSize: fontSizes.sm,
        fontWeight: '400',
        lineHeight: fontSizes.sm * lineHeights.normal,
    } as TextStyle,
} as const;
