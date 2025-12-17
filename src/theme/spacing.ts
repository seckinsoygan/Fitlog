// FitLog - 8pt Grid Spacing System
export const spacing = {
    // Base unit = 4px, grid = 8px
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
} as const;

// Common layout spacing
export const layout = {
    // Screen margins
    screenPaddingHorizontal: spacing[4], // 16px
    screenPaddingVertical: spacing[4],    // 16px

    // Card padding
    cardPadding: spacing[4],             // 16px
    cardPaddingSmall: spacing[3],        // 12px

    // Button padding
    buttonPaddingVertical: spacing[3],   // 12px
    buttonPaddingHorizontal: spacing[4], // 16px

    // Gap between items
    gapSmall: spacing[2],                // 8px
    gapMedium: spacing[3],               // 12px
    gapLarge: spacing[4],                // 16px

    // Section spacing
    sectionGap: spacing[6],              // 24px

    // Border radius
    radiusSmall: 6,
    radiusMedium: 8,
    radiusLarge: 12,
    radiusXLarge: 16,
    radiusFull: 9999,
} as const;

export type SpacingKey = keyof typeof spacing;
